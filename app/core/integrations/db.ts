import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

import { drizzle } from "drizzle-orm/d1";

import { schema } from "./db/schema";

export type DatabaseClient = BaseSQLiteDatabase<
  "async",
  unknown,
  typeof schema
>;

export function createDatabaseClient(d1: D1Database): DatabaseClient {
  return drizzle(d1, { schema });
}
