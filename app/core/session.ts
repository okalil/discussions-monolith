import { and, eq, getTableColumns, gt } from "drizzle-orm";

import { getContext } from "./context";
import { schema } from "./services/db";

const expirationTime = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function createSession(userId: number) {
  const { db } = getContext();
  const [session] = await db
    .insert(schema.sessions)
    .values({
      userId,
      expires: new Date(Date.now() + expirationTime).toISOString(),
    })
    .returning();
  return session;
}

export async function getSession(sessionId: string) {
  const { db } = getContext();
  const sessions = await db
    .select({
      ...getTableColumns(schema.sessions),
      user: getTableColumns(schema.users),
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(
      and(
        eq(schema.sessions.id, sessionId),
        gt(schema.sessions.expires, new Date().toISOString())
      )
    )
    .limit(1);
  return sessions.at(0);
}

export async function deleteSession(sessionId: string) {
  const { db } = getContext();
  await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
}
