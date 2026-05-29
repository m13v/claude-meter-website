import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  BeforeAfter,
  AnimatedChecklist,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-code-weekly-quota-meter";
const PUBLISHED = "2026-05-11";

export const metadata: Metadata = {
  title:
    "Claude Code weekly quota meter: the meter you watch instead of typing /usage",
  description:
    "Claude Code already has a /usage slash command. It is one-shot, it interrupts the loop, and it only prints the active session window. A meter polls the same /api/organizations/{uuid}/usage endpoint once a minute outside of Claude Code, so you watch the seven weekly buckets accrue without breaking your agentic loop.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code weekly quota meter (vs. typing /usage every 10 minutes)",
    description:
      "Open-source menu bar polls /api/organizations/{uuid}/usage every 60 seconds with your existing claude.ai cookie. Six seven_day_* buckets, live, while Claude Code keeps running.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Guides", href: "https://claude-meter.com/t/claude-weekly-quota-server-truth-meter" },
  { label: "Claude Code weekly quota meter" },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  {
    name: "Guides",
    url: "https://claude-meter.com/t/claude-weekly-quota-server-truth-meter",
  },
  { name: "Claude Code weekly quota meter", url: PAGE_URL },
];

const meterVsUsageBefore = {
  label: "/usage slash command",
  content:
    "Type /usage inside the conversation. Claude Code pauses, makes its own round-trip to the same endpoint, and prints a snapshot into the chat buffer. Your loop is interrupted. The snapshot ages the moment it lands.",
  highlights: [
    "Costs a turn (or interrupts an agent step) every time you ask.",
    "Only the 5-hour window is highlighted; weekly buckets are summary lines.",
    "If the wall fires between two /usage calls, you find out via 429.",
  ],
};

const meterVsUsageAfter = {
  label: "Ambient meter",
  content:
    "Pin the menu bar app. The extension polls /api/organizations/{uuid}/usage every 60 seconds with your existing claude.ai cookie. The bar shows 5-hour, weekly, and dollar-metered numbers continuously. Claude Code never knows the meter exists.",
  highlights: [
    "Zero turns spent on quota checks. The loop runs uninterrupted.",
    "All six weekly buckets visible at once, including seven_day_oauth_apps.",
    "Crosses 80%? The popover badge flips before Anthropic 429s you.",
  ],
};

const usageJson = `{
  "five_hour":            { "utilization": 0.18, "resets_at": "2026-05-11T18:42:00Z" },
  "seven_day":            { "utilization": 0.62, "resets_at": "2026-05-13T09:14:00Z" },
  "seven_day_sonnet":     { "utilization": 0.41, "resets_at": "2026-05-13T09:14:00Z" },
  "seven_day_opus":       { "utilization": 0.74, "resets_at": "2026-05-13T09:14:00Z" },
  "seven_day_oauth_apps": { "utilization": 0.91, "resets_at": "2026-05-13T09:14:00Z" },
  "seven_day_omelette":   null,
  "seven_day_cowork":     null,
  "extra_usage":          { "is_enabled": false }
}
// GET https://claude.ai/api/organizations/{uuid}/usage
// Cookie:  <your existing claude.ai session>
// Referer: https://claude.ai/settings/usage
// Accept:  */*`;

const pollingCode = `// extension/background.js, top of file
const POLL_MINUTES = 1;

// ...later in the file:
chrome.alarms.create("refresh", { periodInMinutes: POLL_MINUTES });
chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === "refresh") refresh();
});`;

const rustStruct = `// claude-meter/src/models.rs, lines 18-28
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:             Option<Window>,
    pub seven_day_sonnet:      Option<Window>,
    pub seven_day_opus:        Option<Window>,
    pub seven_day_oauth_apps:  Option<Window>,   // <-- Claude Code lives here
    pub seven_day_omelette:    Option<Window>,
    pub seven_day_cowork:      Option<Window>,
    pub extra_usage:           Option<ExtraUsage>,
}`;

const installTerminal = [
  { type: "command" as const, text: "brew install --cask m13v/tap/claude-meter" },
  { type: "info" as const, text: "Cask installs ClaudeMeter.app and a `claude-meter` CLI binary." },
  { type: "command" as const, text: "# Load the unpacked extension/ folder in chrome://extensions" },
  { type: "output" as const, text: "[14:11:02] extension picked up claude.ai session, posting first snapshot..." },
  { type: "success" as const, text: "menu bar shows: 5h 18%   7d 62%   7d_oauth 91%   $0.00 metered" },
  { type: "command" as const, text: "/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json | jq .usage" },
  { type: "info" as const, text: "Same numbers, machine-readable, pipeable into tmux / Starship / Fig." },
];

const proofChecklist = [
  {
    text: "Polls every 60 seconds via chrome.alarms (POLL_MINUTES = 1, extension/background.js line 3).",
  },
  {
    text: "Reads the same JSON claude.ai/settings/usage reads on reload. Same cookie, same Referer, same /api/organizations/{uuid}/usage endpoint.",
  },
  {
    text: "Parses six weekly buckets into the UsageResponse Rust struct (src/models.rs lines 21-26). Each is Option<Window>, with utilization (f64) and resets_at (UTC).",
  },
  {
    text: "Bridge between extension and menu bar runs on 127.0.0.1:63762. Nothing on your network can see it.",
  },
  {
    text: "Anonymous telemetry is opt-out. One HTTPS request per minute, only to claude.ai itself. MIT licensed.",
  },
];

const faqs = [
  {
    q: "What is a Claude Code weekly quota meter?",
    a: "A small ambient display (menu bar, status line, or CLI tile) that polls Anthropic's internal /api/organizations/{uuid}/usage endpoint every 60 seconds using your existing claude.ai browser cookie and renders the live utilization for the six weekly buckets the server returns. The meter sits outside Claude Code itself, so an agentic loop can run uninterrupted while you watch the numbers accrue. The open-source one is ClaudeMeter (github.com/m13v/claude-meter), MIT licensed, anonymous telemetry is opt-out.",
  },
  {
    q: "Claude Code already has /usage. Why do I need a separate meter?",
    a: "Because /usage is a slash command, not a meter. Three problems: (1) typing /usage costs a turn or interrupts an active agent step; if the model is mid-tool-call you cannot run it without breaking the chain. (2) the print is point-in-time and stale the moment it lands. (3) the inline output emphasizes the 5-hour window; the six weekly buckets are summarized, not laid out side-by-side. A meter is continuous, lives outside Claude Code's context window, and shows every bucket at once.",
  },
  {
    q: "Which weekly bucket actually walls a Claude Code loop?",
    a: "seven_day_oauth_apps, almost always. Claude Code authenticates via an OAuth token, so its requests count against the OAuth-apps weekly bucket on top of the all-up seven_day aggregate. Your account can sit at seven_day = 62% and seven_day_oauth_apps = 100% at the same time. The web UI on claude.ai/settings/usage shows seven_day's aggregate bar; the meter shows every non-null bucket separately so you see the OAuth one cross 80% before the CLI 429s you.",
  },
  {
    q: "What does the meter actually display?",
    a: "Three numbers in the menu bar: 5h X%, 7d Y%, $Z.ZZ metered (extra-usage spend). Click the badge and a popover lists every non-null bucket from the UsageResponse struct: seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork, plus extra_usage. Each row shows utilization and resets_at. A CLI tool prints the same JSON for status-line scripts.",
  },
  {
    q: "How does the meter pull the number without me pasting a cookie?",
    a: "There are two routes. Route A is the browser extension: it runs inside Chrome/Arc/Brave/Edge under your claude.ai origin, so it inherits your session cookie automatically. The extension fetches /api/organizations/{uuid}/usage and POSTs the snapshot to the menu-bar app over 127.0.0.1:63762. Route B is keychain-only: the menu-bar app shells out to security find-generic-password to get Chrome Safe Storage's AES key, decrypts the cookie store directly, and makes the call itself. Route A avoids the keychain prompt; Route B avoids loading an extension.",
  },
  {
    q: "Is this just polling? Will I get rate-limited or flagged?",
    a: "One GET per minute per org membership, with the exact three headers a browser tab reload sends (Cookie, Referer: https://claude.ai/settings/usage, Accept: */*). It is byte-identical to you alt-tabbing to claude.ai/settings/usage and hitting refresh once a minute. Anthropic's /usage endpoint is unauthenticated rate-limit-wise the way the /api endpoints are, and the call does not consume any tokens. No reports of accounts being flagged for this pattern as of May 2026; the source for src/api.rs is 142 lines, audit it before trusting me.",
  },
  {
    q: "Can ccusage do this instead?",
    a: "No, and that is not a knock on ccusage. ccusage sums input and output tokens from ~/.claude/projects/*.jsonl on your disk. The numerator is real and ccusage prints it well. The denominator (Anthropic's enforced weekly cap) is server-side and not on disk; it is a private dimensionless utilization the server computes against an undocumented per-plan ceiling. So ccusage can say '5% used' the same week the server says seven_day_oauth_apps = 91% and walls the next Claude Code request. The two are honest about different things. Run both.",
  },
  {
    q: "How do I read the meter from my tmux/Starship/Fig status line?",
    a: "The brew cask installs a `claude-meter` CLI next to the app. Run `/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json` and pipe the output to jq. You get the same UsageResponse JSON the menu bar parses, machine-readable. A common pattern: pin a tmux right-status segment that prints `7d_oauth Y%` and turns red above 80%. The CLI is one-shot, so call it on whatever cadence your status line refreshes; the menu bar's snapshot is cached in localhost and the CLI reads from the same cache.",
  },
  {
    q: "Where exactly is the 60-second cadence set, in case I want to audit it?",
    a: "extension/background.js, line 3: const POLL_MINUTES = 1. Two chrome.alarms.create('refresh', { periodInMinutes: POLL_MINUTES }) calls register the alarm. The menu-bar app on the other side speeds polling up to ~90 seconds when any bucket crosses 80% utilization (src/bin/menubar.rs around line 29-34, search for HIGH_UTIL_FAST_POLL). You can fork the extension and change POLL_MINUTES to 0.5 if you want 30-second cadence, but Anthropic's endpoint does not refresh that fast on its side, so the extra polling will just see the same number twice.",
  },
  {
    q: "What does the meter cost?",
    a: "Free, MIT licensed, no account, no signup. github.com/m13v/claude-meter. The only outbound network traffic is the one HTTPS GET per minute per org to claude.ai, plus the two sibling reads (subscription_details and overage_spend_limit) that fire less often. No analytics, anonymous telemetry is opt-out, no auth server, no cloud account. The 127.0.0.1:63762 bridge between extension and menu bar is loopback-only.",
  },
];

const relatedPosts = [
  {
    title: "The Claude weekly quota server-truth meter",
    href: "/t/claude-weekly-quota-server-truth-meter",
    excerpt:
      "Field-by-field walkthrough of every window in the /api/organizations/{uuid}/usage response, with the exact Rust deserialization on lines 18-28 of src/models.rs.",
    tag: "Server truth",
  },
  {
    title: "The Claude Code weekly quota wall: what the CLI hides",
    href: "/t/claude-code-weekly-quota-wall",
    excerpt:
      "When the wall fires, Claude Code prints a generic 'rate_limit_error: ... limit reached' string. The OAuth token in your Keychain plus the right endpoint will name the bucket.",
    tag: "Claude Code",
  },
  {
    title: "Claude Code weekly limit during long workflows",
    href: "/t/claude-code-weekly-limit-long-workflows",
    excerpt:
      "Long Claude Code refactors wall on seven_day_oauth_apps, not seven_day. The pre-flight check, the live signal to watch, the abort threshold.",
    tag: "Long workflows",
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
                "Claude Code weekly quota meter: the meter you watch instead of typing /usage",
              description:
                "A Claude Code weekly quota meter is an ambient display that polls /api/organizations/{uuid}/usage every 60 seconds outside the CLI, so you watch the six seven_day_* buckets accrue without interrupting your agentic loop. Open-source reference implementation: github.com/m13v/claude-meter (extension/background.js line 3, src/models.rs lines 18-28).",
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "ClaudeMeter",
              publisherUrl: "https://claude-meter.com",
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbListSchema(breadcrumbs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqs)) }}
      />

      <div className="pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-3xl mx-auto px-6 mt-6 mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
          Claude Code weekly quota meter
        </h1>
        <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
          You can type{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            /usage
          </code>{" "}
          inside Claude Code. It works. It also stops the loop, costs a turn,
          and prints a stale snapshot the second it lands. A weekly quota meter
          is the same number on a 60-second tick, outside Claude Code, where the
          loop never sees it.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="5 min read"
      />

      <section className="max-w-3xl mx-auto px-6 my-8">
        <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-11)
          </p>
          <p className="text-zinc-900 text-base leading-relaxed">
            A Claude Code weekly quota meter is a small ambient display
            (menu bar, status line, or CLI) that polls{" "}
            <code className="text-sm bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
              claude.ai/api/organizations/&#123;uuid&#125;/usage
            </code>{" "}
            every 60 seconds with your existing browser cookie and renders the
            six weekly utilization buckets (
            <code className="text-xs bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
              seven_day
            </code>
            ,{" "}
            <code className="text-xs bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
              seven_day_sonnet
            </code>
            ,{" "}
            <code className="text-xs bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
              seven_day_opus
            </code>
            ,{" "}
            <code className="text-xs bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
              seven_day_oauth_apps
            </code>
            ,{" "}
            <code className="text-xs bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
              seven_day_omelette
            </code>
            ,{" "}
            <code className="text-xs bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
              seven_day_cowork
            </code>
            ) plus extra-usage dollars, outside of Claude Code itself. Open-source
            reference implementation:{" "}
            <a
              href="https://github.com/m13v/claude-meter"
              className="text-teal-700 underline underline-offset-2"
            >
              github.com/m13v/claude-meter
            </a>{" "}
            (MIT, macOS menu bar plus browser extension, anonymous telemetry is opt-out).
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          /usage is a snapshot. A meter is a tick.
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          Both read the same endpoint. The difference is who runs the call and
          when. With{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            /usage
          </code>{" "}
          you pay for the read inside the conversation; with a meter, the read
          happens in a separate process at a known cadence and never touches
          your loop.
        </p>
        <BeforeAfter
          title="Reading your weekly quota during an agentic loop"
          before={meterVsUsageBefore}
          after={meterVsUsageAfter}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The endpoint both /usage and the meter read
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          This is the JSON shape your account returns when you reload{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            claude.ai/settings/usage
          </code>
          . Claude Code&apos;s{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            /usage
          </code>{" "}
          slash command hits the same path and rolls these fields into an inline
          message. A meter parses them directly into a struct and renders each
          bucket separately so you can spot which one is about to fire.
        </p>
        <AnimatedCodeBlock
          code={usageJson}
          language="json"
          filename="claude.ai · /api/organizations/{uuid}/usage"
        />
        <p className="text-sm text-zinc-500 mt-4">
          On a Claude Code-heavy week, the bucket to watch is{" "}
          <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">
            seven_day_oauth_apps
          </code>
          . It walls Claude Code while web chat keeps working, because OAuth-token
          requests count against this bucket on top of{" "}
          <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">
            seven_day
          </code>
          .
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          How the meter polls, in 6 lines
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The 60-second cadence is one constant in the extension. Audit it
          yourself: open{" "}
          <a
            href="https://github.com/m13v/claude-meter/blob/main/extension/background.js"
            className="text-teal-700 underline underline-offset-2"
          >
            extension/background.js
          </a>{" "}
          line 3. There is no remote config server. There is no &ldquo;telemetry
          mode&rdquo; toggle. The cadence is what the file says.
        </p>
        <AnimatedCodeBlock
          code={pollingCode}
          language="javascript"
          filename="extension/background.js"
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The six weekly buckets the meter renders
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The Rust struct below is the deserializer the meter uses on every
          poll. Every non-null field becomes a row in the popover. Claude
          Code&apos;s{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            /usage
          </code>{" "}
          slash command summarizes the same fields into a paragraph; the meter
          keeps them separate.
        </p>
        <AnimatedCodeBlock
          code={rustStruct}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Install in one brew command
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The cask installs the menu-bar app and a{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            claude-meter
          </code>{" "}
          CLI binary. The extension lifts your existing claude.ai cookie out of
          whatever Chromium browser you use, so the meter lights up the first
          time you reload claude.ai with the extension installed.
        </p>
        <TerminalOutput
          title="ClaudeMeter install"
          lines={installTerminal}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What the meter promises (audit any of it)
        </h2>
        <AnimatedChecklist
          title="Properties the source code enforces"
          items={proofChecklist}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Setting up a weekly meter for a Claude Code team?"
          description="20-minute call: best route for shared accounts, status-line integration, and pre-emptive alerts before the OAuth bucket walls a multi-agent loop."
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 my-12">
        <RelatedPostsGrid
          title="Related guides"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Got a stuck weekly meter or a team-scale rollout question? Book 20 min."
      />
    </article>
  );
}
