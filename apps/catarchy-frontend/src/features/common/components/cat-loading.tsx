import { CatCharacter } from "./cat-character";
import { Text } from "./text";
import { AgeGroup } from "@catarchy/shared/constants/cat";
import styles from "./cat-loading.module.css";

export function CatLoading() {
  return (
    <div className={styles.container}>
      <CatCharacter age={AgeGroup.ADULT} tag="walk" />
      <Text>Loading...</Text>
    </div>
  );
}
