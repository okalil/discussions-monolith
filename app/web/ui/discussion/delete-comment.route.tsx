import { href, useFetcher } from "react-router";

import { deleteComment } from "~/core/comment";
import { authContext } from "~/web/auth";
import { Button } from "~/web/ui/shared/button";

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

export const action = async ({ context, params }: Route.ActionArgs) => {
  const user = context.get(authContext).getUserOrFail();
  await deleteComment(Number(params.id), user.id);
  return { ok: true };
};
