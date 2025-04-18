import vine from "@vinejs/vine";
import { data, Form, Link, redirect, useNavigation } from "react-router";

import { createCredentialAccount } from "~/core/account";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { sessionContext } from "~/web/session";
import { Button } from "~/web/ui/shared/button";
import { ErrorMessage } from "~/web/ui/shared/error-message";
import { Input } from "~/web/ui/shared/input";

import type { Route } from "./+types/register.route";

export default function Component({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <Form method="post" className="space-y-4">
          {actionData?.error && <ErrorMessage error={actionData.error} />}
          <div>
            <label
              htmlFor="name"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <Input
              name="name"
              type="text"
              id="name"
              required
              defaultValue={actionData?.values?.name}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              name="email"
              type="email"
              id="email"
              required
              defaultValue={actionData?.values?.email}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Input name="password" type="password" id="password" required />
          </div>
          <div>
            <label
              htmlFor="password_confirmation"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <Input
              name="password_confirmation"
              type="password"
              id="password_confirmation"
              required
            />
          </div>
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
  const [error, output] = await registerValidator.tryValidate(body);
  if (error) {
    delete body.password;
    delete body.password_confirmation;
    return data({ error, values: body }, 422);
  }

  const user = await createCredentialAccount(
    output.name,
    output.email,
    output.password
  );
  await context.get(authContext).login(user.id);

  context.get(sessionContext).flash("success", "Signed up successfully!");
  throw redirect("/");
};

const registerValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    email: vine.string().email(),
    password: vine.string().minLength(6).confirmed(),
  })
);
