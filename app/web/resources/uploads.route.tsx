import { getContext } from "~/core/context";

import type { Route } from "./+types/uploads.route";

export async function loader({ params }: Route.LoaderArgs) {
  const { storage } = getContext();

  const key = params["*"];
  const file = await storage.get(key);

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
