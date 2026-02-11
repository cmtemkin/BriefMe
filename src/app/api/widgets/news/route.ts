import { NextResponse } from "next/server";
import { newsWidget } from "@/lib/widgets/news";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categories = searchParams.get("categories")?.split(",") || [
    "world",
    "technology",
    "business",
  ];
  const count = parseInt(searchParams.get("count") || "5", 10);

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
