import "dotenv/config";

import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { faker } from "@faker-js/faker";
import { hash } from "bcrypt";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

// Using fixed seed number for deterministic fake data
faker.seed(15);

// Constants
const NUM_USERS = 100;
const NUM_DISCUSSIONS = 800;
const MAX_COMMENTS_PER_DISCUSSION = 10;

// Init db
const db = drizzle(process.env.DATABASE_URL!, { schema });

// Utils
function randomPastDate(startDaysAgo = 180, endDaysAgo = 1): Date {
  const daysAgo = faker.number.int({ min: endDaysAgo, max: startDaysAgo });
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function randomDateBetween(from: Date, to: Date): Date {
  return faker.date.between({ from, to });
}

async function chunkedInsert<T>(
  table: SQLiteTable,
  values: T[],
  chunkSize = 100
) {
  for (let i = 0; i < values.length; i += chunkSize) {
    const chunk = values.slice(i, i + chunkSize);
    await db.insert(table).values(chunk);
  }
}

async function main() {
  // Clean database tables (respecting order of relationships)
  await db.delete(schema.commentVotes);
  await db.delete(schema.discussionVotes);
  await db.delete(schema.comments);
  await db.delete(schema.discussions);
  await db.delete(schema.categories);
  await db.delete(schema.accounts);
  await db.delete(schema.users);

  // 1. Categories
  const categories = [
    {
      emoji: "💬",
      title: "General",
      description: "General topics and discussions about anything",
      slug: "general",
    },
    {
      emoji: "💡",
      title: "Ideas & Suggestions",
      description:
        "Share your ideas and suggestions for improving our platform",
      slug: "ideas-and-suggestions",
    },
    {
      emoji: "🐛",
      title: "Bug Reports",
      description: "Report issues and bugs you've encountered",
      slug: "bug-reports",
    },
    {
      emoji: "🎉",
      title: "Announcements",
      description: "Important updates and announcements from the team",
      slug: "announcements",
    },
  ];
  await db.insert(schema.categories).values(categories);
  const categoryRecords = await db.select().from(schema.categories);

  // 2. Users
  const users = Array.from({ length: NUM_USERS }).map(() => {
    const createdAt = randomPastDate();
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      image: `https://picsum.photos/seed/${faker.string.uuid()}/200`,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };
  });
  await chunkedInsert(schema.users, users);
  const userRecords = await db
    .select({ id: schema.users.id, createdAt: schema.users.createdAt })
    .from(schema.users);

  const passwordHash = await hash("password", 10);
  const accounts = userRecords.map((user) => ({
    userId: user.id,
    type: "credential",
    provider: null,
    providerAccountId: null,
    password: passwordHash,
  }));
  await chunkedInsert(schema.accounts, accounts);

  // 3. Discussions
  const discussions = Array.from({ length: NUM_DISCUSSIONS }).map(() => {
    const user = faker.helpers.arrayElement(userRecords);
    const category = faker.helpers.arrayElement(categoryRecords);
    const createdAt = randomDateBetween(new Date(user.createdAt), new Date());

    return {
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraphs({ min: 2, max: 5 }),
      authorId: user.id,
      categoryId: category.id,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };
  });
  await chunkedInsert(schema.discussions, discussions);
  const discussionRecords = await db
    .select({
      id: schema.discussions.id,
      createdAt: schema.discussions.createdAt,
    })
    .from(schema.discussions);

  // 4. Comments
  const comments = discussionRecords.flatMap((discussion) => {
    const count = faker.number.int({
      min: 0,
      max: MAX_COMMENTS_PER_DISCUSSION,
    });
    return Array.from({ length: count }).map(() => {
      const user = faker.helpers.arrayElement(userRecords);
      const createdAt = randomDateBetween(
        new Date(discussion.createdAt),
        new Date()
      );

      return {
        body: faker.lorem.sentences({ min: 1, max: 3 }),
        authorId: user.id,
        discussionId: discussion.id,
        createdAt: createdAt.toISOString(),
        updatedAt: createdAt.toISOString(),
      };
    });
  });
  await chunkedInsert(schema.comments, comments);
  const commentRecords = await db
    .select({
      id: schema.comments.id,
    })
    .from(schema.comments);

  // 5. Discussion Votes
  const discussionVotes = discussionRecords.flatMap((discussion) => {
    const voters = faker.helpers.arrayElements(userRecords, {
      min: 0,
      max: 20,
    });
    return voters.map((user) => ({
      userId: user.id,
      discussionId: discussion.id,
    }));
  });
  await chunkedInsert(schema.discussionVotes, discussionVotes);

  // 6. Comment Votes
  const commentVotes = commentRecords.flatMap((comment) => {
    const voters = faker.helpers.arrayElements(userRecords, {
      min: 0,
      max: 10,
    });
    return voters.map((user) => ({
      userId: user.id,
      commentId: comment.id,
    }));
  });
  await chunkedInsert(schema.commentVotes, commentVotes);

  console.log("✅ Seeding complete!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
});
