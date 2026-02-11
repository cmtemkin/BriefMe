import { NextResponse } from "next/server";
import { calendarWidget } from "@/lib/widgets/calendar";

export async function GET() {
  // TODO: Extract userId from Clerk auth
  try {
    const data = await calendarWidget.fetchData({});
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 },
    );
  }
}
