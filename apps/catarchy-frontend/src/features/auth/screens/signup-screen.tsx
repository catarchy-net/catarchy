import { LogClick } from "@/features/analytics";
import {
  api,
  Button,
  HeaderBackButton,
  Scaffold,
  Text,
  useAlert,
  useToast,
} from "@/features/common";
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
import styles from "./signup-screen.module.css";

export function SignupScreen() {
  const toast = useToast();
  const alert = useAlert();
  const router = useRouter();
  const { form: emailPasswordForm } = useEmailPasswordForm();
  const { form: handleForm } = useHandleForm();
  const [verifyUntil, setVerifyUntil] = useState<Date | null>(null);
  const [emailPasswordSet, setEmailPasswordSet] = useState(false);

  const handleRequestVerificationEmail = async () => {
    const email = emailPasswordForm.getValues("email");

    const validation = emailPasswordSchema.shape.email.safeParse(email);

    if (!validation.success) {
      emailPasswordForm.trigger("email");

      return;
    }

    const { data, error } = await api.auth["send-verification-email"].post({
      email: emailPasswordForm.getValues("email"),
    });

    if (error) {
      emailPasswordForm.setError("email", {
        message:
          error.value.message ||
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
      {
        id: "verification-email-sent",
      },
    );
  };

  const handleVerifyEmail = async () => {
    const { data, error } = await api.auth["verify-email-code"].patch({
      email: emailPasswordForm.getValues("email"),
      code: emailPasswordForm.getValues("code"),
    });

    if (error) {
      emailPasswordForm.setError("code", {
        message:
          error.value.message ||
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

    toast.push("Email verified successfully.", {
      id: "email-verified",
    });
  };

  const handleSignUp = async (
    handleFormData: z.infer<typeof handleFormSchema>,
  ) => {
    const { data, error } = await api.auth["sign-up-email"].post({
      email: emailPasswordForm.getValues("email"),
      password: emailPasswordForm.getValues("password"),
      handle: handleFormData.handle,
    });

    // Email is not verified
    if (error?.status === 403) {
      handleForm.setError("handle", {
        message: error.value.message,
      });
      return;
    }

    // Handle already exists
    if (error?.status === 409) {
      const errorValue = error.value as {
        message: string;
        data: { conflicted: "email" | "handle" };
      };
      if (errorValue.data.conflicted === "email") {
        alert.open({
          id: "signup-error",
          title: "Error",
          message:
            "An account with this email already exists. Please use a different email or sign in to your existing account.",
          confirmLabel: "OK",
          onConfirm(close) {
            close();
            router.navigate({
              to: "/auth/sign-in",
            });
          },
        });
        return;
      }

      handleForm.setError("handle", {
        message: errorValue.message,
      });
      return;
    }

    if (!data) {
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

    const { message } = data;

    toast.push(
      message || "Account created successfully. You can now sign in.",
      {
        id: "signup-success",
      },
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
