import type { Route } from "./+types/uploads.route";

import { storage } from "../bindings";

export async function loader({ params }: Route.LoaderArgs) {
  const key = params["*"];
  const file = await storage().get(key);

  if (!file) {
    throw new Response("File not found", { status: 404 });
  }

  return new Response(file.stream(), {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename=${file.name}`,
    },
  });
}
