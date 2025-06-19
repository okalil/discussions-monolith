import type { Session, unstable_MiddlewareFunction } from "react-router";

import {
  createCookieSessionStorage,
  unstable_createContext,
} from "react-router";

import { env } from "~/config/env.server";

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

export const sessionContext = unstable_createContext<Session>();

export const sessionMiddleware: unstable_MiddlewareFunction<Response> = async (
  { request, context },
  next
) => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  context.set(sessionContext, session);

  const response = await next();
  response.headers.append(
    "Set-Cookie",
    await sessionStorage.commitSession(session)
  );
  return response;
};
