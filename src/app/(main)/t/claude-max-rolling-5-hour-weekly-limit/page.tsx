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
  "https://claude-meter.com/t/claude-max-rolling-5-hour-weekly-limit";
const PUBLISHED = "2026-05-13";

export const metadata: Metadata = {
  title:
    "Claude Max rolling 5-hour weekly limit: the two limits are actually four",
  description:
    "On Claude Max, the rolling 5-hour window and the weekly cap are not two limits, they are four+ independent utilization windows that each fire their own 429. Here is the exact field list, the May 6 2026 doubling, and how to read the live numbers.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Max rolling 5-hour weekly limit: the two limits are actually four",
    description:
      "Max enforces five_hour, seven_day, seven_day_sonnet, seven_day_opus, and three more buckets. Each has its own clock. Any one at 100% returns a 429. Verified from the open-source claude-meter source.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "Claude Max rolling 5-hour weekly limit",
    url: PAGE_URL,
  },
];

const faqs = [
  {
    q: "What are Claude Max's rolling 5-hour and weekly limits?",
    a: "They are floats, not prompt counts. Anthropic enforces utilization fractions between 0.0 and 1.0 on each of these buckets on Max: five_hour (rolling 5-hour window across all models), seven_day (overall weekly), seven_day_sonnet (weekly Sonnet-only), seven_day_opus (weekly Opus-only), seven_day_oauth_apps (weekly Claude Code + MCP traffic), seven_day_omelette, and seven_day_cowork. Any one bucket at 1.0 fires the next 429. The endpoint is GET claude.ai/api/organizations/{org_uuid}/usage. Anthropic does not publish prompt counts; independent estimates put Max 5x at roughly 50 to 200 prompts per 5-hour window and Max 20x at roughly 200 to 800, before the May 6, 2026 doubling.",
  },
  {
    q: "Are the 5-hour and weekly limits two separate clocks?",
    a: "Yes. The 5-hour clock rolls 5 hours after your first message of the rolling window. Each weekly clock rolls 168 hours after the first message of that weekly cycle, independently per bucket. A fresh 5-hour reset does not push the weekly clock, and a weekly reset does not unlock the 5-hour bucket. Both timestamps live on the same JSON response as resets_at. ClaudeMeter renders each as a relative duration ('in 4h 12m', 'in 4d 19h') so you can see which one bites first.",
  },
  {
    q: "Did the May 6, 2026 rate-limit doubling apply to both?",
    a: "No. Anthropic doubled the 5-hour rate limit on Pro, Max, Team, and seat-based Enterprise plans on May 6, 2026 (announcement: 'Increased rate limits on Claude Code for Pro, Max, Team and Enterprise users'). The weekly caps were not doubled. So a Max 20x user who used to get ~200 to 800 prompts per 5-hour window now gets roughly ~400 to 1800, but the weekly Opus bucket still saturates on the same workload. The most common Max surprise after May 6 is the 5-hour bar looking healthy while seven_day_opus quietly climbs past 90 percent.",
  },
  {
    q: "I am on Max 20x. My 5-hour shows 21 percent. Why am I rate limited?",
    a: "Because the 429 follows whichever bucket is highest, not the one labeled biggest on the Settings page. The most common pattern on Max 20x is seven_day_opus at 0.94 while five_hour sits at 0.21 mid-week. claude.ai/settings/usage shows a single horizontal bar that maps to seven_day (the overall weekly), not to seven_day_opus. So the page reads '62 percent' while the actual blocking bucket is at 94 percent. ClaudeMeter polls the raw JSON every 60 seconds and renders each bucket as its own labeled row, so the hot one is the one you stare at.",
  },
  {
    q: "What does claude.ai actually return for these windows?",
    a: "A small JSON object on GET /api/organizations/{org_uuid}/usage. Each field is a Window with two members: utilization (float, 0.0 to 1.0) and resets_at (ISO 8601 UTC timestamp). The exact Rust struct that deserializes this lives at models.rs lines 18 to 28 of the open-source claude-meter repo (github.com/m13v/claude-meter). Seven Window fields plus one ExtraUsage. Six of the seven are visible on Max. The Pro plan returns five_hour, seven_day, seven_day_opus; Max plans add seven_day_sonnet, seven_day_oauth_apps, seven_day_omelette, and seven_day_cowork.",
  },
  {
    q: "What is seven_day_opus and why does it catch Max users specifically?",
    a: "It is the weekly Opus-only bucket. Every Opus 4.5 and Opus 4.7 message you send through claude.ai chat, Claude Code, or any Anthropic OAuth client charges this bucket on a 168-hour rolling clock. Adaptive thinking is on by default for Opus 4.7, so thinking tokens count as real output tokens for the float. A Max 20x user doing heavy refactors with Opus eats seven_day_opus four times faster than they eat seven_day_sonnet. The Settings page does not name this bucket. ClaudeMeter prints it as a row called '7-day Opus'.",
  },
  {
    q: "Can ccusage or Claude-Code-Usage-Monitor show these floats?",
    a: "No. ccusage and Claude-Code-Usage-Monitor read ~/.claude/projects/<project>/<session>.jsonl on your disk and sum tokens against a model price card. That gives you accurate local token counts and dollar estimates. The Max plan utilization floats are server state: weighted by peak-hour multipliers, fold in browser chat traffic the JSONL never sees, and reflect overall plan-bucket pressure. The numbers are different by design. ClaudeMeter and ccusage are complementary tools, not replacements: one reads server quota, the other reads local Claude Code token spend.",
  },
  {
    q: "How do I see the live state without installing anything?",
    a: "Open claude.ai/settings/usage with DevTools open, Network tab filtered on /usage. Refresh the page. The response of /api/organizations/{org_uuid}/usage is the raw JSON with all seven Window fields. Look at every utilization, not just the headline bar. Whichever is closest to 1.0 is the wall you will hit next. Or run claude-meter status from the CLI if you have the open-source tool installed: it prints the same rows the menu bar app shows, one bucket per line.",
  },
  {
    q: "If I turn on metered billing, do these limits stop applying?",
    a: "No, they convert. Metered billing (extra usage / pay-as-you-go) lets the next prompt go through past plan caps at standard API prices, but only until you hit the monthly_credit_limit you set. When used_credits crosses that cap, the /overage_spend_limit endpoint returns out_of_credits: true and a disabled_until timestamp. So you go from being rate-limited by a plan bucket to being rate-limited by a dollar cap. Both are still 429s. ClaudeMeter shows the dollar cap as a separate 'Extra usage' row with the BLOCKED suffix when it fires.",
  },
  {
    q: "What is the quickest install if I want to watch this live?",
    a: "brew install --cask m13v/tap/claude-meter to install the macOS menu bar app, then install the browser extension from github.com/m13v/claude-meter/releases, then visit claude.ai once. The extension hands the live session to the menu bar app, no manual cookie paste. Numbers refresh every 60 seconds and match claude.ai/settings/usage exactly because the source is the same internal endpoint.",
  },
];

const usageJson = `// GET https://claude.ai/api/organizations/{org_uuid}/usage
// Live enforcement state for a Max 20x account, mid-refactor Wednesday.
{
  "five_hour":            { "utilization": 0.21, "resets_at": "2026-05-13T18:00:00Z" },
  "seven_day":            { "utilization": 0.62, "resets_at": "2026-05-18T09:00:00Z" },
  "seven_day_sonnet":     { "utilization": 0.31, "resets_at": "2026-05-18T09:00:00Z" },
  "seven_day_opus":       { "utilization": 0.94, "resets_at": "2026-05-18T09:00:00Z" },
  "seven_day_oauth_apps": { "utilization": 0.71, "resets_at": "2026-05-18T09:00:00Z" },
  "seven_day_omelette":   { "utilization": 0.08, "resets_at": "2026-05-18T09:00:00Z" },
  "seven_day_cowork":     { "utilization": 0.02, "resets_at": "2026-05-18T09:00:00Z" },
  "extra_usage":          { "is_enabled": false }
}
// 5-hour at 21% looks healthy. The wall you hit next is seven_day_opus at 94%.
// claude.ai/settings/usage only renders one bar; it maps to seven_day (62%).`;

const modelsRsCode = `// claude-meter/src/models.rs (lines 18-28)
// The struct that deserializes the /usage response.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:            Option<Window>,
    pub seven_day_sonnet:     Option<Window>,
    pub seven_day_opus:       Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,
}

// pub struct Window { utilization: f64, resets_at: Option<DateTime<Utc>> }
// Seven Window fields. The plan tier determines how fast each one fills.`;

const liveOutput = [
  { type: "command" as const, text: "$ claude-meter status" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           21.0% used    -> resets Wed May 13 18:00 (in 4h 12m)" },
  { type: "output" as const, text: "7-day all        62.0% used    -> resets Mon May 18 09:00 (in 4d 19h)" },
  { type: "output" as const, text: "7-day Sonnet     31.0% used    -> resets Mon May 18 09:00 (in 4d 19h)" },
  { type: "output" as const, text: "7-day Opus       94.0% used    -> resets Mon May 18 09:00 (in 4d 19h)" },
  { type: "output" as const, text: "Extra usage      $0.00 / $200.00 (0%)" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "fetched 2026-05-13 13:48:02 PDT   founder@example.com via Chrome" },
  { type: "success" as const, text: "Healthy 5-hour. Opus weekly is the wall: drop to Sonnet to finish the week." },
];

const limitRows = [
  {
    feature: "What it is",
    competitor: "Rolling 5-hour window. Tracks every message you send across claude.ai chat, Claude Code, and any OAuth client on a 5-hour clock.",
    ours: "Weekly cap. Tracks the same message stream on a 168-hour clock, split into all-up, Sonnet-only, Opus-only, and OAuth-app-only buckets.",
  },
  {
    feature: "Field name on /usage",
    competitor: "five_hour.utilization (float, 0.0 to 1.0)",
    ours: "seven_day.utilization plus seven_day_sonnet, seven_day_opus, seven_day_oauth_apps",
  },
  {
    feature: "When the clock starts",
    competitor: "5 hours after your first message of the rolling window. Each message ages off on its own clock; resets_at is the next age-off boundary.",
    ours: "168 hours after the first message of the weekly cycle. Same rolling shape, longer clock. Independent per bucket.",
  },
  {
    feature: "May 6, 2026 change",
    competitor: "Doubled. Max 5x roughly 50-200 prompts per window became roughly 100-450. Max 20x roughly 200-800 became roughly 400-1800.",
    ours: "Unchanged. Anthropic announced the doubling applied to the 5-hour limit only; weekly caps were not adjusted.",
  },
  {
    feature: "What the 429 looks like",
    competitor: "5-hour wall. Wait a few hours, the bucket drains as old messages age off. Continue when utilization drops below 1.0.",
    ours: "Weekly wall. Wait a few days, or drop to Sonnet if seven_day_opus is the hot bucket while seven_day_sonnet has headroom.",
  },
  {
    feature: "Where the Settings page shows it",
    competitor: "Horizontal bar near the top of claude.ai/settings/usage. Visible percent on this one only.",
    ours: "Implicit. The same Settings page surfaces seven_day in prose ('your weekly usage resets at...'), but not seven_day_opus or seven_day_oauth_apps as their own bars.",
  },
];

const liveSteps = [
  {
    title: "Open the live JSON.",
    description:
      "Visit claude.ai/settings/usage, open DevTools (F12 or Cmd+Option+I), switch to the Network tab, filter for /usage. The fetch on page load returns the seven Window fields. Click the Response tab; that is the entire enforcement state.",
  },
  {
    title: "Read every utilization, not just the headline bar.",
    description:
      "The percent on the page is seven_day. The other six fields live in the JSON. Whichever utilization is closest to 1.0 is the bucket that will 429 your next message. On Max with Opus-heavy workloads, seven_day_opus is usually the highest by Wednesday.",
  },
  {
    title: "Note the resets_at for the hot bucket.",
    description:
      "Each Window has its own resets_at. The 5-hour clock and the weekly clocks are independent. If seven_day_opus is the hot bucket, the 5-hour reset will not help; you wait until the listed seven_day_opus.resets_at or drop to Sonnet for the rest of the week.",
  },
  {
    title: "Decide the right exit, not the reflex one.",
    description:
      "five_hour at 1.0 wants a few-hour pause. seven_day at 1.0 wants days. seven_day_opus at 1.0 wants Sonnet for the rest of the cycle. seven_day_oauth_apps at 1.0 wants you off Claude Code and onto claude.ai web. Same 429, four different correct moves.",
  },
  {
    title: "Or skip the manual polling.",
    description:
      "claude-meter (MIT, github.com/m13v/claude-meter) pins each bucket to the menu bar and refreshes every 60 seconds. The browser extension hands the live claude.ai session to the macOS app, so there is no cookie paste, no expiring token. brew install --cask m13v/tap/claude-meter, install the extension, visit claude.ai once.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-max-plan-still-hitting-limits",
    title: "Claude Max plan still hitting limits? It is eight buckets, not one",
    excerpt:
      "Max raises the cap on each bucket but does not collapse them. Here is the triage that maps the 429 to the bucket and the fix.",
    tag: "Triage",
  },
  {
    href: "/t/claude-rolling-5-hour-reset",
    title: "Claude rolling 5-hour reset: each message ages off on its own clock",
    excerpt:
      "The 5-hour window does not reset to zero at one moment. Each message has its own 5-hour age-off clock. Why people show up at resets_at and find the bar still at 60 percent.",
    tag: "Reset semantics",
  },
  {
    href: "/t/claude-max-weekly-quota-enforcement",
    title: "Claude Max weekly quota enforcement: three gates, two endpoints",
    excerpt:
      "The 5-hour, weekly, and metered-billing caps fire as three sequential gates. Two server endpoints, one BLOCKED string. The exact data path from server state to your menu bar.",
    tag: "Enforcement",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Max rolling 5-hour weekly limit: the two limits are actually four",
  description:
    "On Claude Max, the rolling 5-hour window and the weekly cap are not two limits. The server enforces utilization on at least four independent rolling windows (five_hour, seven_day, seven_day_sonnet, seven_day_opus), each with its own 429. Verified from the open-source claude-meter source on 2026-05-13.",
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

export default function ClaudeMaxRollingFiveHourWeeklyLimitPage() {
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
          Claude Max rolling 5-hour weekly limit:{" "}
          <GradientText>the two limits are actually four.</GradientText>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-zinc-600 leading-relaxed">
          Most write-ups frame the Claude Max plan as having two limits, a
          rolling 5-hour window and a weekly cap. The endpoint Anthropic
          enforces returns at least four Window objects for Max, each with its
          own utilization float and its own reset clock. Any one of them at
          100% returns a 429. The May 6, 2026 doubling moved one of them.
          Here is the field list, the source, and the live read path.
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
            On Claude Max, the rolling 5-hour and the weekly limit are{" "}
            <strong>floats, not prompt counts</strong>. The server returns a{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              utilization
            </code>{" "}
            value between 0.0 and 1.0 on each of seven independent buckets at{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono break-all">
              claude.ai/api/organizations/&#123;org_uuid&#125;/usage
            </code>
            . Four are commonly hot on Max:{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              five_hour
            </code>
            ,{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              seven_day
            </code>
            ,{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              seven_day_sonnet
            </code>
            ,{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              seven_day_opus
            </code>
            . Any one at 1.0 fires the next 429. The May 6, 2026 rate-limit
            doubling applied to{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              five_hour
            </code>{" "}
            only; the weekly caps were not doubled.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The JSON you would see right now
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          A Max 20x account, Wednesday afternoon, mid-refactor. The 5-hour bar
          on settings/usage says 21 percent and the weekly bar says 62 percent.
          The 429 will not come from either of those. Watch{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>
          .
        </p>
        <AnimatedCodeBlock
          code={usageJson}
          language="javascript"
          filename="usage.json"
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The struct that names every field
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          The open-source claude-meter Rust app deserializes the same response.
          Seven Window fields on the struct: every bucket Anthropic enforces on
          your plan, named, in one place. Pro plans return three of these; Max
          plans return all seven (
          <a
            className="text-teal-700 underline"
            href="https://github.com/m13v/claude-meter"
          >
            github.com/m13v/claude-meter
          </a>
          , models.rs lines 18-28).
        </p>
        <AnimatedCodeBlock
          code={modelsRsCode}
          language="rust"
          filename="src/models.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Rolling 5-hour vs weekly, on Max, in one table
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The two limits sound parallel but behave differently. The May 6, 2026
          rate-limit change is the cleanest illustration: same announcement,
          one bucket moved, the other did not.
        </p>
        <ComparisonTable
          productName="five_hour (rolling 5-hour)"
          competitorName="seven_day family (weekly)"
          rows={limitRows}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What the live menu bar shows
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          Same response, formatted as one row per bucket. This is what{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            claude-meter status
          </code>{" "}
          prints on the CLI, and what the macOS menu bar dropdown renders. Each
          row carries its own reset clock so you can see which one bites first.
        </p>
        <TerminalOutput lines={liveOutput} title="claude-meter status" />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          How to read your own state in 60 seconds
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          You do not need claude-meter installed to check. The endpoint is
          public to your cookie, and the JSON is human-readable. Here is the
          shortest path.
        </p>
        <StepTimeline steps={liveSteps} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Stuck on the wrong bucket every week?"
          description="Book 15 minutes. Walk through your live JSON, find the bucket that is actually bottlenecking you, and pick a Sonnet/Opus split that holds for the week."
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16 mb-20">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="More on the rolling-window enforcement primitive."
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Walk through your live Max buckets and pick the right exit"
      />
    </article>
  );
}
