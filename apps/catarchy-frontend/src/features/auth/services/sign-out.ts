import { api } from "@/features/common";
import { mutationOptions } from "@tanstack/react-query";

export type SignOutResponse = Awaited<
  ReturnType<(typeof api.auth)["sign-out"]["post"]>
>["data"];
export type SignOutError = Awaited<
  ReturnType<(typeof api.auth)["sign-out"]["post"]>
>["error"];

export async function signOut() {
  const { data, error } = await api.auth["sign-out"].post();
  if (error) throw error;
  return data;
}

export function signOutOptions() {
  return mutationOptions<SignOutResponse, SignOutError>({
    mutationFn: signOut,
  });
}
