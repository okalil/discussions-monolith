import { href, useFetcher } from "react-router";
import * as z from "zod";

import { auth } from "~/web/auth";
import { commentService } from "~/web/bindings";
import { bodyParser } from "~/web/body-parser";
import { VoteButton } from "~/web/shared/vote-button";
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

export async function action({ request, params }: Route.ActionArgs) {
  const user = auth().getUserOrFail();
  const body = await bodyParser.parse(request);
  const { voted } = await voteCommentValidator.validate(body);

  if (voted) {
    await commentService().voteComment(+params.id, user.id);
  } else {
    await commentService().unvoteComment(+params.id, user.id);
  }
  return { ok: true };
}

const voteCommentValidator = validator(
  z.object({
    voted: z.stringbool(),
  })
);
