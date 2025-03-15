import * as arctic from "arctic";
import { createCookie, redirect } from "react-router";

import { env } from "~/config/env";
import { authContext } from "~/web/auth";
import { sessionContext } from "~/web/session";
import { github } from "~/core/integrations/github";
import { linkProviderAccount } from "~/core/data/user";

import type { Route } from "./+types/social.route";

const cookie = createCookie("state", {
  secure: env.NODE_ENV !== "development",
  path: "/",
  httpOnly: true,
  maxAge: 10 * 60, // 10 min
});

export const action = async ({ params }: Route.ActionArgs) => {
  const provider = providers.get(params.provider);
  if (!provider) throw new Response("Invalid Provider", { status: 400 });

  const state = arctic.generateState();
  const url = provider.createAuthorizationURL(state);
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

  const providerId = params.provider;
  const provider = providers.get(providerId);
  if (!provider) throw new Response("Invalid Provider", { status: 400 });

  const accessToken = await provider.getAccessToken(code);
  const providerUser = await provider.getUser(accessToken);
  const user = await linkProviderAccount(
    providerId,
    providerUser.id,
    providerUser.email,
    providerUser.name,
    providerUser.image
  );

  context.get(authContext).login(user.id);
  context.get(sessionContext).flash("success", "Signed in successfully!");
  return redirect("/");
};

const providers = new Map([
  ["github", github],
  // Add more providers as needed...
]);
