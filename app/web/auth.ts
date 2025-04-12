import { redirect, unstable_createContext } from "react-router";

import { createSession, deleteSession } from "~/core/session";
import { getUserBySession } from "~/core/user";

import type { Route } from "../+types/root";

import { sessionContext } from "./session";

type MaybeUser = Awaited<ReturnType<typeof getUserBySession>>;
interface Auth {
  getUser: () => MaybeUser;
  getUserOrFail: () => NonNullable<MaybeUser>;
  login: (userId: number) => Promise<void>;
  logout: () => Promise<void>;
}

export const authContext = unstable_createContext<Auth>();

export const authMiddleware: Route.unstable_MiddlewareFunction = async ({
  request,
  context,
}) => {
  const session = context.get(sessionContext);
  const sessionId = session.get(authSessionKey);
  const user = sessionId ? await getUserBySession(sessionId) : null;
  context.set(authContext, {
    getUser() {
      return user;
    },
    getUserOrFail() {
      if (!user) {
        session.flash("error", "Hold up! You need to log in first");

        const url = new URL(request.url);
        const searchParams = new URLSearchParams([
          ["to", url.href.replace(url.origin, "")],
        ]);
        throw redirect(`/login?${searchParams}`);
      }
      return user;
    },
    async login(userId: number) {
      const { id: sessionId } = await createSession(userId);
      session.set(authSessionKey, sessionId);
    },
    async logout() {
      await deleteSession(sessionId);
      session.unset(authSessionKey);
    },
  });
};

const authSessionKey = "sessionId";
