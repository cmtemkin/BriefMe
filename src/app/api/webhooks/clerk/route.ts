import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users, deliveryPreferences, streaks } from "@/lib/db/schema";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      id: string;
    }>;
    primary_email_address_id?: string;
    first_name?: string;
    last_name?: string;
  };
}

function getPrimaryEmail(data: ClerkWebhookEvent["data"]): string | null {
  if (!data.email_addresses || data.email_addresses.length === 0) return null;
  if (data.primary_email_address_id) {
    const primary = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id,
    );
    if (primary) return primary.email_address;
  }
  return data.email_addresses[0].email_address;
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "user.created": {
      const email = getPrimaryEmail(event.data);
      if (!email) break;

      const [newUser] = await db
        .insert(users)
        .values({
          clerkId: event.data.id,
          email,
          firstName: event.data.first_name ?? null,
        })
        .returning({ id: users.id });

      // Create default delivery preferences
      if (newUser) {
        await db.insert(deliveryPreferences).values({
          userId: newUser.id,
          webEnabled: true,
          emailEnabled: false,
          pushEnabled: false,
          emailAddress: email,
        });

        // Initialize streak tracking
        await db.insert(streaks).values({
          userId: newUser.id,
          currentStreak: 0,
          longestStreak: 0,
          totalDigestsViewed: 0,
        });
      }

      console.log("User created and synced:", event.data.id);
      break;
    }
    case "user.updated": {
      const email = getPrimaryEmail(event.data);
      if (!email) break;

      await db
        .update(users)
        .set({
          email,
          firstName: event.data.first_name ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, event.data.id));

      console.log("User updated:", event.data.id);
      break;
    }
    case "user.deleted": {
      // Cascade delete handles related records (modules, tokens, prefs, streaks)
      await db.delete(users).where(eq(users.clerkId, event.data.id));
      console.log("User deleted:", event.data.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
