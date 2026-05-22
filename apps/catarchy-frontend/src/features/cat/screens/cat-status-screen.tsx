import { cn, HeaderBackButton, Scaffold } from "@/features/common";
import { CatName } from "../components/cat-name";
import { CharacterBox } from "../components/character-box";
import { StatInfoTable } from "../components/stat-info-table";
import { StatSubmenuList } from "../components/stat-submenu-list";
import styles from "./cat-status-screen.module.css";

export function CatStatusScreen({ catId }: { catId: string }) {
  return (
    <Scaffold>
      <Scaffold.Header title="Status" left={<HeaderBackButton />} />
      <Scaffold.Body className={cn("bg-pattern-cat", styles.body)}>
        <CharacterBox catId={catId} />
        <CatName catId={catId} className={styles.name} />
        <StatInfoTable catId={catId} />
        <StatSubmenuList catId={catId} />
      </Scaffold.Body>
    </Scaffold>
  );
}
