import vine from "@vinejs/vine";
import {
  Form,
  Link,
  redirect,
  useNavigation,
  useSearchParams,
} from "react-router";

import { Button } from "~/web/ui/shared/button";
import { bodyParser } from "~/web/body-parser";
import { handleError } from "~/web/response";
import { resetPassword } from "~/core/data/user";

import type { Route } from "./+types/reset-password.route";

import { Input } from "../shared/input";

export default function Component({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        <Form method="POST" className="space-y-4">
          {actionData?.error && (
            <p className="text-red-500 text-sm max-w-xs mx-auto text-center">
              {actionData.error.message}
            </p>
          )}
          <input name="token" value={token} type="hidden" />
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
              New Password
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
          <Button variant="primary" className="w-full">
            {navigation.state === "submitting" ? "Submitting..." : "Submit"}
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

export const action = async ({ request }: Route.ActionArgs) => {
  const body = await bodyParser.parse(request);
  try {
    const { email, password, token } = await resetPasswordValidator.validate(
      body
    );
    await resetPassword(email, password, token);

    throw redirect("/login");
  } catch (error) {
    return handleError(error);
  }
};

const resetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8).confirmed(),
    token: vine.string(),
  })
);
