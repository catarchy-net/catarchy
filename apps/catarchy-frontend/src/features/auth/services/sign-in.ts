import { api } from "@/features/common";
import { mutationOptions } from "@tanstack/react-query";

export type Payload = Parameters<(typeof api.auth)["sign-in-email"]["post"]>[0];
export type ApiResponse = Awaited<
  ReturnType<(typeof api.auth)["sign-in-email"]["post"]>
>["data"];
export type ApiError = Awaited<
  ReturnType<(typeof api.auth)["sign-in-email"]["post"]>
>["error"];

export async function signInWithEmail(payload: Payload) {
  const { data, error } = await api.auth["sign-in-email"].post(payload);
  if (error) throw error;
  return data;
}

export function signInWithEmailOptions() {
  return mutationOptions<ApiResponse, ApiError, Payload>({
    mutationKey: ["auth", "sign-in"],
    mutationFn: signInWithEmail,
  });
}
