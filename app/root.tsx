import { useEffect } from "react";
import { Toaster, toast } from "sonner";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetchers,
  useLoaderData,
} from "react-router";

import stylesheet from "~/root.css?url";
import { NavigationProgress } from "~/ui/shared/navigation-progress";

import type { Route } from "./+types/root";

import { auth } from "./.server/auth";
import { session } from "./.server/session";
import { limiter } from "./.server/limiter";

export const middleware = [
  limiter({ max: 100, window: 60 * 1000 }),
  session,
  auth,
];

export const meta: Route.MetaFunction = () => [{ title: "Discussions" }];

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export const loader = async ({ context }: Route.LoaderArgs) => {
  const message = await context.session.get("toast");
  return { message };
};

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Links />
        <Meta />
      </head>
      <body className="h-full">
        <Outlet />
        <GlobalToasts />
        <NavigationProgress />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function GlobalToasts() {
  const loaderData = useLoaderData<typeof loader>();
  const fetchers = useFetchers();
  const messages = fetchers
    .map((it) => it.data?.error?.message)
    .filter(Boolean);

  useEffect(() => {
    if (loaderData.message)
      toast.success(loaderData.message, { richColors: true });
  }, [loaderData.message]);
  useEffect(
    () =>
      messages.forEach((message) => toast.error(message, { richColors: true })),
    [messages]
  );
  return <Toaster />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
