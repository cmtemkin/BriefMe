import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./client";

const LIMITS = {
  free: { requests: 10, window: "1 m" as const },
  pro: { requests: 30, window: "1 m" as const },
  business: { requests: 100, window: "1 m" as const },
} as const;

type Tier = keyof typeof LIMITS;

export function createRateLimiter(tier: Tier) {
  const limit = LIMITS[tier];
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit.requests, limit.window),
    analytics: true,
    prefix: `ratelimit:${tier}`,
  });
}
