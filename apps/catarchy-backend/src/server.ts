import { createApp } from "@/app";
import { initAI } from "@/infra/ai";
import { initEnv } from "@/lib/env";

/**
 * Local development entry point.
 */
const env = initEnv(process.env);

initAI({
  anthropicApiKey: env.ANTHROPIC_API_KEY,
  openaiApiKey: env.OPENAI_API_KEY,
  googleAiApiKey: env.GOOGLE_AI_API_KEY,
  xaiApiKey: env.XAI_API_KEY,
  alibabaApiKey: env.ALIBABA_API_KEY,
  mistralApiKey: env.MISTRAL_API_KEY,
  deepseekApiKey: env.DEEPSEEK_API_KEY,
});

const app = createApp().listen(3000);

console.log(
  `🦊 Catarchy Backend is running at ${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `📖 OpenAPI docs available at http://localhost:${app.server?.port}/openapi`,
);
