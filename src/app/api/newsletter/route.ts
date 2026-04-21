import { createNewsletterHandler } from "@m13v/seo-components/server";
import { getSql } from "@/lib/db";

const FROM = "ClaudeMeter <hello@claude-meter.com>";

const handler = createNewsletterHandler({
  audienceId: process.env.RESEND_AUDIENCE_ID || "",
  fromEmail: FROM,
  brand: "ClaudeMeter",
  siteUrl: "https://claude-meter.com",
  welcomeSubject: "Welcome to ClaudeMeter",
  onSignup: async (email, resendEmailId) => {
    const sql = getSql();
    await sql`
      INSERT INTO claude_meter_emails
        (resend_id, direction, from_email, to_email, subject, status)
      VALUES
        (${resendEmailId}, 'outbound', ${FROM}, ${email},
         'Welcome to ClaudeMeter', ${resendEmailId ? "sent" : "failed"})
    `;
  },
});

export const POST = handler;
