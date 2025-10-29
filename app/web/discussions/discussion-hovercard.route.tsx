import * as HoverCard from "@radix-ui/react-hover-card";
import { Link, useFetcher } from "react-router";

import type { Route } from "./+types/discussion-hovercard.route";

import { discussionService } from "../bindings";
import { Avatar } from "../shared/avatar";

export async function loader({ params }: Route.LoaderArgs) {
  const discussion = await discussionService().getDiscussionWithReply(
    +params.id
  );
  return { discussion };
}

export async function clientLoader(_: Route.ClientLoaderArgs) {
  try {
    return await _.serverLoader();
  } catch {
    return; // prevents throwing error for unexpected/network issues
  }
}

export const shouldRevalidate = () => false;

interface DiscussionHoverCardProps extends React.PropsWithChildren {
  discussionId: number;
}

export function DiscussionHoverCard({
  discussionId,
  ...props
}: DiscussionHoverCardProps) {
  const fetcher = useFetcher<typeof loader>();
  const discussion = fetcher.data?.discussion;

  const onOpenChange = () => {
    if (!discussion && fetcher.state === "idle") {
      fetcher.load(`/discussions/${discussionId}/hovercard`);
    }
  };

  return (
    <HoverCard.Root openDelay={500} onOpenChange={onOpenChange}>
      <HoverCard.Trigger asChild>{props.children}</HoverCard.Trigger>
      <HoverCard.Portal>
        {discussion && (
          <HoverCard.Content
            className="w-[300px] rounded-md bg-white shadow-lg"
            sideOffset={5}
            side="top"
          >
            <div className="p-3 text-sm">
              <div className="mb-1">
                <p>
                  <Link
                    to={`/discussions/${discussion.id}`}
                    className="font-semibold hover:underline"
                  >
                    {discussion.title}
                  </Link>
                </p>
                <span className="text-gray-600">#{discussion.id}</span>
              </div>
              <p className="text-gray-600">{discussion.body}</p>
            </div>

            {discussion.reply && (
              <div className="border-t border-gray-200 p-3">
                <div className="flex items-center mb-2">
                  <Avatar
                    src={discussion.reply.author?.image}
                    alt={`${discussion.reply.author?.name}'s avatar`}
                    fallback={discussion.reply.author?.name?.at(0)}
                    className="w-6 h-6 rounded-full mr-2"
                    size={20}
                  />

                  <p className="text-xs text-gray-500">
                    <span className="text-gray-900 font-medium">
                      {discussion.reply.author?.name}
                    </span>{" "}
                    replied
                  </p>
                </div>
                <p className="text-gray-700 text-xs">{discussion.reply.body}</p>
              </div>
            )}
            <HoverCard.Arrow className="fill-white" />
          </HoverCard.Content>
        )}
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
