"use client";

import { Player, type CallbackListener, type PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlarmDemo } from "@/remotion/AlarmDemo";

const FPS = 30;
const DURATION_FRAMES = 240; // 8 seconds
const ALARM_START_FRAME = 150;

// Two-tone siren synthesized on the fly. We start it when playback reaches
// the alarm frame and stop it on pause/loop/unmount. No file needed.
function useSirenSynth() {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
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

  const start = useCallback(() => {
    if (playingRef.current) return;
    const ctx = ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";

    // Siren sweep: 880 ↔ 520 Hz, twice per second.
    osc.frequency.setValueAtTime(880, now);
    const cycle = 0.5;
    for (let i = 0; i < 20; i++) {
      const t = now + i * cycle;
      osc.frequency.linearRampToValueAtTime(520, t + cycle / 2);
      osc.frequency.linearRampToValueAtTime(880, t + cycle);
    }

    // Volume: a hair under "annoying" so it sells the alarm without
    // ear-stabbing anyone who forgot they had headphones on.
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    oscRef.current = osc;
    gainRef.current = gain;
    playingRef.current = true;
  }, [ensure]);

  const stop = useCallback(() => {
    if (!playingRef.current) return;
    const ctx = ctxRef.current;
    const osc = oscRef.current;
    const gain = gainRef.current;
    if (!ctx || !osc || !gain) return;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.05);
    osc.stop(now + 0.08);
    oscRef.current = null;
    gainRef.current = null;
    playingRef.current = false;
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { start, stop };
}

export function AlarmPlayer() {
  const playerRef = useRef<PlayerRef>(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const sirenOnRef = useRef(false);
  const { start: startSiren, stop: stopSiren } = useSirenSynth();

  // Drive siren on/off from player frame.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate: CallbackListener<"frameupdate"> = (event) => {
      const frame = event.detail.frame;
      const shouldRing = frame >= ALARM_START_FRAME && !muted && playing;
      if (shouldRing && !sirenOnRef.current) {
        startSiren();
        sirenOnRef.current = true;
      } else if (!shouldRing && sirenOnRef.current) {
        stopSiren();
        sirenOnRef.current = false;
      }
    };

    const onPlay: CallbackListener<"play"> = () => setPlaying(true);
    const onPause: CallbackListener<"pause"> = () => {
      setPlaying(false);
      if (sirenOnRef.current) {
        stopSiren();
        sirenOnRef.current = false;
      }
    };
    const onEnded: CallbackListener<"ended"> = () => {
      if (sirenOnRef.current) {
        stopSiren();
        sirenOnRef.current = false;
      }
    };

    player.addEventListener("frameupdate", onFrameUpdate);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ended", onEnded);

    return () => {
      player.removeEventListener("frameupdate", onFrameUpdate);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ended", onEnded);
      stopSiren();
    };
  }, [muted, playing, startSiren, stopSiren]);

  // If user toggles mute while siren is going, kill it immediately.
  useEffect(() => {
    if (muted && sirenOnRef.current) {
      stopSiren();
      sirenOnRef.current = false;
    }
  }, [muted, stopSiren]);

  const handlePlayClick = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isPlaying()) {
      p.pause();
    } else {
      p.play();
    }
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
          controls={false}
          autoPlay={false}
          style={{ width: "100%", height: "100%", borderRadius: 14 }}
        />
      </div>

      <div className="alarm-controls">
        <button type="button" onClick={handlePlayClick} className="alarm-btn primary">
          {playing ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </svg>
              Pause demo
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play demo with sound
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="alarm-btn ghost"
          aria-pressed={muted}
        >
          {muted ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
              Muted
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              Sound on
            </>
          )}
        </button>

        <span className="alarm-hint">
          Browsers block autoplay; the alarm only fires after you press play.
        </span>
      </div>
    </div>
  );
}
