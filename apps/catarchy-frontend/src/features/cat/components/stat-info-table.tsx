import { Box, Text } from "@/features/common";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { formatAge } from "../lib/format-age";
import { catInfoOptions } from "../services/cat-info";
import styles from "./stat-info-table.module.css";

export function StatInfoTable() {
  const { data, status } = useQuery(catInfoOptions());

  const age = useMemo(() => {
    if (status === "pending") return "Loading...";
    if (status === "error") return "!Error";

    const ageData = data?.stat.growth.age ?? { int: 0, fraction: { numerator: 0, denominator: 12 } };
    return formatAge(ageData, data?.stat.growth.ageGroup);
  }, [data, status]);

  return (
    <Box as="table" rounded tight className={styles.table}>
      <tbody>
        <tr>
          <th align="left">
            <Text>🌱 GROWTH</Text>
          </th>
          <td align="right">{data?.stat.growth.value}</td>
        </tr>
        <tr>
          <th align="left">
            <Text>🎂 AGE</Text>
          </th>
          <td align="right">{age}</td>
        </tr>
        <tr>
          <th align="left">
            <Text>{data?.stat.emotion.emoji} MOOD</Text>
          </th>
          <td align="right">{data?.stat.emotion.level.toUpperCase()}</td>
        </tr>
      </tbody>
    </Box>
  );
}
