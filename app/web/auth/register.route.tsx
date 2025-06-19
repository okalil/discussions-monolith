import { useForm } from "react-hook-form";
import { data, Form, Link, redirect, useSubmit } from "react-router";
import { z } from "zod/v4";

import { createCredentialAccount } from "~/core/account";
import { getUserByEmail } from "~/core/user";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { sessionContext } from "~/web/session";
import { Button } from "~/web/shared/button";
import { ErrorMessage } from "~/web/shared/error-message";
import { Field } from "~/web/shared/field";
import { Input } from "~/web/shared/input";
import { validator } from "~/web/validator";

import type { Route } from "./+types/register.route";

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
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <Form
          method="POST"
          className="space-y-4"
          onSubmit={form.handleSubmit((_, e) => submit(e?.target))}
        >
          {errors.root?.message && <ErrorMessage error={errors.root.message} />}

          <Field label="Name" error={errors.name?.message}>
            <Input
              {...form.register("name")}
              type="text"
              aria-required
              defaultValue={actionData?.values?.name}
            />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <Input
              {...form.register("email")}
              type="email"
              aria-required
              defaultValue={actionData?.values?.email}
            />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <Input
              {...form.register("password")}
              type="password"
              aria-required
            />
          </Field>

          <Field
            label="Confirm Password"
            error={errors.passwordConfirmation?.message}
          >
            <Input
              {...form.register("passwordConfirmation")}
              type="password"
              aria-required
            />
          </Field>

          <Button variant="primary" className="w-full h-12">
            Register
          </Button>
        </Form>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:underline hover:text-indigo-500"
          >
            Sign in now
          </Link>
        </p>
      </div>
    </div>
  );
}

export const action = async ({ request, context }: Route.ActionArgs) => {
  const body = await bodyParser.parse(request);
  const [errors, input] = await registerValidator.tryValidate(body);

  if (errors || (await getUserByEmail(input.email))) {
    delete body.password;
    delete body.passwordConfirmation;
    return data(
      {
        errors: errors || { email: { message: "Email already taken" } },
        values: body,
      },
      422
    );
  }

  const user = await createCredentialAccount(
    input.name,
    input.email,
    input.password
  );

  await context.get(authContext).login(user.id);

  context.get(sessionContext).flash("success", "Signed up successfully!");
  throw redirect("/");
};

const registerValidator = validator(
  z
    .object({
      name: z.string().trim().min(1, "Name is required"),
      email: z.email("Inform a valid email address"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(72, "Password can't be longer than 72 characters"),
      passwordConfirmation: z
        .string()
        .min(1, "Password confirmation is required"),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      path: ["passwordConfirmation"],
      message: "Passwords do not match",
    })
);
