import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { relationshipUpdatesOptions } from "@/features/relationship";

const POLL_INTERVAL = 1000;
const POLL_TIMEOUT = 8000;

export function useFriendMatchPolling({
  catId,
  enabled,
  startedAt,
}: {
  catId: string;
  enabled: boolean;
  startedAt?: number;
}) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const elapsed = startedAt != null ? Date.now() - startedAt : 0;
    const remaining = Math.max(0, POLL_TIMEOUT - elapsed);

    if (remaining === 0) {
      setMinTimeElapsed(true);
      return;
    }

    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, remaining);

    return () => clearTimeout(timer);
  }, [enabled, startedAt]);

  const { data } = useQuery({
    ...relationshipUpdatesOptions({ catId }),
    enabled,
    retry: false,
    refetchInterval(query) {
      if (query.state.data?.current) {
        return false;
      }

      const elapsed = startedAt != null ? Date.now() - startedAt : 0;
      if (elapsed >= POLL_TIMEOUT) {
        return false;
      }

      return POLL_INTERVAL;
    },
  });

  const friend = data?.current ?? null;
  const settled = minTimeElapsed;

  return { friend, settled };
}
