import type { Session } from "react-router";

import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { redirect } from "react-router";

import type { UserDto } from "~/core/data/user";

import {
  createUser,
  createVerificationToken,
  deleteVerificationToken,
  getUser,
  getUserIdByCredentials,
  getUserByEmail,
  getVerificationToken,
  updatePassword,
} from "~/core/data/user";

import type { Route } from "../+types/root";

export class Auth {
  private request: Request;
  private session: Session;
  private user?: UserDto;

  constructor(request: Request, session: Session) {
    this.request = request;
    this.session = session;
  }

  getUserId() {
    return this.session.get("userId");
  }

  async getUser() {
    if (this.user) return this.user;
    const userId = this.getUserId();
    if (!userId) return null;
    const user = await getUser(userId);
    return user;
  }

  async getUserOrFail() {
    const user = await this.getUser();
    if (!user) {
      const url = new URL(this.request.url);
      const searchParams =
        url.pathname &&
        new URLSearchParams([["redirect", url.pathname + url.search]]);
      throw redirect(`/login?${searchParams}`);
    }
    return user;
  }

  async signIn(email: string, password: string) {
    const userId = await getUserIdByCredentials(email, password);
    this.session.set("userId", userId);
  }

  async signUp(name: string, email: string, password: string) {
    password = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, password);
    this.session.set("userId", user.id);
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

  logout() {
    this.session.unset("userId");
  }
}

export const auth = async ({ request, context }: Route.MiddlewareArgs) => {
  context.auth = new Auth(request, context.session);
};
