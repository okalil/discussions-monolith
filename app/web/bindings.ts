import { AsyncLocalStorage } from "node:async_hooks";

import type { AccountService } from "../core/account";
import type { CategoryService } from "../core/category";
import type { CommentService } from "../core/comment";
import type { DiscussionService } from "../core/discussion";
import type { StorageClient } from "../core/integrations/storage";
import type { SessionService } from "../core/session";
import type { UserService } from "../core/user";

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

export function provide<T>(context: BindingsContext, callback: () => T) {
  return als.run(context, callback);
}

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
