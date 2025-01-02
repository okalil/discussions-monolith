import { useCreateCommentFetcher } from "~/api/comments.new";

import { Button } from "../shared/button";
import { Textarea } from "../shared/textarea";

export function CommentForm({
  discussionId,
  body = "",
}: {
  discussionId: number;
  body?: string;
}) {
  const fetcher = useCreateCommentFetcher();

  return (
    <fetcher.Form {...fetcher.formProps}>
      <input name="discussionId" value={discussionId} type="hidden" />
      <div>
        <label htmlFor="content" className="text-sm font-medium mb-2">
          Write
        </label>
        <Textarea
          key={fetcher.data?.id ?? "noid"}
          placeholder="Write your comment here..."
          defaultValue={body}
          rows={4}
          required
        />
      </div>
      <div>
        <Button
          variant="primary"
          className="h-10 w-24 ml-auto"
          loading={fetcher.state !== "idle"}
        >
          Comment
        </Button>
      </div>
    </fetcher.Form>
  );
}
