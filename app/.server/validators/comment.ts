import vine from "@vinejs/vine";

export const createCommentValidator = vine.compile(
  vine.object({
    body: vine.string().trim().minLength(1),
    discussionId: vine.number(),
  })
);

export const updateCommentValidator = vine.compile(
  vine.object({ body: vine.string().trim().minLength(1) })
);

export const voteCommentValidator = vine.compile(
  vine.object({
    voted: vine.boolean(),
  })
);
