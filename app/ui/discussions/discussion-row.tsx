import { Form, Link } from "react-router";
import { MdChatBubbleOutline } from "react-icons/md";

import type { DiscussionsDto } from "~/.server/data/discussion";

import { cn } from "../shared/utils/cn";
import { Avatar } from "../shared/avatar";
import { DiscussionHoverCard } from "./discussion-hovercard.route";
import { VoteDiscussion } from "../discussion/vote-discussion.route";

interface DiscussionProps {
  discussion: DiscussionsDto["discussions"][number];
  authenticated: boolean;
}

export function DiscussionRow({ discussion, authenticated }: DiscussionProps) {
  return (
    <li className="flex gap-5 items-center py-2 px-4 border-b border-gray-300 hover:bg-gray-50">
      <VoteDiscussion
        discussionId={discussion.id}
        active={discussion.voted}
        total={discussion.votesCount}
        disabled={!authenticated}
      />

      <div className="flex-1">
        <DiscussionHoverCard discussionId={discussion.id}>
          <Link
            className="hover:underline text-lg font-medium visited:text-gray-600"
            to={`/discussions/${discussion.id}`}
            prefetch="intent"
            viewTransition
            style={{ viewTransitionName: `title-${discussion.id}` }}
          >
            {discussion.title}
          </Link>
        </DiscussionHoverCard>
        <p className="text-sm text-gray-600">
          {discussion.author?.name} started on{" "}
          {new Date(discussion.createdAt).toLocaleDateString("en", {
            dateStyle: "medium",
          })}
        </p>
      </div>

      <Avatar
        src={discussion.author?.image}
        alt={`${discussion.author?.name}'s avatar`}
        fallback={discussion.author?.name?.at(0)}
        size={36}
      />
      <Form action={`/discussions/${discussion.id}`}>
        <button
          className={cn(
            "flex items-center gap-2 rounded-xl",
            "px-2 py-1 text-gray-600 hover:text-blue-600"
          )}
          aria-label={`${discussion.commentsCount} comentários`}
        >
          <MdChatBubbleOutline size={16} />
          {discussion.commentsCount}
        </button>
      </Form>
    </li>
  );
}
