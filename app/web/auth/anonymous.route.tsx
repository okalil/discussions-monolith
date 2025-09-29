import { Outlet, redirect } from "react-router";

import { auth } from "~/web/auth";

import type { Route } from "./+types/anonymous.route";

export const middleware: Route.MiddlewareFunction[] = [
  function anonymousMiddleware() {
    const user = auth().getUser();
    if (user) throw redirect("/");
  },
];

export default Outlet;
