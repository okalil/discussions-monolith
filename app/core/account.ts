import bcrypt from "bcryptjs";
import { and, eq, desc, sql } from "drizzle-orm";
import crypto from "node:crypto";

import type { AuthProvider } from "./integrations/auth/provider";
import type { DatabaseClient } from "./integrations/db";
import type { EmailClient } from "./integrations/email";

import { GithubAuthProvider } from "./integrations/auth/providers/github";
import { schema } from "./integrations/db/schema";
import { ResetPasswordLink } from "./integrations/emails/reset-password-link";
import { ResetPasswordSuccess } from "./integrations/emails/reset-password-success";

export class AccountService {
  private providers: Map<string, AuthProvider> = new Map();

  constructor(
    private db: DatabaseClient,
    private mailer: EmailClient,
    private env: Env
  ) {
    this.providers.set(
      "github",
      new GithubAuthProvider(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET)
    );
  }

  /* CREDENTIAL ACCOUNT */

  async createCredentialAccount(name: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await this.db
      .insert(schema.users)
      .values({ email, name })
      .returning();
    await this.db.insert(schema.accounts).values({
      type: "credential",
      password: hashedPassword,
      userId: user.id,
    });

    return user;
  }

  async forgetPassword(email: string) {
    const token = await this.createVerificationToken(email);
    await this.mailer.send({
      to: email,
      subject: "Discussions, Password Reset",
      template: ResetPasswordLink({
        baseUrl: this.env.SITE_URL,
        email,
        token,
      }),
    });
  }

  async resetPassword(email: string, password: string, token: string) {
    const verificationToken = await this.getVerificationToken(email);

    if (
      !verificationToken ||
      new Date(verificationToken.expires) < new Date()
    ) {
      return false;
    }

    const isValid = await bcrypt.compare(token, verificationToken.token);
    if (!isValid) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.updatePassword(verificationToken.identifier, hashedPassword);
    await this.deleteVerificationToken(verificationToken.token);
    
    await this.mailer.send({
      to: email,
      subject: "Discussions, Password Successfully Reset",
      template: ResetPasswordSuccess({
        baseUrl: this.env.SITE_URL,
        email,
      }),
    });
    
    return true;
  }

  private async updatePassword(email: string, password: string) {
    await this.db
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

  private async createVerificationToken(email: string) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    const token = crypto.randomBytes(32).toString("hex");

    await this.db.insert(schema.verificationTokens).values({
      identifier: email,
      expires: expiresAt.toISOString(),
      token: await bcrypt.hash(token, 10),
    });

    return token;
  }

  private async getVerificationToken(email: string) {
    const verifications = await this.db
      .select()
      .from(schema.verificationTokens)
      .where(eq(schema.verificationTokens.identifier, email))
      .orderBy(desc(schema.verificationTokens.expires))
      .limit(10);
    return verifications.at(0) ?? null;
  }

  private async deleteVerificationToken(token: string) {
    await this.db
      .delete(schema.verificationTokens)
      .where(eq(schema.verificationTokens.token, token));
  }

  /* PROVIDERS ACCOUNTS */

  createProviderAuthorizationURL(provider: string, state: string) {
    const providerApi = this.providers.get(provider);
    if (!providerApi) throw new Error("Invalid Provider");

    const url = providerApi.createAuthorizationURL(state);
    return url;
  }

  async linkProviderAccount(provider: string, code: string) {
    const providerApi = this.providers.get(provider);
    if (!providerApi) throw new Error("Invalid Provider");

    const accessToken = await providerApi.getAccessToken(code);
    const providerUser = await providerApi.getUser(accessToken);

    let [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, providerUser.email));
    let [account] = await this.db
      .select()
      .from(schema.accounts)
      .where(
        and(
          eq(schema.accounts.providerAccountId, providerUser.id),
          eq(schema.accounts.provider, provider)
        )
      );
    if (account && user) return user;

    // If there is already a signed-up user with the same email and that user is not verified,
    // prevent linking to avoid hijacking an unverified account.
    if (user && !user.emailVerified) {
      throw new Error("Email already in use by an unverified account");
    }

    // If user is not found, create a new one
    if (!user) {
      [user] = await this.db
        .insert(schema.users)
        .values({
          email: providerUser.email,
          name: providerUser.name,
          image: providerUser.image,
          emailVerified: providerUser.emailVerified ?? false,
        })
        .returning();
    }

    // Create provider account
    [account] = await this.db
      .insert(schema.accounts)
      .values({
        type: "oauth",
        provider: provider,
        providerAccountId: providerUser.id,
        userId: user.id,
      })
      .returning();

    return user;
  }
}
