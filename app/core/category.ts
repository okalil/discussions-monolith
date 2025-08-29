import { getContext } from "./context";
import { schema } from "./services/db";

export async function getCategories() {
  const { db } = getContext();
  return await db.select().from(schema.categories);
}
