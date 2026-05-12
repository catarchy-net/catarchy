import { LogClick } from "@/features/analytics";
import {
  Button,
  HeaderBackButton,
  Scaffold,
  useToast,
} from "@/features/common";
import { useRouter } from "@tanstack/react-router";
import { FormProvider } from "react-hook-form";
import z from "zod";
import { EmailPasswordForm } from "../components/email-password-form";
import {
  emailPasswordSchema,
  useEmailPasswordForm,
} from "../hooks/use-email-password-form";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  resetPasswordOptions,
  sendResetEmailOptions,
  verifyResetCodeOptions,
} from "../services/password-reset";
import styles from "./password-reset-screen.module.css";

export function PasswordResetScreen() {
  const router = useRouter();
  const toast = useToast();

  // Local state
  const [verifyUntil, setVerifyUntil] = useState<Date | null>(null);

  // Form state
  const { form: emailPasswordForm } = useEmailPasswordForm();

  // Mutations
  const sendResetEmailMutation = useMutation(sendResetEmailOptions());
  const verifyResetCodeMutation = useMutation(verifyResetCodeOptions());
  const resetPasswordMutation = useMutation(resetPasswordOptions());

  // Handlers
  const handleRequestVerificationEmail = async () => {
    const email = emailPasswordForm.getValues("email");

    const validation = emailPasswordSchema.shape.email.safeParse(email);

    if (!validation.success) {
      emailPasswordForm.trigger("email");

      return;
    }

    let sendData: Awaited<ReturnType<typeof sendResetEmailMutation.mutateAsync>> | undefined;

    try {
      sendData = await sendResetEmailMutation.mutateAsync({
        email: emailPasswordForm.getValues("email"),
      });
    } catch (err: unknown) {
      const error = err as { status?: number; value?: { data?: { waitUntil?: string }; message?: string } };

      if (error?.status === 409) {
        const waitUntil = error.value?.data?.waitUntil;
        if (waitUntil) setVerifyUntil(new Date(waitUntil));
        toast.push(
          "A verification email has already been sent. Please check your inbox and enter the code here.",
          { id: "verification-email-already-sent" },
        );
        emailPasswordForm.clearErrors("email");
        return;
      }

      emailPasswordForm.setError("email", {
        message:
          error?.value?.message ||
          "Unexpected error occurred. Please try again later or contact support.",
      });
      return;
    }

    if (!sendData) {
      emailPasswordForm.setError("email", {
        message:
          "An unexpected error occurred. Please try again later or contact support.",
      });
      return;
    }

    emailPasswordForm.clearErrors("email");
    setVerifyUntil(new Date(sendData.expiredAt));

    toast.push(
      "Verification email sent. Please check your inbox and enter the code here.",
      {
        id: "verification-email-sent",
      },
    );
  };

  const handleVerifyEmail = async () => {
    let verifyData: Awaited<ReturnType<typeof verifyResetCodeMutation.mutateAsync>> | undefined;

    try {
      verifyData = await verifyResetCodeMutation.mutateAsync({
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

    if (!verifyData) {
      emailPasswordForm.setError("code", {
        message: "Invalid verification code. Please check the code and try again.",
      });
      return;
    }

    emailPasswordForm.setValue("emailVerified", true);
    emailPasswordForm.clearErrors("code");

    toast.push("Email verified successfully.", {
      id: "email-verified",
    });
  };

  const handleResetEmail = () => {
    emailPasswordForm.clearErrors();
    emailPasswordForm.reset();
    setVerifyUntil(null);
  };

  const handleResendVerificationEmail = async () => {
    emailPasswordForm.clearErrors("code");
    await handleRequestVerificationEmail();
  };

  const handleResetPassword = async (
    formData: z.infer<typeof emailPasswordSchema>,
  ) => {
    try {
      await resetPasswordMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });
    } catch (err: unknown) {
      const error = err as { value?: { message?: string } };
      toast.push(
        error?.value?.message ||
          "Unexpected error occurred. Please try again later or contact support.",
        { id: "password-reset-error" },
      );
      return;
    }

    toast.push(
      "Password reset successfully. You can now sign in with your new password.",
      {
        id: "password-reset-success",
      },
    );

    emailPasswordForm.clearErrors();
    emailPasswordForm.reset();
    setVerifyUntil(null);

    await router.navigate({
      to: "/auth/sign-in",
      search: (old) => ({ ...old, email: formData.email }),
    });
  };

  return (
    <FormProvider {...emailPasswordForm}>
      <Scaffold avoidKeyboard>
        <Scaffold.Header title="Password Reset" left={<HeaderBackButton />} />
        <Scaffold.Body className={styles.bodyCentered}>
          <div className={styles.bodyContent}>
            <EmailPasswordForm
              verifyUntil={verifyUntil}
              onVerifyEmail={handleVerifyEmail}
              onResetEmail={handleResetEmail}
              onResendVerificationEmail={handleResendVerificationEmail}
              onVerifyEmailRequested={handleRequestVerificationEmail}
            />
          </div>
        </Scaffold.Body>
        <Scaffold.Bottom sticky>
          <LogClick eventName="reset_password">
            <Button
              disabled={
                !emailPasswordForm.formState.isValid ||
                resetPasswordMutation.isPending
              }
              onClick={emailPasswordForm.handleSubmit(handleResetPassword)}
            >
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </Button>
          </LogClick>
        </Scaffold.Bottom>
      </Scaffold>
    </FormProvider>
  );
}
