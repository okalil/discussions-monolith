import { redirect } from "react-router";

import type { Route } from "../+types/root";

import { getUser } from "./data/user";

type MaybeUser = Awaited<ReturnType<typeof getUser>>;
export interface Auth {
  getUser: () => Promise<MaybeUser>;
  getUserOrFail: () => Promise<NonNullable<MaybeUser>>;
  login: (userId: number) => void;
  logout: () => void;
}

export async function auth({ request, context }: Route.MiddlewareArgs) {
  const userId = context.session.get("userId");
  const user = userId && (await getUser(userId));
  context.auth = {
    getUser() {
      return user;
    },
    getUserOrFail() {
      const url = new URL(request.url);
      const searchParams =
        url.pathname &&
        new URLSearchParams([["redirect", url.pathname + url.search]]);
      if (!user) throw redirect(`/login?${searchParams}`);
      return user;
    },
    login(userId: number) {
      context.session.set("userId", userId);
    },
    logout() {
      context.session.unset("userId");
    },
  } satisfies Auth;
}
