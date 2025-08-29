import bcrypt from "bcryptjs";
import { desc, eq } from "drizzle-orm";
import crypto from "node:crypto";

import { getContext } from "./context";
import { schema } from "./services/db";

export async function createVerificationToken(email: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  const token = crypto.randomBytes(32).toString("hex");

  const { db } = getContext();
  await db.insert(schema.verificationTokens).values({
    identifier: email,
    expires: expiresAt.toISOString(),
    token: await bcrypt.hash(token, 10),
  });

  return token;
}

export async function getVerificationToken(email: string) {
  const { db } = getContext();
  const verifications = await db
    .select()
    .from(schema.verificationTokens)
    .where(eq(schema.verificationTokens.identifier, email))
    .orderBy(desc(schema.verificationTokens.expires))
    .limit(10);
  return verifications.at(0) ?? null;
}

export async function deleteVerificationToken(token: string) {
  const { db } = getContext();
  await db
    .delete(schema.verificationTokens)
    .where(eq(schema.verificationTokens.token, token));
}
