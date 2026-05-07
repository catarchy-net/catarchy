import { useEffect, useRef, useState } from "react";

export function useCountDown({
  target,
  pauseWhen,
  onEnd,
}: {
  target: Date;
  pauseWhen?: boolean;
  onEnd?: () => void;
}) {
  const [remainSeconds, setRemainSeconds] = useState(() => {
    const diff = target.getTime() - new Date().getTime();
    return diff <= 0 ? 0 : Math.ceil(diff / 1000);
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    const diff = target.getTime() - new Date().getTime();
    setRemainSeconds(diff <= 0 ? 0 : Math.ceil(diff / 1000));

    if (diff <= 0 || pauseWhen) return;

    intervalRef.current = setInterval(() => {
      const diff = target.getTime() - new Date().getTime();
      setRemainSeconds(diff <= 0 ? 0 : Math.ceil(diff / 1000));

      if (diff <= 0) {
        clearTimer();
        onEnd?.();
      }
    }, 1000);

    return clearTimer;
  }, [target, pauseWhen]);

  return remainSeconds;
}
