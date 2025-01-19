import { createCookieSessionStorage } from "react-router";

import type { Route } from "../+types/root";

import { env } from "./env";

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
  context.session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const response = await next();
  response.headers.append(
    "Set-Cookie",
    await sessionStorage.commitSession(context.session)
  );
  return response;
}
