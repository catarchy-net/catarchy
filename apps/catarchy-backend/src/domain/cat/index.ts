import Elysia, { StatusMap } from "elysia";
import { authGuard } from "../auth/guard";
import { CatCareService } from "./cat-care.service";
import { catModel } from "./model";
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
        response: {
          [StatusMap.OK]: "cat.info.response",
          [StatusMap["Not Found"]]: "cat.not-found",
        },
      },
    )
    .post(
      "/",
      async ({ user, catService, body }) => {
        return await catService.summonCat({
          userId: user.id,
          name: body.name,
        });
      },
      {
        body: "cat.summon.body",
        response: {
          [StatusMap.OK]: "cat.summon.response",
          [StatusMap.Conflict]: "cat.conflict",
        },
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
        response: {
          [StatusMap.OK]: "cat.care.response",
          [StatusMap["Not Found"]]: "cat.not-found",
          [StatusMap.Conflict]: "cat.conflict",
        },
      },
    );
};
