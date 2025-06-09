import { AsyncLocalStorage } from "node:async_hooks";
import { createCookie, redirect } from "react-router";

import { env } from "~/config/env.server";
import { createSession, deleteSession } from "~/core/session";
import { getUserBySession } from "~/core/user";

import type { Route } from "../+types/root";

import { session } from "./session";

const authCookie = createCookie("__auth", {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  secrets: [env.SESSION_SECRET],
  sameSite: "lax",
  path: "/",
});

const als = new AsyncLocalStorage<Auth>();

export const authMiddleware: Route.unstable_MiddlewareFunction = async (
  { request },
  next
) => {
  const sessionId = await authCookie.parse(request.headers.get("Cookie"));
  const user = sessionId ? await getUserBySession(sessionId) : null;

  let setCookie: string | undefined;

  const response = await als.run(
    {
      getUser() {
        return user;
      },
      getUserOrFail() {
        if (!user) {
          session().flash("error", "Hold up! You need to log in first");

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
    },
    next
  );

  if (setCookie) response.headers.append("Set-Cookie", setCookie);
};

export function auth() {
  const context = als.getStore();
  if (!context)
    throw new Error("Auth context not found. Make sure to use authMiddleware.");
  return context;
}

type SessionUser = Awaited<ReturnType<typeof getUserBySession>>;
type Auth = {
  getUser: () => SessionUser;
  getUserOrFail: () => NonNullable<SessionUser>;
  login: (userId: number, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
};
