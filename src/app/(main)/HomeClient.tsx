"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { AlarmPlayer } from "@/components/AlarmPlayer";
import { NewsStrip } from "@seo/components";
import "./home.css";

const GITHUB_URL = "https://github.com/m13v/claude-meter";

const BREW_CMD = "brew install --cask m13v/tap/claude-meter";

type TabId = "all" | "quota" | "surface";

const comparison: Array<{
  cat: Exclude<TabId, "all">;
  feature: string;
  meter: { kind: "yes" | "no"; label: string };
  ccusage: { kind: "yes" | "no"; label: string };
}> = [
  {
    cat: "quota",
    feature: "Reads server plan quota (5h / weekly)",
    meter: { kind: "yes", label: "Yes" },
    ccusage: { kind: "no", label: "No" },
  },
  {
    cat: "quota",
    feature: "Reads local Claude Code token JSONL",
    meter: { kind: "no", label: "No (by design)" },
    ccusage: { kind: "yes", label: "Yes" },
  },
  {
    cat: "quota",
    feature: "Browser extension auto-auth",
    meter: { kind: "yes", label: "Yes" },
    ccusage: { kind: "no", label: "N/A" },
  },
  {
    cat: "surface",
    feature: "macOS menu bar UI",
    meter: { kind: "yes", label: "Yes" },
    ccusage: { kind: "no", label: "CLI only" },
  },
  {
    cat: "surface",
    feature: "License",
    meter: { kind: "yes", label: "MIT" },
    ccusage: { kind: "yes", label: "MIT" },
  },
];

// Verbatim strings Anthropic actually emits. Matches the on-the-wire
// rate_limit event labels and API error text. These are the phrases Pro/Max
// users type into Google when Claude cuts them off.
const stopMessages = [
  "Message limit reached",
  "API Error: Rate limit reached",
  "5-hour session limit reached",
  "Weekly limit reached",
  "Opus weekly limit reached",
  "Extra usage limit reached",
  "Your org is out of extra usage",
];

const quotes = [
  {
    text: "I typed 'test one two three' into Claude Code. That put me at 12%.",
    href: "https://news.ycombinator.com/item?id=47586176",
    linkLabel: "Hacker News ↗",
    meta: "#47586176",
  },
  {
    text: "Max 20x subscriber at $200/month. Getting rate-limited on every Claude surface with only 18% session used.",
    href: "https://github.com/anthropics/claude-code/issues/41212",
    linkLabel: "claude-code #41212 ↗",
    meta: "GitHub",
  },
  {
    text: "I used it a little Friday, a little Saturday, maybe 10 minutes Monday, and I hit the weekly limit already.",
    href: "https://github.com/anthropics/claude-code/issues/9424",
    linkLabel: "claude-code #9424 ↗",
    meta: "GitHub",
  },
];

function jitter(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function HomeClient() {
  const [session, setSession] = useState(62);
  const [weekly, setWeekly] = useState(41);
  const [extra, setExtra] = useState(3.4);
  const [tab, setTab] = useState<TabId>("all");
  const [mbVisible, setMbVisible] = useState(false);
  const [stopIdx, setStopIdx] = useState(0);
  const bounceGateRef = useRef<HTMLButtonElement | null>(null);

  const desktopRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Cycle through sample error messages in the hero headline
  useEffect(() => {
    const id = window.setInterval(() => {
      setStopIdx((i) => (i + 1) % stopMessages.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  // Animated gauges: tick every 2.4s
  useEffect(() => {
    const id = window.setInterval(() => {
      setSession((s) => {
        const next = s + jitter(0.4, 1.8);
        return next > 96 ? 18 : next;
      });
      setWeekly((w) => {
        const next = w + jitter(0.05, 0.35);
        return next > 98 ? 12 : next;
      });
      setExtra((e) => {
        const next = e + jitter(0.01, 0.12);
        return next > 12 ? 0.4 : next;
      });
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  // Scroll reveals
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".reveal-up"));
    els.forEach((el) => el.classList.remove("in"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Floating menu bar visibility: show once scrolled past hero, hide near footer
  useEffect(() => {
    const onScroll = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      const y = window.scrollY;
      const shouldShow =
        heroBottom < 100 &&
        y < document.body.scrollHeight - window.innerHeight - 200;
      setMbVisible(shouldShow);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-open the install gate when /api/download bounced us back here
  // because the install token was missing or expired. The shared
  // <InstallEmailGate emailOnly> rendered at the bottom of this page accepts
  // the email and sends a fresh install email; the user picks up from there
  // in their inbox.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("gate") !== "required") return;
    // Strip the query so a refresh doesn't re-pop the modal.
    const clean = window.location.pathname + window.location.hash;
    window.history.replaceState({}, "", clean);
    const id = window.setTimeout(() => {
      bounceGateRef.current?.click();
    }, 50);
    return () => window.clearTimeout(id);
  }, []);

  // Desktop tilt on mousemove
  useEffect(() => {
    const stage = stageRef.current;
    const desk = desktopRef.current;
    if (!stage || !desk) return;
    const onMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      desk.style.transform = `rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
    };
    const onLeave = () => {
      desk.style.transform = "";
    };
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", onLeave);
    return () => {
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const sessionPct = Math.round(session);
  const weeklyPct = Math.round(weekly);
  const extraFmt = `$${extra.toFixed(2)}`;
  const extraBarPct = Math.min(100, (extra / 5) * 100);
  const sessionWarn = sessionPct > 80;
  const weeklyWarn = weeklyPct > 80;

  return (
    <div className="home-root" ref={rootRef}>
      {/* NEWS STRIP — managed by run_top_posts_pipeline.sh; remove or
          repoint when the underlying news cycle expires. */}
      <NewsStrip
        href="/t/claude-opus-71-percent-weekly-monday-refactor"
        pillText="APR 27"
        lead="71% weekly quota burned by Monday on one Opus refactor."
        wedge="Local token estimators were off by 30%+. The metered billing split is why."
        ctaLabel="Read the breakdown"
        tone="amber"
        site="claude-meter"
        section="homepage-news-strip"
        datePublished="2026-04-27"
      />

      {/* PRO LAUNCH STRIP — points at /pro waitlist; teal tone for "soft
          announcement" so it reads as additive next to the amber breaking
          news strip above. */}
      <NewsStrip
        href="/pro"
        pillText="COMING SOON"
        lead="Claude Meter Pro: a background agent that saves your usage."
        wedge="Watches your Claude Code and Claude.ai calls, finds savings without losing quality, and (with permission) ships the fixes for you. Join the waitlist."
        ctaLabel="Join the waitlist"
        tone="teal"
        site="claude-meter"
        section="homepage-pro-strip"
      />

      {/* HERO */}
      <header className="hero" ref={heroRef}>
        <div className="wrap">
          <div className="hero-stack">
            <div className="hero-copy">
              <div
                className="eyebrow hero-eye reveal-up in"
                aria-label="Free, open-source macOS menu bar app showing live Claude Pro and Max plan usage."
              >
                <span className="dot" aria-hidden="true" />
                <span>macOS menu bar</span>
                <span className="sep" aria-hidden="true">·</span>
                <span>Live Claude Pro &amp; Max usage</span>
                <span className="sep" aria-hidden="true">·</span>
                <span>Free &amp; open source</span>
              </div>

              <h1 className="stop-heading reveal-up in d1" aria-label={`Did you get ${stopMessages[stopIdx]}? Now you see the 5-hour, weekly, and extra-usage numbers before the next one hits.`}>
                <span className="stop-prefix">Did you get?</span>
                <span className="stop-rotator" aria-hidden="true">
                  {stopMessages.map((m, i) => (
                    <span key={m} className={`stop-word${i === stopIdx ? " on" : ""}`}>{m}</span>
                  ))}
                </span>
                <span className="stop-resolve" aria-hidden="true">
                  Now you see the 5-hour, weekly, and extra-usage numbers before the next one hits.
                </span>
              </h1>

              <p className="lede reveal-up in d2">
                Your Claude Pro/Max plan usage, live next to the clock: the rolling 5-hour window, the weekly quota, and the pay-as-you-go balance. Watch the bar tick down instead of slamming into &ldquo;message limit reached&rdquo; mid-prompt.
              </p>

              <div
                className="hero-mb-preview reveal-up in d2"
                role="img"
                aria-label={`Menu bar preview: 5-hour window at ${sessionPct} percent, extra usage ${extraFmt}, refreshed every 60 seconds.`}
              >
                <span className="preview-tag">Menu bar, right now</span>
                <span className="preview-chip">
                  <span className="preview-dot" aria-hidden="true" />
                  <span className="preview-pct">{sessionPct}%</span>
                  <span className="preview-sep" aria-hidden="true">·</span>
                  <span className="preview-dollar">{extraFmt}</span>
                </span>
                <span className="preview-clock" aria-hidden="true">2:14</span>
                <span className="preview-foot" aria-hidden="true">→ refreshes every 60s</span>
              </div>

              <div className="hero-cta reveal-up in d3">
                <StripeCheckoutButton
                  section="hero"
                  renderTrigger={({ onClick, loading }) => (
                    <button
                      type="button"
                      onClick={onClick}
                      disabled={loading}
                      className="btn signal big"
                      style={{ opacity: loading ? 0.7 : undefined }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {loading ? "Loading…" : "Get the install link"}
                    </button>
                  )}
                />
              </div>

              <p className="cta-note reveal-up in d3">
                Free, open source, MIT licensed. No account or card: we email the .dmg plus one brew command, and your menu bar lights up within a minute.
              </p>

              <p className="hero-vs reveal-up in d3">
                <span className="dot" aria-hidden="true" />
                Most menu-bar Claude trackers estimate from your local Claude Code logs. ClaudeMeter reads the same server quota <code>claude.ai/settings/usage</code> shows, so the number <strong>matches to the integer</strong>, not a guess that reads 5% while Claude rate-limits you.
              </p>

              <div className="hero-trust reveal-up in d4">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trust-link"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.4.6.1.83-.26.83-.58 0-.28-.01-1.04-.01-2.04-3.34.72-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.24 1.83 1.24 1.07 1.84 2.81 1.31 3.5 1 .1-.77.42-1.31.76-1.62-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.69.83.57A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z"/>
                  </svg>
                  <span>View source on GitHub</span>
                </a>
                <span className="trust-sep" aria-hidden="true">·</span>
                <Link
                  href="/vs-ccusage"
                  className="trust-link muted"
                >
                  How is this different from ccusage?
                </Link>
              </div>

              <div className="meta-row reveal-up in d4">
                <span>Server-truth quota</span>
                <span>5h + 7-day windows</span>
                <span>60s refresh</span>
              </div>
            </div>

            {/* Widget mock — now full-width below the headline */}
            <div className="widget-stage reveal-up in d3" ref={stageRef}>
              <div className="desktop" ref={desktopRef}>
                <span className="blob b1" />
                <span className="blob b2" />

                <div className="finder">
                  <div className="ttl">
                    <span>~ / claude-code</span>
                  </div>
                  <div className="line m" />
                  <div className="line s" />
                  <div className="line m" />
                  <div className="line s" />
                </div>

                <div className="menubar">
                  <span className="apple">◉</span>
                  <span className="app">Claude Code</span>
                  <div className="items">
                    <span>File</span>
                    <span>Edit</span>
                    <span>View</span>
                    <span>Help</span>
                  </div>
                  <div className="right">
                    <div className="mb-claudemeter">
                      <span className="dot" />
                      <span className="pct">{sessionPct}%</span>
                      <span style={{ opacity: 0.5 }}>·</span>
                      <span>{extraFmt}</span>
                    </div>
                    <span>1:47</span>
                    <span>Mon Apr 20</span>
                  </div>
                </div>

                <div className="dropdown">
                  <div className="dd-head">
                    <span className="name">ClaudeMeter</span>
                    <span className="plan">MAX · 20x</span>
                  </div>

                  <div className="gauge">
                    <div className="g-row">
                      <span className="g-label">5-hour window</span>
                      <span className="g-value">{sessionPct}%</span>
                    </div>
                    <div className="bar">
                      <div
                        className={`fill${sessionWarn ? " warn" : ""}`}
                        style={{ width: `${sessionPct}%` }}
                      />
                    </div>
                    <div className="sub">
                      <span>resets in 1h 47m</span>
                      <span>→</span>
                    </div>
                  </div>

                  <div className="gauge">
                    <div className="g-row">
                      <span className="g-label">Weekly quota</span>
                      <span className="g-value">{weeklyPct}%</span>
                    </div>
                    <div className="bar">
                      <div
                        className={`fill${weeklyWarn ? " warn" : ""}`}
                        style={{ width: `${weeklyPct}%` }}
                      />
                    </div>
                    <div className="sub">
                      <span>resets Mon 09:00</span>
                      <span>3d 14h</span>
                    </div>
                  </div>

                  <div className="gauge dollars">
                    <div className="g-row">
                      <span className="g-label">Extra usage</span>
                      <span className="g-value">{extraFmt}</span>
                    </div>
                    <div className="bar">
                      <div className="fill warn" style={{ width: `${extraBarPct}%` }} />
                    </div>
                    <div className="sub">
                      <span>current billing cycle</span>
                      <span>Apr 1 – Apr 30</span>
                    </div>
                  </div>

                  <div className="dd-foot">
                    <span className="tick">refreshed 12s ago</span>
                    <span>auto · every 60s</span>
                  </div>
                </div>
              </div>
              <div className="hero-side-note">
                <span className="arrow">↑</span> Live preview · matches claude.ai/settings/usage to the integer
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="wrap">
          <div className="features-head">
            <div>
              <div className="section-eye reveal-up">
                <span className="num">01</span>
                <span>Built for</span>
                <span className="rule" />
              </div>
              <h2 className="section-title reveal-up d1">
                Built for the people Anthropic’s <em>rolling quota change</em> hit hardest.
              </h2>
            </div>
            <p className="section-sub reveal-up d2">
              Claude Max developers running agentic loops. Claude Pro heavy writers hitting the weekly wall midweek.
            </p>
          </div>

          <div className="feat-grid">
            <article className="feat reveal-up">
              <div className="viz">
                <div className="viz-clock" />
              </div>
              <div className="idx">01 / Session</div>
              <h3>Live rolling 5-hour window</h3>
              <p>
                Watch the Pro/Max session quota tick down as you prompt, so you know when to stop before Claude cuts you off mid-refactor.
              </p>
              <div className="reveal">→ updates every 60 seconds</div>
            </article>

            <article className="feat reveal-up d1">
              <div className="viz">
                <div className="viz-cal">
                  <span />
                  <span className="on" />
                  <span className="on" />
                  <span className="on" />
                  <span className="on" />
                  <span className="on" />
                  <span className="hl" />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="idx">02 / Weekly</div>
              <h3>Weekly quota and reset clock</h3>
              <p>
                See how much of the 7-day allowance you have left and exactly when it rolls over, not a vague &apos;try again later&apos; banner.
              </p>
              <div className="reveal">→ reset timestamp to the minute</div>
            </article>

            <article className="feat reveal-up d2">
              <div className="viz">
                <div className="viz-dollar">$</div>
              </div>
              <div className="idx">03 / Spillover</div>
              <h3>Extra-usage balance</h3>
              <p>
                Track your pay-as-you-go spillover in dollars, so the metered billing Anthropic rolled out in 2026 stops being a surprise.
              </p>
              <div className="reveal">→ current billing cycle total</div>
            </article>

            <article className="feat reveal-up">
              <div className="viz">
                <div className="viz-plug">
                  <span className="b" />
                  <span className="w" />
                  <span className="p" />
                </div>
              </div>
              <div className="idx">04 / Auth</div>
              <h3>Browser extension auto-auth</h3>
              <p>
                Install the Chrome/Arc/Brave extension and it forwards your existing claude.ai session. No DevTools, no manual cookie paste.
              </p>
              <div className="reveal">→ Chrome · Arc · Brave</div>
            </article>

            <article className="feat reveal-up d1">
              <div className="viz">
                <div className="viz-shield">
                  <svg viewBox="0 0 64 64">
                    <path
                      d="M32 6 L54 14 L54 30 C54 44 45 54 32 58 C19 54 10 44 10 30 L10 14 Z"
                      fill="none"
                      stroke="#121110"
                      strokeWidth="1.6"
                    />
                    <circle cx="32" cy="32" r="4" fill="#E8471C" />
                    <path
                      d="M32 26 L32 20 M32 44 L32 38 M20 32 L26 32 M38 32 L44 32"
                      stroke="#121110"
                      strokeWidth="1.4"
                    />
                  </svg>
                </div>
              </div>
              <div className="idx">05 / Privacy</div>
              <h3>Source on GitHub</h3>
              <p>
                Rust source on GitHub. usage-data network egress is claude.ai itself; anonymous health telemetry is opt-out.
              </p>
              <div className="reveal">→ auditable · written in Rust</div>
            </article>

            <article className="feat reveal-up d2">
              <div className="viz">
                <div className="viz-cli">
                  <span className="p">$</span> claude
                  <br />
                  62% · $3.40
                  <br />
                  <span className="p">$</span> _
                </div>
              </div>
              <div className="idx">06 / CLI</div>
              <h3>CLI included</h3>
              <p>
                Pipe the same numbers into shell prompts, tmux status lines, or scripts. Useful next to ccusage, which tracks something different.
              </p>
              <div className="reveal">→ tmux · starship · zsh prompt</div>
            </article>
          </div>
        </div>
      </section>

      {/* ALARM DEMO — Remotion-rendered 95% quota alarm */}
      <section className="alarm-section" id="alarm">
        <div className="wrap">
          <div className="alarm-head">
            <div>
              <div className="section-eye reveal-up">
                <span className="num">05</span>
                <span>The alarm</span>
                <span className="rule" />
              </div>
              <h2 className="section-title reveal-up d1">
                At <em>95%</em>, your menu bar starts <em>flashing red</em>.
              </h2>
            </div>
            <p className="section-sub reveal-up d2">
              The instant your 5-hour rolling window crosses 95%, the entire ClaudeMeter title in the menu bar blinks red at 500 ms, macOS fires a system notification, and Sosumi rings three times. You finish your prompt before the wall hits, not after.
            </p>
          </div>

          <div className="alarm-stage reveal-up d3">
            <AlarmPlayer />
          </div>

          <ul className="alarm-bullets reveal-up d4">
            <li>
              <span className="dot" /> Title flash cadence: <code>500 ms</code>, RGB <code>215,58,73</code>. Whole title flips together, not just the percent.
            </li>
            <li>
              <span className="dot" /> System notification: &ldquo;Claude usage at 95%&rdquo; with the 5-hour subtitle and a wrap-up prompt.
            </li>
            <li>
              <span className="dot" /> Sosumi <code>×3</code> via <code>afplay</code>, 120 ms gap. Fires once per 5-hour window; rolls over on reset.
            </li>
          </ul>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="compare" id="compare">
        <div className="wrap">
          <div className="compare-head">
            <div>
              <div className="section-eye reveal-up">
                <span className="num">02</span>
                <span>Comparison</span>
                <span className="rule" />
              </div>
              <h2 className="section-title reveal-up d1">
                ClaudeMeter <em>vs</em> ccusage.
              </h2>
            </div>
            <p className="section-sub reveal-up d2">
              They solve different problems. ccusage reads local Claude Code JSONL; ClaudeMeter reads the plan quota Anthropic actually enforces.
            </p>
          </div>

          <div className="compare-tabs reveal-up" role="tablist">
            <button
              type="button"
              className={tab === "all" ? "on" : ""}
              onClick={() => setTab("all")}
            >
              All features
            </button>
            <button
              type="button"
              className={tab === "quota" ? "on" : ""}
              onClick={() => setTab("quota")}
            >
              Quota &amp; auth
            </button>
            <button
              type="button"
              className={tab === "surface" ? "on" : ""}
              onClick={() => setTab("surface")}
            >
              Surface
            </button>
          </div>

          <table className="ctable reveal-up d1">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="us">ClaudeMeter</th>
                <th>ccusage</th>
              </tr>
            </thead>
            <tbody>
              {comparison
                .filter((r) => tab === "all" || r.cat === tab)
                .map((r) => (
                  <tr key={r.feature}>
                    <td className="feat-name">{r.feature}</td>
                    <td className={`mark ${r.meter.kind}`}>
                      <span className="ico">
                        <span className="circle">{r.meter.kind === "yes" ? "✓" : "—"}</span>
                        {r.meter.label}
                      </span>
                    </td>
                    <td className={`mark ${r.ccusage.kind}`}>
                      <span className="ico">
                        <span className="circle">{r.ccusage.kind === "yes" ? "✓" : "—"}</span>
                        {r.ccusage.label}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <Link href="/vs-ccusage" className="compare-link">
            <span>Read the full comparison</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* VOICES */}
      <section className="voices" id="voices">
        <div className="wrap">
          <div className="section-eye reveal-up">
            <span className="num">03</span>
            <span>Why people install it</span>
            <span className="rule" />
          </div>
          <h2 className="section-title reveal-up d1" style={{ maxWidth: "18ch" }}>
            From the threads where people <em>find out the hard way</em>.
          </h2>

          <div className="voices-grid">
            {quotes.map((q, i) => (
              <blockquote key={q.href} className={`quote reveal-up${i === 1 ? " d1" : i === 2 ? " d2" : ""}`}>
                <p>{q.text}</p>
                <div className="source">
                  <a href={q.href} target="_blank" rel="noopener noreferrer">
                    {q.linkLabel}
                  </a>
                  <span>{q.meta}</span>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta" id="install">
        <div className="wrap">
          <div className="section-eye reveal-up" style={{ justifyContent: "center" }}>
            <span className="rule" style={{ maxWidth: 80 }} />
            <span className="num">04</span>
            <span>Install</span>
            <span className="rule" style={{ maxWidth: 80 }} />
          </div>
          <h2 className="reveal-up d1">
            Stop getting surprised by <em>&ldquo;message limit reached&rdquo;</em>.
          </h2>
          <p className="reveal-up d2">
            ClaudeMeter reads the server-truth numbers Anthropic enforces for Pro and Max: the rolling 5-hour window, the weekly quota, and the extra-usage balance. No cookie pastes. No token guesswork.
          </p>
          <div className="cta-buttons reveal-up d3">
            <StripeCheckoutButton
              section="footer-cta"
              renderTrigger={({ onClick, loading }) => (
                <button
                  type="button"
                  onClick={onClick}
                  disabled={loading}
                  className="btn signal"
                  style={{ opacity: loading ? 0.7 : undefined }}
                >
                  {loading ? "Loading…" : "Get the install link"}
                </button>
              )}
            />
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn ghost"
            >
              View source on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Floating scroll-following menu bar */}
      <div className={`floating-mb${mbVisible ? " visible" : ""}`}>
        <span className="dot" />
        <span className="label">5h</span>
        <span className="val">{sessionPct}%</span>
        <span className="sep" />
        <span className="label">Week</span>
        <span className="val">{weeklyPct}%</span>
        <span className="sep" />
        <span className="val" style={{ color: "var(--signal)" }}>
          {extraFmt}
        </span>
      </div>

      {/* Hidden gate triggered programmatically when /api/download bounces a
          visitor back here with ?gate=required. The sentinel button is clicked
          by the useEffect above, which kicks off the Stripe checkout flow. */}
      <StripeCheckoutButton
        section="download-gate-bounce"
        triggerRef={bounceGateRef}
        renderTrigger={() => null}
      />
    </div>
  );
}
