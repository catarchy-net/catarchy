import { Scaffold } from "@/features/common/components/layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(gate)/")({
  component: Index,
  loader: () => {},
});

function Index() {
  return (
    <Scaffold>
      <Scaffold.Header />
      <Scaffold.Body></Scaffold.Body>
      <Scaffold.Bottom></Scaffold.Bottom>
    </Scaffold>
  );
}
