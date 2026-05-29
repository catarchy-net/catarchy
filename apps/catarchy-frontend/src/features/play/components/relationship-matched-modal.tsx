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
import { CatRelationshipType } from "@/features/relationship";

import { useFriendMatchPolling } from "../hooks/use-friend-match-polling";
import styles from "./relationship-matched-modal.module.css";

export function RelationshipMatchedModal({
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
      return "is feeling happy";
    } else if (isSad) {
      return "is in a bad mood";
    } else if (isDepressed) {
      return "is in a very bad mood";
    } else {
      return "is in a neutral mood";
    }
  }, [friend]);

  const isCouple = friend?.type === CatRelationshipType.COUPLE;

  const matchText = useMemo(() => {
    if (!friend) {
      return "";
    }

    const isMale = friend.catSex === CatSex.MALE;
    const subject = isMale ? "he" : "she";
    const possessive = isMale ? "His" : "Her";
    const relation = isCouple
      ? isMale
        ? "boyfriend"
        : "girlfriend"
      : "friend";

    const intro = `${catInfo?.name} has a new ${relation}! \n${possessive} name is ${friend.catName} and ${subject} is ${ageText}. \nRight now your ${relation} ${emotionText}.`;

    if (isCouple) {
      return `${intro} \nCongratulations on the new romance! May the two of you be happy together! 💕`;
    }

    return intro;
  }, [friend, isCouple, catInfo?.name, ageText, emotionText]);

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

            <StreamText className={styles.reportText} text={matchText} />
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
