import { flatRoutes } from "@react-router/fs-routes";
import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

const resourcesRoutes = await flatRoutes({ rootDirectory: "resources" });
const routes = [
  ...resourcesRoutes,

  route("login", "ui/auth/login.route.tsx"),
  route("register", "ui/auth/register.route.tsx"),
  route("forgot-password", "ui/auth/forgot-password.route.tsx"),
  route("reset-password", "ui/auth/reset-password.route.tsx"),
  route("logout", "ui/auth/logout.route.tsx"),

  layout("ui/layouts/main.route.tsx", [
    index("ui/discussions/discussions.route.tsx"),
    route("discussions/new", "ui/discussions/new-discussion.route.tsx"),
    route("discussions/:id", "ui/discussion/discussion.route.tsx"),
    route("profile", "ui/profile/profile.route.tsx"),
  ]),
];

export default routes satisfies RouteConfig;
