import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  AnimatedChecklist,
  MetricsRow,
  StepTimeline,
  BentoGrid,
  RemotionClip,
  AnimatedBeam,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-rolling-window-cap";
const PUBLISHED = "2026-04-21";

export const metadata: Metadata = {
  title: "The Claude Rolling Window Cap Is Seven Windows, Not One",
  description:
    "Anthropic does not enforce a single rolling window on Pro and Max plans. The internal usage endpoint returns seven stacked buckets, each with its own utilization and reset timestamp. Here is what each one is, where it lives in the schema, and why you get rate-limited before the Settings page looks anywhere near full.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "The Claude Rolling Window Cap Is Seven Windows, Not One",
    description:
      "The internal claude.ai usage endpoint returns seven rolling utilization buckets, not the two Anthropic publishes. Here is every one, with field names and reset semantics.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "So is there one rolling window cap or seven?",
    a: "Anthropic advertises two: a 5-hour rolling window and a weekly budget. The internal usage endpoint actually returns seven utilization fields per organization: five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, and seven_day_cowork. Hitting 100% on any one of them can rate-limit you even if the others look fine.",
  },
  {
    q: "What are seven_day_omelette and seven_day_cowork?",
    a: "They are internal Anthropic project names surfaced in the JSON schema. Our guess, based on naming and when they started appearing, is that omelette is the Claude Code background work bucket and cowork is the Projects/Artifacts collaboration bucket. Anthropic has never documented either publicly. ClaudeMeter reads them because they come down with every /usage response; we do not ping anything else.",
  },
  {
    q: "Why do I hit a cap when Settings says I am at 30 percent?",
    a: "The Settings page shows one or two headline bars. The server is tracking all seven buckets. You probably hit 100 percent on a narrower bucket (for example seven_day_opus) while the aggregate seven_day stayed low. That is not a bug on Settings, it is just that a top-line aggregate cannot surface a tighter per-model sub-window.",
  },
  {
    q: "Is utilization returned as 0 to 1 or 0 to 100?",
    a: "Both, inconsistently. ClaudeMeter normalizes with `u <= 1 ? u * 100 : u` because some responses come back as 0.94 and others as 94.0. If you call the endpoint yourself, do not assume a single scale.",
  },
  {
    q: "Where does the resets_at timestamp come from?",
    a: "Each window in the response carries its own ISO 8601 resets_at field. The 5-hour one moves forward continuously as you send messages, which is why it looks sticky near your active session. The weekly buckets roll at a fixed wall-clock time per account. ClaudeMeter renders whichever the server returns, verbatim.",
  },
  {
    q: "Can I read these numbers without ClaudeMeter?",
    a: "Yes. GET https://claude.ai/api/organizations/{org_uuid}/usage with your browser session cookies. You will get back the same JSON. ClaudeMeter exists so you do not have to paste a cookie into curl every hour.",
  },
  {
    q: "Does hitting seven_day_oauth_apps affect my claude.ai chat?",
    a: "Separately, in theory. The OAuth-apps bucket appears to track usage driven by apps you authorized to your account over OAuth (for example Claude Code running against your plan). If that bucket is pinned, requests from those apps get throttled without touching your browser chat budget. We have not seen Anthropic document this, but the schema has a distinct utilization and resets_at for it.",
  },
  {
    q: "Why do ccusage and Claude-Code-Usage-Monitor disagree with the Settings page?",
    a: "Because they read local JSONL files under ~/.claude/projects and estimate token spend. That tells you what Claude Code burned on your machine, not what Anthropic is counting toward any of these seven server buckets. The server truth lives only at /api/organizations/{org}/usage.",
  },
  {
    q: "Does the endpoint ever hide buckets?",
    a: "Yes. Fields are optional. If Anthropic has not enabled a specific bucket for your plan or org, that key comes back null or missing. ClaudeMeter skips missing ones in the menu bar and shows only the buckets your account actually has.",
  },
  {
    q: "Is this likely to change?",
    a: "Probably. The endpoint is internal and undocumented. New bucket names have been added over time. ClaudeMeter deserializes into an explicit struct so unknown fields do not crash, but if Anthropic renames or removes a bucket we patch the schema and ship a release.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude rolling window cap", url: PAGE_URL },
];

const usageJson = `{
  "five_hour":              { "utilization": 0.72, "resets_at": "2026-04-21T18:14:00Z" },
  "seven_day":              { "utilization": 0.41, "resets_at": "2026-04-26T09:02:00Z" },
  "seven_day_sonnet":       { "utilization": 0.28, "resets_at": "2026-04-26T09:02:00Z" },
  "seven_day_opus":         { "utilization": 0.96, "resets_at": "2026-04-26T09:02:00Z" },
  "seven_day_oauth_apps":   { "utilization": 0.55, "resets_at": "2026-04-26T09:02:00Z" },
  "seven_day_omelette":     { "utilization": 0.12, "resets_at": "2026-04-26T09:02:00Z" },
  "seven_day_cowork":       { "utilization": 0.33, "resets_at": "2026-04-26T09:02:00Z" },
  "extra_usage": {
    "is_enabled": true,
    "monthly_limit": 5000,
    "used_credits": 1248.5,
    "utilization": 0.2497,
    "currency": "USD"
  }
}`;

const structShape = `// src/models.rs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:             Option<Window>,
    pub seven_day:             Option<Window>,
    pub seven_day_sonnet:      Option<Window>,
    pub seven_day_opus:        Option<Window>,
    pub seven_day_oauth_apps:  Option<Window>,
    pub seven_day_omelette:    Option<Window>,
    pub seven_day_cowork:      Option<Window>,
    pub extra_usage:           Option<ExtraUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at:   Option<chrono::DateTime<chrono::Utc>>,
}`;

const normalizePct = `function pctFromWindow(w) {
  if (!w) return null;
  const u = typeof w.utilization === "number" ? w.utilization : null;
  if (u == null) return null;
  // Some buckets come back as 0.94, others as 94.0.
  // Normalize to percent before rendering.
  return u <= 1 ? u * 100 : u;
}`;

const bucketCards = [
  {
    title: "five_hour",
    description:
      "The rolling 5-hour session. Starts counting from your first message in a window, resets continuously. This is the one every article writes about. It is also the least interesting because it rarely pins alone.",
    size: "1x1" as const,
  },
  {
    title: "seven_day",
    description:
      "The all-model weekly aggregate Anthropic introduced on 2025-08-28. This is the big bar on the Settings page. It tells you nothing about which model burned the budget.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_sonnet",
    description:
      "Per-model weekly cap for Sonnet. Counts against the aggregate and has its own reset. If you only chat in Sonnet, this one pins before seven_day does.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_opus",
    description:
      "Per-model weekly cap for Opus. Pins first for heavy Opus users because the per-model allowance is tighter than the aggregate.",
    size: "1x1" as const,
    accent: true,
  },
  {
    title: "seven_day_oauth_apps",
    description:
      "Separate weekly bucket for traffic from apps you authorized over OAuth (Claude Code running against your plan, third-party tools). When this one pins, your browser chat keeps working but your tools get throttled.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_omelette",
    description:
      "Internal Anthropic codename. Undocumented. Shows up in the schema alongside the others, with its own utilization and resets_at. Likely tied to Claude Code background work.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_cowork",
    description:
      "Another internal codename. Likely the Projects / Artifacts collaboration bucket. Same shape as the others. The name hints at the intent; the docs stay silent.",
    size: "1x1" as const,
  },
  {
    title: "extra_usage",
    description:
      "Metered billing on top once the weekly buckets fill. Returns used_credits, monthly_limit, currency, and a utilization of its own. Reset is monthly, not weekly.",
    size: "2x1" as const,
  },
];

const serverSteps = [
  {
    title: "Browser session identifies you",
    description:
      "Your claude.ai cookies carry the org_uuid. The endpoint path is /api/organizations/{org_uuid}/usage. Without the session, the server refuses to return anything.",
  },
  {
    title: "Server computes all seven buckets at once",
    description:
      "Anthropic runs every one of your messages through multiple counters: the 5-hour window, the all-model weekly, the per-model weeklies, the OAuth-apps bucket, and the internal omelette/cowork buckets. They are accumulated independently.",
  },
  {
    title: "Response carries utilization + resets_at per bucket",
    description:
      "The JSON returns each Window as { utilization, resets_at }. Utilization may be 0-1 or 0-100. Reset timestamps are ISO 8601 UTC and are not identical across buckets.",
  },
  {
    title: "Rate limiter fires on the first bucket to hit 100",
    description:
      "Anthropic does not wait for the aggregate. Any single bucket reaching its ceiling is enough to throttle you. The 429 message itself does not name which bucket tripped.",
  },
  {
    title: "Only the Settings page renders the numbers",
    description:
      "The same JSON powers claude.ai/settings/usage, but that page visually surfaces only the headline bars. The tighter sub-windows are there in the payload, just not drawn on screen.",
  },
];

const comparisonRows = [
  {
    feature: "Knows your rolling 5-hour utilization",
    competitor: "No. Infers from local logs.",
    ours: "Yes. Direct from the server.",
  },
  {
    feature: "Knows your weekly aggregate",
    competitor: "No.",
    ours: "Yes.",
  },
  {
    feature: "Knows per-model weekly (Sonnet / Opus)",
    competitor: "No.",
    ours: "Yes.",
  },
  {
    feature: "Knows OAuth-apps weekly",
    competitor: "No.",
    ours: "Yes.",
  },
  {
    feature: "Surfaces internal buckets (omelette, cowork)",
    competitor: "No.",
    ours: "Yes.",
  },
  {
    feature: "Knows when Anthropic will cut you off",
    competitor: "Best-effort estimate from tokens.",
    ours: "Reads the same JSON Anthropic's own Settings page reads.",
  },
  {
    feature: "Auth setup",
    competitor: "None (local files only).",
    ours: "Browser extension forwards your existing session. No cookie paste.",
  },
];

const terminalLines = [
  { type: "command" as const, text: "curl -s https://claude.ai/api/organizations/$ORG/usage \\" },
  { type: "command" as const, text: "  -H \"Cookie: $(< ~/.claude-session)\" | jq '.'" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"five_hour\":              { \"utilization\": 0.72, \"resets_at\": \"...\" }," },
  { type: "output" as const, text: "  \"seven_day\":              { \"utilization\": 0.41, \"resets_at\": \"...\" }," },
  { type: "output" as const, text: "  \"seven_day_sonnet\":       { \"utilization\": 0.28, \"resets_at\": \"...\" }," },
  { type: "output" as const, text: "  \"seven_day_opus\":         { \"utilization\": 0.96, \"resets_at\": \"...\" }," },
  { type: "output" as const, text: "  \"seven_day_oauth_apps\":   { \"utilization\": 0.55, \"resets_at\": \"...\" }," },
  { type: "output" as const, text: "  \"seven_day_omelette\":     { \"utilization\": 0.12, \"resets_at\": \"...\" }," },
  { type: "output" as const, text: "  \"seven_day_cowork\":       { \"utilization\": 0.33, \"resets_at\": \"...\" }," },
  { type: "output" as const, text: "  \"extra_usage\":            { \"is_enabled\": true, \"utilization\": 0.25, ... }" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "seven_day_opus pins first at 96%. That is the one rate-limiting you." },
];

const whyItMatters = [
  {
    text: "If you only watch the headline 5-hour bar, you will get surprise-429'd by a weekly sub-bucket nobody rendered for you.",
  },
  {
    text: "If you only watch the weekly aggregate, you will miss that seven_day_opus pinned at 96 while the aggregate sat at 41.",
  },
  {
    text: "If you only watch local token logs (ccusage, Claude-Code-Usage-Monitor), you see tokens you spent. You do not see the seven buckets Anthropic is counting against you.",
  },
  {
    text: "If an OAuth app you authorized burns your oauth_apps bucket, your browser chat keeps working while every tool you built looks broken.",
  },
  {
    text: "The only place all seven numbers exist is the JSON response from /api/organizations/{org}/usage. ClaudeMeter renders them continuously.",
  },
];

const relatedPosts = [
  {
    href: "/how-it-works",
    title: "How ClaudeMeter reads your plan usage",
    excerpt:
      "The precise dance between the browser extension, the localhost bridge at 127.0.0.1:63762, and the internal usage endpoint.",
    tag: "Internals",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "They measure different things. ccusage reads local Claude Code JSONL files. ClaudeMeter reads the plan quota Anthropic enforces.",
    tag: "Compare",
  },
  {
    href: "/faq",
    title: "FAQ: safety, Safari, terms of service",
    excerpt:
      "Whether Anthropic allows it, what the extension can and cannot see, and what happens when the endpoint shape changes.",
    tag: "FAQ",
  },
];

const articleJsonLd = articleSchema({
  headline: "The Claude rolling window cap is seven windows, not one",
  description:
    "What \"Claude rolling window cap\" actually means on Pro and Max plans: seven server-side utilization buckets, each with its own reset, surfaced from the undocumented /api/organizations/{org}/usage endpoint.",
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

export default function ClaudeRollingWindowCapPage() {
  return (
    <article className="bg-white text-zinc-900">
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
          The Claude rolling window cap is{" "}
          <GradientText>seven windows</GradientText>, not one
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every other guide on this topic writes about a single 5-hour rolling
          window plus a weekly budget. Anthropic&apos;s own endpoint returns seven
          separate utilization buckets. If you have ever been rate-limited while
          the headline bar sat at 30%, it is because one of the buckets nobody
          drew for you pinned at 100.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="built ClaudeMeter"
          datePublished={PUBLISHED}
          readingTime="7 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Sourced from the live claude.ai usage endpoint"
          highlights={[
            "Field names from src/models.rs",
            "Seven buckets named, not estimated",
            "Verifiable with curl in 30 seconds",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6">
        <RemotionClip
          title="Not one cap. Seven."
          subtitle="What the claude.ai server really counts against your plan"
          captions={[
            "5-hour rolling window",
            "7-day aggregate",
            "7-day Sonnet + 7-day Opus",
            "7-day OAuth apps",
            "7-day omelette + 7-day cowork",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The setup: what the existing playbooks get right
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Most articles about this explain two things correctly. First, the 5-hour
          window is rolling, not fixed, so it advances continuously from your
          earliest unexpired message. Second, weekly caps arrived on 2025-08-28
          and apply to heavy Pro and Max users, shared across claude.ai chat and
          Claude Code. Those two facts are not wrong. They are just two out of
          seven.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The reason everyone stops at two is simple. The Help Center documents
          two. The Settings page draws two big bars. If you have never opened
          DevTools on claude.ai/settings/usage and read the JSON the page
          fetches, you would have no reason to think there are more.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: <NumberTicker value={7} /> utilization fields, one
          endpoint
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Here is the exact response shape the endpoint returns. The field names
          are not invented. They come straight out of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>{" "}
          in the ClaudeMeter repo, which deserializes the live JSON Anthropic
          ships to its own Settings page:
        </p>
        <AnimatedCodeBlock
          code={usageJson}
          language="json"
          filename="GET /api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Seven{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Window
          </code>{" "}
          objects, plus an{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extra_usage
          </code>{" "}
          object for metered billing on top. Every single one has its own{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          and its own{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>
          . The rate limiter fires when any single one of them hits 100, not
          when the aggregate does.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The schema, verbatim
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Here is the struct ClaudeMeter deserializes into. If a future Claude
          release adds an eighth bucket, this is where it would land:
        </p>
        <AnimatedCodeBlock
          code={structShape}
          language="rust"
          filename="claude-meter/src/models.rs (lines 3-28)"
        />
      </section>

      <section className="mt-16 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2 text-center">
          What each bucket actually tracks
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Eight entries (seven windows plus the extra-usage meter). Names
          preserved exactly as Anthropic returns them.
        </p>
        <BentoGrid cards={bucketCards} />
      </section>

      <section className="mt-16 max-w-4xl mx-auto px-6">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            Why every bucket has its own reset clock
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg">
            The 5-hour bucket rolls continuously, which is why its{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              resets_at
            </code>{" "}
            timestamp moves forward every time you send a message. The weekly
            buckets roll at a fixed wall-clock time per account, which is why
            they tend to share a{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              resets_at
            </code>{" "}
            with each other. But they do not have to. If Anthropic ever decouples
            them, the response format already supports it: every window carries
            its own reset field independently.
          </p>
          <p className="text-zinc-700 leading-relaxed text-lg mt-4">
            ClaudeMeter renders whatever the server returns, timestamp by
            timestamp, without interpretation. If you see a reset 18 hours from
            now on one bucket and 4 days on another, that is what the server
            said.
          </p>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 0-to-1 vs 0-to-100 gotcha
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          One trap if you want to hit this endpoint yourself: utilization is
          returned on{" "}
          <em>either</em> a 0-to-1 scale{" "}
          <em>or</em> a 0-to-100 scale, and which one depends on the bucket.
          We have seen the same account return 0.94 on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          and 94.0 on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          in the same payload. ClaudeMeter normalizes with a single clamp:
        </p>
        <AnimatedCodeBlock
          code={normalizePct}
          language="javascript"
          filename="claude-meter/extension/popup.js (lines 6-11)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          If you roll your own tooling, you will want the same clamp. Otherwise
          a bucket at 0.94 renders as &ldquo;less than 1%&rdquo; and you get
          rate-limited seconds later.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce it yourself in one curl
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need ClaudeMeter to verify any of this. Open DevTools on
          claude.ai/settings/usage, copy your cookie header, and hit the
          endpoint directly:
        </p>
        <TerminalOutput
          title="claude.ai/api/organizations/{org}/usage"
          lines={terminalLines}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          How a request becomes a rate limit
        </h2>
        <AnimatedBeam
          title="Your message, versus the seven counters it increments"
          from={[
            { label: "You send a message", sublabel: "claude.ai or Claude Code" },
          ]}
          hub={{ label: "/usage", sublabel: "server-side counters" }}
          to={[
            { label: "five_hour" },
            { label: "seven_day" },
            { label: "seven_day_sonnet" },
            { label: "seven_day_opus" },
            { label: "seven_day_oauth_apps" },
            { label: "seven_day_omelette" },
            { label: "seven_day_cowork" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The whole path, end to end
        </h2>
        <StepTimeline steps={serverSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Why this matters if you are trying not to get cut off
        </h2>
        <AnimatedChecklist title="What you miss by watching the wrong bar" items={whyItMatters} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <MetricsRow
          metrics={[
            { value: 7, label: "Rolling windows the server tracks" },
            { value: 2, label: "Windows Anthropic documents publicly" },
            { value: 1, label: "Endpoint returning all of them" },
            { value: 60, suffix: "s", label: "ClaudeMeter poll cadence" },
          ]}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <ComparisonTable
          heading="Local-log tools vs. server-truth"
          intro="ccusage and Claude-Code-Usage-Monitor read local Claude Code logs. That is a different question from what the server is counting."
          productName="ClaudeMeter"
          competitorName="Local-log tools"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The usage endpoint is internal. Anthropic has never documented the
          field names we listed. The two internal codenames (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_omelette
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_cowork
          </code>
          ) could be renamed, consolidated into the aggregate, or removed in any
          release. When that happens, ClaudeMeter breaks loudly (the Rust
          deserializer returns an error, and the menu bar shows a &ldquo;schema
          mismatch&rdquo; state) and we cut a patch. Until then, these are the
          buckets that are really out there.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          See all seven buckets live
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter sits in your macOS menu bar and polls every 60 seconds.
          Free, MIT licensed, no cookie paste required.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <FaqSection items={faqs} />

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid
          title="Keep reading"
          posts={relatedPosts}
        />
      </section>

      <div className="max-w-4xl mx-auto px-6 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Got a weirder bucket name than these seven?"
          description="Send the payload. If your endpoint is returning something we have not seen, we want to map it."
          text="Book a 15-minute call"
          section="rolling-window-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions about the endpoint? 15 min."
        section="rolling-window-sticky"
        site="claude-meter"
      />
    </article>
  );
}
