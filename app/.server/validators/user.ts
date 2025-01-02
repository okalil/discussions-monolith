import vine from "@vinejs/vine";

import { env } from "../env";

export const signUpValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    email: vine.string().email(),
    password: vine.string().minLength(6).confirmed(),
  })
);

export const signInValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8),
    redirect: vine
      .string()
      .optional()
      .transform((value) => {
        try {
          const url = new URL(value, env.SITE_URL);
          return url.pathname + url.search;
        } catch {
          return;
        }
      }),
  })
);

export const forgetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
  })
);

export const resetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8).confirmed(),
    token: vine.string(),
  })
);

export const updateUserValidator = vine.compile(
  vine.object({
    name: vine.string(),
    image: vine.any().use(
      vine.createRule((value, _, field) => {
        if (!(value instanceof File)) {
          field.report("The {{ field }} must be a file", "file", field);
          return;
        }

        // handle empty file
        if (!value.name) {
          field.mutate(void 0, field);
          return;
        }

        // limits to 5 MB
        if (value.size > 5 * 1024 * 1024) {
          field.report(
            "The {{ field }} is greater than max size",
            "file",
            field
          );
        }
      })()
    ),
  })
);
