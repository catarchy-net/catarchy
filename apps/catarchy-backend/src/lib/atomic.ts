import type { Database } from "../infra/db";
import type { BatchItem } from "drizzle-orm/batch";

/**
 * Executes multiple queries atomically.
 *
 * Current implementation: D1 `db.batch()` — best-effort atomic (no true rollback).
 * TODO: When migrating to Postgres, replace body with:
 *   return db.transaction(async (tx) => { ... })
 */
export const runAtomic = <
  T extends [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]],
>(
  db: Database,
  queries: readonly [...T],
) => {
  return db.batch(queries);
};
