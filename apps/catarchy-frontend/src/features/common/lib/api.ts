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

const fetchWithRefresh = async (
  input: RequestInfo | URL,
  init?: RequestInit,
) => {
  let response: Response = await fetch(input, {
    ...init,
    credentials: "include",
  });

  // Extract request ID for logging/debugging purposes
  const requestId = response.headers.get("x-request-id");

  // If session is valid, return the response immediately
  if (response.status !== 401) return response;

  // Bypass token refresh for auth check and refresh endpoints to avoid infinite loop
  const isCheckEndpoint = getPathname(input).endsWith("/auth/check");
  const isRefreshEndpoint = getPathname(input).endsWith("/auth/refresh");

  if (isRefreshEndpoint || isCheckEndpoint) {
    return response;
  }

  // Refresh the token and retry the original request
  const refreshed = await refreshToken();

  // If token refresh failed, redirect to gate
  if (!refreshed) {
    return response; // for type consistency
  }

  return await fetch(input, { ...init, credentials: "include" });
};

export const api = treaty<App>(`${window.location.origin}/api`, {
  fetcher: fetchWithRefresh as typeof fetch,
  parseDate: false,
});

async function refreshToken(): Promise<boolean> {
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
  return refreshPromise;
}
