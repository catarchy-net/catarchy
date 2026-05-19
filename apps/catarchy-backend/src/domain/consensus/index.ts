import Elysia, { StatusMap } from "elysia";
import { withCommonError } from "../../lib/response";
import { authGuard } from "../auth/guard";
import type { ConsensusKey } from "./definitions";
import { consensusModel } from "./model";
import { ConsensusService } from "./service";

export const consensusRouter = () => {
  return new Elysia({
    prefix: "/consensus",
    tags: ["Consensus"],
  })
    .decorate("consensusService", ConsensusService)
    .use(consensusModel)
    .use(authGuard())
    .get(
      "/",
      async ({ consensusService }) => {
        return await consensusService.getAll();
      },
      {
        response: withCommonError({
          [StatusMap.OK]: "consensus.all.response",
        }),
      },
    )
    .get(
      "/:key",
      async ({ params, consensusService }) => {
        return await consensusService.getOne(params.key as ConsensusKey);
      },
      {
        params: "consensus.one.params",
        response: withCommonError({
          [StatusMap.OK]: "consensus.one.response",
          [StatusMap["Not Found"]]: "consensus.not-found",
        }),
      },
    );
};
