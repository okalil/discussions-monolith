import type { MiddlewareFunction } from "react-router";

import { paraglideMiddleware } from "../paraglide/server";

export const localeMiddleware: MiddlewareFunction<Response> = async (
  { request },
  next
) => {
  return await paraglideMiddleware(request.clone() as Request, next, {
    onRedirect: (response) => {
      throw response;
    },
  });
};
