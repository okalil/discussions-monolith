import net from "node:net";

import type { Route } from "../+types/root";

interface RateLimitInfo {
  tokens: number;
  lastRefillTime: number;
}
const rateLimitStorage = new Map<string, RateLimitInfo>();

/**
 * Rate Limit Middleware is meant to control the number of requests a user can make
 * to a server or API within a specified time period.
 *
 * For simplicity, a Map object is being used to store the request IP with the corresponding
 * rate info, but we could switch to something like Redis for better scalability.
 */
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

/**
 * Looks up the value from Fly-Client-IP header (fly.io hosting),
 * should be adapted for other hosting services or servers
 */
function getRequestIP(request: Request) {
  const flyClientIP = request.headers.get("Fly-Client-IP");
  if (flyClientIP && net.isIP(flyClientIP)) return flyClientIP;
  return null;
}
