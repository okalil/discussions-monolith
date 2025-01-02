import { Form, Link, redirect, useNavigation } from "react-router";

import { auth } from "~/.server/auth";
import { Button } from "~/ui/shared/button";
import { handleError } from "~/.server/response";
import { bodyParser } from "~/.server/body-parser";
import { signUpValidator } from "~/.server/validators/user";

import type { Route } from "./+types/register.route";

import { Input } from "../shared/input";

export default function Component({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <Form method="post" className="space-y-4">
          {actionData?.error && (
            <p className="text-red-500 text-center">
              {actionData.error.message}
            </p>
          )}
          <div>
            <label
              htmlFor="name"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <Input name="name" type="text" id="name" required />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input name="email" type="email" id="email" required />
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

export const action = async ({ request }: Route.ActionArgs) => {
  const body = await bodyParser.parse(request);
  try {
    const { name, email, password } = await signUpValidator.validate(body);
    const cookie = await auth.signUp(name, email, password);
    throw redirect("/", { headers: [["set-cookie", cookie]] });
  } catch (error) {
    delete body.password;
    delete body.password_confirmation;
    return handleError(error, { values: body });
  }
};
