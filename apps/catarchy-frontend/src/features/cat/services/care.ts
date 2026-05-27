import { mutationOptions, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { api } from "@/features/common";
import { consensusOptions } from "@/features/consensus";

import { catInfoOptions } from "./cat-info";

type CareForCatResponse = Awaited<ReturnType<typeof api.cat.care.post>>["data"];
type CareForCatError = Awaited<ReturnType<typeof api.cat.care.post>>["error"];

export async function careForCat(catId: string) {
  const { data, error } = await api.cat.care.post({
    catId,
    localDateTime: new Date().toLocaleString("sv"),
  });

  if (error) {
    throw error;
  }

  return data;
}

export function careForCatOptions(catId: string) {
  return mutationOptions<CareForCatResponse, CareForCatError>({
    mutationKey: ["cat", "care"],
    mutationFn: () => careForCat(catId),
  });
}

export function useCareCooldown({ catId }: { catId: string }) {
  const { data: catData } = useQuery(catInfoOptions(catId));
  const { data: cooldownData } = useQuery(
    consensusOptions("CAT.COOLDOWN_HOUR_BETWEEN_CARE"),
  );

  const endTime = useMemo(() => {
    if (!catData?.lastCaredAt || !cooldownData) return null;
    const lastCaredAt = new Date(catData.lastCaredAt).getTime();
    const cooldownMs = (cooldownData.value as number) * 3_600_000;
    return new Date(lastCaredAt + cooldownMs);
  }, [catData, cooldownData]);

  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (!endTime) {
      setActivated(false);
      return;
    }
    const remaining = endTime.getTime() - Date.now();
    if (remaining <= 0) {
      setActivated(false);
      return;
    }
    setActivated(true);
    const timer = setTimeout(() => setActivated(false), remaining);
    return () => clearTimeout(timer);
  }, [endTime]);

  return {
    activated,
    endTime,
  };
}
