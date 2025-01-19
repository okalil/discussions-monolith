import type { Session } from "react-router";

import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { redirect } from "react-router";

import type { Route } from "../+types/root";

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

class Auth {
  async getUserId(session: Session) {
    return session.get("userId");
  }

  async getUser(session: Session) {
    const userId = await this.getUserId(session);
    if (!userId) return null;
    const user = await getUser(userId);
    return user;
  }

  async getUserOrFail(session: Session) {
    const user = await this.getUser(session);
    // const url = new URL(request.url);
    const searchParams =
      // url.pathname &&
      new URLSearchParams(); //[["redirect", url.pathname + url.search]]);
    if (!user) throw redirect(`/login?${searchParams}`);
    return user;
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
    return account.userId;
  }

  async signUp(name: string, email: string, password: string) {
    password = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, password);
    return user.id;
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

  logout(session: Session) {
    session.unset("userId");
  }
}

export const auth = new Auth();

export async function authMiddleware({
  request,
  context,
}: Route.MiddlewareArgs) {
  const userId = context.session.get("userId");
  const user = userId && (await getUser(userId));
  context.auth = {
    getUser() {
      return user;
    },
    getUserOrFail() {
      const url = new URL(request.url);
      const searchParams =
        url.pathname &&
        new URLSearchParams([["redirect", url.pathname + url.search]]);
      if (!user) throw redirect("/login?" + searchParams);
    },
    login(userId: number) {
      context.session.set("userId", userId);
    },
    logout(userId: number) {
      context.session.unset("userId", userId);
    },
  };
}
