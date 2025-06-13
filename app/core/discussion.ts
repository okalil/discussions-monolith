import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  like,
  or,
  sql,
} from "drizzle-orm";

import { db, schema } from "~/core/services/db";

export const createDiscussion = async (
  title: string,
  body: string,
  categoryId: number,
  userId: number
) => {
  const [discussion] = await db
    .insert(schema.discussions)
    .values({
      title,
      body,
      categoryId,
      authorId: userId,
    })
    .returning();
  return discussion;
};

interface GetDiscussionsInput {
  category?: string;
  page: number;
  limit: number;
  q?: string;
}
export const getDiscussions = async (
  filters: GetDiscussionsInput,
  userId = 0
) => {
  const { category, page, limit, q } = filters;
  const offset = (page - 1) * limit;

  const sqlFilters = and(
    // Category filter
    category ? eq(schema.categories.slug, category) : undefined,
    // Search filter
    q
      ? or(
          like(schema.discussions.title, `%${q}%`),
          like(schema.discussions.body, `%${q}%`)
        )
      : undefined
  );

  const [rawTotal, rawDiscussions] = await Promise.all([
    db
      .select({ total: count(schema.discussions.id) })
      .from(schema.discussions)
      .leftJoin(
        schema.categories,
        eq(schema.discussions.categoryId, schema.categories.id)
      )
      .where(sqlFilters),
    db
      .select({
        id: schema.discussions.id,
        title: schema.discussions.title,
        createdAt: schema.discussions.createdAt,
        author: {
          name: schema.users.name,
          image: schema.users.image,
        },
        commentsCount: countDistinct(schema.comments.id),
        votesCount: countDistinct(schema.discussionVotes.userId),
        voted:
          sql<number>`COUNT(CASE WHEN ${schema.discussionVotes.userId} = ${userId} THEN 1 END)`.mapWith(
            Boolean
          ),
      })
      .from(schema.discussions)
      .leftJoin(schema.users, eq(schema.discussions.authorId, schema.users.id))
      .leftJoin(
        schema.categories,
        eq(schema.discussions.categoryId, schema.categories.id)
      )
      .leftJoin(
        schema.comments,
        eq(schema.comments.discussionId, schema.discussions.id)
      )
      .leftJoin(
        schema.discussionVotes,
        eq(schema.discussionVotes.discussionId, schema.discussions.id)
      )
      .where(sqlFilters)
      .groupBy(schema.discussions.id)
      .orderBy(
        desc(schema.comments.createdAt),
        desc(schema.discussions.createdAt)
      )
      .offset(offset)
      .limit(limit),
  ]);

  return {
    discussions: rawDiscussions,
    total: rawTotal[0].total,
    limit,
  };
};
export type DiscussionsDto = Awaited<ReturnType<typeof getDiscussions>>;

export const getDiscussion = async (id: number, userId = 0) => {
  const [discussion] = await db
    .select({
      id: schema.discussions.id,
      title: schema.discussions.title,
      body: schema.discussions.body,
      createdAt: schema.discussions.createdAt,
      author: {
        name: schema.users.name,
        image: schema.users.image,
      },
      category: {
        emoji: schema.categories.emoji,
        title: schema.categories.title,
        slug: schema.categories.slug,
      },
      votesCount: countDistinct(schema.discussionVotes.userId),
      commentsCount: countDistinct(schema.comments.id),
      participantsCount: sql<number>`
      (
        SELECT COUNT(DISTINCT userId) FROM (
          SELECT ${schema.discussions.authorId} AS userId
          UNION
          SELECT ${schema.comments.authorId} FROM ${schema.comments}
          WHERE ${schema.comments.discussionId} = ${schema.discussions.id}
        )
      )
    `,
      voted:
        sql<number>`COUNT(CASE WHEN ${schema.discussionVotes.userId} = ${userId} THEN 1 END)`.mapWith(
          Boolean
        ),
    })
    .from(schema.discussions)
    .leftJoin(schema.users, eq(schema.discussions.authorId, schema.users.id))
    .leftJoin(
      schema.categories,
      eq(schema.discussions.categoryId, schema.categories.id)
    )
    .leftJoin(
      schema.comments,
      eq(schema.comments.discussionId, schema.discussions.id)
    )
    .leftJoin(
      schema.discussionVotes,
      eq(schema.discussionVotes.discussionId, schema.discussions.id)
    )
    .groupBy(schema.discussions.id)
    .where(eq(schema.discussions.id, id))
    .limit(1);
  return {
    ...discussion,
    author: discussion.author!,
    category: discussion.category!,
  };
};
export type DiscussionDto = Awaited<ReturnType<typeof getDiscussion>>;

export const getDiscussionWithReply = async (id: number) => {
  const [discussions, comments] = await Promise.all([
    db
      .select({
        id: schema.discussions.id,
        title: schema.discussions.title,
        body: sql<string>`${schema.discussions.body}`.mapWith(formatLargeText),
      })
      .from(schema.discussions)
      .where(eq(schema.discussions.id, id))
      .limit(1),
    db
      .select({
        body: sql<string>`${schema.comments.body}`.mapWith(formatLargeText),
        author: {
          name: schema.users.name,
          image: schema.users.image,
        },
      })
      .from(schema.comments)
      .leftJoin(schema.users, eq(schema.comments.authorId, schema.users.id))
      .where(eq(schema.comments.discussionId, id))
      .orderBy(desc(schema.comments.createdAt))
      .limit(1),
  ]);
  const discussion = discussions.at(0);
  const reply = comments.at(0);

  if (!discussion) return null;

  return { ...discussion, reply };
};

export const voteDiscussion = async (id: number, userId: number) => {
  await db.insert(schema.discussionVotes).values({ userId, discussionId: id });
};

export const unvoteDiscussion = async (id: number, userId: number) => {
  await db
    .delete(schema.discussionVotes)
    .where(
      and(
        eq(schema.discussionVotes.discussionId, id),
        eq(schema.discussionVotes.userId, userId)
      )
    );
};

function formatLargeText(text: string) {
  return text.length > 100 ? text.slice(0, 100) + "..." : text;
}

export const getParticipants = async (discussionId: number) => {
  const participants = await db
    .selectDistinct({
      id: schema.users.id,
      name: schema.users.name,
      image: schema.users.image,
    })
    .from(schema.users)
    .innerJoin(schema.discussions, eq(schema.discussions.id, discussionId))
    .leftJoin(schema.comments, eq(schema.comments.discussionId, discussionId))
    .where(
      or(
        eq(schema.discussions.authorId, schema.users.id),
        eq(schema.comments.authorId, schema.users.id)
      )
    );
  return participants;
};
export type ParticipantsDto = Awaited<ReturnType<typeof getParticipants>>;
