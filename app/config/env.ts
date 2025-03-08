import vine from "@vinejs/vine";

export const env = await vine.validate({
  data: process.env,
  schema: vine.object({
    NODE_ENV: vine.string(),
    DATABASE_URL: vine.string(),
    SMTP_HOST: vine.string(),
    SMTP_PORT: vine.number(),
    SMTP_USER: vine.string(),
    SMTP_PASS: vine.string(),
    SITE_URL: vine.string(),
    SESSION_SECRET: vine.string(),
    GITHUB_CLIENT_ID: vine.string(),
    GITHUB_CLIENT_SECRET: vine.string(),
  }),
});
