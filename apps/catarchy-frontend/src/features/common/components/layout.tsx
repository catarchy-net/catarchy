import { forwardRef } from "react";
import { useKeyboard } from "../hooks/use-keyboard";
import { cn } from "../lib/cn";

interface ScaffoldRootProps {
  children?: React.ReactNode;
  avoidKeyboard?: boolean;
}

const ScaffoldRoot = forwardRef<HTMLDivElement, ScaffoldRootProps>(
  ({ children, avoidKeyboard = false }, ref) => {
    const keyboard = useKeyboard();

    return (
      <div
        ref={ref}
        className="relative mx-auto flex w-(--layout-max-width) flex-col overflow-y-auto overscroll-none bg-white border-x"
        style={{
          height: avoidKeyboard ? keyboard.viewportHeight : "100dvh",
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
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-2 border-b border-black h-12 p-2",
        className,
      )}
    >
      <div className="aspect-square w-8">{left}</div>

      {title && (
        <h1 className="flex flex-1 items-center justify-center text-center">
          {title}
        </h1>
      )}

      <div className={cn("aspect-square w-8")}>{right}</div>
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
  return (
    <div className={cn("flex flex-1 flex-col gap-4", className)}>
      {children}
    </div>
  );
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
        sticky && "sticky bottom-0 bg-white",
        keyboard.isOpen ? "" : "pb-safe",
        className,
      )}
    >
      <div className="px-4 py-2">{children}</div>
    </div>
  );
}

export const Scaffold = Object.assign(ScaffoldRoot, {
  Header: ScaffoldHeader,
  Body: ScaffoldBody,
  Bottom: ScaffoldBottom,
});
