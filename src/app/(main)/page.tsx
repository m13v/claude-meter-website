import Link from "next/link";
import type { Metadata } from "next";
import { TrackedCta } from "@/components/TrackedCta";

export const metadata: Metadata = {
  title: "Live Claude Pro/Max Usage in Your macOS Menu Bar",
  description:
    "ClaudeMeter shows your live Anthropic Claude Pro or Max plan usage, rolling 5-hour window and weekly quota, in the macOS menu bar. Free, MIT, no telemetry.",
};

const benefits = [
  {
    title: "Live rolling 5-hour window",
    body: "Watch the Pro/Max session quota tick down as you prompt, so you know when to stop before Claude cuts you off mid-refactor.",
  },
  {
    title: "Weekly quota and reset clock",
    body: "See how much of the 7-day allowance you have left and exactly when it rolls over, not a vague 'try again later' banner.",
  },
  {
    title: "Extra-usage balance",
    body: "Track your pay-as-you-go spillover in dollars, so the metered billing Anthropic rolled out in 2026 stops being a surprise.",
  },
  {
    title: "Browser extension auto-auth",
    body: "Install the Chrome/Arc/Brave extension and it forwards your existing claude.ai session. No DevTools, no manual cookie paste.",
  },
  {
    title: "No telemetry, MIT license",
    body: "Rust source on GitHub. The only network egress is claude.ai itself. No analytics, no accounts, no upsell.",
  },
  {
    title: "CLI included",
    body: "Pipe the same numbers into shell prompts, tmux status lines, or scripts. Useful next to ccusage, which tracks something different.",
  },
];

const comparison = [
  { feature: "Reads server plan quota (5h / weekly)", meter: "Yes", ccusage: "No" },
  { feature: "Reads local Claude Code token JSONL", meter: "No (by design)", ccusage: "Yes" },
  { feature: "Browser extension auto-auth", meter: "Yes", ccusage: "N/A" },
  { feature: "macOS menu bar UI", meter: "Yes", ccusage: "CLI only" },
  { feature: "License", meter: "MIT", ccusage: "MIT" },
];

const quotes = [
  {
    text: "I typed 'test one two three' into Claude Code. That put me at 12%.",
    source: "Hacker News",
    href: "https://news.ycombinator.com/item?id=47586176",
  },
  {
    text: "Max 20x subscriber at $200/month. Getting rate-limited on every Claude surface with only 18% session used.",
    source: "anthropics/claude-code #41212",
    href: "https://github.com/anthropics/claude-code/issues/41212",
  },
  {
    text: "I used it a little Friday, a little Saturday, maybe 10 minutes Monday, and I hit the weekly limit already.",
    source: "anthropics/claude-code #9424",
    href: "https://github.com/anthropics/claude-code/issues/9424",
  },
];

export default function Home() {
  return (
    <>
      <section className="bg-primary-dark text-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-light text-primary px-3 py-1 text-xs font-heading font-semibold uppercase tracking-wider mb-6">
                macOS 12+ · MIT · No telemetry
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Your Claude plan usage, live in the menu bar.
              </h1>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
                ClaudeMeter reads the server-truth numbers Anthropic enforces for Pro and Max, the rolling 5-hour window, the weekly quota, and the extra-usage balance. No cookie pastes. No token guesswork.
              </p>
              <div className="rounded-lg bg-black/40 border border-gray-700 px-4 py-3 font-mono text-sm text-accent mb-8 overflow-x-auto">
                brew install --cask m13v/tap/claude-meter
              </div>
              <div className="flex flex-wrap gap-4">
                <TrackedCta
                  href="/install"
                  location="home_hero"
                  label="install_primary"
                  className="inline-flex items-center rounded-md bg-cta px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-cta-dark transition-colors"
                >
                  Install ClaudeMeter
                </TrackedCta>
                <TrackedCta
                  href="https://github.com/m13v/claude-meter"
                  location="home_hero"
                  label="github_primary"
                  external
                  className="inline-flex items-center rounded-md border border-gray-600 px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
                >
                  Star on GitHub
                </TrackedCta>
              </div>
            </div>
            <div className="lg:justify-self-end">
              <div className="rounded-xl bg-black/60 border border-gray-700 p-6 shadow-2xl">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-700 mb-4">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-auto font-mono text-xs text-gray-400">menu bar</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">5-hour window</span>
                      <span className="font-mono text-accent">62%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: "62%" }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">resets in 1h 47m</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Weekly quota</span>
                      <span className="font-mono text-accent">41%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: "41%" }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">resets Mon 09:00</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Extra usage</span>
                      <span className="font-mono text-cta">$3.40</span>
                    </div>
                    <div className="text-xs text-gray-500">current billing cycle</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-heading text-3xl font-bold text-primary">5h</div>
              <div className="text-sm text-gray-600">rolling session window</div>
            </div>
            <div>
              <div className="font-heading text-3xl font-bold text-primary">7d</div>
              <div className="text-sm text-gray-600">weekly quota tracking</div>
            </div>
            <div>
              <div className="font-heading text-3xl font-bold text-primary">60s</div>
              <div className="text-sm text-gray-600">refresh cadence</div>
            </div>
            <div>
              <div className="font-heading text-3xl font-bold text-primary">$0</div>
              <div className="text-sm text-gray-600">free, MIT licensed</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
              Built for the people Anthropic&apos;s rolling quota change hit hardest.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Claude Max developers running agentic loops. Claude Pro heavy writers hitting the weekly wall midweek.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-lg bg-white border border-gray-200 p-6">
                <h3 className="font-heading text-lg font-bold text-primary mb-2">{b.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
              ClaudeMeter vs ccusage
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              They solve different problems. ccusage reads local Claude Code JSONL; ClaudeMeter reads the plan quota Anthropic actually enforces.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left font-heading text-sm font-semibold uppercase tracking-wider text-gray-700 px-4 py-3">Feature</th>
                  <th className="text-left font-heading text-sm font-semibold uppercase tracking-wider text-primary px-4 py-3">ClaudeMeter</th>
                  <th className="text-left font-heading text-sm font-semibold uppercase tracking-wider text-gray-700 px-4 py-3">ccusage</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.feature}</td>
                    <td className="px-4 py-3 text-sm text-primary font-medium">{row.meter}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.ccusage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-8">
            <Link href="/vs-ccusage" className="font-heading text-sm font-semibold uppercase tracking-wider text-cta hover:text-cta-dark">
              Read the full comparison →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary text-center mb-12">
            Why people install it.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quotes.map((q) => (
              <blockquote key={q.source} className="rounded-lg bg-white border-l-4 border-accent p-6">
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{q.text}&rdquo;</p>
                <a
                  href={q.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-heading uppercase tracking-wider text-gray-500 hover:text-primary"
                >
                  {q.source}
                </a>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary-dark text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Stop getting surprised by &ldquo;message limit reached&rdquo;.
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            One brew command. macOS 12+. The browser extension takes care of auth.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <TrackedCta
              href="/install"
              location="home_final"
              label="install_final"
              className="inline-flex items-center rounded-md bg-cta px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-cta-dark transition-colors"
            >
              Install ClaudeMeter
            </TrackedCta>
            <TrackedCta
              href="/how-it-works"
              location="home_final"
              label="how_it_works"
              className="inline-flex items-center rounded-md border border-gray-600 px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
            >
              How it works
            </TrackedCta>
          </div>
        </div>
      </section>
    </>
  );
}
