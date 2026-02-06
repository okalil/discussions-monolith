import type { MiddlewareFunction } from "react-router";

import { env as cloudflareEnv } from "cloudflare:workers";
import { AsyncLocalStorage } from "node:async_hooks";

import type { StorageClient } from "../core/integrations/storage";

import { AccountService } from "../core/account";
import { CategoryService } from "../core/category";
import { CommentService } from "../core/comment";
import { DiscussionService } from "../core/discussion";
import { createDatabaseClient } from "../core/integrations/db";
import { createEmailClient } from "../core/integrations/email";
import { createStorageClient } from "../core/integrations/storage";
import { SessionService } from "../core/session";
import { UserService } from "../core/user";

interface BindingsContext {
  env: Env;
  storage: StorageClient;
  accountService: AccountService;
  categoryService: CategoryService;
  commentService: CommentService;
  discussionService: DiscussionService;
  sessionService: SessionService;
  userService: UserService;
}

const als = new AsyncLocalStorage<BindingsContext>();

export const bindingsMiddleware: MiddlewareFunction<Response> = async (
  _,
  next,
) => {
  const env = cloudflareEnv;

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

  return await als.run(
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
    next,
  );
};

function bindings() {
  const store = als.getStore();
  if (!store) throw new Error("Bindings context not provided");

  return store;
}

/*
  Shortcut accessors for request-scoped bindings

  These helpers read the current AsyncLocalStorage store established via `provide`
  and return specific services or environment objects. They will throw if called
  outside of a `provide` scope (only RSCs/loader/action run inside that scope).
*/

export function env() {
  return bindings().env;
}

export function storage() {
  return bindings().storage;
}

export function accountService() {
  return bindings().accountService;
}

export function categoryService() {
  return bindings().categoryService;
}

export function commentService() {
  return bindings().commentService;
}

export function discussionService() {
  return bindings().discussionService;
}

export function sessionService() {
  return bindings().sessionService;
}

export function userService() {
  return bindings().userService;
}
