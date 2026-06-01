import { Box, Text } from "@/features/common";

import { timeAgo } from "../lib/time-ago";
import styles from "./love-event.module.css";

interface Props {
  catName: string;
  targetCatName: string;
  createdAt: string | null;
}

export function LoveEvent({ catName, targetCatName, createdAt }: Props) {
  return (
    <Box rounded containerClassName={styles.root}>
      <Text as="p">{timeAgo(createdAt)}</Text>
      <Text as="p">{`${catName} and ${targetCatName} have become a couple!`}</Text>
    </Box>
  );
}
