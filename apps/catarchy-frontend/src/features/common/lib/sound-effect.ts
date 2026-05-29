import { type SoundEffect, useSoundEffectStore } from "../stores/sound-effect";

type PlayableSoundEffect = Exclude<SoundEffect, "none">;

const audioCache: Partial<Record<PlayableSoundEffect, HTMLAudioElement>> = {};

function getAudio(type: PlayableSoundEffect): HTMLAudioElement {
  if (!audioCache[type]) {
    audioCache[type] = new Audio(`/assets/sfx/${type}.mp3`);
  }
  return audioCache[type]!;
}

// 각 구간 시작 ms 배열, 마지막 값은 마지막 구간의 끝 ms
const SEGMENTED_CONFIG: Partial<Record<PlayableSoundEffect, number[]>> = {
  oiia: [0, 150, 278, 383, 565],
};

export function isSegmentedSoundEffect(type: SoundEffect): boolean {
  return type !== "none" && type in SEGMENTED_CONFIG;
}

const segmentIndices: Partial<Record<PlayableSoundEffect, number>> = {};
let segmentTimer: ReturnType<typeof setTimeout> | null = null;

function playSegmented(
  type: PlayableSoundEffect,
  audio: HTMLAudioElement,
  volume: number,
  segments: number[],
): void {
  if (segmentTimer !== null) {
    clearTimeout(segmentTimer);
    segmentTimer = null;
  }

  const index = segmentIndices[type] ?? 0;
  const start = segments[index];
  const duration = segments[index + 1] - start;

  audio.volume = volume;
  audio.currentTime = start / 1000;
  audio.play().catch(() => {});

  segmentTimer = setTimeout(() => {
    audio.pause();
    segmentTimer = null;
  }, duration);

  segmentIndices[type] = (index + 1) % (segments.length - 1);
}

export function playSound(overrideSoundEffect?: SoundEffect): void {
  const { soundEffect: stored, volume } = useSoundEffectStore.getState();
  const soundEffect = overrideSoundEffect ?? stored;
  if (soundEffect === "none") return;

  const audio = getAudio(soundEffect);
  const segments = SEGMENTED_CONFIG[soundEffect];

  if (segments) {
    playSegmented(soundEffect, audio, volume, segments);
    return;
  }

  audio.volume = volume;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
