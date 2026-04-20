import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClaudeMeter vs ccusage",
  description:
    "ClaudeMeter reads your Claude plan quota from claude.ai (server-truth). ccusage reads local Claude Code JSONL token logs. Different data; many people run both.",
};

const rows = [
  { feature: "What it measures", meter: "Plan quota Anthropic enforces (5h + weekly + extra)", ccusage: "Tokens consumed by Claude Code sessions" },
  { feature: "Data source", meter: "claude.ai internal usage endpoint", ccusage: "Local ~/.claude/projects JSONL files" },
  { feature: "Surface", meter: "macOS menu bar popover + CLI", ccusage: "CLI only" },
  { feature: "Auth model", meter: "Reuses claude.ai browser session via extension", ccusage: "None (reads local files)" },
  { feature: "Refresh cadence", meter: "Once per minute", ccusage: "On-demand" },
  { feature: "Knows when Anthropic will cut you off", meter: "Yes", ccusage: "No (local tokens are an estimate)" },
  { feature: "Knows how many tokens Claude Code burned", meter: "No (by design)", ccusage: "Yes" },
  { feature: "Windows / Linux support", meter: "macOS only today", ccusage: "Cross-platform" },
  { feature: "License", meter: "MIT", ccusage: "MIT" },
  { feature: "Cost", meter: "Free", ccusage: "Free" },
];

export default function VsCcusagePage() {
  return (
    <>
      <section className="bg-primary-dark text-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">ClaudeMeter vs ccusage</h1>
          <p className="text-lg text-gray-300">
            They are not rivals. They measure two different things. If you are a Claude Code power user you probably want both.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="rounded-lg border border-gray-200 p-6">
              <h2 className="font-heading text-xl font-bold text-primary mb-3">ClaudeMeter</h2>
              <p className="text-gray-700 mb-4">
                Reads the server-truth plan quota from claude.ai. Answers the question: &ldquo;When is Anthropic going to cut me off, and how much weekly budget do I have left?&rdquo;
              </p>
              <p className="text-sm text-gray-500 font-mono">brew install --cask m13v/tap/claude-meter</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-6">
              <h2 className="font-heading text-xl font-bold text-primary mb-3">ccusage</h2>
              <p className="text-gray-700 mb-4">
                Reads local Claude Code JSONL files to estimate token spend per session, per day, per project. Answers the question: &ldquo;How many tokens did that refactor just cost me?&rdquo;
              </p>
              <p className="text-sm text-gray-500 font-mono">npx ccusage</p>
            </div>
          </div>

          <div className="overflow-x-auto mb-12">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left font-heading text-sm font-semibold uppercase tracking-wider text-gray-700 px-4 py-3">Feature</th>
                  <th className="text-left font-heading text-sm font-semibold uppercase tracking-wider text-primary px-4 py-3">ClaudeMeter</th>
                  <th className="text-left font-heading text-sm font-semibold uppercase tracking-wider text-gray-700 px-4 py-3">ccusage</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium align-top">{r.feature}</td>
                    <td className="px-4 py-3 text-sm text-primary align-top">{r.meter}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 align-top">{r.ccusage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="prose max-w-none text-gray-800 leading-relaxed space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-bold text-primary mb-3">When to use each</h2>
              <p>
                <strong>Use ClaudeMeter when:</strong> you are hitting &ldquo;message limit reached&rdquo; banners, your Claude Code run got killed halfway through, or you want to know whether you can safely start a multi-hour agentic loop without getting rate-limited mid-run.
              </p>
              <p className="mt-3">
                <strong>Use ccusage when:</strong> you want to know which of your Claude Code sessions ate the most tokens, whether a particular prompt style is more expensive, or how your spend trends over time by project.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-primary mb-3">Why the numbers do not match</h2>
              <p>
                People regularly report ccusage showing &ldquo;5% used&rdquo; while Anthropic says they are rate-limited. That is expected: ccusage estimates tokens from local files, and Anthropic enforces a plan quota server-side using cost and rate heuristics we do not have visibility into. ClaudeMeter exists to bridge that gap.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-8">
            <Link
              href="/install"
              className="inline-flex items-center rounded-md bg-cta px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-cta-dark transition-colors"
            >
              Install ClaudeMeter
            </Link>
            <a
              href="https://github.com/ryoppippi/ccusage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-gray-300 px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-primary hover:bg-gray-50 transition-colors"
            >
              See ccusage on GitHub
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
