import { treaty } from "@elysiajs/eden";
import type { App } from "@backend/index";
import { env } from "@/features/config";

export const api = treaty<App>(env.VITE_API_URL);

