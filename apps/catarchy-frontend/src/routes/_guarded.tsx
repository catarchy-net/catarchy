import { checkSessionOptions } from "@/features/auth";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_guarded")({
  async beforeLoad({ context: { queryClient } }) {
    try {
      const session = await queryClient.ensureQueryData(checkSessionOptions());
      if (!session?.ok) {
        throw new Error("Session check failed");
      }
    } catch (error) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: Outlet,
});
