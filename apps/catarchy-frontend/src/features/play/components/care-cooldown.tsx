import { useQueryClient } from "@tanstack/react-query";

import { catInfoOptions, useCareCooldown } from "@/features/cat";
import { Text, useCountDown } from "@/features/common";

import styles from "./care-cooldown.module.css";

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function CareCooldown({ catId }: { catId: string }) {
  const queryClient = useQueryClient();
  const cooldown = useCareCooldown({ catId });

  const remainSeconds = useCountDown({
    target: cooldown.endTime ?? new Date(),
    onEnd() {
      queryClient.refetchQueries(catInfoOptions(catId));
    },
  });

  if (!cooldown.activated) {
    return null;
  }

  return <Text className={styles.text}>{formatCountdown(remainSeconds)}</Text>;
}
