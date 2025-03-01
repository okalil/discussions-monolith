import vine from "@vinejs/vine";
import { data, useFetcher } from "react-router";

import type { CommentsDto } from "~/core/data/comment";

import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { Button } from "~/web/ui/shared/button";
import { updateComment } from "~/core/data/comment";
import { Textarea } from "~/web/ui/shared/textarea";

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
      action={`comments/${comment.id}/edit`}
      className="px-3 py-3 border border-gray-300 rounded-md"
    >
      <input type="hidden" name="id" value={comment.id} />
      <div>
        <label htmlFor="edit_content" className="text-sm font-medium mb-2">
          Write
        </label>
        <Textarea
          id="edit_content"
          className="border border-gray-200 rounded-lg p-2 w-full mb-3"
          rows={4}
          name="body"
          required
          defaultValue={comment.body}
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="danger"
          className="h-10 w-24 ml-auto"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          className="h-10 w-48"
          loading={fetcher.state !== "idle"}
        >
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
  const [error, output] = await updateCommentValidator.tryValidate(body);
  if (error) {
    return data({ error, body }, 422);
  }

  await updateComment(Number(params.id), output.body, user.id);
  return { ok: true };
};

const updateCommentValidator = vine.compile(
  vine.object({ body: vine.string().trim().minLength(1) })
);
