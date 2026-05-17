import { Box, CatCharacter } from "@/features/common";
import { useQuery } from "@tanstack/react-query";
import { catInfoOptions } from "../services/cat-info";

import { useMemo, useState } from "react";
import { CatSex } from "../hooks/use-adopt-form";
import styles from "./character-box.module.css";

export function CharacterBox() {
  const [tagToggled, setTagToggled] = useState<boolean>(false);
  const { data } = useQuery(catInfoOptions());

  const sex = useMemo(() => {
    if (data?.sex === CatSex.MALE) {
      return "♂";
    } else return "♀";
  }, [data?.sex]);
  return (
    <div className={styles.container}>
      <Box rounded onClick={() => setTagToggled((prev) => !prev)}>
        <CatCharacter
          age={data?.stat.growth.ageGroup}
          tag={tagToggled ? "walk" : "default"}
        />
      </Box>
    </div>
  );
}
