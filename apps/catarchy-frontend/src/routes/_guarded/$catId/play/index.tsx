import { PlayScreen } from "@/features/play";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_guarded/$catId/play/")({
  component: function PlayRoute() {
    const { catId } = Route.useParams();
    return <PlayScreen catId={catId} />;
  },
});
