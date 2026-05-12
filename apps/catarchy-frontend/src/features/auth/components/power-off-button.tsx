import { LogClick } from "@/features/analytics";
import { Button, useAlert } from "@/features/common";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { signOutOptions } from "../services/sign-out";
import styles from "./power-off-button.module.css";
export function PowerOffButton({
  onAfterSignOut,
}: {
  onAfterSignOut?: () => void;
}) {
  const router = useRouter();
  const alert = useAlert();
  const mutation = useMutation(signOutOptions());
  const context = useRouteContext({
    from: "__root__",
  });

  const handleClick = () => {
    alert.open({
      id: "sign-out-confirmation",
      title: "Sign Out",
      message: "Are you sure you want to sign out?",
      cancelLabel: "No",
      confirmLabel: "Yes",
      onConfirm: async () => {
        await mutation.mutateAsync();
        context.queryClient.clear();
        alert.close("sign-out-confirmation");
        onAfterSignOut?.();
        await router.navigate({
          to: "/",
        });
      },
      onCancel: () => {
        alert.close("sign-out-confirmation");
      },
    });
  };

  return (
    <LogClick eventName="power_off">
      <Button native className={styles.powerBtn} onClick={handleClick}>
        ⏻
      </Button>
    </LogClick>
  );
}
