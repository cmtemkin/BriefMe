import { NextResponse } from "next/server";
import { newsWidget } from "@/lib/widgets/news";
import { newsQuerySchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/redis/check-rate-limit";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const rateLimited = await checkRateLimit(`news:${ip}`);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);
  const parsed = newsQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { categories, count } = parsed.data;

  try {
    const data = await newsWidget.fetchData({ categories, count });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 },
    );
  }
}
