import Elysia, { StatusMap } from "elysia";
import { authGuard } from "../auth/guard";
import type { ConsensusKey } from "./definitions";
import { consensusModel } from "./model";
import { ConsensusRepository } from "./repository";

export const consensusRouter = () => {
  return new Elysia({
    prefix: "/consensus",
    tags: ["Consensus"],
  })
    .decorate("consensusRepository", ConsensusRepository)
    .use(consensusModel)
    .use(authGuard())
    .get(
      "/",
      async ({ consensusRepository }) => {
        return await consensusRepository.getAllValues();
      },
      {
        response: {
          [StatusMap.OK]: "consensus.all.response",
        },
      },
    )
    .get(
      "/:key",
      async ({ consensusRepository, params }) => {
        return await consensusRepository.getValueWithMeta(params.key as ConsensusKey);
      },
      {
        params: "consensus.one.params",
        response: {
          [StatusMap.OK]: "consensus.one.response",
          [StatusMap["Not Found"]]: "consensus.not-found",
        },
      },
    );
};
