import Elysia, { StatusMap } from "elysia";
import { NotFoundError } from "../../lib/error";
import { withCommonError } from "../../lib/response";
import { authGuard } from "../auth/guard";
import { personalityModel } from "./model";
import { PersonalityService } from "./service";

export const personalityRouter = () => {
  return new Elysia({
    prefix: "/personality",
    tags: ["Personality"],
  })
    .decorate("personalityService", PersonalityService)
    .use(personalityModel)
    .use(authGuard())
    .get(
      "/",
      async ({ user, query, personalityService }) => {
        const result = await personalityService.getCatPersonality({
          userId: user.id,
          catId: query.catId,
        });

        if (!result) {
          throw new NotFoundError("Personality not found.");
        }

        return result;
      },
      {
        query: "personality.get.query",
        response: withCommonError({
          [StatusMap.OK]: "personality.get.response",
          [StatusMap["Not Found"]]: "personality.not-found",
          [StatusMap.Forbidden]: "personality.forbidden",
        }),
      },
    )
    .get(
      "/progress",
      async ({ user, query, personalityService }) => {
        return await personalityService.getProgress({
          userId: user.id,
          catId: query.catId,
        });
      },
      {
        query: "personality.progress.query",
        response: withCommonError({
          [StatusMap.OK]: "personality.progress.response",
          [StatusMap.Forbidden]: "personality.forbidden",
        }),
      },
    )
    .get(
      "/question",
      async ({ user, query, personalityService }) => {
        const result = await personalityService.getNextQuestion({
          userId: user.id,
          catId: query.catId,
        });

        if (!result) {
          throw new NotFoundError("No questions remaining.");
        }

        return {
          id: result.id,
          text: result.text,
          descriptions: result.descriptions,
        };
      },
      {
        query: "personality.question.query",
        response: withCommonError({
          [StatusMap.OK]: "personality.question.response",
          [StatusMap["Not Found"]]: "personality.not-found",
          [StatusMap.Forbidden]: "personality.forbidden",
        }),
      },
    )
    .post(
      "/answer",
      async ({ user, body, personalityService }) => {
        return await personalityService.submitAnswer({
          userId: user.id,
          catId: body.catId,
          questionId: body.questionId,
          answer: body.answer,
        });
      },
      {
        body: "personality.answer.body",
        response: withCommonError({
          [StatusMap.OK]: "personality.answer.response",
          [StatusMap["Bad Request"]]: "personality.bad-request",
          [StatusMap["Not Found"]]: "personality.not-found",
          [StatusMap.Forbidden]: "personality.forbidden",
        }),
      },
    );
};
