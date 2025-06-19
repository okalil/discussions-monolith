import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

const routes = [
  layout("web/auth/auth.route.tsx", [
    route("login", "web/auth/login.route.tsx"),
    route("register", "web/auth/register.route.tsx"),
    route("forgot-password", "web/auth/forgot-password.route.tsx"),
    route("reset-password", "web/auth/reset-password.route.tsx"),
    route("auth/social/:provider", "web/auth/social.route.tsx"),
  ]),
  route("logout", "web/auth/logout.route.tsx"),

  layout("web/layouts/layout.route.tsx", [
    index("web/discussions/discussions.route.tsx"),
    route("categories/:category", "web/discussions/discussions.route.tsx", {
      id: "discussions/category",
    }),
    route("discussions/new", "web/discussions/new-discussion.route.tsx"),
    route(
      "discussions/:id/hovercard",
      "web/discussions/discussion-hovercard.route.tsx"
    ),
    route("discussions/:id/vote", "web/discussion/vote-discussion.route.tsx"),
    route("discussions/:id", "web/discussion/discussion.route.tsx"),
    route("comments/new", "web/discussion/create-comment.route.tsx"),
    route("comments/:id/edit", "web/discussion/edit-comment.route.tsx"),
    route("comments/:id/delete", "web/discussion/delete-comment.route.tsx"),
    route("comments/:id/vote", "web/discussion/vote-comment.route.tsx"),
    route("profile", "web/profile/profile.route.tsx"),
  ]),

  route("uploads/*", "web/resources/uploads.route.tsx"),
];

export default routes satisfies RouteConfig;
