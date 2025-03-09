import net from "node:net";

import type { Route } from "../+types/root";

const rateLimitStorage = new Map();

export const rateLimitMiddleware: Route.unstable_MiddlewareFunction = ({
  request,
}) => {
  const isAction = !["GET", "HEAD"].includes(request.method);
  const isStrongRoute = strongRoutes.some(
    (pathname) => new URL(request.url).pathname === pathname
  );
  const shouldStrongRateLimit = isStrongRoute && isAction;

  const { maxTokens, refillRate, window } = shouldStrongRateLimit
    ? strongRateLimitConfig
    : defaultRateLimitConfig;

  const ip = getRequestIP(request) || "unknown";

  const now = Date.now();
  const rateInfo = rateLimitStorage.get(ip) || {
    tokens: maxTokens,
    lastRefillTime: now,
  };

  const elapsed = now - rateInfo.lastRefillTime;
  const tokensToAdd = Math.floor((elapsed * refillRate) / 1000);
  rateInfo.tokens = Math.min(rateInfo.tokens + tokensToAdd, maxTokens);
  rateInfo.lastRefillTime = now;

  const hasAvailableTokens = rateInfo.tokens > 0;
  if (!hasAvailableTokens) {
    const retryAfter = Math.ceil(
      (rateInfo.lastRefillTime + window - now) / 1000
    );
    throw new Response("Too Many Requests", {
      status: 429,
      headers: [["Retry-After", String(retryAfter)]],
    });
  }

  rateInfo.tokens--;
  rateLimitStorage.set(ip, rateInfo);
};

const strongRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const defaultRateLimitConfig = {
  maxTokens: 100,
  refillRate: 1,
  window: 60_000,
};

const strongRateLimitConfig = {
  maxTokens: 10,
  refillRate: 3,
  window: 60_000,
};

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
