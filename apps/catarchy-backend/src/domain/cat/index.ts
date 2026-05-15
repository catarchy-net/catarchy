import Elysia, { StatusMap, t } from "elysia";
import { cursorQueryType, cursorResultType } from "../../lib/pagination";
import { withCommonError } from "../../lib/response";
import { authGuard } from "../auth/guard";
import { CatCareService } from "./cat-care.service";
import { careRecordItemSchema, catModel } from "./model";
import { CatService } from "./service";

export const catRouter = () => {
  return new Elysia({
    prefix: "/cat",
    tags: ["Cat"],
  })
    .decorate("catService", CatService)
    .decorate("catCareService", CatCareService)
    .use(catModel)
    .use(authGuard())
    .get(
      "/",
      async ({ user, catService }) => {
        return await catService.getCatInfo({ userId: user.id });
      },
      {
        response: withCommonError({
          [StatusMap.OK]: "cat.info.response",
          [StatusMap["Not Found"]]: "cat.not-found",
        }),
      },
    )
    .post(
      "/",
      async ({ user, catService, body }) => {
        return await catService.summonCat({
          userId: user.id,
          name: body.name,
          sex: body.sex,
        });
      },
      {
        body: "cat.summon.body",
        response: withCommonError({
          [StatusMap.OK]: "cat.summon.response",
          [StatusMap.Conflict]: "cat.conflict",
        }),
      },
    )
    .post(
      "/care",
      async ({ user, catCareService, body }) => {
        return await catCareService.careForCat({
          userId: user.id,
          promptConfig: { localDateTime: body.localDateTime },
        });
      },
      {
        body: "cat.care.body",
        response: withCommonError({
          [StatusMap.OK]: "cat.care.response",
          [StatusMap["Not Found"]]: "cat.not-found",
          [StatusMap.Conflict]: "cat.conflict",
        }),
      },
    )
    .get(
      "/care-records",
      async ({ user, query, catCareService }) => {
        const { limit, cursor } = query;

        return await catCareService.getCareRecords({
          userId: user.id,
          catId: query.catId,
          limit,
          cursor,
        });
      },
      {
        query: t.Object({
          ...cursorQueryType({
            cursor: {
              description:
                "uuidv7 string representing the last care record from the previous page. If not provided, it will return the first page.",
            },
            limit: {
              description: "number of care records to return",
              examples: [10],
            },
          }),
          catId: t.String({
            description: "ID of the cat to retrieve care records for",
          }),
        }),
        response: withCommonError(cursorResultType(careRecordItemSchema)),
      },
    );
};
