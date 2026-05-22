import { InfoTable, Text } from "@/features/common";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { formatAge } from "../lib/format-age";
import { catInfoOptions } from "../services/cat-info";

export function StatInfoTable({ catId }: { catId: string }) {
  const { data: cat } = useQuery(catInfoOptions(catId));

  const age = useMemo(
    () =>
      cat
        ? formatAge(cat.stat.growth.age, cat.stat.growth.ageGroup)
        : undefined,
    [cat],
  );

  return (
    <InfoTable>
      <tbody>
        <tr>
          <th align="left">
            <Text>🌱 GROWTH</Text>
          </th>
          <td align="right">
            <Text>{cat?.stat.growth.value}</Text>
          </td>
        </tr>
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
      </tbody>
    </InfoTable>
  );
}
