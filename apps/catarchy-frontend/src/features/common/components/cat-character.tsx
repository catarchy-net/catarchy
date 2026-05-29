import { AgeGroup } from "@catarchy/shared/constants/cat";
import { forwardRef } from "react";

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
  { age?: AgeGroup; tag?: "default" | "walk"; scale?: number; clip?: boolean }
>(function CatCharacter(
  { age = AgeGroup.NEWBORN, tag = "default", scale = 2, clip = false },
  ref,
) {
  const isNewborn = age === AgeGroup.NEWBORN;
  const texture = isNewborn ? newbornTexture : catTexture;
  const keyframes = isNewborn ? newbornKeyframe : catKeyframe;
  const renderedSize = 32 * scale;

  if (!clip) {
    return (
      <Sprite
        ref={ref}
        tag={tag}
        width={renderedSize}
        height={renderedSize}
        texture={texture}
        keyframes={keyframes}
      />
    );
  }

  const { x, y, w, h } = CAT_CHARACTER_HITBOX[age];
  const hitboxScale = renderedSize / 64;
  const clipX = x * hitboxScale;
  const clipY = y * hitboxScale;
  const clipW = w * hitboxScale;
  const clipH = h * hitboxScale;

  return (
    <div
      ref={ref}
      style={{ width: clipW, height: clipH, overflow: "hidden", position: "relative" }}
    >
      <Sprite
        tag={tag}
        width={renderedSize}
        height={renderedSize}
        texture={texture}
        keyframes={keyframes}
        style={{ position: "absolute", left: -clipX, top: -clipY }}
      />
    </div>
  );
});
