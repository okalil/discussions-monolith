import { useFetcher } from "react-router";

import { auth } from "~/.server/auth";
import { bodyParser } from "~/.server/body-parser";
import { handleError, handleSuccess } from "~/.server/response";
import { unvoteComment, voteComment } from "~/.server/data/comment";
import { voteCommentValidator } from "~/.server/validators/comment";

import type { Route } from "./+types/api.discussions.$id.vote";

export const action = async ({ request, params }: Route.ActionArgs) => {
  try {
    const user = await auth.getUserOrFail(request);
    const body = await bodyParser.parse(request);
    const { voted } = await voteCommentValidator.validate(body);

    if (voted) {
      await voteComment(Number(params.id), user.id);
    } else {
      await unvoteComment(Number(params.id), user.id);
    }
    return handleSuccess();
  } catch (error) {
    return handleError(error);
  }
};

export function useVoteCommentFetcher(id: number) {
  const fetcher = useFetcher();
  return {
    voted: fetcher.formData && fetcher.formData.get("voted") === "voted",
    submit(voted: boolean) {
      fetcher.submit(
        { voted },
        { action: `/api/comments/${id}/vote`, method: "POST" }
      );
    },
  };
}
