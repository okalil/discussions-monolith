import type { ShouldRevalidateFunction } from "react-router";

import { Link, Outlet, Form } from "react-router";

import type { Route } from "./+types/layout.route";

import { m } from "../../paraglide/messages";
import { auth } from "../auth";
import { Avatar } from "../shared/avatar";
import { Button } from "../shared/button";
import { LocaleSwitcher } from "../shared/locale-switcher";
import { cn } from "../shared/utils/cn";

export async function loader() {
  const user = auth().getUser();
  return { user };
}

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
            <Link to="/">{m.header_discussions()}</Link>
          </h1>

          {!user && (
            <div className="flex items-center gap-3 ml-auto">
              <LocaleSwitcher />
              <Form action="login">
                <Button>{m.header_login()}</Button>
              </Form>
              <Form action="register">
                <Button variant="default">{m.header_sign_up()}</Button>
              </Form>
            </div>
          )}

          {user && (
            <div className="flex items-center gap-3 ml-auto">
              <LocaleSwitcher />
              <Link to="/profile">
                <Avatar
                  src={user.image}
                  alt={user.name ?? ""}
                  size={32}
                  fallback={user.name?.charAt(0)}
                />
              </Link>
              <Form method="post" action="logout" replace>
                <Button variant="danger" aria-label={m.header_log_out_aria()}>
                  {m.header_log_out()}
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
