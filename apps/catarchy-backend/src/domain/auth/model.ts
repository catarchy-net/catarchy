import Elysia, { t } from "elysia";

export const authModel = new Elysia({ name: "model.auth" }).model({
  "auth.sign-in-remilianet.body": t.Object({
    accessToken: t.String({
      minLength: 1,
      maxLength: 8192,
      description: "A user-delegated RemiliaNET access token",
    }),
  }),
  "auth.sign-in-remilianet.response": t.Object({
    message: t.String({
      examples: ["Signed in successfully"],
    }),
    userId: t.String(),
    handle: t.String(),
  }),
  "auth.sign-in-remilianet.unauthorized": t.Object({
    message: t.String({
      examples: ["Invalid or expired RemiliaNET token"],
    }),
  }),
  "auth.sign-in-remilianet.bad-gateway": t.Object({
    message: t.String({
      examples: ["RemiliaNET profile request failed"],
    }),
  }),
  "auth.refresh.response": t.Object({
    message: t.String({
      description: "A message confirming successful token refresh",
      examples: ["Token refreshed successfully"],
    }),
  }),
  "auth.refresh.unauthorized": t.Object({
    message: t.String({
      description:
        "A message indicating the refresh token is invalid or expired",
      examples: ["Invalid or expired refresh token"],
    }),
  }),
  "auth.sign-out.response": t.Object({
    message: t.String({
      description: "A message confirming successful sign out",
      examples: ["Signed out successfully"],
    }),
  }),
  "auth.check.response": t.Object({
    ok: t.Boolean({
      description: "Whether the user is authenticated",
      examples: [true],
    }),
    userId: t.String({
      description: "The ID of the authenticated user",
    }),
    handle: t.String({
      description: "The handle of the authenticated user",
    }),
  }),
  "auth.check.unauthorized": t.Object({
    message: t.String({
      description: "A message indicating the user is not authenticated",
      examples: ["Unauthorized"],
    }),
  }),
});
