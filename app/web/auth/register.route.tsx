import { useForm } from "react-hook-form";
import { data, Form, Link, redirect, useSubmit } from "react-router";
import * as z from "zod";

import type { Route } from "./+types/register.route";

import { m } from "../../paraglide/messages";
import { auth } from "../auth";
import { accountService, userService } from "../bindings";
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
    resolver: registerValidator.resolver,
    errors: actionData?.errors,
  });
  const { errors } = form.formState;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">{m.register_title()}</h2>
        <Form
          method="POST"
          className="space-y-4"
          onSubmit={form.handleSubmit((_, e) => submit(e?.target))}
        >
          {errors.root?.message && <ErrorMessage error={errors.root.message} />}

          <Field label={m.register_field_name()} error={errors.name?.message}>
            <Input
              {...form.register("name")}
              type="text"
              aria-required
              defaultValue={actionData?.values?.name}
            />
          </Field>

          <Field label={m.register_field_email()} error={errors.email?.message}>
            <Input
              {...form.register("email")}
              type="email"
              aria-required
              defaultValue={actionData?.values?.email}
            />
          </Field>

          <Field
            label={m.register_field_password()}
            error={errors.password?.message}
          >
            <Input
              {...form.register("password")}
              type="password"
              aria-required
            />
          </Field>

          <Field
            label={m.register_field_confirm_password()}
            error={errors.passwordConfirmation?.message}
          >
            <Input
              {...form.register("passwordConfirmation")}
              type="password"
              aria-required
            />
          </Field>

          <Button variant="primary" className="w-full h-12">
            {m.register_button()}
          </Button>
        </Form>
        <p className="text-center text-sm text-gray-600">
          {m.register_has_account()}{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:underline hover:text-indigo-500"
          >
            {m.register_sign_in_now()}
          </Link>
        </p>
      </div>
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const body = await bodyParser.parse(request);
  const [errors, input] = await registerValidator.tryValidate(body);

  if (errors || (await userService().getUserByEmail(input.email))) {
    delete body.password;
    delete body.passwordConfirmation;
    return data(
      {
        errors: errors || { email: { message: m.validation_email_taken() } },
        values: body,
      },
      422
    );
  }

  const user = await accountService().createCredentialAccount(
    input.name,
    input.email,
    input.password
  );

  await auth().login(user.id);

  session().flash("success", m.toast_signed_up_success());
  throw redirect("/");
}

const registerValidator = validator(
  z
    .object({
      name: z.string().trim().min(1, m.validation_name_required()),
      email: z.email(m.validation_email_invalid()),
      password: z
        .string()
        .min(8, m.validation_password_min())
        .max(72, m.validation_password_max()),
      passwordConfirmation: z
        .string()
        .min(1, m.validation_password_confirmation_required()),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      path: ["passwordConfirmation"],
      message: m.validation_passwords_no_match(),
    })
);
