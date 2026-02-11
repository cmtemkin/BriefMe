import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  users,
  userModules,
  deliveryPreferences,
  digestLogs,
} from "@/lib/db/schema";
import { assembleDigest } from "@/lib/cron/digest-assembler";
import { isInCurrentWindow } from "@/lib/cron/scheduler";
import { sendEmail } from "@/lib/email/send";
import { renderDigestHtml, renderDigestText } from "@/lib/email/render";
import { generateSubjectLine } from "@/lib/email/subjects";
import { sendPushNotification } from "@/lib/notifications/fcm";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003";

  try {
    // Query all onboarded users
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        timezone: users.timezone,
        wakeTime: users.wakeTime,
      })
      .from(users)
      .where(eq(users.onboardingCompleted, true));

    // Filter to users whose wake time falls in current 15-min window
    const eligibleUsers = allUsers.filter((u) =>
      isInCurrentWindow(u.wakeTime, u.timezone),
    );

    let processed = 0;

    for (const user of eligibleUsers) {
      // Get user's enabled modules
      const modules = await db
        .select({
          moduleId: userModules.moduleId,
          config: userModules.config,
        })
        .from(userModules)
        .where(eq(userModules.userId, user.id));

      const enabledModuleIds = modules.map((m) => m.moduleId);
      const moduleConfigs: Record<string, Record<string, unknown>> = {};
      for (const m of modules) {
        moduleConfigs[m.moduleId] = (m.config as Record<string, unknown>) || {};
      }

      // Get delivery preferences
      const [prefs] = await db
        .select()
        .from(deliveryPreferences)
        .where(eq(deliveryPreferences.userId, user.id))
        .limit(1);

      if (!prefs) continue;

      // Assemble the digest
      const digest = await assembleDigest(
        user.id,
        enabledModuleIds,
        moduleConfigs,
      );

      const firstName = user.firstName || "there";
      const channelsDelivered: string[] = [];

      // Send email if enabled
      if (prefs.emailEnabled && prefs.emailAddress) {
        const weatherWidget = digest.widgets.find(
          (w) => w.widgetId === "weather",
        );
        const calWidget = digest.widgets.find((w) => w.widgetId === "calendar");
        const healthWidget = digest.widgets.find(
          (w) => w.widgetId === "health",
        );

        const subject = generateSubjectLine({
          firstName,
          temperature: weatherWidget?.data?.temperature as number | undefined,
          condition: weatherWidget?.data?.condition as string | undefined,
          eventCount: calWidget?.data?.eventCount as number | undefined,
          sleepScore: healthWidget?.data?.sleepScore as number | undefined,
        });

        const htmlBody = renderDigestHtml({
          firstName,
          widgets: digest.widgets,
          appUrl,
        });

        const textBody = renderDigestText({
          firstName,
          widgets: digest.widgets,
          appUrl,
        });

        await sendEmail({
          to: prefs.emailAddress,
          subject,
          htmlBody,
          textBody,
        });
        channelsDelivered.push("email");
      }

      // Send push if enabled
      if (prefs.pushEnabled && prefs.fcmToken) {
        const weatherWidget = digest.widgets.find(
          (w) => w.widgetId === "weather",
        );
        const temp = weatherWidget?.data?.temperature;
        const body = temp
          ? `${temp}°F and ${enabledModuleIds.length} modules ready`
          : `${enabledModuleIds.length} modules ready for your morning`;

        await sendPushNotification(prefs.fcmToken, {
          title: `Good morning, ${firstName}!`,
          body,
          url: "/dashboard",
        });
        channelsDelivered.push("push");
      }

      // Log delivery for each channel
      for (const channel of channelsDelivered) {
        await db.insert(digestLogs).values({
          userId: user.id,
          channel: channel as "web" | "email" | "push",
          modulesIncluded: enabledModuleIds,
          subjectLine:
            channel === "email" ? `Morning digest for ${firstName}` : null,
        });
      }

      processed++;
    }

    return NextResponse.json({
      success: true,
      processedAt: new Date().toISOString(),
      usersProcessed: processed,
      totalEligible: eligibleUsers.length,
    });
  } catch (error) {
    console.error("Digest cron error:", error);
    return NextResponse.json(
      { error: "Digest assembly failed" },
      { status: 500 },
    );
  }
}
