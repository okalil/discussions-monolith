import type { Session } from "react-router";

import { AsyncLocalStorage } from "node:async_hooks";
import { createCookieSessionStorage } from "react-router";

import { env } from "~/config/env.server";

import type { Route } from "../+types/root";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    secrets: [env.SESSION_SECRET],
    sameSite: "lax",
    path: "/",
  },
});

const als = new AsyncLocalStorage<Session>();

export const sessionMiddleware: Route.unstable_MiddlewareFunction = async (
  { request },
  next
) => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const response = await als.run(session, next);
  response.headers.append(
    "Set-Cookie",
    await sessionStorage.commitSession(session)
  );
  return response;
};

export function session() {
  const context = als.getStore();
  if (!context)
    throw new Error("Session not found. Make sure to use sessionMiddleware.");
  return context;
}
