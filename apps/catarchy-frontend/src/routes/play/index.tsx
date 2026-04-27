import { PlayScreen } from "@/features/play";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/play/")({
  component: PlayScreen,
});
