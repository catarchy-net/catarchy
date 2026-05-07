import { api } from "@/features/common";
import { queryOptions } from "@tanstack/react-query";

type ApiResponse = Awaited<ReturnType<typeof api.cat.get>>["data"];
type ApiError = Awaited<ReturnType<typeof api.cat.get>>["error"];

export async function getCatInfo() {
  const { data, error } = await api.cat.get();
  if (error) throw error;
  return data;
}

export function catInfoOptions() {
  return queryOptions<ApiResponse, ApiError>({
    queryKey: ["cat", "info"],
    queryFn: getCatInfo,
    staleTime: 5 * 60 * 1000,
  });
}

