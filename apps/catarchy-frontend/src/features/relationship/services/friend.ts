import { InfiniteData, infiniteQueryOptions } from "@tanstack/react-query";

import { api } from "@/features/common";

type GetFriendListPayload = Awaited<
  Parameters<(typeof api.relationship.list.friend)["get"]>
>["0"]["query"];
type GetFriendListResponse = Awaited<
  ReturnType<(typeof api.relationship.list.friend)["get"]>
>["data"];
type GetFriendListError = Awaited<
  ReturnType<(typeof api.relationship.list.friend)["get"]>
>["error"];

export async function getFriendList(payload: GetFriendListPayload) {
  const { data, error } = await api.relationship.list.friend.get({
    query: payload,
  });

  if (error) {
    throw error;
  }

  return data;
}

export function friendListOptions(payload: GetFriendListPayload) {
  const limit = payload.limit ?? 10;

  return infiniteQueryOptions<
    GetFriendListResponse,
    GetFriendListError,
    InfiniteData<GetFriendListResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["relationship", "list", "friend", payload.catId],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      getFriendList({ catId: payload.catId, limit, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
  });
}
