import type { ShouldRevalidateFunction } from "react-router";

import { Link, Outlet, Form } from "react-router";

import { authContext } from "~/web/auth";
import { Avatar } from "~/web/shared/avatar";
import { Button } from "~/web/shared/button";
import { cn } from "~/web/shared/utils/cn";

import type { Route } from "./+types/layout.route";

export const loader = ({ context }: Route.LoaderArgs) => {
  const user = context.get(authContext).getUser();
  return { user };
};

export default function Component({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <div className="h-full">
      <header className="bg-gray-900 text-gray-50">
        <div
          className={cn(
            "flex items-center max-w-5xl mx-auto",
            "px-3 py-2 h-14"
          )}
        >
          <h1 className="font-medium text-xl">
            <Link to="/">Discussions</Link>
          </h1>

          {!user && (
            <div className="flex gap-3 ml-auto">
              <Form action="login">
                <Button>Login</Button>
              </Form>
              <Form action="register">
                <Button variant="default">Sign Up</Button>
              </Form>
            </div>
          )}

          {user && (
            <div className="flex items-center gap-3 ml-auto">
              <Link to="/profile">
                <Avatar
                  src={user.image}
                  alt={user.name ?? ""}
                  size={32}
                  fallback={user.name?.charAt(0)}
                />
              </Link>
              <Form method="post" action="logout" replace>
                <Button variant="danger" aria-label="Log Out">
                  Log Out
                </Button>
              </Form>
            </div>
          )}
        </div>
      </header>

      <Outlet />
    </div>
  );
}

export const shouldRevalidate: ShouldRevalidateFunction = (args) =>
  args.formAction === "/profile";
