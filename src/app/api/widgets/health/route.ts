import { NextResponse } from "next/server";
import { healthWidget } from "@/lib/widgets/health";

export async function GET() {
  // TODO: Extract userId from Clerk auth
  try {
    const data = await healthWidget.fetchData({});
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch health data" },
      { status: 500 },
    );
  }
}
