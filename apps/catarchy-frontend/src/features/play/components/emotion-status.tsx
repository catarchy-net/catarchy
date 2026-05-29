import { useQuery } from "@tanstack/react-query";

import { catInfoOptions } from "@/features/cat";
import { BubbleHintToggle, Button } from "@/features/common";

import styles from "./emotion-status.module.css";

export function EmotionStatus({ catId }: { catId: string }) {
  const { data: catInfo } = useQuery(catInfoOptions(catId));

  return (
    <div className={styles.container}>
      <BubbleHintToggle
        hint={catInfo?.stat.emotion.level}
        preferredSide="top"
        offset={8}
        background="black"
      >
        {({ ref, onClick }) => (
          <Button
            native
            className={styles.button}
            ref={ref as React.Ref<HTMLButtonElement>}
            onClick={onClick}
          >
            {catInfo?.stat.emotion.emoji}
          </Button>
        )}
      </BubbleHintToggle>
    </div>
  );
}
