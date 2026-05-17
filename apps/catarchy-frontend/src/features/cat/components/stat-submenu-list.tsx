import { Button, ChevronRight, Text } from "@/features/common";

import { Link } from "@tanstack/react-router";
import styles from "./stat-submenu-list.module.css";

export function StatSubmenuList() {
  return (
    <menu className={styles.menuList}>
      <li>
        <Link to="/cat/care-history">
          <Button variant="outline">
            <div className={styles.menuItem}>
              <Text>Care History</Text>
              <ChevronRight />
            </div>
          </Button>
        </Link>
      </li>
      <li>
        <Button variant="outline" className={styles.menuItem} disabled>
          <div className={styles.menuItem}>
            <Text>Personality</Text>
            <ChevronRight />
          </div>
        </Button>
      </li>
    </menu>
  );
}
