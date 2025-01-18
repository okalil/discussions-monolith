import { Link, useFetcher } from "react-router";
import * as HoverCard from "@radix-ui/react-hover-card";

import { handleError, handleSuccess } from "~/.server/response";
import { getDiscussionWithReply } from "~/.server/data/discussion";

import type { Route } from "./+types/discussion-hovercard.route";

import { Avatar } from "../shared/avatar";

export const loader = async ({ params }: Route.LoaderArgs) => {
  try {
    const id = Number(params.id);
    const discussion = await getDiscussionWithReply(id);
    return handleSuccess(discussion);
  } catch (error) {
    return handleError(error);
  }
};

export const shouldRevalidate = () => false;

interface DiscussionHoverCardProps extends React.PropsWithChildren {
  discussionId: number;
}

export function DiscussionHoverCard({
  discussionId,
  ...props
}: DiscussionHoverCardProps) {
  const fetcher = useFetcher<Route.ComponentProps["loaderData"]>();
  const { data } = fetcher.data ?? {};

  const onOpen = () => {
    if (!data && fetcher.state === "idle") {
      fetcher.load(`/discussions/${discussionId}/hovercard`);
    }
  };

  return (
    <HoverCard.Root openDelay={500} onOpenChange={() => onOpen()}>
      <HoverCard.Trigger asChild>{props.children}</HoverCard.Trigger>
      <HoverCard.Portal>
        {data && (
          <HoverCard.Content
            className="w-[300px] rounded-md bg-white shadow-lg"
            sideOffset={5}
            side="top"
          >
            <div className="p-3 text-sm">
              <div className="mb-1">
                <p>
                  <Link
                    to={`/discussions/${data.id}`}
                    className="font-semibold hover:underline"
                  >
                    {data.title}
                  </Link>
                </p>
                <span className="text-gray-600">#{data.id}</span>
              </div>
              <p className="text-gray-600">{data.body}</p>
            </div>

            {data.reply && (
              <div className="border-t border-gray-200 p-3">
                <div className="flex items-center mb-2">
                  <Avatar
                    src={data.reply.author?.image}
                    alt={`${data.reply.author?.name}'s avatar`}
                    fallback={data.reply.author?.name?.at(0)}
                    className="w-6 h-6 rounded-full mr-2"
                    size={20}
                  />

                  <p className="text-xs text-gray-500">
                    <span className="text-gray-900 font-medium">
                      {data.reply.author?.name}
                    </span>{" "}
                    replied
                  </p>
                </div>
                <p className="text-gray-700 text-xs">{data.reply.body}</p>
              </div>
            )}
            <HoverCard.Arrow className="fill-white" />
          </HoverCard.Content>
        )}
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
