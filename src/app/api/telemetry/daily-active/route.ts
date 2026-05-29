import { createHash } from "node:crypto";
import { capturePostHogServer } from "@seo/components/server";

export const runtime = "nodejs";

const SITE = "claude-meter";
const EVENT = "app_daily_active";
const INSTALL_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LOCAL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type DailyActivePayload = {
  install_id?: unknown;
  app_version?: unknown;
  local_date?: unknown;
  platform?: unknown;
  source?: unknown;
  surface?: unknown;
};

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function stringProp(value: unknown, max = 80): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function anonymousDistinctId(installId: string) {
  return `claude-meter-app:${createHash("sha256")
    .update(`claude-meter:${installId}`)
    .digest("hex")}`;
}

export async function POST(req: Request) {
  let payload: DailyActivePayload;
  try {
    payload = (await req.json()) as DailyActivePayload;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const installId = stringProp(payload.install_id);
  if (!installId || !INSTALL_ID_RE.test(installId)) {
    return json({ ok: false, error: "invalid_install_id" }, 400);
  }

  const localDate = stringProp(payload.local_date, 10);
  if (!localDate || !LOCAL_DATE_RE.test(localDate)) {
    return json({ ok: false, error: "invalid_local_date" }, 400);
  }

  const appVersion = stringProp(payload.app_version, 32);
  const platform = stringProp(payload.platform, 32) || "macos";
  const source = stringProp(payload.source, 40) || "desktop_app";
  const surface = stringProp(payload.surface, 40) || "macos_menubar";
  const host = req.headers.get("host") || "claude-meter.com";

  const captured = await capturePostHogServer({
    event: EVENT,
    distinctId: anonymousDistinctId(installId),
    host,
    properties: {
      site: SITE,
      $groups: { site: SITE },
      source,
      surface,
      platform,
      app_version: appVersion,
      local_date: localDate,
      telemetry_version: 1,
      component: "claude-meter-menubar",
      $process_person_profile: false,
      $geoip_disable: true,
      $ip: "0.0.0.0",
    },
  });

  if (!captured) {
    return json({ ok: false, error: "capture_failed" }, 503);
  }

  return json({ ok: true });
}

export async function GET() {
  return json({ ok: true, endpoint: "daily-active" });
}
