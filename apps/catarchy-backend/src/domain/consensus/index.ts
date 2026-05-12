import Elysia, { StatusMap } from "elysia";
import { authGuard } from "../auth/guard";
import type { ConsensusKey } from "./definitions";
import { consensusModel } from "./model";
import { ConsensusService } from "./service";

export const consensusRouter = () => {
  return new Elysia({
    prefix: "/consensus",
    tags: ["Consensus"],
  })
    .use(consensusModel)
    .use(authGuard())
    .get(
      "/",
      async () => {
        return await ConsensusService.getAll();
      },
      {
        response: {
          [StatusMap.OK]: "consensus.all.response",
        },
      },
    )
    .get(
      "/:key",
      async ({ params }) => {
        return await ConsensusService.getOne(params.key as ConsensusKey);
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
