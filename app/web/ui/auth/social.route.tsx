import * as arctic from "arctic";
import { createCookie, redirect } from "react-router";

import { env } from "~/config/env";
import {
  createProviderAuthorizationURL,
  linkProviderAccount,
} from "~/core/account";
import { authContext } from "~/web/auth";
import { sessionContext } from "~/web/session";

import type { Route } from "./+types/social.route";

const cookie = createCookie("state", {
  secure: env.NODE_ENV !== "development",
  path: "/",
  httpOnly: true,
  maxAge: 10 * 60, // 10 min
});

export const action = async ({ params }: Route.ActionArgs) => {
  const state = arctic.generateState();
  const url = createProviderAuthorizationURL(params.provider, state);
  return redirect(url, {
    headers: [["set-cookie", await cookie.serialize(state)]],
  });
};

export const loader = async ({
  request,
  params,
  context,
}: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) throw new Response("Invalid Code", { status: 400 });

  const state = url.searchParams.get("state");
  const sessionState = await cookie.parse(request.headers.get("cookie"));
  if (!state || state !== sessionState)
    throw new Response("Invalid State", { status: 400 });

  const user = await linkProviderAccount(params.provider, code);

  context.get(authContext).login(user.id);
  context.get(sessionContext).flash("success", "Signed in successfully!");
  return redirect("/");
};
