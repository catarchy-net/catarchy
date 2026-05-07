import { useShallow } from "zustand/react/shallow";
import { Modal } from "../components/modal";
import { useOverlayStore } from "../stores/overlay";

export function ModalRenderer() {
  const overlays = useOverlayStore(
    useShallow((s) => s.overlays.filter((o) => o.type === "modal")),
  );
  const close = useOverlayStore((s) => s.close);

  return (
    <>
      {overlays.map((overlay) => (
        <Modal
          key={overlay.id}
          onClose={() => close(overlay.id)}
          header={overlay.header}
          dimClosable={overlay.dimClosable}
        >
          {overlay.component}
        </Modal>
      ))}
    </>
  );
}
