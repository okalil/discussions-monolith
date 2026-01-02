import type { ShouldRevalidateFunctionArgs } from "react-router";

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";

import { getLocale } from "./paraglide/runtime";
import stylesheet from "./root.css?url";
import { authMiddleware } from "./web/auth";
import { localeMiddleware } from "./web/locale";
import { session, sessionMiddleware } from "./web/session";
import { NavigationProgress } from "./web/shared/navigation-progress";
import { Toaster } from "./web/shared/toaster";

import "@fontsource-variable/inter";

export const middleware: Route.MiddlewareFunction[] = [
  localeMiddleware,
  sessionMiddleware,
  authMiddleware,
];

export const meta: Route.MetaFunction = () => [{ title: "Discussions" }];

export async function loader() {
  return {
    toasts: {
      success: session().get("success"),
      error: session().get("error"),
    },
  };
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <Document>
      <Outlet />
      <Toaster sessionToasts={loaderData.toasts} />
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

// the root loader is only being used to fetch toasts added in server actions
// so it only needs to revalidate for non-GET form submissions
export function shouldRevalidate(args: ShouldRevalidateFunctionArgs) {
  return Boolean(args.formMethod && args.formMethod !== "GET");
}

function Document(props: React.PropsWithChildren) {
  return (
    <html lang={getLocale()} className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href={stylesheet} />
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
