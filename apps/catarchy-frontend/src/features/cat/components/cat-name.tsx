import { CatSex } from "@catarchy/shared/constants/cat";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { cn, Text } from "@/features/common";

import { catInfoOptions } from "../services/cat-info";
import styles from "./cat-name.module.css";

export function CatName({
  catId,
  className,
}: {
  catId: string;
  className?: string;
}) {
  const { data: cat } = useQuery(catInfoOptions(catId));

  const sex = useMemo(() => {
    if (cat?.sex === CatSex.MALE) return "♂";
    return "♀";
  }, [cat?.sex]);

  return (
    <Text className={cn(styles.name, className)}>
      {cat?.name} {sex}
    </Text>
  );
}
