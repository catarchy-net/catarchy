import { api } from "@/features/common";
import { mutationOptions } from "@tanstack/react-query";

type SummonCatPayload = Parameters<(typeof api.cat)["post"]>[0];
type SummonCatResponse = Awaited<ReturnType<(typeof api.cat)["post"]>>["data"];
type SummonCatError = Awaited<ReturnType<(typeof api.cat)["post"]>>["error"];

export async function summon(payload: SummonCatPayload) {
  const { data, error } = await api.cat.post(payload);
  if (error) throw error;
  return data;
}

export function summonOptions() {
  return mutationOptions<SummonCatResponse, SummonCatError, SummonCatPayload>({
    mutationKey: ["cat", "summon"],
    mutationFn: (payload) => summon(payload),
  });
}
