import vine from "@vinejs/vine";
import { useFetcher } from "react-router";

import { bodyParser } from "~/web/body-parser";
import { handleError, handleSuccess } from "~/web/response";
import { unvoteDiscussion, voteDiscussion } from "~/core/data/discussion";

import type { Route } from "./+types/vote-discussion.route";

import { VoteButton } from "../shared/vote-button";

interface VoteDiscussionProps extends React.ComponentProps<typeof VoteButton> {
  discussionId: number;
}

export function VoteDiscussion({
  discussionId,
  ...props
}: VoteDiscussionProps) {
  const fetcher = useFetcher();

  const optimisticVoted =
    fetcher.formData && fetcher.formData.get("voted") === "true";
  const voted = optimisticVoted ?? props.active;

  let votes = props.total;
  if (
    typeof optimisticVoted === "boolean" &&
    optimisticVoted !== props.active
  ) {
    votes += voted ? 1 : -1;
  }

  return (
    <VoteButton
      {...props}
      onClick={() =>
        fetcher.submit(
          { voted: !voted },
          { action: `/discussions/${discussionId}/vote`, method: "POST" }
        )
      }
      active={voted}
      total={votes}
    />
  );
}

export const action = async ({
  request,
  context,
  params,
}: Route.ActionArgs) => {
  try {
    const user = await context.auth.getUserOrFail();
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

const voteDiscussionValidator = vine.compile(
  vine.object({
    voted: vine.boolean(),
  })
);
