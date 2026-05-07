import React from "react";
import { cn } from "../lib/cn";
import { useOverlayStore } from "../stores/overlay";
import styles from "./alert-modal.module.css";
import { Button } from "./button";
import { Modal } from "./modal";
import { ModalCloseButton } from "./modal-close-button";
import { Text } from "./text";

type AlertModalProps = {
  id: string;
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  onConfirm?: (close: () => void) => void;
  cancelLabel?: string;
  onCancel?: () => void;
  dimClosable?: boolean;
};

export function AlertModal({
  id,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  cancelLabel = "Cancel",
  onCancel,
  dimClosable = true,
}: AlertModalProps) {
  const { close } = useOverlayStore();
  const isMessageString = typeof message === "string";
  const hasCancel = Boolean(onCancel);

  const handleCancel = () => {
    if (!onCancel) {
      close(id);
      return;
    }
    onCancel();
  };

  return (
    <Modal
      onClose={handleCancel}
      dimClosable={dimClosable}
      header={{
        title,
        right: <ModalCloseButton onClick={handleCancel} />,
      }}
    >
      <div className={styles.body}>
        {isMessageString ? (
          <Text className={styles.message}>{message}</Text>
        ) : (
          message
        )}
      </div>
      <div
        className={cn(
          styles.actions,
          hasCancel ? styles.actionsDouble : styles.actionsSingle,
        )}
      >
        {hasCancel && (
          <Button variant="outline" type="button" onClick={handleCancel}>
            {cancelLabel}
          </Button>
        )}
        <Button type="button" onClick={() => onConfirm?.(() => close(id))}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
