import React from "react";

import RangeIndicator from "../assets/range-thumb.svg?react";
import { cn } from "../lib/cn";
import styles from "./range-input.module.css";

type BaseRangeInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "onChange"
> & {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onCommit?: (value: number) => void;
};

type RangeInputProps = BaseRangeInputProps &
  (
    | {
        showStep: true;
        hideEdgeStepMarks?: boolean;
      }
    | {
        showStep?: false;
        hideEdgeStepMarks?: never;
      }
  );

export const RangeInput = React.forwardRef<HTMLDivElement, RangeInputProps>(
  (
    {
      className,
      min = 0,
      max = 100,
      step = 1,
      showStep = false,
      hideEdgeStepMarks = false,
      value: controlledValue,
      defaultValue = 0,
      onValueChange,
      onCommit,
      disabled = false,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      name,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = React.useState(controlledValue ?? defaultValue);
    const trackRef = React.useRef<HTMLDivElement>(null);
    const thumbRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);
    const fallbackAriaLabel = name ? `${name} slider` : "Slider";

    const currentValue = controlledValue ?? value;
    const percentage = ((Number(currentValue) - min) / (max - min)) * 100;
    const stepPercentages = React.useMemo(() => {
      if (!showStep || step <= 0 || max <= min) return [];

      const count = Math.floor((max - min) / step);
      const startIndex = hideEdgeStepMarks ? 1 : 0;
      const endIndex = hideEdgeStepMarks ? count - 1 : count;

      if (endIndex < startIndex) return [];

      return Array.from({ length: endIndex - startIndex + 1 }, (_, offset) => {
        const stepValue = min + step * (startIndex + offset);
        return ((stepValue - min) / (max - min)) * 100;
      });
    }, [showStep, step, min, max, hideEdgeStepMarks]);

    const updateValue = React.useCallback(
      (newValue: number) => {
        const clampedValue = Math.min(Math.max(min, newValue), max);
        setValue(clampedValue);
        if (inputRef.current) {
          inputRef.current.value = String(clampedValue);
        }
        onValueChange?.(clampedValue);
      },
      [min, max, onValueChange],
    );

    const handlePointerMove = React.useCallback(
      (e: PointerEvent | TouchEvent) => {
        if (!trackRef.current || disabled) return;

        const rect = trackRef.current.getBoundingClientRect();
        const clientX =
          e instanceof TouchEvent ? (e.touches[0]?.clientX ?? 0) : e.clientX;

        const relativeX = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
        const newValue = min + percentage * (max - min);
        const steppedValue = Math.round(newValue / step) * step;
        updateValue(steppedValue);
      },
      [disabled, min, max, step, updateValue],
    );

    const handlePointerUp = React.useCallback(() => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("touchmove", handlePointerMove);
      document.removeEventListener("touchend", handlePointerUp);
      onCommit?.(currentValue);
    }, [handlePointerMove, onCommit, currentValue]);

    const handlePointerDown = () => {
      if (disabled) return;
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    };

    const handleTouchStart = () => {
      if (disabled) return;
      document.addEventListener("touchmove", handlePointerMove);
      document.addEventListener("touchend", handlePointerUp);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      let newValue = currentValue;
      let changed = false;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
          newValue -= step;
          changed = true;
          e.preventDefault();
          break;
        case "ArrowRight":
        case "ArrowUp":
          newValue += step;
          changed = true;
          e.preventDefault();
          break;
        case "Home":
          newValue = min;
          changed = true;
          e.preventDefault();
          break;
        case "End":
          newValue = max;
          changed = true;
          e.preventDefault();
          break;
        case "PageDown":
          newValue -= step * 5;
          changed = true;
          e.preventDefault();
          break;
        case "PageUp":
          newValue += step * 5;
          changed = true;
          e.preventDefault();
          break;
      }

      if (changed) {
        updateValue(newValue);
      }
    };

    return (
      <div ref={ref} className={cn(styles.container, className)} role="group">
        <input
          ref={inputRef}
          type="range"
          name={name}
          min={min}
          max={max}
          step={step}
          value={currentValue}
          disabled={disabled}
          className={styles.input}
          aria-hidden="true"
          tabIndex={-1}
          {...props}
        />

        <div
          ref={trackRef}
          className={cn(
            styles.track,
            {
              [styles.disabled]: disabled,
              [styles.focused]: isFocused,
            },
            "group",
          )}
          onPointerDown={handlePointerDown}
          onTouchStart={handleTouchStart}
          onClick={(e) => handlePointerMove(e.nativeEvent as PointerEvent)}
          role="slider"
          aria-label={ariaLabel ?? fallbackAriaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-orientation="horizontal"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={currentValue}
          aria-valuetext={String(currentValue)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {showStep && (
            <div className={styles.stepMarks} aria-hidden="true">
              {stepPercentages.map((stepPercentage, index) => (
                <span
                  key={`${index}-${stepPercentage}`}
                  className={styles.stepMark}
                  style={{ left: `${stepPercentage}%` }}
                />
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div
            className={styles.progress}
            style={{ width: `${percentage}%` }}
          />

          {/* Thumb */}
          <div
            ref={thumbRef}
            className={cn(styles.thumb)}
            style={{ left: `${percentage}%` }}
          >
            <RangeIndicator
              className={cn(
                "text-white group-hover:text-gray-100 group-active:text-black",
              )}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    );
  },
);

RangeInput.displayName = "RangeInput";
