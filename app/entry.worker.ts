import { createRequestHandler } from "react-router";

import { provide } from "./core/context";
import { createDatabaseClient } from "./core/services/db";
import { createEmailClient } from "./core/services/email/mailer";
import { createStorageClient } from "./core/services/storage";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env) {
    const response = await provide(
      {
        env,
        db: createDatabaseClient(env.DB),
        storage: createStorageClient(env.R2),
        email: createEmailClient(env.EMAIL),
      },
      () => requestHandler(request)
    );
    return response;
  },
} satisfies ExportedHandler<Env>;
