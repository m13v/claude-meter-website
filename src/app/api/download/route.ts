import type { NextRequest } from "next/server";
import {
  INSTALL_TOKEN_COOKIE_NAME,
  verifyInstallToken,
} from "@/lib/install-gate-token";

const RELEASES_FALLBACK = "https://github.com/m13v/claude-meter/releases/latest";
const GATE_REDIRECT = "/?gate=required&from=download";

async function resolveLatestDmgUrl(): Promise<string> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/m13v/claude-meter/releases/latest",
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return RELEASES_FALLBACK;
    const data = (await res.json()) as {
      assets?: Array<{ name: string; browser_download_url: string }>;
    };
    const dmg = data.assets?.find((a) => a.name.toLowerCase().endsWith(".dmg"));
    return dmg?.browser_download_url || RELEASES_FALLBACK;
  } catch {
    return RELEASES_FALLBACK;
  }
}

/**
 * Hard-gate the download. Visitors must hand over their email through the
 * install-gate modal before they can hit this endpoint. The newsletter route
 * sets `cm_install_token` (HMAC over email + expiry) on successful capture.
 *
 * No token? Bounce to the homepage with `?gate=required` so the modal
 * auto-opens. We do NOT redirect straight to GitHub releases.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const token = req.cookies.get(INSTALL_TOKEN_COOKIE_NAME)?.value;
  const verdict = verifyInstallToken(token);
  if (!verdict.ok) {
    const origin = new URL(req.url).origin;
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${origin}${GATE_REDIRECT}`,
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "x-install-gate": verdict.reason ?? "missing",
      },
    });
  }

  const url = await resolveLatestDmgUrl();
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      "Cache-Control": "private, max-age=0, s-maxage=0",
      "x-install-gate": "ok",
    },
  });
}
