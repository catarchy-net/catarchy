import { createFileRoute } from "@tanstack/react-router";

import { FriendListScreen } from "@/features/relationship";

export const Route = createFileRoute("/_guarded/$catId/cat/friend/")({
  component: function FriendListRoute() {
    const { catId } = Route.useParams();
    return <FriendListScreen catId={catId} />;
  },
});
