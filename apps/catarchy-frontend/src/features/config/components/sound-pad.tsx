import { useState } from "react";

import { Button } from "@/features/common";

import styles from "./sound-pad.module.css";

export function SoundPad() {
  const [pressedCount, setPressedCount] = useState(0);
  return (
    <Button
      size="small"
      variant="outline"
      className={styles.soundPad}
      onClick={() => setPressedCount((c) => c + 1)}
    >
      {pressedCount % 2 === 0 ? "🎵" : "🎶"}
    </Button>
  );
}
