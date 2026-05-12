import {
  careForCatOptions,
  catInfoOptions,
  useCareCooldown,
} from "@/features/cat";
import { Button, useModal } from "@/features/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { CareCooldown } from "./care-cooldown";
import { StatusReportModal } from "./status-report-modal";

export function CareButton() {
  const modal = useModal();

  const queryClient = useQueryClient();

  const careForCat = useMutation({
    ...careForCatOptions(),
    async onSuccess() {
      await queryClient.invalidateQueries(catInfoOptions());
    },
  });

  const cooldown = useCareCooldown();

  const handleClick = useCallback(async () => {
    const data = await careForCat.mutateAsync();

    if (!data) {
      return;
    }

    modal.open({
      id: "care-result",
      header: {
        title: "STATUS REPORT",
      },
      component: (
        <StatusReportModal
          mood={data?.emotion.emoji}
          message={data?.message}
          onClose={() => modal.close("care-result")}
        />
      ),
      dimClosable: false,
    });
  }, [careForCat, modal]);

  return (
    <Button
      size="big"
      disabled={careForCat.status === "pending" || cooldown.activated}
      onClick={handleClick}
    >
      {careForCat.status === "pending" ? (
        "Loading..."
      ) : cooldown.activated ? (
        <CareCooldown />
      ) : (
        "Take care of cat"
      )}
    </Button>
  );
}
