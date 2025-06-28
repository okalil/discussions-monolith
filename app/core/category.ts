import { db, schema } from "./services/db";

export async function getCategories() {
  return await db.select().from(schema.categories);
}
