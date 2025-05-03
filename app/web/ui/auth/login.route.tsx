import vine from "@vinejs/vine";
import {
  data,
  Form,
  href,
  Link,
  redirect,
  useNavigation,
  useSearchParams,
} from "react-router";

import { env } from "~/config/env";
import { getUserByCredentials } from "~/core/user";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { sessionContext } from "~/web/session";
import { Button } from "~/web/ui/shared/button";
import { ErrorMessage } from "~/web/ui/shared/error-message";
import { Icon } from "~/web/ui/shared/icon";
import { Input } from "~/web/ui/shared/input";

import type { Route } from "./+types/login.route";

export const meta: Route.MetaFunction = () => [{ title: "Login" }];

export default function Component({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("to");
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <div>
          <form
            method="POST"
            action={href("/auth/social/:provider", { provider: "github" })}
          >
            <Button variant="primary" className="gap-2 h-12 w-full">
              <Icon name="github" size={20} />
              Continue with Github
            </Button>
          </form>

          <div className="relative my-6">
            <hr />
            <span className="px-4 bg-white text-gray-700 text-sm absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
              or
            </span>
          </div>

          <Form method="POST" className="space-y-4">
            {actionData?.error && <ErrorMessage error={actionData.error} />}

            {redirectTo && <input name="to" value={redirectTo} type="hidden" />}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <Input
                defaultValue={actionData?.email}
                name="email"
                type="email"
                id="email"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input name="password" type="password" id="password" required />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 accent-black border"
                name="remember"
                id="remember"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-600 cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <Button
              variant="primary"
              className="h-12 w-full"
              loading={navigation.state === "submitting"}
            >
              Login
            </Button>
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Register
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
}

export const action = async ({ request, context }: Route.ActionArgs) => {
  const body = await bodyParser.parse(request);
  const [error, input] = await loginValidator.tryValidate(body);
  if (error) {
    return data({ error, email: body.email }, 422);
  }

  const user = await getUserByCredentials(input.email, input.password);
  if (!user) {
    return data({ error: "Invalid email or password", email: body.email }, 400);
  }

  await context.get(authContext).login(user.id, input.remember);

  context.get(sessionContext).flash("success", "Signed in successfully!");
  throw redirect(safeUrl(input.to) || "/");
};

const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
    remember: vine.boolean().optional(),
    to: vine.string().optional(),
  })
);

function safeUrl(value?: string) {
  try {
    if (!value) return;
    const url = new URL(value, env.SITE_URL);
    return url.href.replace(url.origin, "");
  } catch {
    return;
  }
}
