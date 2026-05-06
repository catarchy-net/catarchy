import { api } from "@/features/common";
import { queryOptions } from "@tanstack/react-query";

export async function getCatInfo() {
  return (await api.cat.get()).data;
}

export function catInfoOptions() {
  return queryOptions({
    queryKey: ["cat", "info"],
    queryFn: getCatInfo,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
