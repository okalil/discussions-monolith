import { href, useFetcher } from "react-router";

import { deleteComment } from "~/core/comment";
import { auth } from "~/web/auth";
import { Button } from "~/web/shared/button";

import type { Route } from "./+types/delete-comment.route";

interface DeleteCommentProps {
  commentId: number;
}

export function DeleteComment({ commentId }: DeleteCommentProps) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form
      method="POST"
      action={href("/comments/:id/delete", { id: commentId.toString() })}
    >
      <Button variant="danger">Delete Comment</Button>
    </fetcher.Form>
  );
}

export const action = async ({ params }: Route.ActionArgs) => {
  const user = auth().getUserOrFail();
  await deleteComment(Number(params.id), user.id);
  return { ok: true };
};
