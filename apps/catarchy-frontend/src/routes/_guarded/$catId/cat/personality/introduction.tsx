import { TestIntroductionScreen } from "@/features/personality";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_guarded/$catId/cat/personality/introduction",
)({
  component: TestIntroductionScreen,
});
