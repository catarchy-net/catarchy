import { createApp } from "./app";
import { envSchema } from "./lib/env";
import { initEmail } from "./infra/email/service";

/**
 * Local development entry point.
 */
const env = envSchema.parse(process.env);
initEmail(env.RESEND_API_KEY);

const app = createApp({ env }).listen(3000);

console.log(
  `🦊 Catarchy Backend is running at ${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `📖 OpenAPI docs available at http://localhost:${app.server?.port}/openapi`,
);
