import type { App } from "@backend/app";
import { treaty } from "@elysiajs/eden";

let refreshPromise: Promise<boolean> | null = null;

const getPathname = (input: RequestInfo | URL) => {
  if (typeof input === "string") {
    return new URL(input, window.location.origin).pathname;
  }

  if (input instanceof URL) {
    return input.pathname;
  }

  if (input instanceof Request) {
    return new URL(input.url, window.location.origin).pathname;
  }

  return "";
};

const normalizeContentType = (response: Response) =>
  response.headers.get("content-type")?.startsWith("text/plain") &&
  response.headers.get("transfer-encoding") === "chunked"
    ? new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: (() => {
          const h = new Headers(response.headers);
          h.set("content-type", "application/json");
          return h;
        })(),
      })
    : response;

const fetchWithRefresh = async (
  input: RequestInfo | URL,
  init?: RequestInit,
) => {
  const response = await fetch(input, { ...init, credentials: "include" });
  const isCheckEndpoint = getPathname(input).endsWith("/auth/check");
  const isRefreshEndpoint = getPathname(input).endsWith("/auth/refresh");

  if (response.status !== 401) return normalizeContentType(response);

  if (isRefreshEndpoint || isCheckEndpoint) {
    return normalizeContentType(response);
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${window.location.origin}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  const refreshed = await refreshPromise;

  if (!refreshed) {
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
    return response; // for type consistency
  }

  return normalizeContentType(
    await fetch(input, { ...init, credentials: "include" }),
  );
};

export const api = treaty<App>(`${window.location.origin}/api`, {
  fetcher: fetchWithRefresh as typeof fetch,
});
