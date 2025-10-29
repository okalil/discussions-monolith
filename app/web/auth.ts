import type { MiddlewareFunction } from "react-router";

import { AsyncLocalStorage } from "node:async_hooks";
import { createCookie, redirect } from "react-router";

import type { SessionDto } from "../core/session";

import { env, sessionService } from "./bindings";
import { session } from "./session";

const als = new AsyncLocalStorage<Auth>();

export const authMiddleware: MiddlewareFunction<Response> = async (
  { request },
  next
) => {
  const cookie = createCookie("__auth", {
    httpOnly: true,
    secure: import.meta.env.MODE === "production",
    secrets: [env().SESSION_SECRET],
    sameSite: "lax",
    path: "/",
  });

  const userSessionId = await cookie.parse(request.headers.get("Cookie"));
  const userSession = userSessionId
    ? await sessionService().getSession(userSessionId)
    : null;
  const user = userSession?.user ?? null;

  let setCookie: string | undefined;

  const auth = {
    getUser() {
      return user;
    },
    getUserOrFail() {
      if (!user) {
        session().flash("error", "Hold on! You need to log in first");

        const url = new URL(request.url);
        const searchParams = new URLSearchParams([
          ["to", url.href.replace(url.origin, "")],
        ]);
        throw redirect(`/login?${searchParams}`);
      }
      return user;
    },
    async login(userId: number, remember?: boolean) {
      const { id: sessionId, expires } = await sessionService().createSession(
        userId
      );
      setCookie = await cookie.serialize(sessionId, {
        expires: remember ? new Date(expires) : undefined,
      });
    },
    async logout() {
      await sessionService().deleteSession(userSessionId);
      setCookie = await cookie.serialize(null);
    },
  };

  const response = await als.run(auth, next);
  if (setCookie) response.headers.append("Set-Cookie", setCookie);
};

export function auth() {
  const store = als.getStore();
  if (!store) throw new Error("Auth context not provided");

  return store;
}

type SessionUser = NonNullable<SessionDto>["user"];
type MaybeSessionUser = SessionUser | null;
type Auth = {
  getUser(): MaybeSessionUser;
  getUserOrFail(): SessionUser;
  login(userId: number, remember?: boolean): Promise<void>;
  logout(): Promise<void>;
};
