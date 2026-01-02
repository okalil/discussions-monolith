import { useForm } from "react-hook-form";
import {
  data,
  Form,
  Link,
  redirect,
  useSearchParams,
  useSubmit,
} from "react-router";
import * as z from "zod";

import type { Route } from "./+types/reset-password.route";

import { m } from "../../paraglide/messages";
import { accountService } from "../bindings";
import { bodyParser } from "../body-parser";
import { session } from "../session";
import { Button } from "../shared/button";
import { ErrorMessage } from "../shared/error-message";
import { Field } from "../shared/field";
import { Input } from "../shared/input";
import { validator } from "../validator";

export default function Component({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const form = useForm({
    resolver: resetPasswordValidator.resolver,
    errors: actionData?.errors,
  });
  const { errors } = form.formState;

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">{m.reset_password_title()}</h2>
        <Form
          method="POST"
          className="space-y-4"
          onSubmit={form.handleSubmit((_, e) => submit(e?.target))}
        >
          {errors?.root?.message && (
            <ErrorMessage error={errors.root.message} />
          )}

          <input {...form.register("token")} value={token} type="hidden" />

          <Field label={m.reset_password_field_email()} error={errors.email?.message}>
            <Input {...form.register("email")} type="email" aria-required />
          </Field>

          <Field label={m.reset_password_field_new_password()} error={errors.password?.message}>
            <Input
              {...form.register("password")}
              type="password"
              aria-required
            />
          </Field>

          <Field
            label={m.reset_password_field_confirm_password()}
            error={errors.passwordConfirmation?.message}
          >
            <Input
              {...form.register("passwordConfirmation")}
              type="password"
              aria-required
            />
          </Field>

          <Button variant="primary" className="w-full h-12">
            {m.reset_password_submit()}
          </Button>
        </Form>
        <p className="text-center text-sm text-gray-600">
          {m.reset_password_remember()}{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
            {m.reset_password_login()}
          </Link>
        </p>
      </div>
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const body = await bodyParser.parse(request);
  const [errors, input] = await resetPasswordValidator.tryValidate(body);
  if (errors) return data({ errors }, 422);

  const reset = await accountService().resetPassword(
    input.email,
    input.password,
    input.token
  );
  if (!reset)
    return data({ errors: { root: { message: m.validation_invalid_credentials() } } }, 400);

  session().flash("success", m.toast_reset_password_success());
  throw redirect("/login");
}

const resetPasswordValidator = validator(
  z
    .object({
      email: z.email(m.validation_email_invalid()),
      password: z
        .string()
        .min(8, m.validation_password_min())
        .max(72, m.validation_password_max()),
      passwordConfirmation: z
        .string()
        .min(8, m.validation_password_confirmation_min()),
      token: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      path: ["passwordConfirmation"],
      message: m.validation_passwords_no_match(),
    })
);
