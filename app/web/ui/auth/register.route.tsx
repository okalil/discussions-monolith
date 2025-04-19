import { data, Form, Link, redirect, useNavigation } from "react-router";
import z from "zod";

import { createCredentialAccount } from "~/core/account";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { sessionContext } from "~/web/session";
import { Button } from "~/web/ui/shared/button";
import { ErrorMessage } from "~/web/ui/shared/error-message";
import { Field } from "~/web/ui/shared/field";
import { Input } from "~/web/ui/shared/input";
import { useForm } from "~/web/ui/shared/utils/form";
import { validator } from "~/web/validator";

import type { Route } from "./+types/register.route";

export default function Component({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const form = useForm({ validator: registerValidator, data: actionData });
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <Form method="post" className="space-y-4" {...form}>
          {actionData?.error && <ErrorMessage error={actionData.error} />}

          <Field label="Name" error={form.error?.properties?.name?.errors}>
            <Input
              name="name"
              type="text"
              aria-required="true"
              defaultValue={actionData?.values?.name}
            />
          </Field>

          <Field label="Email" error={form.error?.properties?.email?.errors}>
            <Input
              name="email"
              type="email"
              aria-required="true"
              defaultValue={actionData?.values?.email}
            />
          </Field>

          <Field
            label="Password"
            error={form.error?.properties?.password?.errors}
          >
            <Input name="password" type="password" aria-required="true" />
          </Field>

          <Field
            label="Confirm Password"
            error={form.error?.properties?.passwordConfirmation?.errors}
          >
            <Input
              name="passwordConfirmation"
              type="password"
              aria-required="true"
            />
          </Field>

          <Button
            variant="primary"
            className="w-full h-12"
            loading={navigation.state === "submitting"}
          >
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
  const [error, input] = registerValidator.tryValidate(body);
  if (error) {
    delete body.password;
    delete body.passwordConfirmation;
    return data({ error, values: body }, 422);
  }

  const user = await createCredentialAccount(
    input.name,
    input.email,
    input.password
  );
  if (!user) {
    return data({ error: "Email already taken", values: void 0 }, 400);
  }

  await context.get(authContext).login(user.id);

  context.get(sessionContext).flash("success", "Signed up successfully!");
  throw redirect("/");
};

const registerValidator = validator(
  z
    .object({
      name: z.string().trim().min(1, { error: "Name is required" }),
      email: z.email({
        error: (issue) =>
          issue.input ? "Email is invalid" : "Email is required",
      }),
      password: z.string().min(1, { error: "Password is required" }),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      path: ["passwordConfirmation"],
      error: "Passwords do not match",
    })
);
