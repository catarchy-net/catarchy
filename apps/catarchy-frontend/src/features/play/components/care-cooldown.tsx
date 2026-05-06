import { catInfoOptions } from "@/features/cat";
import { Text, useCountDown } from "@/features/common";
import { consensusOptions } from "@/features/consensus";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function CareCooldown() {
  const { data: catInfo } = useQuery(catInfoOptions());
  const { data: cooldown } = useQuery(
    consensusOptions("CAT.COOLDOWN_HOUR_BETWEEN_CARE"),
  );

  const target = useMemo(() => {
    if (!catInfo?.lastCaredAt || !cooldown) return new Date();
    const lastCared = new Date(`${catInfo.lastCaredAt}Z`);
    return new Date(
      lastCared.getTime() + (cooldown.value as number) * 60 * 60 * 1000,
    );
  }, [catInfo?.lastCaredAt, cooldown]);

  const remainSeconds = useCountDown({ target });

  if (!catInfo?.lastCaredAt || remainSeconds === 0) return null;

  return <Text>{formatCountdown(remainSeconds)}</Text>;
}
