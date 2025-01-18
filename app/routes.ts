import { layout, route, type RouteConfig } from "@react-router/dev/routes";

const routes = [
  route("login", "ui/auth/login.route.tsx"),
  route("register", "ui/auth/register.route.tsx"),
  route("forgot-password", "ui/auth/forgot-password.route.tsx"),
  route("reset-password", "ui/auth/reset-password.route.tsx"),
  route("logout", "ui/auth/logout.route.tsx"),

  layout("ui/layouts/main.route.tsx", [
    route(null, "ui/discussions/discussions.route.tsx", { index: true }),
    route("discussions/new", "ui/discussions/new-discussion.route.tsx"),
    route(
      "discussions/:id/hovercard",
      "ui/discussions/discussion-hovercard.route.tsx"
    ),
    route("discussions/:id", "ui/discussion/discussion.route.tsx", [
      route("vote", "ui/discussion/vote-discussion.route.tsx"),
      route("comments/new", "ui/discussion/create-comment.route.tsx"),
      route("comments/:id/edit", "ui/discussion/edit-comment.route.tsx"),
      route("comments/:id/delete", "ui/discussion/delete-comment.route.tsx"),
      route("comments/:id/vote", "ui/discussion/vote-comment.route.tsx"),
    ]),
    route("profile", "ui/profile/profile.route.tsx"),
  ]),

  route("uploads/*", "resources/uploads.tsx"),
];

export default routes satisfies RouteConfig;
