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
    id: integer("id").primaryKey(),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: text("email_verified"),
    image: text("image"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("user_email_idx").on(table.email)]
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: integer("id").primaryKey(),
    userId: integer("user_id").notNull(),
    type: text("type").notNull(),
    provider: text("provider"),
    providerAccountId: text("provider_account_id"),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
    refreshTokenExpiresIn: integer("refresh_token_expires_in"),
    password: text("password"),
  },
  () => []
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: integer("id").primaryKey(),
    sessionToken: text("session_token").notNull().unique(),
    userId: integer("user_id").notNull(),
    expires: text("expires").notNull(),
  },
  (table) => [index("session_user_idx").on(table.userId)]
);

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: text("expires").notNull(),
  },
  (table) => [
    uniqueIndex("identifier_token_idx").on(table.identifier, table.token),
  ]
);

export const discussions = sqliteTable(
  "discussions",
  {
    id: integer("id").primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    authorId: integer("author_id").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("discussion_author_idx").on(table.authorId)]
);

export const discussionVotes = sqliteTable(
  "discussion_votes",
  {
    userId: integer("user_id").notNull(),
    discussionId: integer("discussion_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.discussionId] }),
    index("discussion_votes_user_idx").on(table.userId),
    index("discussion_votes_discussion_idx").on(table.discussionId),
  ]
);

export const comments = sqliteTable(
  "comments",
  {
    id: integer("id").primaryKey(),
    body: text("body").notNull(),
    authorId: integer("author_id").notNull(),
    discussionId: integer("discussion_id").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("comment_author_idx").on(table.authorId),
    index("comment_discussion_idx").on(table.discussionId),
  ]
);

export const commentVotes = sqliteTable(
  "comment_votes",
  {
    userId: integer("user_id").notNull(),
    commentId: integer("comment_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.commentId] }),
    index("comment_votes_user_idx").on(table.userId),
    index("comment_votes_comment_idx").on(table.commentId),
  ]
);
