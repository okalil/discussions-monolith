import { Form, Link } from "react-router";

import type { DiscussionsDto } from "~/core/discussion";

import { Avatar } from "~/web/ui/shared/avatar";
import { Icon } from "~/web/ui/shared/icon";
import { cn } from "~/web/ui/shared/utils/cn";

import { VoteDiscussion } from "../discussion/vote-discussion.route";
import { DiscussionHoverCard } from "./discussion-hovercard.route";

interface DiscussionProps {
  discussion: DiscussionsDto["discussions"][number];
  authenticated: boolean;
}

export function DiscussionRow({ discussion, authenticated }: DiscussionProps) {
  return (
    <li className="flex gap-5 items-center py-2 px-4 border-b border-gray-200 hover:bg-gray-50">
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
          <Icon name="chat" size={16} />
          {discussion.commentsCount}
        </button>
      </Form>
    </li>
  );
}
