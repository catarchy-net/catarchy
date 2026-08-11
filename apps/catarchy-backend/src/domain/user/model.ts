import Elysia, { t } from "elysia";

export const userModel = new Elysia({
  name: "model.user",
}).model({
  "user.not-found": t.Object({
    message: t.String({
      description: "A message indicating that the user was not found",
      examples: ["User not found"],
    }),
  }),
  "user.current-user.response": t.Object({
    id: t.String({
      description: "The unique identifier of the user",
      examples: ["123e4567-e89b-12d3-a456-426614174000"],
    }),
    email: t.Nullable(
      t.String({
        format: "email",
        description: "The email address of the user",
        examples: ["user@example.com"],
      }),
    ),
    handle: t.String({
      description: "The unique handle/username of the user",
      examples: ["user123"],
    }),
    remiliaNickname: t.Nullable(
      t.String({
        description: "The user's RemiliaNET display name",
        examples: ["Remilia"],
      }),
    ),
    createdAt: t.Nullable(
      t.String({
        description: "The timestamp at which the user account was created",
        examples: ["2026-03-05T00:00:00"],
      }),
    ),
    updatedAt: t.Nullable(
      t.String({
        description: "The timestamp at which the user account was last updated",
        examples: ["2026-03-05T00:00:00"],
      }),
    ),
  }),
});
