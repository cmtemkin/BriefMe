import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users, userModules, deliveryPreferences } from "@/lib/db/schema";

interface OnboardingPayload {
  modules: string[];
  address?: string;
  newsCategories?: string[];
  wakeTime?: string;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: OnboardingPayload = await req.json();

  try {
    // Look up internal user
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user profile (address, wake time)
    await db
      .update(users)
      .set({
        address: body.address ?? undefined,
        wakeTime: body.wakeTime ?? undefined,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Save selected modules with positions
    if (body.modules.length > 0) {
      // Delete existing modules and re-insert
      await db.delete(userModules).where(eq(userModules.userId, user.id));

      await db.insert(userModules).values(
        body.modules.map((moduleId, index) => ({
          userId: user.id,
          moduleId,
          enabled: true,
          position: index,
          config:
            moduleId === "news" && body.newsCategories
              ? { categories: body.newsCategories }
              : {},
        })),
      );
    }

    // Update delivery preferences
    await db
      .update(deliveryPreferences)
      .set({
        emailEnabled: body.emailEnabled ?? false,
        pushEnabled: body.pushEnabled ?? false,
        deliveryTimes: body.wakeTime
          ? [{ time: body.wakeTime, timezone: "America/New_York" }]
          : undefined,
      })
      .where(eq(deliveryPreferences.userId, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding save error:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 },
    );
  }
}
