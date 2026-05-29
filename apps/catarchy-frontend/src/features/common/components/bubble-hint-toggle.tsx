import { useRef, useState } from "react";

import { BubbleHint, type BubbleHintProps } from "./bubble-hint";
import { Text } from "./text";

interface BubbleHintToggleProps extends Omit<
  BubbleHintProps,
  "targetRef" | "children"
> {
  hint: React.ReactNode;
  duration?: number;

  children: (props: {
    ref: React.RefObject<HTMLElement | null>;
    onClick: () => void;
  }) => React.ReactNode;
  disabled?: boolean;
}

export function BubbleHintToggle({
  hint,
  duration = 3000,
  children,
  disabled,
  ...bubbleProps
}: BubbleHintToggleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleToggle = () => {
    if (disabled) return;

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setIsVisible(!isVisible);
    timeoutRef.current = !isVisible
      ? window.setTimeout(() => setIsVisible(false), duration)
      : null;
  };

  return (
    <>
      {isVisible && (
        <BubbleHint targetRef={targetRef} {...bubbleProps}>
          {typeof hint === "string" ? <Text>{hint}</Text> : hint}
        </BubbleHint>
      )}
      {children({ ref: targetRef, onClick: handleToggle })}
    </>
  );
}
