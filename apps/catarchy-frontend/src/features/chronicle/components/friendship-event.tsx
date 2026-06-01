import { Box, Text } from "@/features/common";

import { timeAgo } from "../lib/time-ago";
import styles from "./friendship-event.module.css";

interface Props {
  catName: string;
  targetCatName: string;
  createdAt: string | null;
}

export function FriendshipEvent({ catName, targetCatName, createdAt }: Props) {
  return (
    <Box rounded containerClassName={styles.root}>
      <Text as="p">{timeAgo(createdAt)}</Text>
      <Text as="p">{`${catName} and ${targetCatName} are now friends!`}</Text>
    </Box>
  );
}
