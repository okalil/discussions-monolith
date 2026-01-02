import { use, useState, useEffect } from "react";

import type { CommentsDto } from "../../core/comment";

import { m } from "../../paraglide/messages";
import { getLocale } from "../../paraglide/runtime";
import { AlertModal } from "../shared/alert-modal";
import { Avatar } from "../shared/avatar";
import { DropdownMenu } from "../shared/dropdown-menu";
import { Icon } from "../shared/icon";
import { cn } from "../shared/utils/cn";
import { DeleteComment } from "./delete-comment.route";
import { EditComment } from "./edit-comment.route";
import { VoteComment } from "./vote-comment.route";

interface CommentsListProps {
  comments: Promise<CommentsDto>;
  authenticated: boolean;
}

export function CommentsList({ authenticated, ...props }: CommentsListProps) {
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

interface CommentRowProps {
  comment: CommentsDto[number];
  authenticated: boolean;
}

function CommentRow({ comment, authenticated }: CommentRowProps) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setEditing(false), [comment.updatedAt]);

  if (editing) {
    return (
      <li className="mb-4">
        <EditComment comment={comment} onCancel={() => setEditing(false)} />
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
            {m.discussion_created_at({
              date: new Date(comment.createdAt).toLocaleDateString(getLocale(), {
                dateStyle: "medium",
              }),
            })}
          </p>

          {comment.isDiscussionAuthor && (
            <span
              className={cn(
                "px-2 py-px rounded-xl border border-gray-300 text-xs ml-2"
              )}
            >
              {m.comment_author()}
            </span>
          )}
        </div>
        {comment.isCommentAuthor && (
          <div>
            <DropdownMenu
              trigger={
                <button
                  type="button"
                  aria-label={m.comment_options_aria()}
                  title={m.comment_options_aria()}
                  className="grid place-items-center p-2 rounded-md hover:bg-gray-100"
                >
                  <Icon name="dots" size={20} />
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
                  {m.comment_copy_link()}
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => setEditing(true)}>
                  {m.comment_edit()}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => setDeleting(true)}
                  data-variant="danger"
                  className="data-[variant=danger]:text-red-500 data-[variant=danger]:hover:bg-red-50"
                >
                  {m.comment_delete()}
                </DropdownMenu.Item>
              </div>
            </DropdownMenu>

            <AlertModal
              title={m.comment_delete_title()}
              description={m.comment_delete_description()}
              open={deleting}
              onOpenChange={setDeleting}
              action={<DeleteComment commentId={comment.id} />}
            />
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.body}</p>
      <VoteComment
        commentId={comment.id}
        active={comment.voted}
        total={comment.votesCount}
        disabled={!authenticated}
      />
    </li>
  );
}
