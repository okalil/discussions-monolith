import {
  and,
  asc,
  countDistinct,
  desc,
  eq,
  getTableColumns,
  sql,
} from "drizzle-orm";

import type { DatabaseClient } from "./integrations/db";

import { schema } from "./integrations/db/schema";

export type CommentsDto = Awaited<
  ReturnType<CommentService["getComments"]>
>;

export class CommentService {
  constructor(private db: DatabaseClient) {}

  async getComments(
    discussionId: number,
    userId = 0,
    sort = "oldest"
  ) {
    const comments = await this.db
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
  }

  async createComment(
    discussionId: number,
    body: string,
    userId: number
  ) {
    const [comment] = await this.db
      .insert(schema.comments)
      .values({
        body,
        authorId: userId,
        discussionId,
      })
      .returning();
    return comment;
  }

  async updateComment(
    id: number,
    body: string,
    userId: number
  ) {
    await this.db
      .update(schema.comments)
      .set({ body })
      .where(
        and(eq(schema.comments.authorId, userId), eq(schema.comments.id, id))
      );
  }

  async deleteComment(id: number, userId: number) {
    await this.db
      .delete(schema.comments)
      .where(
        and(eq(schema.comments.authorId, userId), eq(schema.comments.id, id))
      );
  }

  async voteComment(id: number, userId: number) {
    await this.db.insert(schema.commentVotes).values({ userId, commentId: id });
  }

  async unvoteComment(id: number, userId: number) {
    await this.db
      .delete(schema.commentVotes)
      .where(
        and(
          eq(schema.commentVotes.commentId, id),
          eq(schema.commentVotes.userId, userId)
        )
      );
  }
}
