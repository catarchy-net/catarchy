import type React from "react";
import type { BottomSheetHeader } from "../components/bottom-sheet";
import { useOverlayStore } from "../stores/overlay";

type BottomSheetOpenProps = {
  id: string;
  component?: React.ReactNode;
  header?: BottomSheetHeader;
  onDimClick?: () => void;
  dimClosable?: boolean;
};

export function useBottomSheet() {
  const open = useOverlayStore((s) => s.open);
  const close = useOverlayStore((s) => s.close);

  return {
    open: ({ id, component, header, onDimClick, dimClosable }: BottomSheetOpenProps) =>
      open({
        id,
        type: "bottom-sheet",
        component,
        props: { header, onDimClick, dimClosable },
      }),
    close,
  };
}
