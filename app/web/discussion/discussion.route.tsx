import { Suspense } from "react";
import { href, Link, useSearchParams } from "react-router";

import type { Route } from "./+types/discussion.route";

import { m } from "../../paraglide/messages";
import { getLocale } from "../../paraglide/runtime";
import { auth } from "../auth";
import { discussionService, commentService } from "../bindings";
import { Avatar } from "../shared/avatar";
import { CommentsList } from "./comments-list";
import { CreateComment } from "./create-comment.route";
import { Participants } from "./participants";
import { VoteDiscussion } from "./vote-discussion.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = auth().getUser();
  const sort = new URL(request.url).searchParams.get("sort")?.toString();

  const comments = commentService().getComments(+params.id, user?.id, sort);
  const participants = discussionService().getParticipants(+params.id);
  const discussion = await discussionService().getDiscussion(
    +params.id,
    user?.id
  );

  if (!discussion) throw new Response("Not Found Discussion", { status: 404 });

  return { discussion, comments, participants };
}

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData?.discussion.title },
];

export default function Component({
  loaderData,
  matches,
}: Route.ComponentProps) {
  const { discussion, comments, participants } = loaderData;
  const { user } = matches[1].loaderData;
  const authenticated = !!user;

  return (
    <div className="max-w-5xl mx-auto px-3 py-6">
      <main>
        <h1 className="text-2xl font-medium mb-4">
          {discussion.title}{" "}
          <span className="text-gray-500 font-normal ml-1">
            #{discussion.id}
          </span>
        </h1>

        <div className="grid lg:grid-cols-[1fr,16rem] gap-6 relative">
          <div>
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
                  {m.discussion_created_at({
                    date: new Date(discussion.createdAt).toLocaleDateString(
                      getLocale(),
                      { dateStyle: "medium" }
                    ),
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium">
                  {discussion.commentsCount
                    ? m.discussion_comments({
                      count: discussion.commentsCount,
                    })
                    : m.discussion_comments_empty()}
                </h2>
                <nav
                  className="flex gap-2"
                  aria-label={m.discussion_sort_aria()}
                >
                  <CommentSort sort="oldest">
                    {m.discussion_sort_oldest()}
                  </CommentSort>
                  <CommentSort sort="newest">
                    {m.discussion_sort_newest()}
                  </CommentSort>
                  <CommentSort sort="top">
                    {m.discussion_sort_top()}
                  </CommentSort>
                </nav>
              </div>
              <Suspense fallback={<div>{m.discussion_loading_comments()}</div>}>
                <CommentsList
                  comments={comments}
                  authenticated={authenticated}
                />
              </Suspense>
              <hr className="border-gray-300" />
            </section>

            {authenticated ? (
              <section>
                <h3 className="text-lg font-medium mb-4">
                  {m.discussion_add_comment()}
                </h3>
                <CreateComment discussionId={discussion.id} />
              </section>
            ) : (
              <div className="rounded-md border border-gray-300 px-3 py-3">
                <Link to="/register" className="underline">
                  {m.discussion_sign_up_to_comment()}
                </Link>{" "}
                {m.discussion_sign_up_to_comment_text()}{" "}
                <Link to="/login" className="underline">
                  {m.discussion_sign_in()}
                </Link>
              </div>
            )}
          </div>

          <aside>
            <div className="sticky top-6">
              <div className="pb-4 mb-4 border-b border-gray-200">
                <h3 className="text-xs font-semibold text-gray-600 mb-2">
                  {m.discussion_category_label()}
                </h3>
                <Link
                  to={href("/categories/:category", {
                    category: discussion.category.slug,
                  })}
                  className="flex items-center gap-2 group w-max"
                >
                  <div className="text-base bg-gray-200 rounded-md h-8 w-8 flex items-center justify-center">
                    {discussion.category.emoji}
                  </div>
                  <span className="text-xs font-semibold group-hover:underline">
                    {discussion.category.title}
                  </span>
                </Link>
              </div>

              <div className="pb-4 mb-4 border-b border-gray-200">
                <h3 className="text-xs font-semibold text-gray-600 mb-2">
                  {m.discussion_participants({
                    count: discussion.participantsCount,
                  })}
                </h3>
                <Suspense
                  fallback={<div>{m.discussion_loading_participants()}</div>}
                >
                  <Participants participants={participants} />
                </Suspense>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

interface CommentSortProps {
  sort: "oldest" | "newest" | "top";
  children: React.ReactNode;
}

function CommentSort({ sort, children }: CommentSortProps) {
  const [searchParams] = useSearchParams();
  const currentSort = searchParams.get("sort") || "oldest";

  return (
    <Link
      to={`?sort=${sort}`}
      className={`px-3 py-1 text-sm rounded-md ${currentSort === sort
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:bg-gray-50"
        }`}
      preventScrollReset
    >
      {children}
    </Link>
  );
}
