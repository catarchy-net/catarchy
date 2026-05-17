import { cn, Text } from "@/features/common";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { CatSex } from "../hooks/use-adopt-form";
import { catInfoOptions } from "../services/cat-info";
import styles from "./cat-name.module.css";

export function CatName({ className }: { className?: string }) {
  const { data } = useQuery(catInfoOptions());

  const sex = useMemo(() => {
    if (data?.sex === CatSex.MALE) return "♂";
    return "♀";
  }, [data?.sex]);

  return (
    <Text className={cn(styles.name, className)}>
      {data?.name} {sex}
    </Text>
  );
}
