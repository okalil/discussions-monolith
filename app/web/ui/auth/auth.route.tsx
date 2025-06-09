import { Outlet, redirect } from "react-router";

import { auth } from "~/web/auth";

import type { Route } from "./+types/auth.route";

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
  function anonymousMiddleware() {
    const user = auth().getUser();
    if (user) throw redirect("/");
  },
];

export default Outlet;
