import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

// Stripe sends raw bodies for signature verification. Disable Next's body
// parsing helpers and read the request body as text.
export const dynamic = "force-dynamic";

const APP_TAG = "claude-meter";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

async function addToResendAudience(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim();
  if (!apiKey || !audienceId) return;
  try {
    const res = await fetch(
      `https://api.resend.com/audiences/${audienceId}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      // 409 (already exists) is a no-op success; everything else is logged.
      if (res.status !== 409) {
        console.warn("[stripe-webhook] resend audience add failed", res.status, body);
      }
    }
  } catch (err) {
    console.warn("[stripe-webhook] resend audience exception", err);
  }
}

function appTagMatches(metadata: Stripe.Metadata | null | undefined): boolean {
  // Defensive: this endpoint only handles claude-meter events. Other apps on
  // the same Stripe account (e.g. mk0r/appmaker) have their own endpoints.
  return metadata?.app === APP_TAG;
}

export async function POST(req: NextRequest): Promise<Response> {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!sig || !secret) {
    return new NextResponse("Missing signature or webhook secret", { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[stripe-webhook] signature verify failed", err);
    return new NextResponse("Bad signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (!appTagMatches(session.metadata)) break;
        const email =
          session.customer_details?.email ??
          (typeof session.customer === "string"
            ? null
            : (session.customer as Stripe.Customer | null)?.email) ??
          null;
        console.log(
          "[stripe-webhook] checkout.session.completed",
          JSON.stringify({
            session_id: session.id,
            email,
            customer: typeof session.customer === "string" ? session.customer : session.customer?.id,
            subscription: typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
            section: session.metadata?.section ?? null,
          }),
        );
        if (email) await addToResendAudience(email);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        if (!appTagMatches(sub.metadata)) break;
        console.log(
          "[stripe-webhook] subscription event",
          JSON.stringify({
            type: event.type,
            subscription_id: sub.id,
            status: sub.status,
            customer: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          }),
        );
        break;
      }
      default:
        // Ignore other event types; we only care about checkout + subscription state for analytics.
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] handler error", err);
    // Still return 200 so Stripe does not retry indefinitely on a logging failure.
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
