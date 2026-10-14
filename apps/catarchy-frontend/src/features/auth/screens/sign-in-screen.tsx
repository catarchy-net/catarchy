import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearch } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import {
  Button,
  HeaderBackButton,
  Scaffold,
  useToast,
} from "@/features/common";

import {
  finishRemiliaSignIn,
  isRemiliaCallback,
  signInWithRemiliaOptions,
  startRemiliaSignIn,
} from "../services/remilianet";
import styles from "./sign-in-screen.module.css";

export function SignInScreen() {
  const router = useRouter();
  const toast = useToast();
  const { code, error, error_description, state } = useSearch({
    from: "/(public)/auth/sign-in",
  });
  const callbackStarted = useRef(false);

  const signInWithRemilia = useMutation(signInWithRemiliaOptions());

  useEffect(() => {
    const callback = {
      code,
      state,
      error,
      errorDescription: error_description,
    };

    if (!isRemiliaCallback(callback) || callbackStarted.current) return;
    callbackStarted.current = true;

    void (async () => {
      try {
        const accessToken = await finishRemiliaSignIn(callback);
        const data = await signInWithRemilia.mutateAsync({ accessToken });
        toast.push(data?.message ?? "Signed in successfully");
        await router.navigate({ to: "/play", replace: true });
      } catch (callbackError: unknown) {
        const apiMessage =
          typeof callbackError === "object" &&
          callbackError !== null &&
          "value" in callbackError &&
          typeof callbackError.value === "object" &&
          callbackError.value !== null &&
          "message" in callbackError.value &&
          typeof callbackError.value.message === "string"
            ? callbackError.value.message
            : undefined;
        const message =
          apiMessage ??
          (callbackError instanceof Error
            ? callbackError.message
            : "RemiliaNET sign-in failed. Please try again.");

        toast.push(message, { id: "remilianet-sign-in-error" });
        await router.navigate({
          to: "/auth/sign-in",
          search: {},
          replace: true,
        });
      }
    })();
  }, [code, error, error_description, router, signInWithRemilia, state, toast]);

  return (
    <Scaffold>
      <Scaffold.Header title="Sign In" left={<HeaderBackButton />} />
      <Scaffold.Body className={styles.bodyCentered}>
        <div className={styles.bodyContent}>
          <Button
            className={styles.remiliaButton}
            disabled={signInWithRemilia.isPending}
            size="big"
            variant="secondary"
            onClick={() => void startRemiliaSignIn()}
          >
            {signInWithRemilia.isPending
              ? "Connecting..."
              : "Continue with RemiliaNET"}
          </Button>
        </div>
      </Scaffold.Body>
    </Scaffold>
  );
}
