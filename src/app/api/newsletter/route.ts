import { createNewsletterHandler } from "@m13v/seo-components/server";
import type { NextRequest } from "next/server";
import { getSql } from "@/lib/db";
import { buildInstallTokenCookie } from "@/lib/install-gate-token";

const FROM = "ClaudeMeter <hello@claude-meter.com>";

const handler = createNewsletterHandler({
  audienceId: process.env.RESEND_AUDIENCE_ID || "",
  fromEmail: FROM,
  brand: "ClaudeMeter",
  siteUrl: "https://claude-meter.com",
  welcomeSubject: "Welcome to ClaudeMeter",
  onSignup: async (email, resendEmailId) => {
    const sql = getSql();
    await sql`
      INSERT INTO claude_meter_emails
        (resend_id, direction, from_email, to_email, subject, status)
      VALUES
        (${resendEmailId}, 'outbound', ${FROM}, ${email},
         'Welcome to ClaudeMeter', ${resendEmailId ? "sent" : "failed"})
    `;
  },
});

/**
 * Wrap the standard newsletter handler to also issue the install-gate token
 * cookie on successful capture. /api/download checks this cookie; without
 * it, the download path bounces back to the homepage with ?gate=required.
 *
 * We re-read the request body here (clone) so the wrapped handler still gets
 * the original request to consume.
 */
export async function POST(req: NextRequest): Promise<Response> {
  let email: string | undefined;
  try {
    const body = await req.clone().json();
    if (body && typeof body.email === "string") {
      email = body.email.trim().toLowerCase();
    }
  } catch {
    /* malformed body, let the wrapped handler 400 */
  }

  const res = await handler(req);

  // Only stamp the cookie when newsletter accepted the submission AND we have
  // a parseable email. A 5xx on the welcome email path still counts: the user
  // gave us a real address, that's the gate.
  const accepted = res.status >= 200 && res.status < 500;
  if (!accepted || !email || !email.includes("@")) {
    return res;
  }

  // Re-emit the response with the Set-Cookie appended. Response.headers is
  // not directly mutable across all runtimes, so we rebuild.
  const text = await res.text();
  const headers = new Headers(res.headers);
  headers.append("Set-Cookie", buildInstallTokenCookie(email));
  return new Response(text || null, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}
