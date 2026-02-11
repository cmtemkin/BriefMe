import { NextResponse } from "next/server";
import { weatherWidget } from "@/lib/widgets/weather";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") || "42.2918";
  const lon = searchParams.get("lon") || "-71.2328";
  const units = searchParams.get("units") || "fahrenheit";
  const locationName = searchParams.get("locationName") || "Your Location";

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
