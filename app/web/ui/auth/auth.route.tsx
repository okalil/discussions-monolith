import { Outlet, redirect } from "react-router";

import { authContext } from "~/web/auth";
import { rateLimitMiddleware } from "~/web/rate-limit";

import type { Route } from "./+types/auth.route";

const anonymousMiddleware: Route.unstable_MiddlewareFunction = ({
  context,
}) => {
  const user = context.get(authContext).getUser();
  if (user) throw redirect("/");
};

export const unstable_middleware = [
  rateLimitMiddleware({ max: 30, window: 60 * 1000 }),
  anonymousMiddleware,
];

export default Outlet;
