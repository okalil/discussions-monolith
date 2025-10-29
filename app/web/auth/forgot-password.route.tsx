import { useForm } from "react-hook-form";
import { data, Form, Link, redirect, useSubmit } from "react-router";
import * as z from "zod";

import type { Route } from "./+types/forgot-password.route";

import { accountService, userService } from "../bindings";
import { bodyParser } from "../body-parser";
import { session } from "../session";
import { Button } from "../shared/button";
import { Field } from "../shared/field";
import { Input } from "../shared/input";
import { validator } from "../validator";

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

export async function action({ request }: Route.ActionArgs) {
  const body = await bodyParser.parse(request);
  const [errors, input] = await forgetPasswordValidator.tryValidate(body);
  if (errors) {
    return data({ errors, values: body }, 422);
  }

  const user = await userService().getUserByEmail(input.email);
  if (user && user.email !== null) {
    await accountService().forgetPassword(user.email);
  }

  session().flash(
    "success",
    "If your email is in our system, you will receive instructions to reset your password"
  );
  throw redirect("/login");
}

const forgetPasswordValidator = validator(
  z.object({
    email: z.email("Inform a valid email address"),
  })
);
