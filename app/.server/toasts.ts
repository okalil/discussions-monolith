import { createCookieSessionStorage } from "react-router";

import { env } from "./env";

const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__toast",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    secrets: [env.SESSION_SECRET],
    sameSite: "lax",
    path: "/",
  },
});

class ToastStorage {
  async put(message: string) {
    const session = await toastSessionStorage.getSession();
    session.flash("message", message);
    const cookie = await toastSessionStorage.commitSession(session);
    return cookie;
  }
  async pop(request: Request) {
    const session = await toastSessionStorage.getSession(
      request.headers.get("cookie")
    );
    const message = session.get("message");
    const cookie = await toastSessionStorage.commitSession(session);
    return { message, cookie };
  }
}

export const toasts = new ToastStorage();
