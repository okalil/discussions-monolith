import { useFetcher } from "react-router";

import { authContext } from "~/web/auth";
import { Button } from "~/web/ui/shared/button";
import { deleteComment } from "~/core/data/comment";

import type { Route } from "./+types/delete-comment.route";

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
  const user = context.get(authContext).getUserOrFail();
  await deleteComment(Number(params.id), user.id);
  return { ok: true };
};
