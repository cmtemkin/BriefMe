import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users, deliveryPreferences } from "@/lib/db/schema";
import { pushTokenSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await req.json();
    const parsed = pushTokenSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.issues },
        { status: 400 },
      );
    }
    const { token } = parsed.data;

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
        fcmToken: token,
        pushEnabled: true,
      })
      .onConflictDoUpdate({
        target: deliveryPreferences.userId,
        set: {
          fcmToken: token,
          pushEnabled: true,
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save push token:", error);
    return NextResponse.json(
      { error: "Failed to save push token" },
      { status: 500 },
    );
  }
}
