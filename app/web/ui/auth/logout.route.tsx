import { redirect } from "react-router";

import { authContext } from "~/web/auth";

import type { Route } from "./+types/logout.route";

export const action = async ({ context }: Route.ActionArgs) => {
  await context.get(authContext).logout();
  throw redirect("/login");
};
