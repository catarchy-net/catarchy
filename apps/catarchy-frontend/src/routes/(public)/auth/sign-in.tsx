import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { SignInScreen } from "@/features/auth";

export const Route = createFileRoute("/(public)/auth/sign-in")({
  component: SignInScreen,
  validateSearch: z.object({
    email: z.email().optional(),
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),
});
