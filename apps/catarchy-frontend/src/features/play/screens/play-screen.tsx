import { LogoText, Scaffold } from "@/features/common";

import { ConfigButton } from "@/features/config";
import { Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { CareButton } from "../components/care-button";
import { Interface } from "../components/interface";
import { PlayMenu } from "../components/play-menu";
import styles from "./play-screen.module.css";

export function PlayScreen({ catId }: { catId: string }) {
  return (
    <Scaffold className="bg-pattern-cat">
      <Scaffold.Header
        title={<LogoText />}
        className={styles.headerNoBorder}
        right={
          <Link to="/config">
            <ConfigButton />
          </Link>
        }
      />
      <Scaffold.Body className={styles.body}>
        <div className={styles.content}>
          <div className={styles.centerFlex}>
            <Interface catId={catId} />
          </div>
          <PlayMenu catId={catId} />
        </div>
      </Scaffold.Body>
      <Scaffold.Bottom sticky>
        <Suspense>
          <CareButton catId={catId} />
        </Suspense>
      </Scaffold.Bottom>
    </Scaffold>
  );
}
