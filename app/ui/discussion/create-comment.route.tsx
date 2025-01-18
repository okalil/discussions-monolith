import vine from "@vinejs/vine";
import { useFetcher } from "react-router";

import { auth } from "~/.server/auth";
import { Button } from "~/ui/shared/button";
import { Textarea } from "~/ui/shared/textarea";
import { bodyParser } from "~/.server/body-parser";
import { createComment } from "~/.server/data/comment";
import { handleError, handleSuccess } from "~/.server/response";

import type { Route } from "./+types/create-comment.route";

interface CreateCommentProps {
  discussionId: number;
}

export function CreateComment({ discussionId }: CreateCommentProps) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="POST" action="comments/new">
      <input name="discussionId" value={discussionId} type="hidden" />
      <div>
        <label htmlFor="body" className="text-sm font-medium mb-2">
          Write
        </label>
        <Textarea
          id="body"
          name="body"
          key={fetcher.data?.id ?? "noid"}
          placeholder="Write your comment here..."
          rows={4}
          required
        />
      </div>
      <div>
        <Button
          variant="primary"
          className="h-10 w-24 ml-auto"
          loading={fetcher.state !== "idle"}
        >
          Comment
        </Button>
      </div>
    </fetcher.Form>
  );
}

export const action = async ({ request, context }: Route.ActionArgs) => {
  const form = await bodyParser.parse(request);
  try {
    const user = await auth.getUserOrFail(context.session);
    const { body, discussionId } = await createCommentValidator.validate(form);
    const { id } = await createComment(discussionId, body, user.id);
    return handleSuccess({ id });
  } catch (error) {
    return handleError(error);
  }
};

const createCommentValidator = vine.compile(
  vine.object({
    body: vine.string().trim().minLength(1),
    discussionId: vine.number(),
  })
);
