import { NextResponse } from "next/server";
import { historyWidget } from "@/lib/widgets/history";
import { historyQuerySchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/redis/check-rate-limit";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const rateLimited = await checkRateLimit(`history:${ip}`);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);
  const parsed = historyQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { eventCount, birthdayCount } = parsed.data;

  try {
    const data = await historyWidget.fetchData({ eventCount, birthdayCount });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}
