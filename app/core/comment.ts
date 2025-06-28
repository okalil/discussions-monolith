import {
  and,
  asc,
  countDistinct,
  desc,
  eq,
  getTableColumns,
  sql,
} from "drizzle-orm";

import { db, schema } from "./services/db";

export const getComments = async (
  discussionId: number,
  userId = 0,
  sort = "oldest"
) => {
  const comments = await db
    .select({
      ...getTableColumns(schema.comments),
      author: {
        name: schema.users.name,
        image: schema.users.image,
      },
      votesCount: countDistinct(schema.commentVotes.userId),
      voted:
        sql`COUNT(CASE WHEN ${schema.commentVotes.userId} = ${userId} THEN 1 END)`.mapWith(
          Boolean
        ),
      isCommentAuthor: sql`${schema.comments.authorId} = ${userId}`.mapWith(
        Boolean
      ),
      isDiscussionAuthor:
        sql`${schema.comments.authorId} = ${schema.discussions.authorId}`.mapWith(
          Boolean
        ),
    })
    .from(schema.comments)
    .leftJoin(schema.users, eq(schema.comments.authorId, schema.users.id))
    .leftJoin(schema.discussions, eq(schema.discussions.id, discussionId))
    .leftJoin(
      schema.commentVotes,
      eq(schema.commentVotes.commentId, schema.comments.id)
    )
    .where(eq(schema.comments.discussionId, discussionId))
    .groupBy(schema.comments.id)
    .orderBy(
      sort === "oldest"
        ? asc(schema.comments.createdAt)
        : sort === "newest"
        ? desc(schema.comments.createdAt)
        : desc(sql`COUNT(${schema.commentVotes.userId})`)
    );
  return comments;
};
export type CommentsDto = Awaited<ReturnType<typeof getComments>>;

export const createComment = async (
  discussionId: number,
  body: string,
  userId: number
) => {
  const [comment] = await db
    .insert(schema.comments)
    .values({
      body,
      authorId: userId,
      discussionId,
    })
    .returning();
  return comment;
};

export const updateComment = async (
  id: number,
  body: string,
  userId: number
) => {
  await db
    .update(schema.comments)
    .set({ body })
    .where(
      and(eq(schema.comments.authorId, userId), eq(schema.comments.id, id))
    );
};

export const deleteComment = async (id: number, userId: number) => {
  await db
    .delete(schema.comments)
    .where(
      and(eq(schema.comments.authorId, userId), eq(schema.comments.id, id))
    );
};

export const voteComment = async (id: number, userId: number) => {
  await db.insert(schema.commentVotes).values({ userId, commentId: id });
};

export const unvoteComment = async (id: number, userId: number) => {
  await db
    .delete(schema.commentVotes)
    .where(
      and(
        eq(schema.commentVotes.commentId, id),
        eq(schema.commentVotes.userId, userId)
      )
    );
};
