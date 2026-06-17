import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  ComparisonTable,
  FlowDiagram,
  AnimatedBeam,
  StepTimeline,
  TerminalOutput,
  GradientText,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-meter-extension";
const PUBLISHED = "2026-06-16";

export const metadata: Metadata = {
  title:
    "The Claude Meter extension explained: a session bridge, not a toolbar gauge",
  description:
    "Search 'claude meter' and you get a Firefox addon, a Chrome Web Store gauge, two VS Code extensions, and a few same-named macOS apps. The ClaudeMeter browser extension is none of those. It is a session-forwarding bridge: it reads your logged-in claude.ai cookie and POSTs it to the macOS menu bar app over localhost:63762, so the app can read server-truth quota with no cookie paste. You load it unpacked from the m13v/claude-meter repo, not from the Chrome Web Store.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "The Claude Meter extension explained: a session bridge, not a toolbar gauge",
    description:
      "What the ClaudeMeter browser extension actually is, how it differs from the half-dozen same-named toolbar extensions, and how it forwards your claude.ai session to the menu bar app over localhost:63762.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "The Claude Meter extension", url: PAGE_URL },
];

const faqs = [
  {
    q: "Is the ClaudeMeter extension on the Chrome Web Store?",
    a: "No. You load it unpacked from source. Clone the github.com/m13v/claude-meter repo, open chrome://extensions (or arc://extensions, brave://extensions, edge://extensions), toggle Developer mode, click Load unpacked, and select the extension/ folder. The point of shipping it unpacked is that you can read every line before you run it. The half-dozen other extensions named 'Claude Meter' or 'Claude Usage Meter' are store listings; this one is not.",
  },
  {
    q: "What does the extension actually do? Does it show usage in the toolbar?",
    a: "No toolbar gauge. Its only job is to notice you are signed into claude.ai, read the session cookie from the claude.ai origin, and POST that snapshot to the macOS menu bar app over localhost:63762. The numbers render in the menu bar, not in the browser. That is the whole reason the extension exists: it removes the manual cookie paste so the native app can read your real plan quota.",
  },
  {
    q: "Why a separate menu bar app instead of just showing numbers in the browser?",
    a: "Because the surface that matters for a Claude Code user is the macOS menu bar, visible over a terminal and an editor, not a browser tab you may not have open. The extension is the thin bridge that gets your claude.ai session to that always-visible app. The app then polls the same internal usage endpoint claude.ai/settings/usage renders, so the percentages match what Anthropic enforces.",
  },
  {
    q: "Which browsers does the extension support?",
    a: "Chromium-family browsers: Chrome, Arc, Brave, and Edge. You load the same unpacked extension folder in each one you use with Claude. Safari is not supported. If you use two browsers with claude.ai, load it in both; whichever has a logged-in claude.ai tab will post the snapshot.",
  },
  {
    q: "Can I run the menu bar app without installing the extension at all?",
    a: "Yes. There is an extension-free route (Route B): the app reads Chrome's cookie database directly after you grant it access to Chrome Safe Storage in your keychain on first launch. Most people use the extension instead because the Safe Storage prompt is broad (it is also Chrome's master key for saved passwords and cards), whereas the extension reads only the claude.ai cookie.",
  },
  {
    q: "Is this the same as ccusage or the VS Code 'Claude Meter' extensions?",
    a: "No. ccusage and the local Claude Code monitors read JSONL token logs on your disk and estimate usage. The ClaudeMeter extension carries your claude.ai session to an app that reads the server-side rolling 5-hour window, the weekly quota, and the extra-usage dollar balance from Anthropic's own endpoint. Different data source. ccusage answers 'how many tokens did I burn locally'; ClaudeMeter answers 'how close am I to the wall Anthropic actually enforces'.",
  },
  {
    q: "What leaves my machine?",
    a: "The cookie hop is localhost-only: the extension talks to the app over localhost:63762, which never leaves your machine. After that, the only network egress is one HTTPS request per minute to claude.ai using your own session, plus optional anonymous health telemetry you can turn off. There is no ClaudeMeter server collecting your usage, because there is no ClaudeMeter server.",
  },
];

const disambiguationRows = [
  {
    feature: "Where you get it",
    competitor: "A browser or editor store listing",
    ours: "Loaded unpacked from the m13v/claude-meter repo",
  },
  {
    feature: "Where the numbers show",
    competitor: "Inside the browser toolbar or editor status bar",
    ours: "In the macOS menu bar, over your terminal and editor",
  },
  {
    feature: "What the extension does",
    competitor: "Renders a gauge in-page",
    ours: "Forwards your claude.ai session to a native app over localhost:63762",
  },
  {
    feature: "Auditability",
    competitor: "Packed store build",
    ours: "Unpacked source you read before loading",
  },
  {
    feature: "Quota source",
    competitor: "Varies; some scrape the page",
    ours: "The internal endpoint claude.ai/settings/usage renders",
  },
];

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline:
                "The Claude Meter extension explained: a session bridge, not a toolbar gauge",
              description:
                "The ClaudeMeter browser extension is a session-forwarding bridge for the macOS menu bar app. It reads your logged-in claude.ai cookie and POSTs it to the app over localhost:63762. Loaded unpacked from github.com/m13v/claude-meter, not the Chrome Web Store.",
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "ClaudeMeter",
              publisherUrl: "https://claude-meter.com",
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema(
              breadcrumbs.map((b) => ({ name: b.name, url: b.url }))
            )
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqPageSchema(faqs.map((f) => ({ q: f.q, a: f.a })))
          ),
        }}
      />

      <Breadcrumbs
        items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))}
        className="pt-8"
      />

      <header className="max-w-4xl mx-auto px-6 pt-10 pb-6">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-zinc-900 leading-tight">
          The Claude Meter extension is a{" "}
          <GradientText>session bridge</GradientText>, not a toolbar gauge
        </h1>
        <p className="mt-6 text-xl text-zinc-600 leading-relaxed">
          Type &ldquo;claude meter&rdquo; into any store and you get a Firefox
          addon, a Chrome listing, two VS Code extensions, and a couple of
          same-named macOS apps. They all paint a gauge somewhere you can see
          it. The ClaudeMeter browser extension does something different, and if
          you came here trying to figure out which one this is, that difference
          is the whole point.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="7 min read"
        className="pb-4"
      />

      {/* Direct answer */}
      <section className="max-w-4xl mx-auto px-6 my-8">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Direct answer · verified 2026-06-16
          </div>
          <p className="mt-3 text-lg text-zinc-800 leading-relaxed">
            The ClaudeMeter browser extension is a{" "}
            <strong>session-forwarding bridge</strong> for the ClaudeMeter macOS
            menu bar app. It reads the session cookie from your logged-in{" "}
            <strong>claude.ai</strong> tab and POSTs that snapshot to the app
            over <strong>localhost:63762</strong>, so the app can read your real
            plan quota with no manual cookie paste. You{" "}
            <strong>load it unpacked</strong> from the{" "}
            <a
              className="text-teal-700 underline"
              href="https://github.com/m13v/claude-meter"
            >
              m13v/claude-meter
            </a>{" "}
            repo (Chrome, Arc, Brave, or Edge), not from the Chrome Web Store.
            Free, MIT, macOS 12+.
          </p>
        </div>
      </section>

      {/* Why there are so many namesakes */}
      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="font-heading text-3xl font-bold text-zinc-900">
          Why this is confusing in the first place
        </h2>
        <p className="mt-4 text-lg text-zinc-700 leading-relaxed">
          Claude Pro and Max run on a rolling 5-hour window, a weekly quota, and
          metered extra-usage billing on top. The only place to see where you
          stand is claude.ai/settings/usage. That single source of frustration
          spawned a whole shelf of tools, and a lot of them grabbed the obvious
          name. So a search for the extension turns up a browser toolbar gauge,
          an editor status-bar percentage, and more than one unrelated app
          called the same thing.
        </p>
        <p className="mt-4 text-lg text-zinc-700 leading-relaxed">
          They are mostly variations on one idea: render a number inside the
          surface you are already looking at. The ClaudeMeter extension is built
          on a different idea. The number belongs in the macOS menu bar, where
          it sits over your terminal and your editor whether or not a browser
          tab is open. The extension is not the display. It is the thin piece
          that carries your already-logged-in session to the thing that is the
          display.
        </p>
      </section>

      {/* Disambiguation table */}
      <section className="my-12">
        <ComparisonTable
          heading="This extension vs. the toolbar namesakes"
          intro="Same name, different job. Here is what actually sets the ClaudeMeter extension apart from the store-listed gauges you'll find next to it in results."
          productName="ClaudeMeter extension"
          competitorName="Toolbar 'Claude Meter' extensions"
          rows={disambiguationRows}
          caveat="The toolbar extensions are fine tools; they just answer a different question and live in a different place. If you want the number in your browser, use one of those. If you want it in your macOS menu bar with no cookie paste, this is the one."
        />
      </section>

      {/* How the bridge works — anchor fact */}
      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="font-heading text-3xl font-bold text-zinc-900">
          The hop: claude.ai cookie to menu bar, over localhost:63762
        </h2>
        <p className="mt-4 text-lg text-zinc-700 leading-relaxed">
          Here is the exact path your session takes. The extension runs only on
          the claude.ai origin, reads the same-origin session cookie, and hands
          it to the menu bar app over a localhost-only socket on port{" "}
          <strong>63762</strong>. That number is not a detail you have to take
          on faith: the extension is unpacked source, so you can open it and read
          the POST target yourself before you ever load it.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6">
        <FlowDiagram
          title="What happens after you visit claude.ai"
          steps={[
            {
              label: "claude.ai tab",
              detail: "You are signed in; the extension detects the tab",
              icon: "browser",
            },
            {
              label: "Read cookie",
              detail: "Same-origin session cookie, claude.ai only",
              icon: "lock",
            },
            {
              label: "POST localhost:63762",
              detail: "Snapshot sent to the app, never leaves your machine",
              icon: "webhook",
            },
            {
              label: "App calls usage endpoint",
              detail: "Same internal endpoint claude.ai/settings/usage renders",
              icon: "server",
            },
            {
              label: "Menu bar lights up",
              detail: "5-hour, weekly, and extra-usage gauges, within a minute",
              icon: "check",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <p className="text-lg text-zinc-700 leading-relaxed">
          Once the app has a session, the extension is done until the cookie
          rotates. The app polls the internal usage endpoint once per minute by
          default (configurable from 30 seconds to 5 minutes) and paints the
          three gauges. Because it reads the server-truth endpoint rather than
          your local Claude Code token logs, the 5-hour percentage matches
          claude.ai/settings/usage to the integer.
        </p>
      </section>

      {/* What the app reads/shows */}
      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="font-heading text-3xl font-bold text-zinc-900">
          One session in, three gauges out
        </h2>
        <p className="mt-4 text-lg text-zinc-700 leading-relaxed">
          The extension forwards one thing: your session. The app turns it into
          the three numbers that actually decide whether your next Claude Code
          run finishes or hits a wall.
        </p>
        <div className="mt-6">
          <AnimatedBeam
            title="From forwarded session to live menu bar"
            from={[
              { label: "claude.ai session", sublabel: "via the extension" },
              { label: "Usage endpoint", sublabel: "what /settings/usage reads" },
            ]}
            hub={{ label: "Menu bar app", sublabel: "polls every 60s" }}
            to={[
              { label: "5-hour window", sublabel: "rolling session %" },
              { label: "Weekly quota", sublabel: "% used + reset time" },
              { label: "Extra usage", sublabel: "pay-as-you-go $ balance" },
            ]}
          />
        </div>
      </section>

      {/* Install */}
      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="font-heading text-3xl font-bold text-zinc-900">
          Loading the extension
        </h2>
        <p className="mt-4 text-lg text-zinc-700 leading-relaxed">
          There is no &ldquo;Add to Chrome&rdquo; button to click. You install
          the menu bar app with one brew command, then load the extension folder
          unpacked. Repeat the load step for each Chromium browser you use with
          Claude.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6">
        <StepTimeline
          title="Four steps, about a minute"
          steps={[
            {
              title: "Install the menu bar app",
              description:
                "Run the brew cask. A small C| icon appears in the menu bar. Until the extension is loaded it shows a single ! meaning 'no session yet', which is expected.",
            },
            {
              title: "Clone the repo and open your extensions page",
              description:
                "Clone github.com/m13v/claude-meter. Open chrome://extensions, arc://extensions, brave://extensions, or edge://extensions and toggle Developer mode in the top-right.",
            },
            {
              title: "Load unpacked",
              description:
                "Click Load unpacked and select the extension/ folder inside the cloned repo. Pin the icon so the popup is reachable, though the work happens in the background page.",
            },
            {
              title: "Visit claude.ai once and verify",
              description:
                "Sign in to claude.ai in that browser. Within a minute the menu bar popover fills with your 5-hour, weekly, and extra-usage gauges. Open claude.ai/settings/usage and confirm the 5-hour percentage matches.",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-10">
        <TerminalOutput
          title="install + verify"
          lines={[
            {
              text: "brew install --cask m13v/tap/claude-meter",
              type: "command",
            },
            { text: "Installing ClaudeMeter.app ...", type: "output" },
            { text: "ClaudeMeter is now in your menu bar.", type: "success" },
            {
              text: "# load extension/ unpacked, then open claude.ai once",
              type: "info",
            },
            {
              text: "extension -> localhost:63762 -> app",
              type: "output",
            },
            {
              text: "5h 41%  ·  week 63%  ·  extra $0.00  (matches /settings/usage)",
              type: "success",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <p className="text-lg text-zinc-700 leading-relaxed">
          If the gauges never appear, the usual cause is that no claude.ai tab
          has been open since you loaded the extension. Confirm the extension is
          enabled, open claude.ai in any tab, and wait one refresh tick. The
          full walkthrough, including the extension-free Route B and the
          uninstall steps, lives on the{" "}
          <a className="text-teal-600 underline" href="https://claude-meter.com/install">
            install page
          </a>
          , and the localhost socket and endpoint details are on{" "}
          <a className="text-teal-600 underline" href="https://claude-meter.com/how-it-works">
            how it works
          </a>
          .
        </p>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        heading="Not sure the extension is the right route for your setup?"
        description="Grab a few minutes and we'll walk through whether the extension, the cookie-database route, or the CLI fits how you run Claude."
      />

      <FaqSection items={faqs} />

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="font-heading text-2xl font-bold text-zinc-900">
          Related reading
        </h2>
        <ul className="mt-4 space-y-2 text-lg">
          <li>
            <a
              className="text-teal-600 underline"
              href="https://claude-meter.com/t/claude-code-usage-menu-bar"
            >
              Claude Code usage in the macOS menu bar
            </a>
          </li>
          <li>
            <a className="text-teal-600 underline" href="https://claude-meter.com/vs-ccusage">
              ClaudeMeter vs ccusage: server quota vs local tokens
            </a>
          </li>
          <li>
            <a className="text-teal-600 underline" href="https://claude-meter.com/how-it-works">
              How ClaudeMeter reads your plan quota
            </a>
          </li>
        </ul>
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Questions about the extension or the menu bar app? Book a few minutes."
      />
    </article>
  );
}
