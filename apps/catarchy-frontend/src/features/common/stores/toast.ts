import { create } from "zustand";

import type React from "react";

export type Toast = {
  id: string;
  message: React.ReactNode;
  duration?: number;
  hasCloseButton?: boolean;
};

type ToastStore = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id"> & { id?: string }) => string;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: ({ id: givenId, ...toast }) => {
    const id = givenId ?? crypto.randomUUID();
    set((s) => ({
      toasts: s.toasts.some((t) => t.id === id)
        ? s.toasts
        : [...s.toasts, { ...toast, id }],
    }));
    return id;
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
