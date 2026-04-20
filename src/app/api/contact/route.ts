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

  try {
    const sql = getSql();
    await sql`
      INSERT INTO contact_submissions (email, name, message, source)
      VALUES (${email}, ${name}, ${message}, 'claude-meter')
    `;
  } catch (err) {
    console.error("contact db insert failed", err);
  }

  try {
    await sendEmail({
      from: FROM,
      to: INBOX,
      replyTo: email,
      subject: `ClaudeMeter contact: ${email}`,
      html: `
        <p><strong>From:</strong> ${name ? `${name} ` : ""}&lt;${email}&gt;</p>
        <pre style="white-space: pre-wrap; font-family: inherit">${message.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] || c))}</pre>
      `,
    });
  } catch (err) {
    console.error("contact forward email failed", err);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
