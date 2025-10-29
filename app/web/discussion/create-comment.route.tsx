import { data, href, useFetcher } from "react-router";
import * as z from "zod";

import type { Route } from "./+types/create-comment.route";

import { auth } from "../auth";
import { commentService } from "../bindings";
import { bodyParser } from "../body-parser";
import { Button } from "../shared/button";
import { Field } from "../shared/field";
import { Textarea } from "../shared/textarea";
import { validator } from "../validator";

interface CreateCommentProps {
  discussionId: number;
}

export function CreateComment({ discussionId }: CreateCommentProps) {
  const fetcher = useFetcher<typeof action>();
  return (
    <fetcher.Form
      method="POST"
      action={href("/comments/new")}
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        await fetcher.submit(form);
        form.reset();
      }}
    >
      <input name="discussionId" value={discussionId} type="hidden" />
      <Field label="Write">
        <Textarea
          name="body"
          placeholder="Write your comment here..."
          rows={4}
          required
        />
      </Field>
      <div>
        <Button variant="primary" className="h-10 w-24 ml-auto">
          Comment
        </Button>
      </div>
    </fetcher.Form>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const user = auth().getUserOrFail();
  const body = await bodyParser.parse(request);
  const [errors, input] = await createCommentValidator.tryValidate(body);
  if (errors) throw data({ errors }, 422);

  const comment = await commentService().createComment(
    input.discussionId,
    input.body,
    user.id
  );
  return { comment };
}

const createCommentValidator = validator(
  z.object({
    body: z.string().trim().min(1, "Comment body is required"),
    discussionId: z.coerce.number(),
  })
);
