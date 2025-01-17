import { redirect } from "react-router";

import { auth } from "~/.server/auth";

import type { Route } from "./+types/logout.route";

export const action = async ({ context }: Route.ActionArgs) => {
  auth.logout(context.session);
  throw redirect("/login");
};
