import React, { useEffect, useImperativeHandle, useRef } from "react";
import Tail from "../assets/bubble-tail.svg?react";
import { cn } from "../lib/cn";
import { Box } from "./box";
import styles from "./bubble-hint.module.css";

export type BubbleHintSide = "top" | "bottom" | "left" | "right";

export interface BubbleHintProps {
  targetRef?: React.RefObject<HTMLElement | null>;
  children?: React.ReactNode;
  background?: "white" | "black";
  preferredSide?: BubbleHintSide;
  offset?: number;
  className?: string;
}

export const BubbleHint = React.forwardRef<HTMLDivElement, BubbleHintProps>(
  (
    {
      targetRef,
      children,
      background = "white",
      preferredSide,
      offset = 8,
      className,
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => rootRef.current!);

    useEffect(() => {
      const target = targetRef?.current;
      if (!target) return;

      function update() {
        const root = rootRef.current;
        if (!root || !target) return;

        const rect = target.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const vp = window.visualViewport;
        const vw = vp ? vp.width : window.innerWidth;
        const vh = vp ? vp.height : window.innerHeight;

        const spaceTop = rect.top;
        const spaceBottom = vh - rect.bottom;
        const spaceLeft = rect.left;
        const spaceRight = vw - rect.right;

        const maxVertical = Math.max(spaceTop, spaceBottom);
        const maxHorizontal = Math.max(spaceLeft, spaceRight);

        const hasSpace: Record<BubbleHintSide, boolean> = {
          bottom: spaceBottom >= rootRect.height + offset + 3 + 4,
          top: spaceTop >= rootRect.height + offset + 3 + 4,
          right: spaceRight >= rootRect.width + offset + 3 + 4,
          left: spaceLeft >= rootRect.width + offset + 3 + 4,
        };

        let side: BubbleHintSide;
        if (preferredSide && hasSpace[preferredSide]) {
          side = preferredSide;
        } else if (maxVertical >= maxHorizontal) {
          side = spaceBottom >= spaceTop ? "bottom" : "top";
        } else {
          side = spaceRight >= spaceLeft ? "right" : "left";
        }

        const targetCx = rect.left + rect.width / 2;
        const targetCy = rect.top + rect.height / 2;

        let x: number, y: number;
        if (side === "bottom") {
          x = targetCx - rootRect.width / 2;
          y = rect.bottom + offset + 3;
        } else if (side === "top") {
          x = targetCx - rootRect.width / 2;
          y = rect.top - offset + 3 - rootRect.height;
        } else if (side === "right") {
          x = rect.right + offset + 3;
          y = targetCy - rootRect.height / 2;
        } else {
          x = rect.left - offset + 3 - rootRect.width;
          y = targetCy - rootRect.height / 2;
        }

        // clamp to viewport with 4px margin
        const MARGIN = 4;
        x = Math.max(MARGIN, Math.min(x, vw - rootRect.width - MARGIN));
        y = Math.max(MARGIN, Math.min(y, vh - rootRect.height - MARGIN));

        // tail offset: point toward target center, clamped within bubble bounds
        const TAIL_SIZE = 7;
        const TAIL_EDGE_PAD = 4;
        const rawTailX = targetCx - x - 3;
        const rawTailY = targetCy - y - 3;
        const clampedTailX = Math.max(
          TAIL_EDGE_PAD,
          Math.min(rawTailX, rootRect.width - TAIL_SIZE - TAIL_EDGE_PAD),
        );
        const clampedTailY = Math.max(
          TAIL_EDGE_PAD,
          Math.min(rawTailY, rootRect.height - TAIL_SIZE - TAIL_EDGE_PAD),
        );
        const tailOffsetX = `${clampedTailX}px`;
        const tailOffsetY = `${clampedTailY}px`;

        // position: fixed is relative to the layout viewport, but all
        // coordinates above are relative to the visual viewport.
        // Add visualViewport offset to convert between the two.
        const vpOffsetLeft = vp?.offsetLeft ?? 0;
        const vpOffsetTop = vp?.offsetTop ?? 0;

        root.dataset.side = side;
        root.style.left = `${x + vpOffsetLeft}px`;
        root.style.top = `${y + vpOffsetTop}px`;
        root.style.setProperty(
          "--tail-offset",
          side === "left" || side === "right" ? tailOffsetY : tailOffsetX,
        );
        root.style.setProperty("visibility", "visible");
      }

      let rafId: number;
      function loop() {
        update();
        rafId = requestAnimationFrame(loop);
      }
      rafId = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(rafId);
      };
    }, [targetRef, preferredSide]);

    return (
      <div ref={rootRef} className={cn(styles.root, className)}>
        <Tail color={background} className={styles.tail} />
        <Box
          rounded
          containerClassName={cn([
            "px-2 py-1",
            background === "black" && "bg-black text-white",
          ])}
        >
          {children}
        </Box>
      </div>
    );
  },
);
