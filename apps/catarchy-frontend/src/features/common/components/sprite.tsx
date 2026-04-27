import { forwardRef, ImgHTMLAttributes, useId } from "react";
import { cn } from "../lib/cn";
import styles from "./sprite.module.css";

export interface Frame {
  id: string;
  x: number;
  y: number;
  duration?: number;
}

export type Direction = "forward" | "reverse" | "pingpong" | (string & {});

export interface FrameTag {
  name: string;
  from: number;
  to: number;
  direction?: Direction;
  loop?: boolean;
}

export interface Keyframes<TagName extends string = string> {
  frameSize: { w: number; h: number };
  frames: Frame[];
  tags: (FrameTag & { name: TagName })[];
}

export interface SpriteProps<TagName extends string = string> {
  className?: string;
  style?: React.CSSProperties;
  width: number;
  height: number;
  texture?: ImgHTMLAttributes<HTMLImageElement>["src"];
  keyframes?: Keyframes<TagName>;
  alt?: string;
  tag?: TagName | null;
}

export const Sprite = forwardRef(function Sprite<
  TagName extends string = string,
>(
  {
    className,
    style,
    width,
    height,
    texture,
    keyframes,
    alt,
    tag,
  }: SpriteProps<TagName>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  console.log("Rendering Sprite", texture);
  const id = useId();
  const {
    frameSize = { w: width, h: height },
    frames = [],
    tags = [],
  } = keyframes ?? {};
  const activeTag = tag ? tags.find((t) => t.name === tag) : null;
  const tagFrames = activeTag
    ? frames.slice(activeTag.from, activeTag.to + 1)
    : [];
  const frameCount = tagFrames.length;
  const fromX = tagFrames[0]?.x ?? 0;
  const totalDuration = tagFrames.reduce(
    (sum, f) => sum + (f.duration ?? 100),
    0,
  );
  const scale = width / frameSize.w;
  const sheetW =
    frames.reduce((max, f) => Math.max(max, f.x + frameSize.w), 0) ||
    frameSize.w;
  const sheetH =
    frames.reduce((max, f) => Math.max(max, f.y + frameSize.h), 0) ||
    frameSize.h;
  const toX = fromX + frameSize.w * frameCount;
  const animId = `sprite-${fromX}-${toX}-${frameCount}-${id}`;

  return (
    <>
      {frameCount > 1 && (
        <style>{`
          @keyframes ${animId} {
            from { background-position: ${-fromX * scale}px 0px; }
            to   { background-position: ${-toX * scale}px 0px; }
          }
        `}</style>
      )}
      <div
        ref={ref}
        role="img"
        aria-label={alt}
        aria-hidden={!alt}
        draggable={false}
        className={cn([styles.container, className])}
        style={{
          width,
          height,
          backgroundImage: texture ? `url("${texture}")` : undefined,
          backgroundSize: `${sheetW * scale}px ${sheetH * scale}px`,
          backgroundPosition: `${-fromX * scale}px 0px`,
          animation:
            frameCount > 1
              ? `${animId} ${totalDuration}ms steps(${frameCount}) ${activeTag?.loop ? "infinite" : "1"}`
              : undefined,
          ...style,
        }}
      />
    </>
  );
}) as <TagName extends string = string>(
  props: SpriteProps<TagName> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
