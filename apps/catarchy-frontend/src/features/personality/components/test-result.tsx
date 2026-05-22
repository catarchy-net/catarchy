import { CharacterBox } from "@/features/cat";
import { ScoreTable } from "./score-table";
import styles from "./test-result.module.css";

export function TestResult({ catId }: { catId: string }) {
  return (
    <div className={styles.container}>
      <CharacterBox catId={catId} />
      <ScoreTable catId={catId} />
    </div>
  );
}
