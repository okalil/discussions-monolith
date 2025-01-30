import net from "node:net";

import type { Route } from "../+types/root";

const rateLimitStorage = new Map();

interface RateLimiterOptions {
  max: number;
  window: number;
}

export function rateLimit({ max, window }: RateLimiterOptions) {
  return function rateLimiter({ request }: Route.MiddlewareArgs) {
    const ip =
      ipHeaders
        .map((h) => request.headers.get(h))
        .find((value) => value && net.isIP(value)) || "unknown";
    const now = Date.now();

    const rateInfo = rateLimitStorage.get(ip) || {
      count: 0,
      resetTime: now + window,
    };

    if (now > rateInfo.resetTime) {
      rateInfo.count = 1;
      rateInfo.resetTime = now + window;
    } else {
      rateInfo.count += 1;
    }

    rateLimitStorage.set(ip, rateInfo);

    if (rateInfo.count > max) {
      throw new Response("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": `${Math.ceil((rateInfo.resetTime - now) / 1000)}`,
          "Content-Type": "text/plain",
        },
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
