import { isSegmentedSoundEffect, playSound } from "../lib/sound-effect";
import { useSoundEffectStore } from "../stores/sound-effect";

export function useSoundEffect() {
  const { soundEffect, setSoundEffect, volume, setVolume } =
    useSoundEffectStore();

  return {
    soundEffect,
    setSoundEffect,
    volume,
    setVolume,
    isSegmented: isSegmentedSoundEffect(soundEffect),
    play: playSound,
  };
}
