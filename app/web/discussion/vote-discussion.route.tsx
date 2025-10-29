import { data, useFetcher } from "react-router";
import * as z from "zod";

import type { Route } from "./+types/vote-discussion.route";

import { auth } from "../auth";
import { discussionService } from "../bindings";
import { bodyParser } from "../body-parser";
import { VoteButton } from "../shared/vote-button";
import { validator } from "../validator";

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

export async function action({ request, params }: Route.ActionArgs) {
  const user = auth().getUserOrFail();
  const body = await bodyParser.parse(request);
  const [errors, input] = await voteDiscussionValidator.tryValidate(body);
  if (errors) {
    return data({ errors, values: body }, 422);
  }

  if (input.voted) {
    await discussionService().voteDiscussion(+params.id, user.id);
  } else {
    await discussionService().unvoteDiscussion(+params.id, user.id);
  }
  return { ok: true };
}

const voteDiscussionValidator = validator(
  z.object({
    voted: z.stringbool(),
  })
);
