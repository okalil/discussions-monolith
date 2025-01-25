import { useEffect } from "react";
import { Toaster, toast } from "sonner";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import stylesheet from "~/root.css?url";
import { NavigationProgress } from "~/web/ui/shared/navigation-progress";

import type { Route } from "./+types/root";

import { auth } from "./web/auth";
import { session } from "./web/session";
import { rateLimit } from "./web/rate-limit";

export const middleware = [
  rateLimit({ max: 100, window: 60 * 1000 }),
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

export const loader = ({ context }: Route.LoaderArgs) => {
  return {
    success: context.session.get("success"),
    error: context.session.get("error"),
  };
};

export default function App({ loaderData }: Route.ComponentProps) {
  useEffect(() => {
    const { success, error } = loaderData;
    if (success) toast.success(success);
    if (error) toast.error(error, { duration: 5000 });
  }, [loaderData]);

  return (
    <Document>
      <Outlet />
      <Toaster richColors closeButton />
    </Document>
  );
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
    <Document>
      <main className="pt-16 p-4 container mx-auto">
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
      </main>
    </Document>
  );
}

export const shouldRevalidate = () => true;

function Document(props: React.PropsWithChildren) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Links />
        <Meta />
      </head>
      <body className="h-full">
        {props.children}
        <NavigationProgress />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
