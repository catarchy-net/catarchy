import { Box, Button, CatCharacter, cn, Text } from "@/features/common";
import { AgeGroup } from "@catarchy/shared/constants/cat";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { formatAge } from "../lib/format-age";
import { careRecordsOptions } from "../services/care-record";
import styles from "./care-history-list.module.css";
import { CharacterBox } from "./character-box";

export function CareHistoryList({ catId }: { catId: string }) {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    ...careRecordsOptions({
      catId,
      limit: 5,
    }),
    enabled: Boolean(catId),
  });

  const hasNoRecords = data?.pages[0]?.items.length === 0;

  return (
    <div className={styles.container}>
      <div className={cn([styles.list, hasNoRecords && styles.emptyList])}>
        {hasNoRecords && (
          <div className={styles.empty}>
            <CharacterBox />
            <Text as="p" className={styles.emptyText}>
              Your cat need attention to grow healthy and happy
            </Text>
            <Link to="/play">
              <Button variant="outline">Take Care of Your Cat</Button>
            </Link>
          </div>
        )}
        {data?.pages.map((page) =>
          page?.items.map((record) => (
            <Box
              as="table"
              rounded
              key={record.id}
              containerClassName={styles.table}
            >
              <tbody>
                <tr>
                  <td colSpan={3}>
                    {record?.caredAt
                      ? new Date(record.caredAt).toLocaleString()
                      : "Unknown Date"}
                  </td>
                </tr>
                <tr>
                  <td
                    rowSpan={2}
                    className={cn(styles.characterCell, "bg-dither-1")}
                  >
                    <CatCharacter age={record.growth.ageGroup} scale={2} />
                  </td>
                  <th align="left">
                    <Text>{record.emotion.emoji} MOOD</Text>
                  </th>
                  <td align="right">{record.emotion.level.toUpperCase()}</td>
                </tr>
                <tr>
                  <th align="left">
                    <Text>🎂 AGE</Text>
                  </th>
                  <td align="right">
                    <Text>
                      {formatAge({
                        int: record.growth.age.int,
                        fraction: record.growth.age.fraction,
                      })}
                    </Text>
                    <Text className={styles.delta}>
                      (
                      {record.growth.delta > 0
                        ? `+ ${formatAge({
                            int: Math.floor(record.growth.delta / 12),
                            fraction: {
                              numerator: record.growth.delta % 12,
                              denominator:
                                record.growth.age.fraction.denominator,
                            },
                          })}`
                        : formatAge({
                            int: record.growth.delta,
                            fraction: {
                              numerator: 0,
                              denominator:
                                record.growth.age.fraction.denominator,
                            },
                          })}
                      )
                    </Text>
                    <br />
                    <Text>{record.growth.ageGroup.toUpperCase()}</Text>
                  </td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    <div className={styles.message}>
                      <Text>{record.message ?? "No message"}</Text>
                    </div>
                  </td>
                </tr>
              </tbody>
            </Box>
          )),
        )}
        {hasNextPage && (
          <div
            id="load-more"
            ref={() => {
              const observer = new IntersectionObserver(async ([entry]) => {
                if (entry.isIntersecting) {
                  await fetchNextPage();
                }
              });

              observer.observe(document.querySelector("#load-more")!);
            }}
            className={styles.loadMore}
          >
            <CatCharacter age={AgeGroup.ADULT} scale={1} tag="walk" />
          </div>
        )}
      </div>
    </div>
  );
}
