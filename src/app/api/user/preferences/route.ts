import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  users,
  userModules,
  deliveryPreferences,
  oauthTokens,
} from "@/lib/db/schema";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get modules
    const mods = await db
      .select({ moduleId: userModules.moduleId, enabled: userModules.enabled })
      .from(userModules)
      .where(eq(userModules.userId, user.id));

    const modulesMap: Record<string, boolean> = {};
    mods.forEach((m) => {
      modulesMap[m.moduleId] = m.enabled;
    });

    // Get delivery preferences
    const [delivery] = await db
      .select()
      .from(deliveryPreferences)
      .where(eq(deliveryPreferences.userId, user.id))
      .limit(1);

    // Get connected accounts
    const tokens = await db
      .select({ provider: oauthTokens.provider })
      .from(oauthTokens)
      .where(eq(oauthTokens.userId, user.id));

    const connectedProviders = new Set(tokens.map((t) => t.provider));
    const connectedAccounts = [
      "google_calendar",
      "outlook",
      "oura",
      "terra",
    ].map((provider) => ({
      provider,
      connected: connectedProviders.has(provider),
    }));

    return NextResponse.json({
      modules: modulesMap,
      delivery: delivery
        ? {
            emailEnabled: delivery.emailEnabled,
            pushEnabled: delivery.pushEnabled,
            wakeTime: user.wakeTime,
          }
        : { emailEnabled: false, pushEnabled: false, wakeTime: "06:30" },
      address: user.address || "",
      connectedAccounts,
    });
  } catch (error) {
    console.error("Failed to load preferences:", error);
    return NextResponse.json(
      { error: "Failed to load preferences" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { modules, delivery, address } = body;

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update modules
    if (modules && typeof modules === "object") {
      // Delete existing modules
      await db.delete(userModules).where(eq(userModules.userId, user.id));

      // Insert updated modules
      const moduleEntries = Object.entries(modules as Record<string, boolean>);
      if (moduleEntries.length > 0) {
        await db.insert(userModules).values(
          moduleEntries.map(([moduleId, enabled], index) => ({
            userId: user.id,
            moduleId,
            enabled,
            position: index,
          })),
        );
      }
    }

    // Update delivery preferences
    if (delivery) {
      await db
        .insert(deliveryPreferences)
        .values({
          userId: user.id,
          emailEnabled: delivery.emailEnabled ?? false,
          pushEnabled: delivery.pushEnabled ?? false,
        })
        .onConflictDoUpdate({
          target: deliveryPreferences.userId,
          set: {
            emailEnabled: delivery.emailEnabled ?? false,
            pushEnabled: delivery.pushEnabled ?? false,
          },
        });
    }

    // Update user fields (address, wake time)
    const userUpdates: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (typeof address === "string") {
      userUpdates.address = address;
    }
    if (delivery?.wakeTime) {
      userUpdates.wakeTime = delivery.wakeTime;
    }

    await db.update(users).set(userUpdates).where(eq(users.clerkId, clerkId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save preferences:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 },
    );
  }
}
