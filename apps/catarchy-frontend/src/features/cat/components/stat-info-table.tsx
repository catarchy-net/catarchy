import { CatSex } from "@catarchy/shared/constants/cat";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import {
  BubbleHintToggle,
  CatCharacter,
  InfoTable,
  Text,
  TextMarquee,
} from "@/features/common";
import { currentRelationshipOptions } from "@/features/relationship";

import { formatAge } from "../lib/format-age";
import { catInfoOptions } from "../services/cat-info";
import styles from "./stat-info-table.module.css";

export function StatInfoTable({ catId }: { catId: string }) {
  const { data: cat } = useQuery(catInfoOptions(catId));
  const { data: relationship } = useQuery(
    currentRelationshipOptions({ catId }),
  );

  const haveNoFriends = relationship?.friendCount === 0;

  const age = useMemo(
    () =>
      cat
        ? formatAge(cat.stat.growth.age, cat.stat.growth.ageGroup)
        : undefined,
    [cat],
  );

  const coupleTitle = useMemo(() => {
    if (relationship?.couple?.catSex === CatSex.FEMALE) {
      return "GIRLFRIEND";
    }

    return "BOYFRIEND";
  }, [relationship]);

  const hasMoreThanThreeFriends = relationship
    ? relationship.friendCount > 3
    : false;

  return (
    <InfoTable>
      <tbody>
        <tr>
          <th align="left">
            <Text>🎂 AGE</Text>
          </th>
          <td align="right">
            <Text>{age}</Text>
          </td>
        </tr>
        <tr>
          <th align="left">
            <Text>{cat?.stat.emotion.emoji} MOOD</Text>
          </th>
          <td align="right">
            <Text>{cat?.stat.emotion.level.toUpperCase()}</Text>
          </td>
        </tr>
        {relationship?.couple && (
          <tr>
            <th align="left" className={styles.verticalTop}>
              <Text>❤︎⁠ {coupleTitle}</Text>
            </th>
            <td align="right">
              <BubbleHintToggle
                hint={`Since ${
                  relationship.couple?.updatedAt
                    ? new Date(
                        relationship.couple.updatedAt,
                      ).toLocaleDateString()
                    : "-"
                }`}
                disabled={!relationship.couple?.updatedAt}
                offset={16}
              >
                {({ ref, onClick }) => (
                  <div
                    className={styles.catInfoItem}
                    ref={ref as React.RefObject<HTMLDivElement>}
                    onClick={onClick}
                  >
                    <div className={styles.catIcon}>
                      <CatCharacter
                        age={relationship.couple?.growth.ageGroup}
                        scale={1}
                        clip
                      />
                    </div>
                    <TextMarquee maxWidth={180}>
                      {relationship?.couple?.catName || "No couple"}
                    </TextMarquee>
                  </div>
                )}
              </BubbleHintToggle>
            </td>
          </tr>
        )}
        {!haveNoFriends && (
          <tr>
            <th align="left" className={styles.verticalTop}>
              <Text>🐈 FRIENDS</Text>
            </th>
            <td align="right">
              <div className={styles.friendList}>
                {relationship?.friends.map((friend) => (
                  <div key={friend.catId} className={styles.catInfoItem}>
                    <div className={styles.catIcon}>
                      <CatCharacter
                        age={friend.growth.ageGroup}
                        scale={1}
                        clip
                      />
                    </div>
                    <TextMarquee maxWidth={180}>{friend.catName}</TextMarquee>
                  </div>
                ))}
                {!haveNoFriends && !hasMoreThanThreeFriends && (
                  <Link
                    to={"/$catId/cat/friend"}
                    params={{
                      catId,
                    }}
                    className={styles.moreFriends}
                  >
                    <Text>+ {relationship!.friendCount - 3} more friends</Text>
                  </Link>
                )}
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </InfoTable>
  );
}
