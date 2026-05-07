import { LogClick } from "@/features/analytics";
import {
  CAT_CHARACTER_HITBOX,
  CatCharacter,
  catInfoOptions,
} from "@/features/cat";
import { Button, Text, useToast } from "@/features/common";
import { AgeGroup } from "@catarchy/shared/constants/cat";
import { useQuery } from "@tanstack/react-query";
import { EmotionStatus } from "./emotion-status";
import styles from "./interface.module.css";
import { Stage } from "./stage";

export function Interface() {
  const toast = useToast();
  const { data: catInfo } = useQuery(catInfoOptions());
  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.emojiBtn}>
            <EmotionStatus />
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
      <Stage
        hitbox={
          CAT_CHARACTER_HITBOX[catInfo?.stat.growth.age ?? AgeGroup.NEWBORN]
        }
        character={({ isMoving, isJumping }) => (
          <CatCharacter
            age={catInfo?.stat.growth.age}
            tag={isMoving || isJumping ? "walk" : "default"}
          />
        )}
      />
    </div>
  );
}
