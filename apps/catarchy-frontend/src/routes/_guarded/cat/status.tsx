import { CatStatusScreen } from "@/features/cat";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_guarded/cat/status")({
  component: CatStatusScreen,
});
