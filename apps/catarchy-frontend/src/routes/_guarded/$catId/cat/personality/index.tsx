import { PersonalityTestScreen } from "@/features/personality";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_guarded/$catId/cat/personality/")({
  component: function PersonalityRoute() {
    const { catId } = Route.useParams();
    return <PersonalityTestScreen catId={catId} />;
  },
});
