import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useCallback } from "react";

import { useAnalytics } from "@/features/analytics";
import {
  careForCatOptions,
  catInfoOptions,
  useCareCooldown,
} from "@/features/cat";
import { Button, useModal } from "@/features/common";
import {
  getPersonalityTestProgressOptions,
  usePersonalityTestModal,
} from "@/features/personality";

import { CareCooldown } from "./care-cooldown";
import { StatusReportModal } from "./status-report-modal";

export function CareButton({ catId }: { catId: string }) {
  const modal = useModal();
  const queryClient = useQueryClient();
  const analytics = useAnalytics();

  const personalityTestModal = usePersonalityTestModal({
    catId,
    answerCount: 1,
  });

  const careForCat = useMutation({
    ...careForCatOptions(catId),
    async onSuccess() {
      await queryClient.invalidateQueries(catInfoOptions(catId));
    },
  });

  const { data: progressData } = useSuspenseQuery(
    getPersonalityTestProgressOptions({ catId }),
  );

  const hasPersonalityTestRemaining = (progressData?.remainingCount ?? 0) > 0;

  const cooldown = useCareCooldown({ catId });

  const handleClick = useCallback(async () => {
    analytics.click({ eventName: "care_button" });
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
          careRecordId={data.careRecordId}
          mood={data?.emotion.emoji}
          closeText={hasPersonalityTestRemaining ? "Next" : "Close"}
          onClose={() => {
            if (!hasPersonalityTestRemaining) {
              modal.close("care-result");
              return;
            }

            personalityTestModal.start();
            modal.close("care-result");
          }}
        />
      ),
      dimClosable: false,
    });
  }, [
    careForCat,
    modal,
    hasPersonalityTestRemaining,
    personalityTestModal,
    analytics,
  ]);

  return (
    <Button
      size="big"
      disabled={careForCat.status === "pending" || cooldown.activated}
      onClick={handleClick}
    >
      {careForCat.status === "pending" ? (
        "Loading..."
      ) : cooldown.activated ? (
        <CareCooldown catId={catId} />
      ) : (
        "Take care of cat"
      )}
    </Button>
  );
}
