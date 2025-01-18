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

export interface Auth {
  getUserId(): string | null;
  getUser(): Promise<UserDto | null>;
  getUserOrFail(): Promise<UserDto>;
  signIn(email: string, password: string): Promise<void>;
  signUp(name: string, email: string, password: string): Promise<void>;
  forgetPassword(email: string): Promise<{ user: UserDto; token: string }>;
  resetPassword(email: string, password: string, token: string): Promise<void>;
  logout(): void;
}

function createAuth(request: Request, session: Session): Auth {
  let user: UserDto | undefined;

  return {
    getUserId() {
      return session.get("userId");
    },

    async getUser() {
      if (user) return user;
      const userId = this.getUserId();
      if (!userId) return null;
      user = await getUser(+userId);
      return user;
    },

    async getUserOrFail() {
      const user = await this.getUser();
      if (!user) {
        const url = new URL(request.url);
        const searchParams =
          url.pathname &&
          new URLSearchParams([["redirect", url.pathname + url.search]]);
        throw redirect(`/login?${searchParams}`);
      }
      return user;
    },

    async signIn(email: string, password: string) {
      const userId = await getUserIdByCredentials(email, password);
      session.set("userId", userId);
    },

    async signUp(name: string, email: string, password: string) {
      password = await bcrypt.hash(password, 10);
      const newUser = await createUser(name, email, password);
      session.set("userId", newUser.id);
    },

    async forgetPassword(email: string) {
      const user = await getUserByEmail(email);
      if (!user) throw new Error("User not found");

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      const token = crypto.randomBytes(32).toString("hex");

      await createVerificationToken(email, expiresAt.toISOString(), token);
      return { user, token };
    },

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
    },

    logout() {
      session.unset("userId");
    },
  };
}

export async function auth({ request, context }: Route.MiddlewareArgs) {
  context.auth = createAuth(request, context.session);
}
