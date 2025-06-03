import { data, href, useFetcher } from "react-router";
import { z } from "zod/v4";

import type { CommentsDto } from "~/core/comment";

import { updateComment } from "~/core/comment";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { Button } from "~/web/ui/shared/button";
import { Field } from "~/web/ui/shared/field";
import { Textarea } from "~/web/ui/shared/textarea";
import { validator } from "~/web/validator";

import type { Route } from "./+types/edit-comment.route";

interface EditCommentProps {
  comment: CommentsDto[number];
  onCancel: () => void;
}

export function EditComment({ comment, onCancel }: EditCommentProps) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form
      method="POST"
      action={href("/comments/:id/edit", { id: comment.id.toString() })}
      className="px-3 py-3 border border-gray-300 rounded-md"
    >
      <input type="hidden" name="id" value={comment.id} />
      <Field label="Write">
        <Textarea
          name="body"
          placeholder="Write your comment here..."
          rows={4}
          required
          defaultValue={comment.body}
        />
      </Field>

      <div className="flex gap-2">
        <Button
          variant="danger"
          className="h-10 w-24 ml-auto"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button variant="primary" className="h-10 w-48">
          Update comment
        </Button>
      </div>
    </fetcher.Form>
  );
}

export const action = async ({
  request,
  context,
  params,
}: Route.ActionArgs) => {
  const user = context.get(authContext).getUserOrFail();
  const body = await bodyParser.parse(request);
  const [error, input] = await updateCommentValidator.tryValidate(body);
  if (error) {
    return data({ error, body }, 422);
  }

  await updateComment(Number(params.id), input.body, user.id);
  return { ok: true };
};

const updateCommentValidator = validator(
  z.object({ body: z.string().trim().min(1) })
);
