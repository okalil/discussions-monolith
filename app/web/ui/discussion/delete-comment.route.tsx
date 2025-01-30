import { useFetcher } from "react-router";

import { deleteComment } from "~/core/data/comment";

import type { Route } from "./+types/delete-comment.route";

import { Button } from "../shared/button";

interface DeleteCommentProps {
  commentId: number;
}

export function DeleteComment({ commentId }: DeleteCommentProps) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="POST" action={`comments/${commentId}/delete`}>
      <Button variant="danger" loading={fetcher.state !== "idle"}>
        Delete Comment
      </Button>
    </fetcher.Form>
  );
}

export const action = async ({ context, params }: Route.ActionArgs) => {
  const user = context.auth.getUserOrFail();
  await deleteComment(Number(params.id), user.id);
  return { ok: true };
};
