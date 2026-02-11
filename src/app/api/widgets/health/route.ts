import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { healthWidget } from "@/lib/widgets/health";

export async function GET() {
  const { userId: clerkId } = await auth();

  let userId: string | undefined;
  if (clerkId) {
    try {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);
      userId = user?.id;
    } catch {
      // DB not available — continue without userId
    }
  }

  try {
    const data = await healthWidget.fetchData({
      userId,
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch health data" },
      { status: 500 },
    );
  }
}
