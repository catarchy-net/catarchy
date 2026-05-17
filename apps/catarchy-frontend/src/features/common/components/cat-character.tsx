import { forwardRef } from "react";

import { AgeGroup } from "@catarchy/shared/constants/cat";
import catKeyframe from "../assets/sprites/cat.json";
import catTexture from "../assets/sprites/cat.svg?url";
import newbornKeyframe from "../assets/sprites/newborn.json";
import newbornTexture from "../assets/sprites/newborn.svg?url";
import { Sprite } from "./sprite";

export const CAT_CHARACTER_HITBOX: Record<
  AgeGroup,
  { x: number; y: number; w: number; h: number }
> = {
  [AgeGroup.NEWBORN]: { x: 20, y: 50, w: 24, h: 14 },
  [AgeGroup.KITTEN]: { x: 12, y: 34, w: 38, h: 30 },
  [AgeGroup.JUVENILE]: { x: 12, y: 34, w: 38, h: 30 },
  [AgeGroup.ADULT]: { x: 12, y: 34, w: 38, h: 30 },
  [AgeGroup.MATURE]: { x: 12, y: 34, w: 38, h: 30 },
  [AgeGroup.SENIOR]: { x: 12, y: 34, w: 38, h: 30 },
};

export const CatCharacter = forwardRef<
  HTMLDivElement,
  { age?: AgeGroup; tag?: "default" | "walk"; scale?: number }
>(function CatCharacter(
  { age = AgeGroup.NEWBORN, tag = "default", scale = 2 },
  ref,
) {
  const isNewborn = age === AgeGroup.NEWBORN;
  const texture = isNewborn ? newbornTexture : catTexture;
  const keyframes = isNewborn ? newbornKeyframe : catKeyframe;

  return (
    <Sprite
      ref={ref}
      tag={tag}
      width={32 * scale}
      height={32 * scale}
      texture={texture}
      keyframes={keyframes}
    />
  );
});
