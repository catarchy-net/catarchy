import { forwardRef } from "react";

import { useKeyboard } from "../hooks/use-keyboard";
import { cn } from "../lib/cn";
import styles from "./layout.module.css";
import { Text } from "./text";

interface ScaffoldRootProps {
  children?: React.ReactNode;
  avoidKeyboard?: boolean;
  className?: string;
}

const ScaffoldRoot = forwardRef<HTMLDivElement, ScaffoldRootProps>(
  ({ children, avoidKeyboard = false, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(styles.root, className)}
        style={{
          height: avoidKeyboard ? "var(--viewport-height, 100dvh)" : "100dvh",
        }}
      >
        {children}
      </div>
    );
  },
);

interface ScaffoldHeaderProps {
  title?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

function ScaffoldHeader({
  title,
  left,
  right,
  className,
}: ScaffoldHeaderProps) {
  const isTitleString = typeof title === "string";

  return (
    <header className={cn(styles.header, className)}>
      <div className={styles.headerIcon}>{left}</div>

      {title &&
        (isTitleString ? (
          <Text as="h1" className={styles.headerTitle}>
            {title}
          </Text>
        ) : (
          <div className={styles.headerTitle}>{title}</div>
        ))}

      <div className={styles.headerIcon}>{right}</div>
    </header>
  );
}

function ScaffoldBody({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <div className={cn(styles.body, className)}>{children}</div>;
}

function ScaffoldBottom({
  sticky,
  children,
  className,
}: {
  sticky?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  const keyboard = useKeyboard();

  return (
    <div
      className={cn(
        sticky && styles.bottom,
        !keyboard.isOpen && "pb-safe",
        className,
      )}
    >
      <div className={styles.bottomInner}>{children}</div>
    </div>
  );
}

export const Scaffold = Object.assign(ScaffoldRoot, {
  Header: ScaffoldHeader,
  Body: ScaffoldBody,
  Bottom: ScaffoldBottom,
});
