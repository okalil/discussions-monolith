import vine from "@vinejs/vine";
import { useFetcher } from "react-router";

import type { CommentsDto } from "~/core/data/comment";

import { bodyParser } from "~/web/body-parser";
import { updateComment } from "~/core/data/comment";
import { handleError, handleSuccess } from "~/web/response";

import type { Route } from "./+types/edit-comment.route";

import { Button } from "../shared/button";
import { Textarea } from "../shared/textarea";

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
  try {
    const user = await context.auth.getUserOrFail();
    const form = await bodyParser.parse(request);
    const { body } = await updateCommentValidator.validate(form);

    await updateComment(Number(params.id), body, user.id);

    return handleSuccess();
  } catch (error) {
    return handleError(error);
  }
};

const updateCommentValidator = vine.compile(
  vine.object({ body: vine.string().trim().minLength(1) })
);
