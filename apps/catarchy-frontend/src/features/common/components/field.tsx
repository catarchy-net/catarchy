import React, { useId } from "react";
import { BubbleHint } from "./bubble-hint";
import styles from "./field.module.css";
import { Label, LabelProps } from "./label";
import { Text } from "./text";

export interface FieldProps {
  label?: React.ReactNode;
  labelProps?: Omit<LabelProps, "htmlFor">;
  required?: boolean;
  error?: string;
  children?: React.ReactNode;
}

export function Field({
  label,
  labelProps,
  required,
  error,
  children,
}: FieldProps) {
  const inputContainerRef = React.useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const errorId = useId();

  let inputId = generatedId;
  const processedChildren = React.Children.map(children, (child, index) => {
    if (index !== 0 || !React.isValidElement(child)) return child;
    const props = child.props as { id?: string };
    if (props.id) inputId = props.id;
    return React.cloneElement(
      child as React.ReactElement<{
        id: string;
        "aria-invalid"?: boolean;
        "aria-describedby"?: string;
      }>,
      {
        id: props.id ?? generatedId,
        "aria-invalid": !!error || undefined,
        "aria-describedby": error ? errorId : undefined,
      },
    );
  });

  return (
    <div className={styles.root}>
      {label && (
        <Label htmlFor={inputId} required={required} {...labelProps}>
          {label}
        </Label>
      )}
      <div ref={inputContainerRef}>{processedChildren}</div>

      {error && (
        <Text id={errorId} role="alert" className="sr-only">
          {error}
        </Text>
      )}

      {error && (
        <BubbleHint
          targetRef={inputContainerRef}
          background="black"
          preferredSide="bottom"
          offset={4}
          className={styles.bubbleHint}
        >
          <Text>⚠ {error}</Text>
        </BubbleHint>
      )}
    </div>
  );
}
