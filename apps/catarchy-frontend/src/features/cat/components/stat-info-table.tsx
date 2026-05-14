import { Box, Text } from "@/features/common";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { catInfoOptions } from "../services/cat-info";
import styles from "./stat-info-table.module.css";

const SUPERSCRIPT = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
const SUBSCRIPT = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
const toSuper = (n: number) =>
  String(n)
    .split("")
    .map((d) => SUPERSCRIPT[+d])
    .join("");
const toSub = (n: number) =>
  String(n)
    .split("")
    .map((d) => SUBSCRIPT[+d])
    .join("");

export function StatInfoTable() {
  const { data, status } = useQuery(catInfoOptions());

  const age = useMemo(() => {
    if (status === "pending") return "Loading...";
    if (status === "error") return "!Error";

    const { int, fraction } = data?.stat.growth.age ?? {
      int: 0,
      fraction: { numerator: 0, denominator: 12 },
    };
    if (fraction.numerator === 0) return `${int}`;
    return `${int ? int + " " : ""}${toSuper(fraction.numerator)}⁄${toSub(fraction.denominator)} (${data?.stat.growth.ageGroup})`;
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
