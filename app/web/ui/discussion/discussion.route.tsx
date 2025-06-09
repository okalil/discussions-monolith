import type { ShouldRevalidateFunctionArgs } from "react-router";

import { Suspense } from "react";
import { Link } from "react-router";

import { getComments } from "~/core/comment";
import { getDiscussion } from "~/core/discussion";
import { auth } from "~/web/auth";
import { CommentsList } from "~/web/ui/discussion/comments-list";
import { Avatar } from "~/web/ui/shared/avatar";

import type { Route } from "./+types/discussion.route";

import { CreateComment } from "./create-comment.route";
import { VoteDiscussion } from "./vote-discussion.route";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const user = auth().getUser();
  const userId = user?.id;

  const comments = getComments(Number(params.id), userId);
  const discussion = await getDiscussion(Number(params.id), userId);

  if (!discussion) throw new Response("Not Found Discussion", { status: 404 });

  return { discussion, comments };
};

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.discussion.title },
];

export default function Component({
  loaderData,
  matches,
}: Route.ComponentProps) {
  const { discussion, comments } = loaderData;
  const { user } = matches[1].data;

  const authenticated = !!user;

  return (
    <main className="max-w-4xl mx-auto px-3 py-6">
      <h1 className="text-2xl font-medium mb-2">
        {discussion.title}{" "}
        <span className="text-gray-500 font-normal ml-1">#{discussion.id}</span>
      </h1>

      <section className="px-3 pt-2 pb-3 border rounded-lg mb-6">
        <div className="flex items-center mb-4 text-sm">
          <Avatar
            src={discussion.author?.image}
            alt={`${discussion.author?.name}'s avatar`}
            fallback={discussion.author?.name?.at(0)}
            className="w-6 h-6 rounded-full mr-2"
            size={32}
          />

          <p className="text-gray-500">
            <span className="text-gray-900 font-medium">
              {discussion.author?.name}
            </span>{" "}
            on{" "}
            {new Date(discussion.createdAt).toLocaleDateString("en", {
              dateStyle: "medium",
            })}
          </p>
        </div>
        <div className="whitespace-pre-wrap mb-2">{discussion.body}</div>
        <VoteDiscussion
          discussionId={discussion.id}
          active={discussion.voted}
          total={discussion.votesCount}
          disabled={!authenticated}
        />
      </section>

      <section className="mb-6">
        <h2 className="text-base font-medium mb-4">
          {discussion.commentsCount > 1
            ? `${discussion.commentsCount} comments`
            : discussion.commentsCount
            ? "1 comment"
            : "No comments"}
        </h2>
        <Suspense fallback={<div>Loading comments...</div>}>
          <CommentsList comments={comments} authenticated={authenticated} />
        </Suspense>
        <hr className="border-gray-300" />
      </section>

      {authenticated ? (
        <section>
          <h3 className="text-lg font-medium mb-4">Add a comment</h3>
          <CreateComment discussionId={discussion.id} />
        </section>
      ) : (
        <div className="rounded-md border border-gray-300 px-3 py-3">
          <Link to="/register" className="underline">
            Sign up
          </Link>{" "}
          now to comment on this discussion. Already have an account?{" "}
          <Link to="/login" className="underline">
            Sign in
          </Link>
        </div>
      )}
    </main>
  );
}

// This shouldRevalidate shouldn't be necessary since the default behavior
// is to skip revalidation after a non-200 status action result
// Open issue: https://github.com/remix-run/react-router/issues/13062
export function shouldRevalidate(args: ShouldRevalidateFunctionArgs) {
  if (args.actionStatus !== 200) return false;
  return args.defaultShouldRevalidate;
}
