import { Outlet, redirect } from "react-router";

import { rateLimit } from "~/web/rate-limit";

import type { Route } from "./+types/auth.route";

export const middleware = [
  rateLimit({ max: 10, window: 60 * 1000 }),
  function anonymous({ context }: Route.MiddlewareArgs) {
    const user = context.auth.getUser();
    if (user) throw redirect("/");
  },
];

export default Outlet;
