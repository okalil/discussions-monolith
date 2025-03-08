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
import { authContext } from "~/web/auth";
import { Input } from "~/web/ui/shared/input";
import { sessionContext } from "~/web/session";
import { bodyParser } from "~/web/body-parser";
import { Button } from "~/web/ui/shared/button";
import { getUserByCredentials } from "~/core/data/user";
import { ErrorMessage } from "~/web/ui/shared/error-message";

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
          {actionData?.error && <ErrorMessage error={actionData.error} />}

          <form
            method="POST"
            action={href("/auth/social/:provider", { provider: "github" })}
          >
            <Button variant="primary" className="gap-2 h-12 w-full">
              <svg
                aria-label="github"
                viewBox="0 0 14 14"
                height="20"
                width="20"
              >
                <path
                  d="M7 .175c-3.872 0-7 3.128-7 7 0 3.084 2.013 5.71 4.79 6.65.35.066.482-.153.482-.328v-1.181c-1.947.415-2.363-.941-2.363-.941-.328-.81-.787-1.028-.787-1.028-.634-.438.044-.416.044-.416.7.044 1.071.722 1.071.722.635 1.072 1.641.766 2.035.59.066-.459.24-.765.437-.94-1.553-.175-3.193-.787-3.193-3.456 0-.766.262-1.378.721-1.881-.065-.175-.306-.897.066-1.86 0 0 .59-.197 1.925.722a6.754 6.754 0 0 1 1.75-.24c.59 0 1.203.087 1.75.24 1.335-.897 1.925-.722 1.925-.722.372.963.131 1.685.066 1.86.46.48.722 1.115.722 1.88 0 2.691-1.641 3.282-3.194 3.457.24.219.481.634.481 1.29v1.926c0 .197.131.415.481.328C11.988 12.884 14 10.259 14 7.175c0-3.872-3.128-7-7-7z"
                  fill="currentColor"
                  fillRule="nonzero"
                />
              </svg>
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
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input name="password" type="password" id="password" required />
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
  const [error, output] = await loginValidator.tryValidate(body);
  if (error) {
    return data({ error, email: body.email }, 422);
  }

  const user = await getUserByCredentials(output.email, output.password);
  if (!user) {
    return data({ error: "Invalid email or password", email: body.email }, 400);
  }

  context.get(authContext).login(user.id);
  context.get(sessionContext).flash("success", "Signed in successfully!");
  throw redirect(output.to || "/");
};

const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
    to: vine
      .string()
      .optional()
      .transform((value) => {
        try {
          const url = new URL(value, env.SITE_URL);
          return url.href.replace(url.origin, "");
        } catch {
          return;
        }
      }),
  })
);
