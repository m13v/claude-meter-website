import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { sendEmail } from "@/lib/resend-server";

const FROM = "ClaudeMeter <hello@claude-meter.com>";
const INBOX = "i@m13v.com";

export async function POST(req: Request) {
  let body: { email?: string; message?: string; name?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : null;

  if (!/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (message.length < 2) {
    return NextResponse.json({ error: "empty_message" }, { status: 400 });
  }

  const subject = `ClaudeMeter contact: ${email}`;
  const html = `
        <p><strong>From:</strong> ${name ? `${name} ` : ""}&lt;${email}&gt;</p>
        <pre style="white-space: pre-wrap; font-family: inherit">${message.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] || c))}</pre>
      `;

  let resendOk = false;
  let resendEmailId: string | null = null;
  try {
    const result = await sendEmail({
      from: FROM,
      to: INBOX,
      replyTo: email,
      subject,
      html,
    });
    resendOk = true;
    resendEmailId = (result && typeof result === "object" && "id" in result && typeof (result as { id?: unknown }).id === "string")
      ? ((result as { id: string }).id)
      : null;
  } catch (err) {
    console.error("contact forward email failed", err);
  }

  try {
    const sql = getSql();
    await sql`
      INSERT INTO claude_meter_contacts (email, name, message, resend_ok)
      VALUES (${email}, ${name}, ${message}, ${resendOk})
    `;
    await sql`
      INSERT INTO claude_meter_emails
        (resend_id, direction, from_email, to_email, subject, body_html, status)
      VALUES
        (${resendEmailId}, 'outbound', ${FROM}, ${INBOX},
         ${subject}, ${html}, ${resendOk ? "sent" : "failed"})
      ON CONFLICT (resend_id) DO NOTHING
    `;
  } catch (err) {
    console.error("contact db insert failed", err);
  }

  if (!resendOk) {
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
