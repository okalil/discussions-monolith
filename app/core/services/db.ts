import { drizzle } from "drizzle-orm/d1";

import * as schema from "../../../drizzle/schema";

export function createDatabaseClient(d1: D1Database) {
  return drizzle(d1);
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export { schema };
