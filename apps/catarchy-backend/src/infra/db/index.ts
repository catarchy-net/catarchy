import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export * from "./schema";
export * from "./model";

export type Database = ReturnType<typeof drizzle<typeof schema>>;
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

let _db: Database | null = null;

export const initDatabase = (d1: D1Database) => {
  if (_db) return;
  _db = drizzle(d1, { schema });
};

export const getDatabase = (): Database => {
  if (!_db) throw new Error("DB not initialized");
  return _db;
};
