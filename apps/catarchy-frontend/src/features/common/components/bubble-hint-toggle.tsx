import { useRef, useState } from "react";
import { BubbleHint, type BubbleHintProps } from "./bubble-hint";

interface BubbleHintToggleProps extends Omit<
  BubbleHintProps,
  "targetRef" | "children"
> {
  hint: React.ReactNode;
  duration?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (props: {
    ref: React.RefObject<any>;
    onClick: () => void;
  }) => React.ReactNode;
}

export function BubbleHintToggle({
  hint,
  duration = 2000,
  children,
  ...bubbleProps
}: BubbleHintToggleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleToggle = () => {
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
          {hint}
        </BubbleHint>
      )}
      {children({ ref: targetRef, onClick: handleToggle })}
    </>
  );
}
