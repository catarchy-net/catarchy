import Elysia, { t } from "elysia";

import { cursorQueryType } from "../../lib/pagination";
import { AgeGroup } from "../cat/lib/growth";

const statType = {
  growth: t.Object({
    value: t.Number(),
    age: t.Object({
      value: t.Number(),
      int: t.Number(),
      fraction: t.Object({ numerator: t.Number(), denominator: t.Literal(12) }),
    }),
    ageGroup: t.Enum(AgeGroup),
  }),
  emotion: t.Object({
    value: t.Number(),
    emoji: t.String(),
    level: t.String(),
  }),
};

export const relationshipItemSchema = t.Object({
  type: t.String(),
  catId: t.String(),
  catName: t.String(),
  catSex: t.Nullable(t.String()),
  ...statType,
  updatedAt: t.Nullable(t.String()),
});

export const friendListItemSchema = t.Object({
  id: t.String(),
  ...relationshipItemSchema.properties,
});

export const historyItemSchema = t.Object({
  id: t.String(),
  catId: t.String(),
  catName: t.String(),
  catSex: t.Nullable(t.String()),
  ...statType,
  type: t.String(),
  createdAt: t.Nullable(t.String()),
});

export const relationshipModel = new Elysia({
  name: "model.relationship",
}).model({
  "relationship.cat-query": t.Object({
    catId: t.String({ description: "ID of the cat" }),
  }),
  "relationship.cat-cursor-query": t.Object({
    catId: t.String({ description: "ID of the cat" }),
    ...cursorQueryType(),
  }),
  "relationship.overview.response": t.Array(relationshipItemSchema),
  "relationship.history-updates.response": t.Object({
    current: t.Nullable(historyItemSchema),
  }),
});
