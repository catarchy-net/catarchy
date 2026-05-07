import Elysia, { t } from "elysia";
import { AgeGroup } from "./constants/growth";

export const catModel = new Elysia({
  name: "model.cat",
}).model({
  // ── Common ─────────────────────────────────────────────────────────────────

  "cat.not-found": t.Object({
    message: t.String({
      description: "Cat not found message",
      examples: ["Cat not found for the user."],
    }),
  }),

  "cat.conflict": t.Object({
    message: t.String({
      description: "Conflict message",
      examples: ["You already have a cat."],
    }),
    data: t.Optional(t.Unknown()),
  }),

  // ── GET /cat ───────────────────────────────────────────────────────────────

  "cat.info.response": t.Object({
    id: t.String({
      description: "The unique identifier of the cat",
      examples: ["123e4567-e89b-12d3-a456-426614174000"],
    }),
    name: t.String({
      description: "The name of the cat",
      examples: ["Mochi"],
    }),
    stat: t.Object({
      growth: t.Object({
        age: t.Enum(AgeGroup, { description: "Age group of the cat", examples: ["KITTEN"] }),
        value: t.Number({ description: "Current growth points", examples: [120] }),
      }),
      emotion: t.Object({
        value: t.Number({ description: "Current emotion score (0-100)", examples: [85] }),
        emoji: t.String({ description: "Emoji representing the emotion level", examples: ["😄"] }),
        level: t.String({ description: "Emotion level label", examples: ["happy"] }),
      }),
    }),
    lastCaredAt: t.Nullable(
      t.String({
        description: "ISO timestamp of the last care",
        examples: ["2026-03-13T12:00:00.000Z"],
      }),
    ),
  }),

  // ── POST /cat ──────────────────────────────────────────────────────────────

  "cat.summon.body": t.Object({
    name: t.String({
      minLength: 1,
      maxLength: 20,
      description: "The name for the new cat",
      examples: ["Mochi"],
      error: "Cat name must be between 1 and 20 characters",
    }),
  }),

  "cat.summon.response": t.Object({
    id: t.String({
      description: "The unique identifier of the newly summoned cat",
      examples: ["123e4567-e89b-12d3-a456-426614174000"],
    }),
    name: t.String({
      description: "The name of the cat",
      examples: ["Mochi"],
    }),
    servantId: t.String({
      description: "The owner's user ID",
      examples: ["123e4567-e89b-12d3-a456-426614174000"],
    }),
  }),

  // ── POST /cat/care ─────────────────────────────────────────────────────────

  "cat.care.response": t.Object({
    growth: t.Object({
      age: t.Enum(AgeGroup, { description: "Age group of the cat after care", examples: ["KITTEN"] }),
      value: t.Number({ description: "Updated growth points after care", examples: [130] }),
    }),
    emotion: t.Object({
      value: t.Number({ description: "Updated emotion score after care (0-100)", examples: [90] }),
      emoji: t.String({ description: "Emoji representing the emotion level", examples: ["😄"] }),
      level: t.String({ description: "Emotion level label", examples: ["happy"] }),
    }),
    message: t.String({
      description: "AI-generated description of the cat's reaction",
      examples: ["Mochi purrs softly and nuzzles against your hand."],
    }),
  }),
});
