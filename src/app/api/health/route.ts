import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, "ok" | "unavailable"> = {
    app: "ok",
  };

  // Check database
  try {
    const { sql } = await import("drizzle-orm");
    const { db } = await import("@/lib/db/client");
    const result = await db.execute(sql`SELECT 1`);
    checks.database = result ? "ok" : "unavailable";
  } catch {
    checks.database = "unavailable";
  }

  // Check Redis
  try {
    const { redis } = await import("@/lib/redis/client");
    await redis.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "unavailable";
  }

  const allHealthy = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.1.0",
    },
    { status: allHealthy ? 200 : 503 },
  );
}
