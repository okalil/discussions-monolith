import { href, useFetcher } from "react-router";

import type { Route } from "./+types/delete-comment.route";

import { auth } from "../auth";
import { commentService } from "../bindings";
import { Button } from "../shared/button";

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

export async function action({ params }: Route.ActionArgs) {
  const user = auth().getUserOrFail();
  await commentService().deleteComment(Number(params.id), user.id);
  return { ok: true };
}
