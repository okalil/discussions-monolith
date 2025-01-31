import vine from "@vinejs/vine";
import {
  data,
  Form,
  Link,
  redirect,
  useNavigation,
  useSearchParams,
} from "react-router";

import { env } from "~/core/env";
import { bodyParser } from "~/web/body-parser";
import { Button } from "~/web/ui/shared/button";
import { getUserByCredentials } from "~/core/data/user";

import type { Route } from "./+types/login.route";

import { Input } from "../shared/input";

export const meta: Route.MetaFunction = () => [{ title: "Login" }];

export default function Component({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("to");
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <Form method="POST" className="space-y-4">
          {actionData?.error && (
            <p className="text-red-500 text-center">
              {actionData.error.message}
            </p>
          )}

          {redirectTo && <input name="to" value={redirectTo} type="hidden" />}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              defaultValue={actionData?.values?.email}
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
  );
}

export const action = async ({ request, context }: Route.ActionArgs) => {
  const body = await bodyParser.parse(request);
  const [error, output] = await loginValidator.tryValidate(body);
  if (error) {
    delete body.password;
    return data({ error, values: body }, 422);
  }

  const user = await getUserByCredentials(output.email, output.password);
  context.auth.login(user.id);
  context.session.flash("success", "Signed in successfully!");
  throw redirect(output.to || "/");
};

const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8),
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
