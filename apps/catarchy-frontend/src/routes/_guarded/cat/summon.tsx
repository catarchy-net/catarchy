import { CatSummonScreen } from "@/features/cat";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_guarded/cat/summon")({
  component: CatSummonScreen,
});
