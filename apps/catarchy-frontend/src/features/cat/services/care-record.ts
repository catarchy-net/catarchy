import {
  InfiniteData,
  infiniteQueryOptions,
  queryOptions,
} from "@tanstack/react-query";

import { api } from "@/features/common";

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

export async function getCareRecord({
  careRecordId,
}: {
  careRecordId: string;
}) {
  const { data, error } = await api.cat["care-records"]({ careRecordId }).get();

  if (error) {
    throw error;
  }

  return data;
}

export function careRecordOptions({ careRecordId }: { careRecordId: string }) {
  return queryOptions<
    Awaited<
      ReturnType<ReturnType<(typeof api.cat)["care-records"]>["get"]>
    >["data"],
    Awaited<
      ReturnType<ReturnType<(typeof api.cat)["care-records"]>["get"]>
    >["error"]
  >({
    queryKey: ["cat", "care-records", careRecordId, "message"],
    queryFn: () => getCareRecord({ careRecordId }),
  });
}
