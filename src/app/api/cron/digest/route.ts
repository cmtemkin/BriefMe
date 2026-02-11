import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // TODO: Query users whose wake_time falls in current 15-min window
    // TODO: For each user, assemble digest using assembleDigest()
    // TODO: If email enabled, render MJML and send via Postmark
    // TODO: If push enabled, send FCM notification
    // TODO: If web enabled, pre-cache dashboard data in Redis
    // TODO: Log delivery to digest_logs table

    return NextResponse.json({
      success: true,
      processedAt: new Date().toISOString(),
      usersProcessed: 0,
    });
  } catch (error) {
    console.error("Digest cron error:", error);
    return NextResponse.json(
      { error: "Digest assembly failed" },
      { status: 500 },
    );
  }
}
