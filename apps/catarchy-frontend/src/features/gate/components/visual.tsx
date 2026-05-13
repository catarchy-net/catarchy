import { CatCharacter, cn } from "@/features/common";
import { AgeGroup } from "@catarchy/shared/constants/cat";
import Background from "../assets/gate-background.png";
import styles from "./visual.module.css";

export function Visual() {
  return (
    <div>
      <div className={styles.container}>
        <img
          src={Background}
          alt="Gate Background"
          width={1024}
          height={258}
          className={cn(styles.background, styles.first)}
        />
        <img
          src={Background}
          alt="Gate Background"
          width={1024}
          height={258}
          className={cn(styles.background, styles.second)}
        />
        <div className={styles.catChar}>
          <CatCharacter tag="walk" age={AgeGroup.ADULT} />
        </div>
      </div>
    </div>
  );
}
