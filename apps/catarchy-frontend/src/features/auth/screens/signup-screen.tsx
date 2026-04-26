import {
  api,
  Button,
  cn,
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
            "An account with this email already exists. Please use a different email or log in to your existing account.",
          confirmLabel: "OK",
          onConfirm(close) {
            close();
            router.navigate({
              to: "/auth/login",
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

    toast.push(message || "Account created successfully. You can now log in.", {
      id: "signup-success",
    });

    router.navigate({
      to: "/auth/login",
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
        <div className="flex flex-col justify-center-safe flex-1">
          <FormProvider {...emailPasswordForm}>
            <div
              className={cn(["p-4", !emailPasswordSet ? "block" : "hidden"])}
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
              className={cn([
                "p-4 flex flex-col gap-5",
                !emailPasswordSet && "hidden",
              ])}
            >
              <HandleGuide />
              <HandleForm />
            </div>
          </FormProvider>
        </div>
        <div>
          <Text as="p" className="text-center py-2">
            <Link to="/toc" className="underline">
              Terms
            </Link>{" "}
            /{" "}
            <Link to="/pp" className="underline">
              Privacy
            </Link>
          </Text>
        </div>
      </Scaffold.Body>
      <Scaffold.Bottom sticky>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="big"
            variant={"outline"}
            onClick={() => router.history.back()}
          >
            Back
          </Button>
          <Button
            size="big"
            className={cn([emailPasswordSet && "hidden"])}
            disabled={
              !emailPasswordForm.formState.isValid ||
              emailPasswordForm.formState.isSubmitting
            }
            onClick={() => setEmailPasswordSet(true)}
          >
            Next
          </Button>
          <Button
            size="big"
            className={cn([!emailPasswordSet && "hidden"])}
            disabled={
              !emailPasswordForm.formState.isValid ||
              emailPasswordForm.formState.isSubmitting
            }
            onClick={handleForm.handleSubmit(handleSignUp)}
          >
            Sign Up
          </Button>
        </div>
      </Scaffold.Bottom>
    </Scaffold>
  );
}
