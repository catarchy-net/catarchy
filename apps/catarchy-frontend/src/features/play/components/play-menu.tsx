import { Box } from "@/features/common";
import { Link } from "@tanstack/react-router";
import CatInfoIcon from "../assets/menu/cat-info.svg?react";
import ChronicleIcon from "../assets/menu/chronicle.svg?react";
import EducationIcon from "../assets/menu/education.svg?react";
import ForumIcon from "../assets/menu/forum.svg?react";
import styles from "./play-menu.module.css";

export function PlayMenu() {
  return (
    <div className={styles.container}>
      <Link to="/cat/status">
        <Box rounded containerClassName={styles.box}>
          <CatInfoIcon />
        </Box>
      </Link>
      <Link to="/" disabled className={styles.linkDisabled}>
        <Box rounded containerClassName={styles.box}>
          <EducationIcon />
        </Box>
      </Link>
      <Link to="/" disabled className={styles.linkDisabled}>
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
