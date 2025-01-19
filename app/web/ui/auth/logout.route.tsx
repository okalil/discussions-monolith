import { redirect } from "react-router";

import type { Route } from "./+types/logout.route";

export const action = async ({ context }: Route.ActionArgs) => {
  context.auth.logout();
  throw redirect("/login");
};
