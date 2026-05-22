import { LogClick } from "@/features/analytics";
import { catInfoOptions } from "@/features/cat";
import {
  Button,
  CAT_CHARACTER_HITBOX,
  CatCharacter,
  Text,
  useToast,
} from "@/features/common";
import { AgeGroup } from "@catarchy/shared/constants/cat";
import { useQuery } from "@tanstack/react-query";
import { EmotionStatus } from "./emotion-status";
import styles from "./interface.module.css";
import { Stage } from "./stage";

export function Interface({ catId }: { catId: string }) {
  const toast = useToast();
  const { data: catInfo } = useQuery(catInfoOptions(catId));

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.emojiBtn}>
            <EmotionStatus catId={catId} />
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
          CAT_CHARACTER_HITBOX[
            catInfo?.stat.growth.ageGroup ?? AgeGroup.NEWBORN
          ]
        }
        character={({ isMoving, isJumping }) => (
          <CatCharacter
            age={catInfo?.stat.growth.ageGroup}
            tag={isMoving || isJumping ? "walk" : "default"}
          />
        )}
      />
    </div>
  );
}
