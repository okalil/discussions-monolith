import type { Session } from "react-router";

import { AsyncLocalStorage } from "node:async_hooks";
import { createCookieSessionStorage } from "react-router";

import { env } from "~/core/env";

import type { Route } from "../+types/root";

const asyncLocalStorage = new AsyncLocalStorage<Map<string, unknown>>();

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

export async function session({
  request,
  context,
  next,
}: Route.MiddlewareArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  context.session = session;
  const response = await asyncLocalStorage.run(
    new Map([["session", session]]),
    () => next()
  );
  response.headers.append(
    "Set-Cookie",
    await sessionStorage.commitSession(session)
  );
  return response;
}

export function pullSession() {
  const store = asyncLocalStorage.getStore();
  const session = store?.get("session");
  if (!session) throw new Error("Session not provided");
  return session as Session;
}
