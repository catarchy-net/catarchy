import { cn, HeaderBackButton, Scaffold } from "@/features/common";
import { CharacterBox } from "../components/character-box";
import { StatInfoTable } from "../components/stat-info-table";
import { StatSubmenuList } from "../components/stat-submenu-list";
import styles from "./cat-status-screen.module.css";

export function CatStatusScreen() {
  return (
    <Scaffold>
      <Scaffold.Header title="Status" left={<HeaderBackButton />} />
      <Scaffold.Body className={cn("bg-pattern-cat", styles.body)}>
        <CharacterBox />
        <StatInfoTable />
        <StatSubmenuList />
      </Scaffold.Body>
    </Scaffold>
  );
}
