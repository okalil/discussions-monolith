import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { data, Form, redirect, useSubmit } from "react-router";
import * as z from "zod";

import type { Route } from "./+types/profile.route";

import { auth } from "../auth";
import { userService } from "../bindings";
import { bodyParser } from "../body-parser";
import { session } from "../session";
import { Avatar } from "../shared/avatar";
import { Button } from "../shared/button";
import { ErrorMessage } from "../shared/error-message";
import { Field } from "../shared/field";
import { Input } from "../shared/input";
import { validator } from "../validator";

export const meta: Route.MetaFunction = () => [
  { title: "Discussions | Profile" },
];

export async function loader() {
  const user = auth().getUserOrFail();
  return { user };
}

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { user } = loaderData;

  const submit = useSubmit();
  const form = useForm({
    resolver: updateUserValidator.resolver,
    errors: actionData?.errors,
  });
  const { errors } = form.formState;

  const file = form.watch("image");
  const fileUrl = useMemo(() => file && URL.createObjectURL(file), [file]);
  const userImage = fileUrl ?? user.image;

  return (
    <main className="max-w-lg mx-auto px-3 py-6">
      <h1 className="text-xl font-semibold mb-2">Profile</h1>
      <Form
        replace
        method="POST"
        encType="multipart/form-data"
        onSubmit={form.handleSubmit((_, e) => submit(e?.target))}
      >
        {errors.root?.message && <ErrorMessage error={errors.root.message} />}

        <label className="grid place-items-center mb-4">
          <Avatar
            src={userImage}
            alt={user.name ?? ""}
            size={64}
            fallback={user.name?.at(0)}
          />
          <input
            type="file"
            name="image"
            onChange={(event) => {
              const file = event.target.files?.item(0);
              if (file) form.setValue("image", file);
            }}
            className="hidden"
          />
          {errors.image && (
            <span className="text-sm text-center text-red-600 mt-2">
              {errors.image?.message}
            </span>
          )}
        </label>
        <Field label="Name" error={errors.name?.message}>
          <Input
            {...form.register("name")}
            defaultValue={user?.name ?? ""}
            type="text"
            aria-required
          />
        </Field>

        <Button variant="primary" className="h-12 mt-5 w-40 ml-auto">
          Save
        </Button>
      </Form>
    </main>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const user = auth().getUserOrFail();
  const body = await bodyParser.parse(request);
  const [errors, input] = await updateUserValidator.tryValidate(body);
  if (errors) return data({ errors, body }, 422);

  const fileKey = await userService().uploadUserImage(user.id, input.image);
  await userService().updateUser(user.id, input.name, fileKey);

  session().flash("success", "Successfully updated!");
  throw redirect(".");
}

const updateUserValidator = validator(
  z.object({
    name: z.string().min(1, "Name is required"),
    image: z
      .file("Image must be a file")
      .max(5 * 1024 * 1024, "Image must be less than 5MB")
      .transform((file) => {
        if (!file.size || !file.name) return undefined; // Ignore empty files
        return file;
      })
      .optional(),
  })
);
