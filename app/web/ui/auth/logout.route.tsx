import { redirect } from "react-router";

import { auth } from "~/web/auth";

export const action = async () => {
  await auth().logout();
  throw redirect("/login");
};
