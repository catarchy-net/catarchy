import { ChronicleEventType } from "@catarchy/shared/constants/chronicle";
import Elysia, { t } from "elysia";

import { cursorQueryType, cursorResultType } from "@/lib/pagination";

export const chronicleItemSchema = t.Object({
  id: t.String({
    description: "UUIDv7 identifier of the chronicle event",
    examples: ["01970f3a-2b4c-7e8f-9abc-def012345678"],
  }),
  type: t.Enum(ChronicleEventType, {
    description: "Type of the chronicle event",
    examples: ["FRIENDSHIP"],
  }),
  body: t.Union([
    t.Object({
      type: t.Literal("AGE_UP"),
      catId: t.String(),
      catName: t.String(),
      age: t.Number(),
    }),
    t.Object({
      type: t.Literal("FRIENDSHIP"),
      catId: t.String(),
      catName: t.String(),
      targetCatId: t.String(),
      targetCatName: t.String(),
    }),
    t.Object({
      type: t.Literal("LOVE"),
      catId: t.String(),
      catName: t.String(),
      targetCatId: t.String(),
      targetCatName: t.String(),
    }),
  ]),
  createdAt: t.Nullable(
    t.String({
      description: "ISO timestamp of when the event occurred",
      examples: ["2026-05-15T12:00:00.000Z"],
    }),
  ),
});

export const chronicleModel = new Elysia({
  name: "model.chronicle",
}).model({
  // ── GET /chronicle ─────────────────────────────────────────────────────────

  "chronicle.list.query": t.Object({
    ...cursorQueryType({
      cursor: {
        description:
          "uuidv7 string representing the last chronicle from the previous page.",
      },
      limit: {
        description: "Number of chronicle items to return",
        examples: [20],
      },
    }),
    type: t.Optional(
      t.Enum(ChronicleEventType, { description: "Filter by event type" }),
    ),
  }),

  "chronicle.list.response": cursorResultType(chronicleItemSchema),
});
