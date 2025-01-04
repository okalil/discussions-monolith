import { useFetcher } from "react-router";

import { auth } from "~/.server/auth";
import { bodyParser } from "~/.server/body-parser";
import { handleError, handleSuccess } from "~/.server/response";
import { voteDiscussionValidator } from "~/.server/validators/discussion";
import { unvoteDiscussion, voteDiscussion } from "~/.server/data/discussion";

import type { Route } from "./+types/api.discussions.$id.vote";

export const action = async ({ request, params }: Route.ActionArgs) => {
  try {
    const user = await auth.getUserOrFail(request);
    const body = await bodyParser.parse(request);
    const { voted } = await voteDiscussionValidator.validate(body);

    if (voted) {
      await voteDiscussion(Number(params.id), user.id);
    } else {
      await unvoteDiscussion(Number(params.id), user.id);
    }
    return handleSuccess();
  } catch (error) {
    return handleError(error);
  }
};

export function useVoteDiscussionFetcher(id: number) {
  const fetcher = useFetcher();
  return {
    voted: fetcher.formData && fetcher.formData.get("voted") === "voted",
    submit(voted: boolean) {
      fetcher.submit(
        { voted },
        { action: `/api/discussions/${id}/vote`, method: "POST" }
      );
    },
  };
}
