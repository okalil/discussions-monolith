import { Form, Link } from "react-router";
import { MdChatBubbleOutline } from "react-icons/md";
import * as HoverCard from "@radix-ui/react-hover-card";

import type { DiscussionsDto } from "~/.server/data/discussion";

import { useVoteDiscussionFetcher } from "~/resources/api.discussions.$id.vote";
import { useHoverDiscussionFetcher } from "~/resources/api.discussions.$id.hovercard";

import { cn } from "../shared/utils/cn";
import { Avatar } from "../shared/avatar";
import { VoteButton } from "../shared/vote-button";

interface DiscussionProps {
  discussion: DiscussionsDto["discussions"][number];
  authenticated: boolean;
}

export function DiscussionRow({
  discussion: it,
  authenticated,
}: DiscussionProps) {
  const voteFetcher = useVoteDiscussionFetcher(it.id);
  const hoverCardFetcher = useHoverDiscussionFetcher(it.id);

  const optimisticVoted = voteFetcher.voted;
  const voted = optimisticVoted ?? it.voted;

  let votes = it.votesCount;
  if (typeof optimisticVoted === "boolean" && optimisticVoted !== it.voted) {
    votes += voted ? 1 : -1;
  }

  return (
    <li className="flex gap-5 items-center py-2 px-4 border-b border-gray-300 hover:bg-gray-50">
      <VoteButton
        disabled={!authenticated}
        onClick={() => voteFetcher.submit(!voted)}
        active={voted}
        total={votes}
      />

      <div className="flex-1">
        <HoverCard.Root
          openDelay={500}
          onOpenChange={() => hoverCardFetcher.load()}
        >
          <HoverCard.Trigger asChild>
            <Link
              className="hover:underline text-lg font-medium visited:text-gray-600"
              to={`/discussions/${it.id}`}
              prefetch="intent"
              viewTransition
              style={{ viewTransitionName: `title-${it.id}` }}
            >
              {it.title}
            </Link>
          </HoverCard.Trigger>
          <HoverCard.Portal>
            {hoverCardFetcher.data && (
              <HoverCard.Content
                className="w-[300px] rounded-md bg-white shadow-lg"
                sideOffset={5}
                side="top"
              >
                <div className="p-3 text-sm">
                  <div className="mb-1">
                    <p>
                      <Link
                        to={`/discussions/${it.id}`}
                        className="font-semibold hover:underline"
                      >
                        {it.title}
                      </Link>
                    </p>
                    <span className="text-gray-600">#{it.id}</span>
                  </div>
                  <p className="text-gray-600">{hoverCardFetcher.data.body}</p>
                </div>

                {hoverCardFetcher.data.reply && (
                  <div className="border-t border-gray-200 p-3">
                    <div className="flex items-center mb-2">
                      <Avatar
                        src={hoverCardFetcher.data.reply.author?.image}
                        alt={`${hoverCardFetcher.data.reply.author?.name}'s avatar`}
                        fallback={hoverCardFetcher.data.reply.author?.name?.at(
                          0
                        )}
                        className="w-6 h-6 rounded-full mr-2"
                        size={20}
                      />

                      <p className="text-xs text-gray-500">
                        <span className="text-gray-900 font-medium">
                          {hoverCardFetcher.data.reply.author?.name}
                        </span>{" "}
                        replied
                      </p>
                    </div>
                    <p className="text-gray-700 text-xs">
                      {hoverCardFetcher.data.reply.body}
                    </p>
                  </div>
                )}
                <HoverCard.Arrow className="fill-white" />
              </HoverCard.Content>
            )}
          </HoverCard.Portal>
        </HoverCard.Root>
        <p className="text-sm text-gray-600">
          {it.author?.name} started on{" "}
          {new Date(it.createdAt).toLocaleDateString("en", {
            dateStyle: "medium",
          })}
        </p>
      </div>

      <Avatar
        src={it.author?.image}
        alt={`${it.author?.name}'s avatar`}
        fallback={it.author?.name?.at(0)}
        size={36}
      />
      <Form action={`/discussions/${it.id}`}>
        <button
          className={cn(
            "flex items-center gap-2 rounded-xl",
            "px-2 py-1 text-gray-600 hover:text-blue-600"
          )}
          aria-label={`${it.commentsCount} comentários`}
        >
          <MdChatBubbleOutline size={16} />
          {it.commentsCount}
        </button>
      </Form>
    </li>
  );
}
