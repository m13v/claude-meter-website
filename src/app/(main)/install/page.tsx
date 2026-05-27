import Link from "next/link";
import type { Metadata } from "next";
import { TrackedCta } from "@/components/TrackedCta";
import { InstallCta } from "./InstallCta";

const GITHUB_URL = "https://github.com/m13v/claude-meter";

export const metadata: Metadata = {
  title: "Install ClaudeMeter on macOS — free, ~60s, brew + browser extension",
  description:
    "Drop your email, get the brew command and .dmg link in your inbox. Free, MIT, macOS 12+. Reads your existing claude.ai session, no cookie paste. Menu bar gauges for 5-hour, weekly, and extra usage in about a minute.",
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Install ClaudeMeter on macOS",
  description:
    "Install the ClaudeMeter macOS menu bar app and the browser extension so it can read your claude.ai plan usage.",
  totalTime: "PT2M",
  tool: [
    { "@type": "HowToTool", name: "Homebrew" },
    { "@type": "HowToTool", name: "Chromium-based browser (Chrome, Arc, Brave, or Edge)" },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Get the install email",
      text: "Drop your email on this page. We send the brew command and a tokenized .dmg installer link to your inbox. The command never appears on the page.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Install the menu bar app",
      text: "Run the brew command from the email in Terminal, or click the .dmg link. Either path drops a signed, notarized ClaudeMeter.app into /Applications.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Launch ClaudeMeter once",
      text: "Open ClaudeMeter from /Applications. The C| icon appears in the macOS menu bar. If Gatekeeper warns on first launch, open System Settings, Privacy and Security, and click Open Anyway.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Load the unpacked browser extension",
      text: "Clone the claude-meter repo with the git URL from the email. Open chrome://extensions (or arc://extensions, brave://extensions, edge://extensions), enable Developer mode, click Load unpacked, and select the extension folder from the cloned repo. Pin the icon so the popup is reachable.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Visit claude.ai once and verify",
      text: "Sign in to claude.ai in the same browser. Within a minute the menu bar popover lights up with your 5-hour, weekly, and extra-usage gauges. Open claude.ai/settings/usage and confirm the numbers match.",
    },
  ],
};

export default function InstallPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <section className="bg-primary-dark text-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-gray-300 mb-5">
            <span className="size-1.5 rounded-full bg-cta" aria-hidden="true" />
            Free &middot; macOS 12+ &middot; ~60 seconds
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Install ClaudeMeter
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mb-6">
            One email, one welcome message, three working gauges in your menu bar about a minute later. The extension forwards your existing claude.ai session, so no cookie paste.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mb-7 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-cta shrink-0" aria-hidden="true" />
              <span>One-line <code className="font-mono text-gray-100">brew install</code> command for the menu bar app and CLI</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-cta shrink-0" aria-hidden="true" />
              <span>Tokenized .dmg download link (30 days, any device)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-cta shrink-0" aria-hidden="true" />
              <span>Git URL for the unpacked Chrome / Arc / Brave / Edge extension</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-cta shrink-0" aria-hidden="true" />
              <span>A reply-to inbox if you hit a snag, goes straight to me</span>
            </div>
          </div>

          {/* What you see ~60s after install */}
          <div className="max-w-md rounded-lg border border-white/10 bg-white/[0.04] p-4 mb-7">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-400 mb-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-cta" aria-hidden="true" />
                Menu bar, ~60s after install
              </span>
              <span className="font-mono text-gray-300">C|</span>
            </div>
            <div className="space-y-2.5">
              <div>
                <div className="flex items-baseline justify-between text-xs text-gray-300">
                  <span>5-hour session</span>
                  <span className="font-mono text-gray-100">62%</span>
                </div>
                <div className="h-1 mt-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-cta" style={{ width: "62%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between text-xs text-gray-300">
                  <span>Weekly quota</span>
                  <span className="font-mono text-gray-100">41%</span>
                </div>
                <div className="h-1 mt-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-cta" style={{ width: "41%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between text-xs text-gray-300">
                  <span>Extra usage</span>
                  <span className="font-mono text-gray-100">$3.40</span>
                </div>
                <div className="h-1 mt-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-cta" style={{ width: "28%" }} />
                </div>
              </div>
            </div>
            <div className="mt-3 font-mono text-[10px] text-gray-500">
              refreshed 12s ago · auto, every 60s · matches claude.ai/settings/usage
            </div>
          </div>

          {/* Why you'd want this on your screen, in someone else's words */}
          <blockquote className="max-w-2xl border-l-2 border-cta/70 pl-4 mb-7 text-sm text-gray-300">
            <span className="block">&ldquo;I typed &lsquo;test one two three&rsquo; into Claude Code. That put me at 12%.&rdquo;</span>
            <cite className="not-italic block mt-1 text-xs text-gray-500">
              &mdash;{" "}
              <a
                href="https://news.ycombinator.com/item?id=47586176"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-gray-700 underline-offset-2 hover:text-gray-300"
              >
                Hacker News #47586176 &uarr;
              </a>
            </cite>
          </blockquote>

          <div className="flex flex-wrap gap-3 items-center">
            <InstallCta section="install-page-hero" variant="light" label="Email me the install link" />
            <TrackedCta
              href={GITHUB_URL}
              location="install_page_hero"
              label="view_source_github"
              external
              className="inline-flex items-center rounded-md border border-white/15 px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
            >
              View source on GitHub
            </TrackedCta>
          </div>
          <p className="text-xs text-gray-400 mt-4 max-w-2xl">
            Free. No payment, no credit card. One welcome email with the install link; you can unsubscribe from any future update with one click.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-14">
          {/* STEP 1 */}
          <div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Step 1</span>
              <h2 className="font-heading text-2xl font-bold text-primary">Install the menu bar app</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Open the welcome email and pick whichever route you prefer. The Homebrew route runs a single command in Terminal; if you do not have Homebrew, grab it from{" "}
              <a className="text-cta hover:underline" href="https://brew.sh" target="_blank" rel="noopener noreferrer">
                brew.sh
              </a>{" "}
              first. The .dmg route is a normal macOS installer, useful if you do not have Homebrew or want to install on a machine without a terminal session handy.
            </p>
            <p className="text-sm text-gray-600 mt-3">
              Either path drops a signed, notarized <strong>ClaudeMeter.app</strong> into <strong>/Applications</strong> and adds a <strong>claude-meter</strong> CLI alongside it. Already installed? The brew upgrade command (also in the email) pulls the latest patch.
            </p>
          </div>

          {/* STEP 2 */}
          <div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Step 2</span>
              <h2 className="font-heading text-2xl font-bold text-primary">Launch ClaudeMeter once</h2>
            </div>
            <p className="text-gray-700">
              Open <strong>ClaudeMeter</strong> from <strong>/Applications</strong>. A small <strong>C|</strong> icon appears in the menu bar. Until the browser extension is loaded the popover will show a single <strong>!</strong>, which means &ldquo;no session yet&rdquo;. That is expected.
            </p>
            <p className="text-sm text-gray-600 mt-3">
              First-launch Gatekeeper warning? Open <strong>System Settings, Privacy &amp; Security</strong>, scroll to the &ldquo;ClaudeMeter was blocked&rdquo; row, and click <strong>Open Anyway</strong>. macOS only asks once per signed build.
            </p>
          </div>

          {/* STEP 3 */}
          <div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Step 3</span>
              <h2 className="font-heading text-2xl font-bold text-primary">Load the browser extension</h2>
            </div>
            <p className="text-gray-700 mb-4">
              The extension is unpacked from source so you can audit every line. It runs only on <strong>claude.ai</strong>, reads your existing cookies, and POSTs the snapshot to the menu bar app over <strong>localhost:63762</strong>. Repeat the steps below for each Chromium browser you use with Claude.
            </p>
            <ol className="space-y-3 text-gray-700 list-decimal list-inside">
              <li>
                Clone the claude-meter repo using the git URL from the welcome email (only once, anywhere on disk).
              </li>
              <li>
                Open the extensions page in your browser:
                <ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-gray-700">
                  <li>Chrome: <strong>chrome://extensions</strong></li>
                  <li>Arc: <strong>arc://extensions</strong></li>
                  <li>Brave: <strong>brave://extensions</strong></li>
                  <li>Edge: <strong>edge://extensions</strong></li>
                </ul>
              </li>
              <li>
                Toggle <strong>Developer mode</strong> in the top-right corner. Three buttons (Load unpacked, Pack extension, Update) appear.
              </li>
              <li>
                Click <strong>Load unpacked</strong> and select the <strong>extension/</strong> folder inside the cloned repo.
              </li>
              <li>
                Pin the ClaudeMeter icon to the toolbar so the popup is reachable.
              </li>
            </ol>
            <p className="text-sm text-gray-600 mt-4">
              Why unpacked instead of a Web Store install? The Web Store path forces a review queue that lags behind Anthropic&rsquo;s endpoint changes. Loading from source means a quick git pull ships the patch the same day.
            </p>
          </div>

          {/* STEP 4 */}
          <div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Step 4</span>
              <h2 className="font-heading text-2xl font-bold text-primary">Visit claude.ai and verify</h2>
            </div>
            <p className="text-gray-700">
              Sign in to{" "}
              <a className="text-cta hover:underline" href="https://claude.ai" target="_blank" rel="noopener noreferrer">
                claude.ai
              </a>{" "}
              in the same browser. Within ~60 seconds the menu bar popover should fill in with three gauges: rolling 5-hour window, weekly quota, and extra-usage balance. Open{" "}
              <a className="text-cta hover:underline" href="https://claude.ai/settings/usage" target="_blank" rel="noopener noreferrer">
                claude.ai/settings/usage
              </a>{" "}
              and confirm the percentages match. They should be identical, because ClaudeMeter reads the same JSON the settings page renders.
            </p>
            <div className="mt-5 rounded-lg border border-rule bg-paper px-5 py-4 text-sm text-ink-2">
              <div className="font-medium text-ink mb-1">What &ldquo;working&rdquo; looks like</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Menu bar shows e.g. <strong>62% &middot; $3.40</strong> instead of <strong>!</strong></li>
                <li>Popover footer reads <strong>refreshed Ns ago, auto, every 60s</strong></li>
                <li>5-hour percentage matches claude.ai/settings/usage to the integer</li>
              </ul>
            </div>
          </div>

          {/* TROUBLESHOOTING */}
          <div className="border-t border-rule pt-10">
            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">If something breaks</span>
              <h2 className="font-heading text-2xl font-bold text-primary">Install troubleshooting</h2>
            </div>
            <div className="space-y-5">
              <div>
                <h3 className="font-heading text-base font-bold text-primary mb-1">
                  Menu bar still shows <strong>!</strong> after a minute
                </h3>
                <p className="text-gray-700 text-sm">
                  The extension has not posted a snapshot yet. Confirm the ClaudeMeter extension is enabled at chrome://extensions, open claude.ai in any tab, and wait one refresh tick (60s). The popup itself is optional; the work happens in the background page.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-primary mb-1">
                  &ldquo;ClaudeMeter cannot be opened because Apple cannot check it&rdquo;
                </h3>
                <p className="text-gray-700 text-sm">
                  Open <strong>System Settings, Privacy &amp; Security</strong>, scroll to the bottom, and click <strong>Open Anyway</strong> on the ClaudeMeter row. macOS will not ask again for this signed build.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-primary mb-1">
                  Extension installed, but numbers never appear
                </h3>
                <p className="text-gray-700 text-sm">
                  The localhost bridge runs on <strong>127.0.0.1:63762</strong>. If a strict firewall (Little Snitch, Lulu) blocks that port, allow ClaudeMeter once. Also check that the menu bar app is actually running, not just installed.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-primary mb-1">
                  Numbers do not match claude.ai/settings/usage
                </h3>
                <p className="text-gray-700 text-sm">
                  The default refresh interval is 60 seconds, so a one-tick lag is normal. If the gap is larger or the popover shows a <em>schema mismatch</em> warning, Anthropic shipped a payload change. Run the brew upgrade step from the welcome email and pull the extension repo to pick up the patch.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-primary mb-1">
                  Multiple browsers (Chrome and Arc), do I load it twice?
                </h3>
                <p className="text-gray-700 text-sm">
                  Yes, once per browser. The menu bar app identifies which browser sent each snapshot by the peer TCP socket&rsquo;s owning process, so each browser shows up correctly tagged in the popover.
                </p>
              </div>
            </div>
          </div>

          {/* ALTERNATIVE PATH */}
          <details className="rounded-lg border border-rule bg-paper-2 px-5 py-4">
            <summary className="cursor-pointer font-heading text-base font-bold text-primary">
              Alternative: extension-free install (Route B)
            </summary>
            <div className="mt-3 space-y-3 text-sm text-gray-700">
              <p>
                If you would rather not load a browser extension, the menu bar app can read Chrome&rsquo;s cookie database directly. On first launch macOS shows the prompt:
              </p>
              <blockquote className="border-l-2 border-rule pl-3 italic text-gray-600">
                ClaudeMeter wants to use the confidential information stored in &ldquo;Chrome Safe Storage&rdquo; in your keychain.
              </blockquote>
              <p>
                Click <strong>Always Allow</strong>. The app then locates the Chrome profile signed into claude.ai, decrypts its session cookie locally, and calls the same usage endpoint. Chromium-family browsers only. The keychain prompt is broad because Safe Storage is also Chrome&rsquo;s master key for saved passwords and cards, which is why most people stick with the extension route.
              </p>
            </div>
          </details>

          {/* CLI */}
          <div className="rounded-lg bg-accent-light p-6">
            <h3 className="font-heading text-lg font-bold text-primary mb-2">Bonus: drop the numbers into your shell</h3>
            <p className="text-gray-800 text-sm">
              The cask installs a CLI alongside the app. Pipe it into tmux, Starship, or a zsh prompt. The exact command line lives in the welcome email so you can copy it from your inbox once installed.
            </p>
          </div>

          {/* UNINSTALL */}
          <div className="rounded-lg border border-rule p-6">
            <h3 className="font-heading text-lg font-bold text-primary mb-2">Uninstall</h3>
            <p className="text-gray-800 text-sm">
              The welcome email also lists the brew uninstall command. Remove the extension from chrome://extensions to clean up the browser side. ClaudeMeter stores no state on disk beyond the cached session cookie it received from the extension; deleting the app drops it.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <InstallCta section="install-page-final" variant="dark" />
            <TrackedCta
              href={GITHUB_URL}
              location="install_page"
              label="view_source_github"
              external
              className="inline-flex items-center rounded-md border border-gray-300 px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-primary hover:bg-gray-50 transition-colors"
            >
              View source on GitHub
            </TrackedCta>
            <Link
              href="/faq"
              className="inline-flex items-center rounded-md border border-gray-300 px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-primary hover:bg-gray-50 transition-colors"
            >
              Full FAQ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
