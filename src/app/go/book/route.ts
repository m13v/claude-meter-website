import { createBookCallRedirectHandler } from "@seo/components/server";

export const GET = createBookCallRedirectHandler({
  site: "claude-meter",
  fallbackBookingUrl: "https://cal.com/team/mediar/claude-meter",
});
