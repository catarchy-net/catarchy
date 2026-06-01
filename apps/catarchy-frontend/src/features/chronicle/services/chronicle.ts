import { InfiniteData, infiniteQueryOptions } from "@tanstack/react-query";

import { api } from "@/features/common";

type GetChroniclesPayload = Awaited<
  Parameters<(typeof api.chronicle)["get"]>
>["0"]["query"];
type GetChroniclesResponse = Awaited<
  ReturnType<(typeof api.chronicle)["get"]>
>["data"];
type GetChroniclesError = Awaited<
  ReturnType<(typeof api.chronicle)["get"]>
>["error"];

export async function getChronicles(payload: GetChroniclesPayload) {
  const { data, error } = await api.chronicle.get({ query: payload });

  if (error) throw error;

  return data;
}

export function chroniclesOptions(
  payload: Omit<GetChroniclesPayload, "cursor">,
) {
  const limit = payload.limit ?? 20;

  return infiniteQueryOptions<
    GetChroniclesResponse,
    GetChroniclesError,
    InfiniteData<GetChroniclesResponse>,
    (string | undefined)[],
    string | undefined
  >({
    queryKey: ["chronicle", payload.type],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      getChronicles({ ...payload, limit, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
  });
}
