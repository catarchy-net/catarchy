import { CatStatusScreen } from "@/features/cat";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_guarded/$catId/cat/status")({
  component: function CatStatusRoute() {
    const { catId } = Route.useParams();
    return <CatStatusScreen catId={catId} />;
  },
});
