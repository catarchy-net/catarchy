import { cn, Text } from "@/features/common";

import styles from "./chronicle-header.module.css";

export function ChronicleHeader() {
  return (
    <header className={styles.container}>
      <Text as="p" className={cn(styles.text, "font-bold")}>
        Check out what happened <br />
        in this Catarchy world
      </Text>
    </header>
  );
}
