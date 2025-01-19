import vine from "@vinejs/vine";
import { Form, Link, redirect, useNavigation } from "react-router";

import { env } from "~/.server/env";
import { mailer } from "~/.server/mailer";
import { Button } from "~/ui/shared/button";
import { handleError } from "~/.server/response";
import { bodyParser } from "~/.server/body-parser";
import { createVerificationToken, getUserByEmail } from "~/.server/data/user";

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

export const action = async ({ request, context }: Route.ActionArgs) => {
  const body = await bodyParser.parse(request);
  try {
    const { email } = await forgetPasswordValidator.validate(body);
    const user = await getUserByEmail(email);
    if (user) {
      const token = await createVerificationToken(email);
      await mailer.send({
        to: email,
        subject: "Discussions Password Reset",
        body: (
          <ResetPasswordEmail
            userFirstname={user.name ?? ""}
            resetPasswordLink={`${env.SITE_URL}/reset-password?token=${token}`}
          />
        ),
      });
    }
    context.session.flash(
      "toast",
      "If your email is in our system, you will receive instructions to reset your password"
    );
    throw redirect("/login");
  } catch (error) {
    return handleError(error, { values: body });
  }
};

const forgetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
  })
);
