import { UpdateAlert } from "@/features/config";
import { MusicDrawer } from "@/features/music/components/music-drawer";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import {
  AlertRenderer,
  BottomSheetRenderer,
  ModalRenderer,
  ToastRenderer,
} from "../features/common";
import type { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}

function RootError() {
  return null;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: RootError,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <ModalRenderer />
      <AlertRenderer />
      <BottomSheetRenderer />
      <ToastRenderer />
      <MusicDrawer />
      <UpdateAlert />
    </>
  );
}
