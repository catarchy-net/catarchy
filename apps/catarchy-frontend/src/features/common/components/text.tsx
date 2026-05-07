import React from "react";
import { cn } from "../lib/cn";
import styles from "./text.module.css";

export type TextTag =
  | "i"
  | "em"
  | "s"
  | "label"
  | "p"
  | "span"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";

export type TextProps<T extends TextTag = "span"> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
    boxTrim?: boolean;
  };

export const Text = React.forwardRef(
  <T extends TextTag = "span">(
    { as, className, style, boxTrim, ...props }: TextProps<T>,
    ref: React.ForwardedRef<React.ComponentRef<T>>,
  ) => {
    const Tag = (as ?? "span") as React.ElementType;

    return (
      <Tag
        className={cn([
          styles.root,
          boxTrim && (as ?? "span") !== "span" && "text-box-trim",
          className,
        ])}
        style={style}
        {...props}
        ref={ref}
      />
    );
  },
);
