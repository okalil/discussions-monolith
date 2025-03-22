import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { db, schema } from "./services/db";
import { storage } from "./services/storage";
import { getCredentialAccount } from "./account";

export async function getUser(userId: number) {
  const users = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  const user = users.at(0);
  if (!user) return null;
  return user;
}

export async function getUserByEmail(email: string) {
  const users = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return users.at(0) ?? null;
}

export async function getUserByCredentials(email: string, password: string) {
  const account = await getCredentialAccount(email);

  if (!account?.user || !account.password) return null;

  const isValid = await bcrypt.compare(password, account.password);
  if (!isValid) return null;

  return account.user;
}

export async function updateUser(userId: number, name: string, image?: string) {
  await db
    .update(schema.users)
    .set({ name, image })
    .where(eq(schema.users.id, userId));
}

export async function uploadUserImage(userId: number, file?: unknown) {
  if (!file || !(file instanceof File)) return;
  if (!file.name) return;
  const key = `avatars/${userId}_${Date.now()}`;
  await storage.set(key, file);
  return key;
}
