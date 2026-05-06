import type { NextRequest } from "next/server";
import { getSql } from "@/lib/db";
import { signInstallToken } from "@/lib/install-gate-token";

const FROM = "Matt from Claude Meter <matt@claude-meter.com>";
const SITE_URL = "https://claude-meter.com";
const BREW_CMD = "brew install --cask m13v/tap/claude-meter";
const BREW_UPGRADE_CMD = "brew upgrade --cask claude-meter";
const CLONE_CMD = "git clone https://github.com/m13v/claude-meter";
const CLI_CMD = "/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json";
const WELCOME_SUBJECT = "Your Claude Meter install command";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function codeBlock(code: string): string {
  return `<div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;color:#0f172a;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;line-height:1.5;white-space:pre;overflow-x:auto;">${escapeHtml(code)}</div>`;
}

/**
 * Welcome email body. The page never renders these commands; this email is
 * the single source of truth. Includes:
 *   1. The Homebrew install command (menu bar app + CLI).
 *   2. A tokenized .dmg installer link, valid for 30 days, usable on any
 *      device. The token in the URL is the same HMAC the cookie carries;
 *      /api/download accepts either.
 *   3. The git clone URL for the unpacked browser extension.
 *   4. The brew upgrade command and the menu bar CLI command, for later use.
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#06b6d4,#14b8a6);"></td>
          </tr>
          <tr>
            <td style="padding:32px 32px 0;">
              <span style="font-size:22px;font-weight:bold;color:#0f172a;">Claude Meter</span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 12px;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#0f172a;line-height:1.3;">
                Your install commands
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 16px;color:#475569;font-size:15px;line-height:1.6;">
              Two ways to install Claude Meter on macOS. Pick whichever you prefer; both pull the same signed, notarized build.
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 8px;color:#0f172a;font-size:14px;font-weight:600;line-height:1.4;">
              1. One command in your terminal
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 20px;">${codeBlock(BREW_CMD)}</td>
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
            <td style="padding:0 32px 8px;color:#0f172a;font-size:14px;font-weight:600;line-height:1.4;">
              Browser extension (clone the repo, load unpacked)
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 6px;color:#64748b;font-size:13px;line-height:1.5;">
              Run this once anywhere on disk, then load the <code style="background:#f1f5f9;border-radius:4px;padding:1px 5px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;color:#0f172a;">extension/</code> folder via chrome://extensions, arc://extensions, brave://extensions, or edge://extensions in Developer mode.
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 20px;">${codeBlock(CLONE_CMD)}</td>
          </tr>

          <tr>
            <td style="padding:0 32px 8px;color:#0f172a;font-size:14px;font-weight:600;line-height:1.4;">
              Later on
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 6px;color:#64748b;font-size:13px;line-height:1.5;">
              Upgrade to the latest patch:
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 12px;">${codeBlock(BREW_UPGRADE_CMD)}</td>
          </tr>
          <tr>
            <td style="padding:0 32px 6px;color:#64748b;font-size:13px;line-height:1.5;">
              Drop the numbers into a shell prompt or status bar:
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 20px;">${codeBlock(CLI_CMD)}</td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px;color:#64748b;font-size:13px;line-height:1.6;">
              After install, visit <a href="https://claude.ai" style="color:#14b8a6;text-decoration:none;">claude.ai</a> once so the browser extension can grab your session. The menu bar icon lights up within a minute.
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <a href="https://github.com/m13v/claude-meter" style="display:inline-block;padding:11px 20px;background-color:#0f172a;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
                View source on GitHub
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;color:#64748b;font-size:13px;line-height:1.6;">
              Questions or hit a wall? Just reply to this email, it goes straight to me.
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:20px 32px;color:#94a3b8;font-size:12px;line-height:1.5;">
              You're receiving this because you signed up at <a href="${SITE_URL}" style="color:#14b8a6;text-decoration:none;">claude-meter.com</a>. The .dmg link is valid for 30 days.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Plain-text alternative for clients that strip HTML. Each command lands on
 * its own line so they can be copied directly. Resend uses this verbatim
 * instead of auto-extracting from the HTML (which collapses whitespace and
 * runs commands together).
 */
function buildWelcomeEmailText(email: string): string {
  const installToken = signInstallToken(email);
  const dmgUrl = `${SITE_URL}/api/download?token=${encodeURIComponent(installToken)}`;
  return [
    "Claude Meter, install commands",
    "",
    "Two ways to install Claude Meter on macOS. Pick whichever you prefer; both pull the same signed, notarized build.",
    "",
    "1. One command in your terminal:",
    "",
    `   ${BREW_CMD}`,
    "",
    "2. Or download the .dmg directly:",
    "",
    `   ${dmgUrl}`,
    "",
    "Browser extension (clone, then Load unpacked at chrome://extensions / arc://extensions / brave://extensions / edge://extensions):",
    "",
    `   ${CLONE_CMD}`,
    "",
    "Later on:",
    "",
    "Upgrade to the latest patch:",
    "",
    `   ${BREW_UPGRADE_CMD}`,
    "",
    "Drop the numbers into a shell prompt or status bar:",
    "",
    `   ${CLI_CMD}`,
    "",
    "After install, visit https://claude.ai once so the browser extension can grab your session.",
    "",
    "Source: https://github.com/m13v/claude-meter",
    "",
    "Questions? Just reply to this email.",
    "",
    `You're receiving this because you signed up at ${SITE_URL}. The .dmg link is valid for 30 days.`,
  ].join("\n");
}

/**
 * Email-only install gate. Mirrors the shape of
 * `createNewsletterHandler` from @m13v/seo-components/server but sends the
 * welcome email with both `html` AND `text` MIME parts. Resend's
 * auto-extracted plain text collapses whitespace and runs shell commands
 * onto a single line, which is unusable for an install email; passing
 * an explicit `text` body keeps every command on its own line.
 *
 * The endpoint does NOT set the install-gate cookie. The cookie is only
 * stamped by /api/download when the user clicks the tokenized link in the
 * welcome email, so submitting the form alone is not enough to unlock the
 * DMG, even from the same browser.
 */
export async function POST(req: NextRequest): Promise<Response> {
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

  const audienceId = process.env.RESEND_AUDIENCE_ID || "";
  if (audienceId) {
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
    if (!contactRes.ok) {
      const detail = await contactRes.text().catch(() => "");
      console.error("[newsletter] Failed to add contact:", detail);
      return new Response(
        JSON.stringify({ error: "Failed to subscribe. Please try again." }),
        { status: 502, headers: { "content-type": "application/json" } },
      );
    }
  }

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
      subject: WELCOME_SUBJECT,
      html: buildWelcomeEmailHtml(email),
      text: buildWelcomeEmailText(email),
    }),
  });

  if (emailRes.ok) {
    const data = await emailRes.json().catch(() => ({}));
    resendEmailId = data.id || null;
  } else {
    const detail = await emailRes.text().catch(() => "");
    console.error("[newsletter] Failed to send welcome email:", detail);
  }

  try {
    const sql = getSql();
    await sql`
      INSERT INTO claude_meter_emails
        (resend_id, direction, from_email, to_email, subject, status)
      VALUES
        (${resendEmailId}, 'outbound', ${FROM}, ${email},
         ${WELCOME_SUBJECT}, ${resendEmailId ? "sent" : "failed"})
    `;
  } catch (err) {
    console.error("[newsletter] DB log error:", err);
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}
