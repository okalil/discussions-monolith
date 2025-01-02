import { MdMoreHoriz } from "react-icons/md";
import { use, useState, useEffect } from "react";

import type { CommentsDto } from "~/.server/data/comment";

import { useVoteCommentFetcher } from "~/api/comments.$id.vote";
import { useEditCommentFetcher } from "~/api/comments.$id.edit";
import { useDeleteCommentFetcher } from "~/api/comments.$id.delete";

import { cn } from "../shared/utils/cn";
import { Avatar } from "../shared/avatar";
import { Button } from "../shared/button";
import { Textarea } from "../shared/textarea";
import { VoteButton } from "../shared/vote-button";
import { AlertModal } from "../shared/alert-modal";
import { DropdownMenu } from "../shared/dropdown-menu";

export function CommentsList({
  authenticated,
  ...props
}: {
  comments: Promise<CommentsDto>;
  authenticated: boolean;
}) {
  const comments = use(props.comments);

  if (!comments.length) return null;

  return (
    <ul className="grid">
      {comments.map((comment) => (
        <CommentRow
          key={comment.id}
          comment={comment}
          authenticated={authenticated}
        />
      ))}
    </ul>
  );
}

function CommentRow({
  comment,
  authenticated,
}: {
  comment: CommentsDto[number];
  authenticated: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const editFetcher = useEditCommentFetcher(comment.id);
  const deleteFetcher = useDeleteCommentFetcher(comment.id);
  const voteFetcher = useVoteCommentFetcher(comment.id);

  useEffect(() => setEditing(false), [comment.updatedAt]);

  const optimisticVoted = voteFetcher.voted;
  const voted = optimisticVoted ?? comment.voted;

  let votes = comment.votesCount;
  if (
    typeof optimisticVoted === "boolean" &&
    optimisticVoted !== comment.voted
  ) {
    votes += voted ? 1 : -1;
  }

  if (editing) {
    return (
      <li className="mb-4">
        <editFetcher.Form
          {...editFetcher.formProps}
          className={cn("px-3 py-3", "border border-gray-300 rounded-md")}
        >
          <input type="hidden" name="id" value={comment.id} />
          <div>
            <label htmlFor="edit_content" className="text-sm font-medium mb-2">
              Write
            </label>
            <Textarea
              id="edit_content"
              className="border border-gray-200 rounded-lg p-2 w-full mb-3"
              rows={4}
              name="body"
              required
              defaultValue={comment.body}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="danger"
              className="h-10 w-24 ml-auto"
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="h-10 w-48"
              loading={editFetcher.state !== "idle"}
            >
              Update comment
            </Button>
          </div>
        </editFetcher.Form>
      </li>
    );
  }

  return (
    <li
      id={`comment-${comment.id}`}
      className={cn(
        "py-2 px-4 border border-gray-200 rounded-lg mb-5",
        "target:border-x target:rounded target:border-blue-500"
      )}
    >
      <div className="flex justify-between mb-3 text-sm">
        <div className="flex items-center">
          <Avatar
            src={comment.author?.image}
            alt={`${comment.author?.name}'s avatar`}
            fallback={comment.author?.name?.at(0)}
            className="w-6 h-6 rounded-full mr-2"
            size={32}
          />

          <p className="text-gray-500">
            <span className="text-gray-900 font-medium">
              {comment.author?.name}
            </span>{" "}
            on{" "}
            {new Date(comment.createdAt).toLocaleDateString("en", {
              dateStyle: "medium",
            })}
          </p>

          {comment.isDiscussionAuthor && (
            <span
              className={cn(
                "px-2 py-px rounded-xl border border-gray-300 text-xs ml-2"
              )}
            >
              Author
            </span>
          )}
        </div>
        {comment.isCommentAuthor && (
          <div>
            <DropdownMenu
              trigger={
                <button
                  type="button"
                  aria-label="Comment options"
                  title="Comment options"
                  className="grid place-items-center p-2 rounded-md hover:bg-gray-100"
                >
                  <MdMoreHoriz size={20} />
                </button>
              }
            >
              <div className="grid gap-2 text-sm">
                <DropdownMenu.Item
                  onClick={() => {
                    navigator.clipboard.writeText(
                      window.location.href
                        .split("#")[0]
                        .concat(`#comment-${comment.id}`)
                    );
                  }}
                >
                  Copy Link
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => setEditing(true)}>
                  Edit
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => setDeleting(true)}
                  data-variant="danger"
                  className="data-[variant=danger]:text-red-500 data-[variant=danger]:hover:bg-red-50"
                >
                  Delete
                </DropdownMenu.Item>
              </div>
            </DropdownMenu>

            <AlertModal
              title="Delete comment"
              description="Are you sure you want to delete this comment?"
              open={deleting}
              onOpenChange={setDeleting}
              action={
                <deleteFetcher.Form {...deleteFetcher.formProps}>
                  <Button
                    variant="danger"
                    loading={deleteFetcher.state !== "idle"}
                  >
                    Delete comment
                  </Button>
                </deleteFetcher.Form>
              }
            />
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.body}</p>
      <VoteButton
        disabled={!authenticated}
        active={voted}
        total={votes}
        onClick={() => voteFetcher.submit(!voted)}
      />
    </li>
  );
}
