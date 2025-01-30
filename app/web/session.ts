import { createCookieSessionStorage } from "react-router";

import { env } from "~/core/env";

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

export async function session({
  request,
  context,
  next,
}: Route.MiddlewareArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  context.session = session;
  const response = await next();
  response.headers.append(
    "Set-Cookie",
    await sessionStorage.commitSession(session)
  );
  return response;
}
