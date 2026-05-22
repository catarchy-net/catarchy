import { api } from "@/features/common";
import { mutationOptions, queryOptions } from "@tanstack/react-query";

type CatPersonalityResult = Awaited<ReturnType<typeof api.personality.get>>;
type CatPersonalityResponse = CatPersonalityResult["data"];
type CatPersonalityError = CatPersonalityResult["error"];

type PersonalityProgressResult = Awaited<
  ReturnType<typeof api.personality.progress.get>
>;
type PersonalityProgressResponse = PersonalityProgressResult["data"];
type PersonalityProgressError = PersonalityProgressResult["error"];

type PersonalityQuestionResult = Awaited<
  ReturnType<typeof api.personality.question.get>
>;
type PersonalityQuestionResponse = PersonalityQuestionResult["data"];
type PersonalityQuestionError = PersonalityQuestionResult["error"];

type SubmitAnswerResult = Awaited<
  ReturnType<typeof api.personality.answer.post>
>;
type SubmitAnswerResponse = SubmitAnswerResult["data"];
type SubmitAnswerError = SubmitAnswerResult["error"];

export type CatPersonality = NonNullable<CatPersonalityResponse>;
export type PersonalityProgress = NonNullable<PersonalityProgressResponse>;
export type PersonalityQuestion = NonNullable<PersonalityQuestionResponse>;

export async function getCatPersonality({ catId }: { catId: string }) {
  const { data, error } = await api.personality.get({
    query: {
      catId,
    },
  });

  if (error) throw error;
  return data;
}

export function getCatPersonalityOptions({ catId }: { catId: string }) {
  return queryOptions<CatPersonalityResponse, CatPersonalityError>({
    queryKey: ["personality", catId],
    queryFn: () => getCatPersonality({ catId }),
  });
}

export async function getPersonalityTestProgress({ catId }: { catId: string }) {
  const { data, error } = await api.personality.progress.get({
    query: {
      catId,
    },
  });

  if (error) throw error;
  return data;
}

export function getPersonalityTestProgressOptions({
  catId,
}: {
  catId: string;
}) {
  return queryOptions<PersonalityProgressResponse, PersonalityProgressError>({
    queryKey: ["personality", "progress", catId],
    queryFn: () => getPersonalityTestProgress({ catId }),
  });
}

export async function getNextPersonalityQuestion({
  catId,
}: {
  catId: string;
}) {
  const { data, error } = await api.personality.question.get({
    query: {
      catId,
    },
  });

  if (error) throw error;
  return data;
}

export function getNextPersonalityQuestionOptions({
  catId,
}: {
  catId: string;
}) {
  return queryOptions<PersonalityQuestionResponse, PersonalityQuestionError>({
    queryKey: ["personality", "question", catId],
    queryFn: () => getNextPersonalityQuestion({ catId }),
  });
}

export async function submitPersonalityTestAnswer({
  catId,
  questionId,
  answer,
}: {
  catId: string;
  questionId: string;
  answer: 1 | 2 | 3 | 4 | 5;
}) {
  const { data, error } = await api.personality.answer.post({
    answer,
    catId,
    questionId,
  });

  if (error) throw error;
  return data;
}

export function submitPersonalityTestAnswerOptions({ catId }: { catId: string }) {
  return mutationOptions<
    SubmitAnswerResponse,
    SubmitAnswerError,
    { questionId: string; answer: 1 | 2 | 3 | 4 | 5 }
  >({
    mutationKey: ["personality", "answer", catId],
    mutationFn: ({ questionId, answer }) =>
      submitPersonalityTestAnswer({ catId, questionId, answer }),
  });
}
