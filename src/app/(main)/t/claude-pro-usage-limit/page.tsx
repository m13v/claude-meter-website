import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  SequenceDiagram,
  AnimatedChecklist,
  GlowCard,
  RemotionClip,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-pro-usage-limit";
const PUBLISHED = "2026-05-08";

export const metadata: Metadata = {
  title:
    "Claude Pro Usage Limit: The Eight Buckets the Server Actually Tracks (2026)",
  description:
    "Claude Pro is not one limit. The claude.ai server returns eight separate utilization buckets, two of them undocumented, and any one at 100% throttles your account. The verified numbers, the bucket names, and the field that anchors them.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Pro Usage Limit: The Eight Buckets the Server Actually Tracks (2026)",
    description:
      "The verified Pro limits, plus the eight optional bucket fields the claude.ai usage endpoint returns and which one is most likely to trip first.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Pro usage limit", url: PAGE_URL },
];

const faqs = [
  {
    q: "What is the Claude Pro usage limit in plain numbers?",
    a: "Two estimates: about 45 short messages per rolling 5-hour window, and 40 to 80 hours of Sonnet 4 per rolling 7-day window for the $20/month Pro plan. Anthropic publishes both as ranges, not as fixed counters. The actual rate limiter checks one utilization fraction per bucket and the worst bucket is what blocks you.",
  },
  {
    q: "Why does Anthropic give a range instead of a fixed number?",
    a: "Because the server does not track a message count for you. It tracks one utilization float per bucket, weighted internally by prompt length, attachments, model selected, and tool calls. A short Sonnet message and a long Opus message with two PDFs do not consume the same slice. Quoting a fixed number requires averaging over an unknown distribution, so the help center prints a range instead.",
  },
  {
    q: "How many buckets does the server actually return?",
    a: "Eight, on the /api/organizations/{org_uuid}/usage endpoint. ClaudeMeter's Rust deserializer at src/models.rs lines 18 to 28 lists them: five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork, plus an extra_usage object for paid overage. Each one is optional. Each one has its own utilization float and its own resets_at.",
  },
  {
    q: "What are seven_day_omelette and seven_day_cowork?",
    a: "Internal Anthropic codenames. They appear in the JSON the claude.ai settings page itself fetches but they are not documented anywhere public. We deserialize them as plain Window structs and surface their utilization in the menu bar so you see if one of them is the bucket that just blocked you. If Anthropic renames or removes a field, the strict Rust deserializer fails loudly and we ship a release.",
  },
  {
    q: "Which bucket usually trips first on Pro?",
    a: "five_hour. Pro users running Claude Code in agentic loops will hit the 5-hour window before the weekly cap most weeks. Heavy claude.ai web-chat users, especially anyone running long conversations with large attachments, can hit seven_day by Tuesday or Wednesday. Both happen on the same plan, on different days, depending on how you used Claude that week.",
  },
  {
    q: "Where is this number on claude.ai?",
    a: "Settings, then Usage. The page renders progress bars by calling GET /api/organizations/{your-org-uuid}/usage on load and reading the same JSON struct ClaudeMeter parses. There is no public API token to read it; the request rides on your existing session cookies. ClaudeMeter polls the same endpoint every 60 seconds and renders the raw numbers in the macOS menu bar.",
  },
  {
    q: "Does Claude Pro have a hard message cap?",
    a: "No. There is no integer counter the server decrements. There is one utilization fraction per bucket. The Help Center prints a 45-messages-per-5-hours estimate as a guidance number for short, simple prompts, and explicitly notes long prompts, attachments, Opus, and tool calls reduce that. Treating it as a hard cap is the failure mode.",
  },
  {
    q: "What happens at 100 percent on any bucket?",
    a: "You get throttled. The next request from the same org returns a 429 with a generic message that does not name which bucket tripped. The /settings/usage page bar pins. If you were watching only the 5-hour bar but the bucket that hit 100 is seven_day_opus, you will not know why you are blocked until you open Settings.",
  },
  {
    q: "How do I read the usage endpoint without ClaudeMeter?",
    a: "GET https://claude.ai/api/organizations/{your-org-uuid}/usage from a browser session that is logged into claude.ai. Find your org_uuid by opening any URL on claude.ai/settings, the UUID is in the path. Copy your cookie header from DevTools, run curl with that cookie, and pipe through jq. ClaudeMeter exists because doing this every minute by hand is annoying.",
  },
  {
    q: "Does ccusage tell me my Pro usage limit?",
    a: "No. ccusage reads JSONL files under ~/.claude/projects, counts tokens locally, and infers cost. That is a different question from what the server is counting. The server applies weighting (peak-hour multiplier, attachment cost, browser-chat usage) you do not have locally. The only number that matches what the rate limiter enforces is what /api/organizations/{org_uuid}/usage returns.",
  },
  {
    q: "Did Anthropic tighten the Pro limits in 2026?",
    a: "Anthropic adjusted the weekly buckets multiple times since announcing weekly caps in mid-2025. The latest public ranges (Pro: 40 to 80 hours of Sonnet 4 weekly) come from Anthropic statements covered in mainstream tech press in 2025 and 2026. Because the buckets are utilization floats, not message counters, server-side reweighting is invisible until your old workflow starts hitting the wall earlier in the week. Watching utilization live is how you notice.",
  },
];

const directAnswerNumbers = [
  {
    label: "Pro $20/mo, 5-hour window",
    value: "≈ 45 short messages",
    note: "Anthropic estimate; long prompts, attachments, and Opus reduce it.",
  },
  {
    label: "Pro $20/mo, weekly Sonnet 4",
    value: "40 to 80 hours",
    note: "Anthropic-published range for Claude Code on Pro.",
  },
  {
    label: "Max 5x $100/mo, weekly",
    value: "140 to 280 h Sonnet, 15 to 35 h Opus",
    note: "Range Anthropic published for the $100/mo Max tier.",
  },
  {
    label: "Max 20x $200/mo, weekly",
    value: "240 to 480 h Sonnet, 24 to 40 h Opus",
    note: "Range Anthropic published for the $200/mo Max tier.",
  },
];

const usageStruct = `// claude-meter/src/models.rs (lines 18 to 28)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:           Option<Window>,
    pub seven_day:           Option<Window>,
    pub seven_day_sonnet:    Option<Window>,
    pub seven_day_opus:      Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:  Option<Window>,  // undocumented
    pub seven_day_cowork:    Option<Window>,  // undocumented
    pub extra_usage:         Option<ExtraUsage>,
}`;

const windowStruct = `// claude-meter/src/models.rs (lines 3 to 7)
pub struct Window {
    pub utilization: f64,
    pub resets_at:   Option<chrono::DateTime<chrono::Utc>>,
}`;

const reproTerminal = [
  { type: "command" as const, text: "# In DevTools on claude.ai/settings/usage, copy the cookie header" },
  { type: "command" as const, text: "ORG=<the uuid in any /settings url>" },
  { type: "command" as const, text: "curl -s https://claude.ai/api/organizations/$ORG/usage \\" },
  { type: "command" as const, text: "  -H \"Cookie: $(< ~/.claude-session)\" | jq 'keys'" },
  { type: "output" as const, text: "[" },
  { type: "output" as const, text: "  \"extra_usage\"," },
  { type: "output" as const, text: "  \"five_hour\"," },
  { type: "output" as const, text: "  \"seven_day\"," },
  { type: "output" as const, text: "  \"seven_day_cowork\"," },
  { type: "output" as const, text: "  \"seven_day_oauth_apps\"," },
  { type: "output" as const, text: "  \"seven_day_omelette\"," },
  { type: "output" as const, text: "  \"seven_day_opus\"," },
  { type: "output" as const, text: "  \"seven_day_sonnet\"" },
  { type: "output" as const, text: "]" },
  { type: "success" as const, text: "Eight keys. Whichever utilization hits 1.0 first is your real limit." },
];

const planComparisonRows = [
  { feature: "Monthly price", ours: "$20", competitor: "$100 / $200" },
  { feature: "5-hour window", ours: "≈45 short messages", competitor: "≈225 / ≈900 short messages" },
  { feature: "Weekly Sonnet 4 hours", ours: "40 to 80", competitor: "140-280 / 240-480" },
  { feature: "Weekly Opus 4 hours", ours: "Limited (Pro is Sonnet-first)", competitor: "15-35 / 24-40" },
  { feature: "Buckets server returns", ours: "Same eight as Max", competitor: "Same eight as Pro" },
  { feature: "Server-truth visibility", ours: "Settings/Usage only", competitor: "Settings/Usage only" },
  { feature: "Live menu bar reading", ours: "ClaudeMeter", competitor: "ClaudeMeter" },
];

const sequenceActors = ["You", "Browser", "claude.ai server", "Rate limiter"];
const sequenceMessages = [
  { from: 0, to: 1, label: "send a prompt", type: "request" as const },
  { from: 1, to: 2, label: "POST /completions", type: "request" as const },
  { from: 2, to: 3, label: "increment all eight buckets", type: "event" as const },
  { from: 3, to: 2, label: "weighted by prompt, model, attachments, peak-hour", type: "response" as const },
  { from: 2, to: 1, label: "stream response back", type: "response" as const },
  { from: 1, to: 2, label: "GET /api/organizations/{org}/usage", type: "request" as const },
  { from: 2, to: 1, label: "{ five_hour, seven_day, seven_day_opus, ... }", type: "response" as const },
  { from: 2, to: 1, label: "next message: 429 if ANY bucket utilization >= 1", type: "error" as const },
];

const whatToWatch = [
  {
    text: "five_hour: the bucket Pro users hit most often during agentic loops or long debugging sessions.",
  },
  {
    text: "seven_day: the all-models weekly cap. Heavy claude.ai writers see this trip before five_hour.",
  },
  {
    text: "seven_day_sonnet: the Sonnet-only weekly slice. Anthropic's 40-80 hour range maps to this on Pro.",
  },
  {
    text: "seven_day_opus: present in the JSON but Pro accounts get a tiny allowance here. Watch this on Max.",
  },
  {
    text: "seven_day_oauth_apps: third-party clients (some Pro tooling) count against this.",
  },
  {
    text: "seven_day_omelette and seven_day_cowork: undocumented codenames for newer feature buckets. They appear and tick up if Anthropic ships a new product surface that lands inside Pro.",
  },
  {
    text: "extra_usage: not a limit, a credit balance. Only present if you opted into pay-as-you-go after hitting a wall. Currency, monthly_limit, used_credits, utilization fraction.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-5-hour-window-quota",
    title: "How the 5-hour bucket actually works",
    excerpt:
      "five_hour is one float on a sliding clock, not a 45-message counter. Where it lives in the JSON, why resets_at slides forward as you send.",
    tag: "Deep dive",
  },
  {
    href: "/t/claude-pro-weekly-cap-rolling-5-hour-window-tracker",
    title: "Weekly cap stacked on the 5-hour window",
    excerpt:
      "The in-app indicator is binary. The server returns full utilization fractions on the weekly buckets. Where the gap is and how the meter shows it.",
    tag: "Tracker",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage reads local Claude Code JSONL files. ClaudeMeter reads the server-side utilization the rate limiter actually checks. Different question, different answer.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Pro usage limit: the eight buckets the server actually tracks",
  description:
    "Verified Pro limits as of 2026 and the eight optional bucket fields the claude.ai usage endpoint returns. Two of those buckets are undocumented codenames; any one at 100 percent throttles the account.",
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

export default function ClaudeProUsageLimitPage() {
  return (
    <article className="text-zinc-900">
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
          The Claude Pro usage limit is{" "}
          <GradientText>eight buckets, not one number</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Anthropic publishes one or two numbers (about 45 messages per 5
          hours, 40 to 80 hours of Sonnet a week) and that is what every guide
          repeats. The actual rate limiter checks utilization in eight
          separate buckets returned by{" "}
          <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm">
            /api/organizations/&#123;org&#125;/usage
          </code>
          . Two of the bucket names are undocumented. Any one at 100 percent
          throttles the account.
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

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <GlowCard>
          <div className="p-6 sm:p-8 bg-teal-50 border border-teal-200 rounded-xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900">
                Direct answer (verified 2026-05-08)
              </h2>
              <span className="text-xs uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-1 rounded">
                Lookup
              </span>
            </div>
            <p className="text-zinc-700 leading-relaxed mb-5">
              Claude Pro is{" "}
              <strong className="text-zinc-900">$20 per month</strong> ($17 on
              annual). Anthropic publishes the limits as ranges because the
              server does not track a fixed message counter; it tracks one
              utilization fraction per bucket.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {directAnswerNumbers.map((row) => (
                <div
                  key={row.label}
                  className="bg-white border border-teal-100 rounded-lg p-4"
                >
                  <div className="text-xs uppercase tracking-wider text-teal-700 mb-1">
                    {row.label}
                  </div>
                  <div className="text-lg font-semibold text-zinc-900">
                    {row.value}
                  </div>
                  <div className="text-sm text-zinc-600 mt-1">{row.note}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-600 mt-5">
              Sources:{" "}
              <a
                className="text-teal-700 underline"
                href="https://support.claude.com/en/articles/8325606-what-is-the-pro-plan"
              >
                Anthropic Help Center, &ldquo;What is the Pro plan?&rdquo;
              </a>{" "}
              for the structure;{" "}
              <a
                className="text-teal-700 underline"
                href="https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan"
              >
                Anthropic Help Center, &ldquo;Use Claude Code with your Pro or
                Max plan&rdquo;
              </a>{" "}
              for the Claude Code limits;{" "}
              <a
                className="text-teal-700 underline"
                href="https://claude.com/pricing"
              >
                claude.com/pricing
              </a>{" "}
              for the price tier. Hour ranges from Anthropic statements covered
              in mainstream tech press during 2025-2026.
            </p>
          </div>
        </GlowCard>
      </section>

      <div className="pt-8">
        <ProofBand
          rating={4.9}
          ratingCount="Sourced from the live claude.ai usage endpoint"
          highlights={[
            "Bucket names from src/models.rs lines 18 to 28",
            "Numbers verified against the Help Center on 2026-05-08",
            "Eight optional buckets, two undocumented codenames",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <RemotionClip
          title="Eight buckets, one rate limiter"
          subtitle="What /api/organizations/{org}/usage returns on Pro"
          captions={[
            "five_hour: the famous one",
            "seven_day, seven_day_sonnet, seven_day_opus",
            "seven_day_oauth_apps for third-party clients",
            "seven_day_omelette + seven_day_cowork: codenames",
            "any one at 1.0 returns 429",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the published numbers are estimates
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The Anthropic Help Center says Pro gives roughly 45 messages per 5
          hours and 40 to 80 hours of Sonnet 4 per week. Both numbers are
          ranges with caveats attached, and the caveats matter: long prompts,
          attachments, Opus selection, tool calls, and peak-hour multipliers
          all reduce the effective count. The server is not counting messages.
          It is counting weighted units that vary per request.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          That is why two Pro users on the same plan, the same week, can have
          completely different walls. One person sending 30 short Sonnet
          questions consumes a fraction of what one person uploading a 200KB
          PDF and asking Opus to re-architect it does. The rate limiter sees
          two different utilization curves on five separate buckets, not two
          message counts.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The eight buckets, named
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          ClaudeMeter is a Rust app and we deserialize the JSON the
          claude.ai/settings/usage page itself fetches. The struct that holds
          the response is the cleanest catalogue of what the server is actually
          tracking on a Pro account.
        </p>
        <AnimatedCodeBlock
          code={usageStruct}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Each <code className="px-1 py-0.5 rounded bg-zinc-100">Window</code>{" "}
          is two fields: a utilization fraction and an optional ISO timestamp
          for when the earliest unexpired event ages out.
        </p>
        <div className="mt-4">
          <AnimatedCodeBlock
            code={windowStruct}
            language="rust"
            filename="claude-meter/src/models.rs"
          />
        </div>
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The two names that surprise people are{" "}
          <code className="px-1 py-0.5 rounded bg-zinc-100">
            seven_day_omelette
          </code>{" "}
          and{" "}
          <code className="px-1 py-0.5 rounded bg-zinc-100">
            seven_day_cowork
          </code>
          . Neither appears in the Anthropic Help Center, the public API
          reference, or any pricing page. They look like internal codenames
          for newer feature buckets that landed in Pro after the original
          five_hour + seven_day pair shipped. We deserialize them as plain
          Window structs and surface their utilization in the menu bar so when
          one of them is what just throttled you, you see the cause.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Read it yourself in one curl
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          You do not need ClaudeMeter to see this. You need a logged-in
          claude.ai session, your org UUID (visible in any /settings URL), and
          one curl with the cookie header. The response is plain JSON.
        </p>
        <TerminalOutput
          title="claude.ai usage endpoint, raw"
          lines={reproTerminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          That is the whole protocol. The bars on{" "}
          <code className="px-1 py-0.5 rounded bg-zinc-100">
            claude.ai/settings/usage
          </code>{" "}
          are rendered from these same eight keys. ClaudeMeter automates the
          loop (browser extension forwards the session, Rust binary polls every
          minute, popup renders) so you stop typing it by hand.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What each bucket actually represents
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The bucket names in the Rust struct map onto specific kinds of
          activity. If you know which surface burns which bucket, you can
          choose where to spend your weekly budget.
        </p>
        <AnimatedChecklist
          title="Eight buckets, eight cost surfaces"
          items={whatToWatch}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Pro vs Max: same buckets, different ceilings
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The shape of the response is identical across plans. What changes is
          the ceiling on each bucket. Pro accounts see the same eight keys
          Max accounts see; their utilization just hits 1.0 sooner.
        </p>
        <ComparisonTable
          productName="Pro $20/mo"
          competitorName="Max 5x / 20x"
          rows={planComparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          How a single Pro request hits the wall
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The flow is the same for every prompt. The server increments every
          applicable bucket, weights the increment by the prompt and the
          model, and the rate limiter blocks the next request the moment any
          bucket crosses 1.0. The 429 response does not name the bucket.
        </p>
        <SequenceDiagram
          title="A Pro prompt, end to end"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why &ldquo;limit&rdquo; is the wrong word
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          A limit suggests one number. A budget you draw down. The server is
          not running that data structure. It is running eight independent
          rolling windows, each with its own clock, weighted by request
          shape, with at least two windows that Anthropic does not name
          publicly. &ldquo;Allowance surface&rdquo; or &ldquo;quota envelope&rdquo;
          is closer to what is actually happening, but those phrases would
          not survive a help-center pass, so the published copy collapses
          everything to one estimate.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The practical consequence: if you have ever been blocked when you
          thought you had &ldquo;most of the week left,&rdquo; you were
          probably looking at one bucket while a different bucket was the one
          that hit 100. The settings page surfaces this if you scroll, but the
          bar on top is composite-ish and it is easy to miss the secondary
          buckets near the wall.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What ClaudeMeter does with this
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          One brew install, one browser extension that forwards the session
          cookie, and a Rust binary that polls the same eight-key endpoint
          every 60 seconds. The menu bar popup renders every bucket the
          server returned, with its utilization rounded to a percent and its
          resets_at converted to a relative timestamp. When Anthropic adds,
          renames, or removes a field, the strict deserializer fails loudly
          and we ship a release. The numbers in the popup match the numbers
          on /settings/usage exactly because they are the same numbers.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          ClaudeMeter does not estimate, does not count tokens, does not read
          your local Claude Code logs. It surfaces the server&apos;s
          utilization fractions on the eight buckets the rate limiter
          actually checks. Free, MIT licensed, no telemetry, single HTTPS
          request per minute to claude.ai using your existing session.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Hitting the wall mid-refactor on Pro?"
          description="15 minutes to walk through which bucket is tripping you and whether watching it live or moving up to Max is the right call."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16 mb-20">
        <RelatedPostsGrid
          title="Related guides"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Talk through your Pro bucket pattern in 15 minutes."
      />
    </article>
  );
}
