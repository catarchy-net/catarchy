import { HeaderBackButton, Scaffold } from "@/features/common";

import { AppUpdateSection } from "../components/app-update-section";
import { ResetPasswordButton } from "../components/reset-password-button";
import { SignoutButton } from "../components/sign-out-button";
import { SoundEffectSection } from "../components/sound-effect-section";
import { ThemeSection } from "../components/theme-section";
import styles from "./app-config-screen.module.css";

export function AppConfigScreen() {
  return (
    <Scaffold>
      <Scaffold.Header title="App config" left={<HeaderBackButton />} />
      <Scaffold.Body className={styles.body}>
        <AppUpdateSection />
        <ThemeSection />
        <SoundEffectSection />
        <ResetPasswordButton />
        <SignoutButton />
      </Scaffold.Body>
    </Scaffold>
  );
}
