import type { unstable_MiddlewareFunction as MiddlewareFunction } from "react-router";

import net from "node:net";

const rateLimitStorage = new Map();

interface RateLimiterOptions {
  max: number;
  window: number;
}

export function rateLimitMiddleware({
  max,
  window,
}: RateLimiterOptions): MiddlewareFunction {
  return function ({ request }) {
    const ip =
      ipHeaders
        .map((h) => request.headers.get(h))
        .find((value) => value && net.isIP(value)) || "unknown";
    const resource = new URL(request.url).pathname;
    const rateLimitId = ip + resource;

    const now = Date.now();
    const rateInfo = rateLimitStorage.get(rateLimitId) || {
      hits: 0,
      resetTime: now + window,
    };

    if (now > rateInfo.resetTime) {
      rateInfo.hits = 1;
      rateInfo.resetTime = now + window;
    } else {
      rateInfo.hits++;
    }

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
