import bcrypt from "bcryptjs";
import { and, eq, getTableColumns } from "drizzle-orm";

import type { DatabaseClient } from "./integrations/db";
import type { StorageClient } from "./integrations/storage";

import { schema } from "./integrations/db/schema";

export class UserService {
  constructor(private db: DatabaseClient, private storage: StorageClient) {}

  async getUserByEmail(email: string) {
    const users = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    return users.at(0) ?? null;
  }

  async getUserByCredentials(email: string, password: string) {
    const accounts = await this.db
      .select({
        password: schema.accounts.password,
        user: getTableColumns(schema.users),
      })
      .from(schema.accounts)
      .leftJoin(schema.users, eq(schema.users.id, schema.accounts.userId))
      .where(
        and(
          eq(schema.accounts.type, "credential"),
          eq(schema.users.email, email)
        )
      );
    const account = accounts.at(0);

    if (!account?.user || !account.password) return null;

    const isValid = await bcrypt.compare(password, account.password);
    if (!isValid) return null;

    return account.user;
  }

  async updateUser(userId: number, name: string, image?: string) {
    await this.db
      .update(schema.users)
      .set({ name, image })
      .where(eq(schema.users.id, userId));
  }

  async uploadUserImage(userId: number, file?: unknown) {
    if (!file || !(file instanceof File)) return;
    if (!file.name) return;

    const key = `avatars/${userId}_${Date.now()}`;
    await this.storage.set(key, file);
    return key;
  }
}
