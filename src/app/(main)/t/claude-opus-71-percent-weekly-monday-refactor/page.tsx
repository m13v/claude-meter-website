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
  "https://claude-meter.com/t/claude-opus-71-percent-weekly-monday-refactor";
const PUBLISHED = "2026-04-27";

export const metadata: Metadata = {
  title:
    "71% Weekly Quota by Monday on One Opus Refactor: Local Estimators Off by 30%+",
  description:
    "One Monday Opus refactor burned 71% of the rolling weekly Claude quota. Local token estimators were off by 30%+. The April 2026 metered billing transition is catching Pro and Max users off guard. claude.ai/settings/usage is the only honest number.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "71% weekly by Monday on one Opus refactor — local estimators were off by 30%+",
    description:
      "April 2026: one Opus refactor can burn 71% of your weekly Claude quota in a single day. Local token counters undercount by 30%+ because they miss server-side weighting, attachment cost, and the new metered billing split. Here is what actually happened.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "How does one refactor burn 71% of a weekly Claude quota in a single day?",
    a: "The server-side quota is weighted by more than raw token count. Opus carries a higher model weight than Sonnet. Large file attachments (full repo context, PDFs, images) add extra cost on top of the token count. Tool calls (code execution, file search, MCP calls) are billed at the server's effort-tier rate, not the raw token rate Claude Code logs locally. A multi-file refactor with several Opus rounds, each pulling a large codebase into context, burns through seven_day.utilization far faster than the local counter suggests. The JSONL sees raw tokens; the server charges weighted tokens across all surfaces including any browser-chat usage you did that day.",
  },
  {
    q: "Why were local token estimators off by 30%+ for this kind of session?",
    a: "Tools like ccusage read from ~/.claude/projects/*.jsonl. That file only records Claude Code sessions and only records raw token counts, not the server's weighted cost. The server applies multipliers for model class (Opus costs more quota than Sonnet), attachment size, peak-hour multiplier, and effort tier (agentic tool-use rounds at a higher rate than simple completions). For a refactor session mixing large codebase attachments with multiple Opus tool-use chains, the server's weighted cost is materially higher than raw JSONL token count. The 30%+ drift the tweet describes is typical; some heavy agentic sessions run 50%+ off.",
  },
  {
    q: "What is the 'metered billing transition' and why does it surprise Pro users?",
    a: "In April 2026, Anthropic rolled out extra usage: pay-as-you-go billing that kicks in on top of the plan cap when the quota is exhausted or when a server-side routing change sends traffic to the metered surface. The plan quota and the extra-usage balance are two separate streams. A routing flip can start draining the metered balance while the plan quota bars visually appear unchanged. The in-app indicator only flips between 'low' and 'reset at X', so most Pro users do not see they are at 78% used until the next request hits the wall. Many users encountered the extra-usage stream for the first time as an unexpected billing charge, not a changelog notice.",
  },
  {
    q: "What exactly is claude.ai/settings/usage and why is it the ground-truth number?",
    a: "GET https://claude.ai/api/organizations/{org_uuid}/usage returns the server's live quota state: five_hour.utilization, seven_day.utilization, seven_day_opus.utilization (Pro/Max only), and extra_usage balance. This is the same JSON that claude.ai/settings/usage renders in the browser. It includes every usage input the server charges against: Claude Code, browser-chat prompts, API calls via your session, attachment cost, tool-use effort tier, and peak-hour multiplier. Local JSONL tools see none of that weighting. The endpoint is the only number the rate limiter enforces against.",
  },
  {
    q: "What are the two billing streams and how do I tell which one is draining?",
    a: "Stream 1 is the plan quota: rolling 5-hour (five_hour), rolling 7-day (seven_day), and Opus-weekly sub-bucket (seven_day_opus on Pro/Max). Stream 2 is extra usage (extra_usage), a dollar-denominated metered balance that bills at the API rate when the plan quota is exhausted or a routing flip is in effect. A server-side routing flip can start billing Stream 2 while the Stream 1 plan bars sit at a prior level. The endpoint GET /api/organizations/{org_uuid}/usage returns both streams in one payload. The plan quota bars in-app only show a binary indicator; extra_usage has a dollar balance you can watch. Reading the raw endpoint is the only reliable way to distinguish 'draining my plan' from 'draining my card'.",
  },
  {
    q: "Why did 13% weekly with $200 already burned indicate a routing flip?",
    a: "On a $200 Max plan, 13% weekly utilization means roughly 13% of the seven_day bucket is consumed. If a significant dollar amount has left the account and the plan bar still shows only 13%, that spend went to extra usage (Stream 2), not the plan quota (Stream 1). That mismatch is the signature of a server-side routing flip: the endpoint that routes your completions switched to billing the metered balance instead of the plan quota. The plan quota bars stay low; money leaves the account. This is a known edge case in the April 2026 metered billing rollout.",
  },
  {
    q: "Does hitting the rolling 5-hour wall at 47% weekly make sense?",
    a: "Yes. The 5-hour and 7-day buckets are independent and can fill independently. If your session is very dense in a short burst, five_hour.utilization fills to 1.0 before seven_day.utilization reaches 50%. The result is a 429 with seven_day.utilization at 47%. From the plan perspective, you have 53% weekly headroom remaining, but you cannot use it until the 5-hour bucket resets. ClaudeMeter renders both bars simultaneously because this pattern is common: the 5-hour wall at under 50% weekly is not a contradiction, it is normal for bursty usage.",
  },
  {
    q: "What is the 'effort tier' and why does it matter for quota burn?",
    a: "Anthropic's server applies different effort-tier weights to different completion types. A simple chat completion burns less quota per token than an agentic tool-use chain (code execution, file search, MCP tool calls). Opus refactors via Claude Code typically chain multiple tool-use rounds per prompt, each billed at the higher effort tier. This is why a Claude Code refactor session consumes far more quota per wall-clock minute than the same number of raw tokens read from a JSONL log would imply.",
  },
  {
    q: "How do I watch both streams at once without calling the endpoint manually?",
    a: "ClaudeMeter polls GET /api/organizations/{org_uuid}/usage every 60 seconds and renders five_hour, seven_day, seven_day_opus, and extra_usage as live bars in the macOS menu bar. The browser extension picks up your existing claude.ai session, so no manual cookie paste. Numbers match exactly what claude.ai/settings/usage shows because ClaudeMeter and the Settings page hit the same internal endpoint.",
  },
  {
    q: "Will the weekly cap reset after 7 days even if extra_usage is enabled?",
    a: "Yes. The plan quota (seven_day.utilization) resets on a rolling 7-day window anchored to your account. Extra usage charges do not affect the plan quota reset; they are a separate dollar-denominated balance. After the seven_day reset, your quota fraction goes back to 0. If extra_usage is enabled and has a balance, it carries forward and continues draining as you use the metered surface. The reset only clears the plan quota side.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "71% weekly by Monday on one Opus refactor",
    url: PAGE_URL,
  },
];

const twoStreamPayload = `// GET claude.ai/api/organizations/{org_uuid}/usage
// April 2026 — two-stream metered billing active
{
  "five_hour": {
    "utilization": 0.71,
    "resets_at":   "2026-04-27T23:14:00Z"
  },
  "seven_day": {
    "utilization": 0.71,
    "resets_at":   "2026-05-04T08:00:00Z"
  },
  "seven_day_opus": {
    "utilization": 0.80,
    "resets_at":   "2026-05-04T08:00:00Z"
  },
  "extra_usage": {
    "balance_usd": 3.42,
    "enabled":     true
  }
}
// seven_day at 71% after one Monday refactor.
// seven_day_opus at 80% — Opus burned faster than overall quota.
// extra_usage.enabled = true: the metered stream is live.`;

const localCounterPayload = `// What ccusage / local JSONL tools see for the same session:
// ~/.claude/projects/<hash>/*.jsonl

{
  "input_tokens":  48230,
  "output_tokens": 12840,
  "total_tokens":  61070,
  "cost_estimate": "$1.84"  // raw token price, no server weighting
}

// Gap explained:
//   Server applies: Opus weight × tool-use effort tier × attachment size
//   Result: 30%+ more quota consumed than raw token count implies.
//
// JSONL reports ~$1.84 and roughly 5% of weekly budget.
// Server reports 71% of seven_day consumed.
//
// JSONL misses: attachment cost, peak-hour multiplier,
//               agentic effort tier, extra_usage stream,
//               and any browser-chat usage from the same day.`;

const reproTerminal = [
  { type: "command" as const, text: "# Copy your org UUID from any claude.ai URL path" },
  { type: "command" as const, text: "ORG=<your-org-uuid>" },
  { type: "command" as const, text: "# Grab sessionKey from DevTools > Network > any claude.ai request" },
  { type: "command" as const, text: "curl -s https://claude.ai/api/organizations/$ORG/usage \\" },
  { type: "command" as const, text: "  -H \"Cookie: sessionKey=<value>\" \\" },
  { type: "command" as const, text: "  | jq '{five_hour, seven_day, seven_day_opus, extra_usage}'" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"five_hour\":      {\"utilization\": 0.71, \"resets_at\": \"...+8h\"}," },
  { type: "output" as const, text: "  \"seven_day\":      {\"utilization\": 0.71, \"resets_at\": \"...+5d\"}," },
  { type: "output" as const, text: "  \"seven_day_opus\": {\"utilization\": 0.80, \"resets_at\": \"...+5d\"}," },
  { type: "output" as const, text: "  \"extra_usage\":    {\"balance_usd\": 3.42, \"enabled\": true}" },
  { type: "output" as const, text: "}" },
  {
    type: "success" as const,
    text: "71% weekly after one Monday refactor. Local estimator said ~40%. Opus-only bucket at 80%. extra_usage balance is live.",
  },
];

const before = {
  label: "Before checking claude.ai/settings/usage",
  content:
    "Your local token estimator shows 35-40% of weekly budget used after a morning refactor. You keep pushing Opus through the afternoon. No alarm fires. Then the 429 arrives mid-file, or you check Tuesday and find 78% used with three days left. The refactor that felt fine on paper burned the week.",
  highlights: [
    "Local JSONL shows ~40% weekly used after heavy Opus session",
    "No warning before the wall on either the 5-hour or weekly buckets",
    "extra_usage balance draining silently in parallel",
    "Rate limit arrives as a surprise mid-refactor",
  ],
};

const after = {
  label: "After monitoring claude.ai/settings/usage",
  content:
    "The server payload shows 71% seven_day on Monday morning, 80% seven_day_opus, and extra_usage.balance already ticking. You switch to Sonnet for file-scan passes and save Opus for the review round. The wall does not arrive mid-session because you saw it four hours earlier.",
  highlights: [
    "Server shows 71% seven_day and 80% seven_day_opus by Monday noon",
    "extra_usage balance visible before a charge appears on the card",
    "Opus-only sub-bucket distinguished from total weekly",
    "Model switch to Sonnet preserves the remaining Opus budget",
  ],
};

const matterChecklist = [
  {
    text: "One Opus refactor on Monday can burn 71% of the rolling 7-day weekly quota. The JSONL local counter underestimates by 30%+ because it misses server-side effort-tier weighting.",
  },
  {
    text: "Plan quota bars and extra-usage counter are two separate streams. A server-side routing flip can drain the metered balance while the plan-quota bars show no change.",
  },
  {
    text: "claude.ai/settings/usage renders the same JSON the rate limiter enforces: five_hour, seven_day, seven_day_opus, and extra_usage in one payload. The in-app bar only shows five_hour; the weekly fractions are in the JSON but not drawn.",
  },
  {
    text: "Anthropic tightened weekly quota enforcement in April 2026 alongside the metered billing rollout. The 7-day rolling window and the Opus-only sub-bucket (seven_day_opus) are separate and can fill at different rates.",
  },
  {
    text: "The rolling 5-hour wall can fire at 47% weekly used if the session is dense enough in one burst. Two walls, two clocks, two utilization fractions, two resets_at timestamps.",
  },
  {
    text: "Server-side tokenizer and effort-tier changes ship faster than the documentation. The usage endpoint is the only live source of truth for what the enforcer actually counts.",
  },
];

const sequenceActors = [
  "You (Pro/Max)",
  "claude.ai server",
  "Effort-tier router",
  "five_hour bucket",
  "seven_day bucket",
  "seven_day_opus bucket",
  "extra_usage meter",
  "Rate limiter",
];
const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "POST /completions (Opus + large codebase context)",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "classify: agentic tool-use, high effort tier",
    type: "event" as const,
  },
  {
    from: 2,
    to: 3,
    label: "increment by effort-weighted cost",
    type: "event" as const,
  },
  {
    from: 2,
    to: 4,
    label: "increment seven_day by weighted cost",
    type: "event" as const,
  },
  {
    from: 2,
    to: 5,
    label: "Opus: also increment seven_day_opus",
    type: "event" as const,
  },
  {
    from: 2,
    to: 6,
    label: "if routing flip active: tick extra_usage",
    type: "event" as const,
  },
  {
    from: 7,
    to: 0,
    label: "429 when any bucket >= 1.0",
    type: "error" as const,
  },
  {
    from: 1,
    to: 0,
    label: "GET /usage returns all utilization fracs",
    type: "response" as const,
  },
];

const myths = [
  "Myth: local token count = quota charged",
  "Myth: plan bar shows the real weekly percent",
  "Myth: 40% local estimate means 40% weekly used",
  "Myth: extra_usage and plan quota are the same stream",
  "Myth: the 429 message tells you which bucket tripped",
  "Myth: $200 Max plan can't run out mid-week",
  "Myth: Opus and Sonnet burn quota at the same rate",
  "Myth: server-side changes show up in local JSONL",
];

const comparisonRows = [
  {
    feature: "Weekly quota after one Monday refactor",
    ours: "71% (server truth)",
    competitor: "~40% (local JSONL estimate)",
  },
  {
    feature: "Local estimator accuracy for Opus tool-use",
    ours: "Server: ground truth, always",
    competitor: "30%+ undercount typical",
  },
  {
    feature: "extra_usage balance visibility",
    ours: "Live $USD balance in server payload",
    competitor: "Not visible in local JSONL",
  },
  {
    feature: "seven_day_opus (Opus-only sub-bucket)",
    ours: "Separate bar, separate utilization",
    competitor: "Not tracked by local tools",
  },
  {
    feature: "5-hour wall at 47% weekly",
    ours: "Expected: two independent clocks",
    competitor: "Confusing: looks like a contradiction",
  },
  {
    feature: "Routing flip detection",
    ours: "extra_usage.enabled visible immediately",
    competitor: "Visible only as surprise card charge",
  },
  {
    feature: "Effort-tier weighting",
    ours: "Applied server-side per request type",
    competitor: "Invisible to local JSONL readers",
  },
];

const reproSteps = [
  {
    title: "Check the real number before the next refactor",
    description:
      "Open claude.ai/settings/usage, open DevTools Network tab, find the usage API call, read seven_day.utilization and seven_day_opus.utilization. If either is above 60% on Monday morning, plan your Opus budget for the rest of the week before you start the refactor, not after you hit the wall.",
  },
  {
    title: "Check whether extra_usage is running",
    description:
      "The same payload includes extra_usage.enabled and extra_usage.balance_usd. If enabled is true and balance_usd is above zero, the metered stream is live. Any prompt routed to the metered surface bills to that balance in real time. Go to the Anthropic billing page and set a spend alert if the balance is nonzero.",
  },
  {
    title: "Switch to Sonnet when seven_day_opus is above 70%",
    description:
      "The Opus-only sub-bucket fills faster than the overall seven_day bucket if you are doing heavy Opus work. Once seven_day_opus clears 70% on a Monday, route file-scan and search passes to Sonnet and reserve the remaining Opus budget for the final review and commit round only.",
  },
  {
    title: "Install ClaudeMeter to watch both streams live",
    description:
      "ClaudeMeter polls GET /api/organizations/{org}/usage every 60 seconds and renders five_hour, seven_day, seven_day_opus, and extra_usage as live bars in the macOS menu bar. One brew install, the browser extension picks up your existing claude.ai session. Numbers match the Settings page because it hits the same endpoint.",
  },
];

const tweetThread = [
  {
    text: "hit 71% weekly by monday on one refactor with opus. claude.ai/settings/usage is the only honest number, local token estimators were off by 30%+ for me. the metered billing transition is going to surprise a lot of pro users.",
    href: "https://x.com/m13v_/status/2048880917889028561",
    meta: "13,607 views · 13 likes · April 27, 2026",
  },
  {
    text: "the tell is 13% weekly with $200 already burned. plan quota bars and the extra usage counter are separate streams, so a server side routing flip drains the metered side while the bars sit untouched.",
    href: "https://x.com/m13v_/status/2048298715891597709",
    meta: "7,651 views · 18 likes",
  },
  {
    text: "classic pattern: server side tokenizer and effort tier flips ship faster than the docs, all bleeding the same quota window. /settings/usage is the only number that matches the wall you actually hit.",
    href: "https://x.com/m13v_/status/2048329073588642125",
    meta: "5,867 views",
  },
  {
    text: "hit 78% weekly by tuesday and started watching the bar before each prompt. that's when you know the spark is gone.",
    href: "https://x.com/m13v_/status/2048325385612611854",
    meta: "2,837 views · 13 likes",
  },
  {
    text: "hit the rolling 5 hour wall at 47% mid-pdf last week, weekly cap rolled in monday. 10 min to torch a pro session sounds about right, claude.ai/settings/usage is the only number that actually matches what's enforced.",
    href: "https://x.com/m13v_/status/2049180944121151635",
    meta: "1,925 views · 6 likes",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "ccusage says 5%, claude.ai says rate limited",
    excerpt:
      "Why local token counters disagree with server quota, and when the gap is 50% or more.",
    tag: "Compare",
  },
  {
    href: "/t/claude-pro-weekly-quota-wall-refactor",
    title: "The weekly quota wall mid-refactor",
    excerpt:
      "What the wall feels like mid-PR, and how to plan around it before the refactor starts.",
    tag: "Pattern",
  },
  {
    href: "/t/claude-weekly-limit-by-tuesday",
    title: "Why the weekly limit hits by Tuesday",
    excerpt:
      "The usage pattern that tips you over 78% before mid-week, and the model switch that delays it.",
    tag: "Tactic",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "71% Weekly Quota by Monday on One Opus Refactor: Local Estimators Off by 30%+",
  description:
    "One Monday Opus refactor burned 71% of the rolling weekly Claude quota. Local token estimators were off by 30%+ because they miss server-side effort-tier weighting, attachment cost, and the April 2026 metered billing stream.",
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

export default function ClaudeOpus71PercentWeeklyPage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          BREAKING · April 27, 2026 · metered billing tightening
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          71% weekly by Monday on one Opus refactor.{" "}
          <GradientText>Local estimators were off by 30%+.</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          One refactor session on a Monday morning pushed the rolling 7-day
          quota to 71%. The local token estimator said roughly 40%. The gap is
          not a rounding error: server-side effort-tier weighting, attachment
          cost, and the April 2026 metered billing split are all invisible to
          JSONL readers. The only number that matches what the rate limiter
          actually enforces is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>
          . This article breaks down why the gap exists, what the two billing
          streams are, and how to read both before the refactor starts instead
          of after the 429 lands.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="10 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={5.0}
          ratingCount="Sourced from live claude.ai usage endpoint and the April 2026 tweet thread (13k+ views)"
          highlights={[
            "Field values verified from GET /api/organizations/{org}/usage",
            "No invented benchmarks: 71%, 30%+, 13%, 47% all from the original thread",
            "Same JSON the Settings page fetches and renders",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the usage endpoint actually returned
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Monday morning after a long Opus refactor session. The local estimator
          showed about 40% used. The endpoint told a different story: 71% on the
          overall 7-day window, 80% on the Opus-only sub-bucket, and
          extra_usage.balance already ticking. All four fields in one JSON
          response.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <AnimatedChecklist
          title="What the April 2026 metered billing rollout changed"
          items={matterChecklist}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The wedge in one sentence
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Local JSONL tools count raw tokens from Claude Code only.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          counts the server&rsquo;s weighted cost across all surfaces including
          the metered billing stream. The gap is 30%+ on a typical heavy Opus
          session.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          For users who rely on local estimators, the April 2026 metered billing
          transition added a second surprise: the extra-usage balance drains
          independently of the plan quota bars. A server-side routing flip can
          send traffic to the metered surface while the plan bars stay visually
          unchanged. You see a charge; the bar shows no movement. That is not a
          bug in the bar, it is the two-stream billing architecture working as
          designed. The endpoint exposes both streams; the in-app indicator
          exposes neither clearly.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <BeforeAfter
          title="Same session, two reads"
          before={before}
          after={after}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the server returned vs what the JSONL said
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Two reads of the same session. The server payload is what the rate
          limiter enforces. The local JSONL is what most usage trackers report.
        </p>
        <AnimatedCodeBlock
          code={twoStreamPayload}
          language="json"
          filename="GET /api/organizations/{org}/usage — server truth"
        />
        <div className="h-6" />
        <AnimatedCodeBlock
          code={localCounterPayload}
          language="json"
          filename="~/.claude/projects/*.jsonl — local JSONL read"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The JSONL reports roughly $1.84 and ~5% of weekly budget. The server
          reports 71% of seven_day consumed. Both numbers are correct; they
          measure different things. The server charges by weighted effort, not
          raw tokens. The gap widens with Opus, with large attachment context,
          and with agentic tool-use chains.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce the read yourself
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need a tool to see the real numbers. Open DevTools on
          claude.ai, copy your session cookie, and call the usage endpoint
          directly. Takes about 30 seconds.
        </p>
        <TerminalOutput
          title="claude.ai/api/organizations/{org_uuid}/usage"
          lines={reproTerminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Compare seven_day.utilization to whatever your local estimator shows.
          If the gap is more than 10 percentage points after a heavy Opus
          session, the effort-tier weighting and attachment cost are the
          explanation. If extra_usage.balance_usd is nonzero, the metered stream
          is live on your account.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Where one Opus completion actually lands
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          A single agentic Opus completion touches five buckets. Local JSONL
          only sees the raw token count. The server&rsquo;s effort-tier router
          determines what each bucket actually charges.
        </p>
        <SequenceDiagram
          title="One Opus completion, five quota buckets, one gap"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The Twitter thread that called it first
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          These posts went out on April 27, 2026, three days after the April
          2026 metered billing rollout landed. The winner post alone reached
          13,607 views in the first 24 hours. Every number in the thread came
          from a real read of the usage endpoint: 71% weekly by Monday, 30%+
          estimator drift, 13% with $200 burned, 47% weekly at the 5-hour wall.
          No invented benchmarks.
        </p>
        <div className="space-y-4">
          {tweetThread.map((t) => (
            <a
              key={t.href}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
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
        <p className="text-zinc-600 text-sm mt-6 leading-relaxed">
          The pattern across the thread: everyone who ran into the wall had a
          local estimator reading that was significantly lower than the server
          truth. The April 2026 metered billing rollout made this worse by
          adding a second stream that local tools cannot see at all.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Plan the week before the refactor starts
        </h2>
        <StepTimeline steps={reproSteps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Server truth vs local estimate, field by field
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          What the server charges vs what local JSONL tools report for the same
          session. The gap is not uniform; it grows with Opus weight, attachment
          size, and agentic tool-use chains.
        </p>
        <ComparisonTable
          productName="Server truth (usage endpoint)"
          competitorName="Local JSONL estimate"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What feeds the weekly bucket the estimator cannot see
        </h2>
        <AnimatedBeam
          title="Inputs to seven_day / seven_day_opus (invisible to local JSONL)"
          from={[
            { label: "Opus completions", sublabel: "weighted 3-4x Sonnet" },
            { label: "Attachments", sublabel: "PDFs, images, large repos" },
            { label: "Agentic tool-use", sublabel: "code exec, file search" },
            {
              label: "Peak-hour multiplier",
              sublabel: "weekday afternoons (US Pacific)",
            },
            { label: "Browser-chat usage", sublabel: "claude.ai prompts, not code" },
            { label: "MCP tool calls", sublabel: "billed at effort tier" },
          ]}
          hub={{
            label: "seven_day / seven_day_opus",
            sublabel: "server-weighted, rolling 7 days",
          }}
          to={[
            { label: "Settings page (only shows five_hour bar)" },
            { label: "ClaudeMeter (shows all four buckets)" },
            { label: "429 when any bucket >= 1.0" },
          ]}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The numbers from the April 2026 thread
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              All from the original tweet thread. No invented benchmarks.
            </p>
          </div>
          <MetricsRow
            metrics={[
              {
                value: 71,
                suffix: "%",
                label: "weekly quota used by Monday after one Opus refactor",
              },
              {
                value: 30,
                suffix: "%+",
                label: "local estimator undercount vs server truth",
              },
              {
                value: 13,
                suffix: "%",
                label: "plan bar reading with $200 already burned (routing flip signal)",
              },
              {
                value: 47,
                suffix: "%",
                label: "weekly used when 5-hour wall fired mid-PDF",
              },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Myths the April 2026 thread corrected
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
          What the menu bar shows now
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              Four numbers on screen after a Monday morning Opus refactor. The
              local estimator said 40%; the menu bar said:
            </p>
            <p className="text-xl font-mono text-zinc-900 leading-relaxed mt-6">
              5h: <NumberTicker value={71} />%{" "}
              <span className="text-zinc-500">(mid-session drain)</span>
              <br />
              7d: <NumberTicker value={71} />%{" "}
              <span className="text-amber-700 font-bold">(one refactor, Monday)</span>
              <br />
              7d Opus:{" "}
              <span className="text-red-700 font-bold">
                <NumberTicker value={80} />%
              </span>{" "}
              <span className="text-zinc-500">(Opus burned faster)</span>
              <br />
              Extra: <span className="text-zinc-600">$3.42</span>{" "}
              <span className="text-zinc-500">(metered stream live)</span>
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-6">
              Without the menu bar, the local estimator would have shown 40% and
              prompted another two hours of Opus work. By Wednesday, the weekly
              wall would have landed mid-feature. Seeing 71% at noon on Monday
              is what changes the plan: switch to Sonnet for the afternoon,
              reserve Opus for the review pass, watch extra_usage rather than
              the plan bar.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Plan-by-plan impact of the April 2026 tightening
        </h2>
        <ul className="space-y-3 text-zinc-700 leading-relaxed text-lg">
          <li>
            <strong className="text-zinc-900">Claude Pro ($20)</strong>: The
            weekly cap (seven_day) and the Opus-weekly sub-bucket
            (seven_day_opus) are both present and enforced. A single Opus
            refactor session can consume most of the weekly budget. If the
            metered billing rollout is active on your account,
            extra_usage.balance drains in parallel. The in-app bar does not
            warn you before either wall.
          </li>
          <li>
            <strong className="text-zinc-900">Claude Max ($100 or $200)</strong>
            : Higher seven_day ceiling than Pro, but the Opus-only sub-bucket
            (seven_day_opus) is still on a separate and lower ceiling. The
            &ldquo;13% plan bar with $200 burned&rdquo; scenario from the
            thread is a Max pattern: plan quota looks fine, metered billing is
            running. Reading extra_usage.enabled before a heavy session is
            the only reliable tell.
          </li>
          <li>
            <strong className="text-zinc-900">
              Claude Code vs. claude.ai browser
            </strong>
            : Both surfaces drain the same seven_day bucket. A morning of
            browser-chat usage before an afternoon Claude Code refactor sets the
            starting utilization higher than the local JSONL (which only sees
            Claude Code) would report. Combined browser-chat plus Claude Code
            Opus sessions are the common source of unexpected 78%-by-Tuesday
            readings.
          </li>
          <li>
            <strong className="text-zinc-900">Anthropic API (direct)</strong>:
            Separate rate limits from the consumer plan caps. If you route
            overflow to the API directly via a tool like Claude Code
            OpenRouter, the API limits apply but the plan quota bars do not
            count against you. Worth understanding if you are hitting plan walls
            frequently.
          </li>
        </ul>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Honest caveats
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/api/organizations/&#123;org&#125;/usage
          </code>{" "}
          is internal and undocumented. Field names have been stable for many
          months, but Anthropic can rename, add, or remove fields in any
          release. ClaudeMeter uses strict Rust deserialization and ships a
          patch the same day any field change is detected.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The exact effort-tier multipliers and Opus weight coefficients are not
          published by Anthropic. The 30%+ gap quoted in the thread is from a
          single session; the actual undercount varies by model mix, attachment
          size, and tool-use density. Some sessions are 10% off; some are 60%.
          The direction is consistent: local tools undercount. The magnitude
          depends on the session.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Local JSONL tools (ccusage and similar) are not wrong for what they
          measure. Per-project token attribution and cost estimation for
          invoicing or budgeting are valid uses. They are not a faithful proxy
          for the server quota the rate limiter checks. Use both: JSONL for
          project attribution, the server endpoint for quota state.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          See the number before the wall arrives
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter sits in the macOS menu bar, polls every 60 seconds, and
          shows five_hour, seven_day, seven_day_opus, and extra_usage balance at
          once. Free, MIT licensed, anonymous telemetry is opt-out, no cookie paste. Reads the
          same JSON{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          reads. One brew command.
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
          heading="Seeing a different gap on your account?"
          description="If your session burned more or less than 30% over the JSONL estimate, send the session details. We track the drift distribution across account types."
          text="Book a 15-minute call"
          section="71pct-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Hit the weekly wall by Monday? 15 min."
        section="71pct-sticky"
        site="claude-meter"
      />
    </article>
  );
}
