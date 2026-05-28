import Elysia, { StatusMap } from "elysia";

import { cursorResultType } from "../../lib/pagination";
import { withCommonError } from "../../lib/response";
import { authGuard } from "../auth/guard";
import {
  friendListItemSchema,
  historyItemSchema,
  relationshipModel,
} from "./model";
import { RelationshipService } from "./service";

export const relationshipRouter = () => {
  return new Elysia({
    prefix: "/relationship",
    tags: ["Relationship"],
  })
    .decorate("relationshipService", RelationshipService)
    .use(authGuard())
    .use(relationshipModel)
    .get(
      "/",
      async ({ query, relationshipService }) => {
        return await relationshipService.getOverview({ catId: query.catId });
      },
      {
        query: "relationship.cat-query",
        response: withCommonError({
          [StatusMap.OK]: "relationship.overview.response",
        }),
      },
    )
    .get(
      "/list/friend",
      async ({ query, relationshipService }) => {
        return await relationshipService.getFriendList({
          catId: query.catId,
          cursor: query.cursor,
          limit: query.limit,
        });
      },
      {
        query: "relationship.cat-cursor-query",
        response: withCommonError({
          [StatusMap.OK]: cursorResultType(friendListItemSchema),
        }),
      },
    )
    .get(
      "/history",
      async ({ query, user, relationshipService }) => {
        return await relationshipService.getHistory({
          catId: query.catId,
          userId: user.id,
          cursor: query.cursor,
          limit: query.limit,
        });
      },
      {
        query: "relationship.cat-cursor-query",
        response: withCommonError({
          [StatusMap.OK]: cursorResultType(historyItemSchema),
        }),
      },
    )
    .get(
      "/history/updates",
      async ({ query, user, relationshipService }) => {
        return await relationshipService.getUpdates({
          catId: query.catId,
          userId: user.id,
        });
      },
      {
        query: "relationship.cat-query",
        response: withCommonError({
          [StatusMap.OK]: "relationship.history-updates.response",
        }),
      },
    );
};
