import { api } from "@/features/common";
import { mutationOptions } from "@tanstack/react-query";

export type SignUpPayload = Parameters<
  (typeof api.auth)["sign-up-email"]["post"]
>[0];
export type SignUpResponse = Awaited<
  ReturnType<(typeof api.auth)["sign-up-email"]["post"]>
>["data"];
export type SignUpError = Awaited<
  ReturnType<(typeof api.auth)["sign-up-email"]["post"]>
>["error"];

export async function signUp(payload: SignUpPayload) {
  const { data, error } = await api.auth["sign-up-email"].post(payload);
  if (error) throw error;
  return data;
}

export function signUpOptions() {
  return mutationOptions<SignUpResponse, SignUpError, SignUpPayload>({
    mutationKey: ["auth", "sign-up"],
    mutationFn: signUp,
  });
}
