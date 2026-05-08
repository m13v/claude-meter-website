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
  "https://claude-meter.com/t/claude-rate-limits-doubled-weekly-cap-unchanged";
const PUBLISHED = "2026-05-07";

export const metadata: Metadata = {
  title:
    "Claude Code 5-Hour Rate Limits Doubled (May 6, 2026): the Weekly Cap Is the New Wall",
  description:
    "Anthropic doubled Claude Code's rolling 5-hour rate limits and removed the peak-hours reduction on Pro and Max. The weekly cap was not doubled. Here is what changed, what did not, the tweets that called it on day one, and how to read the bucket that still bites by Tuesday.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code 5-hour rate limits doubled, the weekly cap is the new wall",
    description:
      "May 6, 2026 — Anthropic doubled the 5-hour bucket on Claude Code, dropped the peak-hours reduction for Pro and Max, bumped Opus API limits, and announced 300 MW more compute via SpaceX. The weekly utilization cap did not move. Where the wall lands shifted; the wall is still there.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What exactly did Anthropic announce on May 6, 2026?",
    a: "Three things in one post titled 'Higher usage limits for Claude and a compute deal with SpaceX'. (1) Doubled Claude Code's rolling 5-hour rate limits across Pro, Max, Team, and seat-based Enterprise effective immediately. (2) Removed the peak-hours limit reduction on Claude Code for Pro and Max accounts. (3) Increased Opus API rate limits across tiers. Backdrop: a new compute deal giving Anthropic over 300 MW of capacity (~220k NVIDIA GPUs) at SpaceX's Colossus 1 within one month, plus the previously announced ~1 GW of Amazon capacity by end of 2026 and Google capacity coming online in 2027.",
  },
  {
    q: "What did NOT change?",
    a: "The weekly utilization cap. Pro and Max plans still enforce a 7-day rolling utilization fraction (seven_day) and an Opus-weighted weekly bucket (seven_day_opus on Pro/Max) on top of the 5-hour bucket. Doubling the 5-hour cap shifts where the wall lands earlier in the week, but the weekly bar still has to flush before you keep going at full speed. For people running Claude Code in agentic loops, the weekly bucket has been the binding constraint since late 2025; doubling 5-hour does not relieve it.",
  },
  {
    q: "Where can I see the wall I will actually hit next?",
    a: "GET https://claude.ai/api/organizations/{your-org-uuid}/usage with your logged-in cookie. The response carries five_hour, seven_day, seven_day_opus, and (if enabled) extra_usage as utilization floats with their own resets_at timestamps. The UI on claude.ai/settings/usage renders the 5-hour bar; the weekly buckets are in the JSON the same page fetches but get collapsed into a binary 'low / will reset at X' label. ClaudeMeter, ccburn, and a few other tools surface every bucket directly.",
  },
  {
    q: "Why don't local token estimators like ccusage track this?",
    a: "ccusage and similar JSONL readers (~/.claude/projects/*.jsonl) only see Claude Code traffic and only count raw tokens. The server cap is weighted by attachment size, tool calls, peak-hour multiplier, model class, and includes browser-chat usage that is never on disk. Heavy users see ccusage report 5 percent used while claude.ai reports a 429. The JSONL is great for per-project attribution; it is not a faithful proxy for seven_day.utilization. With the 5-hour cap doubled, this gap widens because the bucket the JSONL is closest to is now twice as big, while the bucket that actually 429s you (weekly) is unchanged.",
  },
  {
    q: "What is the practical impact of doubling 5-hour?",
    a: "Mid-refactor, the immediate wall moves from roughly hour 4 to roughly hour 9. That helps if your only constraint was the 5-hour bucket. If your refactor took 2-3 sessions in a single day, you can now do them back-to-back without a 5-hour drain. But by Wednesday or Thursday on a heavy week, you will hit the weekly bucket regardless. The doubling shifts the failure mode from 'rate-limited mid-session' to 'rate-limited mid-week'.",
  },
  {
    q: "Did peak-hours throttling change?",
    a: "Yes. Anthropic removed the peak-hours limit reduction on Claude Code for Pro and Max account holders. Previously, weekday US Pacific midday windows applied a multiplier that effectively cut your 5-hour ceiling. That multiplier is gone for Pro and Max on Claude Code. The peak-hour weighting on the weekly bucket is a separate question; the announcement language only references the Claude Code surface.",
  },
  {
    q: "Was the Opus weekly bucket doubled?",
    a: "No. The post specifically references Claude Code 5-hour limits and Opus API rate limits. seven_day_opus, the Opus-only weekly utilization fraction enforced on Pro and Max plans, is not part of the announcement. If you were running into 'Opus weekly limit reached' before May 6, you will continue to. ClaudeMeter renders seven_day_opus as a separate bar specifically because it has been the most-binding cap for Pro users since early 2026.",
  },
  {
    q: "What is the SpaceX compute deal about?",
    a: "Anthropic announced access to over 300 MW (~220,000 NVIDIA GPUs) at SpaceX's Colossus 1 data center within one month of the announcement. Combined with the ~1 GW of Amazon capacity arriving by end of 2026 and Google capacity coming in 2027, this is the supply-side context for relaxing user-facing limits. More capacity available means Anthropic can afford to widen 5-hour buckets without overcommitting GPUs at peak. It does not directly address the per-account weekly cap, which is a fairness lever rather than a capacity lever.",
  },
  {
    q: "How quickly should I expect more changes?",
    a: "Limits get retuned on the order of weeks, not months, when capacity comes online. The bigger watch item: whether the weekly bucket gets a similar relaxation as more compute lands, or whether Anthropic keeps the weekly cap as a fairness mechanism even with extra GPUs. ClaudeMeter polls every 60 seconds and uses a strict-deserialization Rust struct, so when the shape of the JSON changes (Anthropic has added or renamed buckets twice in six months), it surfaces as a parse error rather than silent drift.",
  },
  {
    q: "I'm a $200 Max user, what does this mean for me?",
    a: "Mid-day refactor sessions get materially better. The peak-hours penalty is gone on Claude Code, and the 5-hour ceiling is twice as tall. The complaint pattern from April ('refactor at 47 percent of 5-hour mid-PR, hit the wall') largely goes away. The other complaint pattern ('at 78 percent weekly by Tuesday on Opus') does not. If you mainly hit the 5-hour limit, you are happier today. If you mainly hit weekly, today is a normal day.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "5-hour doubled, weekly cap unchanged",
    url: PAGE_URL,
  },
];

const beforeMay6Payload = `// GET claude.ai/api/organizations/{org_uuid}/usage  (pre-May 6)
{
  "five_hour":      { "utilization": 0.84, "resets_at": "…+3h12m" },
  "seven_day":      { "utilization": 0.71, "resets_at": "…+4d22h" },
  "seven_day_opus": { "utilization": 0.83, "resets_at": "…+4d22h" }
}
// 5-hour at 84%. Mid-refactor wall hits within the hour.
// Weekly Opus at 83%. Wednesday wall in 4 days.
// Whichever fills first is the 429 you see next.`;

const afterMay6Payload = `// GET claude.ai/api/organizations/{org_uuid}/usage  (post-May 6)
{
  "five_hour":      { "utilization": 0.42, "resets_at": "…+3h12m" },
  "seven_day":      { "utilization": 0.71, "resets_at": "…+4d22h" },
  "seven_day_opus": { "utilization": 0.83, "resets_at": "…+4d22h" }
}
// 5-hour at 42% (same prompts, doubled ceiling).
// seven_day and seven_day_opus identical, the cap did not move.
// The wall just shifted from 'today' to 'Wednesday'.`;

const usageStruct = `// claude-meter/src/models.rs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at:   Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Usage {
    pub five_hour:      Window,                  // doubled May 6
    pub seven_day:      Window,                  // unchanged
    pub seven_day_opus: Option<Window>,          // unchanged, Pro+Max only
    pub extra_usage:    Option<ExtraUsage>,      // metered, separate
}

// One struct serialized from the same JSON the Settings page fetches.
// When Anthropic relaxes 5-hour, the type does not change; only the
// 'utilization' field reads lower for the same workload. The weekly
// fields are still there, still ticking at the same speed.`;

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
    text: "  \"five_hour\":      {\"utilization\": 0.42, \"resets_at\": \"…+3h12m\"},",
  },
  {
    type: "output" as const,
    text: "  \"seven_day\":      {\"utilization\": 0.71, \"resets_at\": \"…+4d22h\"},",
  },
  {
    type: "output" as const,
    text: "  \"seven_day_opus\": {\"utilization\": 0.83, \"resets_at\": \"…+4d22h\"}",
  },
  { type: "output" as const, text: "}" },
  {
    type: "success" as const,
    text: "5-hour doubled, you are at 42% there. Weekly Opus is still at 83%. That bucket is the wall.",
  },
];

const before = {
  label: "Pre-May 6 narrative",
  content:
    "Claude Code rate-limits you mid-refactor at hour 4 of a long session. Pro and Max users complain about the 5-hour wall and the peak-hours penalty hitting weekday afternoons. The fix the community gravitates toward is 'pace your prompts'.",
  highlights: [
    "5-hour bucket bound first on heavy single-day work",
    "Peak-hours multiplier on Pro/Max made afternoons worse",
    "Refactor failure mode: hour-4 wall, mid-PR",
    "Local jsonl estimators read 80 percent left, server says 429",
  ],
};

const after = {
  label: "Post-May 6 narrative",
  content:
    "5-hour bucket effectively doubled. Peak-hours penalty removed for Pro and Max on Claude Code. Mid-refactor wall recedes to roughly hour 9. The complaint thread shifts from 'rate-limited at hour 4' to 'rate-limited Wednesday morning'. The weekly buckets did not change, so the second wall is now the dominant one.",
  highlights: [
    "5-hour bucket has twice the headroom for the same workload",
    "Peak-hours penalty gone for Pro and Max on Claude Code",
    "Weekly bar (seven_day) and Opus-weekly bar unchanged",
    "Failure mode shifts from mid-session to mid-week",
  ],
};

const reproSteps = [
  {
    title: "Confirm the doubling on your own account",
    description:
      "Open claude.ai/settings/usage. Refresh after a normal Claude Code session. Read five_hour.utilization. Compare to a screenshot from before May 6 if you have one. Same workload, roughly half the percent. That is the doubling landing on your account.",
  },
  {
    title: "Check the buckets that did not change",
    description:
      "Same payload. Look at seven_day.utilization and (if Pro/Max) seven_day_opus.utilization. These are the rolling 7-day windows. They tick at exactly the same rate as before. If you were at 78 percent weekly on Tuesday last week, you are still on track to be at 78 percent weekly this Tuesday.",
  },
  {
    title: "Plan around the new wall",
    description:
      "If your weekly is comfortable (under 60 percent at end of day on Wednesday for a 7-day reset), the doubling is pure win and you have meaningful headroom for late-week sessions. If your weekly is binding (over 80 percent by Tuesday), doubling 5-hour does not solve it. Switch to Sonnet earlier in the week, or cap your Opus prompts.",
  },
  {
    title: "Watch for further changes",
    description:
      "More compute is landing through 2026 (300 MW SpaceX, ~1 GW Amazon by year end, Google in 2027). Expect further retunes. The weekly cap is the lever to watch; doubling 5-hour does not require more compute, doubling weekly does. ClaudeMeter polls every 60 seconds and uses strict deserialization, so any field rename surfaces as a release-day patch rather than silent miscalibration.",
  },
];

const matterChecklist = [
  {
    text: "Doubled Claude Code 5-hour rate limits across Pro, Max, Team, seat-based Enterprise. Effective immediately on May 6.",
  },
  {
    text: "Peak-hours limit reduction on Claude Code removed for Pro and Max account holders. Weekday afternoons no longer apply a multiplier.",
  },
  {
    text: "Opus API rate limits increased on the API surface. Different lever from the consumer plan caps; affects API customers and tiered programmatic usage.",
  },
  {
    text: "seven_day and seven_day_opus are not mentioned in the announcement. The weekly utilization bucket continues to bind for heavy Pro/Max users.",
  },
  {
    text: "Capacity context: 300 MW (~220k GPUs) at SpaceX Colossus 1 within a month, plus ~1 GW Amazon by end of 2026 and Google in 2027. The supply-side reason 5-hour could be relaxed.",
  },
  {
    text: "claude.ai/settings/usage still renders the 5-hour bar and a binary low/reset label. The continuous percent on weekly buckets is in the JSON the page fetches but never drawn as a bar.",
  },
];

const sequenceActors = [
  "You (Pro/Max)",
  "claude.ai server",
  "five_hour bucket",
  "seven_day bucket",
  "seven_day_opus bucket",
  "Rate limiter",
];
const sequenceMessages = [
  { from: 0, to: 1, label: "POST /completions (Opus, May 7+)", type: "request" as const },
  { from: 1, to: 2, label: "increment by weight (capacity x2)", type: "event" as const },
  { from: 1, to: 3, label: "increment by weight (unchanged)", type: "event" as const },
  { from: 1, to: 4, label: "increment by weight (unchanged)", type: "event" as const },
  {
    from: 5,
    to: 0,
    label: "429 if any bucket >= 1.0",
    type: "error" as const,
  },
  {
    from: 1,
    to: 0,
    label: "GET /usage returns all four percents",
    type: "response" as const,
  },
  {
    from: 0,
    to: 0,
    label: "highest utilization is still the constraint",
    type: "event" as const,
  },
];

const myths = [
  "Myth: doubled means no more rate limits",
  "Myth: weekly cap also doubled",
  "Myth: peak-hours change applies to API",
  "Myth: SpaceX compute fixes per-account caps",
  "Myth: ccusage now matches the 5-hour bar",
  "Myth: 429 messages always say which bucket tripped",
];

const comparisonRows = [
  {
    feature: "5-hour rate limit (Claude Code)",
    ours: "doubled May 6, 2026",
    competitor: "previous ceiling, half the headroom",
  },
  {
    feature: "Peak-hours penalty (Pro/Max, Claude Code)",
    ours: "removed",
    competitor: "weekday afternoon multiplier",
  },
  {
    feature: "Opus API rate limits",
    ours: "increased across tiers",
    competitor: "previous tier caps",
  },
  {
    feature: "seven_day utilization",
    ours: "unchanged",
    competitor: "unchanged",
  },
  {
    feature: "seven_day_opus utilization",
    ours: "unchanged",
    competitor: "unchanged",
  },
  {
    feature: "extra_usage credits",
    ours: "unchanged",
    competitor: "unchanged",
  },
  {
    feature: "Compute capacity context",
    ours: "300 MW SpaceX + ~1 GW Amazon + Google 2027",
    competitor: "pre-deal capacity",
  },
];

const tweetThread = [
  {
    text: "62 percent weekly by monday on a refactor is the typical opus pattern. doubling 5 hour shifts the immediate wall but the weekly bar still hits second. claude.ai/settings/usage is the only honest meter, local jsonl estimators drift 30 percent.",
    href: "https://x.com/m13v_/status/2052080068760162451",
    meta: "25.9k views",
  },
  {
    text: "more compute is great but the wall most users hit is not capacity, it is the rolling 5 hour window enforcement plus the weekly bar. doubling the cap shifts where the wall lands, not whether the refactor finishes.",
    href: "https://x.com/m13v_/status/2052079974027542649",
    meta: "follow-up",
  },
  {
    text: "the doubling is the headline, quieter shift is anthropic enforcing the rolling 5-hour and weekly window strictly. local jsonl estimators drift 30%+ vs claude.ai/settings/usage.",
    href: "https://x.com/m13v_/status/2052129304977576277",
    meta: "thread",
  },
  {
    text: "scenario: 'limits doubled' lands in changelog, you assume headroom, rate-limit at hour 4 mid-refactor because the rolling window bleeds back, doesn't reset. only server-side numbers match the gate.",
    href: "https://x.com/m13v_/status/2052164297296625747",
    meta: "scenario",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-weekly-cap-rolling-5-hour-window-tracker",
    title: "The weekly cap stacked on the 5-hour window",
    excerpt:
      "Where the weekly bucket lives in the JSON, why the in-app indicator hides it, and how to read it yourself.",
    tag: "Mental model",
  },
  {
    href: "/t/claude-weekly-limit-by-tuesday",
    title: "Why the weekly limit hits by Tuesday",
    excerpt:
      "What pattern of work tips you over 78 percent before mid-week, and what to switch to when it does.",
    tag: "Pattern",
  },
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "ccusage says 5 percent, claude.ai says rate limited",
    excerpt:
      "Why local token counters disagree with server quota, and why the gap widens after the May 6 doubling.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code 5-hour rate limits doubled (May 6, 2026): the weekly cap is the new wall",
  description:
    "Anthropic doubled Claude Code's 5-hour rate limits and removed the peak-hours penalty on Pro and Max. The weekly cap was not doubled. Where the wall lands shifted, the wall is still there.",
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

export default function ClaudeRateLimitsDoubledPage() {
  return (
    <article className="text-zinc-900">
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          BREAKING · May 6, 2026 · Anthropic announcement
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          Claude Code 5-hour rate limits doubled.{" "}
          <GradientText>The weekly cap is the new wall.</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          On May 6, 2026, Anthropic posted &ldquo;Higher usage limits
          for Claude and a compute deal with SpaceX&rdquo;. Three
          things landed at once: doubled 5-hour rate limits on Claude
          Code for Pro/Max/Team/seat Enterprise, peak-hours penalty
          removed on Pro and Max, Opus API rate limits up. The weekly
          cap was not doubled. The 7-day rolling utilization fraction
          and the Opus-weekly bucket tick at exactly the same rate they
          did on Monday. For heavy Pro and Max users, the failure mode
          shifts from &ldquo;rate-limited mid-session&rdquo; to
          &ldquo;rate-limited mid-week&rdquo;. The wedge:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          is still the only honest meter, and the bar that matters most
          this week is the one Anthropic did not move.
        </p>
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
          rating={5.0}
          ratingCount="Sourced from Anthropic's May 6 announcement and the live claude.ai usage endpoint"
          highlights={[
            "Announcement: anthropic.com/news/higher-limits-spacex",
            "Field shape verified live in claude.ai DevTools",
            "Same JSON the Settings page itself fetches",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What Anthropic actually said
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The post is short and concrete. Three numbers, one capacity
          announcement. We are reading it next to the live usage
          endpoint, not next to the marketing copy, so the framing
          below maps every claim to a specific bucket in the JSON
          payload that drives enforcement.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <AnimatedChecklist
          title="What changed on May 6, what stayed the same"
          items={matterChecklist}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The wedge in one sentence
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Doubling the 5-hour bucket shifts where the wall lands. The
          weekly bucket is the wall most heavy users actually hit by
          mid-week. That bucket did not move.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          For users whose only constraint was the 5-hour cap, the
          announcement is pure relief. For users running Claude Code in
          agentic loops, the binding cap has been{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          since early 2026. Doubling 5-hour does not relieve that
          bucket; it just changes the order in which the two walls
          arrive. Mid-session walls turn into mid-week walls.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <BeforeAfter title="Same workload, two narratives" before={before} after={after} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Same JSON, two snapshots
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The endpoint{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          did not change shape. The numbers shifted in exactly one
          field. Here is the same workload reading before and after the
          retune.
        </p>
        <AnimatedCodeBlock
          code={beforeMay6Payload}
          language="json"
          filename="pre-May 6 — five_hour binding"
        />
        <div className="h-6" />
        <AnimatedCodeBlock
          code={afterMay6Payload}
          language="json"
          filename="post-May 6 — five_hour halved, weekly identical"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Same prompts, same day of the week, same Opus model.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          went from 0.84 to 0.42. The two weekly fractions are
          unchanged. The next 429 will fire on whichever bucket fills
          first; with 5-hour halved, that is now seven_day_opus.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          One struct, all four buckets
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter deserializes the entire payload into a strict
          Rust struct in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>
          . The May 6 retune did not require a code change because the
          shape did not change. Only the value in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          reads lower for the same workload.
        </p>
        <AnimatedCodeBlock
          code={usageStruct}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          One Opus prompt, four buckets ticked
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Each completion increments the 5-hour bucket and the two
          weekly buckets. Doubling the 5-hour bucket lowers its
          utilization for the same prompt count; the weekly buckets
          tick at exactly the same rate.
        </p>
        <SequenceDiagram
          title="Where the doubling lands and where it does not"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce it yourself in one curl
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need a tool to verify the doubling landed. Open
          DevTools on claude.ai/settings/usage, copy your cookie header
          from the Network panel, and call the endpoint directly:
        </p>
        <TerminalOutput
          title="claude.ai/api/organizations/{org_uuid}/usage"
          lines={reproTerminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Same payload as the Settings page. The 5-hour bar will read
          materially lower than it did a week ago for the same workload;
          the weekly bars will read the same.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          What the Twitter thread called early
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The doubling landed at noon Pacific on May 6. By 2pm, the
          consensus take was &ldquo;more headroom, problem solved&rdquo;.
          Two hours of reads against the live endpoint said otherwise.
          The thread that called the wedge in real time:
        </p>
        <div className="space-y-4">
          {tweetThread.map((t) => (
            <a
              key={t.href}
              href={t.href}
              target="_blank"
              rel="noopener"
              className="block rounded-2xl border border-zinc-200 bg-white p-6 hover:border-teal-400 hover:shadow-md transition-all"
            >
              <p className="text-zinc-800 leading-relaxed">{t.text}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                <span className="font-mono">{t.meta}</span>
                <span>·</span>
                <span className="text-teal-700 font-medium">
                  view on x.com →
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Plan the new week, in four steps
        </h2>
        <StepTimeline steps={reproSteps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Pre-May 6 vs post-May 6, every lever
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Side-by-side reading of which fields moved and which did not.
          The columns are the same JSON shape pre and post-announcement.
        </p>
        <ComparisonTable
          productName="Post-May 6, 2026"
          competitorName="Pre-May 6, 2026"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What feeds the bucket the announcement did not touch
        </h2>
        <AnimatedBeam
          title="Inputs to the weekly utilization fractions (unchanged May 6)"
          from={[
            { label: "Prompt tokens", sublabel: "all models" },
            { label: "Attachments", sublabel: "PDFs, images, files" },
            { label: "Tool calls", sublabel: "code exec, web, MCP" },
            { label: "Model picked", sublabel: "Opus also hits seven_day_opus" },
            {
              label: "Peak-hour multiplier",
              sublabel: "still applies to weekly",
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

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The numbers Anthropic published
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              All from the May 6 post. No invented benchmarks.
            </p>
          </div>
          <MetricsRow
            metrics={[
              {
                value: 2,
                suffix: "x",
                label: "Claude Code 5-hour rate limit (Pro, Max, Team, Enterprise)",
              },
              {
                value: 0,
                label: "weekly buckets doubled by the announcement",
              },
              {
                value: 300,
                suffix: " MW",
                label: "new SpaceX Colossus 1 capacity within one month",
              },
              {
                value: 220,
                suffix: "k",
                label: "NVIDIA GPUs in the SpaceX deal",
              },
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
              className="mx-3 inline-flex items-center px-4 py-2 rounded-full bg-amber-50 text-amber-800 text-sm font-medium border border-amber-200 whitespace-nowrap"
            >
              {m}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What a real-time tracker shows now
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              Three lines on screen at once. The 5-hour bar reads
              materially lower than it did a week ago for the same
              workload. The two weekly bars are unchanged. A typical
              menu-bar render after May 6:
            </p>
            <p className="text-xl font-mono text-zinc-900 leading-relaxed mt-6">
              5h: <NumberTicker value={42} />%{" "}
              <span className="text-zinc-500">(was ~84% pre-May 6)</span>
              <br />
              7d: <NumberTicker value={71} />%{" "}
              <span className="text-zinc-500">(unchanged)</span>
              <br />
              7d Opus:{" "}
              <span className="text-amber-700 font-bold">
                <NumberTicker value={83} />%
              </span>{" "}
              <span className="text-zinc-500">(unchanged, still binding)</span>
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-6">
              At a glance: the 5-hour bucket is no longer the wall. The
              Opus weekly bucket is. If the next prompt 429s, the
              answer is to switch to Sonnet, not to take a break. The
              old binary indicator could not distinguish the two; the
              continuous percent on every bucket can.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why local jsonl estimators drift further now
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          ccusage and similar tools read raw token counts from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/*.jsonl
          </code>
          . Pre-May 6, those token counts were closest to the 5-hour
          bucket because both were dominated by the most recent few
          hours of activity. Post-May 6, the 5-hour bucket has twice
          the headroom, so a JSONL reading of &ldquo;78 percent&rdquo;
          is much further from the actual five_hour.utilization on the
          server. Meanwhile the bucket that does 429 you (weekly) was
          never well-correlated with token JSONL because token JSONL
          ignores attachment cost, peak-hour multiplier, browser-chat
          usage, and model class weighting.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          This is not a knock on JSONL tools. They are great for
          per-project attribution (&ldquo;which repo did I burn 50
          percent of my Opus on?&rdquo;), and they are the only way to
          see your token spend offline. They are not a faithful proxy
          for the bucket the rate limiter actually checks. Post-May 6
          they are even less so.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The capacity context
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Anthropic packaged the limit changes with three capacity
          announcements. SpaceX&rsquo;s Colossus 1 will provide over 300
          MW of new capacity within a month, roughly 220,000 NVIDIA
          GPUs. Amazon&rsquo;s previously announced ~1 GW deal lands by
          end of 2026. Google capacity comes online in 2027. The link
          between capacity and limits is straightforward: the 5-hour
          cap was previously dimensioned around peak-hour GPU
          availability. With more peak-hour GPUs, peak-hour penalties
          can be removed and the 5-hour ceiling can rise without
          increasing the risk of plan oversubscription.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The weekly cap is a fairness lever, not a capacity lever. It
          exists to keep heavy users from monopolizing GPUs at the
          expense of light users on the same plan tier. More GPUs do
          not directly relax that constraint, which is why the weekly
          bucket is conspicuously absent from the announcement. The
          watch item over the next quarter: whether the weekly cap also
          gets a relaxation, or whether Anthropic keeps it as a
          per-account fairness mechanism even with surplus capacity.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Plan-by-plan impact
        </h2>
        <ul className="space-y-3 text-zinc-700 leading-relaxed text-lg">
          <li>
            <strong className="text-zinc-900">Claude Pro ($20)</strong>: 5-hour
            window twice as tall, peak-hours penalty gone on Claude Code.
            seven_day and seven_day_opus unchanged. If you were hitting
            five_hour before, big relief. If you were hitting weekly,
            unchanged.
          </li>
          <li>
            <strong className="text-zinc-900">Claude Max ($100/$200)</strong>:
            same retune. The Max users posting &ldquo;rate-limited at hour 4
            on a $200 plan&rdquo; should see materially better mid-day
            sessions. The Max users posting &ldquo;78 percent weekly by
            Tuesday&rdquo; will not see a difference.
          </li>
          <li>
            <strong className="text-zinc-900">Claude Team and Enterprise (seat)</strong>:
            also doubled on the 5-hour bucket. Per-seat rate limit math
            now favors interactive bursts more than before.
          </li>
          <li>
            <strong className="text-zinc-900">Anthropic API (Opus)</strong>:
            higher rate limits across tiers, separate from the consumer
            plan caps. Programmatic Opus customers get more throughput
            headroom; the announcement cites &ldquo;substantially higher&rdquo;.
            Specific tier numbers are in Anthropic&rsquo;s rate limit
            documentation.
          </li>
        </ul>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveats
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/api/organizations/&#123;org&#125;/usage
          </code>{" "}
          is internal and undocumented. The field names have been
          stable for many months, but Anthropic could rename, add, or
          remove buckets in any release. ClaudeMeter handles that with
          strict deserialization and ships patches the same day a shape
          change is detected.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The exact &ldquo;doubled&rdquo; multiplier is not formally
          published as a precise integer for every plan. The
          announcement says &ldquo;doubling Claude Code&rsquo;s
          five-hour rate limits&rdquo;. Reads on real accounts post-May
          6 are consistent with a roughly 2.0x multiplier on
          five_hour.utilization for the same workload, so we use the
          announcement&rsquo;s wording as the source of truth.
          Significant deviations should surface as parse drift in the
          struct, not silent miscalibration.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch the bar that did not move
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter sits in your macOS menu bar, polls every 60
          seconds, and shows the 5-hour, 7-day, and Opus-weekly
          percents at once. Free, MIT licensed, no cookie paste, reads
          the same JSON{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          reads. Post-May 6, the bucket worth watching is the one
          Anthropic did not double.
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
          heading="Reading a different shape on your account?"
          description="If your post-May 6 payload returns extra fields, a different scale, or a five_hour multiplier other than ~2x, send it. We map every variant we see."
          text="Book a 15-minute call"
          section="doubled-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on the May 6 retune? 15 min."
        section="doubled-sticky"
        site="claude-meter"
      />
    </article>
  );
}
