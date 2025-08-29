import { AsyncLocalStorage } from "node:async_hooks";

import type { DatabaseClient } from "./services/db";
import type { EmailClient } from "./services/email/mailer";
import type { StorageClient } from "./services/storage";

const als = new AsyncLocalStorage<ContextValue>();

interface ContextValue {
  env: Env;
  db: DatabaseClient;
  storage: StorageClient;
  email: EmailClient;
}

export function provide<T>(value: ContextValue, callback: () => T) {
  return als.run(value, callback);
}

export function getContext(): ContextValue {
  const store = als.getStore();
  if (!store) throw new Error("Async context value not provided");

  return store;
}
