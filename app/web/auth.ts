import type { unstable_MiddlewareFunction as MiddlewareFunction } from "react-router";

import { redirect, unstable_createContext } from "react-router";

import { getUser } from "~/core/data/user";

import { sessionContext } from "./session";

type MaybeUser = Awaited<ReturnType<typeof getUser>>;
interface Auth {
  getUser: () => MaybeUser;
  getUserOrFail: () => NonNullable<MaybeUser>;
  login: (userId: number) => void;
  logout: () => void;
}

export const authContext = unstable_createContext<Auth>();

export const authMiddleware: MiddlewareFunction = async ({
  request,
  context,
}) => {
  const session = context.get(sessionContext);
  const userId = session.get("userId");
  const user = userId ? await getUser(userId) : null;
  context.set(authContext, {
    getUser() {
      return user;
    },
    getUserOrFail() {
      if (!user) {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams([
          ["to", url.href.replace(url.origin, "")],
        ]);
        throw redirect(`/login?${searchParams}`);
      }
      return user;
    },
    login(userId: number) {
      session.set("userId", userId);
    },
    logout() {
      session.unset("userId");
    },
  });
};
