import * as arctic from "arctic";
import { createCookie, redirect } from "react-router";

import type { Route } from "./+types/social.route";

import { m } from "../../paraglide/messages";
import { auth } from "../auth";
import { accountService } from "../bindings";
import { session } from "../session";

const cookie = createCookie("state", {
  secure: import.meta.env.MODE !== "development",
  path: "/",
  httpOnly: true,
  maxAge: 10 * 60, // 10 min
});

export async function action({ params }: Route.ActionArgs) {
  const state = arctic.generateState();
  const url = accountService().createProviderAuthorizationURL(
    params.provider,
    state
  );
  return redirect(url, {
    headers: [["set-cookie", await cookie.serialize(state)]],
  });
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) throw new Response("Invalid Code", { status: 400 });

  const state = url.searchParams.get("state");
  const sessionState = await cookie.parse(request.headers.get("cookie"));
  if (!state || state !== sessionState)
    throw new Response("Invalid State", { status: 400 });

  const user = await accountService().linkProviderAccount(
    params.provider,
    code
  );
  await auth().login(user.id);

  session().flash("success", m.toast_signed_in_success());
  return redirect("/");
}
