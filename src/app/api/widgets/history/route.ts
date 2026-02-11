import { NextResponse } from "next/server";
import { historyWidget } from "@/lib/widgets/history";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventCount = parseInt(searchParams.get("eventCount") || "2", 10);
  const birthdayCount = parseInt(searchParams.get("birthdayCount") || "1", 10);

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
