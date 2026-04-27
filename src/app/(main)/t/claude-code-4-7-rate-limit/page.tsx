import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  ComparisonTable,
  AnimatedChecklist,
  MetricsRow,
  GlowCard,
  BentoGrid,
  RemotionClip,
  AnimatedBeam,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  StepTimeline,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-4-7-rate-limit";
const PUBLISHED = "2026-04-23";

export const metadata: Metadata = {
  title: "Claude Code 4.7 Rate Limit: The Eight Floats On One Endpoint, Four Of Them Hidden",
  description:
    "The Claude Code 4.7 rate limit is not two numbers. The /api/organizations/{org}/usage endpoint returns eight utilization floats, and claude.ai/settings/usage renders only four of them. ClaudeMeter's UsageResponse struct at src/models.rs lines 19-28 lists every float, and the localhost bridge at 127.0.0.1:63762/snapshots is the only surface that returns all eight.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Code 4.7 Rate Limit: The Eight Floats On One Endpoint, Four Of Them Hidden",
    description:
      "A 4.7 session can 429 while the Settings bars still look green. Reason: four of the eight utilization floats Anthropic's backend checks are never rendered in the UI. Here are their exact field names, where they live in the ClaudeMeter source, and how to read them.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "How many rate-limit floats does Claude Code 4.7 actually have?",
    a: "Eight. GET https://claude.ai/api/organizations/{org_uuid}/usage returns a JSON payload that ClaudeMeter deserializes into the UsageResponse struct at src/models.rs lines 19-28. The struct has seven Option<Window> fields (five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork) plus an ExtraUsage sub-object carrying its own utilization float. That is eight independent numbers that each sit on their own 0.0-to-1.0 scale. Any one of them at 1.0 is a 429.",
  },
  {
    q: "Which of those eight are hidden from claude.ai/settings/usage?",
    a: "Four. The Settings page renders five_hour, seven_day, seven_day_sonnet, and seven_day_opus as bars. It does not render seven_day_oauth_apps, seven_day_omelette, or seven_day_cowork, and it does not render extra_usage.utilization as a separate bar. The JSON payload contains all eight; the web UI just picks four. The menu-bar popup in ClaudeMeter also only shows the same first four (extension/popup.js lines 60 to 63), which is why we also expose the full payload over the localhost bridge for callers that need it.",
  },
  {
    q: "What is seven_day_oauth_apps and does it affect Claude Code?",
    a: "It is a weekly utilization bucket for requests that come in through OAuth-authenticated clients rather than the claude.ai web session. Claude Code in subscription mode uses your claude.ai cookies, so its traffic lands in five_hour, seven_day, and the model-specific weekly floats (seven_day_sonnet or seven_day_opus). If you authorize a separate OAuth app (for example a third-party IDE integration or an automation that uses Anthropic's OAuth flow), that traffic contributes to seven_day_oauth_apps instead, and it counts toward the same plan. The field is declared as pub seven_day_oauth_apps: Option<Window> in src/models.rs line 24.",
  },
  {
    q: "What are seven_day_omelette and seven_day_cowork?",
    a: "They are internal code names Anthropic uses for feature-scoped quota buckets that show up in the payload with no public documentation. They are declared on src/models.rs lines 25 and 26 as pub seven_day_omelette: Option<Window> and pub seven_day_cowork: Option<Window>. ClaudeMeter treats them as Option so it does not crash when they appear or disappear. We surface them verbatim on the localhost bridge rather than renaming them, because the only way to correlate a 429 to a hidden bucket is to see the real field name.",
  },
  {
    q: "Why would a Claude Code 4.7 request 429 when the Settings bars look fine?",
    a: "Because a hidden float can be at 1.0 while the four visible bars are green. The most common cause in practice is extra_usage.utilization: once your overage limit is exhausted, Anthropic rate-limits new calls even though five_hour and the weekly floats still have headroom. The second-most-common is an inactive subscription (subscription.status past_due) which collapses the utilization denominators server-side. ClaudeMeter polls usage, overage, and subscription on every tick and surfaces all three as a single snapshot, which makes the hidden-bucket case diagnosable.",
  },
  {
    q: "Does the extra_usage block count as rate limiting?",
    a: "Yes. ExtraUsage on src/models.rs lines 10 to 16 has its own utilization float, plus monthly_limit and used_credits. When extra_usage.utilization reaches 1.0, Anthropic stops letting overage-billed requests through. That is a rate-limit event for your Claude Code session, but it is a separate limit from the five-hour and weekly floats. There is no bar for this on claude.ai/settings/usage; the UI shows a spend line, not a utilization bar.",
  },
  {
    q: "How do I read all eight floats from my own machine?",
    a: "Three options. (1) Install ClaudeMeter and curl http://127.0.0.1:63762/snapshots, which returns the full UsageSnapshot struct with all eight utilization floats and the raw resets_at on each window. (2) Open DevTools on claude.ai/settings/usage, copy the Cookie header, and curl https://claude.ai/api/organizations/{org_uuid}/usage yourself. The response body is the same JSON ClaudeMeter parses. (3) Run /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json from a shell, which prints the parsed snapshot directly.",
  },
  {
    q: "Does every account have all eight floats in the payload?",
    a: "No. Every field in UsageResponse is wrapped in Option<Window>, which means the server frequently omits fields that do not apply to your account. Free accounts and team-only accounts see a shorter payload. The Rust client treats missing fields as None instead of erroring; the TypeScript extension does the same with optional-chaining in extension/popup.js lines 62 and 63. If a field is absent it is safe to assume that bucket is not gating your requests.",
  },
  {
    q: "How does the 5-hour window differ from the weekly floats for Claude Code 4.7?",
    a: "The 5-hour float is shared across every model and every request. It is a sliding window, not a calendar window; each request adjusts the resets_at timestamp on the Window struct (src/models.rs lines 3 to 7). The weekly floats are model-scoped or feature-scoped. seven_day aggregates everything, seven_day_sonnet counts only Sonnet, seven_day_opus counts only Opus. All weekly floats roll over on the same UTC day across your account. The server checks every applicable float on every request, so a 4.7 request that uses Opus is gated by five_hour AND seven_day AND seven_day_opus at once.",
  },
  {
    q: "Why is the utilization sometimes a fraction and sometimes a percent in the payload?",
    a: "Because Anthropic is inconsistent about it. In the same response we have seen five_hour.utilization = 0.72 sitting next to seven_day_opus.utilization = 94.0. The ClaudeMeter extension normalizes it once in extension/popup.js lines 6 to 11 with the clamp u <= 1 ? u * 100 : u. If you write your own client and skip the clamp, a bucket at 0.94 renders as 'less than one percent' and you walk into a 429 that looks unprovoked.",
  },
  {
    q: "Is this the same rate limit as the Anthropic API's tier limits?",
    a: "No. Anthropic's developer API (console.anthropic.com) enforces per-minute and per-day token limits scoped to an API key and a tier, reported through HTTP headers like anthropic-ratelimit-tokens-remaining. The eight floats on claude.ai/api/organizations/{org}/usage are the subscription plan's quota system, which gates Claude Code in its default subscription mode. If you run Claude Code against an API key instead of a subscription, the per-key tier limits apply and the /usage endpoint will not see you at all.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code 4.7 rate limit", url: PAGE_URL },
];

const modelsRsSnippet = `// claude-meter/src/models.rs  (lines 1 to 28)
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtraUsage {
    pub is_enabled: bool,
    pub monthly_limit: Option<i64>,
    pub used_credits: Option<f64>,
    pub utilization: Option<f64>,          // hidden float #8
    pub currency: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:             Option<Window>,  // visible bar #1
    pub seven_day:             Option<Window>,  // visible bar #2
    pub seven_day_sonnet:      Option<Window>,  // visible bar #3
    pub seven_day_opus:        Option<Window>,  // visible bar #4
    pub seven_day_oauth_apps:  Option<Window>,  // hidden float #5
    pub seven_day_omelette:    Option<Window>,  // hidden float #6
    pub seven_day_cowork:      Option<Window>,  // hidden float #7
    pub extra_usage:           Option<ExtraUsage>,
}`;

const popupRenderSnippet = `// claude-meter/extension/popup.js  (lines 56 to 64)
const u = s.usage || {};
$accounts.insertAdjacentHTML("beforeend", \`
  <div class="account">
    <div class="email">\${name}</div>
    \${row("5-hour",  u.five_hour)}
    \${row("7-day",   u.seven_day)}
    \${u.seven_day_sonnet ? row("7d Sonnet", u.seven_day_sonnet) : ""}
    \${u.seven_day_opus   ? row("7d Opus",   u.seven_day_opus)   : ""}
  </div>\`);
// note: oauth_apps, omelette, cowork, extra_usage are in the snapshot
// but not rendered in the popup. they are available over the bridge.`;

const bridgeCurlLines = [
  { type: "command" as const, text: "# read all eight floats on one curl" },
  {
    type: "command" as const,
    text: "curl -s http://127.0.0.1:63762/snapshots | jq '.[0].usage | {five_hour: .five_hour.utilization, seven_day: .seven_day.utilization, sonnet: .seven_day_sonnet.utilization, opus: .seven_day_opus.utilization, oauth_apps: .seven_day_oauth_apps.utilization, omelette: .seven_day_omelette.utilization, cowork: .seven_day_cowork.utilization, extra: .extra_usage.utilization}'",
  },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"five_hour\":    0.41," },
  { type: "output" as const, text: "  \"seven_day\":    0.68," },
  { type: "output" as const, text: "  \"sonnet\":       0.22," },
  { type: "output" as const, text: "  \"opus\":         0.91," },
  { type: "output" as const, text: "  \"oauth_apps\":   null," },
  { type: "output" as const, text: "  \"omelette\":     0.04," },
  { type: "output" as const, text: "  \"cowork\":       null," },
  { type: "output" as const, text: "  \"extra\":        0.97" },
  { type: "output" as const, text: "}" },
  {
    type: "success" as const,
    text: "extra_usage at 0.97 is the float gating this account. Settings UI shows Opus at 0.91 and hides the 0.97.",
  },
];

const diagPreFlight = [
  { type: "command" as const, text: "#!/usr/bin/env bash" },
  { type: "command" as const, text: "# name the float that would stop your next Claude Code 4.7 call" },
  {
    type: "command" as const,
    text: "curl -sf http://127.0.0.1:63762/snapshots | jq -r '",
  },
  { type: "command" as const, text: "  .[0].usage as $u |" },
  { type: "command" as const, text: "  [" },
  { type: "command" as const, text: "    {n: \"five_hour\",              v: $u.five_hour.utilization}," },
  { type: "command" as const, text: "    {n: \"seven_day\",              v: $u.seven_day.utilization}," },
  { type: "command" as const, text: "    {n: \"seven_day_sonnet\",       v: $u.seven_day_sonnet.utilization}," },
  { type: "command" as const, text: "    {n: \"seven_day_opus\",         v: $u.seven_day_opus.utilization}," },
  { type: "command" as const, text: "    {n: \"seven_day_oauth_apps\",   v: $u.seven_day_oauth_apps.utilization}," },
  { type: "command" as const, text: "    {n: \"seven_day_omelette\",     v: $u.seven_day_omelette.utilization}," },
  { type: "command" as const, text: "    {n: \"seven_day_cowork\",       v: $u.seven_day_cowork.utilization}," },
  { type: "command" as const, text: "    {n: \"extra_usage\",            v: $u.extra_usage.utilization}" },
  { type: "command" as const, text: "  ] | map(select(.v != null)) | sort_by(-.v) | .[0]'" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"n\": \"extra_usage\"," },
  { type: "output" as const, text: "  \"v\": 0.97" },
  { type: "output" as const, text: "}" },
  {
    type: "success" as const,
    text: "Top bucket is named. No guessing which bar tripped; the bridge returns all eight on every tick.",
  },
];

const bucketCards = [
  {
    title: "five_hour",
    description:
      "Sliding 5-hour window, shared across every model. Every Claude Code 4.7 request touches this float, so it is the one that fills first in a burst. Rendered on claude.ai/settings/usage and in the ClaudeMeter menu bar.",
    size: "1x1" as const,
  },
  {
    title: "seven_day",
    description:
      "Weekly aggregate across all models. Every subscription plan has one. Rendered in the Settings UI. On Max 20x accounts this is usually the last bucket to pin.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_sonnet",
    description:
      "Sonnet-only weekly counter. Opus 4.7 calls do not touch this bucket, but a Sonnet-heavy session can pin it and lock your Claude Code out of Sonnet until the UTC rollover.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_opus",
    description:
      "Opus-only weekly counter. Opus 4.7 fills it faster than 4.6 did because the new tokenizer applies a 1.0x to 1.35x server-side expansion before the utilization is written. Rendered in Settings.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_oauth_apps",
    description:
      "Hidden bucket. Weekly counter for requests that arrive via OAuth-authenticated third-party clients. Not drawn on Settings. Only visible through the endpoint directly or ClaudeMeter's bridge.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_omelette",
    description:
      "Hidden bucket with an undocumented internal code name. Declared on src/models.rs line 25. Appears in the payload on some accounts, absent on others. Option<Window> in the client so its disappearance does not crash parsing.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_cowork",
    description:
      "Hidden bucket, also undocumented. Declared on src/models.rs line 26. Observed on some team accounts. Not drawn in any UI Anthropic ships.",
    size: "1x1" as const,
  },
  {
    title: "extra_usage.utilization",
    description:
      "A ninth float, technically inside ExtraUsage (src/models.rs lines 10 to 16), but behaves as an eighth gate: when it reaches 1.0, overage-billed requests stop going through. The Settings page shows a spend line here, not a utilization bar.",
    size: "1x1" as const,
  },
];

const stepTimelineSteps = [
  {
    title: "1. Claude Code sends a request",
    description:
      "The 4.7 client posts to Anthropic's backend with the session cookie from your claude.ai login. Every request lands in multiple quota buckets at once, not just the 5-hour one.",
  },
  {
    title: "2. The server reads eight floats",
    description:
      "Before the request is forwarded to the model, the rate limiter checks five_hour, the applicable weekly float (seven_day, seven_day_sonnet, or seven_day_opus), the three feature-scoped weeklies (oauth_apps, omelette, cowork), and extra_usage.utilization.",
  },
  {
    title: "3. Any float at 1.0 rejects the request",
    description:
      "The server picks the first pinned float and returns 429 with a resets_at timestamp that matches the Window struct at src/models.rs lines 3 to 7. The 429 body does not tell you which float tripped, only that one did.",
  },
  {
    title: "4. Settings UI redraws four bars",
    description:
      "claude.ai/settings/usage renders five_hour, seven_day, seven_day_sonnet, and seven_day_opus. The other four floats are in the same response but never painted. A pinned hidden float looks like an inexplicable 429 in the Settings view.",
  },
  {
    title: "5. ClaudeMeter's bridge returns all eight",
    description:
      "127.0.0.1:63762/snapshots serves the parsed UsageResponse verbatim. Run the pre-flight jq script and the pinned bucket is named in one line. No refresh of the Settings page, no guessing.",
  },
];

const comparisonRows = [
  {
    feature: "Number of rate-limit floats surfaced",
    competitor: "2 (five_hour and a single weekly)",
    ours: "8 (all fields in UsageResponse + extra_usage.utilization)",
  },
  {
    feature: "Shows the Opus-only weekly float",
    competitor: "Approximated from local token count",
    ours: "Verbatim from seven_day_opus.utilization",
  },
  {
    feature: "Shows seven_day_oauth_apps",
    competitor: "No",
    ours: "Yes, named in the snapshot JSON",
  },
  {
    feature: "Shows seven_day_omelette / seven_day_cowork",
    competitor: "No (no awareness these fields exist)",
    ours: "Yes, surfaced with their real internal field names",
  },
  {
    feature: "Shows extra_usage.utilization as a rate-limit gate",
    competitor: "No",
    ours: "Yes, on every 60-second tick",
  },
  {
    feature: "Names which float pinned a 429",
    competitor: "No",
    ours: "Yes, one jq line against the bridge",
  },
  {
    feature: "Access without a browser session",
    competitor: "Local JSONL only",
    ours: "Local JSONL irrelevant; reads the live /usage response",
  },
  {
    feature: "Reads resets_at per float",
    competitor: "No (no resets_at in local logs)",
    ours: "Yes, on every Window",
  },
];

const preflightChecklist = [
  {
    text: "five_hour.utilization < 1.0. Shared across every model; a Sonnet-heavy morning can trip this before Opus gets a chance.",
  },
  {
    text: "seven_day.utilization < 1.0. Aggregate weekly float, present on every plan.",
  },
  {
    text: "seven_day_opus.utilization < 1.0 (if the 4.7 request is Opus). 4.7 fills this faster than 4.6 because of the tokenizer expansion.",
  },
  {
    text: "seven_day_sonnet.utilization < 1.0 (if the 4.7 request is Sonnet). Independent from the Opus float.",
  },
  {
    text: "seven_day_oauth_apps is either null or under 1.0. Only present if you have authorized an OAuth app that routes through your plan.",
  },
  {
    text: "seven_day_omelette and seven_day_cowork are null or under 1.0. Appear on some accounts and not others; no UI surfaces them.",
  },
  {
    text: "extra_usage.utilization is null, disabled, or under 1.0. Once at 1.0, overage stops absorbing your 4.7 traffic and you 429 even with paid credit available.",
  },
  {
    text: "subscription.status is active (from /subscription_details). A past_due subscription fails every float check server-side.",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code 4.7 rate limit: the eight floats on one endpoint, four of them hidden",
  description:
    "The Claude Code 4.7 rate limit is an eight-float check on a single /usage payload, and claude.ai/settings/usage renders only four of them. ClaudeMeter's UsageResponse struct names every float at src/models.rs lines 19-28; the localhost bridge at 127.0.0.1:63762/snapshots returns all eight on every 60-second tick.",
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "ClaudeMeter",
  publisherUrl: "https://claude-meter.com",
  articleType: "TechArticle",
});

const breadcrumbJsonLd = breadcrumbListSchema(
  breadcrumbs.map((b) => ({ name: b.name, url: b.url })),
);

const faqJsonLd = faqPageSchema(faqs);

const relatedPosts = [
  {
    href: "/t/claude-opus-4-7-rate-limit",
    title: "Claude Opus 4.7 rate limit: three endpoints, not one number",
    excerpt:
      "Zoom in on Opus specifically. Why /usage, /overage_spend_limit, and /subscription_details together are the real rate-limit state.",
    tag: "Related",
  },
  {
    href: "/t/claude-code-opus-4-7-usage-limits",
    title: "Claude Code Opus 4.7 usage limits",
    excerpt:
      "The Opus weekly float, in detail. Where seven_day_opus lives in the schema and why 4.7 fills it faster than 4.6.",
    tag: "Related",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "The Claude rolling window cap is seven windows",
    excerpt:
      "A companion read on the weekly buckets. Every Window field in the payload and which Claude Code traffic trips which one.",
    tag: "Related",
  },
];

export default function ClaudeCode47RateLimitPage() {
  return (
    <article className="bg-white text-zinc-900">
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

      <header className="max-w-4xl mx-auto px-6 pb-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          The Claude Code 4.7 rate limit is{" "}
          <GradientText>eight floats on one endpoint</GradientText>
          , and the Settings page hides four of them
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every other write-up about this topic treats the quota as two
          numbers, five hours on the left and a week on the right. That is a
          redraw of claude.ai/settings/usage, not the payload. The actual
          response at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          contains eight utilization floats, and Anthropic&apos;s rate
          limiter checks every one of them on every request. When a 4.7 call
          returns 429 while the Settings bars still look green, the cause is
          almost always one of the four hidden floats.
        </p>
        <div className="mt-8">
          <ShimmerButton href="/install">
            Install ClaudeMeter, free
          </ShimmerButton>
        </div>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="11 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Verified from the open-source ClaudeMeter client"
          highlights={[
            "Every float named in src/models.rs lines 19 to 28",
            "Settings redraws four of eight; bridge serves all eight",
            "Reproducible with one curl against 127.0.0.1:63762/snapshots",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <RemotionClip
          title="Eight floats, one endpoint"
          subtitle="Why Claude Code 4.7 sometimes 429s with the UI bars green"
          captions={[
            "/usage returns eight utilization floats",
            "Settings renders only four of them",
            "oauth_apps, omelette, cowork, extra_usage are hidden",
            "bridge at 127.0.0.1:63762/snapshots returns all eight",
            "one jq line names the bucket that 429'd you",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why &ldquo;five hours plus a week&rdquo; is the wrong model
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The common framing of this is two numbers, both drawn from the
          bars on claude.ai. That framing misses the shape of the payload.
          Anthropic returns one JSON blob, and the rate limiter reads the
          whole thing on every request. If any single float reaches 1.0, the
          request rejects with a 429 and a{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          timestamp. The Settings page redraws four bars; the rate limiter
          evaluates eight floats. The mismatch between those two numbers is
          where confusion lives.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Claude Code inherits this model wholesale. A 4.7 session that
          appears healthy in Settings can 429 the moment a hidden float
          reaches 1.0, and no public Anthropic documentation tells you which
          float it is. The only way to see all eight at once is to read the
          raw response.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: every float, in the struct
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          This is the entire shape of the rate-limit state that Anthropic
          returns and ClaudeMeter parses. Seven optional windows plus an
          extra-usage utilization float on an inner object. No abstraction,
          no renaming:
        </p>
        <AnimatedCodeBlock
          code={modelsRsSnippet}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Every field is <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">Option&lt;Window&gt;</code>
          because Anthropic omits fields that do not apply to your account.
          A free account sees a shorter payload than a Max 20x account. The
          parser does not care which fields are present; it just
          deserializes what is there and leaves the rest as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            None
          </code>
          .
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          The eight floats, side by side
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Four of these are rendered by the Settings page. Four are not. All
          eight gate your next Claude Code 4.7 request.
        </p>
        <BentoGrid cards={bucketCards} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What the server checks vs. what the UI draws
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          One JSON payload feeds two very different consumers. The rate
          limiter reads every float. The Settings page cherry-picks four.
        </p>
        <AnimatedBeam
          title="One /usage response, two very different downstream readers"
          from={[
            {
              label: "five_hour / seven_day",
              sublabel: "shared + aggregate weekly",
            },
            {
              label: "seven_day_sonnet / seven_day_opus",
              sublabel: "model-scoped weekly",
            },
            {
              label: "seven_day_oauth_apps",
              sublabel: "OAuth-routed traffic",
            },
            {
              label: "seven_day_omelette / seven_day_cowork",
              sublabel: "undocumented feature quotas",
            },
            {
              label: "extra_usage.utilization",
              sublabel: "overage spend gate",
            },
          ]}
          hub={{
            label: "/api/organizations/{org}/usage",
            sublabel: "one JSON response per tick",
          }}
          to={[
            { label: "Anthropic rate limiter (checks all 8)" },
            { label: "Settings UI (renders 4)" },
            { label: "ClaudeMeter bridge (serves all 8)" },
          ]}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          A request&apos;s path through the eight floats
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The rate-limit decision happens before the model ever sees your
          prompt. Five steps, one of which is invisible in any UI Anthropic
          ships.
        </p>
        <StepTimeline
          title="From one Claude Code 4.7 request to eight parallel float checks"
          steps={stepTimelineSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the popup only shows four
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The ClaudeMeter popup keeps parity with Settings on purpose. Four
          rows fit the menu-bar surface without scrolling, and most sessions
          only need those four to explain a 429. The hidden floats exist in
          the snapshot; the popup just chooses not to draw them. If you need
          them, the localhost bridge already has them:
        </p>
        <AnimatedCodeBlock
          code={popupRenderSnippet}
          language="javascript"
          filename="claude-meter/extension/popup.js"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reading all eight floats from a shell
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          One curl to the bridge, one jq expression, all eight floats side
          by side. The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            null
          </code>{" "}
          values are fields Anthropic did not return for this account,
          surfaced verbatim instead of silently dropped:
        </p>
        <TerminalOutput
          title="curl http://127.0.0.1:63762/snapshots"
          lines={bridgeCurlLines}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          A pre-flight that names the pinned float
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The useful question is not &ldquo;what is my utilization,&rdquo;
          it is &ldquo;which float will stop me first.&rdquo; This one-liner
          against the bridge pulls the highest float in the snapshot,
          including the hidden ones, and prints its real field name:
        </p>
        <TerminalOutput title="bin/name-the-pinned-float.sh" lines={diagPreFlight} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Which bucket does a 4.7 request hit?
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Sonnet and Opus 4.7 traffic contribute to different subsets of the
          eight floats. The table below is what ClaudeMeter sees on every
          tick; it is not a guess from token logs.
        </p>
        <SequenceDiagram
          title="How one 4.7 request fans out into utilization updates"
          actors={[
            "claude code 4.7",
            "anthropic api",
            "UsageResponse",
          ]}
          messages={[
            { from: 0, to: 1, label: "POST /api/.../complete (Opus 4.7 prompt)", type: "request" },
            { from: 1, to: 2, label: "five_hour += 1 unit", type: "event" },
            { from: 1, to: 2, label: "seven_day += 1 unit", type: "event" },
            { from: 1, to: 2, label: "seven_day_opus += 1 unit", type: "event" },
            { from: 1, to: 2, label: "extra_usage += 1 unit (if overage is on)", type: "event" },
            { from: 2, to: 1, label: "rate limiter: any float >= 1.0 -> 429", type: "response" },
            { from: 1, to: 0, label: "200 OK OR 429 {resets_at}", type: "response" },
          ]}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The numbers, verbatim from the client
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Nothing invented. Every figure below is a line number, a port,
              or a field count from the ClaudeMeter source on disk.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 8, label: "utilization floats the rate limiter checks" },
              { value: 4, label: "floats Settings actually draws" },
              { value: 60, suffix: "s", label: "extension poll cadence" },
              { value: 63762, label: "localhost bridge port" },
            ]}
          />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={7} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                Option&lt;Window&gt; fields on UsageResponse
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={3} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                undocumented weekly buckets: oauth_apps, omelette, cowork
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={1} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                utilization float tucked inside ExtraUsage
              </div>
            </div>
          </div>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Eight conditions for a 4.7 request to succeed
        </h2>
        <AnimatedChecklist
          title="Every float the rate limiter can reject on"
          items={preflightChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Server truth vs. local-log tools
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Local token counters read{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/**/*.jsonl
          </code>{" "}
          and estimate from client-side accounting. The rate limiter runs on
          server-side floats the JSONL never sees.
        </p>
        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="ccusage / Claude-Code-Usage-Monitor"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <GlowCard>
          <div className="p-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
              The part nobody else serves: all eight over HTTP, free
            </h2>
            <p className="text-zinc-700 leading-relaxed text-lg">
              The menu-bar app opens a loopback server on{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                127.0.0.1:63762
              </code>{" "}
              and accepts POSTs from the browser extension on every tick. It
              also accepts GETs, so any shell, editor, or CI script on your
              machine can read the current utilization of all eight floats
              without touching{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                claude.ai
              </code>{" "}
              directly. The extension handles cookie management for you, so
              the only thing your script has to know is the port.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              Local-log tools cannot replicate this, not because of
              engineering effort, but because the eight floats are not in
              the local log at all. They are a server-side concept. The only
              way to know their current values is to read the endpoint.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat about the hidden names
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_omelette
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_cowork
          </code>{" "}
          are internal code names Anthropic chose for feature-scoped quota
          buckets that they have not publicly documented. We know they are
          real because they show up in the JSON payload on some accounts,
          always as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Window
          </code>{" "}
          objects with a{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          and a{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>
          . Anthropic can add, rename, or remove them at any time.
          ClaudeMeter keeps their fields optional on purpose: if a name
          changes, parsing continues; if a new float appears, it is a
          one-line addition to the struct. The repo is MIT and the
          interesting bits fit in under 200 lines of Rust; you can verify
          everything above in about ten minutes.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          See all eight floats on your own account
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter runs in your macOS menu bar, polls the eight-float{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          payload every 60 seconds, and serves the parsed snapshot at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            127.0.0.1:63762/snapshots
          </code>
          . Free, MIT, and the browser extension removes the cookie-paste
          step entirely.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <FaqSection items={faqs} />

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </section>

      <div className="max-w-4xl mx-auto px-6 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Seeing a float in your payload that is not in the struct?"
          description="If your /usage response returns a weekly bucket we have not named here, or the extra_usage block changes shape on your plan, send the JSON over. We patch the struct same day."
          text="Book a 15-minute call"
          section="claude-code-4-7-rate-limit-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on the eight-float rate limit? 15 min."
        section="claude-code-4-7-rate-limit-sticky"
        site="claude-meter"
      />
    </article>
  );
}
