import { render } from "@react-email/components";
import vine from "@vinejs/vine";
import { data } from "react-router";
import { Form, Link, redirect, useNavigation } from "react-router";

import { env } from "~/config/env";
import { forgetPassword } from "~/core/account";
import { getUserByEmail } from "~/core/user";
import { bodyParser } from "~/web/body-parser";
import { sessionContext } from "~/web/session";
import { Button } from "~/web/ui/shared/button";
import { ErrorMessage } from "~/web/ui/shared/error-message";
import { Input } from "~/web/ui/shared/input";

import type { Route } from "./+types/forgot-password.route";

import { ResetPasswordEmail } from "./emails/reset-password-email";

export default function Component({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <Form method="POST" className="space-y-4">
          {actionData?.error && <ErrorMessage error={actionData.error} />}
          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input name="email" type="email" id="email" required />
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

export const action = async ({ request, context }: Route.ActionArgs) => {
  const body = await bodyParser.parse(request);
  const [error, output] = await forgetPasswordValidator.tryValidate(body);
  if (error) {
    return data({ error, values: body }, 422);
  }

  const user = await getUserByEmail(output.email);
  if (user && user.email) {
    await forgetPassword(user.email, async (token) => {
      const body = (
        <ResetPasswordEmail
          userFirstname={user.name}
          resetPasswordLink={`${env.SITE_URL}/reset-password?token=${token}`}
        />
      );
      const [html, text] = await Promise.all([
        render(body),
        render(body, { plainText: true }),
      ]);
      return { html, text };
    });
  }
  context
    .get(sessionContext)
    .flash(
      "success",
      "If your email is in our system, you will receive instructions to reset your password"
    );
  throw redirect("/login");
};

const forgetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
  })
);
