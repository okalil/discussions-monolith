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
import * as z from "zod";

import type { Route } from "./+types/login.route";

import { m } from "../../paraglide/messages";
import { auth } from "../auth";
import { accountService, env } from "../bindings";
import { bodyParser } from "../body-parser";
import { session } from "../session";
import { Button } from "../shared/button";
import { ErrorMessage } from "../shared/error-message";
import { Field } from "../shared/field";
import { Icon } from "../shared/icon";
import { Input } from "../shared/input";
import { validator } from "../validator";

export const meta: Route.MetaFunction = () => [{ title: m.login_title() }];

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
        <h2 className="text-2xl font-bold text-center">{m.login_title()}</h2>
        <div>
          <form
            method="POST"
            action={href("/auth/social/:provider", { provider: "github" })}
          >
            <Button variant="primary" className="gap-2 h-12 w-full">
              <Icon name="github" size={20} />
              {m.login_continue_github()}
            </Button>
          </form>

          <div className="relative my-6">
            <hr />
            <span className="px-4 bg-white text-gray-700 text-sm absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
              {m.login_or()}
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

            <Field label={m.login_field_email()} error={errors.email?.message}>
              <Input
                {...form.register("email")}
                defaultValue={actionData?.email}
                type="email"
                aria-required
              />
            </Field>

            <Field label={m.login_field_password()} error={errors.password?.message}>
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
                  {m.login_remember_me()}
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                {m.login_forgot_password()}
              </Link>
            </div>

            <Button variant="primary" className="h-12 w-full">
              {m.login_button()}
            </Button>
            <p className="text-center text-sm text-gray-600">
              {m.login_no_account()}{" "}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                {m.login_register_now()}
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const body = await bodyParser.parse(request);
  const [errors, input] = await loginValidator.tryValidate(body);
  if (errors) {
    return data({ errors, email: body.email }, 422);
  }

  const user = await accountService().getUserByCredentials(
    input.email,
    input.password
  );
  if (!user) {
    return data(
      {
        errors: { root: { message: m.validation_login_invalid() } },
        email: body.email,
      },
      400
    );
  }

  await auth().login(user.id, input.remember);

  session().flash("success", m.toast_signed_in_success());
  throw redirect(safeUrl(input.to) || "/");
}

const loginValidator = validator(
  z.object({
    email: z.email(m.validation_email_invalid()),
    password: z.string().min(1, m.validation_password_required()),
    remember: z.stringbool().optional(),
    to: z.string().optional(),
  })
);

function safeUrl(value?: string) {
  try {
    if (!value) return;
    const url = new URL(value, env().SITE_URL);
    return url.href.replace(url.origin, "");
  } catch {
    return;
  }
}
