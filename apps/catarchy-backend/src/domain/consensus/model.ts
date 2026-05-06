import Elysia, { t } from "elysia";
import { CONSENSUS_DEFINITIONS } from "./definitions";

const consensusKeyEnum = Object.keys(CONSENSUS_DEFINITIONS) as [
  string,
  ...string[],
];

const consensusItem = t.Object({
  key: t.UnionEnum(consensusKeyEnum, { examples: ["CAT.COOLDOWN_HOUR_BETWEEN_CARE"] }),
  value: t.Union([t.String(), t.Number(), t.Boolean()]),
  name: t.String({ examples: ["Care Cooldown Hours"] }),
  purpose: t.String(),
});

export const consensusModel = new Elysia({
  name: "model.consensus",
}).model({
  "consensus.all.response": t.Array(consensusItem),

  "consensus.one.params": t.Object({
    key: t.UnionEnum(consensusKeyEnum, {
      description: "The consensus key to retrieve",
      examples: ["CAT.COOLDOWN_HOUR_BETWEEN_CARE"],
    }),
  }),

  "consensus.one.response": consensusItem,

  "consensus.not-found": t.Object({
    message: t.String({
      examples: ['Consensus key "CAT.COOLDOWN_HOUR_BETWEEN_CARE" not found in database.'],
    }),
  }),
});
