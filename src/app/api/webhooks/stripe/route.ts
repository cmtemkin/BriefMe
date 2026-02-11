import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getStripeClient } from "@/lib/stripe/client";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export async function POST(req: Request) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 },
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const plan = (session.metadata?.plan as "pro" | "business") || "pro";
      const customerId =
        typeof session.customer === "string" ? session.customer : null;

      if (customerId) {
        await db
          .update(users)
          .set({
            subscriptionTier: plan,
            subscriptionStatus: "active",
            updatedAt: new Date(),
          })
          .where(eq(users.stripeCustomerId, customerId));
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : null;

      if (customerId) {
        const status = subscription.status === "active" ? "active" : "past_due";
        await db
          .update(users)
          .set({
            subscriptionStatus: status,
            updatedAt: new Date(),
          })
          .where(eq(users.stripeCustomerId, customerId));
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : null;

      if (customerId) {
        await db
          .update(users)
          .set({
            subscriptionTier: "free",
            subscriptionStatus: "canceled",
            updatedAt: new Date(),
          })
          .where(eq(users.stripeCustomerId, customerId));
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : null;

      if (customerId) {
        await db
          .update(users)
          .set({
            subscriptionStatus: "past_due",
            updatedAt: new Date(),
          })
          .where(eq(users.stripeCustomerId, customerId));
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
