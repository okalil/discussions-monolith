import net from "node:net";

import type { Route } from "../+types/root";

const rateLimitStorage = new Map();

export const rateLimitMiddleware: Route.unstable_MiddlewareFunction = ({
  request,
}) => {
  const isStrongRoute = strongRoutes.some(
    (pathname) => new URL(request.url).pathname === pathname
  );
  const { max, window } = isStrongRoute
    ? strongRateLimitConfig
    : defaultRateLimitConfig;

  const ip = getRequestIP(request) || "unknown";
  const resource = new URL(request.url).pathname;
  const rateLimitId = ip + resource;

  const now = Date.now();
  const rateInfo = rateLimitStorage.get(rateLimitId) || {
    hits: 0,
    resetTime: now + window,
  };

  if (now > rateInfo.resetTime) {
    rateInfo.hits = 0;
    rateInfo.resetTime = now + window;
  }

  rateInfo.hits++;
  rateLimitStorage.set(rateLimitId, rateInfo);
  if (rateInfo.hits > max) {
    throw new Response("Too Many Requests", {
      status: 429,
      headers: [
        ["Retry-After", `${Math.ceil((rateInfo.resetTime - now) / 1000)}`],
      ],
    });
  }
};

const strongRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const defaultRateLimitConfig = { max: 100, window: 60_000 };
const strongRateLimitConfig = { max: 10, window: 10_000 };

const getRequestIP = (request: Request) =>
  ipHeaders
    .map((h) => request.headers.get(h))
    .find((value) => value && net.isIP(value));

const ipHeaders = [
  "X-Client-IP",
  "X-Forwarded-For",
  "HTTP-X-Forwarded-For",
  "Fly-Client-IP",
  "CF-Connecting-IP",
  "Fastly-Client-Ip",
  "True-Client-Ip",
  "X-Real-IP",
  "X-Cluster-Client-IP",
  "X-Forwarded",
  "Forwarded-For",
  "Forwarded",
  "DO-Connecting-IP",
  "oxygen-buyer-ip",
];
