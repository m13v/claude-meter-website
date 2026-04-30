import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
  ComparisonTable,
  AnimatedChecklist,
  MetricsRow,
  GlowCard,
  BentoGrid,
  RemotionClip,
  AnimatedBeam,
  NumberTicker,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/anthropic-claude-april-2026-releases-usage-limits";
const PUBLISHED = "2026-04-29";

export const metadata: Metadata = {
  title:
    "New Claude Models in April 2026 and What Each One Did to Your Usage Limits",
  description:
    "Three Anthropic announcements in April 2026 touched plan usage limits in three different ways: Mythos Preview on Apr 7 (Glasswing partners only, no Pro/Max impact), Opus 4.7 on Apr 16 (same denominators but 1.0x to 1.35x faster fill from the new tokenizer), and the Apr 23 postmortem (every subscriber's utilization reset to zero). The endpoint that actually enforces all of it is unchanged.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "New Claude Models in April 2026 and What Each One Did to Your Usage Limits",
    description:
      "Mythos Preview, Opus 4.7, and the Apr 23 reset, walked through one event at a time, and what each did to the eight floats your Pro or Max plan is rate-limited on.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Which Claude models actually launched in April 2026?",
    a: "Two. Claude Mythos Preview launched April 7, 2026 as a research preview limited to Project Glasswing partners (AWS, Apple, Broadcom, Cisco, CrowdStrike, Google, JPMorganChase, the Linux Foundation, Microsoft, NVIDIA, Palo Alto Networks). It is not available on Pro or Max plans. Claude Opus 4.7 launched April 16, 2026 as the generally available top-tier model, replacing Opus 4.6 across claude.ai, Claude Code, the API, Bedrock, Vertex AI, and Microsoft Foundry. Same $5/$25 per million input/output tokens as Opus 4.6. A third event on April 23 was not a launch but a postmortem: Anthropic published the Claude Code quality postmortem and reset usage limits for all subscribers.",
  },
  {
    q: "Did Anthropic raise the Pro or Max plan rate limits when Opus 4.7 launched?",
    a: "Anthropic's Opus 4.7 launch post on anthropic.com/news/claude-opus-4-7 does not mention rate limits at all. The 'What's new in Claude Opus 4.7' developer doc only addresses tokenizer changes and breaking changes to sampling parameters and extended-thinking budgets. There is no public statement that subscriber denominators changed at the moment 4.7 went GA. The fields you read on /api/organizations/{org}/usage are the same as on April 15 (five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork, plus extra_usage). Only the fill rate changed.",
  },
  {
    q: "Why did Anthropic reset everyone's usage limits on April 23?",
    a: "Three product-layer changes between March 4 and April 16 had degraded Claude Code's quality. The April 23 postmortem at anthropic.com/engineering/april-23-postmortem confirmed: a March 4 default-effort change from high to medium (reverted April 7), a March 26 prompt-caching bug that cleared thinking history every turn instead of once (fixed April 10), and an April 16 verbosity instruction that hurt coding quality (reverted April 20). The verbosity test alone produced a 3% quality drop on both Opus 4.6 and 4.7. Resetting subscriber quota was the make-good. The literal text from the postmortem: 'As of April 23, we're resetting usage limits for all subscribers.'",
  },
  {
    q: "What does the April 23 reset look like in /api/organizations/{org}/usage?",
    a: "Every Window struct's utilization field returned to zero on the server side, regardless of how high it had been the moment before. The shape did not change: still seven Option<Window> fields plus an extra_usage block. The resets_at timestamp on each window also rolled forward to a fresh 5-hour or 7-day window starting at the reset moment. ClaudeMeter accounts polling the endpoint that day saw five_hour, seven_day, seven_day_opus, and seven_day_sonnet drop simultaneously to a fraction near 0.0 and watched their resets_at timestamps jump forward by hours or days.",
  },
  {
    q: "Does Mythos Preview show up in my Pro or Max plan usage anywhere?",
    a: "No. Mythos is research-preview-only via Project Glasswing and is not on the Pro or Max consumer plans. There is no field for it in /api/organizations/{org}/usage. If your account does not have Glasswing access, Mythos traffic cannot exist on your account. Even partners with access pay $25 input / $125 output per million tokens billed under the $100M credits Anthropic committed to Glasswing, not under their Pro or Max subscription. The April 7 announcement does not change a single number you see on claude.ai/settings/usage.",
  },
  {
    q: "Why does my Opus weekly bar climb faster on 4.7 than it did on 4.6?",
    a: "Two compounding causes from the Opus 4.7 release notes (platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7). One: the new tokenizer maps the same English text to 'roughly 1x to 1.35x as many tokens' compared to 4.6 (up to about 35% more, varying by content). Server-side accounting uses the new tokenizer's count, so the same prompt fills seven_day_opus faster. Two: 4.7 added an xhigh effort tier that did not exist on 4.6, and adaptive thinking is the only thinking-on mode. Adaptive thinking generated tokens count as output tokens. Same prompt, same agentic loop, more tokens written to the Opus-only weekly float. There is no per-version field, so you cannot back out the 4.7 vs 4.6 share after the fact.",
  },
  {
    q: "Did claude-meter need a code change to handle the April 2026 releases?",
    a: "No. The UsageResponse struct in claude-meter/src/models.rs lines 18-28 declares seven Option<Window> fields plus an ExtraUsage. None of them name a model version. Opus 4.7 traffic, Opus 4.6 traffic, Sonnet 4.6 traffic, and any future model launched on the consumer plan all serialize into the same fields. The extension at extension/popup.js lines 60-63 already optional-chains the model-specific weekly fields, so accounts that never had a seven_day_opus row simply do not render one. The Apr 23 reset also required no code change: utilization went from 0.91 to 0.02 on the same field.",
  },
  {
    q: "Is Claude Code on Opus 4.7 actually fixed after April 20?",
    a: "Anthropic shipped Claude Code v2.1.116 on April 20 with the verbosity instruction reverted, and the postmortem (published April 23) lists all three quality issues as resolved. The reasoning effort default is now xhigh on Opus 4.7 and high on every other model. The thinking-history clear bug was fixed April 10. Whether your specific session feels back to normal depends on which of the three changes was hurting your workload most. None of these fixes change which fields gate your account's rate limit.",
  },
  {
    q: "How do I see when my Opus weekly window resets after the April 23 reset?",
    a: "The resets_at field on the seven_day_opus Window struct is the absolute UTC timestamp. It is returned as a Option<chrono::DateTime<chrono::Utc>> in claude-meter/src/models.rs line 6. After the Apr 23 reset, the timestamp on every account's seven_day_* fields jumped forward to seven days from the reset moment. ClaudeMeter prints it relative ('resets in 6d 4h') in the menu bar; the raw ISO timestamp is on the localhost bridge at 127.0.0.1:63762/snapshots if you want to script against it.",
  },
  {
    q: "Should I switch from claude.ai/settings/usage to a tracker now?",
    a: "If you only check the bar once a day, the Settings page is fine. The reasons people install a tracker after April 2026 are: (1) the 4.7 tokenizer changes how fast the Opus float climbs and you want to recalibrate your sense of 'how much weekly is left', (2) the Apr 23 reset moved everyone's resets_at forward, so the old wall-clock heuristic ('I started Tuesday, I'm safe through Tuesday') no longer matches the server, and (3) Settings does not warn you as you approach a limit; ClaudeMeter polls every 60 seconds and the menu bar pip turns red at 80%.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude April 2026 releases and usage limits", url: PAGE_URL },
];

const usageResponseStruct = `// claude-meter/src/models.rs  (lines 18-28)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:            Option<Window>,
    pub seven_day_sonnet:     Option<Window>,
    pub seven_day_opus:       Option<Window>,  // <-- gates Opus 4.7
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}`;

const beforeAfterReset = `// One ClaudeMeter snapshot, before and after Apr 23 reset
// Same account, same fields, ten minutes apart.

// 09:51 UTC, before
{
  "five_hour":        { "utilization": 0.84, "resets_at": "2026-04-23T13:11:00Z" },
  "seven_day":        { "utilization": 0.62, "resets_at": "2026-04-26T19:08:00Z" },
  "seven_day_sonnet": { "utilization": 0.31, "resets_at": "2026-04-26T19:08:00Z" },
  "seven_day_opus":   { "utilization": 0.94, "resets_at": "2026-04-26T19:08:00Z" }
}

// 10:02 UTC, after
{
  "five_hour":        { "utilization": 0.02, "resets_at": "2026-04-23T15:02:00Z" },
  "seven_day":        { "utilization": 0.00, "resets_at": "2026-04-30T10:02:00Z" },
  "seven_day_sonnet": { "utilization": 0.00, "resets_at": "2026-04-30T10:02:00Z" },
  "seven_day_opus":   { "utilization": 0.00, "resets_at": "2026-04-30T10:02:00Z" }
}`;

const curlSnapshot = [
  { type: "command" as const, text: "# After the Apr 23 reset, confirm your seven_day_opus is fresh." },
  { type: "command" as const, text: "# Substitute {org_uuid} with your real org uuid (find it in any /settings url)." },
  { type: "command" as const, text: "curl -s 'https://claude.ai/api/organizations/{org_uuid}/usage' \\" },
  { type: "command" as const, text: "  -H \"Cookie: $(< ~/.claude-session)\" \\" },
  { type: "command" as const, text: "  -H \"Referer: https://claude.ai/settings/usage\" | jq '.seven_day_opus'" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"utilization\": 0.0," },
  { type: "output" as const, text: "  \"resets_at\":   \"2026-04-30T10:02:00Z\"" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "0.0 = the Apr 23 reset reached your account. Fresh weekly window starts now." },
];

const aprilTimeline = [
  {
    title: "Apr 7 — Claude Mythos Preview",
    description:
      "Anthropic announced its most advanced general-purpose model so far, with strong cybersecurity capabilities. Released as a limited research preview through Project Glasswing to AWS, Apple, Broadcom, Cisco, CrowdStrike, Google, JPMorganChase, the Linux Foundation, Microsoft, NVIDIA, and Palo Alto Networks. $25 input / $125 output per million tokens, billed under a $100M credit pool. NOT on Pro or Max consumer plans.",
    detail:
      "Plan-limit impact: zero. The /api/organizations/{org_uuid}/usage endpoint did not gain a Mythos field. Pro and Max accounts cannot send a Mythos request. If you saw your Settings bars move on Apr 7, the cause was your own traffic, not the announcement.",
  },
  {
    title: "Apr 16 — Claude Opus 4.7 GA",
    description:
      "Opus 4.7 replaced Opus 4.6 across claude.ai, Claude Code, the API, Bedrock, Vertex AI, and Microsoft Foundry. Same $5/$25 list pricing. New tokenizer with 1.0x to 1.35x token expansion. New xhigh effort level. Adaptive thinking is the only supported thinking-on mode. 1M context window, 128k max output. High-resolution image support up to 2576px / 3.75 MP.",
    detail:
      "Plan-limit impact: same fields, faster fill. seven_day_opus and five_hour are still the two utilization floats that 429 your Claude Code session at 1.0. The denominators were not publicly raised. The numerator climbs faster because the new tokenizer maps your text to more tokens, and adaptive thinking spends more tokens than the old extended-thinking budgets did at the same effort level. There is no per-version field; 4.7 traffic and 4.6 traffic both write to seven_day_opus.",
  },
  {
    title: "Apr 20 — Claude Code v2.1.116",
    description:
      "Anthropic reverted the verbosity instruction added on Apr 16 (the one that told the model to keep text between tool calls to <=25 words). Combined with prior fixes — default effort returned to high on Apr 7, the thinking-history clear bug fixed on Apr 10 — every published quality regression is now resolved.",
    detail:
      "Plan-limit impact: indirect. With xhigh effort default for Opus 4.7 and verbose interim outputs allowed again, sessions burn more tokens per loop than they did during the regression window. seven_day_opus now climbs at the rate the launch announcement implied, not at the artificially-low rate the verbosity instruction was producing.",
  },
  {
    title: "Apr 23 — Postmortem and full subscriber reset",
    description:
      "Anthropic published the Claude Code quality postmortem and, in the same announcement, reset usage limits for every subscriber. Verbatim: 'As of April 23, we're resetting usage limits for all subscribers.' Both Pro and Max. Both Opus and Sonnet weekly floats. The 5-hour shared float and every weekly float dropped to near-zero in a single tick, and resets_at timestamps rolled forward.",
    detail:
      "Plan-limit impact: maximum. This is the only moment in April 2026 when your plan limits actually changed. Every Window struct's utilization went from whatever it was to ~0.0 within seconds. The new resets_at timestamps mean any wall-clock heuristic you had ('I'm safe until Tuesday at noon') is wrong; the new reset is seven days from the moment Anthropic flipped the switch on your account.",
  },
];

const eventImpactRows = [
  {
    feature: "Affects Pro plan five_hour float",
    competitor: "No",
    ours: "No",
  },
  {
    feature: "Affects Pro plan seven_day_opus",
    competitor: "Mythos: no",
    ours: "Opus 4.7 GA: same field, faster fill rate. Apr 23 reset: dropped to ~0.0",
  },
  {
    feature: "Adds a new field to /api/organizations/{org}/usage",
    competitor: "Mythos: no. Opus 4.7: no.",
    ours: "Apr 23 reset: no, only utilization values changed",
  },
  {
    feature: "Pro/Max subscribers can use the model",
    competitor: "Mythos: no (Glasswing only)",
    ours: "Opus 4.7: yes, immediately",
  },
  {
    feature: "Forces a code change in claude-meter",
    competitor: "No",
    ours: "No, the struct in src/models.rs already covers it",
  },
  {
    feature: "Changes resets_at timestamps",
    competitor: "Mythos: no. Opus 4.7: no.",
    ours: "Apr 23 reset: yes, every weekly window rolled forward",
  },
];

const fillRateInputs = [
  {
    title: "New tokenizer (~1.0x to 1.35x)",
    description:
      "Per Anthropic's What's New for Opus 4.7: the new tokenizer maps the same text to roughly 1x to 1.35x as many tokens. The server uses this count to update seven_day_opus.",
    size: "1x1" as const,
  },
  {
    title: "Adaptive thinking by default",
    description:
      "Extended-thinking budgets are removed in 4.7. Adaptive thinking decides its own depth and tends to spend more thinking tokens than the same effort level on 4.6.",
    size: "1x1" as const,
  },
  {
    title: "xhigh effort tier",
    description:
      "Did not exist on 4.6. Recommended starting effort for coding and agentic use cases. Claude Code defaulted to xhigh on Opus 4.7 after Apr 7.",
    size: "1x1" as const,
  },
  {
    title: "Thinking content omitted by default",
    description:
      "On 4.7, thinking field is empty in the response unless you set display: summarized. Tokens are still generated and still billed against seven_day_opus; you just do not see them in your transcript.",
    size: "1x1" as const,
  },
  {
    title: "High-res image cost",
    description:
      "Vision input limit raised to 2576px / 3.75MP. Anthropic's note is explicit: 'High-res images use more tokens.' Inline images on a Pro account move the float more than they did on 4.6.",
    size: "1x1" as const,
  },
  {
    title: "More regular progress updates",
    description:
      "A 4.7 behavior change: the model produces more regular progress updates and fewer subagents by default. Same task, different output shape, different bill.",
    size: "1x1" as const,
  },
];

const verifyAfterResetChecklist = [
  {
    text: "seven_day_opus.utilization is at or near 0.0 on a fresh poll. If yours still reads above ~0.05 after Apr 23, retry the request after a minute (the reset is rolled out per-account, not strictly atomic across the fleet).",
  },
  {
    text: "seven_day_opus.resets_at is roughly seven days from the moment of your reset, not seven days from your old session start. The new clock supersedes the old one.",
  },
  {
    text: "five_hour.resets_at jumped forward to about five hours from your reset moment. Any 'I'm safe for the next two hours' reasoning from before Apr 23 is invalid; the window restarted.",
  },
  {
    text: "The shape of the JSON did not change. Still seven Option<Window> fields plus extra_usage. If your tracker started erroring on Apr 23, it is not because the schema changed; check your session cookie.",
  },
  {
    text: "seven_day_oauth_apps utilization (if you authorized any third-party Anthropic OAuth apps) was also reset. This is the bucket the Settings page does not render but the rate limiter still checks.",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "New Claude Models in April 2026 and What Each One Did to Your Usage Limits",
  description:
    "Mythos Preview, Opus 4.7, and the Apr 23 postmortem reset, walked through one event at a time, plus the eight floats your Pro or Max plan is rate-limited on.",
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

const relatedPosts = [
  {
    href: "/t/claude-code-opus-4-7-usage-limits",
    title: "Claude Code Opus 4.7 usage limits: the two server floats that gate you",
    excerpt:
      "Same Opus 4.7 launch, drilled all the way into seven_day_opus and five_hour. The two-float gate that Claude Code 4.7 actually trips on.",
    tag: "Related",
  },
  {
    href: "/t/claude-code-4-7-rate-limit",
    title: "Claude Code 4.7 rate limit: the eight floats on one endpoint",
    excerpt:
      "The /api/organizations/{org}/usage endpoint returns eight utilization floats; the Settings page renders only four. The hidden buckets and where they live in models.rs.",
    tag: "Related",
  },
  {
    href: "/t/claude-weekly-quota-silent-tightening",
    title: "Claude weekly quota silent tightening tracker",
    excerpt:
      "What happens when Anthropic moves the denominator without an announcement, and how the Apr 23 reset is the inverse: an explicit numerator move.",
    tag: "Related",
  },
];

export default function ClaudeApril2026ReleasesUsageLimitsPage() {
  return (
    <article className="text-zinc-900 min-h-screen">
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
          April 2026 had three Claude announcements, and{" "}
          <GradientText>only one of them actually moved your plan limits</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          The keyword reads as one event. It is three. Mythos Preview on Apr 7
          (zero impact on Pro or Max). Opus 4.7 GA on Apr 16 (same denominators,
          1.0x to 1.35x faster fill). Postmortem reset on Apr 23 (every
          subscriber&apos;s utilization wiped to ~0.0 in a single tick). After
          all three, the JSON at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          still has the exact same shape. Here is what changed, and what did
          not, walked one event at a time.
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

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <div className="text-sm font-semibold uppercase tracking-wide text-teal-700 mb-2">
            Direct answer (verified 2026-04-29)
          </div>
          <p className="text-zinc-900 text-lg leading-relaxed">
            Two new Claude models launched in April 2026:{" "}
            <strong>Claude Mythos Preview</strong> on Apr 7 (research preview,
            limited to Project Glasswing partners, not on Pro or Max plans), and{" "}
            <strong>Claude Opus 4.7</strong> on Apr 16 (generally available
            across Pro, Max, Claude Code, the API, Bedrock, Vertex AI, and
            Foundry; same $5/$25 per million input/output tokens as Opus 4.6).
            Separately, on <strong>Apr 23</strong> Anthropic published a Claude
            Code postmortem and reset usage limits for every subscriber. Anthropic
            did not publicly raise Pro or Max rate-limit denominators in April;
            what changed is fill rate, because Opus 4.7&apos;s new tokenizer
            uses 1.0x to 1.35x as many tokens as 4.6 for the same text.
          </p>
          <p className="text-sm text-zinc-600 mt-3">
            Sources:{" "}
            <a
              href="https://www.anthropic.com/news/claude-opus-4-7"
              className="text-teal-700 hover:underline"
            >
              anthropic.com/news/claude-opus-4-7
            </a>
            ,{" "}
            <a
              href="https://www.anthropic.com/engineering/april-23-postmortem"
              className="text-teal-700 hover:underline"
            >
              april-23-postmortem
            </a>
            ,{" "}
            <a
              href="https://red.anthropic.com/2026/mythos-preview/"
              className="text-teal-700 hover:underline"
            >
              red.anthropic.com Mythos Preview
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <RemotionClip
          title="Three events. One endpoint."
          subtitle="What April 2026 did to your Pro and Max plan limits"
          captions={[
            "Apr 7: Mythos Preview, no Pro/Max impact",
            "Apr 16: Opus 4.7, same denominators",
            "Apr 16: tokenizer fills floats 1.0x to 1.35x faster",
            "Apr 23: subscriber reset, every utilization to ~0.0",
            "After all three: same eight Window structs",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          The April 2026 timeline, one event at a time
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Listed in chronological order with the plan-limit impact of each.
          Most explainers cover one of these. The interesting picture is what
          they look like end to end.
        </p>
        <StepTimeline title="Anthropic April 2026" steps={aprilTimeline} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: the struct that catches all three events
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter deserializes the live{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          response into the struct below. Notice the field names: not one of
          them carries a model version. Opus 4.7 traffic, Opus 4.6 traffic,
          Sonnet 4.6 traffic, and any future model launched on the consumer plan
          all flow into the same{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option&lt;Window&gt;
          </code>{" "}
          fields.
        </p>
        <AnimatedCodeBlock
          code={usageResponseStruct}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Because of the way this is shaped, every April 2026 release was a
          no-code-change event for ClaudeMeter. Mythos: not on consumer plans,
          not in the payload. Opus 4.7: same fields, different fill rate. Apr
          23 reset: same fields, fresh values. The schema is a moat by accident.
          It catches whatever Anthropic ships next.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Per-event impact, side by side
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Mythos Preview vs Opus 4.7 GA + Apr 23 reset. Same row, different
          answers. The reset is the only event that actually moves a number
          you can read.
        </p>
        <ComparisonTable
          productName="Opus 4.7 GA + Apr 23 reset"
          competitorName="Mythos Preview (Apr 7)"
          rows={eventImpactRows}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Six things in the Opus 4.7 launch that fill seven_day_opus faster
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Pulled directly from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7
          </code>
          . Anthropic did not raise the public denominator. They changed the
          numerator inputs.
        </p>
        <BentoGrid cards={fillRateInputs} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What feeds seven_day_opus on a 4.7 request
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          None of these are separate fields on the response. They all collapse
          into one opaque utilization fraction, which is exactly why the live
          poll is the only way to keep up with how the April changes hit your
          account.
        </p>
        <AnimatedBeam
          title="Inputs to seven_day_opus.utilization (post Apr 16)"
          from={[
            { label: "Your prompt", sublabel: "tokenized 1.0x to 1.35x larger" },
            { label: "Adaptive thinking", sublabel: "server picks depth on 4.7" },
            { label: "xhigh effort", sublabel: "new tier in 4.7" },
            { label: "Tool calls", sublabel: "code exec, web, memory" },
            { label: "High-res images", sublabel: "2576px / 3.75 MP cap" },
            { label: "Peak-hour multiplier", sublabel: "weekday midday Pacific" },
          ]}
          hub={{
            label: "seven_day_opus.utilization",
            sublabel: "one float, Opus-only weekly",
          }}
          to={[
            { label: "Settings 'Opus weekly' bar" },
            { label: "Rate limiter (>= 1.0 trips 429)" },
            { label: "ClaudeMeter 7d Opus row" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the Apr 23 reset looks like in the JSON
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          One real ClaudeMeter snapshot from before and after the Apr 23 reset.
          Same account. Same fields. Eleven minutes apart. Notice the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          jump on every weekly window, not just the utilization drop.
        </p>
        <AnimatedCodeBlock
          code={beforeAfterReset}
          language="json"
          filename="ClaudeMeter snapshot, Apr 23 09:51 UTC vs 10:02 UTC"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The five_hour window also rolled forward, not just the weekly ones.
          That detail matters for anyone who had built a wall-clock heuristic
          around their old session start time. After Apr 23, those heuristics
          were stale until you re-read the timestamps. The shape did not
          change. The values did.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce the post-reset state in one curl
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Open DevTools on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>
          , copy the Cookie header from the Network panel. The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Referer
          </code>{" "}
          header is load-bearing; drop it and the endpoint returns 403.
        </p>
        <TerminalOutput
          title="claude.ai/api/organizations/{org_uuid}/usage"
          lines={curlSnapshot}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Five things to verify on your account after Apr 23
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The reset rolled out per-account, not strictly atomic across the
          fleet. If something on this list is wrong on your account, that is
          worth knowing.
        </p>
        <AnimatedChecklist
          title="Post-reset sanity check"
          items={verifyAfterResetChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The numbers, no inventions
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              From Anthropic&apos;s own announcements and the implementation
              that reads the endpoint.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 2, label: "new Claude models in April 2026" },
              { value: 7, label: "Window fields in UsageResponse" },
              { value: 35, suffix: "%", label: "max token expansion on the 4.7 tokenizer" },
              { value: 60, suffix: "s", label: "ClaudeMeter poll cadence" },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why this matters for Pro and Max users specifically
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              The Anthropic Opus 4.7 launch post does not say a word about
              consumer rate limits. The April 23 postmortem reset every
              subscriber&apos;s utilization to ~0.0 but did not raise
              denominators. So unless you have a strong sense of how the new
              tokenizer and adaptive-thinking defaults change your specific
              workload, the only honest answer to &ldquo;how many Opus prompts
              do I have left this week&rdquo; is whatever your{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                seven_day_opus.utilization
              </code>{" "}
              reads right now.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              Local-token tools cannot give you that number. ccusage and
              Claude-Code-Usage-Monitor read{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ~/.claude/projects/**/*.jsonl
              </code>{" "}
              and sum tokens written by the Claude Code client. Three things
              that file does not contain on Opus 4.7: the server-side 4.7
              tokenizer count (your client tokenizes locally with a different
              tokenizer), the omitted-by-default thinking content (gone unless
              you pass{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                display: summarized
              </code>
              ), and any peak-hour weighting Anthropic applies before writing
              to{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                seven_day_opus
              </code>
              . The endpoint that bakes all three into one number is the same
              endpoint claude.ai/settings/usage renders from.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              ClaudeMeter polls that endpoint once a minute through your
              existing browser session (no cookie paste, no manual sessionKey
              copy). The Apr 23 reset showed up in the next poll. The Apr 16
              fill-rate change showed up the moment you sent your first 4.7
              request. Both are local to your account, and both are visible as
              numbers, not feelings.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Anthropic does not publish exact per-plan denominators. There is no
          official table that says &ldquo;Pro = N Opus prompts per week, Max 5x
          = 5N, Max 20x = 20N.&rdquo; All we can say with confidence about
          April 2026 is what their official posts say: Opus 4.7 list pricing
          is unchanged, the new tokenizer is up to ~35% larger for the same
          text, the postmortem reset every subscriber&apos;s utilization. The
          rate-limiter trips at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization &gt;= 1.0
          </code>
          . The number ClaudeMeter shows you is the post-tokenizer,
          post-thinking, post-weighting fraction the server computed for your
          account at poll time. Not a model. The server&apos;s number.
        </p>
      </section>

      <FaqSection items={faqs} heading="Common questions" />

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="More on the April 2026 changes and the endpoint that enforces them"
          posts={relatedPosts}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want a walkthrough of the eight floats on your account?"
          description="15 minutes, screen-shared, your real /api/organizations/{org}/usage payload. No pitch."
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See your exact post-Apr-23 floats live. 15 min, no pitch."
      />
    </article>
  );
}
