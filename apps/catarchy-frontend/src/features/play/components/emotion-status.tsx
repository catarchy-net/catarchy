import { catInfoOptions } from "@/features/cat";
import { BubbleHintToggle } from "@/features/common";
import { useQuery } from "@tanstack/react-query";
import styles from "./emotion-status.module.css";

export function EmotionStatus() {
  const { data: catInfo } = useQuery(catInfoOptions());

  return (
    <div className={styles.container}>
      <BubbleHintToggle
        hint={catInfo?.stat.emotion.level}
        preferredSide="top"
        offset={8}
        background="black"
      >
        {({ ref, onClick }) => (
          <button className={styles.button} ref={ref} onClick={onClick}>
            {catInfo?.stat.emotion.emoji}
          </button>
        )}
      </BubbleHintToggle>
    </div>
  );
}
