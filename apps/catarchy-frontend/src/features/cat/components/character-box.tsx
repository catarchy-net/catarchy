import { Box, CatCharacter } from "@/features/common";
import { useQuery } from "@tanstack/react-query";
import { catInfoOptions } from "../services/cat-info";

import { useState } from "react";
import styles from "./character-box.module.css";

export function CharacterBox() {
  const [tagToggled, setTagToggled] = useState<boolean>(false);
  const { data } = useQuery(catInfoOptions());
  return (
    <Box
      rounded
      className={styles.container}
      onClick={() => setTagToggled((prev) => !prev)}
    >
      <CatCharacter
        age={data?.stat.growth.ageGroup}
        tag={tagToggled ? "walk" : "default"}
      />
    </Box>
  );
}
