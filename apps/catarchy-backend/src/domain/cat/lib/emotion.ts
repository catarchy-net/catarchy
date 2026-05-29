import { EmotionLevel } from "@catarchy/shared/constants/cat";

export { EmotionLevel };

export const EMOTION_THRESHOLDS = {
  DOWN: 40,
  MEH: 70,
  HAPPY: 90,
} as const;

export const EMOTION_EMOJIS = {
  [EmotionLevel.Depressed]: "😩",
  [EmotionLevel.Down]: "🙁",
  [EmotionLevel.Meh]: "😐",
  [EmotionLevel.Happy]: "😄",
} as const;

export function calculateNewEmotion({
  currentEmotion,
  lastCaredAt,
  emotionPerCare,
  emotionDecrease,
  emotionDecreaseFrequencyHour,
}: {
  currentEmotion: number;
  lastCaredAt: string | null;
  emotionPerCare: number;
  emotionDecrease: number;
  emotionDecreaseFrequencyHour: number;
}): number {
  const neglectCycles = lastCaredAt
    ? Math.floor(
        (Date.now() - new Date(lastCaredAt).getTime()) /
          (emotionDecreaseFrequencyHour * 60 * 60 * 1000),
      )
    : 0;
  const decayAmount = neglectCycles * emotionDecrease;
  return Math.min(
    Math.max(0, currentEmotion - decayAmount) + emotionPerCare,
    100,
  );
}

export function getEmotion(emotion: number) {
  let level: EmotionLevel;

  if (emotion < EMOTION_THRESHOLDS.DOWN) {
    level = EmotionLevel.Depressed;
  } else if (emotion < EMOTION_THRESHOLDS.MEH) {
    level = EmotionLevel.Down;
  } else if (emotion < EMOTION_THRESHOLDS.HAPPY) {
    level = EmotionLevel.Meh;
  } else {
    level = EmotionLevel.Happy;
  }

  return {
    level,
    emoji: EMOTION_EMOJIS[level],
  };
}
