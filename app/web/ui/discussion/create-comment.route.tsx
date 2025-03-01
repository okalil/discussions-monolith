import vine from "@vinejs/vine";
import { useFetcher } from "react-router";

import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { Button } from "~/web/ui/shared/button";
import { Textarea } from "~/web/ui/shared/textarea";
import { createComment } from "~/core/data/comment";

import type { Route, Info } from "./+types/create-comment.route";

interface CreateCommentProps {
  discussionId: number;
}

export function CreateComment({ discussionId }: CreateCommentProps) {
  const fetcher = useFetcher<Info["actionData"]>();

  return (
    <fetcher.Form
      method="POST"
      action="comments/new"
      key={fetcher.state === "idle" ? fetcher.data?.comment.id : undefined} // resets the form after submission/revalidation
    >
      <input name="discussionId" value={discussionId} type="hidden" />
      <div>
        <label htmlFor="body" className="text-sm font-medium mb-2">
          Write
        </label>
        <Textarea
          id="body"
          name="body"
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
  const user = context.get(authContext).getUserOrFail();
  const body = await bodyParser.parse(request);
  const output = await createCommentValidator.validate(body);
  const comment = await createComment(
    output.discussionId,
    output.body,
    user.id
  );
  return { comment };
};

const createCommentValidator = vine.compile(
  vine.object({
    body: vine.string().trim().minLength(1),
    discussionId: vine.number(),
  })
);
