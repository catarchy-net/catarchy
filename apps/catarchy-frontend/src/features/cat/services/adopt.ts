import { api } from "@/features/common";
import { mutationOptions } from "@tanstack/react-query";

type AdoptCatPayload = Parameters<(typeof api.cat)["post"]>[0];
type AdoptCatResponse = Awaited<ReturnType<(typeof api.cat)["post"]>>["data"];
type AdoptCatError = Awaited<ReturnType<(typeof api.cat)["post"]>>["error"];

export async function adopt(payload: AdoptCatPayload) {
  const { data, error } = await api.cat.post(payload);
  if (error) throw error;
  return data;
}

export function adoptOptions() {
  return mutationOptions<AdoptCatResponse, AdoptCatError, AdoptCatPayload>({
    mutationKey: ["cat", "adopt"],
    mutationFn: (payload) => adopt(payload),
  });
}
