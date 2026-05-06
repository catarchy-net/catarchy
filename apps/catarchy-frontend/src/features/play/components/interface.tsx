import { LogClick } from "@/features/analytics";
import { Button, Text, useToast } from "@/features/common";
import { CareCooldown } from "./care-cooldown";
import { EmotionStatus } from "./emotion-status";
import styles from "./interface.module.css";
import { Room } from "./room";

export function Interface() {
  const toast = useToast();
  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.emojiBtn}>
            <EmotionStatus />
          </div>
          <div className="px-2 h-9 border-r flex justify-center items-center">
            <CareCooldown />
          </div>
        </div>
        <LogClick eventName="game_settings">
          <Button
            native
            onClick={() => toast.push("Settings coming soon!")}
            className={styles.settingsBtn}
          >
            <Text>🔧</Text>
          </Button>
        </LogClick>
      </div>
      <Room />
    </div>
  );
}
