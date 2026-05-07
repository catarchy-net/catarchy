import type React from "react";
import type { ModalHeader } from "../components/modal";
import { useOverlayStore } from "../stores/overlay";

type ModalOpenProps = {
  id: string;
  component: React.ReactNode;
  header?: ModalHeader;
  dimClosable?: boolean;
};

export function useModal() {
  const open = useOverlayStore((s) => s.open);
  const close = useOverlayStore((s) => s.close);

  return {
    open: ({ id, component, header, dimClosable }: ModalOpenProps) =>
      open({ id, type: "modal", component, header, dimClosable }),
    close,
  };
}
