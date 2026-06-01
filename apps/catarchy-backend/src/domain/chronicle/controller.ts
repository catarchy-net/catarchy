import { ChronicleEventType } from "@catarchy/shared/constants/chronicle";
import Elysia, { StatusMap } from "elysia";

import { withCommonError } from "@/lib/response";

import { chronicleModel } from "./model";
import { ChronicleService } from "./service";

export const chronicleRouter = () => {
  return new Elysia({
    prefix: "/chronicle",
    tags: ["Chronicle"],
  })
    .decorate("chronicleService", ChronicleService)
    .use(chronicleModel)
    .get(
      "/",
      async ({ chronicleService, query }) => {
        return chronicleService.getChronicles({
          cursor: query.cursor,
          limit: query.limit,
          type: query.type as ChronicleEventType | undefined,
        });
      },
      {
        query: "chronicle.list.query",
        response: withCommonError({
          [StatusMap.OK]: "chronicle.list.response",
        }),
      },
    );
};
