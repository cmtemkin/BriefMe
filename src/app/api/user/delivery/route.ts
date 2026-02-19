import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users, deliveryPreferences } from "@/lib/db/schema";
import { deliveryUpdateSchema } from "@/lib/validations";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [user] = await db
      .select({ id: users.id, wakeTime: users.wakeTime })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [delivery] = await db
      .select()
      .from(deliveryPreferences)
      .where(eq(deliveryPreferences.userId, user.id))
      .limit(1);

    return NextResponse.json({
      webEnabled: delivery?.webEnabled ?? true,
      emailEnabled: delivery?.emailEnabled ?? false,
      pushEnabled: delivery?.pushEnabled ?? false,
      wakeTime: user.wakeTime,
    });
  } catch (error) {
    console.error("Failed to fetch delivery preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery preferences" },
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
    const raw = await req.json();
    const parsed = deliveryUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.issues },
        { status: 400 },
      );
    }
    const { emailEnabled, pushEnabled, wakeTime } = parsed.data;

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db
      .insert(deliveryPreferences)
      .values({
        userId: user.id,
        emailEnabled: emailEnabled ?? false,
        pushEnabled: pushEnabled ?? false,
      })
      .onConflictDoUpdate({
        target: deliveryPreferences.userId,
        set: {
          emailEnabled: emailEnabled ?? false,
          pushEnabled: pushEnabled ?? false,
        },
      });

    if (wakeTime) {
      await db
        .update(users)
        .set({ wakeTime, updatedAt: new Date() })
        .where(eq(users.clerkId, clerkId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update delivery preferences:", error);
    return NextResponse.json(
      { error: "Failed to update delivery preferences" },
      { status: 500 },
    );
  }
}
