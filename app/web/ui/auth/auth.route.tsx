import { Outlet, redirect } from "react-router";

import { authContext } from "~/web/auth";

import type { Route } from "./+types/auth.route";

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
  function anonymousMiddleware({ context }) {
    const user = context.get(authContext).getUser();
    if (user) throw redirect("/");
  },
];

export default Outlet;
