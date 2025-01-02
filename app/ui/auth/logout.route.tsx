import { redirect } from "react-router";

import { auth } from "~/.server/auth";

export const action = async () => {
  const cookie = await auth.logout();
  throw redirect("/login", { headers: [["set-cookie", cookie]] });
};
