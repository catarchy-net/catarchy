import { env as cfEnv } from "cloudflare:workers";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";

import { createApp } from "@/app";
import { initAI } from "@/infra/ai";
import { initKV } from "@/infra/cache";
import { initDatabase } from "@/infra/db";
import { type CloudflareBindings, initEnv } from "@/lib/env";
import { scheduledHandler } from "@/scheduled";

export type { App } from "@/app";

// Env Initialization
const env = initEnv(cfEnv as Record<string, string> & CloudflareBindings);

// Init Singletons
const bindings = cfEnv as unknown as CloudflareBindings;
initDatabase(bindings.DB);
initKV(bindings.CACHE);
initAI({
  anthropicApiKey: env.ANTHROPIC_API_KEY,
  openaiApiKey: env.OPENAI_API_KEY,
  googleAiApiKey: env.GOOGLE_AI_API_KEY,
  mistralApiKey: env.MISTRAL_API_KEY,
  xaiApiKey: env.XAI_API_KEY,
  alibabaApiKey: env.ALIBABA_API_KEY,
  deepseekApiKey: env.DEEPSEEK_API_KEY,
});

const app = createApp({ adapter: CloudflareAdapter }).compile();

export default {
  fetch: app.fetch.bind(app),
  scheduled: scheduledHandler,
};
