import { useForm } from "react-hook-form";
import {
  data,
  Form,
  href,
  Link,
  redirect,
  useSearchParams,
  useSubmit,
} from "react-router";
import { z } from "zod/v4";

import { env } from "~/config/env.server";
import { getUserByCredentials } from "~/core/user";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { sessionContext } from "~/web/session";
import { Button } from "~/web/ui/shared/button";
import { ErrorMessage } from "~/web/ui/shared/error-message";
import { Field } from "~/web/ui/shared/field";
import { Icon } from "~/web/ui/shared/icon";
import { Input } from "~/web/ui/shared/input";
import { validator } from "~/web/validator";

import type { Route } from "./+types/login.route";

export const meta: Route.MetaFunction = () => [{ title: "Login" }];

export default function Component({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const form = useForm({
    resolver: loginValidator.resolver,
    errors: actionData?.errors,
  });
  const { errors } = form.formState;

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

          <Form
            method="POST"
            className="space-y-4"
            onSubmit={form.handleSubmit((_, e) => submit(e?.target))}
          >
            {errors.root?.message && (
              <ErrorMessage error={errors.root.message} />
            )}

            {redirectTo && <input name="to" value={redirectTo} type="hidden" />}

            <Field label="Email" error={errors.email?.message}>
              <Input
                {...form.register("email")}
                defaultValue={actionData?.email}
                type="email"
                aria-required
              />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <Input
                {...form.register("password")}
                type="password"
                aria-required
              />
            </Field>

            <div className="flex items-center justify-between">
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

              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button variant="primary" className="h-12 w-full">
              Login
            </Button>
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Register now
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
  const [errors, input] = await loginValidator.tryValidate(body);
  if (errors) {
    return data({ errors, email: body.email }, 422);
  }

  const user = await getUserByCredentials(input.email, input.password);
  if (!user) {
    return data(
      {
        errors: { root: { message: "Invalid email or password" } },
        email: body.email,
      },
      400
    );
  }

  await context.get(authContext).login(user.id, input.remember);

  context.get(sessionContext).flash("success", "Signed in successfully!");
  throw redirect(safeUrl(input.to) || "/");
};

const loginValidator = validator(
  z.object({
    email: z.email("Inform a valid email address"),
    password: z.string().min(1, "Password is required"),
    remember: z.stringbool().optional(),
    to: z.string().optional(),
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
