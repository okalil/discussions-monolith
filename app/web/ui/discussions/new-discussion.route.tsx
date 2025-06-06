import { useForm } from "react-hook-form";
import { data, Form, redirect, useSubmit } from "react-router";
import { z } from "zod/v4";

import { createDiscussion } from "~/core/discussion";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { Button } from "~/web/ui/shared/button";
import { ErrorMessage } from "~/web/ui/shared/error-message";
import { Field } from "~/web/ui/shared/field";
import { Input } from "~/web/ui/shared/input";
import { Textarea } from "~/web/ui/shared/textarea";
import { validator } from "~/web/validator";

import type { Route } from "./+types/new-discussion.route";

export default function Component({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const form = useForm({
    resolver: createDiscussionValidator.resolver,
    errors: actionData?.errors,
  });
  const { errors } = form.formState;

  return (
    <main className="max-w-4xl mx-auto px-3 py-6">
      <h1 className="text-xl font-semibold mb-4">Start a new discussion</h1>
      <Form
        method="POST"
        className="space-y-3"
        onSubmit={form.handleSubmit((_, e) => submit(e?.target))}
      >
        {errors.root?.message && <ErrorMessage error={errors.root?.message} />}

        <Field label="Title" error={errors.title?.message}>
          <Input
            {...form.register("title")}
            placeholder="Title"
            aria-required
            defaultValue={actionData?.values?.title}
          />
        </Field>
        <Field label="Body" error={errors.body?.message}>
          <Textarea
            {...form.register("body")}
            placeholder="Body"
            aria-required
            rows={16}
            defaultValue={actionData?.values?.body}
          />
        </Field>
        <Button className="ml-auto" variant="primary">
          Start Discussion
        </Button>
      </Form>
    </main>
  );
}

export const action = async ({ request, context }: Route.ActionArgs) => {
  const user = context.get(authContext).getUserOrFail();
  const body = await bodyParser.parse(request);
  const [errors, input] = await createDiscussionValidator.tryValidate(body);
  if (errors) return data({ errors, values: body }, 422);

  const discussion = await createDiscussion(input.title, input.body, user.id);
  throw redirect(`/discussions/${discussion.id}`);
};

const createDiscussionValidator = validator(
  z.object({
    title: z.string().trim().min(1, "Title is required"),
    body: z.string().trim().min(1, "Body is required"),
  })
);
