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
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const utm_source = typeof body?.utm_source === "string" ? body.utm_source : undefined;
    const utm_medium = typeof body?.utm_medium === "string" ? body.utm_medium : undefined;
    const utm_campaign = typeof body?.utm_campaign === "string" ? body.utm_campaign : undefined;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const stripe = getStripe();
    const origin = getOrigin(req);

    // Reuse an existing Stripe customer if we already have one for this email,
    // so repeat visitors are tied to the same customer record (and Stripe shows
    // their saved payment methods on the checkout page).
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer =
      existing.data[0] ??
      (await stripe.customers.create({
        email,
        metadata: { app: "claude-meter", source: "website" },
      }));

    const sessionMetadata: Record<string, string> = { app: "claude-meter", section, email };
    if (utm_source) sessionMetadata.utm_source = utm_source;
    if (utm_medium) sessionMetadata.utm_medium = utm_medium;
    if (utm_campaign) sessionMetadata.utm_campaign = utm_campaign;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${origin}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      allow_promotion_codes: false,
      billing_address_collection: "auto",
      metadata: sessionMetadata,
      subscription_data: {
        metadata: sessionMetadata,
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
