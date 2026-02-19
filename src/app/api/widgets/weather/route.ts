import { NextResponse } from "next/server";
import { weatherWidget } from "@/lib/widgets/weather";
import { weatherQuerySchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/redis/check-rate-limit";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const rateLimited = await checkRateLimit(`weather:${ip}`);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);
  const parsed = weatherQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { lat, lon, units, locationName } = parsed.data;

  try {
    const data = await weatherWidget.fetchData({
      lat,
      lon,
      units,
      locationName,
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 },
    );
  }
}
