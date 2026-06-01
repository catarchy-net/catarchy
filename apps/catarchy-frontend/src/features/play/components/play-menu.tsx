import { Link } from "@tanstack/react-router";

import { useAnalytics } from "@/features/analytics";
import { Box } from "@/features/common";

import CatInfoIcon from "../assets/menu/cat-info.svg?react";
import ChronicleIcon from "../assets/menu/chronicle.svg?react";
import EducationIcon from "../assets/menu/education.svg?react";
import ForumIcon from "../assets/menu/forum.svg?react";
import styles from "./play-menu.module.css";

export function PlayMenu({ catId }: { catId: string }) {
  const analytics = useAnalytics();

  return (
    <div className={styles.container}>
      <Link
        to="/$catId/cat/status"
        params={{ catId }}
        onClick={() => analytics.click({ eventName: "menu_cat_status" })}
      >
        <Box rounded containerClassName={styles.box}>
          <CatInfoIcon />
        </Box>
      </Link>
      <Link to="/" disabled className={styles.linkDisabled}>
        <Box rounded containerClassName={styles.box}>
          <EducationIcon />
        </Box>
      </Link>
      <Link
        to="/chronicle"
        onClick={() => analytics.click({ eventName: "menu_chronicle" })}
      >
        <Box rounded containerClassName={styles.box}>
          <ChronicleIcon />
        </Box>
      </Link>
      <Link to="/" disabled className={styles.linkDisabled}>
        <Box rounded containerClassName={styles.box}>
          <ForumIcon />
        </Box>
      </Link>
    </div>
  );
}
