import Elysia, { t } from "elysia";
import { CatSex } from "../../infra/db/schema";
import { AgeGroup } from "./constants/growth";

export const careRecordItemSchema = t.Object({
  id: t.String({
    description: "UUIDv7 identifier of the care record",
    examples: ["01970f3a-2b4c-7e8f-9abc-def012345678"],
  }),
  catId: t.String({
    description: "ID of the cat",
    examples: ["01970f3a-2b4c-7e8f-9abc-def012345678"],
  }),
  servantId: t.String({
    description: "ID of the servant who cared",
    examples: ["01970f3a-2b4c-7e8f-9abc-def012345678"],
  }),
  growth: t.Object({
    value: t.Number({ examples: [120] }),
    age: t.Object({
      value: t.Number({ examples: [10] }),
      int: t.Number({ examples: [10] }),
      fraction: t.Object({
        numerator: t.Number({ examples: [0] }),
        denominator: t.Literal(12),
      }),
    }),
    ageGroup: t.Enum(AgeGroup),
    delta: t.Number({ examples: [10] }),
  }),
  growthDelta: t.Number({
    description: "Growth points gained from this care",
    examples: [10],
  }),
  emotion: t.Object({
    value: t.Number({ examples: [75] }),
    emoji: t.String({ examples: ["😄"] }),
    level: t.String({ examples: ["happy"] }),
    delta: t.Number({ examples: [5] }),
  }),
  emotionDelta: t.Number({
    description: "Emotion points changed from this care",
    examples: [5],
  }),
  message: t.Nullable(
    t.String({
      description: "AI-generated care message",
      examples: ["Mochi purrs softly."],
    }),
  ),
  caredAt: t.Nullable(
    t.String({
      description: "ISO timestamp of when the care occurred",
      examples: ["2026-05-15T12:00:00.000Z"],
    }),
  ),
});

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

  "cat.list.response": t.Array(
    t.Object({
      id: t.String({
        description: "The unique identifier of the cat",
        examples: ["123e4567-e89b-12d3-a456-426614174000"],
      }),
      name: t.String({
        description: "The name of the cat",
        examples: ["Mochi"],
      }),
      sex: t.Nullable(
        t.Enum(CatSex, {
          description: "The sex of the cat",
          examples: ["MALE"],
        }),
      ),
    }),
  ),

  // ── GET /cat/:catId ────────────────────────────────────────────────────────

  "cat.info.response": t.Object({
    id: t.String({
      description: "The unique identifier of the cat",
      examples: ["123e4567-e89b-12d3-a456-426614174000"],
    }),
    name: t.String({
      description: "The name of the cat",
      examples: ["Mochi"],
    }),
    sex: t.Nullable(
      t.Enum(CatSex, {
        description: "The sex of the cat",
        examples: ["MALE"],
      }),
    ),
    stat: t.Object({
      growth: t.Object({
        ageGroup: t.Enum(AgeGroup, {
          description: "Age group of the cat",
          examples: ["KITTEN"],
        }),
        value: t.Number({
          description: "Current growth points",
          examples: [120],
        }),
        age: t.Object({
          value: t.Number({
            description: "Growth divided by 12, rounded to 2 decimal places",
            examples: [10.0],
          }),
          int: t.Number({
            description: "Integer part of growth / 12",
            examples: [10],
          }),
          fraction: t.Object({
            numerator: t.Number({
              description: "Remainder of growth divided by 12",
              examples: [0],
            }),
            denominator: t.Literal(12),
          }),
        }),
      }),
      emotion: t.Object({
        value: t.Number({
          description: "Current emotion score (0-100)",
          examples: [85],
        }),
        emoji: t.String({
          description: "Emoji representing the emotion level",
          examples: ["😄"],
        }),
        level: t.String({
          description: "Emotion level label",
          examples: ["happy"],
        }),
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
      maxLength: 50,
      description: "The name for the new cat",
      examples: ["Mochi"],
      error: "Cat name must be between 1 and 50 characters",
    }),
    sex: t.Enum(CatSex, {
      description: "The sex of the cat",
      examples: ["MALE"],
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

  // ── GET /cat/care-records ──────────────────────────────────────────────────

  "cat.care-records.item": careRecordItemSchema,

  // ── POST /cat/care ─────────────────────────────────────────────────────────

  "cat.care.body": t.Object({
    catId: t.String({
      description: "ID of the cat to care for",
      examples: ["123e4567-e89b-12d3-a456-426614174000"],
    }),
    localDateTime: t.Optional(
      t.String({
        description: "User's local datetime",
        examples: ["2026-05-08 09:30:00"],
      }),
    ),
  }),

  "cat.care.response": t.Object({
    growth: t.Object({
      ageGroup: t.Enum(AgeGroup, {
        description: "Age group of the cat after care",
        examples: ["KITTEN"],
      }),
      value: t.Number({
        description: "Updated growth points after care",
        examples: [130],
      }),
      age: t.Object({
        value: t.Number({
          description: "Growth divided by 12, rounded to 2 decimal places",
          examples: [10.83],
        }),
        int: t.Number({
          description: "Integer part of growth / 12",
          examples: [10],
        }),
        fraction: t.Object({
          numerator: t.Number({
            description: "Remainder of growth divided by 12",
            examples: [10],
          }),
          denominator: t.Literal(12),
        }),
      }),
    }),
    emotion: t.Object({
      value: t.Number({
        description: "Updated emotion score after care (0-100)",
        examples: [90],
      }),
      emoji: t.String({
        description: "Emoji representing the emotion level",
        examples: ["😄"],
      }),
      level: t.String({
        description: "Emotion level label",
        examples: ["happy"],
      }),
    }),
    message: t.String({
      description: "AI-generated description of the cat's reaction",
      examples: ["Mochi purrs softly and nuzzles against your hand."],
    }),
  }),
});
