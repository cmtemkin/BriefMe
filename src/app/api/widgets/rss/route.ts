import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { rssWidget } from "@/lib/widgets/rss";
import { checkRateLimit } from "@/lib/redis/check-rate-limit";

export async function GET(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? clerkId;
  const rateLimited = await checkRateLimit(`rss:${ip}`, "pro");
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);
  const feedsParam = searchParams.get("feeds");

  let feeds: Array<{ url: string; name: string }> = [];
  if (feedsParam) {
    try {
      feeds = JSON.parse(feedsParam);
    } catch {
      return NextResponse.json(
        { error: "Invalid feeds parameter — expected JSON array" },
        { status: 400 },
      );
    }
  }

  const itemsPerFeed = parseInt(searchParams.get("itemsPerFeed") || "3", 10);

  try {
    const data = await rssWidget.fetchData({ feeds, itemsPerFeed });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch RSS feeds" },
      { status: 500 },
    );
  }
}
