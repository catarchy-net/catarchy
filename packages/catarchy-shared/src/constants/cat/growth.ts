export enum AgeGroup {
  NEWBORN = "NEWBORN",
  KITTEN = "KITTEN",
  JUVENILE = "JUVENILE",
  ADULT = "ADULT",
  MATURE = "MATURE",
  SENIOR = "SENIOR",
}

export const AGE_GROWTH_THRESHOLDS = {
  NEWBORN: 0,
  KITTEN: 60,
  JUVENILE: 120,
  ADULT: 240,
  MATURE: 2400,
  SENIOR: 9600,
};

export const AGE_DESCRIPTION: Record<AgeGroup, string> = {
  [AgeGroup.NEWBORN]: "A newborn kitten. Can barely open its eyes.",
  [AgeGroup.KITTEN]: "A small kitten. Light and clumsy.",
  [AgeGroup.JUVENILE]: "A young cat. Agile and growing fast.",
  [AgeGroup.ADULT]: "A fully grown cat in its prime.",
  [AgeGroup.MATURE]: "A mature cat. Unhurried and steady.",
  [AgeGroup.SENIOR]: "An elderly cat. Slow and fragile.",
};

export function getAge(growth: number) {
  return {
    value: parseFloat((growth / 12).toFixed(2)),
    int: Math.floor(growth / 12),
    fraction: {
      numerator: growth % 12,
      denominator: 12 as const,
    },
  };
}

export function getAgeGroup(growth: number): AgeGroup {
  if (growth < AGE_GROWTH_THRESHOLDS.KITTEN) return AgeGroup.NEWBORN;
  if (growth < AGE_GROWTH_THRESHOLDS.JUVENILE) return AgeGroup.KITTEN;
  if (growth < AGE_GROWTH_THRESHOLDS.ADULT) return AgeGroup.JUVENILE;
  if (growth < AGE_GROWTH_THRESHOLDS.MATURE) return AgeGroup.ADULT;
  if (growth < AGE_GROWTH_THRESHOLDS.SENIOR) return AgeGroup.MATURE;
  return AgeGroup.SENIOR;
}
