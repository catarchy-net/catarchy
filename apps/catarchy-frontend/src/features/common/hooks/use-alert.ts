import React from "react";
import { AlertModal } from "../components/alert-modal";
import { useOverlayStore } from "../stores/overlay";

type AlertProps = {
  id: string;
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  onConfirm?: (close: () => void) => void;
  cancelLabel?: string;
  onCancel?: () => void;
  dimClosable?: boolean;
};

export function useAlert() {
  const open = useOverlayStore((s) => s.open);
  const close = useOverlayStore((s) => s.close);

  return {
    open: ({ id, ...props }: AlertProps) =>
      open({
        id,
        type: "alert",
        component: React.createElement(AlertModal, {
          ...props,
          id,
        }),
      }),
    close,
  };
}
