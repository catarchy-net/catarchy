import { api } from "@/features/common";
import type { ConsensusKey } from "@backend/domain/consensus/definitions";
import { queryOptions } from "@tanstack/react-query";

export type { ConsensusKey };

export async function getAllConsensus() {
  return (await api.consensus.get()).data;
}

export async function getConsensus(key: ConsensusKey) {
  return (await api.consensus({ key }).get()).data;
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
