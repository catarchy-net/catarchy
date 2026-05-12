import { api } from "@/features/common";
import { consensusOptions } from "@/features/consensus";
import { mutationOptions, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { catInfoOptions } from "./cat-info";

type CareForCatResponse = Awaited<ReturnType<typeof api.cat.care.post>>["data"];
type CareForCatError = Awaited<ReturnType<typeof api.cat.care.post>>["error"];

export async function careForCat() {
  const { data, error } = await api.cat.care.post({
    localDateTime: new Date().toLocaleString("sv"),
  });

  if (error) {
    throw error;
  }

  return data;
}

export function careForCatOptions() {
  return mutationOptions<CareForCatResponse, CareForCatError>({
    mutationKey: ["cat", "care"],
    mutationFn: careForCat,
  });
}

export function useCareCooldown() {
  const { data: catData, error: catError } = useQuery(catInfoOptions());
  const { data: cooldownData, error: cooldownError } = useQuery(
    consensusOptions("CAT.COOLDOWN_HOUR_BETWEEN_CARE"),
  );

  const activated = useMemo(() => {
    if (catError || cooldownError) return false;
    if (!catData?.lastCaredAt || !cooldownData) return false;

    const lastCaredAt = new Date(catData.lastCaredAt).getTime();
    const cooldownMs = (cooldownData.value as number) * 3_600_000;
    return Date.now() < lastCaredAt + cooldownMs;
  }, [catData, cooldownData, catError, cooldownError]);

  const endTime = useMemo(() => {
    if (!catData?.lastCaredAt || !cooldownData) return null;
    const lastCaredAt = new Date(catData.lastCaredAt).getTime();
    const cooldownMs = (cooldownData.value as number) * 3_600_000;
    return new Date(lastCaredAt + cooldownMs);
  }, [catData, cooldownData]);

  return {
    activated,
    endTime,
  };
}
