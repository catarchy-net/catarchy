import { CatCharacter, cn, InfoTable, Text } from "@/features/common";

import { formatAge } from "../lib/format-age";
import { getCareRecords } from "../services/care-record";
import styles from "./care-history-item.module.css";

type CareRecord = NonNullable<
  Awaited<ReturnType<typeof getCareRecords>>
>["items"][number];

export function CareHistoryItem({ record }: { record: CareRecord }) {
  return (
    <InfoTable containerClassName={styles.table}>
      <tbody>
        <tr>
          <td colSpan={3}>
            {record?.caredAt
              ? new Date(record.caredAt).toLocaleString()
              : "Unknown Date"}
          </td>
        </tr>
        <tr>
          <td rowSpan={2} className={cn(styles.characterCell, "bg-dither-1")}>
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
                      denominator: record.growth.age.fraction.denominator,
                    },
                  })}`
                : formatAge({
                    int: record.growth.delta,
                    fraction: {
                      numerator: 0,
                      denominator: record.growth.age.fraction.denominator,
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
    </InfoTable>
  );
}
