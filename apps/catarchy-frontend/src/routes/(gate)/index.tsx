import { ApiResponse, checkSessionOptions } from "@/features/auth";
import { GateScreen } from "@/features/gate";

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(gate)/")({
  component: GateScreen,
  async beforeLoad({ context: { queryClient } }) {
    let session: ApiResponse = null;

    try {
      session = await queryClient.ensureQueryData(checkSessionOptions());
    } catch (error) {
      // no-op, allow access to gate screen
    }

    if (session?.ok) {
      throw redirect({
        to: "/play",
      });
    }
  },
});
