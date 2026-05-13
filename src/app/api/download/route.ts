import { createDownloadHandler } from "@seo/components/server";
import { getSql } from "@/lib/db";
import {
  INSTALL_TOKEN_COOKIE_NAME,
  buildInstallTokenCookie,
  verifyInstallToken,
} from "@/lib/install-gate-token";

const RELEASES_FALLBACK = "https://github.com/m13v/claude-meter/releases/latest";

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

/**
 * Email-gated DMG download. Drives the funnel's bottom step.
 *
 * Both entry paths are still supported:
 *   1. `cm_install_token` cookie — set by `/api/download` itself on the first
 *      successful query-param hit (so subsequent installs on the same browser
 *      skip the URL token).
 *   2. `?token=...` URL param — emitted in the welcome email so the link works
 *      across devices.
 *
 * Bad/missing token still bounces to `/?gate=required&from=download`.
 *
 * The 2026-05-13 rewrite swapped the bespoke handler for
 * `createDownloadHandler` from `@m13v/seo-components` v0.39+, which adds:
 *   - server-side PostHog `download_link_clicked_server` (ground truth,
 *     ad-blocker proof, matches the `_server` convention used by signups),
 *   - `onClick` DB hook (rows land in `claude_meter_download_clicks`),
 *   - bot UA detection (LinkedIn / Slack / Twitter unfurls don't pollute
 *     the funnel).
 */
export const GET = createDownloadHandler({
  site: "claude-meter",
  cookieName: INSTALL_TOKEN_COOKIE_NAME,
  verifyToken: (token) => {
    const v = verifyInstallToken(token);
    if (v.ok && v.email) return { ok: true, email: v.email };
    return { ok: false, reason: v.reason ?? "missing" };
  },
  resolveDownloadUrl: resolveLatestDmgUrl,
  buildTokenCookie: buildInstallTokenCookie,
  gateRedirect: "/?gate=required&from=download",
  onClick: async (info) => {
    try {
      const sql = getSql();
      await sql`
        INSERT INTO claude_meter_download_clicks
          (email, version, asset_url, source, user_agent, referer, ip, country)
        VALUES
          (${info.email}, ${info.version}, ${info.url}, ${info.source},
           ${info.userAgent.slice(0, 500)}, ${info.referer.slice(0, 500)},
           ${info.ip}, ${info.country})
      `;
    } catch (err) {
      console.error("[download] DB log error:", err);
    }
  },
});
