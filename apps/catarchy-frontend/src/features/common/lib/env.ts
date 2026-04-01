import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_FIREBASE_API_KEY: z.string(),
  VITE_FIREBASE_PROJECT_ID: z.string(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  VITE_FIREBASE_APP_ID: z.string(),
  VITE_FIREBASE_VAPID_KEY: z.string(),
});

export type EnvError = { key: string; message: string };

export type EnvResult =
  | { success: true; data: z.infer<typeof envSchema>; errors?: never }
  | { success: false; data?: never; errors: EnvError[] };

function validateEnv(): EnvResult {
  const result = envSchema.safeParse(import.meta.env);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map((issue) => ({
        key: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  return { success: true, data: result.data };
}

export const envResult = validateEnv();
export const env = envResult.success ? envResult.data : (undefined as never);
