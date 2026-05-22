import { api } from "@/features/common";
import { queryOptions } from "@tanstack/react-query";

type CatListResponse = Awaited<ReturnType<typeof api.cat.get>>["data"];
type CatInfoResult = Awaited<ReturnType<ReturnType<typeof api.cat>["get"]>>;
type CatInfoResponse = CatInfoResult["data"];
type CatInfoError = CatInfoResult["error"];

export type CatList = NonNullable<CatListResponse>;
export type CatInfo = NonNullable<CatInfoResponse>;

export async function getCatList() {
  const { data, error } = await api.cat.get();
  if (error) throw error;
  return data;
}

export function catListOptions() {
  return queryOptions<CatListResponse>({
    queryKey: ["cat", "list"],
    queryFn: getCatList,
    staleTime: 5 * 60 * 1000,
  });
}

export async function getCatInfo(catId: string) {
  const { data, error } = await api.cat({ catId }).get();
  if (error) throw error;
  return data;
}

export function catInfoOptions(catId: string) {
  return queryOptions<CatInfoResponse, CatInfoError>({
    queryKey: ["cat", "info", catId],
    queryFn: () => getCatInfo(catId),
    staleTime: 5 * 60 * 1000,
  });
}
