import { useFetcher } from "react-router";

import { auth } from "~/.server/auth";
import { bodyParser } from "~/.server/body-parser";
import { updateComment } from "~/.server/data/comment";
import { handleError, handleSuccess } from "~/.server/response";
import { updateCommentValidator } from "~/.server/validators/comment";

import type { Route } from "./+types/discussions.$id.vote";

export const action = async ({ request, params }: Route.ActionArgs) => {
  try {
    const user = await auth.getUserOrFail(request);
    const form = await bodyParser.parse(request);
    const { body } = await updateCommentValidator.validate(form);

    await updateComment(Number(params.id), body, user.id);

    return handleSuccess();
  } catch (error) {
    return handleError(error);
  }
};

export function useEditCommentFetcher(id: number) {
  const fetcher = useFetcher();
  return {
    ...fetcher,
    formProps: { method: "POST", action: `/api/comments/${id}/edit` } as const,
  };
}
