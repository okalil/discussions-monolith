import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { createCookieSessionStorage, redirect } from "react-router";

import { env } from "./env";
import {
  createUser,
  createVerificationToken,
  deleteVerificationToken,
  getCredentialAccount,
  getUser,
  getUserByEmail,
  getVerificationToken,
  updatePassword,
} from "./data/user";

const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    secrets: [env.SESSION_SECRET],
    sameSite: "lax",
    path: "/",
  },
});

class Auth {
  async #getSession(request?: Request) {
    const session = await authSessionStorage.getSession(
      request?.headers.get("Cookie")
    );
    return session;
  }

  async getUserId(request: Request) {
    const session = await this.#getSession(request);
    return session.get("userId");
  }

  async getUser(request: Request) {
    const userId = await this.getUserId(request);
    if (!userId) return null;
    const user = await getUser(userId);
    return user;
  }

  async getUserOrFail(request: Request) {
    const user = await this.getUser(request);
    const url = new URL(request.url);
    const searchParams =
      url.pathname &&
      new URLSearchParams([["redirect", url.pathname + url.search]]);
    if (!user) throw redirect(`/login?${searchParams}`);
    return user;
  }

  async login(userId: number) {
    const session = await this.#getSession();
    session.set("userId", userId);
    const cookie = await authSessionStorage.commitSession(session);
    return cookie;
  }

  async signIn(email: string, password: string) {
    const account = await getCredentialAccount(email);
    if (!account || !account.password) {
      throw new Error("Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, account.password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    const cookie = await this.login(account.userId);
    return cookie;
  }

  async signUp(name: string, email: string, password: string) {
    password = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, password);
    const cookie = await this.login(user.id);
    return cookie;
  }

  async logout() {
    const session = await this.#getSession();
    const cookie = await authSessionStorage.destroySession(session);
    return cookie;
  }

  async forgetPassword(email: string) {
    const user = await getUserByEmail(email);
    if (!user) throw new Error("User not found");

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    const token = crypto.randomBytes(32).toString("hex");

    await createVerificationToken(email, expiresAt.toISOString(), token);
    return { user, token };
  }

  async resetPassword(email: string, password: string, token: string) {
    const verificationToken = await getVerificationToken(email);

    if (
      !verificationToken ||
      new Date(verificationToken.expires) < new Date()
    ) {
      throw new Error("Invalid or expired token");
    }

    const isValid = await bcrypt.compare(token, verificationToken.token);
    if (!isValid) {
      throw new Error("Invalid token");
    }

    password = await bcrypt.hash(password, 10);

    await updatePassword(verificationToken.identifier, password);
    await deleteVerificationToken(verificationToken.token);
  }
}

export const auth = new Auth();
