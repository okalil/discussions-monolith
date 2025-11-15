import { eq } from "drizzle-orm";

import type { DatabaseClient } from "./integrations/db";
import type { StorageClient } from "./integrations/storage";

import { schema } from "./integrations/db";

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
