import net from "node:net";
import {
  unstable_createContext,
  type unstable_MiddlewareFunction as MiddlewareFunction,
} from "react-router";

const rateLimitStorage = new Map();

const rateLimitContext = unstable_createContext("");

interface RateLimiterOptions {
  max: number;
  window: number;
}

export function rateLimitMiddleware({
  max,
  window,
}: RateLimiterOptions): MiddlewareFunction {
  return function ({ request, context }) {
    const ip = getRequestIP(request) || "unknown";
    const resource = new URL(request.url).pathname;
    const rateLimitId = ip + resource;

    const now = Date.now();
    const rateInfo = rateLimitStorage.get(rateLimitId) || {
      hits: 0,
      resetTime: now + window,
    };

    const hasUpperRateLimit = !!context.get(rateLimitContext);
    if (hasUpperRateLimit) rateInfo.hits--; // Revert upper middleware hit count

    if (now > rateInfo.resetTime) {
      rateInfo.hits = 0;
      rateInfo.resetTime = now + window;
    }

    rateInfo.hits++;
    rateLimitStorage.set(rateLimitId, rateInfo);

    context.set(rateLimitContext, rateLimitId);

    if (rateInfo.hits > max) {
      throw new Response("Too Many Requests", {
        status: 429,
        headers: [
          ["Retry-After", `${Math.ceil((rateInfo.resetTime - now) / 1000)}`],
        ],
      });
    }
  };
}

function getRequestIP(request: Request) {
  return (
    ipHeaders
      .map((h) => request.headers.get(h))
      .find((value) => value && net.isIP(value)) || "unknown"
  );
}

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
