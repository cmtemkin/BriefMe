import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";

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
      // TODO: Upgrade user subscription tier in database
      console.log("Checkout completed:", event.data.object.id);
      break;
    }
    case "customer.subscription.updated": {
      // TODO: Sync subscription status
      console.log("Subscription updated:", event.data.object.id);
      break;
    }
    case "customer.subscription.deleted": {
      // TODO: Downgrade user to free
      console.log("Subscription deleted:", event.data.object.id);
      break;
    }
    case "invoice.payment_failed": {
      // TODO: Set subscription status to past_due
      console.log("Payment failed:", event.data.object.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
