import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClaudeMeter Privacy",
  description:
    "ClaudeMeter is local-first: usage data stays on device, with anonymous crash reporting and daily active telemetry that can be disabled.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-primary-dark text-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Privacy
          </h1>
          <p className="text-lg text-gray-300">
            ClaudeMeter is local-first. Your Claude usage data stays on your
            machine; anonymous health telemetry can be disabled.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-gray-800 leading-relaxed space-y-8">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-3">
              What the app sends
            </h2>
            <p>
              One HTTPS request per minute to{" "}
              <code className="bg-gray-100 px-1 rounded font-mono text-sm">
                claude.ai
              </code>
              , using your own session cookie, to the same internal usage
              endpoint the settings page uses. The response is a small JSON
              payload containing the plan-quota numbers; that response is not
              sent to us.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-3">
              Anonymous app telemetry
            </h2>
            <p>
              The app sends anonymous crash reports and one daily active event
              to{" "}
              <code className="bg-gray-100 px-1 rounded font-mono text-sm">
                claude-meter.com
              </code>
              . The daily event contains app version, platform, local date, and
              a random install ID that is hashed before it reaches PostHog. It
              does not include prompts, account emails, org IDs, hostnames,
              usage numbers, cookies, tokens, or API responses. Set{" "}
              <code className="bg-gray-100 px-1 rounded font-mono text-sm">
                CLAUDE_METER_NO_TELEMETRY=1
              </code>{" "}
              to disable all telemetry, or{" "}
              <code className="bg-gray-100 px-1 rounded font-mono text-sm">
                CLAUDE_METER_NO_SENTRY=1
              </code>{" "}
              to disable only crash reporting.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-3">
              What the app stores
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                The last session token received from the browser extension, held
                in macOS Keychain.
              </li>
              <li>
                Preferences (refresh interval, show/hide popover on launch),
                stored in{" "}
                <code className="bg-gray-100 px-1 rounded font-mono text-sm">
                  ~/Library/Preferences
                </code>
                .
              </li>
              <li>
                A short rolling cache of the last successful usage response, so
                the popover does not flash blank when offline.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-3">
              What the browser extension does
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Reads the claude.ai session cookie from the claude.ai origin
                only.
              </li>
              <li>
                Forwards it over a localhost-only WebSocket (port 58420) to the
                menu bar app.
              </li>
              <li>
                Does not read page content. Does not see your prompts. Does not
                send any network request to any other host.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-3">
              Analytics on this website
            </h2>
            <p>
              This marketing website uses product analytics to count page views
              and CTA clicks. No personally identifying information is
              intentionally captured.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-3">
              Verifying
            </h2>
            <p>
              The menu bar app and the browser extension are both open source
              and MIT licensed. You can read the source, rebuild from scratch,
              and inspect every network call on{" "}
              <a
                className="text-cta hover:underline"
                href="https://github.com/m13v/claude-meter"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/m13v/claude-meter
              </a>
              .
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-6">
            <p className="text-sm text-gray-600">
              Last updated 2026-05-29. Contact i@m13v.com with privacy
              questions.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
