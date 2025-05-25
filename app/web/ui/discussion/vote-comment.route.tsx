import { href, useFetcher } from "react-router";
import { z } from "zod/v4";

import { unvoteComment, voteComment } from "~/core/comment";
import { authContext } from "~/web/auth";
import { bodyParser } from "~/web/body-parser";
import { VoteButton } from "~/web/ui/shared/vote-button";
import { validator } from "~/web/validator";

import type { Route } from "./+types/vote-comment.route";

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
          {
            action: href("/comments/:id/vote", { id: commentId.toString() }),
            method: "POST",
          }
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
  const { voted } = await voteCommentValidator.validate(body);

  if (voted) {
    await voteComment(Number(params.id), user.id);
  } else {
    await unvoteComment(Number(params.id), user.id);
  }
  return { ok: true };
};

const voteCommentValidator = validator(
  z.object({
    voted: z.stringbool(),
  })
);
