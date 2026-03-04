import { table } from "./schema";
import { spreads } from "./utils";

export const model = {
  insert: spreads(
    {
      user: table.user,
      auth: table.auth,
      emailVerification: table.emailVerification,
    },
    "insert",
  ),
  select: spreads(
    {
      user: table.user,
      auth: table.auth,
      emailVerification: table.emailVerification,
    },
    "select",
  ),
} as const;
