import { z } from "zod";

export enum ENVIRONMENT {
  LOCAL = "local",
  PRODUCTION = "production",
}

export const envSchema = z.object({
  ENVIRONMENT: z.enum(ENVIRONMENT),
  CORS_ORIGIN: z
    .string()
    .transform((v) => v.split(",").map((s) => s.trim()))
    .pipe(z.array(z.url())),
  RESEND_API_KEY: z.string(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  REFRESH_JWT_SECRET: z
    .string()
    .min(32, "REFRESH_JWT_SECRET must be at least 32 characters"),
});

export type Env = z.infer<typeof envSchema>;

export type CloudflareBindings = {
  DB: D1Database;
  RESEND_API_KEY: string;
  JWT_SECRET: string;
  REFRESH_JWT_SECRET: string;
};
