import { Box, CatCharacter } from "@/features/common";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { catInfoOptions } from "../services/cat-info";
import styles from "./character-box.module.css";

export function CharacterBox({ catId }: { catId: string }) {
  const [tagToggled, setTagToggled] = useState<boolean>(false);
  const { data: cat } = useQuery(catInfoOptions(catId));

  return (
    <div className={styles.container}>
      <Box rounded onClick={() => setTagToggled((prev) => !prev)}>
        <CatCharacter
          age={cat?.stat.growth.ageGroup}
          tag={tagToggled ? "walk" : "default"}
        />
      </Box>
    </div>
  );
}
