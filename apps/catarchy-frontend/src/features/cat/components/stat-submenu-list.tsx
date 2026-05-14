import { Button, ChevronRight, Text } from "@/features/common";

import styles from "./stat-submenu-list.module.css";

export function StatSubmenuList() {
  return (
    <menu className={styles.menuList}>
      <li>
        <Button variant="outline" disabled>
          <div className={styles.menuItem}>
            <Text>Care Result History</Text>
            <ChevronRight />
          </div>
        </Button>
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
