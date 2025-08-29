import type { unstable_MiddlewareFunction } from "react-router";

import { createCookie, redirect, unstable_createContext } from "react-router";

import { getContext } from "~/core/context";
import { createSession, deleteSession } from "~/core/session";
import { getUserBySession } from "~/core/user";

import { sessionContext } from "./session";

export const authContext = unstable_createContext<AuthContext>();

const authCookie = (env: Env) =>
  createCookie("__auth", {
    httpOnly: true,
    secure: import.meta.env.MODE === "production",
    secrets: [env.SESSION_SECRET],
    sameSite: "lax",
    path: "/",
  });

export const authMiddleware: unstable_MiddlewareFunction<Response> = async (
  { request, context },
  next
) => {
  const { env } = getContext();
  const cookie = authCookie(env);

  const sessionId = await cookie.parse(request.headers.get("Cookie"));
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
      setCookie = await cookie.serialize(sessionId, {
        expires: remember ? new Date(expires) : undefined,
      });
    },
    async logout() {
      await deleteSession(sessionId);
      setCookie = await cookie.serialize(null);
    },
  });

  const response = await next();
  if (setCookie) response.headers.append("Set-Cookie", setCookie);
};

type MaybeSessionUser = Awaited<ReturnType<typeof getUserBySession>>;
type SessionUser = NonNullable<MaybeSessionUser>;
type AuthContext = {
  getUser(): MaybeSessionUser;
  getUserOrFail(): SessionUser;
  login(userId: number, remember?: boolean): Promise<void>;
  logout(): Promise<void>;
};
