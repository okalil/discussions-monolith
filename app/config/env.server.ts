import { z } from "zod/v4";

export const env = z
  .object({
    NODE_ENV: z.string(),
    DATABASE_URL: z.string(),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
    SITE_URL: z.string(),
    SESSION_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
  })
  .parse(process.env);
