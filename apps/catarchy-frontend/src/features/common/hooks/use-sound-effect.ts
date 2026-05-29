import { useEffect } from "react";

import {
  isSegmentedSoundEffect,
  playSound,
  preloadSegmentedSound,
} from "../lib/sound-effect";
import { type SoundEffect, useSoundEffectStore } from "../stores/sound-effect";

export function useSoundEffect() {
  const { soundEffect, setSoundEffect } = useSoundEffectStore();

  useEffect(() => {
    if (isSegmentedSoundEffect(soundEffect)) {
      preloadSegmentedSound(soundEffect as Exclude<SoundEffect, "none">);
    }
  }, [soundEffect]);

  return {
    soundEffect,
    setSoundEffect,
    isSegmented: isSegmentedSoundEffect(soundEffect),
    play: playSound,
  };
}
