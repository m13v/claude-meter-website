import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { sendEmail } from "@/lib/resend-server";

const FROM = "ClaudeMeter <hello@claude-meter.com>";

export async function POST(req: Request) {
  let email: unknown;
  try {
    const body = await req.json();
    email = body?.email;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof email !== "string" || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  try {
    const sql = getSql();
    await sql`
      INSERT INTO newsletter_subscribers (email, source)
      VALUES (${email}, 'claude-meter')
      ON CONFLICT (email) DO NOTHING
    `;
  } catch (err) {
    console.error("newsletter db insert failed", err);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  try {
    await sendEmail({
      from: FROM,
      to: email,
      subject: "Welcome to ClaudeMeter",
      html: `
        <p>Thanks for subscribing.</p>
        <p>You'll get the occasional note on surviving Claude plan limits, the 5-hour window, and the weekly quota. No spam.</p>
        <p>If ClaudeMeter is not installed yet: <a href="https://claude-meter.com/install">claude-meter.com/install</a>.</p>
        <p>i@m13v.com</p>
      `,
    });
  } catch (err) {
    console.error("newsletter welcome email failed", err);
  }

  return NextResponse.json({ ok: true });
}
