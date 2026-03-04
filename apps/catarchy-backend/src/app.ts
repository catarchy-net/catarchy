import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { type Env } from "./lib/env";
import { errorHandler } from "./plugin/error-handler";
import { healthRouter } from "./infra/health";
import { openapiPlugin } from "./infra/openapi";
import { authRouter } from "./domain/auth";
import { emailRouter } from "./infra/email";

// Types
type CreateAppConfig = {
  env: Env;
  adapter?: NonNullable<ConstructorParameters<typeof Elysia>[0]>["adapter"];
};

// App factory
export const createApp = ({ env, adapter }: CreateAppConfig) => {
  return new Elysia({ adapter, aot: false, normalize: false })
    .get("/favicon.ico", () => null)
    .use(errorHandler)
    .use(openapiPlugin(env))
    .use(cors({ origin: env.CORS_ORIGIN }))
    .use(healthRouter(env))
    .use(authRouter(env))
    .use(emailRouter(env));
};

// App type export
export type App = ReturnType<typeof createApp>;
