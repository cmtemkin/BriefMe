import { NextResponse } from "next/server";
import { gamesWidget } from "@/lib/widgets/games";

export async function GET() {
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
