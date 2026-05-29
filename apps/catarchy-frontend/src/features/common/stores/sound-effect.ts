import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SoundEffect =
  | "none"
  | "meow"
  | "meow2"
  | "meow3"
  | "meowrgh"
  | "vine-boom"
  | "oiia";

type SoundEffectStore = {
  soundEffect: SoundEffect;
  volume: number;
  setSoundEffect: (soundEffect: SoundEffect) => void;
  setVolume: (volume: number) => void;
};

export const useSoundEffectStore = create<SoundEffectStore>()(
  persist(
    (set) => ({
      soundEffect: "none",
      volume: 0.5,
      setSoundEffect: (soundEffect) => set({ soundEffect }),
      setVolume: (volume) => set({ volume }),
    }),
    { name: "catarchy-sound-effect" },
  ),
);
