import { layout, route, type RouteConfig } from "@react-router/dev/routes";

const routes = [
  layout("web/ui/auth/auth.route.tsx", [
    route("login", "web/ui/auth/login.route.tsx"),
    route("register", "web/ui/auth/register.route.tsx"),
    route("forgot-password", "web/ui/auth/forgot-password.route.tsx"),
    route("reset-password", "web/ui/auth/reset-password.route.tsx"),
  ]),
  route("logout", "web/ui/auth/logout.route.tsx"),

  layout("web/ui/layouts/layout.route.tsx", [
    route(null, "web/ui/discussions/discussions.route.tsx", { index: true }),
    route("discussions/new", "web/ui/discussions/new-discussion.route.tsx"),
    route(
      "discussions/:id/hovercard",
      "web/ui/discussions/discussion-hovercard.route.tsx"
    ),
    route("discussions/:id", "web/ui/discussion/discussion.route.tsx", [
      route("vote", "web/ui/discussion/vote-discussion.route.tsx"),
      route("comments/new", "web/ui/discussion/create-comment.route.tsx"),
      route("comments/:id/edit", "web/ui/discussion/edit-comment.route.tsx"),
      route(
        "comments/:id/delete",
        "web/ui/discussion/delete-comment.route.tsx"
      ),
      route("comments/:id/vote", "web/ui/discussion/vote-comment.route.tsx"),
    ]),
    route("profile", "web/ui/profile/profile.route.tsx"),
  ]),

  route("uploads/*", "web/resources/uploads.tsx"),
];

export default routes satisfies RouteConfig;
