import { LogClick } from "@/features/analytics";
import {
  Button,
  HeaderBackButton,
  Scaffold,
  useBottomSheet,
  useToast,
} from "@/features/common";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { FormProvider } from "react-hook-form";
import z from "zod";
import { EmailSignInForm } from "../components/email-sign-in-form";
import {
  emailSignInFormSchema,
  useEmailSignInForm,
} from "../hooks/use-email-sign-in-form";

import {
  RequestNotificationPermission,
  useNotification,
} from "@/features/notification";

import { useMutation } from "@tanstack/react-query";
import { signInWithEmailOptions } from "../services/sign-in";
import styles from "./sign-in-screen.module.css";

export function SignInScreen() {
  const router = useRouter();
  const toast = useToast();
  const { email } = useSearch({ from: "/auth/sign-in" });
  const { form } = useEmailSignInForm({ defaultEmail: email });

  const mutation = useMutation({
    ...signInWithEmailOptions(),
    onError(error) {
      toast.push(error.value.message, {
        id: "sign-in-error",
      });
    },
  });
  const notification = useNotification();
  const bottomSheet = useBottomSheet();

  const signIn = async (formData: z.infer<typeof emailSignInFormSchema>) => {
    const data = await mutation.mutateAsync(formData);

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
            <EmailSignInForm />
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
            <LogClick eventName="sign_in">
              <Button
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
                size="big"
                onClick={form.handleSubmit(signIn)}
              >
                {/* Sign In */}
                {mutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </LogClick>
          </div>
        </Scaffold.Bottom>
      </Scaffold>
    </FormProvider>
  );
}
