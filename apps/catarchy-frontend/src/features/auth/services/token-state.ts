import { api } from "@/features/common";
import { queryOptions, useQuery } from "@tanstack/react-query";

export type ApiResponse = Awaited<ReturnType<typeof api.auth.check.get>>["data"];
export type ApiError = Awaited<ReturnType<typeof api.auth.check.get>>["error"];

export async function checkToken() {
  const { data, error } = await api.auth.check.get();
  if (error) throw error;
  return data;
}

export function checkTokenOptions() {
  return queryOptions({
    queryKey: ["auth", "check"],
    queryFn: checkToken,
    staleTime: Infinity,
  });
}

export function useIsAuthenticated() {
  const { data } = useQuery(checkTokenOptions());
  return Boolean(data?.ok);
}
