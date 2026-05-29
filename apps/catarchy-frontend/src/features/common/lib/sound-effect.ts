import { type SoundEffect, useSoundEffectStore } from "../stores/sound-effect";

type PlayableSoundEffect = Exclude<SoundEffect, "none">;

const DEFAULT_VOLUME = 0.2;

const audioCache: Partial<Record<PlayableSoundEffect, HTMLAudioElement>> = {};

function getAudio(type: PlayableSoundEffect): HTMLAudioElement {
  if (!audioCache[type]) {
    audioCache[type] = new Audio(`/assets/sfx/${type}.mp3`);
  }
  return audioCache[type]!;
}

const SEGMENTED_CONFIG: Partial<Record<PlayableSoundEffect, number[]>> = {
  oiia: [0, 150, 278, 383, 565],
};

export function isSegmentedSoundEffect(type: SoundEffect): boolean {
  return type !== "none" && type in SEGMENTED_CONFIG;
}

let audioCtx: AudioContext | null = null;
const audioBufferCache: Partial<Record<PlayableSoundEffect, AudioBuffer>> = {};
const segmentIndices: Partial<Record<PlayableSoundEffect, number>> = {};

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

async function getAudioBuffer(type: PlayableSoundEffect): Promise<AudioBuffer> {
  if (!audioBufferCache[type]) {
    const ctx = getAudioContext();
    const res = await fetch(`/assets/sfx/${type}.mp3`);
    const raw = await res.arrayBuffer();
    audioBufferCache[type] = await ctx.decodeAudioData(raw);
  }
  return audioBufferCache[type]!;
}

export function preloadSegmentedSound(type: PlayableSoundEffect): void {
  getAudioContext();
  getAudioBuffer(type).catch(() => {});
}

function fireSegment(
  ctx: AudioContext,
  buffer: AudioBuffer,
  offsetSec: number,
  durationSec: number,
): void {
  const gain = ctx.createGain();
  gain.gain.value = DEFAULT_VOLUME;
  gain.connect(ctx.destination);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  source.start(0, offsetSec, durationSec);
}

function playSegmented(type: PlayableSoundEffect, segments: number[]): void {
  const index = segmentIndices[type] ?? 0;
  const offsetSec = segments[index] / 1000;
  const durationSec = (segments[index + 1] - segments[index]) / 1000;
  segmentIndices[type] = (index + 1) % (segments.length - 1);

  const ctx = getAudioContext();
  const cached = audioBufferCache[type];

  if (cached && ctx.state === "running") {
    fireSegment(ctx, cached, offsetSec, durationSec);
    return;
  }

  const ready = ctx.state !== "running" ? ctx.resume() : Promise.resolve();
  ready.then(async () => {
    const buffer = cached ?? (await getAudioBuffer(type));
    fireSegment(ctx, buffer, offsetSec, durationSec);
  });
}

export function playSound(overrideSoundEffect?: SoundEffect): void {
  const { soundEffect: stored } = useSoundEffectStore.getState();
  const soundEffect = overrideSoundEffect ?? stored;
  if (soundEffect === "none") return;

  const segments = SEGMENTED_CONFIG[soundEffect];
  if (segments) {
    playSegmented(soundEffect, segments);
    return;
  }

  const audio = getAudio(soundEffect);
  audio.volume = DEFAULT_VOLUME;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
