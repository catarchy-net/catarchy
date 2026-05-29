import { useEffect, useRef, useState } from "react";

import { cn } from "../lib/cn";
import { Text } from "./text";
import styles from "./text-marquee.module.css";

const GAP = 16;

interface TextMarqueeProps {
  maxWidth: number;
  children?: React.ReactNode;
  direction?: "left" | "right";
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function TextMarquee({
  maxWidth,
  children,
  direction = "left",
  speed = 40,
  className,
  style,
}: TextMarqueeProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    const text = textRef.current;
    if (!text) return;

    const check = () => setTextWidth(text.scrollWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(text);
    return () => ro.disconnect();
  }, [children]);

  const isActive = textWidth > maxWidth;
  const cycleWidth = textWidth + GAP;
  const duration = cycleWidth / speed;
  const offset = direction === "left" ? -cycleWidth : cycleWidth;

  return (
    <div
      className={cn([styles.container, className])}
      style={{ maxWidth, ...style }}
    >
      <Text
        className={cn([styles.track, isActive && styles.active])}
        style={
          isActive
            ? ({
                "--marquee-offset": `${offset}px`,
                "--marquee-duration": `${duration}s`,
                gap: `${GAP}px`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <span ref={textRef}>{children}</span>
        {isActive && <span aria-hidden="true">{children}</span>}
      </Text>
    </div>
  );
}
