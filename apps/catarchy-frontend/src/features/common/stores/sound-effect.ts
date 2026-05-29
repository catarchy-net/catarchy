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
  setSoundEffect: (soundEffect: SoundEffect) => void;
};

export const useSoundEffectStore = create<SoundEffectStore>()(
  persist(
    (set) => ({
      soundEffect: "none",
      setSoundEffect: (soundEffect) => set({ soundEffect }),
    }),
    { name: "catarchy-sound-effect" },
  ),
);
