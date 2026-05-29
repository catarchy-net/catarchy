import { CatSex, EmotionLevel } from "@catarchy/shared/constants/cat";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { catInfoOptions } from "@/features/cat";
import {
  Button,
  CatCharacter,
  CatLoading,
  StreamText,
  Text,
} from "@/features/common";

import { useFriendMatchPolling } from "../hooks/use-friend-match-polling";
import styles from "./friend-matched-modal.module.css";

export function FriendMatchedModal({
  catId,
  startedAt,
  closeText,
  onClose,
}: {
  catId: string;
  startedAt: number;
  closeText?: string;
  onClose?: () => void;
}) {
  const { data: catInfo } = useQuery(catInfoOptions(catId));
  const { friend, settled } = useFriendMatchPolling({
    catId,
    enabled: true,
    startedAt,
  });

  const ageText = useMemo(() => {
    if (!friend) {
      return "";
    }

    const { ageGroup, age } = friend.growth;
    const ageInt = age.int;

    if (ageInt >= 1) {
      return `${ageInt} year${ageInt > 1 ? "s" : ""} old ${ageGroup.toLowerCase()}`;
    } else {
      const ageMonth = age.fraction.numerator;
      return `${ageMonth} month${ageMonth > 1 ? "s" : ""} old ${ageGroup.toLowerCase()}`;
    }
  }, [friend]);

  const emotionText = useMemo(() => {
    if (!friend) {
      return "";
    }

    const isHappy = friend.emotion.level === EmotionLevel.Happy;
    const isSad = friend.emotion.level === EmotionLevel.Down;
    const isDepressed = friend.emotion.level === EmotionLevel.Depressed;

    if (isHappy) {
      return `${friend.catSex === CatSex.MALE ? "He" : "She"} is happy!`;
    } else if (isSad) {
      return `${friend.catSex === CatSex.MALE ? "He" : "She"} is in a bad mood`;
    } else if (isDepressed) {
      return `${friend.catSex === CatSex.MALE ? "He" : "She"} is in a very bad mood... I hope ${friend.catSex === CatSex.MALE ? "he" : "she"} feels better soon!`;
    } else {
      return `${friend.catSex === CatSex.MALE ? "He" : "She"} is in a neutral mood`;
    }
  }, [friend]);

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        {!settled ? (
          <CatLoading
            loadingText={`Finding a friend \nbased on ${catInfo?.name} personality...`}
          />
        ) : friend ? (
          <>
            <div className={styles.character}>
              <CatCharacter age={friend.growth.ageGroup} clip />
            </div>

            <StreamText
              className={styles.reportText}
              text={`A new friend has appeared nearby! \n${friend.catSex === CatSex.MALE ? "His" : "Her"} name is ${friend.catName} and ${friend.catSex === CatSex.MALE ? "he" : "she"} is ${ageText}. ${emotionText}`}
            />
          </>
        ) : (
          <Text as="p" className={styles.noMatchText}>
            There's no one matched right now... <br />
            Try next time!
          </Text>
        )}
      </div>
      <div className={styles.footer}>
        <Button variant="secondary" disabled={!settled} onClick={onClose}>
          {closeText || "Close"}
        </Button>
      </div>
    </div>
  );
}
