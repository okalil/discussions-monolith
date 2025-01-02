import { Form, Link, redirect, useNavigation } from "react-router";

import { env } from "~/.server/env";
import { auth } from "~/.server/auth";
import { mailer } from "~/.server/mailer";
import { toasts } from "~/.server/toasts";
import { Button } from "~/ui/shared/button";
import { handleError } from "~/.server/response";
import { bodyParser } from "~/.server/body-parser";
import { forgetPasswordValidator } from "~/.server/validators/user";

import type { Route } from "./+types/forgot-password.route";

import { Input } from "../shared/input";
import { ResetPasswordEmail } from "./emails/reset-password-email";

export default function Component({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <Form method="POST" className="space-y-4">
          {actionData?.error && (
            <p className="text-red-500 text-center">
              {actionData.error.message}
            </p>
          )}
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

export const action = async ({ request }: Route.ActionArgs) => {
  const body = await bodyParser.parse(request);
  try {
    const { email } = await forgetPasswordValidator.validate(body);
    const { user, token } = await auth.forgetPassword(email);
    await mailer.send({
      to: email,
      from: "me@mail.com",
      subject: "Discussions Password Reset",
      body: (
        <ResetPasswordEmail
          userFirstname={user.name ?? ""}
          resetPasswordLink={`${env.SITE_URL}/reset-password?token=${token}`}
        />
      ),
    });
    const cookie = await toasts.put(
      "An email was sent to reset your password, check your inbox!"
    );
    throw redirect("/login", { headers: [["set-cookie", cookie]] });
  } catch (error) {
    return handleError(error, { values: body });
  }
};
