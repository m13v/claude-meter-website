"use client";

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Mirror the real app constants from claude-meter/src/bin/menubar.rs:
//   ALARM_THRESHOLD_DEFAULT = 95.0
//   BLINK_INTERVAL = 500ms → 15 frames at 30fps
//   BLINK_RED = (215, 58, 73)
//   bg_for: >=100 → BLINK_RED; >=90 → (219, 118, 32); else None
const BLINK_RED = "rgb(215, 58, 73)";
const ORANGE_BG = "rgb(219, 118, 32)";
const MENUBAR_BG = "rgba(28, 28, 30, 0.78)";
const DESKTOP_BG = "#1B2230";

const PAPER = "#F4EEE4";
const INK = "#121110";
const INK_2 = "#2A2824";
const MUTED = "#6B655C";
const RULE = "#D9D1C1";

function bgFor(util: number): string | null {
  if (util >= 100) return BLINK_RED;
  if (util >= 90) return ORANGE_BG;
  return null;
}

export function AlarmDemo() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Timeline (8s @ 30fps = 240 frames):
  // 0-60   : meter at 78% → 90%, no alert
  // 60-120 : 90% → 95%, orange bg
  // 120+   : alarm fires — blink + notification + dropdown
  const alarmStart = 120;
  const alarmActive = frame >= alarmStart;

  const fivePct = (() => {
    if (frame < 60) return interpolate(frame, [0, 60], [78, 90], { extrapolateRight: "clamp" });
    if (frame < 120) return interpolate(frame, [60, 120], [90, 95.4], { extrapolateRight: "clamp" });
    return 95.4 + Math.sin(((frame - alarmStart) / fps) * Math.PI) * 0.3;
  })();
  const sevenPct = 41;

  // BLINK: cadence is 500ms. red_phase toggles every 15 frames once active.
  // Matches the BlinkTick path in menubar.rs lines 511-516.
  const redPhase =
    alarmActive && Math.floor((frame - alarmStart) / 15) % 2 === 0;

  const fiveBg = alarmActive
    ? (redPhase ? BLINK_RED : null)
    : bgFor(fivePct);
  const sevenBg = alarmActive
    ? (redPhase ? BLINK_RED : null)
    : bgFor(sevenPct);

  // Notification slide-in: matches osascript display notification surfacing.
  const notifProgress = alarmActive
    ? spring({ frame: frame - alarmStart - 8, fps, config: { damping: 16, stiffness: 110 } })
    : 0;

  // Dropdown reveal: starts a beat after the notification.
  const dropdownProgress = alarmActive
    ? spring({ frame: frame - alarmStart - 36, fps, config: { damping: 18, stiffness: 130 } })
    : 0;

  // Headline + subhead in lower band.
  const headlineP = spring({ frame: frame - 4, fps, config: { damping: 20 } });
  const subP = spring({ frame: frame - 16, fps, config: { damping: 20 } });

  const fiveStr = `${fivePct.toFixed(0)}%`;
  const sevenStr = `${sevenPct.toFixed(0)}%`;

  return (
    <AbsoluteFill style={{ backgroundColor: DESKTOP_BG, overflow: "hidden", fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Subtle desktop wallpaper gradient */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(900px 600px at 20% 20%, #2A3850 0%, transparent 60%), radial-gradient(700px 500px at 90% 80%, #3A2F4A 0%, transparent 65%)",
        }}
      />

      {/* macOS menu bar — the hero element */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 36,
          background: MENUBAR_BG,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          color: "#F2F2F4",
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "-0.005em",
          zIndex: 10,
        }}
      >
        {/* Apple logo (using a stylized circle since the Apple glyph PUA char
            doesn't render in most fonts available to remotion/SSR) */}
        <svg width="14" height="16" viewBox="0 0 14 16" style={{ marginRight: 16, opacity: 0.92 }} aria-hidden="true">
          <path
            fill="#F2F2F4"
            d="M11.5 12.3c-.5 1.1-1.1 2.2-2 2.2-.9 0-1.2-.5-2.2-.5s-1.4.5-2.2.5c-.9 0-1.6-1-2.1-2.1-1.1-2.2-1.9-6.3.8-7.8.9-.5 1.8-.3 2.4 0 .6.3.9.5 1.4.5.4 0 .8-.2 1.4-.5.7-.4 1.5-.5 2.4-.1 1 .4 1.7 1.3 2 2.3-1.8.9-1.5 3.5.1 4.4-.3.4-.7.8-1 1.1zM9 3.4c-.4.5-1.1.8-1.8.8-.1-.7.2-1.4.6-1.8.4-.5 1.1-.8 1.7-.9.1.7-.2 1.4-.5 1.9z"
          />
        </svg>

        {/* Active app + its menus */}
        <span style={{ fontWeight: 700, marginRight: 18 }}>Terminal</span>
        <span style={{ marginRight: 14, opacity: 0.9 }}>Shell</span>
        <span style={{ marginRight: 14, opacity: 0.9 }}>Edit</span>
        <span style={{ marginRight: 14, opacity: 0.9 }}>View</span>
        <span style={{ marginRight: 14, opacity: 0.9 }}>Window</span>
        <span style={{ marginRight: 14, opacity: 0.9 }}>Help</span>

        <div style={{ flex: 1 }} />

        {/* ClaudeMeter title — exact format from title_segments (Long):
            "Claude  5h 95%  ·  7d 41%". Each percent is a TitleSeg with a bg. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: 20,
            gap: 0,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span style={{ marginRight: 8 }}>Claude</span>
          <span style={{ marginRight: 6, opacity: 0.85 }}>5h</span>
          <span style={pillStyle(fiveBg)}>{fiveStr}</span>
          <span style={{ margin: "0 10px", opacity: 0.7 }}>·</span>
          <span style={{ marginRight: 6, opacity: 0.85 }}>7d</span>
          <span style={pillStyle(sevenBg)}>{sevenStr}</span>
        </div>

        {/* System status icons (battery / wifi / clock) */}
        <svg width="20" height="12" viewBox="0 0 20 12" style={{ marginRight: 12, opacity: 0.85 }} aria-hidden="true">
          <rect x="0.5" y="0.5" width="17" height="11" rx="2.5" fill="none" stroke="#F2F2F4" />
          <rect x="2" y="2" width="11" height="8" rx="1" fill="#F2F2F4" />
          <rect x="18.5" y="4" width="1.5" height="4" rx="0.5" fill="#F2F2F4" />
        </svg>
        <svg width="16" height="13" viewBox="0 0 16 13" style={{ marginRight: 14, opacity: 0.9 }} aria-hidden="true">
          <path d="M8 12c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1zm-3-3c.6-.6 1.7-1 3-1s2.4.4 3 1l-.7.7c-.6-.5-1.4-.7-2.3-.7s-1.7.2-2.3.7L5 9zm-2-2c1.3-1.3 3-2 5-2s3.7.7 5 2l-.7.7C11.2 6.6 9.6 6 8 6s-3.2.6-4.3 1.7L3 7zm-2-2C2.7 3.3 5.2 2 8 2s5.3 1.3 7 3l-.7.7C12.7 4.2 10.4 3 8 3S3.3 4.2 1.7 5.7L1 5z" fill="#F2F2F4" />
        </svg>
        <span style={{ opacity: 0.92, marginRight: 6, fontSize: 13, letterSpacing: "0.01em" }}>Tue 1:47</span>
      </div>

      {/* Pointer arrow drawing attention to the flashing title */}
      {alarmActive && (
        <svg
          width="22"
          height="34"
          viewBox="0 0 22 34"
          style={{
            position: "absolute",
            top: 50,
            right: 230,
            zIndex: 9,
            opacity: redPhase ? 1 : 0.55,
          }}
          aria-hidden="true"
        >
          <path
            d="M11 32 L11 6 M11 6 L4 13 M11 6 L18 13"
            fill="none"
            stroke={redPhase ? BLINK_RED : "rgba(255,255,255,0.7)"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* macOS notification banner */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 32,
          width: 360,
          padding: "14px 16px",
          borderRadius: 14,
          background: "rgba(40, 40, 42, 0.92)",
          color: "#F2F2F4",
          opacity: notifProgress,
          transform: `translateX(${(1 - notifProgress) * 80}px) scale(${0.96 + notifProgress * 0.04})`,
          boxShadow: "0 14px 30px -10px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          zIndex: 8,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: "#121110",
            color: PAPER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 18,
            flexShrink: 0,
            fontFamily: "'Instrument Serif', Georgia, ui-serif, serif",
          }}
        >
          C
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Claude usage at {Math.round(fivePct)}%</span>
            <span style={{ fontSize: 11, opacity: 0.55 }}>now</span>
          </div>
          <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 4 }}>5-hour rolling window</div>
          <div style={{ fontSize: 13, lineHeight: 1.35, opacity: 0.88 }}>
            Your 5-hour Claude usage just hit {Math.round(fivePct)}%. Wrap up or wait for the window to reset.
          </div>
        </div>
      </div>

      {/* Dropdown menu (the one that opens when you click the title) */}
      <div
        style={{
          position: "absolute",
          top: 44,
          right: 200,
          width: 340,
          background: "rgba(245, 245, 247, 0.97)",
          color: "#111",
          borderRadius: 10,
          padding: "8px 0",
          boxShadow: "0 18px 50px -16px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.06) inset",
          border: "1px solid rgba(0,0,0,0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          fontSize: 13,
          fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
          opacity: dropdownProgress * 0.95,
          transform: `translateY(${(1 - dropdownProgress) * -10}px)`,
          zIndex: 7,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            padding: "8px 14px",
            color: BLINK_RED,
            fontWeight: 600,
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            marginBottom: 4,
          }}
        >
          Dismiss alarm
        </div>
        <MenuRow label="5-hour" value={`${fivePct.toFixed(1)}%`} sub="· resets in 2h" highlight />
        <MenuRow label="7-day all" value={`${sevenPct.toFixed(1)}%`} sub="· resets in 3d 14h" />
        <MenuRow label="7-day Sonnet" value="38.0%" />
        <MenuRow label="7-day Opus" value="55.0%" />
        <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "6px 0" }} />
        <MenuRow label="Extra" value="$3.40 / $40.00" sub="(8%)" />
        <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "6px 0" }} />
        <div style={{ padding: "4px 14px", color: "#555" }}>Open claude.ai/settings/usage</div>
        <div style={{ padding: "4px 14px", color: "#555" }}>Refresh now</div>
      </div>

      {/* Lower band: editorial caption */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 60,
          color: PAPER,
          zIndex: 6,
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 13,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: 0.65 * headlineP,
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: alarmActive ? BLINK_RED : "#5BB661",
              boxShadow: alarmActive && redPhase ? `0 0 14px ${BLINK_RED}` : "none",
            }}
          />
          <span>{alarmActive ? "Alarm firing · 5-hour window ≥ 95%" : "Monitoring · 5h " + fivePct.toFixed(0) + "%"}</span>
        </div>
        <div
          style={{
            fontFamily: "'Instrument Serif', Georgia, ui-serif, serif",
            fontSize: 60,
            lineHeight: 1.02,
            letterSpacing: "-0.015em",
            opacity: headlineP,
            transform: `translateY(${(1 - headlineP) * 16}px)`,
            maxWidth: 880,
          }}
        >
          The whole title <span style={{ color: BLINK_RED, fontStyle: "italic" }}>flashes red</span>.{" "}
          <span style={{ opacity: 0.7 }}>You finish your prompt.</span>
        </div>
        <div
          style={{
            fontSize: 17,
            lineHeight: 1.45,
            color: "rgba(244, 238, 228, 0.72)",
            opacity: subP,
            maxWidth: 720,
            marginTop: 14,
            fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
          }}
        >
          At 95% on the rolling 5-hour window, ClaudeMeter blinks the menu-bar title every 500ms and plays the Sosumi alert. Same numbers Anthropic enforces.
        </div>
      </div>

      {/* Footer tickers */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 22,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(244, 238, 228, 0.4)",
          display: "flex",
          justifyContent: "space-between",
          zIndex: 6,
        }}
      >
        <span>FRAME {String(frame).padStart(3, "0")} / {durationInFrames}</span>
        <span>BLINK 500ms · SOSUMI ×3</span>
        <span>{alarmActive ? "● ALARM FIRING" : "○ ARMED"}</span>
      </div>
    </AbsoluteFill>
  );
}

function pillStyle(bg: string | null): React.CSSProperties {
  return {
    background: bg ?? "transparent",
    color: bg ? "#FFFFFF" : "#F2F2F4",
    padding: bg ? "1px 7px" : "1px 0",
    borderRadius: bg ? 4 : 0,
    fontVariantNumeric: "tabular-nums",
    fontWeight: bg ? 600 : 500,
    transition: "background 0.04s, color 0.04s, padding 0.04s",
    minWidth: 38,
    textAlign: "center" as const,
  };
}

function MenuRow({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: "4px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        color: highlight ? BLINK_RED : "#222",
        fontVariantNumeric: "tabular-nums",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 12.5,
      }}
    >
      <span style={{ opacity: 0.85 }}>{label}</span>
      <span>
        <span style={{ fontWeight: highlight ? 700 : 500 }}>{value}</span>
        {sub && <span style={{ opacity: 0.6, marginLeft: 6 }}>{sub}</span>}
      </span>
    </div>
  );
}
