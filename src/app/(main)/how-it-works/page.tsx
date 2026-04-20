import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How ClaudeMeter Reads Your Plan Usage",
  description:
    "How ClaudeMeter talks to claude.ai to read your Pro/Max plan quota, why the numbers match the usage page, and what data leaves your machine (nothing).",
};

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-primary-dark text-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">How it works</h1>
          <p className="text-lg text-gray-300">
            ClaudeMeter reads the same numbers{" "}
            <code className="bg-black/40 px-1 rounded font-mono text-sm">claude.ai/settings/usage</code> shows you, using your existing session, and renders them in the menu bar.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12 text-gray-800 leading-relaxed">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-4">The short version</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Browser extension observes that you are signed into claude.ai.</li>
              <li>The extension forwards the session token over a local IPC socket to the menu bar app.</li>
              <li>The menu bar app calls the internal usage endpoint Anthropic already serves to its own Settings page.</li>
              <li>Numbers render in the popover. Nothing leaves your machine except the request to claude.ai itself.</li>
            </ol>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-4">Why server-truth</h2>
            <p>
              Tools like{" "}
              <a className="text-cta hover:underline" href="https://github.com/ryoppippi/ccusage" target="_blank" rel="noopener noreferrer">
                ccusage
              </a>{" "}
              estimate Claude Code spend by reading <code className="bg-gray-100 px-1 rounded font-mono text-sm">~/.claude/projects</code> JSONL files. That is useful for token accounting, but those tokens are not the quota Anthropic enforces on your subscription. Anthropic decides when to cut you off based on a server-side rolling window and a weekly budget. The only place that exact number appears is the Settings → Usage page, which has no documented API.
            </p>
            <p className="mt-4">
              ClaudeMeter reads the exact same JSON payload the Settings page renders. That is why the percentages match, and it is why local-log-based tools sometimes report 5% used while Anthropic says you are rate-limited: they are measuring different things.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-4">What the browser extension does</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Detects a logged-in claude.ai tab.</li>
              <li>Reads the session cookie from the claude.ai origin (same-origin script, no cross-site access).</li>
              <li>Sends the cookie over a localhost-only WebSocket to the menu bar app.</li>
              <li>Does not send, store, or log anything to any other server.</li>
            </ul>
            <p className="mt-4">
              If you prefer not to install the extension, you can paste the session cookie manually from DevTools. The extension exists because that workflow is miserable and is the number-one complaint about competing tools.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-4">What the menu bar app does</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Polls the internal usage endpoint once per minute by default (configurable).</li>
              <li>Caches the last successful response so the popover stays responsive offline.</li>
              <li>Renders a small Rust/SwiftUI popover with the three numbers and their reset times.</li>
              <li>Exposes a CLI (<code className="bg-gray-100 px-1 rounded font-mono text-sm">claude-meter status</code>) that prints the same numbers as JSON, for tmux/Starship status lines.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-4">What leaves your machine</h2>
            <p>
              One HTTPS request per minute to claude.ai, using your own session cookie. That is it. There is no analytics beacon, no crash reporter, no telemetry. The source is on GitHub if you want to verify:
            </p>
            <p className="mt-3">
              <a className="text-cta hover:underline" href="https://github.com/m13v/claude-meter" target="_blank" rel="noopener noreferrer">
                github.com/m13v/claude-meter
              </a>
            </p>
          </div>

          <div className="rounded-lg bg-accent-light p-6">
            <h3 className="font-heading text-lg font-bold text-primary mb-2">Caveat</h3>
            <p className="text-gray-800">
              The usage endpoint is internal and undocumented. Anthropic can change or remove it at any time, in which case ClaudeMeter will show stale numbers until we ship a patch. Subscribe to the GitHub releases feed to hear about these patches early.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/install"
              className="inline-flex items-center rounded-md bg-cta px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-cta-dark transition-colors"
            >
              Install it
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center rounded-md border border-gray-300 px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-primary hover:bg-gray-50 transition-colors"
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
