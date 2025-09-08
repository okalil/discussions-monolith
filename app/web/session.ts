import type { Session, unstable_MiddlewareFunction } from "react-router";

import { AsyncLocalStorage } from "node:async_hooks";
import { createCookieSessionStorage } from "react-router";

import { env } from "./bindings";

const als = new AsyncLocalStorage<Session>();

export const sessionMiddleware: unstable_MiddlewareFunction<Response> = async (
  { request },
  next
) => {
  const sessionStorage = createCookieSessionStorage({
    cookie: {
      name: "__session",
      httpOnly: true,
      secure: import.meta.env.MODE === "production",
      secrets: [env().SESSION_SECRET],
      sameSite: "lax",
      path: "/",
    },
  });
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
  const store = als.getStore();
  if (!store) throw new Error("Session context not provided");

  return store;
}
