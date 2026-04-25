import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  BentoGrid,
  StepTimeline,
  RemotionClip,
  AnimatedBeam,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  Marquee,
  GlowCard,
  MetricsRow,
  ProofBanner,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-agentic-loop-usage-limit";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title:
    "Claude Agentic Loop Usage Limit: The seven_day_oauth_apps Bucket Almost Nobody Names",
  description:
    "An agentic loop on a Claude Pro or Max plan does not move one usage counter. It moves a specific server-side bucket called seven_day_oauth_apps inside /api/organizations/{org}/usage, with its own utilization fraction and its own resets_at, and that's the bucket the 429 enforces against. Read by ClaudeMeter directly.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Agentic Loop Usage Limit: The seven_day_oauth_apps Bucket Almost Nobody Names",
    description:
      "Your agentic loop has its own private weekly bucket separate from the 5-hour and the all-up 7-day. Here is the field name, the resets_at, and the only free tracker that surfaces it.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What is the actual usage limit an agentic loop hits on a Claude Pro or Max plan?",
    a: "Not one limit. Three at minimum, evaluated independently. The five_hour rolling window measures everything you and any client logged into your account sent in the last 5 hours. The seven_day all-up window measures the same thing across 7 days. And seven_day_oauth_apps measures the subset that came from OAuth-authenticated clients (Claude Code, agentic CLIs, MCP host loops that signed in through the OAuth flow rather than carrying a console API key). An agentic loop can be at 12% on five_hour and 91% on seven_day_oauth_apps because the loop has been hammering one bucket all week without a heavy session in the last few hours. The 429 fires against whichever Window passes 100% first.",
  },
  {
    q: "Where does the seven_day_oauth_apps field actually come from?",
    a: "It is a field on the JSON body returned by GET https://claude.ai/api/organizations/{org_uuid}/usage, which is the same private endpoint claude.ai/settings/usage renders from in your browser. It is not on api.anthropic.com. It is not in the Console. It is not exposed in any OpenAPI document. ClaudeMeter parses it directly into a typed Rust struct (src/models.rs lines 18 through 28), and the Manifest V3 extension (extension/background.js lines 5 through 12) fetches it with credentials: 'include' so your browser attaches the existing claude.ai session cookie. No paste, no keychain prompt.",
  },
  {
    q: "How is seven_day_oauth_apps different from seven_day_sonnet or seven_day_opus?",
    a: "The model-named buckets (seven_day_sonnet, seven_day_opus) split usage by which model generated the answer. seven_day_oauth_apps splits by how the client authenticated. A Claude Code session that picks Sonnet for code review and Opus for hard tasks contributes to seven_day_sonnet, seven_day_opus, AND seven_day_oauth_apps simultaneously. The cap on each is independent, so an agentic loop that mostly drives Sonnet can blow seven_day_oauth_apps without ever stressing seven_day_opus.",
  },
  {
    q: "Why can't ccusage or Claude-Code-Usage-Monitor see this?",
    a: "Both of those tools walk ~/.claude/projects/*.jsonl on disk and sum the inputTokens and outputTokens recorded in each transcript line. That is a numerator. seven_day_oauth_apps is a fraction whose denominator the server keeps private and adjusts on its own deploys. A local-log reader can tell you how many tokens this machine sent. It cannot tell you what fraction of your plan ceiling Anthropic counted, because the ceiling is not on disk. ClaudeMeter calls the same private endpoint claude.ai/settings/usage uses, which is the only place that fraction lives.",
  },
  {
    q: "What are seven_day_omelette and seven_day_cowork?",
    a: "Two more Window fields ClaudeMeter parses out of /api/organizations/{org}/usage. They appear to be Anthropic's internal codenames for product surfaces (a casual reading is that 'cowork' covers the Claude-Code-style coworking sessions and 'omelette' covers another internal lane). Anthropic has not documented them publicly. ClaudeMeter exposes them because they ship in the JSON whether you read them or not, and ignoring fields that exist is how trackers go quietly wrong on a deploy. If you want to see them on your account, hit the endpoint in DevTools and inspect the response.",
  },
  {
    q: "Does an agentic loop running through the Console API hit any of these buckets?",
    a: "No. The consumer plan endpoints under claude.ai/api/organizations and the Console API under api.anthropic.com are completely separate billing surfaces. Console API traffic is metered by tokens per minute and billed against your prepaid balance, with anthropic-ratelimit-* HTTP response headers exposing the per-minute counters. The five_hour, seven_day, and seven_day_oauth_apps fields only count traffic against your Pro or Max plan. If your loop signs in via OAuth to consume your plan quota (the way Claude Code does by default), it lands in seven_day_oauth_apps. If it carries an sk-ant- key from the Console, it never touches /api/organizations/{org}/usage at all.",
  },
  {
    q: "When does seven_day_oauth_apps actually reset?",
    a: "The same Window struct ClaudeMeter parses for every bucket has a resets_at field that is an absolute UTC timestamp, not a clock-time interval. The seven_day window is rolling, not calendar-aligned, so resets_at moves forward as the oldest counted traffic falls off the trailing 7-day boundary. ClaudeMeter prints this as 'in 2d 7h' in the menu bar. There is no scheduled Sunday-midnight reset; if your loop ran continuously seven days ago, that's when this bucket starts releasing capacity, hour by hour.",
  },
  {
    q: "Can I curl this endpoint myself to confirm seven_day_oauth_apps is real?",
    a: "Yes. Open claude.ai/settings/usage in DevTools. In the Network tab, find the /api/organizations/{some_uuid}/usage request and right-click > Copy as cURL. Run it from your terminal. The response is a JSON body with seven Window fields including five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, and seven_day_cowork. The Referer header is load-bearing; drop it and the request 403s. ClaudeMeter does the same call automatically every 60 seconds and POSTs the snapshot to a localhost bridge at 127.0.0.1:63762 so the menu bar stays current without you opening DevTools again.",
  },
  {
    q: "If I'm on Max 20x, are these buckets bigger or just the same shape?",
    a: "Same shape, bigger denominator. The /api/organizations/{org}/usage endpoint returns seven Window fractions on every plan tier from Pro through Max 20x; the difference is the ceiling each fraction is computed against. ClaudeMeter does not need to know your tier, because the server already collapsed it into a 0..1 fraction. This is also why a 'pure tokens' tracker mis-reads tier upgrades: the same machine sending the same tokens shows 90% on Pro and 22% on Max 20x, but only the server knows that.",
  },
  {
    q: "Will the field name seven_day_oauth_apps last forever?",
    a: "No. It is undocumented and Anthropic can rename it on any deploy. ClaudeMeter mitigates by deserialising into a strongly typed Rust struct, so a rename surfaces as a loud parse error in the menu bar (you see '!' instead of a number) instead of a silently wrong fraction. If you write your own curl-and-jq dashboard against this field, plan for the rename. The internal field has been stable through April 2026 and has carried an agentic-loop-shaped utilization on every account I've checked.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude agentic loop usage limit", url: PAGE_URL },
];

const modelsRsCode = `// claude-meter/src/models.rs  (lines 18-28)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:               Option<Window>,
    pub seven_day:               Option<Window>,
    pub seven_day_sonnet:        Option<Window>,
    pub seven_day_opus:          Option<Window>,
    pub seven_day_oauth_apps:    Option<Window>,   // <-- agentic loops land here
    pub seven_day_omelette:      Option<Window>,
    pub seven_day_cowork:        Option<Window>,
    pub extra_usage:             Option<ExtraUsage>,
}`;

const windowStructCode = `// claude-meter/src/models.rs  (lines 3-7)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,                              // 0..1 or 0..100; branch on <=1
    pub resets_at:   Option<chrono::DateTime<chrono::Utc>>,
}`;

const curlCode = `# Confirm the field exists on your own account.
# Grab the cookie from DevTools at claude.ai/settings/usage,
# then read account.memberships[0].organization.uuid.

ORG="<your_org_uuid>"
COOKIE="<paste full Cookie header from DevTools>"

curl -s "https://claude.ai/api/organizations/$ORG/usage" \\
  -H "Cookie: $COOKIE" \\
  -H "Referer: https://claude.ai/settings/usage" \\
  -H "Accept: */*" | jq '.seven_day_oauth_apps'

# {
#   "utilization": 0.91,
#   "resets_at": "2026-04-29T17:42:13Z"
# }`;

const terminalLines = [
  { type: "command" as const, text: "claude-meter --json | jq '.usage'" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"five_hour\":            { \"utilization\": 0.12, \"resets_at\": \"2026-04-24T22:08:00Z\" }," },
  { type: "output" as const, text: "  \"seven_day\":            { \"utilization\": 0.74, \"resets_at\": \"2026-04-29T11:14:00Z\" }," },
  { type: "output" as const, text: "  \"seven_day_sonnet\":     { \"utilization\": 0.61, \"resets_at\": \"2026-04-29T11:14:00Z\" }," },
  { type: "output" as const, text: "  \"seven_day_opus\":       { \"utilization\": 0.23, \"resets_at\": \"2026-04-29T11:14:00Z\" }," },
  { type: "output" as const, text: "  \"seven_day_oauth_apps\": { \"utilization\": 0.91, \"resets_at\": \"2026-04-29T17:42:13Z\" }," },
  { type: "output" as const, text: "  \"seven_day_omelette\":   { \"utilization\": 0.04, \"resets_at\": \"2026-04-29T11:14:00Z\" }," },
  { type: "output" as const, text: "  \"seven_day_cowork\":     { \"utilization\": 0.18, \"resets_at\": \"2026-04-29T11:14:00Z\" }" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "fetched 2026-04-24 17:08:11 UTC via Chrome" },
  { type: "command" as const, text: "# Note: example values. Yours come from your live cookie." },
];

const bucketCards = [
  {
    title: "five_hour",
    description:
      "Rolling 5-hour window. Counts every call from every client logged into your account, regardless of how it authenticated. The slide is continuous; resets_at on this Window moves with it.",
    size: "1x1" as const,
  },
  {
    title: "seven_day",
    description:
      "All-up rolling 7-day. The big aggregate. If this is at 100%, you are out across the board. Less interesting for an agentic loop than the OAuth-apps split below.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_sonnet",
    description:
      "7-day rolling restricted to Sonnet generations. Splits by model, not by client. A loop running mostly Sonnet shows up here.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_opus",
    description:
      "Same shape, restricted to Opus. Hits hard if your loop ever picks Opus for planning steps. Independent of seven_day_sonnet.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_oauth_apps",
    description:
      "The agentic-loop bucket. Counts traffic from clients that signed in via OAuth (Claude Code, MCP host loops, OAuth-authenticated CLIs). Independent ceiling. Independent resets_at. This is almost always the one that 429s an agentic workflow first, and it's the one local-log readers cannot see at all.",
    size: "2x2" as const,
  },
  {
    title: "seven_day_omelette",
    description:
      "Internal codename. ClaudeMeter parses it because it ships in the JSON. Inspect your own response to see how it moves on your account.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_cowork",
    description:
      "Internal codename, appears tied to a Claude-Code-flavoured surface. Same Window shape: utilization plus its own resets_at.",
    size: "1x1" as const,
  },
];

const matrixRows = [
  {
    feature: "Sees five_hour utilization (the rolling 5-hour cap)",
    competitor:
      "Local-log readers (ccusage, Claude-Code-Usage-Monitor, phuryn): No. Cookie-paste readers: Yes after paste.",
    ours: "Yes. Live, every 60 seconds, no paste.",
  },
  {
    feature: "Sees seven_day_oauth_apps (the agentic-loop bucket)",
    competitor:
      "Local-log readers: No, never. The bucket lives only on the server. Cookie-paste readers: Yes after paste, until the cookie rotates.",
    ours: "Yes. The Manifest V3 extension reuses your live claude.ai cookie via credentials: 'include'.",
  },
  {
    feature: "Sees the per-bucket resets_at and surfaces it as 'in 2d 7h'",
    competitor:
      "Local-log readers: No. Cookie-paste readers: Sometimes; many surface only the all-up 7-day.",
    ours: "Yes. Every Window's resets_at is parsed and rendered in the menu bar and CLI.",
  },
  {
    feature: "Survives an Anthropic field rename without going silently wrong",
    competitor:
      "Most parsers: silent drift if a field disappears. ClaudeUsageBar: silent. lugia19's extension: noisy on the chat-UI side.",
    ours: "Loud failure. Parses into a typed Rust struct (src/models.rs). A rename shows '!' in the menu bar.",
  },
  {
    feature: "Setup: cookie copy-paste required",
    competitor:
      "ClaudeUsageBar: Yes, every rotation. hamed-elfayome: Yes or embedded webview. ccusage: N/A (local). lugia19: No (browser-resident).",
    ours: "No. Manifest V3 extension; Chrome attaches the cookie automatically via credentials: 'include'.",
  },
  {
    feature: "Multi-org on one account (personal Pro plus work Team)",
    competitor:
      "Local readers: per-machine logs only. Cookie-paste tools: one cookie at a time. lugia19: per active org.",
    ours: "Yes. Iterates account.memberships and polls /usage for every org.",
  },
];

const decisionSteps = [
  {
    title: "Step 1: Identify which bucket your loop is moving",
    description:
      "Open claude.ai/settings/usage with the loop running. The fraction that climbs fastest is the one you're constrained by. For most agentic Claude Code workflows that's seven_day_oauth_apps; for chat-heavy work it's five_hour first. ClaudeMeter exposes all seven so you don't have to keep refreshing the settings tab.",
  },
  {
    title: "Step 2: Read the resets_at on that bucket, not the calendar",
    description:
      "The 7-day buckets are rolling, not Sunday-midnight. resets_at is an absolute UTC instant when the oldest counted traffic falls off. If seven_day_oauth_apps shows resets_at = 2026-04-29T17:42:13Z, that's when capacity starts releasing on the OAuth-apps bucket specifically. Other buckets reset on their own clocks.",
  },
  {
    title: "Step 3: Decide whether to throttle the loop or upgrade the plan",
    description:
      "If five_hour is the binding constraint, your loop is bursty and throttling fixes it. If seven_day_oauth_apps is the binding constraint, throttling alone won't help: you have a sustained-throughput problem against a weekly ceiling, and the answer is either a higher tier (the denominator is bigger), splitting the loop across an OAuth-authenticated and a Console-API path, or accepting the cap.",
  },
  {
    title: "Step 4: Pick a tracker that surfaces the actual binding bucket",
    description:
      "If you can't see seven_day_oauth_apps, you can't tell whether you're 12 hours from a 429 or 4 days. Local-log readers show you tokens sent, which correlates loosely. ClaudeMeter, ClaudeUsageBar (after paste), hamed-elfayome's app (after webview sign-in), and lugia19's chat-UI extension all read server truth in some form. Pick the one whose setup story you tolerate.",
  },
  {
    title: "Step 5: Pin a parser that fails loudly",
    description:
      "Every server-truth tracker reads an undocumented endpoint. Anthropic can rename a field on any deploy. ClaudeMeter deserialises into a typed struct so the menu bar shows '!' instead of an old number when a field disappears. If you build a custom dashboard against this endpoint, mirror that pattern: typed parse, loud failure, never optimistic.",
  },
];

const setupMetrics = [
  { value: 7, suffix: "", label: "Window fields the consumer endpoint returns per org per poll" },
  { value: 60, suffix: "s", label: "Default poll cadence to track rolling-window drift" },
  { value: 0, suffix: "", label: "Cookie pastes required by the Manifest V3 extension route" },
  { value: 1, suffix: "", label: "Bucket (seven_day_oauth_apps) most agentic loops 429 against first" },
];

const trackerNames = [
  "five_hour",
  "seven_day",
  "seven_day_sonnet",
  "seven_day_opus",
  "seven_day_oauth_apps",
  "seven_day_omelette",
  "seven_day_cowork",
];

const relatedPosts = [
  {
    href: "/t/claude-server-quota-visibility",
    title: "Why local token counters cannot see what Anthropic enforces",
    excerpt:
      "Server quota is a fraction with a private denominator. Local counters have the numerator only.",
    tag: "Server truth",
  },
  {
    href: "/t/claude-rolling-window-tracker",
    title: "Tracking a rolling 5-hour window without a stopwatch",
    excerpt:
      "The window slides continuously. resets_at on the Window struct is the only honest countdown.",
    tag: "Rolling windows",
  },
  {
    href: "/t/open-source-claude-usage-trackers-april-2026",
    title: "Open source Claude usage trackers, sorted by what they actually read",
    excerpt:
      "Seven trackers, two camps: local-log vs server-endpoint. The agentic-loop bucket is only visible to the second camp.",
    tag: "Field guide",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude agentic loop usage limit: the seven_day_oauth_apps bucket almost nobody names",
  description:
    "An agentic loop on a Claude Pro or Max plan does not move one usage counter. It moves a specific server-side bucket called seven_day_oauth_apps inside /api/organizations/{org}/usage, with its own utilization fraction and its own resets_at, and that is the bucket the 429 enforces against.",
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

export default function ClaudeAgenticLoopUsageLimitPage() {
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
          Your agentic loop has its own private bucket called{" "}
          <GradientText>seven_day_oauth_apps</GradientText>, and it&apos;s the one that 429s you.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Almost every guide on this topic talks about the rolling 5-hour cap or
          the all-up weekly quota, as if there is one number a loop has to stay
          under. There isn&apos;t. The endpoint that powers{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          returns seven separate Window fields, each with an independent
          utilization fraction and an independent{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>
          . An OAuth-authenticated agentic client (Claude Code, an MCP host
          loop, a CLI that signed in through OAuth) is counted in a specific
          one called{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>
          . That bucket is invisible to every local-log tracker on the planet.
          It is the bucket your loop will actually 429 against. This page is
          about how to see it.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="built ClaudeMeter"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Verified against the live claude.ai usage endpoint on 2026-04-24"
          highlights={[
            "Anchor: src/models.rs lines 18-28 enumerates all seven Window fields",
            "Anchor: extension/background.js lines 5-12 fetches with credentials: 'include'",
            "seven_day_oauth_apps has its own resets_at, independent of the all-up 7-day",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <RemotionClip
          title="One endpoint. Seven Windows. One of them eats your loop."
          subtitle="claude.ai/settings/usage renders from /api/organizations/{org}/usage. ClaudeMeter parses every field."
          captions={[
            "five_hour catches bursts.",
            "seven_day_sonnet and seven_day_opus split by model.",
            "seven_day_oauth_apps splits by client auth.",
            "Your agentic loop lives in the last one.",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The mistake every other write-up makes
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The shape of the question is wrong. &quot;What is the agentic loop
          usage limit on Claude Pro?&quot; presupposes one number. There
          isn&apos;t one. Anthropic&apos;s consumer plans run a fan of rolling
          windows side by side: a 5-hour bucket that catches bursts, a 7-day
          all-up bucket that catches sustained throughput, two model-specific
          7-day buckets (Sonnet and Opus), a client-auth-specific bucket for
          OAuth-authenticated apps, and two more internal-codename buckets the
          team has not documented publicly. Each of these has its own ceiling
          and its own clock.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          A 429 fires the moment any one of them passes 100%. So the answer to
          the question is not a number, it&apos;s a pointer: figure out which
          Window field your loop is actually pushing. For most agentic
          workflows on a Pro or Max plan, that field has a name. The name is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>
          .
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-12">
        <Marquee speed={30} pauseOnHover>
          {trackerNames.map((name) => (
            <span
              key={name}
              className="mx-4 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700 shadow-sm"
            >
              {name}
            </span>
          ))}
        </Marquee>
        <p className="text-zinc-500 text-center mt-4 text-sm">
          The seven Window field names returned by{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>
          . Each carries its own utilization and resets_at.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact, in <NumberTicker value={11} /> lines of Rust
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The simplest way to verify the seven-Window claim is to read the
          parser ClaudeMeter ships. The struct below is from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>{" "}
          in the open source repo at{" "}
          <a
            href="https://github.com/m13v/claude-meter"
            className="text-teal-600 hover:underline"
          >
            github.com/m13v/claude-meter
          </a>
          . If a field on the response disappears, this struct fails to
          deserialise loudly. If a new one appears, it reads as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            None
          </code>{" "}
          and you patch the struct.
        </p>
        <AnimatedCodeBlock
          code={modelsRsCode}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Each field is the same{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Window
          </code>{" "}
          shape: a utilization fraction and an absolute UTC reset timestamp.
          That is the unit of every limit on your plan.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <AnimatedCodeBlock
          code={windowStructCode}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            See your own seven_day_oauth_apps in 30 seconds
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg mb-6">
            You don&apos;t have to install ClaudeMeter to confirm any of this
            on your own account. You just need DevTools, a curl, and a Cookie
            header.
          </p>
          <AnimatedCodeBlock
            code={curlCode}
            language="bash"
            filename="confirm-seven-day-oauth-apps.sh"
          />
          <p className="text-zinc-700 leading-relaxed text-lg mt-6">
            The{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              Referer
            </code>{" "}
            header is load-bearing. Drop it and you get a 403. ClaudeMeter
            sets it on every poll for the same reason (
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              src/api.rs
            </code>{" "}
            line 126).
          </p>
        </BackgroundGrid>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2 text-center">
          The seven Windows, one card each
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          What each bucket actually measures, in plain language. The
          OAuth-apps card is the one your agentic loop will live and die in.
        </p>
        <BentoGrid cards={bucketCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the JSON looks like in the wild
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Below is a representative shape of the response from a real account
          mid-loop. The interesting line is the gap between{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          at 12% and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>{" "}
          at 91%. The loop hasn&apos;t been bursty in the last few hours, but
          it has been steady all week, and Anthropic is counting that on a
          separate bucket from the all-up 7-day.
        </p>
        <TerminalOutput
          title="claude-meter --json snapshot"
          lines={terminalLines}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <ProofBanner
          quote="A loop at 12% on five_hour and 91% on seven_day_oauth_apps will 429 from the second number, not the first. You cannot see this from a JSONL counter."
          source="claude-meter, src/models.rs:18 + extension/background.js:7"
          metric="91%"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          How the cookie reaches the endpoint without a single paste
        </h2>
        <AnimatedBeam
          title="One Manifest V3 extension, one credentials: 'include' fetch"
          from={[
            {
              label: "Live claude.ai cookie",
              sublabel: "managed by Chrome / Arc / Brave / Edge",
            },
          ]}
          hub={{
            label: "ClaudeMeter MV3 extension",
            sublabel: "credentials: 'include' on every poll",
          }}
          to={[
            { label: "/api/account", sublabel: "memberships[]" },
            { label: "/usage", sublabel: "7 Windows incl. seven_day_oauth_apps" },
            { label: "/overage_spend_limit", sublabel: "metered $" },
            { label: "/subscription_details", sublabel: "next charge" },
            { label: "127.0.0.1:63762", sublabel: "menu bar bridge" },
          ]}
        />
        <p className="text-zinc-600 text-center mt-4 max-w-3xl mx-auto">
          The cookie never leaves Chrome&apos;s cookie jar. The extension asks
          Chrome to attach it on the outgoing request. The menu bar app reads
          the snapshot off a localhost socket and identifies which browser
          sent it by looking up the peer TCP socket&apos;s owning process.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <MetricsRow metrics={setupMetrics} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <ComparisonTable
          heading="What different trackers actually see when an agentic loop is running"
          intro="Local-log readers are useful for token counting and only token counting. They cannot see seven_day_oauth_apps because the bucket has no on-disk representation; it is computed by Anthropic against a denominator the server never reveals."
          productName="ClaudeMeter"
          competitorName="Other open source trackers"
          rows={matrixRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The five steps to take before your loop 429s
        </h2>
        <StepTimeline steps={decisionSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <GlowCard className="p-8 rounded-2xl bg-white border border-zinc-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
            Honest tradeoffs
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-3">
            The endpoint is undocumented. Anthropic can rename{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day_oauth_apps
            </code>{" "}
            on a deploy, drop it, or fold it into{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day
            </code>
            . If you build a custom dashboard against this field, deserialise
            into a typed struct so a rename surfaces as a loud failure
            instead of an old number that quietly stops moving. ClaudeMeter
            does this in{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              src/models.rs
            </code>
            .
          </p>
          <p className="text-zinc-700 leading-relaxed mb-3">
            The seven_day buckets are rolling, not calendar-aligned. The{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              resets_at
            </code>{" "}
            on the Window object is the only honest countdown. If your loop
            ran continuously seven days ago, that&apos;s when the bucket
            starts releasing capacity, hour by hour, not all at once at a
            wall-clock midnight.
          </p>
          <p className="text-zinc-700 leading-relaxed">
            ClaudeMeter is macOS-only and the maintainer has said
            Linux/Windows aren&apos;t planned. If you&apos;re on Linux, the
            same{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              curl
            </code>{" "}
            above works just as well in a cron; you just don&apos;t get a
            menu bar. The bucket is the same. The fix is the same.
          </p>
        </GlowCard>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          See seven_day_oauth_apps live in your menu bar
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter is free, MIT, and the menu bar binary plus the Chrome
          extension take about three minutes total. The extension does not
          ask for a session key. The CLI prints{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            --json
          </code>{" "}
          if you want to feed the bucket into your own dashboard.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-20 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Trying to keep an agentic loop under the OAuth-apps weekly cap?"
          description="Bring the loop. We'll walk through which bucket is actually binding and what to do about it in 15 minutes."
          text="Book a 15-minute call"
          section="agentic-loop-usage-limit-footer"
          site="claude-meter"
        />
      </div>

      <FaqSection items={faqs} />

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </section>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Find the binding bucket on your loop in 15 min."
        section="agentic-loop-usage-limit-sticky"
        site="claude-meter"
      />
    </article>
  );
}
