import { CareHistoryScreen } from "@/features/cat";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_guarded/$catId/cat/care-history")({
  component: function CareHistoryRoute() {
    const { catId } = Route.useParams();
    return <CareHistoryScreen catId={catId} />;
  },
});
