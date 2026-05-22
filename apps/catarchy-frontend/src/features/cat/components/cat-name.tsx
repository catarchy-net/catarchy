import { cn, Text } from "@/features/common";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { CatSex } from "../hooks/use-adopt-form";
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
