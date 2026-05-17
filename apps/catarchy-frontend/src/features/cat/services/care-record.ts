import { api } from "@/features/common";
import { InfiniteData, infiniteQueryOptions } from "@tanstack/react-query";

type GetCareRecordsPayload = Awaited<
  Parameters<(typeof api.cat)["care-records"]["get"]>
>["0"]["query"];
type GetCareRecordsError = Awaited<
  ReturnType<(typeof api.cat)["care-records"]["get"]>
>["error"];
type GetCareRecordsResponse = Awaited<
  ReturnType<(typeof api.cat)["care-records"]["get"]>
>["data"];

export async function getCareRecords(payload: GetCareRecordsPayload) {
  const { data, error } = await api.cat["care-records"].get({
    query: payload,
  });

  if (error) throw error;

  return data;
}

export function careRecordsOptions(payload: GetCareRecordsPayload) {
  const limit = payload.limit ?? 5;

  return infiniteQueryOptions<
    GetCareRecordsResponse,
    GetCareRecordsError,
    InfiniteData<GetCareRecordsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["cat", "care-records", payload.catId],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      getCareRecords({ catId: payload.catId, limit, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
  });
}
