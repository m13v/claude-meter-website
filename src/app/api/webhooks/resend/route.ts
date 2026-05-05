import { createResendInboundHandler } from "@seo/components/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";

export const POST = createResendInboundHandler({
  domain: "claude-meter.com",
  brand: "ClaudeMeter",
  forwardFrom: "ClaudeMeter Inbound <matt@claude-meter.com>",
  forwardTo: process.env.CLAUDE_METER_INBOX_FORWARD || "i@m13v.com",
  onInbound: async (rec) => {
    const sql = getSql();
    await sql`
      INSERT INTO claude_meter_emails (resend_id, direction, from_email, to_email, subject, body_text, body_html, status)
      VALUES (${rec.resendId}, 'inbound', ${rec.fromEmail}, ${rec.toEmail}, ${rec.subject}, ${rec.bodyText}, ${rec.bodyHtml}, 'received')
      ON CONFLICT (resend_id) DO NOTHING
    `;
  },
  onDeliveryEvent: async ({ status, resendId, timestamp, type }) => {
    const sql = getSql();
    if (type === "email.opened") {
      await sql`UPDATE claude_meter_emails SET status = ${status}, opened_at = ${timestamp} WHERE resend_id = ${resendId}`;
    } else if (type === "email.clicked") {
      await sql`UPDATE claude_meter_emails SET status = ${status}, clicked_at = ${timestamp} WHERE resend_id = ${resendId}`;
    } else if (type === "email.delivered") {
      await sql`UPDATE claude_meter_emails SET status = ${status}, delivered_at = ${timestamp} WHERE resend_id = ${resendId}`;
    } else {
      await sql`UPDATE claude_meter_emails SET status = ${status} WHERE resend_id = ${resendId}`;
    }
  },
});

export async function GET() {
  return Response.json({ status: "ok" });
}
