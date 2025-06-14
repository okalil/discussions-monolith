import { useForm } from "react-hook-form";
import { data, Form, redirect, useSubmit } from "react-router";
import { z } from "zod/v4";

import { updatePassword, verifyPassword } from "~/core/account";
import { deleteOtherSessions } from "~/core/session";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { sessionContext } from "~/web/session";
import { Button } from "~/web/ui/shared/button";
import { Field } from "~/web/ui/shared/field";
import { Input } from "~/web/ui/shared/input";
import { validator } from "~/web/validator";

import type { Route } from "./+types/profile.route";

export const meta = () => [{ title: "Discussions | Change Password" }];

export default function Component({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const form = useForm({
    resolver: changePasswordValidator.resolver,
    errors: actionData?.errors,
  });
  const { errors } = form.formState;

  return (
    <main className="max-w-lg mx-auto px-3">
      <h1 className="text-xl font-semibold mb-6">Change Password</h1>

      <Form
        method="POST"
        onSubmit={form.handleSubmit((_, e) => submit(e?.target))}
      >
        <div className="space-y-4 mb-5">
          <Field
            label="Current Password"
            error={errors.currentPassword?.message?.toString()}
          >
            <Input
              {...form.register("currentPassword")}
              type="password"
              aria-required
            />
          </Field>

          <Field
            label="New Password"
            error={errors.newPassword?.message?.toString()}
          >
            <Input
              {...form.register("newPassword")}
              type="password"
              aria-required
            />
          </Field>

          <Field
            label="Confirm New Password"
            error={errors.confirmPassword?.message?.toString()}
          >
            <Input
              {...form.register("confirmPassword")}
              type="password"
              aria-required
            />
          </Field>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 accent-black border"
              {...form.register("invalidateSessions")}
            />
            <span className="text-sm text-gray-600 cursor-pointer">
              Sign out all other sessions
            </span>
          </label>
        </div>

        <Button variant="primary" className="h-12 w-full">
          Update Password
        </Button>
      </Form>
    </main>
  );
}

export const action = async ({ request, context }: Route.ActionArgs) => {
  const user = context.get(authContext).getUserOrFail();
  const body = await bodyParser.parse(request);
  const [errors, input] = await changePasswordValidator.tryValidate(body);
  if (errors) return data({ errors }, 422);

  const isValid = await verifyPassword(user.id, input.currentPassword);
  if (!isValid) {
    return data(
      {
        errors: {
          currentPassword: { message: "Current password is incorrect" },
        },
      },
      400
    );
  }

  await updatePassword(user.id, input.newPassword);

  if (input.invalidateSessions) {
    await deleteOtherSessions(user.id, context.get(authContext).sessionId);
  }

  context
    .get(sessionContext)
    .flash("success", "Password updated successfully!");
  throw redirect(".");
};

const changePasswordValidator = validator(
  z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(72, "Password can't be longer than 72 characters"),
      confirmPassword: z.string().min(1, "Password confirmation is required"),
      invalidateSessions: z.union([z.boolean(), z.stringbool()]).default(false),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    })
);
