import { and, eq, sql } from "drizzle-orm";

import { db, schema } from "../db";

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  const user = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(schema.users)
      .values({ email, name })
      .returning();
    await tx
      .insert(schema.accounts)
      .values({ type: "credential", password, userId: user.id });
    return user;
  });
  return user;
};

export const getUser = async (userId: number) => {
  const users = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  const user = users.at(0);
  if (!user) return null;
  return user;
};

export const getUserByEmail = async (email: string) => {
  const users = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return users.at(0) ?? null;
};

export const updateUser = async (
  userId: number,
  name: string,
  image?: string
) => {
  await db
    .update(schema.users)
    .set({ name, image })
    .where(eq(schema.users.id, userId));
};

export const createVerificationToken = async (
  email: string,
  expires: string,
  token: string
) => {
  await db.insert(schema.verificationTokens).values({
    identifier: email,
    expires: expires,
    token: token,
  });
};

export const getVerificationToken = async (email: string) => {
  const verifications = await db
    .select()
    .from(schema.verificationTokens)
    .where(eq(schema.verificationTokens.identifier, email))
    .limit(1);
  return verifications.at(0) ?? null;
};

export const deleteVerificationToken = async (token: string) => {
  await db
    .delete(schema.verificationTokens)
    .where(eq(schema.verificationTokens.token, token));
};

export const getCredentialAccount = async (email: string) => {
  const accounts = await db
    .select({
      password: schema.accounts.password,
      userId: schema.accounts.userId,
    })
    .from(schema.accounts)
    .where(
      and(
        eq(schema.accounts.type, "credential"),
        eq(
          schema.accounts.userId,
          sql<number>`(select id from ${schema.users} where email = ${email})`
        )
      )
    );
  return accounts.at(0) ?? null;
};

export const updatePassword = async (email: string, password: string) => {
  await db
    .update(schema.accounts)
    .set({ password })
    .where(
      and(
        eq(schema.accounts.type, "credential"),
        eq(
          schema.accounts.userId,
          sql<number>`(SELECT id FROM ${schema.users} WHERE email = ${email})`
        )
      )
    );
};
