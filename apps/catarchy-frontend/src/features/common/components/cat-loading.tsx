import { AgeGroup } from "@catarchy/shared/constants/cat";

import { CatCharacter } from "./cat-character";
import styles from "./cat-loading.module.css";
import { Text } from "./text";

export function CatLoading({
  loadingText = "Loading...",
}: {
  loadingText?: string;
}) {
  return (
    <div className={styles.container}>
      <CatCharacter age={AgeGroup.ADULT} tag="walk" />
      <Text className={styles.loadingText}>{loadingText}</Text>
    </div>
  );
}
