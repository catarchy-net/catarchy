import { Link } from "@tanstack/react-router";

import { Button, Text } from "@/features/common";

import styles from "./care-history-empty.module.css";
import { CharacterBox } from "./character-box";

export function CareHistoryEmpty({ catId }: { catId: string }) {
  return (
    <div className={styles.empty}>
      <CharacterBox catId={catId} />
      <Text as="p" className={styles.emptyText}>
        Your cat need attention to grow healthy and happy
      </Text>
      <Link to="/$catId/play" params={{ catId }}>
        <Button variant="outline">Take Care of Your Cat</Button>
      </Link>
    </div>
  );
}
