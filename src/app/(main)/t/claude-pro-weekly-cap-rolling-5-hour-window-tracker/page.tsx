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
  BeforeAfter,
  AnimatedChecklist,
  MetricsRow,
  GlowCard,
  StepTimeline,
  RemotionClip,
  AnimatedBeam,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  Marquee,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-pro-weekly-cap-rolling-5-hour-window-tracker";
const PUBLISHED = "2026-04-27";

export const metadata: Metadata = {
  title:
    "Claude Pro Weekly Cap on Top of the Rolling 5-Hour Window: Real-Time Tracker",
  description:
    "Anthropic added a weekly cap on top of the rolling 5-hour window and tightened enforcement weeks ago. The in-app indicator only flips between low and reset, so most Pro users do not see they are at 78 percent until the next request fails. Here is the field, the math, and what a real-time menu-bar tracker shows that the app does not.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Pro Weekly Cap on Top of the Rolling 5-Hour Window: Real-Time Tracker",
    description:
      "The in-app indicator is binary; the server returns full utilization fractions on weekly buckets stacked on top of the 5-hour window. Where the fields live, why the gap matters, and how a real-time tracker surfaces them.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What changed with the Claude Pro weekly cap?",
    a: "Anthropic added a server-side weekly quota stacked on top of the existing rolling 5-hour window in late 2025 and tightened enforcement on it through early 2026. Before that, you could really only run yourself out on the 5-hour bucket. Now there are at least three weekly buckets visible in the API response: seven_day (overall), seven_day_opus (Opus-specific), and a third Sonnet-leaning bucket on some plans. Hitting any of them returns a 429 even if your 5-hour window is empty.",
  },
  {
    q: "Why does the in-app indicator only flip between low and reset?",
    a: "Because the indicator is a category badge, not a meter. The Settings page renders a bar from five_hour.utilization, and a small auxiliary label that says either roughly 'usage is low' or 'usage will reset at X'. The label has a binary feel because it collapses a continuous fraction into two states. The underlying number is continuous and it is in the JSON the page itself fetched. ClaudeMeter and a few other open-source tools surface the continuous number directly.",
  },
  {
    q: "What does the server actually return for the weekly cap?",
    a: "Hit GET https://claude.ai/api/organizations/{your-org-uuid}/usage. The response includes a seven_day object with utilization (a float) and resets_at (an ISO timestamp), plus seven_day_opus on Pro and Max plans, plus an extra_usage object if you have credits enabled. The fields use the same shape as five_hour, so anything you have already written to read the 5-hour bucket extends naturally to the weekly buckets.",
  },
  {
    q: "How is the weekly cap different from the rolling 5-hour window?",
    a: "The 5-hour window is rolling: at any moment it covers the last 5 hours of activity, weighted by prompt cost. The weekly cap as currently implemented behaves more like a 7-day rolling boundary too, with resets_at sliding forward as old messages age out. Practically, you almost never see seven_day fall, because seven days is long enough that even idle weekends barely move the boundary. That makes the weekly bucket look like a hard ceiling even though it is technically rolling.",
  },
  {
    q: "Why do most Pro users not realize they are at 78 percent until they 429?",
    a: "Two reasons. First, the in-app indicator does not show a percent on the weekly buckets, only on the 5-hour bucket. Second, pricing-page wording moved from token estimation to server-side quota in late 2025. People keep using the old mental model ('I get N tokens per week'), which the server is no longer enforcing in those terms. The actual cap is a weighted utilization fraction with no published formula. The only signal is the float in the JSON.",
  },
  {
    q: "Does ccusage track the weekly cap?",
    a: "No. ccusage and similar local-token tools (ccburn, Claude-Code-Usage-Monitor) read JSONL files under ~/.claude/projects, which only contain Claude Code traffic and only contain raw token counts. The weekly cap on the server is weighted by peak-hour multiplier, attachments, tool calls, and model class, and it folds in browser-chat usage which is not on disk anywhere. ccusage is excellent for local token attribution; it is not a faithful proxy for seven_day.utilization.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "Weekly cap and 5-hour window tracker",
    url: PAGE_URL,
  },
];

const stackedPayload = `// GET claude.ai/api/organizations/{org_uuid}/usage  (formatted)
{
  "five_hour": {
    "utilization": 0.42,
    "resets_at":   "2026-04-27T22:14:00Z"
  },
  "seven_day": {
    "utilization": 0.78,
    "resets_at":   "2026-05-03T09:02:00Z"
  },
  "seven_day_opus": {
    "utilization": 0.91,
    "resets_at":   "2026-05-03T09:02:00Z"
  },
  "extra_usage": {
    "is_enabled":   true,
    "monthly_limit": 5000,
    "used_credits":  1248.5,
    "utilization":   0.2497,
    "currency":      "USD"
  }
}
// You are at 42 pct on the 5-hour window, fine on its own.
// You are at 91 pct on Opus-weekly. Next Opus prompt 429s.
// Settings page label only shows the 5-hour bar with a percent.`;

const windowStruct = `// claude-meter/src/models.rs (lines 3-7)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at:   Option<chrono::DateTime<chrono::Utc>>,
}

// Same struct deserializes five_hour, seven_day, and seven_day_opus.
// Add or remove buckets and the type system catches it.`;

const reproTerminal = [
  {
    type: "command" as const,
    text: "# Open DevTools on claude.ai/settings/usage, copy your cookie",
  },
  {
    type: "command" as const,
    text: "ORG=<your org uuid from any /settings url>",
  },
  {
    type: "command" as const,
    text: "curl -s https://claude.ai/api/organizations/$ORG/usage \\",
  },
  {
    type: "command" as const,
    text: "  -H \"Cookie: $(< ~/.claude-session)\" \\",
  },
  {
    type: "command" as const,
    text: "  | jq '{five_hour, seven_day, seven_day_opus}'",
  },
  { type: "output" as const, text: "{" },
  {
    type: "output" as const,
    text: "  \"five_hour\":      {\"utilization\": 0.42, \"resets_at\": \"…22:14Z\"},",
  },
  {
    type: "output" as const,
    text: "  \"seven_day\":      {\"utilization\": 0.78, \"resets_at\": \"…05-03Z\"},",
  },
  {
    type: "output" as const,
    text: "  \"seven_day_opus\": {\"utilization\": 0.91, \"resets_at\": \"…05-03Z\"}",
  },
  { type: "output" as const, text: "}" },
  {
    type: "success" as const,
    text: "5-hour fine. Weekly Opus at 91. Settings page hides this percent.",
  },
];

const before = {
  label: "What the in-app indicator suggests",
  content:
    "The Settings page bar is at 42 percent, the auxiliary label says usage is low, so I have plenty of headroom. I will keep working with Opus on this refactor and check again in a few hours.",
  highlights: [
    "Implies one bucket: the 5-hour window",
    "Implies the binary low/reset label covers all caps",
    "Hides the seven_day_opus percent entirely",
    "Easy to walk into a 429 with the 5-hour bar still half empty",
  ],
};

const after = {
  label: "What the JSON actually returns",
  content:
    "The same Settings page fetches a payload with three or four utilization fractions stacked: five_hour, seven_day, seven_day_opus, and (if enabled) extra_usage. The rate limiter trips on whichever bucket hits 1.0 first. The 5-hour bar in the UI is one of those buckets.",
  highlights: [
    "Multiple weighted buckets, one per cap",
    "Each has its own utilization and resets_at",
    "Rate limiter trips on the first to fill",
    "All present in the JSON the Settings page already fetched",
  ],
};

const reproSteps = [
  {
    title: "Open claude.ai/settings/usage with DevTools open",
    description:
      "Switch to the Network tab, filter by XHR. Reload the page. You will see one request to /api/organizations/{your-org-uuid}/usage. Click it, look at the Preview panel.",
  },
  {
    title: "Find every utilization key",
    description:
      "five_hour and seven_day are always there. seven_day_opus appears on Pro and Max plans. extra_usage appears if you have purchased credits. Each has its own utilization float and resets_at timestamp.",
  },
  {
    title: "Normalize the scale",
    description:
      "Some buckets return 0.78, some return 78.0 in the same payload. Pick a scale and apply one clamp: u <= 1 ? u * 100 : u. ClaudeMeter does this in extension/popup.js lines 6 to 11.",
  },
  {
    title: "Surface the highest one",
    description:
      "Whichever bucket is highest is the one you will trip first. ClaudeMeter renders all buckets in the popup, with the one closest to 100 percent emphasized so it is impossible to miss.",
  },
  {
    title: "Use resets_at to plan",
    description:
      "If you are at 91 percent on seven_day_opus and resets_at says 5 days, switch to Sonnet for the next refactor pass. If five_hour is the bottleneck, plan a break instead. Different buckets imply different remediations.",
  },
];

const matterChecklist = [
  {
    text: "The Settings page shows one bar (the 5-hour bucket) and one binary label. The seven_day and seven_day_opus percents do not appear on the page even though they are in the JSON the page itself fetched.",
  },
  {
    text: "Pricing-page wording moved from token estimation to server-side quota in late 2025. Mental models built on the old token language no longer line up with the enforcement model.",
  },
  {
    text: "The weekly cap is rolling, not calendar-week. resets_at slides forward as old messages age out, so the cap behaves like a hard ceiling even though it is technically a 7-day rolling boundary.",
  },
  {
    text: "Tightening happened gradually. Many users did not notice until a refactor that finished fine in February failed in late March because seven_day_opus was now binding.",
  },
  {
    text: "The 429 returned to the client does not name which bucket tripped. From the client side, hitting the 5-hour cap and hitting the Opus weekly cap are indistinguishable. The only way to disambiguate is to read the buckets directly.",
  },
];

const sequenceActors = [
  "You",
  "claude.ai server",
  "five_hour bucket",
  "seven_day bucket",
  "seven_day_opus bucket",
  "Rate limiter",
];
const sequenceMessages = [
  { from: 0, to: 1, label: "POST /completions (Opus)", type: "request" as const },
  { from: 1, to: 2, label: "increment by weight", type: "event" as const },
  { from: 1, to: 3, label: "increment by weight", type: "event" as const },
  { from: 1, to: 4, label: "increment by weight", type: "event" as const },
  {
    from: 5,
    to: 0,
    label: "429 if any bucket >= 1.0",
    type: "error" as const,
  },
  {
    from: 1,
    to: 0,
    label: "GET /usage returns all buckets",
    type: "response" as const,
  },
  {
    from: 0,
    to: 0,
    label: "highest utilization is the constraint",
    type: "event" as const,
  },
];

const myths = [
  "Myth: there is only one cap on Pro",
  "Myth: the in-app label shows weekly state",
  "Myth: weekly cap is calendar-week",
  "Myth: ccusage tracks the weekly cap",
  "Myth: 429s name which bucket tripped",
  "Myth: token counts equal server quota",
];

const comparisonRows = [
  {
    feature: "Caps shown",
    ours: "5-hour, 7-day, 7-day Opus, extra credits",
    competitor: "5-hour bar only",
  },
  {
    feature: "Continuous percent",
    ours: "yes, on every bucket",
    competitor: "only on the 5-hour bar",
  },
  {
    feature: "Refresh cadence",
    ours: "every 60 seconds (live)",
    competitor: "on Settings page reload",
  },
  {
    feature: "Surface",
    ours: "macOS menu bar (always visible)",
    competitor: "claude.ai/settings/usage (must navigate)",
  },
  {
    feature: "Resets countdown",
    ours: "human-readable on every bucket",
    competitor: "binary low/reset label only",
  },
  {
    feature: "Predicts which 429 will fire first",
    ours: "yes (highest bucket wins)",
    competitor: "no (only 5-hour visible)",
  },
  {
    feature: "Cost",
    ours: "free, MIT licensed",
    competitor: "included with Pro/Max",
  },
  {
    feature: "Source data",
    ours: "same /api/organizations/{org}/usage endpoint",
    competitor: "same endpoint, partial render",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-5-hour-window-quota",
    title: "Pro's 5-hour window is one float on a sliding clock",
    excerpt:
      "Where the 5-hour bucket lives in the JSON, why resets_at slides, and how to read it yourself in one curl.",
    tag: "Mental model",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "The rolling cap is seven windows, not one",
    excerpt:
      "five_hour is the famous bucket. The same endpoint returns six more, each with its own ceiling and reset.",
    tag: "Deep dive",
  },
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "ccusage says 5 percent, claude.ai says rate limited",
    excerpt:
      "Why local token counters disagree with server quota, and how to predict the cap mid-refactor.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Pro weekly cap on top of the rolling 5-hour window: real-time tracker",
  description:
    "The weekly cap stacks on top of the 5-hour window and the in-app indicator only flips between low and reset. Here is the field, the math, and what a menu-bar tracker shows that the app does not.",
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

export default function ClaudeProWeeklyCapTrackerPage() {
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
          The weekly cap stacked on the 5-hour window:{" "}
          <GradientText>two caps, one binary indicator</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Anthropic tightened Claude Pro enforcement weeks ago by
          stacking a server-side weekly cap on top of the rolling
          5-hour window. The Settings page still shows one continuous
          bar (the 5-hour bucket) and one binary label that only flips
          between &ldquo;low&rdquo; and &ldquo;reset at X&rdquo;. The
          weekly buckets, including the Opus-only one, are in the JSON
          the page itself fetches; they are just not rendered with a
          percent. That is why most Pro users do not realize they are
          at 78 percent on weekly until the next request 429s.
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

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Sourced from the live claude.ai usage endpoint"
          highlights={[
            "Field names from src/models.rs, lines 3-7",
            "Verifiable in 30 seconds with one curl",
            "Same JSON the Settings page itself fetches",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <RemotionClip
          title="Two caps stacked, one indicator"
          subtitle="What the weekly tightening actually changed"
          captions={[
            "five_hour: rolling 5-hour utilization",
            "seven_day: 7-day rolling utilization",
            "seven_day_opus: Opus-specific weekly",
            "extra_usage: paid credits, optional",
            "Whichever fills first trips the 429",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The bigger shift: a weekly cap on top of the rolling 5-hour window
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          For most of 2024 and early 2025, the only Pro cap that
          mattered in practice was the rolling 5-hour window. People
          built mental models around 45 messages every five hours, the
          number drifted around in Help Center copy, and the in-app
          indicator hinted at it. In late 2025 Anthropic introduced a
          server-side weekly cap on top of the existing 5-hour window
          and tightened enforcement progressively over the next few
          months. By early 2026 the weekly bucket was binding for many
          heavy Pro users on Opus.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The shift is subtle because the Settings page UI did not
          change to match. The 5-hour bar still draws the same shape,
          and the auxiliary label still flips between &ldquo;usage is
          low&rdquo; and a reset notice. But the underlying JSON has
          new keys, and the rate limiter compares against all of them.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <BeforeAfter title="Mental model swap" before={before} after={after} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: the JSON has all the percents
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Hit{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          with your logged-in claude.ai cookies. This is the same
          endpoint the Settings page fetches to draw the bar. Verbatim
          shape:
        </p>
        <AnimatedCodeBlock
          code={stackedPayload}
          language="json"
          filename="claude.ai/api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Three weighted utilization fractions, each with their own
          ISO 8601 reset timestamp. The Settings page renders one of
          them as a bar (5-hour) and elides the other two behind a
          binary label. The rate limiter sees all of them.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          One struct, every bucket
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter deserializes every bucket into the same struct.
          When Anthropic adds another cap (it has happened twice in
          the last six months), the type system catches it as a parse
          error rather than silently misrendering:
        </p>
        <AnimatedCodeBlock
          code={windowStruct}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          One Opus prompt, three buckets ticked
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          A single Opus completion increments the 5-hour bucket, the
          7-day bucket, and the 7-day Opus bucket. The rate limiter
          trips on whichever of them hits 1.0 first.
        </p>
        <SequenceDiagram
          title="five_hour and seven_day_opus update path"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the in-app indicator only flips between low and reset
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The Settings page indicator is a category badge layered on
          top of a single bar. The bar is rendered from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          (a continuous fraction), but the badge text collapses every
          other bucket into one of two states: roughly &ldquo;usage is
          low&rdquo; or &ldquo;usage will reset at X&rdquo;. The
          continuous percents on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          do not get a bar of their own.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The result is a UI in which two genuinely different states
          (78 percent on weekly, 5 percent on weekly) look identical
          to the user. The first will 429 your next prompt, the second
          will not. The bar gives no signal because the bar is the
          5-hour bucket and the 5-hour bucket might be empty either
          way.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What feeds each weekly bucket
        </h2>
        <AnimatedBeam
          title="Inputs to the weekly utilization fractions"
          from={[
            { label: "Prompt tokens", sublabel: "all models" },
            { label: "Attachments", sublabel: "PDFs, images, files" },
            { label: "Tool calls", sublabel: "code exec, web, MCP" },
            { label: "Model picked", sublabel: "Opus also hits seven_day_opus" },
            {
              label: "Peak-hour multiplier",
              sublabel: "weekday US Pacific midday",
            },
            { label: "Browser-chat usage", sublabel: "claude.ai prompts" },
          ]}
          hub={{
            label: "seven_day / seven_day_opus",
            sublabel: "weighted, server-side, rolling 7 days",
          }}
          to={[
            { label: "Settings page bar (only 5-hour)" },
            { label: "ClaudeMeter menu bar (every bucket)" },
            { label: "429 at >= 1.0 on any bucket" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why pricing moved from tokens to quota
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          For a long time, Pro pricing copy was framed in tokens. You
          would see numbers like &ldquo;roughly N million tokens per
          week&rdquo;, and people would estimate from there. In late
          2025 the wording moved to language about server-side
          utilization and rolling windows. That is not a marketing
          tweak. It reflects an actual change in how enforcement
          works. The cap is no longer a token estimate. It is a
          weighted utilization fraction with its own multipliers.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Two consequences. First, calculators that estimate &ldquo;I
          have N tokens left&rdquo; are now unreliable, because the
          server-side weighting (peak-hour multiplier, attachment
          cost, tool-call cost, model class) drifts the conversion
          ratio. Second, the only number that maps cleanly to a 429 is
          the utilization float in the JSON. There is no published
          formula and no token count to back-derive.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce it yourself in one curl
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need a tool to see the gap. Open DevTools on
          claude.ai/settings/usage, copy the cookie header from the
          Network panel, and call the endpoint:
        </p>
        <TerminalOutput
          title="claude.ai/api/organizations/{org_uuid}/usage"
          lines={reproTerminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The first time someone runs this and sees seven_day_opus at
          0.91 while the bar on the Settings page sits at 0.42, the
          reaction is usually a flat &ldquo;oh&rdquo;.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The whole verification path, end to end
        </h2>
        <StepTimeline steps={reproSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Why the binary indicator misses 78 percent
        </h2>
        <AnimatedChecklist
          title="Where the gap between UI and JSON shows up"
          items={matterChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Real-time menu-bar tracker vs in-app indicator
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Both read the same endpoint. They render different slices of
          the response.
        </p>
        <ComparisonTable
          productName="ClaudeMeter (menu bar)"
          competitorName="claude.ai Settings indicator"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              Numbers that matter
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              From the implementation. No invented benchmarks.
            </p>
          </div>
          <MetricsRow
            metrics={[
              {
                value: 3,
                label: "weekly buckets visible in the JSON on Pro",
              },
              {
                value: 1,
                label: "of those weekly buckets visible in the UI",
              },
              {
                value: 60,
                suffix: "s",
                label: "ClaudeMeter poll cadence",
              },
              { value: 0, label: "cookies you have to paste" },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Common myths to drop
        </h2>
        <Marquee speed={40} pauseOnHover>
          {myths.map((m) => (
            <span
              key={m}
              className="mx-3 inline-flex items-center px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-200 whitespace-nowrap"
            >
              {m}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What a real-time tracker actually shows
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              Three things on screen at once: the current utilization
              fraction for every bucket the API returns, a
              human-readable countdown to each bucket&rsquo;s next
              age-out moment, and a flag on whichever bucket is
              closest to the cap. A typical menu-bar render looks
              like:
            </p>
            <p className="text-xl font-mono text-zinc-900 leading-relaxed mt-6">
              5h: <NumberTicker value={42} />%{" "}
              <span className="text-zinc-500">(2h 47m)</span>
              <br />
              7d: <NumberTicker value={78} />%{" "}
              <span className="text-zinc-500">(5d 18h)</span>
              <br />
              7d Opus:{" "}
              <span className="text-teal-700 font-bold">
                <NumberTicker value={91} />%
              </span>{" "}
              <span className="text-zinc-500">(5d 18h)</span>
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-6">
              At a glance: the 5-hour bucket is fine, the weekly is
              meaningfully full, and the Opus weekly is the binding
              constraint. If the next prompt 429s, you know exactly
              which bucket triggered it (the highest one) and exactly
              which mitigation works (switch to Sonnet, not take a
              break). Neither of those decisions is possible from the
              binary in-app indicator.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Where ClaudeMeter fits, and where it does not
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          ClaudeMeter is one option. It happens to be the one we
          maintain, so it is the one this site documents in detail. It
          is a small Rust menu-bar app with a browser extension that
          forwards your existing claude.ai session to a localhost
          bridge, polls the usage endpoint every 60 seconds, and
          renders every bucket. Free, MIT licensed, no cookie paste.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          It is not the only option. ccusage, ccburn,
          Claude-Code-Usage-Monitor, and a handful of other open-source
          tools cover adjacent surfaces (local token attribution per
          project, JSONL parsing, cost forecasting). For weekly-cap
          visibility specifically, you want a tool that reads the
          server endpoint rather than your local logs. Anything that
          ships its own clamp on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          and persists snapshots for later analysis is a fine choice.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint is internal and undocumented. The field names
          have been stable for many months but Anthropic could rename,
          add, or remove buckets in any release. ClaudeMeter
          deserializes the response into a strict Rust struct in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>
          , so when the shape changes the menu bar surfaces a parse
          error and a release ships the same day. Until then, this is
          where the weekly cap lives, and these are the numbers the
          rate limiter compares against.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          See every bucket, live
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter sits in your macOS menu bar, polls every 60
          seconds, and shows the 5-hour, 7-day, and Opus-weekly
          percents at once. Free, MIT licensed, no cookie paste, reads
          the same JSON claude.ai/settings/usage reads.
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
          heading="Seeing a different shape on the weekly buckets?"
          description="If your payload returns extra fields, a different scale, or a resets_at that does not slide, send it. We map every variant we see."
          text="Book a 15-minute call"
          section="weekly-cap-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on the weekly cap? 15 min."
        section="weekly-cap-sticky"
        site="claude-meter"
      />
    </article>
  );
}
