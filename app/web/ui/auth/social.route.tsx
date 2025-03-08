import * as arctic from "arctic";
import { createCookie, redirect } from "react-router";

import { env } from "~/config/env";
import { authContext } from "~/web/auth";
import { sessionContext } from "~/web/session";
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
  const url = provider.createAuthorizationUrl(state);
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

  const providerUser = await provider.getUser(code);
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

const github = new arctic.GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  null
);
const providers = new Map([
  [
    "github",
    {
      createAuthorizationUrl(state: string) {
        const url = github.createAuthorizationURL(state, ["read:user"]);
        return url.toString();
      },
      async getUser(code: string) {
        const tokens = await github.validateAuthorizationCode(code);
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${tokens.accessToken()}`,
          },
        });
        const user = await response.json();
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar_url,
        };
      },
    },
  ],
  // Add more providers if needed...
]);
