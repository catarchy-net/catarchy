import Elysia, { t } from "elysia";

export const personalityModel = new Elysia({
  name: "model.personality",
}).model({
  // ── GET /personality ──────────────────────────────────────────────────────

  "personality.get.query": t.Object({
    catId: t.String({
      description: "ID of the cat",
      examples: ["01970f3a-2b4c-7e8f-9abc-def012345678"],
    }),
  }),

  "personality.get.response": t.Object({
    openness: t.Number({ minimum: 0, maximum: 10, examples: [7] }),
    conscientiousness: t.Number({ minimum: 0, maximum: 10, examples: [6] }),
    extraversion: t.Number({ minimum: 0, maximum: 10, examples: [5] }),
    agreeableness: t.Number({ minimum: 0, maximum: 10, examples: [8] }),
    neuroticism: t.Number({ minimum: 0, maximum: 10, examples: [3] }),
  }),

  // ── GET /personality/progress ──────────────────────────────────────────────

  "personality.progress.query": t.Object({
    catId: t.String({
      description: "ID of the cat",
      examples: ["01970f3a-2b4c-7e8f-9abc-def012345678"],
    }),
  }),

  "personality.progress.response": t.Object({
    totalCount: t.Number({
      description: "Total number of personality test questions",
      examples: [50],
    }),
    remainingCount: t.Number({
      description: "Number of questions not yet answered",
      examples: [30],
    }),
  }),

  // ── GET /personality/question ──────────────────────────────────────────────

  "personality.question.query": t.Object({
    catId: t.String({
      description: "ID of the cat",
      examples: ["01970f3a-2b4c-7e8f-9abc-def012345678"],
    }),
  }),

  "personality.question.response": t.Object({
    id: t.String({
      description: "Question ID",
      examples: ["E1"],
    }),
    text: t.String({
      description: "Question text",
      examples: ["Am the life of the party."],
    }),
    descriptions: t.Tuple(
      [t.String(), t.String(), t.String(), t.String(), t.String()],
      { description: "Answer level descriptions indexed 0–4 (Very Inaccurate to Very Accurate)" },
    ),
  }),

  // ── POST /personality/answer ───────────────────────────────────────────────

  "personality.answer.body": t.Object({
    catId: t.String({
      description: "ID of the cat",
      examples: ["01970f3a-2b4c-7e8f-9abc-def012345678"],
    }),
    questionId: t.String({
      description: "ID of the question being answered",
      examples: ["E1"],
    }),
    answer: t.Number({
      minimum: 1,
      maximum: 5,
      description: "Answer value (1=Very Inaccurate, 5=Very Accurate)",
      examples: [3],
    }),
  }),

  "personality.answer.response": t.Object({
    isCompleted: t.Boolean({
      description: "Whether all questions have been answered and the personality has been calculated",
    }),
  }),

  // ── Common ─────────────────────────────────────────────────────────────────

  "personality.not-found": t.Object({
    message: t.String({
      description: "No unanswered questions remain",
      examples: ["No questions remaining."],
    }),
  }),

  "personality.forbidden": t.Object({
    message: t.String({
      description: "Cat does not belong to the authenticated user, or the personality test is already completed",
      examples: ["Can't get question for a cat that doesn't belong to you"],
    }),
  }),

  "personality.bad-request": t.Object({
    message: t.String({
      description: "Submitted questionId does not match the next expected question",
      examples: ["Submitted question does not match the next expected question"],
    }),
  }),
});
