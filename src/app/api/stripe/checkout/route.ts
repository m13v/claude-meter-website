import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PRICE_ID = "price_1TUsbnRzrfmaooMLfVHoFZlQ";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

function getOrigin(_req: NextRequest): string {
  return process.env.APP_URL ?? "https://claude-meter.com";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const section = typeof body?.section === "string" ? body.section : "unknown";

    const stripe = getStripe();
    const origin = getOrigin(req);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${origin}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      allow_promotion_codes: false,
      billing_address_collection: "auto",
      metadata: { app: "claude-meter", section },
      subscription_data: {
        metadata: { app: "claude-meter", section },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
