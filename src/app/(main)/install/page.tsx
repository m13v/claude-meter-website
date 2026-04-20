import Link from "next/link";
import type { Metadata } from "next";
import { TrackedCta } from "@/components/TrackedCta";

export const metadata: Metadata = {
  title: "Install ClaudeMeter on macOS",
  description:
    "Install ClaudeMeter with one brew command on macOS 12+. Add the browser extension in Chrome, Arc, Brave, or Edge so it reads your existing claude.ai session.",
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Install ClaudeMeter",
  step: [
    {
      "@type": "HowToStep",
      name: "Install the menu bar app",
      text: "Run brew install --cask m13v/tap/claude-meter in Terminal.",
    },
    {
      "@type": "HowToStep",
      name: "Open ClaudeMeter",
      text: "Launch ClaudeMeter from Applications. The C| icon appears in the menu bar.",
    },
    {
      "@type": "HowToStep",
      name: "Install the browser extension",
      text: "Install the Chrome/Arc/Brave/Edge extension from the ClaudeMeter repo releases page and sign in to claude.ai as usual.",
    },
    {
      "@type": "HowToStep",
      name: "Verify numbers match",
      text: "Open claude.ai/settings/usage and compare the percentages shown there with the ClaudeMeter menu bar popover.",
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
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Install ClaudeMeter</h1>
          <p className="text-lg text-gray-300">
            One brew command. macOS 12+. Browser extension supplies the claude.ai session so there is no cookie paste.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-4">1. Install the menu bar app</h2>
            <p className="text-gray-700 mb-4">
              ClaudeMeter ships as a Homebrew cask. If you do not have Homebrew, grab it from{" "}
              <a className="text-cta hover:underline" href="https://brew.sh" target="_blank" rel="noopener noreferrer">
                brew.sh
              </a>{" "}
              first.
            </p>
            <div className="rounded-lg bg-primary-dark text-white px-4 py-3 font-mono text-sm overflow-x-auto">
              brew install --cask m13v/tap/claude-meter
            </div>
            <p className="text-sm text-gray-600 mt-3">
              The cask pulls a signed, notarized build. If Gatekeeper warns on first launch, open System Settings → Privacy & Security and allow ClaudeMeter.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-4">2. Launch and sign in</h2>
            <p className="text-gray-700">
              Open ClaudeMeter from Applications. The{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">C|</code> icon appears in the menu bar.
              It will prompt you to install the browser extension so it can read your existing claude.ai session.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-4">3. Install the browser extension</h2>
            <p className="text-gray-700 mb-4">
              The browser extension reuses whatever claude.ai session you are already signed into. Install it from the ClaudeMeter releases page, pin it to your toolbar, and visit claude.ai once. The menu bar popover should light up within a minute.
            </p>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li>Chrome, Arc, Brave, and Edge are supported today.</li>
              <li>Safari is not yet supported; Safari requires Full Disk Access for the shared cookie jar we need.</li>
              <li>You can still paste a session cookie manually if the extension is unavailable on your browser.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-4">4. Verify numbers match</h2>
            <p className="text-gray-700">
              Open{" "}
              <a className="text-cta hover:underline" href="https://claude.ai/settings/usage" target="_blank" rel="noopener noreferrer">
                claude.ai/settings/usage
              </a>{" "}
              in the same browser, compare the percentages to the ClaudeMeter popover, and confirm they match. ClaudeMeter refreshes once per minute by default.
            </p>
          </div>

          <div className="rounded-lg bg-accent-light p-6">
            <h3 className="font-heading text-lg font-bold text-primary mb-2">Uninstall</h3>
            <p className="text-gray-800 text-sm">
              <code className="bg-white px-1 py-0.5 rounded font-mono text-xs">brew uninstall --cask claude-meter</code>{" "}
              removes the app. Remove the browser extension from the extensions page. ClaudeMeter stores no state on disk beyond the cached session cookie it received from the extension.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <TrackedCta
              href="https://github.com/m13v/claude-meter/releases"
              location="install_page"
              label="releases"
              external
              className="inline-flex items-center rounded-md bg-cta px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-cta-dark transition-colors"
            >
              Download latest release
            </TrackedCta>
            <Link
              href="/faq"
              className="inline-flex items-center rounded-md border border-gray-300 px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-primary hover:bg-gray-50 transition-colors"
            >
              Troubleshooting FAQ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
