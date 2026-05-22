import { catInfoOptions, CharacterBox } from "@/features/cat";
import { Text } from "@/features/common";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPersonalityTestProgressOptions } from "../services/personality";

import styles from "./test-nudge.module.css";

export function TestNudge({ catId }: { catId: string }) {
  const { data: personalityTestData } = useSuspenseQuery(
    getPersonalityTestProgressOptions({ catId }),
  );

  const { data: catInfoData } = useSuspenseQuery(catInfoOptions(catId));

  return (
    <div className={styles.container}>
      <div className={styles.introContainer}>
        <CharacterBox catId={catId} />
        <div className={styles.textContainer}>
          <Text as="p" className={styles.text}>
            Kids usually have the same personality as their parents.
          </Text>
          <Text as="p" className={styles.text}>
            Your personality will be reflected in your cat [{catInfoData?.name}]{" "}
            through a simple test. <br /> <br />
            🐈 🙂
          </Text>

          <Text as="p" className={styles.text}>
            Answer the {personalityTestData?.totalCount} questions and let's
            find out what your personality is like!
          </Text>
        </div>
      </div>
      <Text as="p" className={styles.progressText}>
        You have {personalityTestData?.remainingCount} questions left to answer.
      </Text>
    </div>
  );
}
