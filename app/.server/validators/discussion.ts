import vine from "@vinejs/vine";

export const getDiscussionsValidator = vine.compile(
  vine.object({
    page: vine.number().optional(),
    limit: vine.number().optional(),
    q: vine.string().optional(),
  })
);

export const createDiscussionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    body: vine.string().trim().minLength(1),
  })
);

export const voteDiscussionValidator = vine.compile(
  vine.object({
    voted: vine.boolean(),
  })
);
