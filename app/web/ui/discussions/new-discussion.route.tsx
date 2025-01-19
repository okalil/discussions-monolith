import vine from "@vinejs/vine";
import { Form, redirect, useNavigation } from "react-router";

import { handleError } from "~/web/response";
import { bodyParser } from "~/web/body-parser";
import { Button } from "~/web/ui/shared/button";
import { createDiscussion } from "~/core/data/discussion";

import type { Route } from "./+types/new-discussion.route";

import { Input } from "../shared/input";
import { Textarea } from "../shared/textarea";

export default function Component({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  return (
    <main className="max-w-4xl mx-auto px-3 py-6">
      <h1 className="text-xl font-semibold mb-4">Start a new discussion</h1>
      <Form method="POST" className="space-y-3">
        {actionData?.error && (
          <p className="text-red-500 text-center">{actionData.error.message}</p>
        )}
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
  const form = await bodyParser.parse(request);
  try {
    const user = await context.auth.getUserOrFail();
    const { title, body } = await createDiscussionValidator.validate(form);
    const discussion = await createDiscussion(title, body, user.id);
    throw redirect(`/discussions/${discussion.id}`);
  } catch (error) {
    return handleError(error, { values: form });
  }
};

const createDiscussionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    body: vine.string().trim().minLength(1),
  })
);
