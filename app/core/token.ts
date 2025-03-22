import crypto from "node:crypto";
import { eq } from "drizzle-orm";

import { db, schema } from "./services/db";

export async function createVerificationToken(email: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  const token = crypto.randomBytes(32).toString("hex");

  await db.insert(schema.verificationTokens).values({
    identifier: email,
    expires: expiresAt.toISOString(),
    token: token,
  });

  return token;
}

export async function getVerificationToken(email: string) {
  const verifications = await db
    .select()
    .from(schema.verificationTokens)
    .where(eq(schema.verificationTokens.identifier, email))
    .limit(1);
  return verifications.at(0) ?? null;
}

export async function deleteVerificationToken(token: string) {
  await db
    .delete(schema.verificationTokens)
    .where(eq(schema.verificationTokens.token, token));
}
