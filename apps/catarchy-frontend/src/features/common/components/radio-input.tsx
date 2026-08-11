import React from "react";

import RadioSymbol from "../assets/radio-symbol.svg?react";
import { cn } from "../lib/cn";
import styles from "./radio-input.module.css";
import { Text } from "./text";

export interface RadioInputProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "children"
> {
  label?: React.ReactNode;
  checkedIndicator?: React.ReactNode;
  uncheckedIndicator?: React.ReactNode;
  indicatorClassName?: string;
}

export const RadioInput = React.forwardRef<HTMLInputElement, RadioInputProps>(
  (
    {
      id,
      className,
      disabled = false,
      label,
      checkedIndicator,
      uncheckedIndicator,
      indicatorClassName,
      "aria-label": ariaLabel,
      name,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const inputRef = React.useRef<HTMLInputElement>(null);

    const fallbackAriaLabel =
      typeof name === "string" && name.length > 0
        ? `${name} option`
        : "Radio option";
    const onState = checkedIndicator ?? (
      <RadioSymbol style={{ color: "var(--color-int)" }} />
    );
    const offState = uncheckedIndicator ?? (
      <RadioSymbol style={{ color: "var(--color-paper)" }} />
    );

    const setInputRefs = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === "function") {
        ref(node);
        return;
      }
      if (ref) ref.current = node;
    };

    const handleIndicatorClick = () => {
      if (disabled) return;
      inputRef.current?.click();
    };

    return (
      <div
        className={cn(
          styles.root,
          disabled ? styles.disabled : styles.cursorDefault,
          className,
        )}
      >
        <input
          id={inputId}
          ref={setInputRefs}
          type="radio"
          name={name}
          disabled={disabled}
          aria-label={ariaLabel ?? (label ? undefined : fallbackAriaLabel)}
          className={styles.input}
          {...props}
        />

        <span
          onClick={handleIndicatorClick}
          aria-hidden="true"
          className={cn(
            styles.indicator,
            !disabled && styles.clickable,
            indicatorClassName,
          )}
        >
          <span className={styles.off}>{offState}</span>
          <span className={styles.on}>{onState}</span>
        </span>

        {label != null && (
          <Text as="label" htmlFor={inputId} className={styles.labelText}>
            {label}
          </Text>
        )}
      </div>
    );
  },
);

RadioInput.displayName = "RadioInput";
