import { mutationOptions } from "@tanstack/react-query";

import { api, env } from "@/features/common";

const AUTHORIZATION_ENDPOINT =
  "https://www.remilia.net/oidc/realms/remilia/protocol/openid-connect/auth";
const TOKEN_ENDPOINT =
  "https://www.remilia.net/oidc/realms/remilia/protocol/openid-connect/token";
const TRANSACTION_KEY = "catarchy.remilianet.pkce";
const TRANSACTION_TTL_MS = 10 * 60 * 1000;

type RemiliaTransaction = {
  codeVerifier: string;
  state: string;
  createdAt: number;
};

export type RemiliaCallback = {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
};

const encodeBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const createRandomValue = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return encodeBase64Url(bytes);
};

const createCodeChallenge = async (codeVerifier: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier),
  );
  return encodeBase64Url(new Uint8Array(digest));
};

const getRedirectUri = () => `${window.location.origin}/auth/sign-in`;

export async function startRemiliaSignIn() {
  const transaction: RemiliaTransaction = {
    codeVerifier: createRandomValue(),
    state: createRandomValue(),
    createdAt: Date.now(),
  };
  const codeChallenge = await createCodeChallenge(transaction.codeVerifier);

  sessionStorage.setItem(TRANSACTION_KEY, JSON.stringify(transaction));

  const params = new URLSearchParams({
    client_id: env.VITE_REMILIA_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "openid",
    state: transaction.state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  window.location.assign(`${AUTHORIZATION_ENDPOINT}?${params}`);
}

export function isRemiliaCallback(callback: RemiliaCallback) {
  return Boolean(callback.code || callback.error);
}

export async function finishRemiliaSignIn(callback: RemiliaCallback) {
  if (callback.error) {
    sessionStorage.removeItem(TRANSACTION_KEY);
    throw new Error(
      callback.errorDescription ||
        `RemiliaNET sign-in failed: ${callback.error}`,
    );
  }

  const stored = sessionStorage.getItem(TRANSACTION_KEY);
  sessionStorage.removeItem(TRANSACTION_KEY);

  if (!stored) {
    throw new Error(
      "RemiliaNET sign-in session was not found. Please try again.",
    );
  }

  let transaction: RemiliaTransaction;
  try {
    transaction = JSON.parse(stored) as RemiliaTransaction;
  } catch {
    throw new Error("RemiliaNET sign-in session is invalid. Please try again.");
  }

  if (
    !callback.code ||
    !callback.state ||
    callback.state !== transaction.state ||
    Date.now() - transaction.createdAt > TRANSACTION_TTL_MS
  ) {
    throw new Error("RemiliaNET sign-in session expired. Please try again.");
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: env.VITE_REMILIA_CLIENT_ID,
      code: callback.code,
      redirect_uri: getRedirectUri(),
      code_verifier: transaction.codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error("RemiliaNET could not complete sign-in. Please try again.");
  }

  const tokens = (await response.json()) as { access_token?: unknown };
  if (typeof tokens.access_token !== "string") {
    throw new Error("RemiliaNET returned an invalid token response.");
  }

  return tokens.access_token;
}

export type SignInWithRemiliaPayload = Parameters<
  (typeof api.auth)["sign-in-remilianet"]["post"]
>[0];
export type SignInWithRemiliaResponse = Awaited<
  ReturnType<(typeof api.auth)["sign-in-remilianet"]["post"]>
>["data"];
export type SignInWithRemiliaError = Awaited<
  ReturnType<(typeof api.auth)["sign-in-remilianet"]["post"]>
>["error"];

export async function signInWithRemilia(payload: SignInWithRemiliaPayload) {
  const { data, error } = await api.auth["sign-in-remilianet"].post(payload);
  if (error) throw error;
  return data;
}

export function signInWithRemiliaOptions() {
  return mutationOptions<
    SignInWithRemiliaResponse,
    SignInWithRemiliaError,
    SignInWithRemiliaPayload
  >({
    mutationKey: ["auth", "sign-in", "remilianet"],
    mutationFn: signInWithRemilia,
  });
}
