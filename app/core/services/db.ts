import { drizzle } from "drizzle-orm/better-sqlite3";

import { env } from "~/config/env";

import * as schema from "../../../drizzle/schema";

const db = drizzle(env.DATABASE_URL, { schema });

export { db, schema };
