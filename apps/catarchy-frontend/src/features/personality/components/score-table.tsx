import { InfoTable, Text } from "@/features/common";
import { useQuery } from "@tanstack/react-query";
import { getCatPersonalityOptions } from "../services/personality";

import styles from "./score-table.module.css";

export function ScoreTable({ catId }: { catId: string }) {
  const { data, status: infoStatus } = useQuery(
    getCatPersonalityOptions({ catId }),
  );

  const isLoading = infoStatus === "pending";

  const formatscore = (score?: number | null) => {
    if (isLoading) return "Loading...";
    if (score == null) return "??????????";
    return "█".repeat(score) + "▒".repeat(10 - score) + ` ${score}/10`;
  };

  return (
    <InfoTable className={styles.table}>
      <tbody>
        <tr>
          <th align="left">
            <Text>Openness</Text>
          </th>
          <td align="right">{formatscore(data?.openness)}</td>
        </tr>
        <tr>
          <th align="left">
            <Text>Conscientiousness</Text>
          </th>
          <td align="right">{formatscore(data?.conscientiousness)}</td>
        </tr>
        <tr>
          <th align="left">
            <Text>Extraversion</Text>
          </th>
          <td align="right">{formatscore(data?.extraversion)}</td>
        </tr>
        <tr>
          <th align="left">
            <Text>Agreeableness</Text>
          </th>
          <td align="right">{formatscore(data?.agreeableness)}</td>
        </tr>
        <tr>
          <th align="left">
            <Text>Neuroticism</Text>
          </th>
          <td align="right">{formatscore(data?.neuroticism)}</td>
        </tr>
      </tbody>
    </InfoTable>
  );
}
