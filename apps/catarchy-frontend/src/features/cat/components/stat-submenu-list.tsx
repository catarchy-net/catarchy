import { Button, ChevronRight, Text } from "@/features/common";

import { Link } from "@tanstack/react-router";
import styles from "./stat-submenu-list.module.css";

export function StatSubmenuList({ catId }: { catId: string }) {
  return (
    <menu className={styles.menuList}>
      <li>
        <Link to="/$catId/cat/care-history" params={{ catId }}>
          <Button variant="outline">
            <div className={styles.menuItem}>
              <Text>Care History</Text>
              <ChevronRight />
            </div>
          </Button>
        </Link>
      </li>
      <li>
        <Link to="/$catId/cat/personality" params={{ catId }}>
          <Button variant="outline" className={styles.menuItem}>
            <div className={styles.menuItem}>
              <Text>Personality</Text>
              <ChevronRight />
            </div>
          </Button>
        </Link>
      </li>
    </menu>
  );
}
