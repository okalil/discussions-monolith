import { Form, useSearchParams } from "react-router";
import { z } from "zod/v4";

import { getDiscussions } from "~/core/discussion";
import { authContext } from "~/web/auth";
import { Button } from "~/web/ui/shared/button";
import { Input } from "~/web/ui/shared/input";
import { Pagination } from "~/web/ui/shared/pagination";
import { validator } from "~/web/validator";

import type { Route } from "./+types/discussions.route";

import { DiscussionRow } from "./discussion-row";

export const meta: Route.MetaFunction = () => [{ title: "Top Discussions" }];

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const user = context.get(authContext).getUser();
  const { q, page, limit } = await getDiscussionsValidator.validate(
    Object.fromEntries(new URL(request.url).searchParams)
  );

  const paginator = await getDiscussions({ page, limit, q }, user?.id);
  return paginator;
};

export default function Component({
  loaderData,
  matches,
}: Route.ComponentProps) {
  const { discussions, total, limit } = loaderData;
  const { user } = matches[1].data;

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const setPage = (page: number) =>
    setSearchParams({ ...searchParams, page: String(page) });
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="px-3 py-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center gap-5 h-10 mb-2">
        <Form className="flex-1">
          <Input type="search" name="q" placeholder="Search all discussions" />
        </Form>

        {!!user && (
          <Form action="/discussions/new">
            <Button variant="primary" className="h-full">
              New Discussion
            </Button>
          </Form>
        )}
      </div>

      <div className="mb-2">
        <h2 className="text-lg font-semibold">Discussions ({total})</h2>
      </div>

      <ul className="mb-4">
        {discussions.map((it) => (
          <DiscussionRow key={it.id} discussion={it} authenticated={!!user} />
        ))}
      </ul>

      {!!totalPages && (
        <Pagination
          page={page}
          onPageChange={setPage}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}

const getDiscussionsValidator = validator(
  z.object({
    page: z.coerce.number().catch(1),
    limit: z.coerce.number().catch(20),
    q: z.string().optional(),
  })
);
