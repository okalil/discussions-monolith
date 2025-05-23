import vine from "@vinejs/vine";
import { useMemo, useState } from "react";
import { data, Form, redirect, useNavigation } from "react-router";

import { updateUser, uploadUserImage } from "~/core/user";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { sessionContext } from "~/web/session";
import { Avatar } from "~/web/ui/shared/avatar";
import { Button } from "~/web/ui/shared/button";
import { ErrorMessage } from "~/web/ui/shared/error-message";
import { Input } from "~/web/ui/shared/input";

import type { Route } from "./+types/profile.route";

export const meta = () => [{ title: "Discussions | Profile" }];

export const loader = ({ context }: Route.LoaderArgs) => {
  const user = context.get(authContext).getUserOrFail();
  return { user };
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { user } = loaderData;
  const navigation = useNavigation();
  const [file, setFile] = useState<File>();
  const fileUrl = useMemo(() => file && URL.createObjectURL(file), [file]);
  const userImage = fileUrl ?? user.image;
  return (
    <main className="max-w-lg mx-auto px-3 py-6">
      <h1 className="text-xl font-semibold mb-2">Profile</h1>
      <Form replace method="POST" encType="multipart/form-data">
        {actionData?.error && <ErrorMessage error={actionData.error} />}

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
              if (file) setFile(file);
            }}
            className="hidden"
          />
        </label>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <Input
            defaultValue={user?.name ?? ""}
            name="name"
            type="text"
            id="name"
            required
          />
        </div>

        <Button
          variant="primary"
          className="h-12 mt-5 w-40 ml-auto"
          loading={navigation.state === "submitting"}
        >
          Save
        </Button>
      </Form>
    </main>
  );
}

export const action = async ({ request, context }: Route.ActionArgs) => {
  const user = context.get(authContext).getUserOrFail();
  const body = await bodyParser.parse(request);
  const [error, output] = await updateUserValidator.tryValidate(body);
  if (error) return data({ error, body }, 422);

  const fileKey = await uploadUserImage(user.id, output.image);
  await updateUser(user.id, output.name, fileKey);

  context.get(sessionContext).flash("success", "Successfully updated!");
  throw redirect(".");
};

const updateUserValidator = vine.compile(
  vine.object({
    name: vine.string(),
    image: vine.any().use(
      vine.createRule((value, _, field) => {
        if (!(value instanceof File)) {
          field.report("The {{ field }} must be a file", "file", field);
          return;
        }

        // handle empty file
        if (!value.name) {
          field.mutate(void 0, field);
          return;
        }

        // limits to 5 MB
        if (value.size > 5 * 1024 * 1024) {
          field.report(
            "The {{ field }} is greater than max size",
            "file",
            field
          );
        }
      })()
    ),
  })
);
