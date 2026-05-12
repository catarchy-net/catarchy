import { StatusMap, t } from "elysia";

const messageSchema = t.Object({ message: t.String() });

export const withCommonError = <const T extends Record<number, unknown>>(
  responses: T,
) => ({
  [StatusMap["Unprocessable Content"]]: messageSchema,
  ...responses,
});
