import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/infra/db/schema.ts",
  out: "./src/infra/db/out",
  dialect: "sqlite",
});
