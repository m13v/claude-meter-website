"use client";

import { Player, type CallbackListener, type PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlarmDemo } from "@/remotion/AlarmDemo";

const FPS = 30;
const DURATION_FRAMES = 240; // 8 seconds
const ALARM_START_FRAME = 120;

// Approximates the Sosumi alert tone (the real app plays
// /System/Library/Sounds/Sosumi.aiff three times back-to-back with a 120ms
// gap between repeats; see claude-meter/src/bin/menubar.rs:979).
// Each "blip" is a short triangle-wave tone with a quick downward glissando.
function useSosumiSynth() {
  const ctxRef = useRef<AudioContext | null>(null);
  const playingRef = useRef(false);

  const ensure = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const Ctor =
      typeof window !== "undefined"
        ? (window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext)
        : null;
    if (!Ctor) return null;
    const ctx = new Ctor();
    ctxRef.current = ctx;
    return ctx;
  }, []);

  const playOnce = useCallback(() => {
    if (playingRef.current) return;
    const ctx = ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();
    playingRef.current = true;

    // Three blips at 120ms gap, matching ALARM_REPEATS = 3.
    const blipDur = 0.22;
    const gap = 0.12;
    const startBase = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const t0 = startBase + i * (blipDur + gap);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      // Sosumi is a short tone with a quick descent — sweep from 1320Hz to 880Hz.
      osc.frequency.setValueAtTime(1320, t0);
      osc.frequency.exponentialRampToValueAtTime(880, t0 + blipDur);

      // Quick attack, decay-style envelope.
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.22, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + blipDur);

      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + blipDur + 0.02);
    }

    const totalDur = 3 * (blipDur + gap);
    window.setTimeout(() => {
      playingRef.current = false;
    }, totalDur * 1000);
  }, [ensure]);

  return playOnce;
}

export function AlarmPlayer() {
  const playerRef = useRef<PlayerRef>(null);
  // Default: muted. Browsers allow muted autoplay, and the user asked to keep
  // the demo silent unless they explicitly enable sound.
  const [muted, setMuted] = useState(true);
  const playSosumi = useSosumiSynth();
  const lastFiredWindowRef = useRef<number | null>(null);

  // Fire the Sosumi synth once at the moment we enter an alarm window.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate: CallbackListener<"frameupdate"> = (event) => {
      const frame = event.detail.frame;
      // Re-arm on loop: when frame jumps backwards below the threshold.
      if (frame < ALARM_START_FRAME) {
        lastFiredWindowRef.current = null;
        return;
      }
      if (muted) return;
      // Window identifier: rounded chunk so we only fire once per loop.
      const windowId = Math.floor(frame / DURATION_FRAMES);
      if (lastFiredWindowRef.current === windowId) return;
      lastFiredWindowRef.current = windowId;
      playSosumi();
    };

    player.addEventListener("frameupdate", onFrameUpdate);
    return () => {
      player.removeEventListener("frameupdate", onFrameUpdate);
    };
  }, [muted, playSosumi]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      // If user just unmuted past the alarm threshold, fire immediately so
      // they hear it without waiting for the next loop.
      if (!next) {
        const player = playerRef.current;
        if (player) {
          const f = player.getCurrentFrame();
          if (f >= ALARM_START_FRAME) {
            // Skip the dedupe gate by clearing the last window stamp.
            lastFiredWindowRef.current = null;
          }
        }
      }
      return next;
    });
  }, []);

  return (
    <div className="alarm-player">
      <div className="alarm-frame">
        <Player
          ref={playerRef}
          component={AlarmDemo}
          durationInFrames={DURATION_FRAMES}
          fps={FPS}
          compositionWidth={1280}
          compositionHeight={720}
          loop
          autoPlay
          controls={false}
          style={{ width: "100%", height: "100%", borderRadius: 14 }}
        />
      </div>

      <div className="alarm-controls">
        <button
          type="button"
          onClick={toggleMute}
          className={`alarm-btn ${muted ? "primary" : "ghost"}`}
          aria-pressed={!muted}
        >
          {muted ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
              Unmute to hear the alarm
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              Sound on · click to mute
            </>
          )}
        </button>

        <span className="alarm-hint">
          Muted by default. Real app plays Sosumi <code>×3</code> with a 120 ms gap. Visuals loop on autoplay.
        </span>
      </div>
    </div>
  );
}
