import { createRequestHandler } from "react-router";

import { AccountService } from "./core/account";
import { CategoryService } from "./core/category";
import { CommentService } from "./core/comment";
import { DiscussionService } from "./core/discussion";
import { createDatabaseClient } from "./core/integrations/db";
import { createEmailClient } from "./core/integrations/email";
import { createStorageClient } from "./core/integrations/storage";
import { SessionService } from "./core/session";
import { UserService } from "./core/user";
import { provide } from "./web/bindings";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env) {
    // Infra
    const db = createDatabaseClient(env.DB);
    const storage = createStorageClient(env.R2);
    const mailer = createEmailClient(env.RESEND_API_KEY);

    // Domain
    const accountService = new AccountService(db, mailer, env);
    const categoryService = new CategoryService(db);
    const commentService = new CommentService(db);
    const discussionService = new DiscussionService(db);
    const sessionService = new SessionService(db);
    const userService = new UserService(db, storage);

    const response = await provide(
      {
        env,
        storage,
        accountService,
        categoryService,
        commentService,
        discussionService,
        sessionService,
        userService,
      },
      () => requestHandler(request)
    );
    return response;
  },
} satisfies ExportedHandler<Env>;
