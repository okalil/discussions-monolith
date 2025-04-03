import bcrypt from "bcrypt";
import { and, eq, getTableColumns, sql } from "drizzle-orm";

import { db, schema } from "./services/db";
import { mailer } from "./services/mailer";
import { github } from "./services/oauth/github";
import {
  createVerificationToken,
  deleteVerificationToken,
  getVerificationToken,
} from "./token";

/* CREDENTIAL ACCOUNT */

export async function createCredentialAccount(
  name: string,
  email: string,
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(schema.users)
      .values({ email, name })
      .returning();
    await tx.insert(schema.accounts).values({
      type: "credential",
      password: hashedPassword,
      userId: user.id,
    });
    return user;
  });
  return user;
}

export async function getCredentialAccount(email: string) {
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
  return accounts.at(0);
}

export async function forgetPassword(
  email: string,
  messageBuilder: (token: string) => Promise<{ html: string; text: string }>
) {
  const token = await createVerificationToken(email);
  const message = await messageBuilder(token);
  await mailer.send({
    to: email,
    subject: "Discussions Password Reset",
    ...message,
  });
}

export async function resetPassword(
  email: string,
  password: string,
  token: string
) {
  const verificationToken = await getVerificationToken(email);

  if (!verificationToken || new Date(verificationToken.expires) < new Date()) {
    return false;
  }

  const isValid = await bcrypt.compare(token, verificationToken.token);
  if (!isValid) {
    return false;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await updatePassword(verificationToken.identifier, hashedPassword);
  await deleteVerificationToken(verificationToken.token);
  return true;
}

async function updatePassword(email: string, password: string) {
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
}

/* PROVIDERS ACCOUNTS */

const providers = new Map([
  ["github", github],
  // add more providers as needed
]);

export function createProviderAuthorizationURL(
  provider: string,
  state: string
) {
  const providerApi = providers.get(provider);
  if (!providerApi) throw new Error("Invalid Provider");

  const url = providerApi.createAuthorizationURL(state);
  return url;
}

export async function linkProviderAccount(provider: string, code: string) {
  const providerApi = providers.get(provider);
  if (!providerApi) throw new Error("Invalid Provider");

  const accessToken = await providerApi.getAccessToken(code);
  const providerUser = await providerApi.getUser(accessToken);

  let [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, providerUser.email));
  let [account] = await db
    .select()
    .from(schema.accounts)
    .where(
      and(
        eq(schema.accounts.providerAccountId, providerUser.id),
        eq(schema.accounts.provider, provider)
      )
    );

  await db.transaction(async (tx) => {
    // If user is not found, create a new one
    if (!user) {
      [user] = await tx
        .insert(schema.users)
        .values({
          email: providerUser.email,
          name: providerUser.name,
          image: providerUser.image,
        })
        .returning();
    }

    // If user is not linked to that provider yet, link it
    if (!account) {
      [account] = await tx
        .insert(schema.accounts)
        .values({
          type: "oauth",
          provider: provider,
          providerAccountId: providerUser.id,
          userId: user.id,
        })
        .returning();
    }
  });
  return user;
}
