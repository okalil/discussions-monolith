import { useFetcher } from "react-router";

import { auth } from "~/.server/auth";
import { bodyParser } from "~/.server/body-parser";
import { createComment } from "~/.server/data/comment";
import { handleError, handleSuccess } from "~/.server/response";
import { createCommentValidator } from "~/.server/validators/comment";

import type { Route } from "./+types/api.comments.new";

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

export const useCreateCommentFetcher = () => {
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>();
  const { data, error } = fetcher.data ?? {};
  return {
    ...fetcher,
    data,
    error,
    formProps: { method: "POST", action: "/api/comments/new" } as const,
  };
};
