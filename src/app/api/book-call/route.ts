import { createBookCallHandler } from "@seo/components/server";

export const POST = createBookCallHandler({
  site: "claude-meter",
  audienceId: "",
  fromEmail: "Matt from Claude Meter <matt@mediar.ai>",
  brand: "Claude Meter",
  siteUrl: "https://claude-meter.com",
  redirectBaseUrl: "https://claude-meter.com/go/book",
});
