import { catInfoOptions } from "@/features/cat";
import { BubbleHint } from "@/features/common";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import styles from "./emotion-status.module.css";

export function EmotionStatus() {
  const { data: catInfo } = useQuery(catInfoOptions());

  const [isBubbleVisible, setIsBubbleVisible] = useState<boolean>(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeOutRef = useRef<number | null>(null);

  const handleToggleBubble = () => {
    setIsBubbleVisible(true);

    if (timeOutRef.current) {
      window.clearTimeout(timeOutRef.current);
    }

    timeOutRef.current = window.setTimeout(() => {
      setIsBubbleVisible(false);
    }, 2000);
  };

  return (
    <div className={styles.container}>
      {isBubbleVisible && (
        <BubbleHint
          targetRef={buttonRef}
          preferredSide="top"
          offset={8}
          background="black"
        >
          {catInfo?.stat.emotion.level}
        </BubbleHint>
      )}
      <button
        className={styles.button}
        ref={buttonRef}
        onClick={handleToggleBubble}
      >
        {catInfo?.stat.emotion.emoji}
      </button>
    </div>
  );
}
