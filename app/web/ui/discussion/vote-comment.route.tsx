import vine from "@vinejs/vine";
import { useFetcher } from "react-router";

import { bodyParser } from "~/web/body-parser";
import { unvoteComment, voteComment } from "~/core/data/comment";

import type { Route } from "./+types/vote-comment.route";

import { VoteButton } from "../shared/vote-button";

interface VoteCommentProps extends React.ComponentProps<typeof VoteButton> {
  commentId: number;
}

export function VoteComment({ commentId, ...props }: VoteCommentProps) {
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
          { action: `comments/${commentId}/vote`, method: "POST" }
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
  const user = context.auth.getUserOrFail();
  const body = await bodyParser.parse(request);
  const { voted } = await voteCommentValidator.validate(body);

  if (voted) {
    await voteComment(Number(params.id), user.id);
  } else {
    await unvoteComment(Number(params.id), user.id);
  }
  return { ok: true };
};

const voteCommentValidator = vine.compile(
  vine.object({
    voted: vine.boolean(),
  })
);
