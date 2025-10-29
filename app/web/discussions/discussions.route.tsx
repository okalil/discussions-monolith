import { Form, href, NavLink, useSearchParams } from "react-router";
import * as z from "zod";

import type { Route } from "./+types/discussions.route";

import { auth } from "../auth";
import { categoryService, discussionService } from "../bindings";
import { Button } from "../shared/button";
import { Icon } from "../shared/icon";
import { Input } from "../shared/input";
import { Pagination } from "../shared/pagination";
import { validator } from "../validator";
import { DiscussionRow } from "./discussion-row";

export const meta: Route.MetaFunction = () => [{ title: "Top Discussions" }];

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = auth().getUser();
  const { q, page, limit } = await getDiscussionsValidator.validate(
    Object.fromEntries(new URL(request.url).searchParams)
  );

  const categories = await categoryService().getCategories();
  const paginator = await discussionService().getDiscussions(
    { category: params.category, page, limit, q },
    user?.id
  );
  return { ...paginator, categories };
}

export default function Component({
  loaderData,
  matches,
  params,
}: Route.ComponentProps) {
  const { categories, discussions, total, limit } = loaderData;
  const { user } = matches[1].loaderData;

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const setPage = (page: number) =>
    setSearchParams({ ...searchParams, page: String(page) });
  const totalPages = Math.ceil(total / limit);

  const category = params.category
    ? categories.find((it) => it.slug === params.category)
    : null;

  return (
    <div className="px-3 py-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center gap-5 h-10 mb-4">
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

      <div className="grid gap-4 md:grid-cols-[256px_1fr]">
        <section className="px-2 row-start-2 md:row-auto">
          <h2 className="font-semibold mb-4">Categories</h2>
          <nav>
            <NavLink
              to={href("/")}
              className={(state) =>
                `text-gray-800 rounded-md p-2 flex items-center gap-2 group ${
                  state.isActive ? "bg-gray-100 active" : "hover:bg-gray-100"
                }`
              }
            >
              <Icon name="discussion" size={16} />
              <span className="text-sm group-[.active]:font-semibold ">
                View all discussions
              </span>
            </NavLink>
            {categories.map((it) => (
              <NavLink
                key={it.id}
                to={href("/categories/:category", { category: it.slug })}
                className={(state) =>
                  `text-gray-800 rounded-md px-2 py-[6px] flex items-center gap-2 group ${
                    state.isActive ? "bg-gray-100 active" : "hover:bg-gray-50"
                  }`
                }
              >
                {it.emoji}
                <span className="text-sm group-[.active]:font-semibold ">
                  {it.title}
                </span>
              </NavLink>
            ))}
          </nav>
        </section>

        <div>
          <div className="mb-2">
            {category ? (
              <>
                <h2 className="flex items-center gap-2 font-semibold">
                  <span className="text-lg">{category.emoji}</span>{" "}
                  {category.title} ({total})
                </h2>
                <p className="text-gray-600 text-sm pb-2 border-b border-gray-200">
                  {category.description}
                </p>
              </>
            ) : (
              <h2 className="font-semibold">Discussions ({total})</h2>
            )}
          </div>

          <ul className="mb-4">
            {discussions.map((it) => (
              <DiscussionRow
                key={it.id}
                discussion={it}
                authenticated={!!user}
              />
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
      </div>
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
