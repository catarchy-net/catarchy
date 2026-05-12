import { LogClick } from "@/features/analytics";
import {
  Button,
  HeaderBackButton,
  Scaffold,
  Text,
  useAlert,
  useToast,
} from "@/features/common";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { FormProvider } from "react-hook-form";
import z from "zod";
import { EmailPasswordForm } from "../components/email-password-form";
import { HandleForm } from "../components/handle-form";
import { HandleGuide } from "../components/handle-guide";
import {
  emailPasswordSchema,
  useEmailPasswordForm,
} from "../hooks/use-email-password-form";
import { handleFormSchema, useHandleForm } from "../hooks/use-handle-form";
import {
  sendVerificationEmailOptions,
  verifyEmailCodeOptions,
} from "../services/email-verification";
import { signUpOptions } from "../services/sign-up";
import styles from "./signup-screen.module.css";

export function SignupScreen() {
  const toast = useToast();
  const alert = useAlert();
  const router = useRouter();
  const { form: emailPasswordForm } = useEmailPasswordForm();
  const { form: handleForm } = useHandleForm();
  const [verifyUntil, setVerifyUntil] = useState<Date | null>(null);
  const [emailPasswordSet, setEmailPasswordSet] = useState(false);

  const sendVerificationEmail = useMutation(sendVerificationEmailOptions());
  const verifyEmailCode = useMutation(verifyEmailCodeOptions());
  const signUp = useMutation(signUpOptions());

  const handleRequestVerificationEmail = async () => {
    const email = emailPasswordForm.getValues("email");

    const validation = emailPasswordSchema.shape.email.safeParse(email);

    if (!validation.success) {
      emailPasswordForm.trigger("email");
      return;
    }

    let data:
      | Awaited<ReturnType<typeof sendVerificationEmail.mutateAsync>>
      | undefined;

    try {
      data = await sendVerificationEmail.mutateAsync({ email });
    } catch (err: unknown) {
      const error = err as { value?: { message?: string } };
      emailPasswordForm.setError("email", {
        message:
          error?.value?.message ||
          "Unexpected error occurred. Please try again later or contact support.",
      });
      return;
    }

    if (!data) {
      emailPasswordForm.setError("email", {
        message:
          "An unexpected error occurred. Please try again later or contact support.",
      });
      return;
    }

    emailPasswordForm.clearErrors("email");
    setVerifyUntil(new Date(data.expiredAt));

    toast.push(
      "Verification email sent. Please check your inbox and enter the code here.",
      { id: "verification-email-sent" },
    );
  };

  const handleVerifyEmail = async () => {
    let data:
      | Awaited<ReturnType<typeof verifyEmailCode.mutateAsync>>
      | undefined;

    try {
      data = await verifyEmailCode.mutateAsync({
        email: emailPasswordForm.getValues("email"),
        code: emailPasswordForm.getValues("code"),
      });
    } catch (err: unknown) {
      const error = err as { value?: { message?: string } };
      emailPasswordForm.setError("code", {
        message:
          error?.value?.message ||
          "Unexpected error occurred. Please try again later or contact support.",
      });
      return;
    }

    if (!data) {
      emailPasswordForm.setError("code", {
        message:
          "Invalid verification code. Please check the code and try again.",
      });
      return;
    }

    emailPasswordForm.setValue("emailVerified", true);
    emailPasswordForm.clearErrors("code");

    toast.push("Email verified successfully.", { id: "email-verified" });
  };

  const handleSignUp = async (
    handleFormData: z.infer<typeof handleFormSchema>,
  ) => {
    let data: Awaited<ReturnType<typeof signUp.mutateAsync>> | undefined;

    try {
      data = await signUp.mutateAsync({
        email: emailPasswordForm.getValues("email"),
        password: emailPasswordForm.getValues("password"),
        handle: handleFormData.handle,
      });
    } catch (err: unknown) {
      const error = err as {
        status?: number;
        value?: {
          message?: string;
          data?: { conflicted?: "email" | "handle" };
        };
      };

      if (error?.status === 403) {
        handleForm.setError("handle", {
          message: error.value?.message,
        });
        return;
      }

      if (error?.status === 409) {
        if (error.value?.data?.conflicted === "email") {
          alert.open({
            id: "signup-error",
            title: "Error",
            message:
              "An account with this email already exists. Please use a different email or sign in to your existing account.",
            confirmLabel: "OK",
            onConfirm(close) {
              close();
              router.navigate({ to: "/auth/sign-in" });
            },
          });
          return;
        }

        handleForm.setError("handle", {
          message: error.value?.message,
        });
        return;
      }

      alert.open({
        id: "signup-error",
        title: "Error",
        message:
          "An unexpected error occurred. Please try again later or contact support.",
        confirmLabel: "OK",
        onConfirm(close) {
          close();
        },
      });
      return;
    }

    toast.push(
      data?.message || "Account created successfully. You can now sign in.",
      { id: "signup-success" },
    );

    router.navigate({
      to: "/auth/sign-in",
      search: (s) => ({ ...s, email: emailPasswordForm.getValues("email") }),
    });
  };

  const handleResend = async () => {
    emailPasswordForm.clearErrors("code");
    await handleRequestVerificationEmail();
  };

  return (
    <Scaffold avoidKeyboard>
      <Scaffold.Header title="Sign Up" left={<HeaderBackButton />} />
      <Scaffold.Body>
        <div className={styles.bodyInner}>
          <FormProvider {...emailPasswordForm}>
            <div
              className={styles.formSection}
              style={{ display: emailPasswordSet ? "none" : undefined }}
            >
              <EmailPasswordForm
                verifyUntil={verifyUntil}
                onVerifyEmailRequested={handleRequestVerificationEmail}
                onVerifyEmail={handleVerifyEmail}
                onResetEmail={() => setVerifyUntil(null)}
                onResendVerificationEmail={handleResend}
              />
            </div>
          </FormProvider>
          <FormProvider {...handleForm}>
            <div
              className={styles.handleSection}
              style={{ display: emailPasswordSet ? undefined : "none" }}
            >
              <HandleGuide />
              <HandleForm />
            </div>
          </FormProvider>
        </div>
        <div>
          <Text as="p" className={styles.terms}>
            <Link to="/toc" className={styles.termsLink}>
              Terms
            </Link>{" "}
            /{" "}
            <Link to="/pp" className={styles.termsLink}>
              Privacy
            </Link>
          </Text>
        </div>
      </Scaffold.Body>
      <Scaffold.Bottom sticky>
        <div className={styles.actions}>
          <LogClick eventName="signup_back">
            <Button
              size="big"
              variant={"outline"}
              onClick={() => router.history.back()}
            >
              Back
            </Button>
          </LogClick>
          <LogClick eventName="signup_next">
            <Button
              size="big"
              style={{ display: emailPasswordSet ? "none" : undefined }}
              disabled={
                !emailPasswordForm.formState.isValid ||
                emailPasswordForm.formState.isSubmitting
              }
              onClick={() => setEmailPasswordSet(true)}
            >
              Next
            </Button>
          </LogClick>
          <LogClick eventName="signup_submit">
            <Button
              size="big"
              style={{ display: emailPasswordSet ? undefined : "none" }}
              disabled={
                !emailPasswordForm.formState.isValid ||
                emailPasswordForm.formState.isSubmitting
              }
              onClick={handleForm.handleSubmit(handleSignUp)}
            >
              Sign Up
            </Button>
          </LogClick>
        </div>
      </Scaffold.Bottom>
    </Scaffold>
  );
}
