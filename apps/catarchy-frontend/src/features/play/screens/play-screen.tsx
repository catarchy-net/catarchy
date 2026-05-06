import { PowerOffButton } from "@/features/auth";
import { Button, LogoText, Scaffold } from "@/features/common";

import { Interface } from "../components/interface";
import styles from "./play-screen.module.css";

export function PlayScreen() {
  return (
    <Scaffold className="bg-pattern-cat">
      <Scaffold.Header
        title={<LogoText />}
        className={styles.headerNoBorder}
        right={<PowerOffButton />}
      />
      <Scaffold.Body className={styles.body}>
        <div className={styles.content}>
          <div className={styles.centerFlex}>
            <Interface />
          </div>
        </div>
      </Scaffold.Body>
      <Scaffold.Bottom sticky>
        <Button disabled>Check</Button>
      </Scaffold.Bottom>
    </Scaffold>
  );
}
