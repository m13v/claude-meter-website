import type { NextRequest } from "next/server";
import {
  INSTALL_TOKEN_COOKIE_NAME,
  buildInstallTokenCookie,
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
 * install-gate modal before they can hit this endpoint. There are two
 * accepted token paths:
 *
 *   1. `cm_install_token` cookie — set by /api/newsletter on capture in the
 *      same browser session. This is the in-app modal flow.
 *   2. `?token=...` URL param — emitted in the welcome email so the user can
 *      click the install link from their inbox on any device. On success we
 *      stamp the cookie too so subsequent /install navigations skip the modal.
 *
 * Neither token? Bounce to the homepage with `?gate=required` so the modal
 * auto-opens. We do NOT redirect straight to GitHub releases.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const cookieToken = req.cookies.get(INSTALL_TOKEN_COOKIE_NAME)?.value;
  const queryToken = req.nextUrl.searchParams.get("token") ?? undefined;

  // Try cookie first (no extra work to set it again), then fall back to URL.
  let verdict = verifyInstallToken(cookieToken);
  let acceptedFrom: "cookie" | "query" | null = verdict.ok ? "cookie" : null;
  if (!verdict.ok && queryToken) {
    const queryVerdict = verifyInstallToken(queryToken);
    if (queryVerdict.ok) {
      verdict = queryVerdict;
      acceptedFrom = "query";
    }
  }

  if (!verdict.ok) {
    // Use a relative redirect: behind Cloud Run, `req.url` resolves to the
    // internal binding (0.0.0.0:8080), so building an absolute URL from it
    // sends visitors to a broken hostname. Relative redirects are resolved
    // by the browser against the request URL it actually navigated to.
    return new Response(null, {
      status: 302,
      headers: {
        Location: GATE_REDIRECT,
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "x-install-gate": verdict.reason ?? "missing",
      },
    });
  }

  const url = await resolveLatestDmgUrl();
  const headers = new Headers({
    Location: url,
    "Cache-Control": "private, max-age=0, s-maxage=0",
    "x-install-gate": "ok",
    "x-install-gate-source": acceptedFrom ?? "unknown",
  });
  // Promote a query-param token to a cookie so the next install attempt on
  // this browser does not need to re-validate against the URL.
  if (acceptedFrom === "query" && verdict.email) {
    headers.append("Set-Cookie", buildInstallTokenCookie(verdict.email));
  }
  return new Response(null, { status: 302, headers });
}
