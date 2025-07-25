import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: integer("id" as string).primaryKey(),
    name: text("name" as string),
    email: text("email" as string).unique(),
    emailVerified: text("email_verified" as string),
    image: text("image" as string),
    createdAt: text("created_at" as string)
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at" as string)
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [index("user_email_idx" as string).on(table.email)]
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: integer("id" as string).primaryKey(),
    userId: integer("user_id" as string).notNull(),
    type: text("type" as string).notNull(),
    provider: text("provider" as string),
    providerAccountId: text("provider_account_id" as string),
    password: text("password" as string),
  },
  () => []
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id" as string)
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: integer("user_id" as string).notNull(),
    expires: text("expires" as string).notNull(),
  },
  (table) => [index("session_user_idx" as string).on(table.userId)]
);

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier" as string).notNull(),
    token: text("token" as string).notNull(),
    expires: text("expires" as string).notNull(),
  },
  (table) => [
    uniqueIndex("identifier_token_idx" as string).on(
      table.identifier,
      table.token
    ),
  ]
);

export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey(),
    emoji: text("emoji").notNull(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
  },
  () => []
);

export const discussions = sqliteTable(
  "discussions",
  {
    id: integer("id").primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    authorId: integer("author_id").notNull(),
    categoryId: integer("category_id").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at" as string)
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    index("discussion_author_idx").on(table.authorId),
    index("discussion_category_idx").on(table.categoryId),
  ]
);

export const discussionVotes = sqliteTable(
  "discussion_votes",
  {
    userId: integer("user_id" as string).notNull(),
    discussionId: integer("discussion_id" as string).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.discussionId] }),
    index("discussion_votes_user_idx" as string).on(table.userId),
    index("discussion_votes_discussion_idx" as string).on(table.discussionId),
  ]
);

export const comments = sqliteTable(
  "comments",
  {
    id: integer("id" as string).primaryKey(),
    body: text("body" as string).notNull(),
    authorId: integer("author_id" as string).notNull(),
    discussionId: integer("discussion_id" as string).notNull(),
    createdAt: text("created_at" as string)
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at" as string)
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    index("comment_author_idx" as string).on(table.authorId),
    index("comment_discussion_idx" as string).on(table.discussionId),
  ]
);

export const commentVotes = sqliteTable(
  "comment_votes",
  {
    userId: integer("user_id" as string).notNull(),
    commentId: integer("comment_id" as string).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.commentId] }),
    index("comment_votes_user_idx" as string).on(table.userId),
    index("comment_votes_comment_idx" as string).on(table.commentId),
  ]
);
