import React from "react";
import { cn } from "../lib/cn";
import { Box, type BoxProps } from "./box";
import styles from "./info-table.module.css";

export type InfoTableProps = Omit<
  BoxProps<"table">,
  "as" | "rounded" | "tight"
> & {
  children?: React.ReactNode;
};

export function InfoTable({ children, className, ...rest }: InfoTableProps) {
  return (
    <Box
      as="table"
      rounded
      tight
      className={cn(styles.table, className)}
      containerClassName={cn(styles.container)}
      {...rest}
    >
      {children}
    </Box>
  );
}
