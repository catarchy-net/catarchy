import { forwardRef } from "react";

import { Sprite } from "@/features/common";

import catKeyframe from "../assets/sprites/cat.json";
import catTexture from "../assets/sprites/cat.svg?url";
import newbornKeyframe from "../assets/sprites/newborn.json";
import newbornTexture from "../assets/sprites/newborn.svg?url";

export const CatCharacter = forwardRef<
  HTMLDivElement,
  { age?: "newborn" | "adult"; tag?: "default" | "walk" }
>(function CatCharacter({ age = "newborn", tag = "default" }, ref) {
  const texture = age === "newborn" ? newbornTexture : catTexture;
  const keyframes = age === "newborn" ? newbornKeyframe : catKeyframe;

  return (
    <Sprite
      ref={ref}
      tag={tag}
      width={32 * 2}
      height={32 * 2}
      texture={texture}
      keyframes={keyframes}
    />
  );
});
