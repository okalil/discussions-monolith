import { redirect } from "react-router";

import { auth } from "~/web/auth";

export async function action() {
  await auth().logout();
  throw redirect("/login");
}
