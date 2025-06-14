import { useForm } from "react-hook-form";
import { data, useSubmit } from "react-router";
import { Form, Link, redirect } from "react-router";
import { z } from "zod/v4";

import { forgetPassword } from "~/core/account";
import { getUserByEmail } from "~/core/user";
import { bodyParser } from "~/web/body-parser";
import { sessionContext } from "~/web/session";
import { Button } from "~/web/ui/shared/button";
import { Input } from "~/web/ui/shared/input";
import { validator } from "~/web/validator";

import type { Route } from "./+types/forgot-password.route";

import { Field } from "../shared/field";

export default function Component({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const form = useForm({
    resolver: forgetPasswordValidator.resolver,
    errors: actionData?.errors,
  });
  const { errors } = form.formState;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <Form
          method="POST"
          className="space-y-4"
          onSubmit={form.handleSubmit((_, e) => submit(e?.target))}
        >
          <Field label="Email" error={errors.email?.message}>
            <Input {...form.register("email")} type="email" aria-required />
          </Field>
          <Button variant="primary" className="w-full h-12">
            Submit
          </Button>
        </Form>
        <p className="text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export const action = async ({ request, context }: Route.ActionArgs) => {
  const body = await bodyParser.parse(request);
  const [errors, input] = await forgetPasswordValidator.tryValidate(body);
  if (errors) {
    return data({ errors, values: body }, 422);
  }

  const user = await getUserByEmail(input.email);
  if (user && user.email !== null) {
    await forgetPassword(user.email);
  }
  context
    .get(sessionContext)
    .flash(
      "success",
      "If your email is in our system, you will receive instructions to reset your password"
    );
  throw redirect("/login");
};

const forgetPasswordValidator = validator(
  z.object({
    email: z.email("Inform a valid email address"),
  })
);
