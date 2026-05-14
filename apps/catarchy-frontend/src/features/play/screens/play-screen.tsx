import { PowerOffButton } from "@/features/auth";
import { LogoText, Scaffold } from "@/features/common";

import { catInfoOptions } from "@/features/cat";
import { SummonForm } from "@/features/cat/components/summon-form";
import { useQuery } from "@tanstack/react-query";
import { CareButton } from "../components/care-button";
import { CatLoading } from "../components/cat-loading";
import { Interface } from "../components/interface";
import styles from "./play-screen.module.css";

export function PlayScreen() {
  const { status: catInfoStatus, error: catInfoError } =
    useQuery(catInfoOptions());

  const hasNoCat = catInfoStatus === "error" && catInfoError?.status === 404;

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
            {catInfoStatus === "pending" && <CatLoading />}
            {catInfoStatus === "success" && <Interface />}
            {hasNoCat && <SummonForm />}
          </div>
        </div>
      </Scaffold.Body>
      {catInfoStatus === "success" && (
        <Scaffold.Bottom sticky>
          <CareButton />
        </Scaffold.Bottom>
      )}
    </Scaffold>
  );
}
