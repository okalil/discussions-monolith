import { data, href, useFetcher } from "react-router";
import * as z from "zod";

import type { CommentsDto } from "../../core/comment";
import type { Route } from "./+types/edit-comment.route";

import { m } from "../../paraglide/messages";
import { auth } from "../auth";
import { commentService } from "../bindings";
import { bodyParser } from "../body-parser";
import { Button } from "../shared/button";
import { Field } from "../shared/field";
import { Textarea } from "../shared/textarea";
import { validator } from "../validator";

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
      <Field label={m.comment_write()}>
        <Textarea
          name="body"
          placeholder={m.comment_placeholder()}
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
          {m.comment_cancel()}
        </Button>
        <Button variant="primary" className="h-10 w-48">
          {m.comment_update()}
        </Button>
      </div>
    </fetcher.Form>
  );
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = auth().getUserOrFail();
  const body = await bodyParser.parse(request);
  const [error, input] = await updateCommentValidator.tryValidate(body);
  if (error) {
    return data({ error, body }, 422);
  }

  await commentService().updateComment(+params.id, input.body, user.id);
  return { ok: true };
}

const updateCommentValidator = validator(
  z.object({ body: z.string().trim().min(1) })
);
