import { openapi } from "@elysiajs/openapi";
import { ENVIRONMENT, type Env } from "../../lib/env";

export const openapiPlugin = (env: Env) =>
  openapi({
    enabled: env.ENVIRONMENT === ENVIRONMENT.LOCAL,
    documentation: {
      info: {
        title: "Catarchy API",
        version: "1.0.0",
        description: "API documentation for Catarchy Backend",
      },
    },
  });
