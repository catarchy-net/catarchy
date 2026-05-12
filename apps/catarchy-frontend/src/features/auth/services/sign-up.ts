import { api } from "@/features/common";
import { mutationOptions } from "@tanstack/react-query";

export type Payload = Parameters<(typeof api.auth)["sign-up-email"]["post"]>[0];
export type ApiResponse = Awaited<ReturnType<(typeof api.auth)["sign-up-email"]["post"]>>["data"];
export type ApiError = Awaited<ReturnType<(typeof api.auth)["sign-up-email"]["post"]>>["error"];

export async function signUp(payload: Payload) {
  const { data, error } = await api.auth["sign-up-email"].post(payload);
  if (error) throw error;
  return data;
}

export function signUpOptions() {
  return mutationOptions({
    mutationKey: ["auth", "sign-up"],
    mutationFn: signUp,
  });
}
