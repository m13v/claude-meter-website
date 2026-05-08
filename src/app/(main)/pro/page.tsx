import type { Metadata } from "next";
import Link from "next/link";
import { WaitlistForm } from "./WaitlistForm";

const PAGE_URL = "https://claude-meter.com/pro";

export const metadata: Metadata = {
  title: "Claude Meter Pro: a background agent that saves your Claude usage",
  description:
    "Claude Meter Pro is a proactive AI agent that watches your Claude Code and Claude.ai sessions, finds places where you can spend less of the 5-hour and weekly quota without losing output quality, and (with your permission) implements the fixes for you. Join the waitlist.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Meter Pro, never hit 'Model token limit reached' again",
    description:
      "A background agent that watches what your Claude Code and Claude.ai sessions actually spend, suggests cuts that don't hurt quality, then ships the fixes for you. Join the waitlist.",
    url: PAGE_URL,
    type: "website",
  },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Claude Meter Pro",
  description:
    "A proactive background AI agent that watches Claude Code and Claude.ai sessions, finds usage savings on the 5-hour and weekly quotas, and applies the fixes with permission.",
  brand: { "@type": "Brand", name: "Claude Meter" },
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/PreOrder",
    url: PAGE_URL,
  },
};

const features = [
  {
    idx: "01",
    label: "Watcher",
    title: "Reads what your Claude sessions actually spend",
    body: "The agent watches your Claude Code calls and Claude.ai chats locally: which tools you call, how big the context windows get, where you re-read the same files, where Opus runs when Sonnet would have been enough. No code leaves your machine.",
  },
  {
    idx: "02",
    label: "Suggests",
    title: "Real-time, in-context savings suggestions",
    body: "When the agent spots a fix, e.g. trim a 40k-token system prompt to 6k, swap a model class, cache a recurring file read, batch tool calls, it surfaces the suggestion right in the menu bar with the projected percentage saved on your 5-hour and weekly buckets.",
  },
  {
    idx: "03",
    label: "Reports",
    title: "Weekly report on what you almost wasted",
    body: "Every Monday morning you get a one-screen breakdown: where the week's tokens actually went, the top 3 leaks, the savings the agent already booked, and the ones still waiting on your approval.",
  },
  {
    idx: "04",
    label: "Auto-fix",
    title: "Opt-in: it ships the fixes for you",
    body: "Flip a toggle and the agent stops asking permission for low-risk fixes (prompt trims, file de-duplication, model swaps inside the same family). High-risk fixes still wait for one-tap approval. Every change is reversible, every change is logged.",
  },
  {
    idx: "05",
    label: "Quality-safe",
    title: "Quality gate, not just a token counter",
    body: "Each suggested change ships with a tiny shadow eval: the agent re-runs your last few real prompts against the proposed setup and only ships the fix if output quality stays inside your tolerance band. Saving tokens that break your work isn't saving anything.",
  },
  {
    idx: "06",
    label: "Local-first",
    title: "Local-first, MIT core, no telemetry",
    body: "The agent runs on your machine alongside the existing Claude Meter menu bar app. Pro is a paid layer on top of the same MIT codebase. Your prompts, code, and reports stay local; only billing pings the Pro server.",
  },
];

const faqs = [
  {
    q: "How is this different from the free Claude Meter?",
    a: "Free Claude Meter is read-only: it shows you the server-truth 5-hour and weekly quota in your menu bar. Pro is the active layer on top: it watches what you actually spent on, suggests cuts, and (with your permission) implements them so the bar stops climbing as fast.",
  },
  {
    q: "Will it touch my code without asking?",
    a: "Not unless you flip the auto-fix toggle, and even then only for the categories of fix you whitelist. By default, every change is a one-tap approval. Every applied change is logged and reversible.",
  },
  {
    q: "How does the quality gate work?",
    a: "Before applying a fix, the agent re-runs your last N real prompts against both the current setup and the proposed setup, scores them with a held-out judge, and only ships the change if the quality delta is inside the tolerance you set. Saving 30% of tokens is useless if the answers got worse.",
  },
  {
    q: "When does it ship?",
    a: "We're inviting waitlist signups in batches over the next several weeks. Earliest invites go to people who already have the free menu bar app installed. Drop your email and we'll email when your slot opens.",
  },
  {
    q: "What does it cost?",
    a: "Pricing is finalized at invite time and locked in for waitlist signups. We're targeting a flat monthly rate that pays for itself the first week the agent prevents one weekly-cap wall.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function ProPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 80% 0%, rgba(20,184,166,0.18) 0%, transparent 60%), radial-gradient(50% 50% at 10% 100%, rgba(232,71,28,0.12) 0%, transparent 65%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-teal-300">
            <span className="size-1.5 rounded-full bg-teal-400" aria-hidden="true" />
            New &middot; Claude Meter Pro &middot; Waitlist open
          </div>

          <h1 className="mt-6 max-w-3xl font-heading text-4xl font-bold leading-tight md:text-6xl">
            A background agent that quietly cuts your Claude usage.
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-white/70">
            Claude Meter Pro is a proactive AI agent that runs alongside Claude Code and Claude.ai, watches what your sessions actually spend, finds the leaks, and patches them for you (with your permission) so you keep shipping after everyone else hits the wall.
          </p>

          <p className="mt-4 max-w-2xl text-xl font-semibold text-teal-300">
            Never hit &ldquo;Model token limit reached&rdquo; again.
          </p>

          <div className="mt-10 max-w-xl">
            <WaitlistForm variant="light" section="pro-hero" />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs uppercase tracking-wider text-white/50">
            <span className="inline-flex items-center gap-2">
              <span className="size-1 rounded-full bg-white/40" />
              Local-first, your code never leaves your machine
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-1 rounded-full bg-white/40" />
              Quality-gated, every fix runs a shadow eval
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-1 rounded-full bg-white/40" />
              Reversible, every change is logged
            </span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
              <span>How it works</span>
              <span className="h-px w-12 bg-rule" />
            </div>
            <h2 className="font-heading text-3xl font-bold text-ink md:text-4xl">
              Watch. Suggest. Verify. Ship.
            </h2>
            <p className="mt-3 text-ink-2">
              Pro is a four-step loop that runs in the background. You stay in flow, the agent does the cleanup.
            </p>
          </div>

          <ol className="grid gap-6 md:grid-cols-2">
            {features.map((f) => (
              <li
                key={f.idx}
                className="rounded-xl border border-rule bg-paper-2 p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-muted">
                  <span>{f.idx}</span>
                  <span className="h-px flex-1 bg-rule" />
                  <span>{f.label}</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{f.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WHAT IT CATCHES */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
              <span>What it catches</span>
              <span className="h-px w-12 bg-rule" />
            </div>
            <h2 className="font-heading text-3xl font-bold text-ink md:text-4xl">
              The leaks burning your weekly cap on a Tuesday.
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              { k: "Bloated system prompts", v: "40k-token preambles trimmed to the 5k that actually changes the answer." },
              { k: "Re-read context", v: "Same file dumped into 12 sub-agents in one session, deduplicated to one read." },
              { k: "Opus where Sonnet wins", v: "Per-task model class downgrade when the quality eval says nothing changes." },
              { k: "Tool-call fan-out", v: "10 sequential greps coalesced into one parallel call, two messages instead of ten." },
              { k: "Loop transcripts", v: "Long agent loops summarized into a 2k-token recap before the next step." },
              { k: "Prompt-cache misses", v: "Stable prefixes pinned so the cache hits instead of re-billing every turn." },
            ].map((row) => (
              <div
                key={row.k}
                className="flex items-start gap-4 rounded-lg border border-rule bg-paper-2 p-4"
              >
                <div
                  className="mt-1 size-2 shrink-0 rounded-full bg-signal"
                  aria-hidden="true"
                />
                <div>
                  <div className="font-heading text-sm font-bold text-ink">{row.k}</div>
                  <div className="mt-1 text-sm text-ink-2">{row.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
              <span>FAQ</span>
              <span className="h-px w-12 bg-rule" />
            </div>
            <h2 className="font-heading text-3xl font-bold text-ink md:text-4xl">
              Common questions before you join the waitlist.
            </h2>
          </div>

          <dl className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-xl border border-rule bg-white p-6">
                <dt className="font-heading text-base font-bold text-ink">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-2">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-[#0a0a0a] py-20 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(50% 50% at 50% 0%, rgba(20,184,166,0.22) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold md:text-5xl">
            Get on the waitlist.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Pro invites go out in batches starting with people who already run the free menu bar app. Drop your email and we'll send your slot when it opens.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <WaitlistForm variant="light" section="pro-final-cta" />
          </div>
          <p className="mt-6 text-xs text-white/50">
            Want the free menu bar app first?{" "}
            <Link href="/install" className="text-teal-300 underline-offset-4 hover:underline">
              Install Claude Meter
            </Link>
            {" "}or{" "}
            <Link href="/" className="text-teal-300 underline-offset-4 hover:underline">
              back to the homepage
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
