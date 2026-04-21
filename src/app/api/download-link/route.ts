import type { NextRequest } from "next/server";
import { getSql } from "@/lib/db";

const FROM = "ClaudeMeter <hello@claude-meter.com>";
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || "";
const RELEASES_FALLBACK = "https://github.com/m13v/claude-meter/releases/latest";
const SUBJECT = "Your ClaudeMeter download link";

async function resolveLatestDmgUrl(): Promise<{ url: string; version: string | null }> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/m13v/claude-meter/releases/latest",
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return { url: RELEASES_FALLBACK, version: null };
    const data = (await res.json()) as {
      tag_name?: string;
      assets?: Array<{ name: string; browser_download_url: string }>;
    };
    const dmg = data.assets?.find((a) => a.name.toLowerCase().endsWith(".dmg"));
    return {
      url: dmg?.browser_download_url || RELEASES_FALLBACK,
      version: data.tag_name || null,
    };
  } catch {
    return { url: RELEASES_FALLBACK, version: null };
  }
}

function downloadEmailHtml(dmgUrl: string, version: string | null): string {
  const versionLabel = version ? ` (${version})` : "";
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
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
                Your download link is ready${versionLabel}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 20px;color:#475569;font-size:15px;line-height:1.6;">
              Tap the button below to download the ClaudeMeter .dmg for macOS. It shows your Claude Pro or Max rolling 5-hour window, weekly quota, and extra-usage balance live in the menu bar.
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 16px;">
              <a href="${dmgUrl}" style="display:inline-block;padding:12px 24px;background-color:#14b8a6;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">
                Download ClaudeMeter.dmg
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;color:#64748b;font-size:13px;line-height:1.6;">
              Prefer Homebrew? Run <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;color:#0f172a;">brew install --cask m13v/tap/claude-meter</code>.
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:20px 32px;color:#94a3b8;font-size:13px;line-height:1.5;">
              MIT licensed. No telemetry. Source on <a href="https://github.com/m13v/claude-meter" style="color:#14b8a6;text-decoration:none;">GitHub</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return new Response(
      JSON.stringify({ error: "A valid email address is required" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  if (AUDIENCE_ID) {
    const contactRes = await fetch(
      `https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      },
    );
    if (!contactRes.ok) {
      const detail = await contactRes.text().catch(() => "");
      console.error("[download-link] Failed to add contact:", detail);
    }
  }

  const { url: dmgUrl, version } = await resolveLatestDmgUrl();

  let resendEmailId: string | null = null;

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: email,
      subject: SUBJECT,
      html: downloadEmailHtml(dmgUrl, version),
    }),
  });

  if (emailRes.ok) {
    const data = await emailRes.json().catch(() => ({}));
    resendEmailId = data.id || null;
  } else {
    const detail = await emailRes.text().catch(() => "");
    console.error("[download-link] Failed to send email:", detail);
    return new Response(
      JSON.stringify({ error: "Failed to send email. Please try again." }),
      { status: 502, headers: { "content-type": "application/json" } },
    );
  }

  try {
    const sql = getSql();
    await sql`
      INSERT INTO claude_meter_emails
        (resend_id, direction, from_email, to_email, subject, status)
      VALUES
        (${resendEmailId}, 'outbound', ${FROM}, ${email},
         ${SUBJECT}, ${resendEmailId ? "sent" : "failed"})
    `;
  } catch (err) {
    console.error("[download-link] DB log error:", err);
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}
