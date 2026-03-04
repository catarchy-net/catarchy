import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { createApp } from "./app";
import { envSchema, type CloudflareBindings } from "./lib/env";
import { initDatabase } from "./infra/db";
import { initEmail } from "./infra/email/service";

export type { App } from "./app";

/**
 * Cloudflare Worker entry point.
 */
export default {
  fetch(
    request: Request,
    cloudflareEnv: Record<string, string> & CloudflareBindings,
  ) {
    const env = envSchema.safeParse(cloudflareEnv);

    if (!env.success || !env.data) {
      console.error("❌ Invalid environment variables:", env.error?.message);
      return new Response("Internal Server Error", { status: 500 });
    }

    initDatabase(cloudflareEnv.DB);
    initEmail(env.data.RESEND_API_KEY);

    return createApp({ adapter: CloudflareAdapter, env: env.data }).fetch(
      request,
    );
  },
};
