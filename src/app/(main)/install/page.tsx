import Link from "next/link";
import type { Metadata } from "next";
import { TrackedCta } from "@/components/TrackedCta";
import { CopyCommand } from "./CopyCommand";

export const metadata: Metadata = {
  title: "Install ClaudeMeter on macOS (60s, brew + browser extension)",
  description:
    "Install ClaudeMeter in under a minute on macOS 12+. One brew cask, then load the unpacked extension in Chrome, Arc, Brave, or Edge. Reads your existing claude.ai session, no cookie paste.",
};

const BREW_CMD = "brew install --cask m13v/tap/claude-meter";
const CLONE_CMD = "git clone https://github.com/m13v/claude-meter";

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
      name: "Install the menu bar app via Homebrew",
      text: "In Terminal run: brew install --cask m13v/tap/claude-meter. The cask drops a signed, notarized ClaudeMeter.app into /Applications and a claude-meter CLI alongside it.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Launch ClaudeMeter once",
      text: "Open ClaudeMeter from /Applications. The C| icon appears in the macOS menu bar. If Gatekeeper warns on first launch, open System Settings → Privacy & Security and click Open Anyway.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Load the unpacked browser extension",
      text: "Clone the claude-meter repo with git clone https://github.com/m13v/claude-meter. Open chrome://extensions (or arc://extensions / brave://extensions / edge://extensions), enable Developer mode, click Load unpacked, and select the extension/ folder from the cloned repo. Pin the icon so the popup is reachable.",
    },
    {
      "@type": "HowToStep",
      position: 4,
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
            macOS 12+ · ~60 seconds · two steps
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Install ClaudeMeter
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            One brew cask for the menu bar app, then load the unpacked extension in Chrome, Arc, Brave, or Edge. The extension forwards your existing claude.ai session, so there is no cookie paste and no new login.
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
              ClaudeMeter ships as a Homebrew cask. If you do not have Homebrew, grab it from{" "}
              <a className="text-cta hover:underline" href="https://brew.sh" target="_blank" rel="noopener noreferrer">
                brew.sh
              </a>{" "}
              first. Then run:
            </p>
            <CopyCommand command={BREW_CMD} label="brew_install" />
            <p className="text-sm text-gray-600 mt-3">
              The cask pulls a signed, notarized build, drops <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">ClaudeMeter.app</code> into <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">/Applications</code>, and adds a <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">claude-meter</code> CLI alongside it. Already installed? <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">brew upgrade --cask claude-meter</code> pulls the latest patch.
            </p>
          </div>

          {/* STEP 2 */}
          <div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Step 2</span>
              <h2 className="font-heading text-2xl font-bold text-primary">Launch ClaudeMeter once</h2>
            </div>
            <p className="text-gray-700">
              Open <strong>ClaudeMeter</strong> from <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">/Applications</code>. A small{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">C|</code> icon appears in the menu bar. Until the browser extension is loaded the popover will show a single{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">!</code>, which means &ldquo;no session yet&rdquo;. That is expected.
            </p>
            <p className="text-sm text-gray-600 mt-3">
              First-launch Gatekeeper warning? Open <strong>System Settings → Privacy &amp; Security</strong>, scroll to the &ldquo;ClaudeMeter was blocked&rdquo; row, and click <strong>Open Anyway</strong>. macOS only asks once per signed build.
            </p>
          </div>

          {/* STEP 3 */}
          <div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Step 3</span>
              <h2 className="font-heading text-2xl font-bold text-primary">Load the browser extension</h2>
            </div>
            <p className="text-gray-700 mb-4">
              The extension is unpacked from source so you can audit every line. It runs only on{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">claude.ai</code>, reads your existing cookies, and POSTs the snapshot to the menu bar app over <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">localhost:63762</code>. Repeat the steps below for each Chromium browser you use with Claude.
            </p>
            <ol className="space-y-4 text-gray-700 list-decimal list-inside">
              <li>
                <span className="font-medium">Clone the repo</span> (only once, anywhere on disk):
                <div className="mt-2 ml-1">
                  <CopyCommand command={CLONE_CMD} label="git_clone" />
                </div>
              </li>
              <li>
                <span className="font-medium">Open the extensions page</span> in your browser:
                <ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-gray-700">
                  <li>Chrome: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">chrome://extensions</code></li>
                  <li>Arc: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">arc://extensions</code></li>
                  <li>Brave: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">brave://extensions</code></li>
                  <li>Edge: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">edge://extensions</code></li>
                </ul>
              </li>
              <li>
                <span className="font-medium">Toggle &ldquo;Developer mode&rdquo;</span> in the top-right corner. Three buttons (Load unpacked, Pack extension, Update) appear.
              </li>
              <li>
                <span className="font-medium">Click &ldquo;Load unpacked&rdquo;</span> and select the{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">extension/</code> folder inside the cloned repo.
              </li>
              <li>
                <span className="font-medium">Pin the ClaudeMeter icon</span> to the toolbar so the popup is reachable.
              </li>
            </ol>
            <p className="text-sm text-gray-600 mt-4">
              Why unpacked instead of a Web Store install? The Web Store path forces a review queue that lags behind Anthropic&rsquo;s endpoint changes. Loading from source means a <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">git pull</code> ships the patch the same day.
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
                <li>Menu bar shows e.g. <code className="bg-white px-1 py-0.5 rounded font-mono text-xs">62% · $3.40</code> instead of <code className="bg-white px-1 py-0.5 rounded font-mono text-xs">!</code></li>
                <li>Popover footer reads <code className="bg-white px-1 py-0.5 rounded font-mono text-xs">refreshed Ns ago · auto · every 60s</code></li>
                <li>5-hour percentage matches <code className="bg-white px-1 py-0.5 rounded font-mono text-xs">claude.ai/settings/usage</code> to the integer</li>
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
                  Menu bar still shows <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">!</code> after a minute
                </h3>
                <p className="text-gray-700 text-sm">
                  The extension has not posted a snapshot yet. Confirm the ClaudeMeter extension is enabled at <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">chrome://extensions</code>, open <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">claude.ai</code> in any tab, and wait one refresh tick (60s). The popup itself is optional; the work happens in the background page.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-primary mb-1">
                  &ldquo;ClaudeMeter cannot be opened because Apple cannot check it&rdquo;
                </h3>
                <p className="text-gray-700 text-sm">
                  Open <strong>System Settings → Privacy &amp; Security</strong>, scroll to the bottom, and click <strong>Open Anyway</strong> on the ClaudeMeter row. macOS will not ask again for this signed build.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-primary mb-1">
                  Extension installed, but numbers never appear
                </h3>
                <p className="text-gray-700 text-sm">
                  The localhost bridge runs on <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">127.0.0.1:63762</code>. If a strict firewall (Little Snitch, Lulu) blocks that port, allow ClaudeMeter once. Also check that the menu bar app is actually running, not just installed.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-primary mb-1">
                  Numbers do not match <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">claude.ai/settings/usage</code>
                </h3>
                <p className="text-gray-700 text-sm">
                  The default refresh interval is 60 seconds, so a one-tick lag is normal. If the gap is larger or the popover shows a <em>schema mismatch</em> warning, Anthropic shipped a payload change. Run <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">brew upgrade --cask claude-meter</code> and{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">git pull</code> the extension repo to pick up the patch.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-primary mb-1">
                  Multiple browsers (Chrome + Arc) — do I load it twice?
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
                Click <strong>Always Allow</strong>. The app then locates the Chrome profile signed into <code className="bg-white px-1 py-0.5 rounded font-mono text-xs">claude.ai</code>, decrypts its session cookie locally, and calls the same usage endpoint. Chromium-family browsers only. The keychain prompt is broad because Safe Storage is also Chrome&rsquo;s master key for saved passwords and cards, which is why most people stick with the extension route.
              </p>
            </div>
          </details>

          {/* CLI */}
          <div className="rounded-lg bg-accent-light p-6">
            <h3 className="font-heading text-lg font-bold text-primary mb-2">Bonus: drop the numbers into your shell</h3>
            <p className="text-gray-800 text-sm mb-3">
              The cask installs a CLI alongside the app. Pipe it into tmux, Starship, or a zsh prompt:
            </p>
            <CopyCommand
              command="/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json"
              label="cli_json"
            />
          </div>

          {/* UNINSTALL */}
          <div className="rounded-lg border border-rule p-6">
            <h3 className="font-heading text-lg font-bold text-primary mb-2">Uninstall</h3>
            <p className="text-gray-800 text-sm mb-3">
              <code className="bg-white px-1 py-0.5 rounded font-mono text-xs">brew uninstall --cask claude-meter</code>{" "}
              removes the app and the CLI. Remove the extension from <code className="bg-white px-1 py-0.5 rounded font-mono text-xs">chrome://extensions</code>. ClaudeMeter stores no state on disk beyond the cached session cookie it received from the extension; deleting the app drops it.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <TrackedCta
              href="/api/download"
              location="install_page"
              label="download_latest_dmg"
              download
              className="inline-flex items-center rounded-md bg-cta px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-cta-dark transition-colors"
            >
              Download latest DMG
            </TrackedCta>
            <TrackedCta
              href="https://github.com/m13v/claude-meter"
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
