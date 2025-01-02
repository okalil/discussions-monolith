import { useFetcher } from "react-router";

import { auth } from "~/.server/auth";
import { deleteComment } from "~/.server/data/comment";
import { handleError, handleSuccess } from "~/.server/response";

import type { Route } from "./+types/comments.$id.delete";

export const action = async ({ request, params }: Route.ActionArgs) => {
  try {
    const user = await auth.getUserOrFail(request);
    await deleteComment(Number(params.id), user.id);
    return handleSuccess();
  } catch (error) {
    return handleError(error);
  }
};

export function useDeleteCommentFetcher(id: number) {
  const fetcher = useFetcher();
  return {
    ...fetcher,
    formProps: {
      method: "POST",
      action: `/api/comments/${id}/delete`,
    } as const,
  };
}
