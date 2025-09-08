import { and, eq, getTableColumns, gt } from "drizzle-orm";

import type { DatabaseClient } from "./integrations/db";

import { schema } from "./integrations/db/schema";

const expirationTime = 1000 * 60 * 60 * 24 * 30; // 30 days

export class SessionService {
  constructor(private db: DatabaseClient) {}

  async createSession(userId: number) {
    const [session] = await this.db
      .insert(schema.sessions)
      .values({
        userId,
        expires: new Date(Date.now() + expirationTime).toISOString(),
      })
      .returning();
    return session;
  }

  async getSession(sessionId: string) {
    const sessions = await this.db
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

  async deleteSession(sessionId: string) {
    await this.db
      .delete(schema.sessions)
      .where(eq(schema.sessions.id, sessionId));
  }
}

export type SessionDto = Awaited<
  ReturnType<SessionService["getSession"]>
>;
