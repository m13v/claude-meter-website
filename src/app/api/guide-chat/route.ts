import { createGuideChatHandler } from "@m13v/seo-components/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createGuideChatHandler({
  app: "claude-meter",
  brand: "ClaudeMeter",
  siteDescription:
    "Free open-source macOS menu bar app and browser extension that shows live Anthropic Claude Pro/Max plan usage: rolling 5-hour window, weekly quota, and extra-usage balance.",
  contentDir: "src/app/(main)/t",
});
