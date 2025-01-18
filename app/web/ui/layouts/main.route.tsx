import type { ShouldRevalidateFunction } from "react-router";

import { Link, Outlet, Form } from "react-router";

import { cn } from "~/web/ui/shared/utils/cn";
import { Button } from "~/web/ui/shared/button";
import { Avatar } from "~/web/ui/shared/avatar";

import type { Route } from "./+types/main.route";

export const loader = async ({ context }: Route.LoaderArgs) => {
  const user = await context.auth.getUser();
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
