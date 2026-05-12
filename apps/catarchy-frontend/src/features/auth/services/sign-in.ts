import { api } from "@/features/common";
import { mutationOptions } from "@tanstack/react-query";

export type SignInWithEmailPayload = Parameters<
  (typeof api.auth)["sign-in-email"]["post"]
>[0];
export type SignInWithEmailResponse = Awaited<
  ReturnType<(typeof api.auth)["sign-in-email"]["post"]>
>["data"];
export type SignInWithEmailError = Awaited<
  ReturnType<(typeof api.auth)["sign-in-email"]["post"]>
>["error"];

export async function signInWithEmail(payload: SignInWithEmailPayload) {
  const { data, error } = await api.auth["sign-in-email"].post(payload);
  if (error) throw error;
  return data;
}

export function signInWithEmailOptions() {
  return mutationOptions<
    SignInWithEmailResponse,
    SignInWithEmailError,
    SignInWithEmailPayload
  >({
    mutationKey: ["auth", "sign-in"],
    mutationFn: signInWithEmail,
  });
}
