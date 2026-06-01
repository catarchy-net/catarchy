import { createFileRoute } from "@tanstack/react-router";

import { ChronicleScreen } from "@/features/chronicle";

export const Route = createFileRoute("/chronicle")({
  component: ChronicleScreen,
});
