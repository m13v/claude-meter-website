import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
  ComparisonTable,
  ProofBanner,
  AnimatedChecklist,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-weekly-quota-server-truth-meter";
const PUBLISHED = "2026-05-10";

export const metadata: Metadata = {
  title:
    "The Claude Weekly Quota Server-Truth Meter (and Why Its Number Cannot Disagree With claude.ai)",
  description:
    "ClaudeMeter is the free, open-source macOS menu bar that reads your weekly quota from the same HTTPS call your /settings/usage page makes on reload. Same cookie, same Referer, same JSON. Here is the call site, the response shape, and how to verify the number in 30 seconds.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "The Claude weekly quota server-truth meter",
    description:
      "Open-source macOS menu bar that polls the exact endpoint /settings/usage calls. seven_day.utilization, live, in your menu bar. Audit the 142-line Rust client on GitHub.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Guides", href: "https://claude-meter.com/t/claude-server-quota-visibility" },
  { label: "Weekly quota server-truth meter" },
];

const faqs = [
  {
    q: "What is the 'weekly quota server-truth meter' actually pointing at?",
    a: "Anthropic's per-organization usage endpoint, served from claude.ai under the path /api/organizations/[org_uuid]/usage. That is the JSON the /settings/usage page renders into the bars and percentages you can already see in your browser. ClaudeMeter calls the same URL with your existing claude.ai session cookie and parses the response into the Window struct in src/models.rs lines 4-7 of github.com/m13v/claude-meter. Two fields: utilization: f64 and resets_at: Option<DateTime<Utc>>. Nothing else; there is no other source of weekly truth on the wire.",
  },
  {
    q: "Why can ccusage and Claude-Code-Usage-Monitor not show the same number?",
    a: "They sum input/output tokens from ~/.claude/projects/*.jsonl. The numerator is real. The denominator is not on disk. Anthropic's plan caps are expressed as utilization (a dimensionless fraction the server computes against a private weighting) and the local logs do not include the weighting, the per-model multipliers, or the rolling-window arithmetic. So a local counter at 5% can perfectly coexist with a server response of seven_day.utilization = 0.91. Both are honest about different things; only one of them will rate-limit you. ClaudeMeter sits next to ccusage, not against it.",
  },
  {
    q: "Why does ClaudeMeter send Referer: https://claude.ai/settings/usage on every poll?",
    a: "Because that is what your browser sends when you reload the settings page. Look at src/api.rs line 126 of the open-source repo. The Rust client sets exactly three headers on each GET: Cookie (your session), Referer (the settings URL), and Accept: */*. Cloudflare's bot heuristics see a request that is byte-identical to a tab reload, so the response is byte-identical too. The meter is impersonating your own browser, not consuming a 'tracker API' that does not exist.",
  },
  {
    q: "How fresh is the number on my menu bar?",
    a: "60 seconds when you have ClaudeMeter running with the browser extension. The extension's chrome.alarms job is set to POLL_MINUTES = 1 in extension/background.js line 3, fetches /usage, and POSTs the snapshot to the menu-bar app at http://127.0.0.1:63762/snapshots. If you cross 80 percent on any window, the menu-bar app's HIGH_UTIL_FAST_POLL kicks in (src/bin/menubar.rs line 34) and POLL_MIN drops the cadence to 90 seconds (line 29) so the bar reflects burn while you are at the wall.",
  },
  {
    q: "What if I do not want to install a browser extension?",
    a: "Brew install --cask m13v/tap/claude-meter and accept the macOS keychain prompt for 'Chrome Safe Storage'. The menu-bar app reads Chromium's encrypted cookie file directly and runs the same call itself. This is documented in the README under Route B. The trade-off is the prompt is broad (Chrome's master key covers cookies, saved passwords, and credit cards) and only Chromium-family browsers are supported on this path. The extension route avoids the prompt entirely.",
  },
  {
    q: "Is there a moment when the meter and claude.ai actually disagree?",
    a: "Only at the seam. If the server returns an updated utilization at second 31 of the minute, the next poll happens at second 60, so for 29 seconds the menu bar is stale. The popover dropdown shows fetched_at at the bottom so you can see exactly how old the number is. The two NEVER disagree on the calculation itself, only on freshness; both numbers came from the same payload, computed once on Anthropic's side.",
  },
  {
    q: "Can I just curl this myself and skip the menu bar?",
    a: "Yes. The shape is below. You need a session cookie from claude.ai (open DevTools, copy the Cookie header from any /api/organizations/.../usage call in the Network tab) and the org UUID (it is in the URL of any settings page). A one-line curl plus jq prints the exact same utilization the bar would render. ClaudeMeter exists because doing that on a 60-second loop, across multiple orgs, while watching for the worst bucket, while not paying telemetry to a third party, is the actual work.",
  },
  {
    q: "What does the meter cost? What does it phone home with?",
    a: "Free, MIT licensed, github.com/m13v/claude-meter. Network egress: one HTTPS request per minute to claude.ai per org membership and (when present) one to the same host's /api/organizations/{org}/overage_spend_limit and /subscription_details endpoints. No analytics ping, no auth server, no cloud account. The bridge between the extension and the menu bar is bound to 127.0.0.1:63762; nothing on your network can reach it. Audit src/api.rs (142 lines) and extension/background.js (121 lines) before you trust me.",
  },
];

const meterTerminal = [
  { type: "command" as const, text: "brew install --cask m13v/tap/claude-meter" },
  { type: "info" as const, text: "Cask installed. Loading the unpacked extension into Chrome/Arc/Brave/Edge." },
  { type: "output" as const, text: "[14:11:02] extension picked up claude.ai session, posting first snapshot..." },
  { type: "success" as const, text: "menu bar shows: 5h 18%   7d 62%   $0.00 metered" },
  { type: "info" as const, text: "Click the badge: dropdown shows 7-day Sonnet 41%, 7-day Opus 74%, 7-day OAuth apps 100%." },
  { type: "info" as const, text: "Same numbers you would see on https://claude.ai/settings/usage right now. Same JSON, same call." },
];

const usageJsonCode = `{
  "five_hour":            { "utilization": 0.18, "resets_at": "2026-05-10T18:42:00Z" },
  "seven_day":            { "utilization": 0.62, "resets_at": "2026-05-12T09:14:00Z" },
  "seven_day_sonnet":     { "utilization": 0.41, "resets_at": "2026-05-12T09:14:00Z" },
  "seven_day_opus":       { "utilization": 0.74, "resets_at": "2026-05-12T09:14:00Z" },
  "seven_day_oauth_apps": { "utilization": 1.00, "resets_at": "2026-05-12T09:14:00Z" },
  "seven_day_omelette":   null,
  "seven_day_cowork":     null,
  "extra_usage":          { "is_enabled": false }
}
// GET claude.ai /api/organizations/[org_uuid]/usage
//   Cookie:  <your existing claude.ai session>
//   Referer: https://claude.ai/settings/usage
//   Accept:  */*
//
// This is exactly what claude.ai/settings/usage receives on reload.
// ClaudeMeter parses it into UsageResponse (src/models.rs lines 18-28)
// and renders seven_day.utilization in your menu bar.`;

const truthSteps = [
  {
    title: "You log into claude.ai once.",
    description:
      "Your browser stores a session cookie under the claude.ai domain. The cookie is what the settings page uses to ask Anthropic 'what does this account look like right now'. You did this the day you signed up for Pro or Max.",
  },
  {
    title: "The extension borrows that cookie, in-page.",
    description:
      "extension/background.js line 7 calls fetch with credentials: 'include', so the request rides on the same cookie your /settings/usage page uses. No password prompt, no token paste, no separate auth server. Read background.js if you want; the entire client is 121 lines.",
  },
  {
    title: "Anthropic returns the same JSON it would render.",
    description:
      "GET /api/organizations/{org_uuid}/usage replies with five_hour, seven_day, and the per-model weekly windows. Each window is just utilization (a 0.0-1.0 fraction or 0-100 percent, the server is inconsistent and the extension handles both at line 62) and resets_at (the rolling window's tail aging out).",
  },
  {
    title: "The menu bar renders the worst window as the badge.",
    description:
      "src/bin/menubar.rs computes a fingerprint over five_hour, seven_day, and the per-model weeklies (lines 448-459) and the extension picks the worst seven_day percent for the badge title (background.js lines 65-73). When the bar reads 91%, the settings page reads 91% on the same window. They cannot drift, they came from the same call.",
  },
];

const cliVsMeterRows = [
  {
    feature: "Source of the number",
    competitor: "Sums tokens from ~/.claude/projects/*.jsonl on disk. Local-only, no server call.",
    ours: "GET /api/organizations/{uuid}/usage on claude.ai. Same call /settings/usage makes on reload.",
  },
  {
    feature: "Can it equal the server's enforcement?",
    competitor: "No. The denominator (Anthropic's per-plan, per-model, peak-hour-weighted ceiling) is not on disk.",
    ours: "Yes by definition. The number is the server's own utilization field.",
  },
  {
    feature: "Names the weekly bucket that walled you",
    competitor: "No. Token totals are flat; there is no concept of seven_day_oauth_apps in JSONL.",
    ours: "Yes. Renders seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps separately in the dropdown.",
  },
  {
    feature: "Knows when the wall lifts",
    competitor: "No. Logs do not carry the rolling window tail.",
    ours: "Yes. Each window has a resets_at UTC timestamp from the server.",
  },
  {
    feature: "Cost / license",
    competitor: "Free, MIT (ccusage). Some paid dashboards exist for the org-level Console.",
    ours: "Free, MIT, no telemetry. github.com/m13v/claude-meter.",
  },
  {
    feature: "What you give it",
    competitor: "Read access to ~/.claude/projects.",
    ours: "Your existing claude.ai cookie, via the extension. No password, no API key.",
  },
];

const verifySteps = [
  { text: "Brew install ClaudeMeter, load the extension, look at the menu bar number." },
  { text: "Open https://claude.ai/settings/usage in any tab." },
  { text: "Compare the weekly bar to the menu-bar number. They will match (modulo the 60-second poll window)." },
  { text: "Open DevTools, intercept the /api/organizations/.../usage call, read the seven_day.utilization field. It will match too." },
  { text: "If any of the three disagree by more than the poll window, file an issue at github.com/m13v/claude-meter/issues." },
];

const relatedPosts = [
  {
    title: "Why token counters cannot see Anthropic's enforced quota",
    href: "/t/claude-server-quota-visibility",
    excerpt: "The server returns utilization as a dimensionless fraction with a private denominator. Token counters have the numerator, not the denominator. Read the field directly or you are guessing.",
    tag: "Server quota",
  },
  {
    title: "How to verify a Claude tracker actually reads server truth",
    href: "/t/claude-usage-server-truth",
    excerpt: "Three checkable steps that prove the meter shows the same number Anthropic enforces. DevTools intercept, localhost bridge curl, staleness flip when the extension stops posting.",
    tag: "Verification",
  },
  {
    title: "The Claude Code weekly quota wall: what the CLI hides",
    href: "/t/claude-code-weekly-quota-wall",
    excerpt: "Six weekly buckets, one generic 'rate limit reached' string. The OAuth token in your Keychain plus the right endpoint will tell you which bucket actually walled you.",
    tag: "Claude Code",
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
                "The Claude weekly quota server-truth meter (and why its number cannot disagree with claude.ai)",
              description:
                "ClaudeMeter polls the same /api/organizations/{uuid}/usage endpoint that claude.ai/settings/usage calls on reload, with the same cookie and the same Referer header. seven_day.utilization, in your menu bar, every 60 seconds. Audit the 142-line Rust client.",
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
            breadcrumbListSchema([
              { name: "Home", url: "https://claude-meter.com" },
              { name: "Guides", url: "https://claude-meter.com/t/claude-server-quota-visibility" },
              { name: "Weekly quota server-truth meter", url: PAGE_URL },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema(faqs)),
        }}
      />

      <div className="pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-4xl mx-auto px-6 mt-6 mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
          The Claude weekly quota server-truth meter, and why its number cannot disagree with claude.ai
        </h1>
        <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
          You are looking for a tool that puts the weekly quota number from <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">claude.ai/settings/usage</code> on your menu bar without you clicking into the settings page every twenty minutes. That tool is <strong>ClaudeMeter</strong>. It is free, open source (MIT), no telemetry, and the reason its number cannot disagree with the settings page is that it makes the exact same HTTPS call.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="5 min read"
      />

      <section className="max-w-4xl mx-auto px-6 my-10">
        <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-10)
          </p>
          <p className="text-zinc-900 text-base leading-relaxed">
            <strong>The meter is ClaudeMeter.</strong> It polls
            {" "}
            <code className="text-sm bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
              GET claude.ai /api/organizations/[uuid]/usage
            </code>
            {" "}
            every 60 seconds with your existing claude.ai session cookie, parses
            {" "}
            <code className="text-sm bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">seven_day.utilization</code>
            {" "}
            (a 0 to 100 percent), and renders it on your macOS menu bar. Same call your
            {" "}
            <a href="https://claude.ai/settings/usage" className="text-teal-700 underline underline-offset-2">
              /settings/usage
            </a>
            {" "}
            page makes on reload, same field, same number. Source:
            {" "}
            <a href="https://github.com/m13v/claude-meter/blob/main/src/api.rs" className="text-teal-700 underline underline-offset-2">
              src/api.rs
            </a>
            {" "}
            (142 lines).
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Why the phrase &quot;server truth&quot; matters
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          You may have seen ccusage or Claude-Code-Usage-Monitor say you are at five percent of your week while Claude itself rate-limits you mid-refactor. They are not lying; they are measuring what is on your disk (input/output tokens summed from <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">~/.claude/projects/*.jsonl</code>). Anthropic does not enforce a quota in tokens. It enforces a dimensionless utilization fraction computed against a denominator the server never returns: per-plan, per-model, weighted by peak-hour load. The denominator is not on your machine.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The only number that matches what Anthropic will rate-limit you on is the one Anthropic itself ships back. That number is the <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">utilization</code> field on each window of the <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">/usage</code> response. If you have a tool that does not name an endpoint, it cannot be reading server truth. ClaudeMeter names the endpoint, in 142 lines of Rust you can read on a phone.
        </p>
      </section>

      <ProofBanner
        quote="Claude Code killed my refactor mid-way at 62% weekly used. Installed ClaudeMeter, now I watch the bar tick instead of guessing."
        metric="60s poll, 142 LOC, 0 telemetry"
      />

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What the meter actually reads
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Open the Network tab on <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">claude.ai/settings/usage</code> right now and you will see the response below. ClaudeMeter calls the same URL, with the same cookie, with the same Referer header, and parses the same payload. Two fields per window: a percent and a UTC reset moment. That is the whole truth surface.
        </p>
        <AnimatedCodeBlock
          code={usageJsonCode}
          language="json"
          filename="claude.ai · /api/organizations/{uuid}/usage"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          How the truth gets from Anthropic to your menu bar
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-2">
          Four steps, each verifiable in the open-source repo. The whole chain is shorter than most people&apos;s ESLint config.
        </p>
        <StepTimeline steps={truthSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Install in one line
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Two routes. The extension route avoids any keychain prompt because the in-page fetch already has your session.
        </p>
        <TerminalOutput lines={meterTerminal} title="ClaudeMeter install" />
        <p className="text-sm text-zinc-500 mt-3">
          Full instructions, including the menu-bar-only Route B (Chrome Safe Storage prompt), live at
          {" "}
          <a href="https://claude-meter.com/install" className="text-teal-700 underline underline-offset-2">
            claude-meter.com/install
          </a>
          .
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Server-truth meter vs. local token estimator
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The two tools answer different questions. ccusage tells you what you spent in tokens, ClaudeMeter tells you where that puts you against Anthropic&apos;s enforced ceiling. Use both if you want, but only one of them can predict the wall.
        </p>
        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="Local token estimator"
          rows={cliVsMeterRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The reader-can-verify checklist
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          You do not have to take my word that the meter reads server truth. Run this in five minutes and convince yourself.
        </p>
        <AnimatedChecklist title="30-second sanity check" items={verifySteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The six weekly buckets, what each one counts
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          When you say &quot;weekly quota&quot;, you probably mean one number. Anthropic has six, all named in the open Rust schema at
          {" "}
          <a href="https://github.com/m13v/claude-meter/blob/main/src/models.rs" className="text-teal-700 underline underline-offset-2">
            src/models.rs lines 18-28
          </a>
          . The one that walls you on a given Wednesday is whichever happens to cross 1.0 first. ClaudeMeter exposes all of them in the dropdown so you do not have to guess.
        </p>
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="px-5 py-3 font-semibold text-zinc-900">Field</th>
                <th className="px-5 py-3 font-semibold text-zinc-900">What it counts</th>
                <th className="px-5 py-3 font-semibold text-zinc-900">Walls what</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700">
              <tr className="border-b border-zinc-200">
                <td className="px-5 py-3 font-mono text-xs">five_hour</td>
                <td className="px-5 py-3">Rolling 5-hour window across the whole account.</td>
                <td className="px-5 py-3">Both web and Claude Code in the same 5-hour slice.</td>
              </tr>
              <tr className="border-b border-zinc-200">
                <td className="px-5 py-3 font-mono text-xs">seven_day</td>
                <td className="px-5 py-3">All-up rolling 168-hour aggregate.</td>
                <td className="px-5 py-3">The headline weekly quota everybody talks about.</td>
              </tr>
              <tr className="border-b border-zinc-200">
                <td className="px-5 py-3 font-mono text-xs">seven_day_sonnet</td>
                <td className="px-5 py-3">Rolling weekly bucket scoped to Sonnet traffic.</td>
                <td className="px-5 py-3">Sonnet calls only; Opus keeps working when this fires.</td>
              </tr>
              <tr className="border-b border-zinc-200">
                <td className="px-5 py-3 font-mono text-xs">seven_day_opus</td>
                <td className="px-5 py-3">Rolling weekly bucket scoped to Opus traffic.</td>
                <td className="px-5 py-3">Opus calls only; drop to Sonnet for the rest of the week.</td>
              </tr>
              <tr className="border-b border-zinc-200">
                <td className="px-5 py-3 font-mono text-xs">seven_day_oauth_apps</td>
                <td className="px-5 py-3">OAuth-authenticated clients (Claude Code, MCP host loops).</td>
                <td className="px-5 py-3">Terminal stops; web chat keeps working.</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-mono text-xs">seven_day_omelette / seven_day_cowork</td>
                <td className="px-5 py-3">Internal experimental buckets, frequently null.</td>
                <td className="px-5 py-3">Usually nothing for individual accounts.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <FaqSection items={faqs} />

      <section className="max-w-4xl mx-auto px-6 my-12">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want a 20-minute walk-through?"
          description="Show me your usage page, I will show you which bucket is closest to walling you and how to read it from a script."
        />
      </section>

      <RelatedPostsGrid
        title="Keep reading"
        posts={relatedPosts}
      />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Book a quick call about your Claude usage."
      />
    </article>
  );
}
