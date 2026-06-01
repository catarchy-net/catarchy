import { Box, Text } from "@/features/common";

import { timeAgo } from "../lib/time-ago";
import styles from "./age-up-event.module.css";

interface Props {
  catName: string;
  age: number;
  createdAt: string | null;
}

export function AgeUpEvent({ catName, age, createdAt }: Props) {
  return (
    <Box rounded containerClassName={styles.root}>
      <Text as="p">{timeAgo(createdAt)}</Text>
      <Text as="p">{`${catName} is now ${age} years old.`}</Text>
    </Box>
  );
}
