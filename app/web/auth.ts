import { createCookie, redirect, unstable_createContext } from "react-router";

import { env } from "~/config/env.server";
import { createSession, deleteSession } from "~/core/session";
import { getUserBySession } from "~/core/user";

import type { Route } from "../+types/root";

import { sessionContext } from "./session";

const authCookie = createCookie("__auth", {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  secrets: [env.SESSION_SECRET],
  sameSite: "lax",
  path: "/",
});

export const authContext = unstable_createContext<Auth>();

export const authMiddleware: Route.unstable_MiddlewareFunction = async (
  { request, context },
  next
) => {
  const sessionId = await authCookie.parse(request.headers.get("Cookie"));
  const user = sessionId ? await getUserBySession(sessionId) : null;

  let setCookie: string | undefined;

  context.set(authContext, {
    getUser() {
      return user;
    },
    getUserOrFail() {
      if (!user) {
        const session = context.get(sessionContext);
        session.flash("error", "Hold up! You need to log in first");

        const url = new URL(request.url);
        const searchParams = new URLSearchParams([
          ["to", url.href.replace(url.origin, "")],
        ]);
        throw redirect(`/login?${searchParams}`);
      }
      return user;
    },
    async login(userId: number, remember?: boolean) {
      const { id: sessionId, expires } = await createSession(userId);
      setCookie = await authCookie.serialize(sessionId, {
        expires: remember ? new Date(expires) : undefined,
      });
    },
    async logout() {
      await deleteSession(sessionId);
      setCookie = await authCookie.serialize(null);
    },
  });

  const response = await next();
  if (setCookie) response.headers.append("Set-Cookie", setCookie);
};

type SessionUser = Awaited<ReturnType<typeof getUserBySession>>;
type Auth = {
  getUser: () => SessionUser;
  getUserOrFail: () => NonNullable<SessionUser>;
  login: (userId: number, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
};
