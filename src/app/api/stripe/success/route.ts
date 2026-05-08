import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { buildInstallTokenCookie } from "@/lib/install-gate-token";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

function getOrigin(_req: NextRequest): string {
  // APP_URL can be set in Cloud Run / .env.local for dev overrides.
  // Defaults to the production domain.
  return process.env.APP_URL ?? "https://claude-meter.com";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.redirect(new URL("/?error=payment", req.url));
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.status !== "complete") {
      return NextResponse.redirect(new URL("/?error=payment", req.url));
    }

    // Prefer customer_details email, fall back to customer email
    const email =
      session.customer_details?.email ??
      (typeof session.customer === "string"
        ? undefined
        : (session.customer as Stripe.Customer | null)?.email) ??
      "paid@claude-meter.com";

    const cookieHeader = buildInstallTokenCookie(email);
    const origin = getOrigin(req);

    // Set cookie then redirect to the done page (which shows install instructions)
    const response = NextResponse.redirect(new URL("/checkout/done", origin));
    response.headers.set("Set-Cookie", cookieHeader);
    return response;
  } catch (err) {
    console.error("[stripe/success]", err);
    return NextResponse.redirect(new URL("/?error=payment", req.url));
  }
}
