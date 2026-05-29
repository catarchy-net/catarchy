import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { useAnalytics } from "@/features/analytics";
import {
  careForCatOptions,
  catInfoOptions,
  useCareCooldown,
} from "@/features/cat";
import {
  getPersonalityTestProgressOptions,
  usePersonalityTestModal,
} from "@/features/personality";

import { RelationshipMatchedModal } from "../components/relationship-matched-modal";
import { StatusReportModal } from "../components/status-report-modal";
import { useFriendMatchPolling } from "./use-friend-match-polling";
import type { ModalStep } from "./use-modal-sequence";
import { useModalSequence } from "./use-modal-sequence";

export function useCareAction({ catId }: { catId: string }) {
  const queryClient = useQueryClient();
  const analytics = useAnalytics();
  const sequence = useModalSequence();

  const [friendMatch, setFriendMatch] = useState<{ startedAt: number } | null>(
    null,
  );
  useFriendMatchPolling({
    catId,
    enabled: friendMatch !== null,
    startedAt: friendMatch?.startedAt,
  });

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

  const care = useCallback(async () => {
    analytics.click({ eventName: "care_button" });
    const data = await careForCat.mutateAsync();

    if (!data) {
      return;
    }

    const startedAt = Date.now();
    setFriendMatch({ startedAt });

    const steps: ModalStep[] = [
      {
        id: "care-result",
        header: { title: "STATUS REPORT" },
        dimClosable: false,
        render: ({ next }) => (
          <StatusReportModal
            careRecordId={data.careRecordId}
            mood={data.emotion.emoji}
            closeText="Next"
            onClose={next}
          />
        ),
      },
      {
        id: "friend-matched",
        header: { title: "STATUS REPORT" },
        dimClosable: false,
        skip: hasPersonalityTestRemaining,
        render: ({ next, done }) => (
          <RelationshipMatchedModal
            catId={catId}
            startedAt={startedAt}
            closeText={hasPersonalityTestRemaining ? "Next" : "Close"}
            onClose={hasPersonalityTestRemaining ? next : done}
          />
        ),
      },
      {
        id: "personality-test",
        render: () => {
          personalityTestModal.start();
          return null;
        },
      },
    ];

    sequence.start(steps);
  }, [
    analytics,
    careForCat,
    catId,
    hasPersonalityTestRemaining,
    personalityTestModal,
    sequence,
  ]);

  return {
    care,
    isCaring: careForCat.status === "pending",
    cooldown,
  };
}
