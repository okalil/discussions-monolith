import vine from "@vinejs/vine";
import { data, Form, redirect, useNavigation } from "react-router";

import { createDiscussion } from "~/core/discussion";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { Button } from "~/web/ui/shared/button";
import { ErrorMessage } from "~/web/ui/shared/error-message";
import { Input } from "~/web/ui/shared/input";
import { Textarea } from "~/web/ui/shared/textarea";

import type { Route } from "./+types/new-discussion.route";

export default function Component({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  return (
    <main className="max-w-4xl mx-auto px-3 py-6">
      <h1 className="text-xl font-semibold mb-4">Start a new discussion</h1>
      <Form method="POST" className="space-y-3">
        {actionData?.error && <ErrorMessage error={actionData.error} />}
        <div>
          <Input
            name="title"
            placeholder="Title"
            required
            defaultValue={actionData?.values?.title}
          />
        </div>
        <div>
          <Textarea
            name="body"
            placeholder="Body"
            required
            rows={16}
            defaultValue={actionData?.values?.body}
          />
        </div>
        <Button
          className="ml-auto"
          variant="primary"
          loading={navigation.state === "submitting"}
        >
          Start Discussion
        </Button>
      </Form>
    </main>
  );
}

export const action = async ({ request, context }: Route.ActionArgs) => {
  const user = context.get(authContext).getUserOrFail();
  const body = await bodyParser.parse(request);
  const [error, output] = await createDiscussionValidator.tryValidate(body);
  if (error) return data({ error, values: body }, 422);

  const discussion = await createDiscussion(output.title, output.body, user.id);
  throw redirect(`/discussions/${discussion.id}`);
};

const createDiscussionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    body: vine.string().trim().minLength(1),
  })
);
