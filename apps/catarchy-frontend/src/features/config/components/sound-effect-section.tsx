import { Box, SelectBox, Text, useSoundEffect } from "@/features/common";

import styles from "./sound-effect-section.module.css";
import { SoundPad } from "./sound-pad";

export function SoundEffectSection() {
  const { soundEffect, setSoundEffect, isSegmented, play } = useSoundEffect();

  return (
    <Box
      className={styles.box}
      containerClassName={styles.boxContainer}
      rounded
    >
      <Text as="p">Button Sound</Text>
      <Text as="p" className={styles.description}>
        Select the audio to play when the button is pressed
      </Text>
      <div className={styles.selectContainer}>
        <SelectBox
          className={styles.select}
          value={soundEffect}
          onChange={(opt) => {
            setSoundEffect(opt.value);
            play(opt.value);
          }}
          options={[
            { label: "None", value: "none" },
            { label: "Meow", value: "meow" },
            { label: "Meow 2", value: "meow2" },
            { label: "Meow 3", value: "meow3" },
            { label: "Meowrgh", value: "meowrgh" },
            { label: "Vine boom", value: "vine-boom" },
            { label: "Oiia", value: "oiia" },
          ]}
        />
        {isSegmented && <SoundPad />}
      </div>
    </Box>
  );
}
