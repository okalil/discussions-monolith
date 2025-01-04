import { useFetcher } from "react-router";

import { handleError, handleSuccess } from "~/.server/response";
import { getDiscussionWithReply } from "~/.server/data/discussion";

import type { Route } from "./+types/api.discussions.$id.hovercard";

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

export function useHoverDiscussionFetcher(id: string | number) {
  const fetcher = useFetcher<Route.ComponentProps["loaderData"]>();
  const { data, error } = fetcher.data ?? {};
  return {
    data,
    error,
    load: () => {
      if (!data && fetcher.state === "idle") {
        fetcher.load(`/api/discussions/${id}/hovercard`);
      }
    },
  };
}
