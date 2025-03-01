import type { Session } from "react-router";

import {
  createCookieSessionStorage,
  unstable_createContext,
} from "react-router";

import { env } from "~/config/env";

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

export const sessionContext = unstable_createContext<Session>();

export const sessionMiddleware: Route.unstable_MiddlewareFunction = async (
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
