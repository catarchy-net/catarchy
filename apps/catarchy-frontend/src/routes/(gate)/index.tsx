import { Bastet, Scaffold } from "@/features/common";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(gate)/")({
  component: Index,
  loader: () => {},
});

function Index() {
  return (
    <Scaffold>
      <Scaffold.Body>
        <div className="h-full w-full flex justify-center items-center flex-col gap-2">
          <Bastet />
          <p>Coming soon</p>
        </div>
      </Scaffold.Body>
    </Scaffold>
  );
}
