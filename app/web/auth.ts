import { redirect } from "react-router";

import { getUser } from "~/core/data/user";

import type { Route } from "../+types/root";

type MaybeUser = Awaited<ReturnType<typeof getUser>>;
export interface Auth {
  getUser: () => MaybeUser;
  getUserOrFail: () => NonNullable<MaybeUser>;
  login: (userId: number) => void;
  logout: () => void;
}

export async function auth({ request, context }: Route.MiddlewareArgs) {
  const userId = context.session.get("userId");
  const user = userId ? await getUser(userId) : null;
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
