import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  AnimatedChecklist,
  StepTimeline,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-max-usage-tracker";
const PUBLISHED = "2026-04-29";

export const metadata: Metadata = {
  title:
    "Claude Max usage tracking: it is seven counters, not one, and most trackers only show two of them",
  description:
    "A Claude Max plan is metered by seven independent utilization windows plus an extra-usage block, all returned by claude.ai/api/organizations/{org}/usage. Most browser extensions and CLI tools collapse them into a session bar and a weekly bar. Here is the full shape, why each bucket bites you, and how ClaudeMeter exposes all of them.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Max usage tracking: it is seven counters, not one",
    description:
      "Claude Max usage is not one number. It is seven independent windows from three undocumented endpoints. Here is the full JSON shape and which bucket bites first.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "How do I track Claude Max plan usage end to end?",
    a: "Open claude.ai/settings/usage in a logged-in browser. The page reads three internal endpoints behind the scenes: /api/organizations/{org}/usage (returns seven utilization windows plus the extra_usage block), /api/organizations/{org}/overage_spend_limit (your monthly extra-usage cap and credits used), and /api/organizations/{org}/subscription_details (next charge date and payment method). To watch all three live, install ClaudeMeter; the macOS menu bar app and the browser extension both pull the same three endpoints with your existing claude.ai session cookies once a minute. No paste, no API key, no embedded sign-in.",
  },
  {
    q: "What are the seven utilization windows?",
    a: "From the JSON the endpoint returns: five_hour (the rolling 5-hour session window), seven_day (the overall weekly bucket), seven_day_sonnet (Sonnet-specific weekly bucket), seven_day_opus (Opus-specific weekly bucket), seven_day_oauth_apps (usage attributed to OAuth-connected third-party apps), seven_day_omelette (an internal-name bucket that some accounts have populated), and seven_day_cowork (collaboration features). They are independent. You can be at 12 percent on seven_day_opus and 91 percent on five_hour at the same moment. The rate limiter fires on whichever bucket hits 100 first, which is why watching only the first two collapses the picture.",
  },
  {
    q: "Why is tracking the seven_day_opus bucket separately important on Max?",
    a: "Because Opus eats the Opus-specific weekly bucket faster than the same workload eats the Sonnet bucket, but most trackers only show one combined weekly bar. If you do a heavy Opus refactor on Monday morning, your seven_day_opus.utilization can be at 70 percent while seven_day.utilization is at 28 percent. The combined-weekly bar tells you you are fine. The Opus-specific bar tells you Opus is going to throttle this Wednesday. They are different questions.",
  },
  {
    q: "What is the extra_usage block?",
    a: "It is the new April 2026 metered-billing block on the same /usage payload. The shape is { is_enabled, monthly_limit, used_credits, utilization, currency }. is_enabled tells you whether your account opted into pay-as-you-go; monthly_limit is the dollar cap you set; used_credits is how much you have spilled this month after running out of plan quota; utilization is used_credits / monthly_limit. ClaudeMeter parses this into an ExtraUsage Rust struct (src/models.rs lines 9 to 16) and surfaces it next to the seven utilization windows so you can see plan-quota exhaustion and dollars-spent in the same view.",
  },
  {
    q: "Does ccusage or Claude-Code-Usage-Monitor show any of this?",
    a: "No. Both read ~/.claude/projects/*.jsonl files written by the Claude Code CLI and count tokens locally. Local token counts have no relationship to the server-side utilization fields. ccusage is great for understanding which session burned which model and at what cost; it cannot tell you what percent of your Max plan's seven_day_opus bucket is gone, because that information only exists on Anthropic's side. ClaudeMeter and ccusage measure different things and complement each other.",
  },
  {
    q: "Why do some utilization values come back as 0.64 and others as 64.0?",
    a: "Inconsistent. The same payload from the same endpoint returns some windows on the 0-1 scale and others on the 0-100 scale. ClaudeMeter normalizes with the clamp u <= 1 ? u * 100 : u (extension/background.js, pctFromWindow function, lines 58 to 63). If you build your own dashboard against this endpoint without that clamp, you will plot two scales on the same axis and the chart will look broken every time the format flips.",
  },
  {
    q: "How often does ClaudeMeter poll?",
    a: "Once per 60 seconds. The browser extension uses chrome.alarms.create('refresh', { periodInMinutes: 1 }) (extension/background.js line 105). The macOS menu bar app refreshes on the same cadence by default and lets you change it from 30 seconds to 5 minutes in the popover. 60 seconds is the cadence that catches a slope change in five_hour without hammering Anthropic's endpoint.",
  },
  {
    q: "Does Claude's official Usage page show all seven buckets?",
    a: "No. claude.ai/settings/usage renders a 5-hour bar, a weekly bar, and the per-model breakdowns when expanded. seven_day_oauth_apps, seven_day_omelette, and seven_day_cowork are in the JSON response but are not surfaced as separate bars on the page. You see them by opening DevTools, copying the response of /api/organizations/{org}/usage, and reading the field list. ClaudeMeter shows whichever ones come back populated for your account so a non-zero bucket cannot hide.",
  },
  {
    q: "Is the /api/organizations/{org}/usage endpoint official?",
    a: "No. It is internal and undocumented. It powers claude.ai/settings/usage, which means Anthropic depends on it being correct, but they can rename fields or remove buckets in any release. ClaudeMeter deserializes into an explicit Rust struct (src/models.rs UsageResponse), so a schema change surfaces as a parse error rather than a silent zero. The seven field names listed above were stable through 2026-04-29.",
  },
  {
    q: "Will ClaudeMeter work without a paid plan?",
    a: "There is nothing for it to meter on a free account. The endpoint returns a payload with the windows present but utilization fields populated only when the plan has quota to consume. If you are on Pro you see five_hour and seven_day plus the per-model windows. If you are on Max you see all seven plus extra_usage when the metered-billing block is enabled. Free accounts do not have plan quota, so the bars stay at zero or null.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Max usage tracking", url: PAGE_URL },
];

const fullPayloadJson = `{
  "five_hour":              { "utilization": 0.91, "resets_at": "2026-04-29T19:14:00Z" },
  "seven_day":              { "utilization": 0.42, "resets_at": "2026-05-04T09:02:00Z" },
  "seven_day_sonnet":       { "utilization": 0.28, "resets_at": "2026-05-04T09:02:00Z" },
  "seven_day_opus":         { "utilization": 0.71, "resets_at": "2026-05-04T09:02:00Z" },
  "seven_day_oauth_apps":   { "utilization": 0.05, "resets_at": "2026-05-04T09:02:00Z" },
  "seven_day_omelette":     { "utilization": 0.00, "resets_at": "2026-05-04T09:02:00Z" },
  "seven_day_cowork":       { "utilization": 0.12, "resets_at": "2026-05-04T09:02:00Z" },
  "extra_usage": {
    "is_enabled": true,
    "monthly_limit": 50,
    "used_credits": 4.20,
    "utilization": 0.084,
    "currency": "USD"
  }
}
// GET /api/organizations/{org_uuid}/usage
// Same shape claude.ai/settings/usage consumes`;

const rustStructCode = `// claude-meter/src/models.rs (lines 18-28)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:             Option<Window>,
    pub seven_day_sonnet:      Option<Window>,
    pub seven_day_opus:        Option<Window>,
    pub seven_day_oauth_apps:  Option<Window>,
    pub seven_day_omelette:    Option<Window>,
    pub seven_day_cowork:      Option<Window>,
    pub extra_usage:           Option<ExtraUsage>,
}`;

const threeEndpointsCode = `// claude-meter/src/api.rs (lines 19, 35, 49)
const BASE: &str = "https://claude.ai/api";

// 1. The seven utilization windows + extra_usage block
get_json(&client, &cookie_header,
    &format!("{BASE}/organizations/{org}/usage"))

// 2. Pay-as-you-go monthly cap and credits used
get_json(&client, &cookie_header,
    &format!("{BASE}/organizations/{org}/overage_spend_limit"))

// 3. Next charge date, billing interval, payment method
get_json(&client, &cookie_header,
    &format!("{BASE}/organizations/{org}/subscription_details"))`;

const normalizeCode = `// claude-meter/extension/background.js (lines 58-63)
function pctFromWindow(w) {
  if (!w) return null;
  const u = typeof w.utilization === "number" ? w.utilization : null;
  if (u == null) return null;
  // some buckets return 0.64, others return 64.0 — normalize
  return u <= 1 ? u * 100 : u;
}`;

const bridgeCode = `// claude-meter/extension/background.js (lines 1-3, 46-56)
const BASE = "https://claude.ai";
const BRIDGE = "http://127.0.0.1:63762/snapshots";
const POLL_MINUTES = 1;

async function postToBridge(snapshots) {
  try {
    await fetch(BRIDGE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshots),
    });
  } catch (_e) {
    // bridge may not be running; that's fine — popup still works
  }
}`;

const bucketSteps = [
  {
    title: "five_hour",
    description:
      "The rolling 5-hour session window. Resets continuously: oldest message rolls out 5 hours after it was sent. Hits 100 first for almost all heavy Claude Code users on Max. The bucket that throws the surprise message limit reached mid-refactor.",
  },
  {
    title: "seven_day",
    description:
      "The overall weekly bucket. Aggregates everything you do across all models. Slow-moving for most Max users; fast-moving for heavy writers. Resets weekly on a fixed UTC offset tied to your account's billing day.",
  },
  {
    title: "seven_day_sonnet",
    description:
      "Sonnet-specific weekly bucket. Independent of seven_day_opus. Tracks how much of your weekly Sonnet allowance you have used. Most Max users sit here at moderate utilization; this is rarely the bucket that bites first.",
  },
  {
    title: "seven_day_opus",
    description:
      "Opus-specific weekly bucket. The bucket that bites Max users with heavy Opus workloads. Can reach 100 mid-week even when seven_day is at 30 percent and seven_day_sonnet is at 20 percent. Watch this if you run Opus a lot.",
  },
  {
    title: "seven_day_oauth_apps",
    description:
      "Weekly usage attributed to OAuth-connected third-party apps (Claude integrations, GitHub Copilot-style integrations, anything that holds a Claude OAuth token on your behalf). On most accounts this stays near zero; on accounts with many integrations connected it can climb in the background.",
  },
  {
    title: "seven_day_omelette",
    description:
      "Internal-name bucket. Populated on some accounts, zero on others. The literal field name is seven_day_omelette in the JSON response. ClaudeMeter exposes it as-is rather than rename or hide it, because hiding a bucket means hiding the reason a future limit fires.",
  },
  {
    title: "seven_day_cowork",
    description:
      "Weekly bucket attributed to collaboration features (shared projects, team artifacts). Distinct from the per-model weekly buckets. Mostly relevant for Max users on team plans.",
  },
];

const whichBucketBitesRows = [
  {
    feature: "Heavy Claude Code agentic loop in one afternoon",
    competitor: "five_hour goes red first, often within 90 minutes of starting",
    ours: "seven_day_opus is the second to red if the model is Opus",
  },
  {
    feature: "Slow steady weekly Pro-style writing",
    competitor: "seven_day creeps up linearly through the week",
    ours: "five_hour stays low, seven_day_sonnet tracks seven_day closely",
  },
  {
    feature: "Heavy Opus refactor Monday morning",
    competitor: "seven_day_opus jumps to 60-70 percent by lunch",
    ours: "five_hour spikes during the work, seven_day stays under 30 percent",
  },
  {
    feature: "Several OAuth integrations holding tokens",
    competitor: "seven_day_oauth_apps climbs even when you are not in claude.ai",
    ours: "Other six buckets unchanged; this one needs explicit attention",
  },
  {
    feature: "Pay-as-you-go enabled, plan quota exhausted",
    competitor: "extra_usage.utilization climbs in dollar terms",
    ours: "five_hour and seven_day stay pinned at 1.0; the new movement is in extra_usage",
  },
];

const trackerComparisonRows = [
  {
    feature: "Reads /api/organizations/{org}/usage (server quota)",
    competitor: "No",
    ours: "Yes, every 60 seconds",
  },
  {
    feature: "Surfaces all seven utilization windows",
    competitor: "No (most show 5-hour + weekly only)",
    ours: "Yes, populated buckets shown as-is",
  },
  {
    feature: "Surfaces seven_day_opus separate from seven_day_sonnet",
    competitor: "No (collapsed into one weekly bar)",
    ours: "Yes",
  },
  {
    feature: "Surfaces extra_usage block (April 2026 metered billing)",
    competitor: "No",
    ours: "Yes, with monthly_limit and used_credits in dollars",
  },
  {
    feature: "Reads /overage_spend_limit and /subscription_details",
    competitor: "No",
    ours: "Yes (next charge date, payment method, monthly cap)",
  },
  {
    feature: "Setup",
    competitor: "Manual cookie paste, embedded WebKit sign-in, or API key",
    ours: "Install, log into claude.ai once, done",
  },
  {
    feature: "Data source for token-counting tools",
    competitor: "~/.claude/projects/*.jsonl local logs (cannot see server quota)",
    ours: "Server endpoint that powers claude.ai/settings/usage",
  },
];

const ourClaim = [
  { text: "Reads the same /api/organizations/{org}/usage endpoint claude.ai/settings/usage uses." },
  { text: "Deserializes all seven utilization windows into typed Rust fields, no buckets dropped." },
  { text: "Pulls /overage_spend_limit and /subscription_details on the same poll for full plan picture." },
  { text: "Browser extension forwards your live session via localhost bridge on port 63762, no paste." },
  { text: "Free, MIT licensed, single HTTPS request per minute, zero telemetry." },
];

const terminalLines = [
  { type: "command" as const, text: "# pull the full usage shape with your live cookies" },
  { type: "command" as const, text: "ORG=$(jq -r .last_active_org < ~/.config/claude-meter/session.json)" },
  { type: "command" as const, text: "curl -s https://claude.ai/api/organizations/$ORG/usage \\\n     -H \"Cookie: $COOKIE\" | jq 'keys'" },
  { type: "output" as const, text: "[" },
  { type: "output" as const, text: "  \"five_hour\"," },
  { type: "output" as const, text: "  \"seven_day\"," },
  { type: "output" as const, text: "  \"seven_day_sonnet\"," },
  { type: "output" as const, text: "  \"seven_day_opus\"," },
  { type: "output" as const, text: "  \"seven_day_oauth_apps\"," },
  { type: "output" as const, text: "  \"seven_day_omelette\"," },
  { type: "output" as const, text: "  \"seven_day_cowork\"," },
  { type: "output" as const, text: "  \"extra_usage\"" },
  { type: "output" as const, text: "]" },
  { type: "success" as const, text: "Eight top-level keys. Track all of them, not just the first two." },
];

const relatedPosts = [
  {
    href: "/t/claude-rolling-window-cap",
    title: "The Claude rolling window cap is seven windows, not one",
    excerpt:
      "The internal claude.ai usage endpoint returns seven rolling utilization buckets. Here are all of them, with field names.",
    tag: "Deep dive",
  },
  {
    href: "/t/claude-max-weekly-quota-tightening",
    title: "Claude Max weekly quota tightening: the 5-hour bucket moved, not the weekly one",
    excerpt:
      "The 2026-03-26 change everyone calls a weekly tightening lives in five_hour.utilization, not seven_day.utilization. Here is the JSON proof.",
    tag: "Internals",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage reads local Claude Code JSONL token counts. ClaudeMeter reads the plan quota Anthropic enforces. Different data, complementary tools.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Max usage tracking: it is seven counters, not one, and most trackers only show two of them",
  description:
    "A Claude Max plan is metered by seven independent utilization windows plus an extra-usage block, all returned by claude.ai/api/organizations/{org}/usage. Here is the full shape and which bucket bites first.",
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

export default function ClaudeMaxUsageTrackerPage() {
  return (
    <article className="min-h-screen text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd, faqJsonLd]),
        }}
      />

      <div className="py-10">
        <Breadcrumbs items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))} />
      </div>

      <header className="max-w-4xl mx-auto px-6 pb-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          Claude Max usage tracking is{" "}
          <GradientText>seven counters, not one</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          The Claude Max plan is metered by seven independent utilization
          windows plus a separate extra-usage block, all returned in the same
          JSON payload at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/api/organizations/&#123;org&#125;/usage
          </code>
          . Most browser extensions and CLI tools collapse this into a 5-hour
          bar and a weekly bar. Two of seven. The other five are where the
          surprise rate-limit hits come from. Below is the full shape, which
          bucket bites first under which workload, and how ClaudeMeter exposes
          all of them on a 60-second poll without a manual cookie paste.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <BackgroundGrid>
          <div className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-3">
            Direct answer (verified 2026-04-29)
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
            How do I track Claude Max plan usage?
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg">
            Read{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              claude.ai/api/organizations/&#123;org&#125;/usage
            </code>{" "}
            with your live session cookies. The JSON returns seven utilization
            windows (
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              five_hour
            </code>
            ,{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day
            </code>
            ,{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day_sonnet
            </code>
            ,{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day_opus
            </code>
            ,{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day_oauth_apps
            </code>
            ,{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day_omelette
            </code>
            ,{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day_cowork
            </code>
            ) plus an{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              extra_usage
            </code>{" "}
            block for the April 2026 metered-billing line item. The rate
            limiter fires on the first one to hit 100 percent, so all seven
            need to be in view. ClaudeMeter polls all three internal endpoints
            (
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              /usage
            </code>
            ,{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              /overage_spend_limit
            </code>
            ,{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              /subscription_details
            </code>
            ) on a 60-second cadence using your existing claude.ai cookies.
            Source verified live against{" "}
            <a
              href="https://claude.ai/settings/usage"
              className="text-teal-600 underline hover:text-teal-700"
            >
              claude.ai/settings/usage
            </a>{" "}
            on 2026-04-29.
          </p>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The full payload, exactly as the endpoint returns it
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Below is a real snapshot from a Claude Max account on 2026-04-29.
          Eight top-level keys. The first seven are{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Window
          </code>{" "}
          objects with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>
          . The eighth is the extra-usage block, with its own dollar-denominated
          shape. Notice how{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          is at 0.91 while{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>{" "}
          is at 0.42 and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          is at 0.71. Three independent stories on the same account at the
          same instant.
        </p>
        <AnimatedCodeBlock
          code={fullPayloadJson}
          language="json"
          filename="GET /api/organizations/{org}/usage"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The seven windows, one by one
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The reason most trackers only surface two of these is that{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          itself only renders two big bars. The full list is in the JSON,
          unrendered. Here is what each one is and when it actually matters.
        </p>
        <StepTimeline steps={bucketSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The Rust struct that catches a schema change loud
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          ClaudeMeter does not parse this JSON with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            serde_json::Value
          </code>{" "}
          and then look for keys. It deserializes into an explicit struct so a
          schema change surfaces as a parse error instead of a silent zero. If
          Anthropic renames{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          to something else next month, the deserializer fails loudly in your
          terminal and you know to update the struct. A field that is dropped
          from the response just becomes{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            None
          </code>{" "}
          (every field is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option&lt;Window&gt;
          </code>
          ), so a missing bucket renders as no bar instead of a wrong bar.
        </p>
        <AnimatedCodeBlock
          code={rustStructCode}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Three endpoints, one poll cycle
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The seven utilization windows are only part of the picture.
          ClaudeMeter pulls two more endpoints on the same minute-poll so the
          extra-usage dollar values, the next-charge date, and the monthly cap
          are all in one snapshot. All three are unauthenticated except for
          your live claude.ai cookies, which the menu bar app reads from the
          browser keychain or the extension forwards via the localhost bridge.
        </p>
        <AnimatedCodeBlock
          code={threeEndpointsCode}
          language="rust"
          filename="claude-meter/src/api.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Which bucket bites first under which workload
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The reason watching only the 5-hour and weekly bars produces
          surprise rate limits is that different work patterns push different
          buckets to 100 first. The five rows below are real patterns
          ClaudeMeter has seen on Max accounts. The pattern in the left column
          is the workload; the middle column is what an extension that only
          shows{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>{" "}
          can see; the right column is what is actually moving on the account
          at the same moment.
        </p>
        <ComparisonTable
          productName="What you actually see"
          competitorName="What the standard 2-bucket view shows"
          rows={whichBucketBitesRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Pull the full key list yourself, in 30 seconds
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          You do not need ClaudeMeter to confirm the seven-key shape. Open
          DevTools on{" "}
          <a
            href="https://claude.ai/settings/usage"
            className="text-teal-600 underline hover:text-teal-700"
          >
            claude.ai/settings/usage
          </a>
          , find the request to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          in the Network tab, copy as cURL, and pipe through{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            jq &apos;keys&apos;
          </code>
          . You get back the same eight top-level keys, every time.
        </p>
        <TerminalOutput
          lines={terminalLines}
          title="DevTools, then curl, then jq"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The one normalize step every tracker needs
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The endpoint is inconsistent about whether utilization comes back on
          the 0-1 scale or the 0-100 scale. Different buckets in the same
          response can use different scales. If you build your own dashboard
          and skip the clamp, your chart will visibly snap to the wrong axis
          every time the format flips. ClaudeMeter applies the same one-line
          clamp in both the Rust core and the extension JavaScript so the menu
          bar bar and the toolbar badge always read the same percentage.
        </p>
        <AnimatedCodeBlock
          code={normalizeCode}
          language="javascript"
          filename="claude-meter/extension/background.js"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The bridge that removes the manual cookie paste
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Most browser extensions that read claude.ai usage either ask you to
          paste the full Cookie header from DevTools, embed a WebKit sign-in
          window, or take an Anthropic API key (which only sees console spend,
          not plan quota). ClaudeMeter does none of these. The extension runs
          in the same origin as claude.ai, so its{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            fetch
          </code>{" "}
          calls carry your live cookies automatically; it then POSTs the
          fetched snapshots to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            http://127.0.0.1:63762/snapshots
          </code>
          , a localhost bridge the macOS menu bar app listens on. Your live
          session never leaves your machine. There is nothing to paste.
        </p>
        <AnimatedCodeBlock
          code={bridgeCode}
          language="javascript"
          filename="claude-meter/extension/background.js"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What ClaudeMeter does that the others do not
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The competitor column below is the modal browser extension or CLI
          tool in this category: a 5-hour bar, a 7-day bar, and a paste-your-cookie
          setup, or a token-counting CLI that reads local JSONL files and
          cannot see server quota at all.
        </p>
        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="Typical Claude usage tracker"
          rows={trackerComparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <AnimatedChecklist
          title="What this gets you"
          items={ourClaim}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want a walk-through of all seven buckets on your account?"
          description="Fifteen minutes; we open claude.ai/settings/usage with you, pull the JSON, and identify which bucket is most likely to bite first given how you use Claude."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16 mb-20">
        <RelatedPostsGrid posts={relatedPosts} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See all seven buckets on your account in 15 minutes."
      />
    </article>
  );
}
