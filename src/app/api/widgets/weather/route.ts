import { NextResponse } from "next/server";
import { weatherWidget } from "@/lib/widgets/weather";
import { weatherQuerySchema } from "@/lib/validations";

export async function GET(req: Request) {
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
