import { Button } from "@/features/common";

import { useCareAction } from "../hooks/use-care-action";
import { CareCooldown } from "./care-cooldown";

export function CareButton({ catId }: { catId: string }) {
  const { care, isCaring, cooldown } = useCareAction({ catId });

  return (
    <Button size="big" disabled={isCaring || cooldown.activated} onClick={care}>
      {isCaring ? (
        "Loading..."
      ) : cooldown.activated ? (
        <CareCooldown catId={catId} />
      ) : (
        "Take care of cat"
      )}
    </Button>
  );
}
