import type { DatabaseClient } from "./integrations/db";

import { schema } from "./integrations/db/schema";

export class CategoryService {
  constructor(private db: DatabaseClient) {}

  async getCategories() {
    const categories = await this.db.select().from(schema.categories);

    if (!categories.length) {
      return await this.db
        .insert(schema.categories)
        .values([
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
        ])
        .returning();
    }

    return categories;
  }
}
