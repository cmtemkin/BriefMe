import { NextResponse } from "next/server";
import { createRateLimiter } from "./rate-limit";

/**
 * Check rate limit for a request. Returns a 429 response if exceeded,
 * or null if the request is within limits.
 *
 * Falls back to allowing requests if Redis is unavailable.
 */
export async function checkRateLimit(
  identifier: string,
  tier: "free" | "pro" | "business" = "free",
): Promise<NextResponse | null> {
  try {
    const limiter = createRateLimiter(tier);
    const { success, limit, remaining, reset } =
      await limiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        },
      );
    }
  } catch {
    // Redis unavailable — allow the request through
  }

  return null;
}
