import { Elysia } from "elysia";
import { authRouter } from "./domain/auth";
import { catRouter } from "./domain/cat";
import { consensusRouter } from "./domain/consensus";
import { notificationRouter } from "./domain/notification";
import { personalityRouter } from "./domain/personality";
import { userRouter } from "./domain/user";
import { emailRouter } from "./infra/email";
import { healthRouter } from "./infra/health";
import { openapiPlugin } from "./infra/openapi";
import { corsPlugin } from "./plugin/cors";
import { errorHandler } from "./plugin/error-handler";
import { requestId } from "./plugin/request-id";

type CreateAppConfig = {
  adapter?: NonNullable<ConstructorParameters<typeof Elysia>[0]>["adapter"];
};

export const createApp = ({ adapter }: CreateAppConfig = {}) => {
  return new Elysia({ adapter, normalize: false })
    .use(requestId)
    .use(errorHandler)
    .use(openapiPlugin())
    .use(corsPlugin)
    .use(healthRouter())
    .use(authRouter())
    .use(catRouter())
    .use(emailRouter())
    .use(userRouter())
    .use(notificationRouter())
    .use(consensusRouter())
    .use(personalityRouter());
};

export type App = ReturnType<typeof createApp>;
