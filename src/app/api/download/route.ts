import type { NextRequest } from "next/server";

const RELEASES_FALLBACK = "https://github.com/m13v/claude-meter/releases/latest";

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

export async function GET(_req: NextRequest) {
  const url = await resolveLatestDmgUrl();
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
}
