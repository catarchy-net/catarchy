import { useModal, useToast } from "@/features/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QuestionStep } from "../components/question-step";
import {
  getCatPersonalityOptions,
  getNextPersonalityQuestionOptions,
  getPersonalityTestProgressOptions,
  submitPersonalityTestAnswerOptions,
} from "../services/personality";

export function usePersonalityTestModal({
  catId,
  answerCount,
  onCompleted,
}: {
  catId: string;
  answerCount?: number;
  onCompleted?: () => void;
}) {
  const toast = useToast();
  const modal = useModal();
  const queryClient = useQueryClient();

  const { data: progressData, refetch: fetchProgress } = useQuery(
    getPersonalityTestProgressOptions({ catId }),
  );

  const { data: questionData, refetch: fetchQuestion } = useQuery({
    ...getNextPersonalityQuestionOptions({ catId }),
    enabled: false,
  });

  const { data: submitAnswerData, mutateAsync: submitAnswer } = useMutation(
    submitPersonalityTestAnswerOptions({
      catId,
    }),
  );

  const isCompleted = progressData?.remainingCount === 0;

  async function start(answeredInSession = 0) {
    if (isCompleted) {
      toast.push("You have already completed the personality test.", {
        id: "personality-test-completed",
      });

      return;
    }

    const { data, error } = await fetchQuestion();
    const { data: progress } = await fetchProgress();

    if (error) {
      toast.push(
        error.value.message || "Failed to load the question. Please try again.",
        {
          id: "personality-test-question-error",
        },
      );
      return;
    }

    if (!data) {
      toast.push("No question available. Please try again later.", {
        id: "personality-test-no-question",
      });
      return;
    }

    if (!progress) {
      toast.push("Failed to load progress. Please try again.", {
        id: "personality-test-progress-error",
      });
      return;
    }

    modal.open({
      id: `personality-test-modal-${data.id}`,
      header: {
        title: "Personality Test",
      },
      component: (
        <QuestionStep
          question={data?.text || ""}
          totalCount={progress.totalCount}
          currentIndex={progress.totalCount - progress.remainingCount}
          onAnswer={async (answer) => {
            const result = await submitAnswer({
              questionId: data.id,
              answer: answer,
            });

            modal.close(`personality-test-modal-${data.id}`);

            await Promise.all([
              queryClient.invalidateQueries(
                getPersonalityTestProgressOptions({ catId }),
              ),
              queryClient.invalidateQueries(
                getNextPersonalityQuestionOptions({ catId }),
              ),
            ]);

            if (!result?.isCompleted) {
              await queryClient.invalidateQueries(
                getCatPersonalityOptions({ catId }),
              );
              const nextCount = answeredInSession + 1;
              if (!answerCount || nextCount < answerCount) {
                start(nextCount);
              }
            } else {
              onCompleted?.();
            }
          }}
          descriptions={data?.descriptions}
        />
      ),
      dimClosable: false,
    });
  }

  return {
    start,
    currentQuestion: questionData,
  };
}
