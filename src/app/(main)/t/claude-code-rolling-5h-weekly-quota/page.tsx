import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-code-rolling-5h-weekly-quota";
const PUBLISHED = "2026-05-13";

export const metadata: Metadata = {
  title:
    "Claude Code rolling 5h + weekly quota: it is four clocks, not two",
  description:
    "Claude Code charges four independent rolling buckets per turn, not two. The fourth one, seven_day_oauth_apps, is Claude Code + MCP only and claude.ai/settings/usage does not display it. Here is the field list, why it bites Code-heavy users first, and how to read the live numbers in 60 seconds.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code rolling 5h + weekly quota: it is four clocks, not two",
    description:
      "five_hour, seven_day, seven_day_opus, seven_day_oauth_apps. Any one at 1.0 fires the next 429. The Settings page bar shows only one of them. Source: github.com/m13v/claude-meter.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t/claude-weekly-quota-server-truth-meter" },
  { name: "Claude Code rolling 5h + weekly quota", url: PAGE_URL },
];

const faqs = [
  {
    q: "How do the rolling 5h and weekly quotas work for Claude Code?",
    a: "Claude Code charges four independent rolling buckets on every turn. five_hour is a 5-hour sliding window across all your Anthropic activity. seven_day is the overall 168-hour rolling cap. seven_day_opus is the Opus-only 168-hour cap. seven_day_oauth_apps is the 168-hour cap that fills only from OAuth clients, which means Claude Code and MCP traffic; claude.ai browser chat does not touch it. Each is a utilization float between 0.0 and 1.0 with its own resets_at timestamp. Any one at 1.0 returns the next 429. The endpoint is GET claude.ai/api/organizations/{org_uuid}/usage and the Rust struct that declares every field is at src/models.rs lines 18-28 in github.com/m13v/claude-meter.",
  },
  {
    q: "Why am I rate limited when /usage says 41% and the Settings page says 62%?",
    a: "Because /usage and the Settings page hero bar both surface seven_day (the overall weekly bucket), but the 429 follows whichever of the four buckets is highest. For a Claude Code-heavy account that does no browser chat, the bucket climbing fastest is usually seven_day_oauth_apps. It can sit at 0.94 while seven_day reads 0.62 because seven_day is a blended average across Claude Code, browser chat, and any other OAuth client traffic on your org. The Settings page does not render seven_day_oauth_apps as its own bar, so the bucket biting you is invisible until you open DevTools or run a tool that reads the full JSON.",
  },
  {
    q: "Are the 5-hour and weekly clocks independent?",
    a: "Yes. The 5-hour clock rolls 5 hours after your first message in the rolling window. Each weekly clock rolls 168 hours after the first message of that weekly cycle, separately per bucket. A 5-hour reset does not advance the weekly clock, and a weekly reset does not unlock the 5-hour bucket. Both timestamps come back on the same JSON response as resets_at. claude-meter renders each as a relative duration so you can see which one bites first.",
  },
  {
    q: "Did the May 6 2026 rate-limit doubling apply to the weekly quota too?",
    a: "No. Anthropic doubled the rolling 5-hour limit on Pro, Max, Team, and seat-based Enterprise plans on May 6 2026. The weekly caps were not doubled. So Claude Code users on Max see roughly 2x the 5-hour throughput but the same weekly headroom. The most common surprise after May 6 is the 5-hour bar looking healthy while seven_day_opus or seven_day_oauth_apps quietly climbs past 90 percent earlier in the week than it used to.",
  },
  {
    q: "Why does ccusage say 5% used while Claude Code 429s me?",
    a: "Different ledgers. ccusage walks ~/.claude/projects/<project>/<session>.jsonl on your disk and totals input_tokens plus output_tokens against a price card. That gives you a faithful local token count and dollar estimate. The four utilization floats live on Anthropic's server, are weighted by peak-hour multipliers, factor in attachments and tool-call overhead, and include any browser-chat traffic the JSONL files never see. ccusage and a server-truth meter answer different questions on purpose. Run both.",
  },
  {
    q: "What is the fastest way to see all four floats without installing anything?",
    a: "Open claude.ai/settings/usage in Chrome. Open DevTools (Cmd+Option+I), switch to the Network tab, filter on /usage. Refresh the page. The fetch on page load returns the full JSON with every Window field. Click the Response tab to see the entire enforcement state. Whichever utilization is closest to 1.0 is the bucket that will 429 your next prompt. The fields you care about for Claude Code are five_hour, seven_day, seven_day_opus, and seven_day_oauth_apps.",
  },
  {
    q: "Will Anthropic block tools that poll /api/organizations/{org_uuid}/usage?",
    a: "It is your own session calling the same endpoint claude.ai/settings/usage already calls every time you open the page. claude-meter polls once per minute per browser, well below normal browsing traffic. The endpoint is undocumented, which means Anthropic can rename fields, not that they prohibit reading them. The Rust types in src/models.rs declare every Window field as Option, so when the JSON shape changes the next release patches the new fields in one line.",
  },
  {
    q: "If I turn on extra usage / metered billing, do these four limits stop applying?",
    a: "They convert, they do not vanish. With metered billing on, prompts past plan caps go through at standard API prices until you hit your monthly_credit_limit. When used_credits crosses that cap, GET /api/organizations/{org_uuid}/overage_spend_limit returns out_of_credits: true and a disabled_until timestamp. So you stop being rate-limited by a plan bucket and start being rate-limited by a dollar cap. Both are 429s. claude-meter renders the dollar cap as a separate Extra usage row with a BLOCKED suffix when it fires.",
  },
  {
    q: "What is the quickest install if I want this live in the menu bar?",
    a: "brew install --cask m13v/tap/claude-meter to install the macOS menu bar app, install the browser extension from github.com/m13v/claude-meter/releases, then visit claude.ai once. The extension hands the live claude.ai session to the menu bar app, so there is no cookie paste. Numbers refresh every 60 seconds and match claude.ai/settings/usage exactly because the source endpoint is the same.",
  },
];

const modelsRsCode = `// claude-meter/src/models.rs (lines 18-28)
// The struct that deserializes the /usage response.
// Source: github.com/m13v/claude-meter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:            Option<Window>,
    pub seven_day_sonnet:     Option<Window>,
    pub seven_day_opus:       Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,  // <- Claude Code + MCP only
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,
}

// pub struct Window {
//   utilization: f64,                 // 0.0 to 1.0
//   resets_at:   Option<DateTime<Utc>>,
// }
//
// Seven buckets, each its own clock, each can fire its own 429.
// Settings page only renders seven_day as a bar.`;

const usageJson = `// GET https://claude.ai/api/organizations/{org_uuid}/usage
// Live state for a Claude Code-heavy account, Wednesday afternoon.
// No browser chat this week, all traffic through the CLI.
{
  "five_hour":            { "utilization": 0.28, "resets_at": "2026-05-13T18:00:00Z" },
  "seven_day":            { "utilization": 0.62, "resets_at": "2026-05-18T09:00:00Z" },
  "seven_day_sonnet":     { "utilization": 0.34, "resets_at": "2026-05-18T09:00:00Z" },
  "seven_day_opus":       { "utilization": 0.81, "resets_at": "2026-05-18T09:00:00Z" },
  "seven_day_oauth_apps": { "utilization": 0.94, "resets_at": "2026-05-18T09:00:00Z" },
  "extra_usage":          { "is_enabled": false }
}

// 5-hour at 28% looks healthy. The Settings page renders seven_day at 62%.
// The wall you actually hit next is seven_day_oauth_apps at 94%.
// That bucket has no bar on /settings/usage. You only see it in the JSON.`;

const backgroundJsCode = `// claude-meter/extension/background.js
// The four lines that read the same JSON /settings/usage reads.
const BASE = "https://claude.ai";
const POLL_MINUTES = 1;

async function fetchJSON(url) {
  const r = await fetch(url, {
    credentials: "include",   // <- reuses your existing claude.ai cookie
    headers: { "accept": "application/json" },
  });
  if (!r.ok) throw new Error(\`\${r.status} \${r.statusText} @ \${url}\`);
  return r.json();
}

// Once per minute, per browser:
//   const usage = await fetchJSON(\`\${BASE}/api/organizations/\${org}/usage\`);
//   usage.five_hour.utilization
//   usage.seven_day.utilization
//   usage.seven_day_opus.utilization
//   usage.seven_day_oauth_apps.utilization
// All four read on the same request. No interruption to Claude Code.`;

const liveOutput = [
  { type: "command" as const, text: "$ claude-meter status" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour              28.0% used    -> resets Wed May 13 18:00 (in 4h 12m)" },
  { type: "output" as const, text: "7-day all           62.0% used    -> resets Mon May 18 09:00 (in 4d 19h)" },
  { type: "output" as const, text: "7-day Sonnet        34.0% used    -> resets Mon May 18 09:00 (in 4d 19h)" },
  { type: "output" as const, text: "7-day Opus          81.0% used    -> resets Mon May 18 09:00 (in 4d 19h)" },
  { type: "output" as const, text: "7-day OAuth apps    94.0% used    -> resets Mon May 18 09:00 (in 4d 19h)" },
  { type: "output" as const, text: "Extra usage         $0.00 / $200.00 (0%)" },
  { type: "output" as const, text: "" },
  { type: "info" as const, text: "5h healthy. seven_day_oauth_apps is the wall. Move overflow to claude.ai web for 4 days, or enable extra usage." },
];

const bucketSourceRows = [
  {
    feature: "five_hour",
    competitor: "Charged. Every Claude Code message lands here on a 5-hour rolling clock.",
    ours: "Charged. Every browser chat message lands here too. Shared bucket.",
  },
  {
    feature: "seven_day (overall)",
    competitor: "Charged. Blended weekly across all your traffic.",
    ours: "Charged. Same bucket. Settings page hero bar maps to this one.",
  },
  {
    feature: "seven_day_opus",
    competitor: "Charged on Opus 4.5 and Opus 4.7 turns only. Adaptive thinking tokens count.",
    ours: "Charged on Opus chats only.",
  },
  {
    feature: "seven_day_sonnet",
    competitor: "Charged on Sonnet turns only.",
    ours: "Charged on Sonnet chats only.",
  },
  {
    feature: "seven_day_oauth_apps",
    competitor: "Charged. Claude Code traffic is OAuth-authenticated. So is MCP.",
    ours: "Not charged. claude.ai chat uses cookie auth, not OAuth.",
  },
];

const clockSteps = [
  {
    title: "1. five_hour — the 5-hour rolling window.",
    description:
      "Starts 5 hours after your first message in the current rolling window. Every Claude Code turn and every browser chat message charges it. Doubled on Pro, Max, Team, and seat-based Enterprise on May 6 2026. resets_at lands roughly 5 hours from your first message of the window, not at a fixed clock time. This is the one /usage prints as 'Session' and the one Settings shows as the small bar.",
  },
  {
    title: "2. seven_day — the overall 168-hour bucket.",
    description:
      "Rolls 168 hours after the first message of the weekly cycle. Charged by every model, every client. The Settings page hero bar (the big horizontal one with the percent on top) maps to this field. It was not doubled on May 6. For Claude Code-heavy accounts this number is almost always lower than the per-model and OAuth-apps buckets, which is why /settings/usage misleads people.",
  },
  {
    title: "3. seven_day_opus — Opus-only weekly.",
    description:
      "Every Opus 4.5 and Opus 4.7 turn charges this in addition to seven_day. Adaptive thinking is on by default for Opus 4.7, and thinking tokens count as real output tokens for the float. A Claude Code session that runs heavy refactors on Opus eats seven_day_opus roughly 4x faster than seven_day_sonnet on the same task. The Settings page does not surface this as its own bar.",
  },
  {
    title: "4. seven_day_oauth_apps — the Claude Code-only weekly.",
    description:
      "The bucket that fills only from OAuth-authenticated traffic: Claude Code and MCP clients. Browser chat does not touch it. For users who do all their work in Claude Code and never open claude.ai web, this bucket fills fastest because every turn charges it AND charges seven_day. claude.ai/settings/usage does not render it as a bar. You can see it on the raw /usage JSON or in any tool that polls that endpoint.",
  },
  {
    title: "5. extra_usage — the optional fifth gate.",
    description:
      "Not a rolling window, a dollar cap. If you enabled metered billing, prompts past plan caps flow through at API prices up to your monthly_credit_limit. When used_credits crosses the cap, /api/organizations/{org_uuid}/overage_spend_limit returns out_of_credits: true and a disabled_until timestamp. So you can clear all four bucket walls and still 429 on the dollar cap. claude-meter shows this as a separate row with a BLOCKED suffix when it fires.",
  },
];

const readingSteps = [
  {
    title: "Open the live JSON in DevTools.",
    description:
      "Visit claude.ai/settings/usage, open DevTools (Cmd+Option+I), switch to the Network tab, filter on /usage, refresh. The response of /api/organizations/{org_uuid}/usage is the full enforcement state. Click the Response tab.",
  },
  {
    title: "Find the four numbers that matter for Claude Code.",
    description:
      "five_hour.utilization, seven_day.utilization, seven_day_opus.utilization, seven_day_oauth_apps.utilization. Each is a float between 0.0 and 1.0. The Settings page only renders seven_day as a visible bar, so check the other three by eye.",
  },
  {
    title: "Whichever is highest is your wall.",
    description:
      "The 429 follows the max. If seven_day_oauth_apps is 0.94 and seven_day is 0.62, you will 429 from oauth_apps. The Settings bar will keep showing 62 percent right up until the 429 fires.",
  },
  {
    title: "Read resets_at on the hot bucket, not the visible one.",
    description:
      "Each Window has its own resets_at. Waiting for the 5-hour reset will not unlock seven_day_oauth_apps. If oauth_apps is the wall, you wait until its resets_at, drop the rest of the week's work to claude.ai web (which does not charge oauth_apps), or enable extra usage.",
  },
  {
    title: "Or skip the manual polling.",
    description:
      "claude-meter (MIT, github.com/m13v/claude-meter) pins each bucket to the macOS menu bar and refreshes every 60 seconds via the browser extension. No cookie paste, no expiring token. brew install --cask m13v/tap/claude-meter, install the extension from the releases page, visit claude.ai once.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-max-rolling-5-hour-weekly-limit",
    title: "Claude Max rolling 5-hour weekly limit: the two limits are actually four",
    excerpt:
      "Same idea, zoomed in on Max plans specifically. All seven buckets named, the May 6 2026 doubling, and how to read the live JSON.",
    tag: "Max plan",
  },
  {
    href: "/t/claude-code-rolling-5-hour-usage",
    title: "Claude Code rolling 5-hour usage: three ledgers, three answers",
    excerpt:
      "/usage is a snapshot. ccusage reads local JSONL. The float that 429s your loop is on the server and counts browser chat too. Which tool reads which.",
    tag: "Rolling window",
  },
  {
    href: "/t/claude-code-weekly-quota-meter",
    title: "Claude Code weekly quota meter (vs. typing /usage every 10 minutes)",
    excerpt:
      "Open-source menu bar polls the same endpoint /usage reads, every 60 seconds, without breaking your agentic loop.",
    tag: "Live meter",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code rolling 5h + weekly quota: it is four clocks, not two",
  description:
    "Claude Code charges four independent rolling buckets per turn, not two. The fourth, seven_day_oauth_apps, fills only from Claude Code + MCP traffic and is not displayed on claude.ai/settings/usage. Verified from the open-source claude-meter source on 2026-05-13.",
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "ClaudeMeter",
  publisherUrl: "https://claude-meter.com",
  articleType: "TechArticle",
});

const breadcrumbJsonLd = breadcrumbListSchema(
  breadcrumbs.map((b) => ({ name: b.name, url: b.url }))
);

const faqJsonLd = faqPageSchema(faqs);

export default function ClaudeCodeRolling5hWeeklyQuotaPage() {
  return (
    <article className="min-h-screen text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd, faqJsonLd]),
        }}
      />

      <div className="py-10">
        <Breadcrumbs
          items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))}
        />
      </div>

      <header className="max-w-3xl mx-auto px-6 pb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-zinc-900">
          Claude Code rolling 5h + weekly quota:{" "}
          <GradientText>it is four clocks, not two.</GradientText>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-zinc-600 leading-relaxed">
          If you only use Claude Code (no browser chat), the bucket that
          429s you first is almost never the one displayed on
          claude.ai/settings/usage. It is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>
          , the OAuth-clients-only weekly cap, and the Settings page does
          not render it as a bar. Here is the four-clock model, the field
          names, and the live read path.
        </p>
      </header>

      <div className="pt-2 max-w-3xl mx-auto">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="6 min read"
        />
      </div>

      <section className="max-w-3xl mx-auto px-6 mt-10">
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-5 sm:p-6">
          <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold">
            Direct answer (verified 2026-05-13)
          </p>
          <p className="mt-3 text-zinc-900 text-base sm:text-lg leading-relaxed">
            For Claude Code, the rolling 5h + weekly quota is{" "}
            <strong>four independent rolling buckets</strong>, each a{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              utilization
            </code>{" "}
            float between 0.0 and 1.0 with its own{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              resets_at
            </code>
            :{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              five_hour
            </code>
            ,{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              seven_day
            </code>
            ,{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              seven_day_opus
            </code>
            , and{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              seven_day_oauth_apps
            </code>
            . Any one at 1.0 fires the next 429. The fourth one fills
            only from Claude Code + MCP traffic; browser chat does not
            touch it. The Settings page hero bar maps to{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              seven_day
            </code>{" "}
            only. Source:{" "}
            <a
              className="text-teal-700 underline"
              href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
            >
              github.com/m13v/claude-meter/src/models.rs
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The struct that names every bucket
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          The open-source claude-meter Rust app deserializes the same
          JSON claude.ai/settings/usage fetches on page load. Seven{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            Window
          </code>{" "}
          fields, one per enforcement bucket. For a Claude Code user,
          four of them are the ones that 429 you (
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>
          ).
        </p>
        <AnimatedCodeBlock
          code={modelsRsCode}
          language="rust"
          filename="src/models.rs"
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What the JSON actually looks like, mid-week
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          A Claude Code-heavy account, no browser chat this week. The
          Settings page renders 62 percent. /usage from inside Claude
          Code prints Session 28%, Week 62%. The bucket that fires the
          next 429 is{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>{" "}
          at 94 percent, which neither display shows.
        </p>
        <AnimatedCodeBlock
          code={usageJson}
          language="javascript"
          filename="usage.json"
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Why Claude Code is the case where this matters
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          Browser chat and Claude Code share the first three buckets.
          They diverge on the fourth.{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>{" "}
          fills only from OAuth-authenticated clients, which is Claude
          Code and MCP. claude.ai web uses cookie auth and does not
          touch it. So a user who does 100 percent of their work in
          Claude Code is charging the bucket twice (
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>
          ) on every turn, while a browser-only user charges only
          once.
        </p>
        <ComparisonTable
          productName="Claude Code (OAuth)"
          competitorName="claude.ai web chat (cookie)"
          rows={bucketSourceRows}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The four clocks, one section each
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Each bucket is a rolling float with its own reset. A 5-hour
          reset does not advance the weekly clocks, and a weekly reset
          does not unlock the 5-hour. They all run in parallel.
        </p>
        <StepTimeline steps={clockSteps} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What the live meter shows
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          Same JSON, formatted as one row per bucket. This is what{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            claude-meter status
          </code>{" "}
          prints, and what the macOS menu bar dropdown renders. The hot
          bucket is the one your eye lands on.
        </p>
        <TerminalOutput lines={liveOutput} title="claude-meter status" />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The four lines that poll the JSON
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          The browser extension reuses your existing claude.ai cookie
          via{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            credentials: &quot;include&quot;
          </code>{" "}
          on a single{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            fetch
          </code>
          . Once a minute. The four floats come back on the same
          request. No interruption to whatever Claude Code is doing.
        </p>
        <AnimatedCodeBlock
          code={backgroundJsCode}
          language="javascript"
          filename="extension/background.js"
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Reading your own state in 60 seconds
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          You do not need claude-meter installed to check. The endpoint
          is reachable to your existing cookie and the JSON is
          human-readable. Five steps.
        </p>
        <StepTimeline steps={readingSteps} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Stuck on the OAuth-apps bucket every week?"
          description="Book 15 minutes. Walk through your live JSON, see which of the four buckets is actually bottlenecking your Claude Code loop, and pick a Sonnet/Opus split (or a browser-chat overflow) that holds for the week."
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16 mb-20">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="More on Claude Code's rolling-window enforcement."
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Walk through your live four-bucket state and pick the right exit"
      />
    </article>
  );
}
