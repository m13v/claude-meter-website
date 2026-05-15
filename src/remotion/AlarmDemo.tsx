"use client";

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const PAPER = "#F4EEE4";
const INK = "#121110";
const INK_2 = "#2A2824";
const MUTED = "#6B655C";
const SIGNAL = "#E8471C";
const RULE = "#D9D1C1";
const AMBER = "#D9A441";
const GREEN = "#3F6B3A";

function meterColor(pct: number) {
  if (pct < 70) return GREEN;
  if (pct < 90) return AMBER;
  return SIGNAL;
}

export function AlarmDemo() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Timeline (at 30fps):
  // 0-60   (0–2s):   chill, meter climbing 60 → 78
  // 60-120 (2–4s):   warning, 78 → 92
  // 120-150 (4–5s):  crossing the 95% line
  // 150-240 (5–8s):  ALARM state, flashing
  const alarmStart = 150;
  const alarmActive = frame >= alarmStart;

  // Meter percentage curve
  const pct = (() => {
    if (frame < 60) return interpolate(frame, [0, 60], [60, 78]);
    if (frame < 120) return interpolate(frame, [60, 120], [78, 92]);
    if (frame < alarmStart) return interpolate(frame, [120, alarmStart], [92, 96]);
    // After alarm: subtle wiggle around 95–97
    const wiggle = Math.sin(((frame - alarmStart) / fps) * Math.PI * 3) * 0.6;
    return 95.8 + wiggle;
  })();

  const flash = alarmActive ? (Math.floor((frame - alarmStart) / 6) % 2 === 0 ? 1 : 0.55) : 0;
  const bgFlash = alarmActive ? flash * 0.18 : 0;

  // Headline reveal
  const headlineProgress = spring({ frame: frame - 5, fps, config: { damping: 20 } });
  const subProgress = spring({ frame: frame - 18, fps, config: { damping: 20 } });

  // Alarm "ring" pulses
  const ringScale = alarmActive
    ? 1 + ((frame - alarmStart) % 18) / 18
    : 1;
  const ringOpacity = alarmActive ? Math.max(0, 1 - ((frame - alarmStart) % 18) / 18) : 0;

  // Notification banner slides in at alarmStart
  const notifProgress = alarmActive
    ? spring({ frame: frame - alarmStart, fps, config: { damping: 14, stiffness: 120 } })
    : 0;

  const meterColorNow = meterColor(pct);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER,
        fontFamily: "Inter, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif",
        color: INK,
        overflow: "hidden",
      }}
    >
      {/* Background paper grain */}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.025) 1.6px, transparent 1.6px)",
          backgroundSize: "5px 5px",
          opacity: 0.55,
        }}
      />

      {/* Red flash overlay during alarm */}
      <AbsoluteFill
        style={{
          backgroundColor: SIGNAL,
          opacity: bgFlash,
          mixBlendMode: "multiply",
        }}
      />

      {/* Eyebrow */}
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 80,
          fontSize: 18,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: MUTED,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          opacity: headlineProgress,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: alarmActive ? SIGNAL : GREEN,
            boxShadow: alarmActive ? `0 0 12px ${SIGNAL}` : "none",
          }}
        />
        <span>05 · Alarm</span>
        <span style={{ opacity: 0.45 }}>·</span>
        <span>Never miss 95%</span>
      </div>

      {/* Headline */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 80,
          right: 80,
          fontFamily: "'Instrument Serif', Georgia, ui-serif, serif",
          fontSize: 72,
          lineHeight: 0.98,
          letterSpacing: "-0.015em",
          color: INK,
          opacity: headlineProgress,
          transform: `translateY(${(1 - headlineProgress) * 20}px)`,
        }}
      >
        At <span style={{ color: SIGNAL, fontStyle: "italic" }}>95%</span>, your Mac{" "}
        <span style={{ fontStyle: "italic" }}>screams</span>.
      </div>

      {/* Subhead */}
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 80,
          right: 80,
          fontSize: 22,
          lineHeight: 1.45,
          color: INK_2,
          opacity: subProgress,
          maxWidth: 760,
        }}
      >
        A loud, visible alert when your Claude rolling quota crosses the
        red line, so you finish the thing you&apos;re working on instead
        of getting cut off mid-refactor.
      </div>

      {/* Mac-style window */}
      <div
        style={{
          position: "absolute",
          top: 340,
          left: 80,
          width: 1120,
          minHeight: 320,
          borderRadius: 18,
          border: `1px solid ${RULE}`,
          background: "#FBF7EF",
          boxShadow: alarmActive
            ? `0 30px 80px -20px rgba(232,71,28,${0.25 + flash * 0.3})`
            : "0 24px 60px -20px rgba(0,0,0,0.25)",
          overflow: "hidden",
          transition: "box-shadow 0.1s",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 18px",
            borderBottom: `1px solid ${RULE}`,
            background: "#F1EADD",
            fontSize: 14,
            color: MUTED,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#E2554B", marginRight: 8 }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#E3B23C", marginRight: 8 }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#5BB661", marginRight: 14 }} />
          <span>~ / claude-code</span>
        </div>

        {/* Window content */}
        <div style={{ padding: 28, display: "flex", gap: 40, alignItems: "flex-start" }}>
          {/* Left: meter */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 14,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: MUTED,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                marginBottom: 14,
              }}
            >
              5-hour rolling window
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 56, fontWeight: 600, color: meterColorNow, letterSpacing: "-0.02em" }}>
                {Math.round(pct)}%
              </span>
              <span style={{ fontSize: 16, color: MUTED }}>
                {alarmActive ? "alarm threshold crossed" : `resets in ${Math.max(1, 90 - frame)}m`}
              </span>
            </div>
            {/* Bar */}
            <div
              style={{
                position: "relative",
                height: 22,
                background: "#EDE6D8",
                borderRadius: 999,
                overflow: "hidden",
                border: `1px solid ${RULE}`,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${GREEN} 0%, ${AMBER} 60%, ${SIGNAL} 95%)`,
                  transition: "width 0.05s linear",
                }}
              />
              {/* 95% marker */}
              <div
                style={{
                  position: "absolute",
                  left: "95%",
                  top: -6,
                  bottom: -6,
                  width: 2,
                  background: INK,
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "calc(95% + 6px)",
                  top: -22,
                  fontSize: 11,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  color: INK,
                  letterSpacing: "0.08em",
                }}
              >
                ALARM ↓
              </div>
            </div>

            <div style={{ marginTop: 22, display: "flex", gap: 26 }}>
              <div>
                <div style={{ fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Weekly
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, color: INK }}>
                  {Math.round(interpolate(frame, [0, durationInFrames], [62, 64]))}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Extra
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, color: SIGNAL }}>$3.40</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Plan
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, color: INK }}>MAX 20x</div>
              </div>
            </div>
          </div>

          {/* Right: alarm bell */}
          <div
            style={{
              position: "relative",
              width: 220,
              height: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {/* Pulsing rings */}
            {alarmActive && (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: `2px solid ${SIGNAL}`,
                    transform: `scale(${ringScale})`,
                    opacity: ringOpacity,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 16,
                    borderRadius: "50%",
                    border: `2px solid ${SIGNAL}`,
                    transform: `scale(${ringScale * 0.92})`,
                    opacity: ringOpacity * 0.7,
                  }}
                />
              </>
            )}

            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: alarmActive ? SIGNAL : "#E5DCC9",
                color: alarmActive ? PAPER : MUTED,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: alarmActive
                  ? `0 0 ${40 + flash * 40}px ${SIGNAL}`
                  : "inset 0 2px 8px rgba(0,0,0,0.05)",
                transform: alarmActive
                  ? `scale(${1 + Math.sin(((frame - alarmStart) / fps) * 14) * 0.04})`
                  : "scale(1)",
              }}
            >
              {/* Bell icon */}
              <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Notification banner (top right) */}
      <div
        style={{
          position: "absolute",
          top: 56,
          right: 80,
          width: 320,
          padding: "16px 18px",
          borderRadius: 14,
          background: alarmActive ? INK : "transparent",
          color: PAPER,
          opacity: notifProgress,
          transform: `translateX(${(1 - notifProgress) * 60}px)`,
          boxShadow: alarmActive ? `0 12px 30px -8px rgba(0,0,0,0.4)` : "none",
          border: alarmActive ? `1px solid ${SIGNAL}` : "none",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          pointerEvents: "none",
        }}
      >
        {alarmActive && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: SIGNAL, opacity: flash }} />
              ClaudeMeter · now
            </div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>Claude quota at 95%</div>
            <div style={{ fontSize: 14, opacity: 0.78, lineHeight: 1.35 }}>
              Wrap up this prompt. ~10 messages of Pro/Max session left.
            </div>
          </>
        )}
      </div>

      {/* Footer caption */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 40,
          fontSize: 14,
          color: MUTED,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          letterSpacing: "0.06em",
          display: "flex",
          justifyContent: "space-between",
          opacity: subProgress,
        }}
      >
        <span>FRAME {String(frame).padStart(3, "0")} / {durationInFrames}</span>
        <span>{alarmActive ? "● ALARM TRIGGERED" : "○ MONITORING"}</span>
        <span>SOUND + VISUAL</span>
      </div>
    </AbsoluteFill>
  );
}
