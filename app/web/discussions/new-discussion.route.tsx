import { useForm } from "react-hook-form";
import { data, Form, redirect, useSubmit } from "react-router";
import { z } from "zod/v4";

import { getCategories } from "~/core/category";
import { createDiscussion } from "~/core/discussion";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { Button } from "~/web/shared/button";
import { ErrorMessage } from "~/web/shared/error-message";
import { Field } from "~/web/shared/field";
import { Input } from "~/web/shared/input";
import { Textarea } from "~/web/shared/textarea";
import { validator } from "~/web/validator";

import type { Route } from "./+types/new-discussion.route";

import "./new-discussion.css";

export const loader = async () => {
  const categories = await getCategories();
  return { categories };
};

export default function Component({
  actionData,
  loaderData,
}: Route.ComponentProps) {
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
        <Field label="Category" error={errors.categoryId?.message}>
          <select {...form.register("categoryId")}>
            <button>
              {/* @ts-expect-error <selectedcontent> is experimental */}
              <selectedcontent></selectedcontent>
            </button>
            {loaderData.categories.map((category) => (
              <option key={category.id} value={category.id}>
                <span className="emoji">{category.emoji}</span>
                <span className="text">
                  <span className="title">{category.title}</span>
                  <span className="desc">{category.description}</span>
                </span>
              </option>
            ))}
          </select>
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

  const discussion = await createDiscussion(
    input.title,
    input.body,
    input.categoryId,
    user.id
  );
  throw redirect(`/discussions/${discussion.id}`);
};

const createDiscussionValidator = validator(
  z.object({
    title: z.string().trim().min(1, "Title is required"),
    body: z.string().trim().min(1, "Body is required"),
    categoryId: z.coerce.number(),
  })
);
