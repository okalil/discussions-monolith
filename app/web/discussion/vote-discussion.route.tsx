import { data, useFetcher } from "react-router";
import { z } from "zod/v4";

import { unvoteDiscussion, voteDiscussion } from "~/core/discussion";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { VoteButton } from "~/web/shared/vote-button";
import { validator } from "~/web/validator";

import type { Route } from "./+types/vote-discussion.route";

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
  const user = context.get(authContext).getUserOrFail();
  const body = await bodyParser.parse(request);
  const [errors, input] = await voteDiscussionValidator.tryValidate(body);
  if (errors) {
    return data({ errors, values: body }, 422);
  }

  if (input.voted) {
    await voteDiscussion(Number(params.id), user.id);
  } else {
    await unvoteDiscussion(Number(params.id), user.id);
  }
  return { ok: true };
};

const voteDiscussionValidator = validator(
  z.object({
    voted: z.stringbool(),
  })
);
