import vine from "@vinejs/vine";
import {
  data,
  Form,
  Link,
  redirect,
  useNavigation,
  useSearchParams,
} from "react-router";

import { Input } from "~/web/ui/shared/input";
import { bodyParser } from "~/web/body-parser";
import { Button } from "~/web/ui/shared/button";
import { resetPassword } from "~/core/data/user";
import { ErrorMessage } from "~/web/ui/shared/error-message";

import type { Route } from "./+types/reset-password.route";

export default function Component({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        <Form method="POST" className="space-y-4">
          {actionData?.error && <ErrorMessage error={actionData.error} />}
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
  const [error, output] = await resetPasswordValidator.tryValidate(body);
  if (error) return data({ error }, 422);

  const reset = await resetPassword(
    output.email,
    output.password,
    output.token
  );
  if (!reset) return data({ error: "Invalid credentials" }, 400);

  throw redirect("/login");
};

const resetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8).confirmed(),
    token: vine.string(),
  })
);
