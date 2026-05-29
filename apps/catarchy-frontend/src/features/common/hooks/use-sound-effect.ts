import { isSegmentedSoundEffect, playSound } from "../lib/sound-effect";
import { useSoundEffectStore } from "../stores/sound-effect";

export function useSoundEffect() {
  const { soundEffect, setSoundEffect } = useSoundEffectStore();

  return {
    soundEffect,
    setSoundEffect,
    isSegmented: isSegmentedSoundEffect(soundEffect),
    play: playSound,
  };
}
