import { createNewsletterHandler } from "@m13v/seo-components/server";
import type { NextRequest } from "next/server";
import { getSql } from "@/lib/db";
import {
  buildInstallTokenCookie,
  signInstallToken,
} from "@/lib/install-gate-token";

const FROM = "ClaudeMeter <hello@claude-meter.com>";
const SITE_URL = "https://claude-meter.com";
const BREW_CMD = "brew install --cask m13v/tap/claude-meter";
const WELCOME_SUBJECT = "Your ClaudeMeter install link";

/**
 * Welcome email body. Includes the brew command and a tokenized .dmg
 * installer link so the recipient can install from any device, not just the
 * browser session that submitted the form. The token in the URL is the same
 * HMAC the cookie carries; /api/download accepts either.
 */
function buildWelcomeEmailHtml(email: string): string {
  const installToken = signInstallToken(email);
  const dmgUrl = `${SITE_URL}/api/download?token=${encodeURIComponent(installToken)}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#06b6d4,#14b8a6);"></td>
          </tr>
          <tr>
            <td style="padding:32px 32px 0;">
              <span style="font-size:22px;font-weight:bold;color:#0f172a;">ClaudeMeter</span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 12px;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#0f172a;line-height:1.3;">
                Your install link
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 16px;color:#475569;font-size:15px;line-height:1.6;">
              Two ways to install ClaudeMeter on macOS. Pick whichever you prefer.
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 8px;color:#0f172a;font-size:14px;font-weight:600;line-height:1.4;">
              1. One command in your terminal
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 20px;">
              <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;color:#0f172a;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;line-height:1.5;word-break:break-all;">
                ${BREW_CMD}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 8px;color:#0f172a;font-size:14px;font-weight:600;line-height:1.4;">
              2. Or download the .dmg directly
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 20px;">
              <a href="${dmgUrl}" style="display:inline-block;padding:12px 24px;background-color:#14b8a6;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">
                Download installer
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;color:#64748b;font-size:13px;line-height:1.6;">
              After install, visit <a href="https://claude.ai" style="color:#14b8a6;text-decoration:none;">claude.ai</a> once so the browser extension can grab your session. The menu bar icon lights up within a minute.
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;color:#64748b;font-size:13px;line-height:1.6;">
              Questions or hit a wall? Just reply to this email.
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:20px 32px;color:#94a3b8;font-size:12px;line-height:1.5;">
              You're receiving this because you signed up at <a href="${SITE_URL}" style="color:#14b8a6;text-decoration:none;">claude-meter.com</a>. The install link is valid for 30 days.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const handler = createNewsletterHandler({
  audienceId: process.env.RESEND_AUDIENCE_ID || "",
  fromEmail: FROM,
  brand: "ClaudeMeter",
  siteUrl: SITE_URL,
  welcomeSubject: WELCOME_SUBJECT,
  welcomeHtml: buildWelcomeEmailHtml,
  onSignup: async (email, resendEmailId) => {
    const sql = getSql();
    await sql`
      INSERT INTO claude_meter_emails
        (resend_id, direction, from_email, to_email, subject, status)
      VALUES
        (${resendEmailId}, 'outbound', ${FROM}, ${email},
         ${WELCOME_SUBJECT}, ${resendEmailId ? "sent" : "failed"})
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

  // Stamp the install-gate cookie whenever the user supplied a parseable
  // email AND the handler did not reject it as invalid input. 4xx means
  // the input was malformed, so no cookie. 2xx (subscribed), 3xx (redirect),
  // and 5xx (Resend transport flake) all count: the email itself is valid,
  // the user did their part of the gate.
  const isInputError = res.status >= 400 && res.status < 500;
  if (isInputError || !email || !email.includes("@") || !email.includes(".")) {
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
