import { api } from "@/features/common";
import { queryOptions } from "@tanstack/react-query";

export type MeResponse = Awaited<ReturnType<typeof api.user.me.get>>["data"];
export type MeError = Awaited<ReturnType<typeof api.user.me.get>>["error"];

export async function getMe() {
  const { data, error } = await api.user.me.get();
  if (error) throw error;
  return data;
}

export function meOptions() {
  return queryOptions<MeResponse, MeError>({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });
}
