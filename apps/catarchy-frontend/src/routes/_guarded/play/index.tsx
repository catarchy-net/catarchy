import { catInfoOptions } from "@/features/cat";
import { PlayScreen } from "@/features/play";
import { EdenFetchError } from "@elysiajs/eden";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_guarded/play/")({
  async beforeLoad({ context: { queryClient } }) {
    try {
      const cat = await queryClient.ensureQueryData(catInfoOptions());
    } catch (error) {
      if (error instanceof EdenFetchError) {
        if (error.status === 404) {
          throw redirect({
            to: "/cat/summon",
          });
        }
      }
    }
  },
  component: PlayScreen,
});
