import styles from "./stream-text.module.css";
import { Text, TextProps, TextTag } from "./text";

type StreamTextProps<T extends TextTag = "span"> = Omit<
  TextProps<T>,
  "children" | "onAnimationEnd"
> & {
  text: string;
  onStreamEnd?: () => void;
  characterDelay?: number;
  characterDuration?: number;
  randomizeDelay?: boolean;
};

export function StreamText<T extends TextTag = "span">({
  text,
  onStreamEnd,
  characterDelay = 50,
  characterDuration = 50,
  ...textProps
}: StreamTextProps<T>) {
  const splitted = text.split("").map((char, index) => {
    return char === "\n" ? (
      <br
        key={index}
        onAnimationEnd={(e) => {
          if (e.currentTarget.nextSibling === null) {
            onStreamEnd?.();
          }
        }}
        style={
          {
            "--delay": `${characterDelay * index * 0.001}s`,
            "--duration": `${characterDuration * 0.001}s`,
          } as React.CSSProperties
        }
        className={styles.character}
      />
    ) : (
      <span
        key={index}
        onAnimationEnd={(e) => {
          if (e.currentTarget.nextSibling === null) {
            onStreamEnd?.();
          }
        }}
        className={styles.character}
        style={
          {
            "--duration": `${characterDuration * 0.001}s`,
            "--delay": `${characterDelay * index * 0.001}s`,
          } as React.CSSProperties
        }
      >
        {char}
      </span>
    );
  });

  return <Text {...(textProps as TextProps<T>)}>{splitted}</Text>;
}
