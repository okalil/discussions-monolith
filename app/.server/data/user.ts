import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { and, eq, getTableColumns, sql } from "drizzle-orm";

import { db, schema } from "../db";

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  password = await bcrypt.hash(password, 10);

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

export const getUserByCredentials = async (email: string, password: string) => {
  const accounts = await db
    .select({
      password: schema.accounts.password,
      user: getTableColumns(schema.users),
    })
    .from(schema.accounts)
    .leftJoin(schema.users, eq(schema.users.id, schema.accounts.userId))
    .where(
      and(eq(schema.accounts.type, "credential"), eq(schema.users.email, email))
    );

  const account = accounts.at(0);
  if (!account?.user || !account.password)
    throw new Error("Invalid email or password");

  const isValid = await bcrypt.compare(password, account.password);
  if (!isValid) throw new Error("Invalid email or password");

  return account.user;
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

export const createVerificationToken = async (email: string) => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  const token = crypto.randomBytes(32).toString("hex");

  await db.insert(schema.verificationTokens).values({
    identifier: email,
    expires: expiresAt.toISOString(),
    token: token,
  });

  return token;
};

export const resetPassword = async (
  email: string,
  password: string,
  token: string
) => {
  const verificationToken = await getVerificationToken(email);

  if (!verificationToken || new Date(verificationToken.expires) < new Date()) {
    throw new Error("Invalid or expired token");
  }

  const isValid = await bcrypt.compare(token, verificationToken.token);
  if (!isValid) {
    throw new Error("Invalid token");
  }

  password = await bcrypt.hash(password, 10);

  await updatePassword(verificationToken.identifier, password);
  await deleteVerificationToken(verificationToken.token);
};

const getVerificationToken = async (email: string) => {
  const verifications = await db
    .select()
    .from(schema.verificationTokens)
    .where(eq(schema.verificationTokens.identifier, email))
    .limit(1);
  return verifications.at(0) ?? null;
};

const deleteVerificationToken = async (token: string) => {
  await db
    .delete(schema.verificationTokens)
    .where(eq(schema.verificationTokens.token, token));
};

const updatePassword = async (email: string, password: string) => {
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
