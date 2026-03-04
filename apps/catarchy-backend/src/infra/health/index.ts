import { Elysia } from "elysia";
import { z } from "zod";
import { type Env } from "../../lib/env";

export const healthRouter = (_env: Env) =>
  new Elysia({ tags: ["Health"] }).get(
    "/health",
    () => ({
      status: "ok" as const,
    }),
    {
      response: {
        200: z.object({
          status: z.literal("ok"),
        }),
      },
      detail: {
        summary: "Health check endpoint",
      },
    },
  );
