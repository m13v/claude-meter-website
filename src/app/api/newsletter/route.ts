import { createNewsletterHandler } from "@seo/components/server";
import { getSql } from "@/lib/db";
import { signInstallToken } from "@/lib/install-gate-token";

/*
 * Newsletter handler for Claude Meter's email install gate.
 *
 * Uses the shared `createNewsletterHandler` factory from
 * @m13v/seo-components v0.38+, which now supports the `welcomeText` plain-
 * text MIME part this route needs (without it, Resend auto-extracts text
 * from HTML and collapses install commands onto a single line). The factory
 * also fires the canonical `newsletter_subscribed_server` PostHog event so
 * the dashboard's "Email Signups" column reflects ground truth instead of
 * ad-blocker lossy client events.
 *
 * The welcome email contains a per-subscriber HMAC install token baked into
 * the .dmg download URL. The factory passes `email` into both `welcomeHtml`
 * and `welcomeText`, so we can call `signInstallToken(email)` inline. The
 * install-gate cookie is NOT stamped here; only `/api/download` stamps it
 * when the user clicks the tokenized link, so submitting the form alone
 * does not unlock the DMG even from the same browser.
 *
 * No em or en dashes anywhere (UTF-8 corruption in subjects).
 */

const FROM = "Matt from Claude Meter <matt@claude-meter.com>";
const BRAND = "Claude Meter";
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

function buildWelcomeHtml(email: string): string {
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
              <span style="font-size:22px;font-weight:bold;color:#0f172a;">${BRAND}</span>
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
              You&rsquo;re receiving this because you signed up at <a href="${SITE_URL}" style="color:#14b8a6;text-decoration:none;">claude-meter.com</a>. The .dmg link is valid for 30 days.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildWelcomeText(email: string): string {
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

export const POST = createNewsletterHandler({
  audienceId: process.env.RESEND_AUDIENCE_ID || "",
  fromEmail: FROM,
  brand: BRAND,
  site: "claude-meter",
  siteUrl: SITE_URL,
  welcomeSubject: WELCOME_SUBJECT,
  welcomeHtml: (email) => buildWelcomeHtml(email),
  welcomeText: (email) => buildWelcomeText(email),
  onSignup: async (email, resendEmailId) => {
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
  },
});
