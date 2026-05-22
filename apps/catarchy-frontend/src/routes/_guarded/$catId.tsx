import { catInfoOptions, catListOptions } from "@/features/cat";
import { EdenFetchError } from "@elysiajs/eden";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_guarded/$catId")({
  async beforeLoad({ context: { queryClient }, params }) {
    try {
      const cats = await queryClient.ensureQueryData(catListOptions());
      if (!cats || !cats.some((c) => c.id === params.catId)) {
        throw new EdenFetchError(404, "Not Found");
      }
      await queryClient.ensureQueryData(catInfoOptions(params.catId));
    } catch (error) {
      if (error instanceof EdenFetchError && error.status === 404) {
        throw redirect({ to: "/cat/summon" });
      }
      throw error;
    }
  },
  component: Outlet,
});
