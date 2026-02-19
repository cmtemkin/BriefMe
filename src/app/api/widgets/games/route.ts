import { NextResponse } from "next/server";
import { gamesWidget } from "@/lib/widgets/games";
import { checkRateLimit } from "@/lib/redis/check-rate-limit";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const rateLimited = await checkRateLimit(`games:${ip}`);
  if (rateLimited) return rateLimited;

  try {
    const data = await gamesWidget.fetchData({});
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 },
    );
  }
}
