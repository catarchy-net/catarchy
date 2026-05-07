import { api } from "@/features/common";
import type { ConsensusKey } from "@catarchy/shared/constants/consensus";
import { queryOptions } from "@tanstack/react-query";

export type { ConsensusKey };

export type ApiResponse = Awaited<ReturnType<typeof api.consensus.get>>["data"];
export type ApiError = Awaited<ReturnType<typeof api.consensus.get>>["error"];

export async function getAllConsensus() {
  const { data, error } = await api.consensus.get();
  if (error) throw error;
  return data;
}

export async function getConsensus(key: ConsensusKey) {
  const { data, error } = await api.consensus({ key }).get();
  if (error) throw error;
  return data;
}

export function allConsensusOptions() {
  return queryOptions({
    queryKey: ["consensus"],
    queryFn: getAllConsensus,
    staleTime: 5 * 60 * 1000,
  });
}

export function consensusOptions(key: ConsensusKey) {
  return queryOptions({
    queryKey: ["consensus", key],
    queryFn: () => getConsensus(key),
    staleTime: 20 * 60 * 1000,
  });
}
