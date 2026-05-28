import {
  InfiniteData,
  infiniteQueryOptions,
  queryOptions,
} from "@tanstack/react-query";

import { api } from "@/features/common";

type GetRelationshipUpdatesPayload = Awaited<
  Parameters<(typeof api.relationship.history.updates)["get"]>
>["0"]["query"];
type GetRelationshipUpdatesResponse = Awaited<
  ReturnType<(typeof api.relationship.history.updates)["get"]>
>["data"];
type GetRelationshipUpdatesError = Awaited<
  ReturnType<(typeof api.relationship.history.updates)["get"]>
>["error"];

export async function getRelationshipUpdates(
  payload: GetRelationshipUpdatesPayload,
) {
  const { data, error } = await api.relationship.history.updates.get({
    query: payload,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function relationshipUpdatesOptions(
  payload: GetRelationshipUpdatesPayload,
) {
  return queryOptions<
    GetRelationshipUpdatesResponse,
    GetRelationshipUpdatesError
  >({
    queryKey: ["relationship", "history", "updates", payload.catId],
    queryFn: () => getRelationshipUpdates(payload),
  });
}

type GetRelationshipHistoryPayload = Awaited<
  Parameters<(typeof api.relationship.history)["get"]>
>["0"]["query"];
type GetRelationshipHistoryResponse = Awaited<
  ReturnType<(typeof api.relationship.history)["get"]>
>["data"];
type GetRelationshipHistoryError = Awaited<
  ReturnType<(typeof api.relationship.history)["get"]>
>["error"];

export async function getRelationshipHistory(
  payload: GetRelationshipHistoryPayload,
) {
  const { data, error } = await api.relationship.history.get({
    query: payload,
  });

  if (error) {
    throw error;
  }

  return data;
}

export function relationshipHistoryOptions(
  payload: GetRelationshipHistoryPayload,
) {
  const limit = payload.limit ?? 5;

  return infiniteQueryOptions<
    GetRelationshipHistoryResponse,
    GetRelationshipHistoryError,
    InfiniteData<GetRelationshipHistoryResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["relationship", "history", payload.catId],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      getRelationshipHistory({
        catId: payload.catId,
        limit,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
  });
}

type GetCurrentRelationshipPayload = Awaited<
  Parameters<(typeof api.relationship)["get"]>
>["0"]["query"];
type GetCurrentRelationshipResponse = Awaited<
  ReturnType<(typeof api.relationship)["get"]>
>["data"];
type GetCurrentRelationshipError = Awaited<
  ReturnType<(typeof api.relationship)["get"]>
>["error"];

export async function getCurrentRelationship(
  payload: GetCurrentRelationshipPayload,
) {
  const { data, error } = await api.relationship.get({
    query: payload,
  });

  if (error) {
    throw error;
  }

  return data;
}

export function currentRelationshipOptions(
  payload: GetCurrentRelationshipPayload,
) {
  return queryOptions<
    GetCurrentRelationshipResponse,
    GetCurrentRelationshipError
  >({
    queryKey: ["relationship", "current", payload.catId],
    queryFn: () => getCurrentRelationship(payload),
  });
}

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
