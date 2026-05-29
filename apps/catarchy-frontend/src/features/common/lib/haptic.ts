import { playSound } from "./sound-effect";

function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent);
}

function triggerHaptic(): void {
  if (isAndroid() && navigator.vibrate) {
    navigator.vibrate(10);
    return;
  }
  playSound();
}

export function useHaptic() {
  return { trigger: triggerHaptic };
}
