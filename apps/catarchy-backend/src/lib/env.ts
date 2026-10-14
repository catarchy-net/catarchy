import { z } from "zod";

export enum ENVIRONMENT {
  LOCAL = "local",
  PRODUCTION = "production",
}

export const envSchema = z
  .object({
    ENVIRONMENT: z.enum([ENVIRONMENT.LOCAL, ENVIRONMENT.PRODUCTION]),
    CORS_ORIGIN: z
      .string()
      .transform((v) => v.split(",").map((s) => s.trim()))
      .pipe(z.array(z.url())),
    ANTHROPIC_API_KEY: z.string(),
    OPENAI_API_KEY: z.string().optional(),
    GOOGLE_AI_API_KEY: z.string().optional(),
    MISTRAL_API_KEY: z.string().optional(),
    DEEPSEEK_API_KEY: z.string().optional(),
    ALIBABA_API_KEY: z.string().optional(),
    XAI_API_KEY: z.string().optional(),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    REFRESH_JWT_SECRET: z
      .string()
      .min(32, "REFRESH_JWT_SECRET must be at least 32 characters"),
    FIREBASE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
    FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().optional(),
  })
  .refine(
    (data) =>
      data.OPENAI_API_KEY ||
      data.GOOGLE_AI_API_KEY ||
      data.MISTRAL_API_KEY ||
      data.DEEPSEEK_API_KEY ||
      data.ALIBABA_API_KEY ||
      data.XAI_API_KEY,
    {
      message:
        "At least one of OPENAI_API_KEY, GOOGLE_AI_API_KEY, MISTRAL_API_KEY, DEEPSEEK_API_KEY, ALIBABA_API_KEY, or XAI_API_KEY must be provided",
      path: ["apiKeys"],
    },
  );

export type Env = z.infer<typeof envSchema>;

export type CloudflareBindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY?: string;
  GOOGLE_AI_API_KEY?: string;
  MISTRAL_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  ALIBABA_API_KEY?: string;
  XAI_API_KEY?: string;
  JWT_SECRET: string;
  REFRESH_JWT_SECRET: string;
  FIREBASE_SERVICE_ACCOUNT_EMAIL?: string;
  FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?: string;
};

let _env: Env | null = null;

export function initEnv(raw: unknown): Env {
  if (_env) return _env;
  _env = envSchema.parse(raw);
  return _env;
}

export function getEnv(): Env {
  if (!_env) {
    // fallback: process.env (local dev without explicit initEnv call)
    _env = envSchema.parse(process.env);
  }
  return _env;
}
