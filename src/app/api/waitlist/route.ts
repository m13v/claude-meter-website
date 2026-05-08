import type { NextRequest } from "next/server";
import { getSql } from "@/lib/db";

const FROM = "Matt from Claude Meter <matt@claude-meter.com>";
const WAITLIST_SUBJECT = "You're on the Claude Meter Pro waitlist";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildWaitlistEmailHtml(): string {
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#06b6d4,#14b8a6);"></td>
          </tr>
          <tr>
            <td style="padding:32px 32px 0;">
              <span style="font-size:22px;font-weight:bold;color:#0f172a;">Claude Meter Pro</span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 12px;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#0f172a;line-height:1.3;">
                You're on the waitlist
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 16px;color:#475569;font-size:15px;line-height:1.6;">
              Thanks for signing up. Pro is the proactive layer on top of the free Claude Meter menu bar app: a background agent that watches what your Claude Code and Claude.ai sessions actually spend, suggests cuts that don't hurt quality, then ships the fixes for you with permission.
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 16px;color:#475569;font-size:15px;line-height:1.6;">
              We're inviting people in batches over the next several weeks. Earliest invites go to folks who already run the free menu bar app, so if you don't have it yet, this is the moment.
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <a href="https://claude-meter.com/install" style="display:inline-block;padding:12px 24px;background-color:#14b8a6;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">
                Install the free app
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;color:#64748b;font-size:13px;line-height:1.6;">
              Questions or want to tell me what you'd want Pro to catch first? Reply to this email, it goes straight to me.
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:20px 32px;color:#94a3b8;font-size:12px;line-height:1.5;">
              You're receiving this because you joined the Claude Meter Pro waitlist at <a href="https://claude-meter.com/pro" style="color:#14b8a6;text-decoration:none;">claude-meter.com/pro</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildWaitlistEmailText(): string {
  return [
    "Claude Meter Pro, you're on the waitlist",
    "",
    "Thanks for signing up. Pro is the proactive layer on top of the free Claude Meter menu bar app: a background agent that watches what your Claude Code and Claude.ai sessions actually spend, suggests cuts that don't hurt quality, then ships the fixes for you with permission.",
    "",
    "We're inviting people in batches over the next several weeks. Earliest invites go to folks who already run the free menu bar app.",
    "",
    "Install the free app: https://claude-meter.com/install",
    "",
    "Questions or want to tell me what you'd want Pro to catch first? Reply to this email.",
    "",
    "You're receiving this because you joined the Claude Meter Pro waitlist at https://claude-meter.com/pro.",
  ].join("\n");
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: { email?: string; section?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const section = typeof body.section === "string" ? body.section.slice(0, 64) : null;

  if (!email || !email.includes("@") || email.length > 320) {
    return new Response(
      JSON.stringify({ error: "A valid email address is required" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  // Persist the waitlist entry first; even if Resend or the audience call fails,
  // we have the row. The pro_waitlist table is idempotent on email.
  let dbOk = true;
  try {
    const sql = getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS pro_waitlist (
        id BIGSERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        section TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      INSERT INTO pro_waitlist (email, section)
      VALUES (${email}, ${section})
      ON CONFLICT (email) DO NOTHING
    `;
  } catch (err) {
    console.error("[waitlist] DB write failed:", err);
    dbOk = false;
  }

  // Best-effort: add to the same Resend audience as the newsletter so the
  // batched invite blast can reuse the existing list infrastructure.
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID || "";
  if (apiKey && audienceId) {
    try {
      const contactRes = await fetch(
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
      if (!contactRes.ok && contactRes.status !== 409) {
        const detail = await contactRes.text().catch(() => "");
        console.warn("[waitlist] Resend audience add non-OK:", contactRes.status, detail);
      }
    } catch (err) {
      console.warn("[waitlist] Resend audience add network error:", err);
    }
  }

  // Best-effort confirmation email. We don't fail the request if Resend errors;
  // the waitlist row is the source of truth.
  let resendEmailId: string | null = null;
  if (apiKey) {
    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM,
          to: email,
          subject: WAITLIST_SUBJECT,
          html: buildWaitlistEmailHtml(),
          text: buildWaitlistEmailText(),
        }),
      });
      if (emailRes.ok) {
        const data = await emailRes.json().catch(() => ({}));
        resendEmailId = (data as { id?: string }).id || null;
      } else {
        const detail = await emailRes.text().catch(() => "");
        console.warn("[waitlist] Confirmation email failed:", detail);
      }
    } catch (err) {
      console.warn("[waitlist] Confirmation email network error:", err);
    }
  }

  // Mirror the existing claude_meter_emails log so the support inbox view
  // shows waitlist welcomes alongside install welcomes.
  try {
    const sql = getSql();
    await sql`
      INSERT INTO claude_meter_emails
        (resend_id, direction, from_email, to_email, subject, status)
      VALUES
        (${resendEmailId}, 'outbound', ${FROM}, ${email},
         ${WAITLIST_SUBJECT}, ${resendEmailId ? "sent" : "failed"})
    `;
  } catch (err) {
    // Non-fatal; the pro_waitlist row already exists.
    console.warn("[waitlist] email log write failed:", err);
  }

  if (!dbOk) {
    return new Response(
      JSON.stringify({ error: "Could not save your spot. Please try again." }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ success: true, escapedEmail: escapeHtml(email) }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}
