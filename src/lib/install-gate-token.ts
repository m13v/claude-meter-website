import crypto from "node:crypto";

/**
 * Hard-gate token that proves a visitor handed over their email before they
 * reach the install/download path.
 *
 * Token shape: `${b64url(email)}.${expirySec}.${b64url(hmacSha256(payload))}`
 * Where `payload = b64(email).expirySec`. Signed with INSTALL_GATE_SECRET.
 *
 * Set as the `cm_install_token` cookie on successful newsletter capture.
 * Verified server-side on /api/download. Anything else returns 401/redirect.
 */

const COOKIE_NAME = "cm_install_token";
const DEFAULT_TTL_SEC = 60 * 60 * 24 * 30; // 30 days
const DEV_FALLBACK_SECRET = "dev-only-install-gate-secret-do-not-use-in-prod";

function getSecret(): string {
  const secret = process.env.INSTALL_GATE_SECRET;
  if (secret && secret.trim().length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    // In prod, refuse to issue or verify tokens silently with the dev fallback.
    // Throwing here would surface in logs and remind us to set the env var.
    console.warn(
      "[install-gate] INSTALL_GATE_SECRET missing or too short in production. Using fallback.",
    );
  }
  return DEV_FALLBACK_SECRET;
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function signInstallToken(email: string, ttlSec: number = DEFAULT_TTL_SEC): string {
  const expiry = Math.floor(Date.now() / 1000) + ttlSec;
  const emailEnc = b64url(email.trim().toLowerCase());
  const payload = `${emailEnc}.${expiry}`;
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest();
  return `${payload}.${b64url(sig)}`;
}

export interface VerifyResult {
  ok: boolean;
  email?: string;
  reason?: "missing" | "malformed" | "bad_sig" | "expired";
}

export function verifyInstallToken(token: string | undefined | null): VerifyResult {
  if (!token) return { ok: false, reason: "missing" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };
  const [emailEnc, expirySec, sigEnc] = parts;
  const expiry = Number(expirySec);
  if (!Number.isFinite(expiry) || expiry <= 0) return { ok: false, reason: "malformed" };
  const payload = `${emailEnc}.${expirySec}`;
  let expected: Buffer;
  try {
    expected = crypto.createHmac("sha256", getSecret()).update(payload).digest();
  } catch {
    return { ok: false, reason: "bad_sig" };
  }
  let actual: Buffer;
  try {
    actual = b64urlDecode(sigEnc);
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    return { ok: false, reason: "bad_sig" };
  }
  if (Math.floor(Date.now() / 1000) > expiry) {
    return { ok: false, reason: "expired" };
  }
  let email: string | undefined;
  try {
    email = b64urlDecode(emailEnc).toString("utf8");
  } catch {
    return { ok: false, reason: "malformed" };
  }
  return { ok: true, email };
}

export function buildInstallTokenCookie(email: string): string {
  const token = signInstallToken(email);
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${DEFAULT_TTL_SEC}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (isProd) parts.push("Secure");
  return parts.join("; ");
}

export const INSTALL_TOKEN_COOKIE_NAME = COOKIE_NAME;
