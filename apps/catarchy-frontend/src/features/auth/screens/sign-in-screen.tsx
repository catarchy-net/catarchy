import { useMutation } from "@tanstack/react-query";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { FormProvider } from "react-hook-form";
import z from "zod";

import { LogClick } from "@/features/analytics";
import {
  Button,
  HeaderBackButton,
  Scaffold,
  useBottomSheet,
  useToast,
} from "@/features/common";
import {
  RequestNotificationPermission,
  useNotification,
} from "@/features/notification";

import { EmailSignInForm } from "../components/email-sign-in-form";
import {
  emailSignInFormSchema,
  useEmailSignInForm,
} from "../hooks/use-email-sign-in-form";
import {
  finishRemiliaSignIn,
  isRemiliaCallback,
  signInWithRemiliaOptions,
  startRemiliaSignIn,
} from "../services/remilianet";
import { signInWithEmailOptions } from "../services/sign-in";
import styles from "./sign-in-screen.module.css";

const EMAIL_SIGN_IN_ENABLED = false;

export function SignInScreen() {
  const router = useRouter();
  const toast = useToast();
  const { code, email, error, error_description, state } = useSearch({
    from: "/(public)/auth/sign-in",
  });
  const { form } = useEmailSignInForm({ defaultEmail: email });
  const callbackStarted = useRef(false);

  const signInWithEmail = useMutation({
    ...signInWithEmailOptions(),
    onError(error) {
      toast.push(error.value.message, {
        id: "sign-in-error",
      });
    },
  });
  const notification = useNotification();
  const bottomSheet = useBottomSheet();
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

  const signIn = async (formData: z.infer<typeof emailSignInFormSchema>) => {
    const data = await signInWithEmail.mutateAsync(formData);

    if (!data) {
      toast.push(
        "An unexpected error occurred. Please try again later or contact support.",
      );
      return;
    }

    const { message } = data;

    if (notification.permissionState === "granted") {
      try {
        await notification.register();
      } catch {
        // Ignore notification registration errors and proceed with navigation
      }
      toast.push(message);
      await router.navigate({ to: "/play" });
      return;
    }

    bottomSheet.open({
      id: "request-notification-permission",
      component: (
        <RequestNotificationPermission
          onAllow={async () => {
            try {
              await notification.register();
              bottomSheet.close("request-notification-permission");
              await router.navigate({ to: "/play" });
            } catch (error: unknown) {
              if (error instanceof Error) {
                toast.push(
                  error.message ||
                    "Failed to register for notifications. Please try again later or contact support.",
                );
              }
            }
          }}
          onDeny={() => {
            toast.push(message);
            bottomSheet.close("request-notification-permission");
            router.navigate({ to: "/play" });
          }}
        />
      ),
    });
  };

  return (
    <FormProvider {...form}>
      <Scaffold avoidKeyboard>
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
            {EMAIL_SIGN_IN_ENABLED && (
              <>
                <div className={styles.divider} aria-hidden="true">
                  <span>or</span>
                </div>
                <EmailSignInForm />
              </>
            )}
          </div>
        </Scaffold.Body>
        <Scaffold.Bottom sticky>
          <div className={styles.actions}>
            <LogClick eventName="sign_up_from_signin">
              <Link to="/auth/register">
                <Button variant="outline" size="big">
                  Sign Up
                </Button>
              </Link>
            </LogClick>
            {EMAIL_SIGN_IN_ENABLED && (
              <LogClick eventName="sign_in">
                <Button
                  disabled={
                    !form.formState.isValid || form.formState.isSubmitting
                  }
                  size="big"
                  onClick={form.handleSubmit(signIn)}
                >
                  {signInWithEmail.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </LogClick>
            )}
          </div>
        </Scaffold.Bottom>
      </Scaffold>
    </FormProvider>
  );
}
