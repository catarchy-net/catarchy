import type React from "react";
import { create } from "zustand";
import type { ModalHeader } from "../components/modal";

export type OverlayType = "modal" | "bottom-sheet" | "alert";

export type Overlay<P = Record<string, unknown>> = {
  id: string;
  type: OverlayType;
  component?: React.ReactNode;
  header?: ModalHeader;
  props?: P;
  closing?: boolean;
  dimClosable?: boolean;
};

type OverlayStore = {
  overlays: Overlay[];
  open: (overlay: Overlay) => void;
  close: (id: string) => void;
  remove: (id: string) => void;
  closeAll: (type?: OverlayType) => void;
  isOpen: (id: string) => boolean;
};

export const useOverlayStore = create<OverlayStore>((set, get) => ({
  overlays: [],
  open: (overlay) =>
    set((s) => ({
      overlays: s.overlays.some((o) => o.id === overlay.id)
        ? s.overlays
        : [...s.overlays, overlay],
    })),
  close: (id) =>
    set((s) => ({
      overlays: s.overlays.filter((o) => o.id !== id),
    })),
  remove: (id) =>
    set((s) => ({ overlays: s.overlays.filter((o) => o.id !== id) })),
  closeAll: (type) =>
    set((s) => ({
      overlays: type ? s.overlays.filter((o) => o.type !== type) : [],
    })),
  isOpen: (id) => get().overlays.some((o) => o.id === id),
}));
