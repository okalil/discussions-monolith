import type { ShouldRevalidateFunctionArgs } from "react-router";

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { authMiddleware } from "~/web/auth";
import { rateLimitMiddleware } from "~/web/rate-limit";
import { sessionContext, sessionMiddleware } from "~/web/session";
import { NavigationProgress } from "~/web/shared/navigation-progress";
import { Toaster } from "~/web/shared/toaster";

import type { Route } from "./+types/root";

import stylesheet from "./root.css?url";

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
  rateLimitMiddleware,
  sessionMiddleware,
  authMiddleware,
];

export const meta: Route.MetaFunction = () => [{ title: "Discussions" }];

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);
  return { success: session.get("success"), error: session.get("error") };
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <Document>
      <Outlet />
      <Toaster session={loaderData} />
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
// so it only needs to revalidate when it's a non-GET form submission
export function shouldRevalidate(args: ShouldRevalidateFunctionArgs) {
  return args.formMethod && args.formMethod !== "GET";
}

function Document(props: React.PropsWithChildren) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        />
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
