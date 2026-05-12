import { api } from "@/features/common";
import { mutationOptions } from "@tanstack/react-query";

export type ApiResponse = Awaited<ReturnType<(typeof api.auth)["sign-out"]["post"]>>["data"];
export type ApiError = Awaited<ReturnType<(typeof api.auth)["sign-out"]["post"]>>["error"];

export async function signOut() {
  const { data, error } = await api.auth["sign-out"].post();
  if (error) throw error;
  return data;
}

export function signOutOptions() {
  return mutationOptions({
    mutationFn: signOut,
  });
}
