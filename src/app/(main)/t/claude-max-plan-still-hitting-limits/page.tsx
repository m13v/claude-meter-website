import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  GlowCard,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-max-plan-still-hitting-limits";
const PUBLISHED = "2026-05-06";

export const metadata: Metadata = {
  title:
    "Claude Max Plan Still Hitting Limits? It Is Eight Buckets, Not One",
  description:
    "Max does not unlock unlimited. Anthropic enforces eight independent server-side gates and any one of them stops the next prompt. Here is the 60-second triage to find which one fired and what to do.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Max Plan Still Hitting Limits? It Is Eight Buckets, Not One",
    description:
      "$100 to $200 a month buys higher caps, not no caps. Eight gates can each block a Max user. Here is the triage.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Max plan still hitting limits", url: PAGE_URL },
];

const faqs = [
  {
    q: "I am paying for Claude Max. Why am I still being rate limited?",
    a: "Because Max is a higher cap, not no cap. Anthropic enforces eight independent server-side limit buckets. Seven live on /api/organizations/{org_uuid}/usage (five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork) and the eighth lives on /api/organizations/{org_uuid}/overage_spend_limit (out_of_credits when you have metered billing on). Any one of them at 100 percent will 429 your next prompt. Max raises the caps; it does not collapse the gates into one bucket.",
  },
  {
    q: "I am sure my weekly bar on settings/usage is not at 100 percent. Why am I still blocked?",
    a: "The big bar on claude.ai/settings/usage is the seven_day aggregate. It does not show seven_day_opus, seven_day_sonnet, or seven_day_oauth_apps as their own rows in prose. A Max user running Claude Code can be at 30 percent on seven_day and 100 percent on seven_day_oauth_apps and the Settings page will not mention the second number. The 429 fires anyway. ClaudeMeter polls the raw JSON every 60 seconds and renders each bucket as its own row, so you can see which one is hot.",
  },
  {
    q: "What is seven_day_oauth_apps and why does it catch Max users specifically?",
    a: "It is a separate weekly bucket that only counts traffic from OAuth-authenticated clients (Claude Code, MCP host loops, agentic CLIs that signed in through the OAuth flow). Max sells itself on agentic Claude Code workloads, so most Max subscribers are pushing traffic into this bucket all week. seven_day_oauth_apps can be at 91 percent while five_hour is at 12 percent and seven_day is at 30 percent. The 429 fires against whichever window crosses 100 first. The field name is in models.rs lines 18 to 28 of the open-source repo.",
  },
  {
    q: "Does Max have a separate Opus limit and a separate Sonnet limit?",
    a: "Yes. The endpoint returns seven_day_opus and seven_day_sonnet as their own utilization fractions with their own resets_at. A Max session that mostly drives Opus on hard tasks will saturate seven_day_opus before seven_day_sonnet, and the 429 message names the model bucket that fired. Anthropic's November 2025 announcement about Opus 4.5 confirmed Sonnet now carries its own bucket separate from the all-up weekly. The endpoint has actually returned both fields independently for longer than that.",
  },
  {
    q: "How do I tell which of the eight buckets blocked me right now?",
    a: "Open claude.ai/settings/usage, hit DevTools, watch the network tab refresh. The response of /api/organizations/{org_uuid}/usage is the raw JSON. Look for whichever utilization is at or above 1.0 (some responses ship 0 to 1, some ship 0 to 100; the numbers are the same scale internally). If every bucket on /usage looks fine, fetch /api/organizations/{org_uuid}/overage_spend_limit and check out_of_credits. That is the eighth gate. Or skip the manual loop and install ClaudeMeter; the menu bar shows the active gate continuously without DevTools.",
  },
  {
    q: "If a gate fires, do all the others reset at the same time?",
    a: "No. Each clock is independent. five_hour.resets_at rolls 5 hours after your first message of the rolling window. seven_day.resets_at rolls 168 hours after your first message of the cycle. seven_day_oauth_apps has its own resets_at. The metered-billing cap on /overage_spend_limit resets on your billing cycle boundary as disabled_until. Riding out a 5-hour reset does not push the weekly clock and does not unlock the OAuth bucket. ClaudeMeter shows each reset time as a relative duration ('in 4h', 'in 3d 15h') next to the percent bar.",
  },
  {
    q: "Will turning on metered billing fix this?",
    a: "It can. Enabling extra usage on Max lets the next prompt proceed past plan caps at standard API prices, but only until you hit the monthly_credit_limit you set. Once used_credits crosses that cap, out_of_credits flips true on /overage_spend_limit and a disabled_until timestamp appears. So metered billing converts a 429 from the rolling-window gate into a 429 from the dollar gate. ClaudeMeter shows both. The terminal version prints '$200.00 / $200.00 (100%) BLOCKED until Sun May 14' on the Extra usage row when the dollar cap fires.",
  },
  {
    q: "Why does ccusage say I have only used 5 percent when claude.ai says I am rate limited?",
    a: "ccusage reads ~/.claude/projects/<project>/<session>.jsonl on disk and sums input and output tokens against a model price card. That is local truth: tokens that left your machine. Plan limits live on Anthropic's servers as utilization fractions on the buckets above. The two are not the same number and were never supposed to be. ccusage is a great cost calculator. It is not a plan-quota reader, because the plan quota is not in the local logs. ClaudeMeter and ccusage are complementary: one reads server quota, the other reads local token spend.",
  },
  {
    q: "I am on Max 20x. Should I just expect to hit limits less often?",
    a: "Yes, the caps are higher, but they are not absent. Heavy daily Claude Code users on Max 20x still report hitting the weekly Opus limit by Thursday or Friday. The five_hour window also fires for Max 20x users running back-to-back agentic loops. The bucket schema is identical across Max 5x, Max 20x, and Pro: same field names, different cap values. ClaudeMeter renders the percent against whatever your plan's cap actually is, because it reads the server's already-computed utilization fraction.",
  },
  {
    q: "How does ClaudeMeter avoid the cookie-paste step that other trackers ask for?",
    a: "The browser extension piece in extension/background.js calls fetch('/api/organizations/' + org + '/usage', { credentials: 'include' }). Manifest V3 lets the extension run with the live claude.ai cookies the browser already holds, so no copy-paste, no keychain prompt, no expiring token. The Rust core in src/api.rs does the same call with a cookie header it pulls from the system store on macOS. Either path is read-only. There is no chat traffic, no prompts sent, just two GETs per minute against endpoints the Settings page already calls.",
  },
];

const triageRows = [
  {
    feature: "five_hour at or above 100",
    competitor: "Rolling 5-hour session window. Resets 5 hours after your first message of the window.",
    ours: "Sit out until five_hour.resets_at. Your weekly buckets survive intact. Most common gate for Claude Code agentic loops.",
  },
  {
    feature: "seven_day at or above 100",
    competitor: "All-up weekly aggregate. Resets 168 hours after your first message of the cycle.",
    ours: "Wait until seven_day.resets_at. A 5-hour reset will not unlock this. Heavy mixed-workload Max users hit this by mid-week.",
  },
  {
    feature: "seven_day_opus at or above 100",
    competitor: "Opus-only weekly bucket. Independent of seven_day_sonnet.",
    ours: "Switch to Sonnet for the rest of the week, or wait for the per-model reset. Common for Max users running Opus on hard refactors.",
  },
  {
    feature: "seven_day_sonnet at or above 100",
    competitor: "Sonnet-only weekly bucket. Tracked since the November 2025 Opus 4.5 release.",
    ours: "Drop to Haiku for routine work, or wait for reset. Catches heavy daily writers and reviewers.",
  },
  {
    feature: "seven_day_oauth_apps at or above 100",
    competitor: "OAuth-authenticated weekly bucket. Counts only Claude Code, MCP, and agentic CLI traffic.",
    ours: "Move work to claude.ai web for the rest of the cycle, or wait for reset. The silent Max-but-blocked culprit.",
  },
  {
    feature: "seven_day_omelette at or above 100",
    competitor: "Internal feature bucket exposed on the same endpoint.",
    ours: "Wait for reset. Rarely the active gate; surfaces here so a parse error does not hide it.",
  },
  {
    feature: "seven_day_cowork at or above 100",
    competitor: "Internal feature bucket exposed on the same endpoint.",
    ours: "Wait for reset. Rarely the active gate; surfaces here so a parse error does not hide it.",
  },
  {
    feature: "out_of_credits == true on /overage_spend_limit",
    competitor: "Metered billing dollar cap. Only present if you turned on extra usage.",
    ours: "Wait until disabled_until (billing cycle boundary), or raise monthly_credit_limit on Settings. Only triggers after plan caps are spent.",
  },
];

const usageStruct = `// claude-meter/src/models.rs lines 18-28
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

// Seven utilization buckets, each with its own resets_at clock.
// Any one of them >= 1.0 fires the next 429.`;

const overageStruct = `// claude-meter/src/models.rs lines 30-40
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverageResponse {
    pub is_enabled:           bool,
    pub monthly_credit_limit: Option<i64>,
    pub currency:             Option<String>,
    pub used_credits:         Option<f64>,
    pub disabled_reason:      Option<String>,
    pub disabled_until:       Option<chrono::DateTime<Utc>>,
    #[serde(default)]
    pub out_of_credits:       bool,
}

// Eighth gate. Lives on a separate endpoint
// (/api/organizations/{org}/overage_spend_limit).
// Returns 404 if you never turned on metered billing.`;

const oauthBlockedOutput = [
  { type: "command" as const, text: "$ claude-meter   # Max user, Claude Code workload, Wednesday afternoon" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour            12.0% used    -> resets Wed May 6 18:00 (in 4h)" },
  { type: "output" as const, text: "7-day all         30.0% used    -> resets Sat May 9 09:00 (in 2d 19h)" },
  { type: "output" as const, text: "7-day Sonnet      24.0% used" },
  { type: "output" as const, text: "7-day Opus        38.0% used" },
  { type: "output" as const, text: "7-day OAuth      100.0% used    -> resets Sat May 9 09:00 (in 2d 19h)" },
  { type: "error" as const, text: "Settings page shows 30% weekly. The wall is seven_day_oauth_apps. Switch to claude.ai web or wait." },
];

const opusBlockedOutput = [
  { type: "command" as const, text: "$ claude-meter   # Max user, heavy refactor week, Thursday morning" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour            21.0% used    -> resets Thu May 7 14:00 (in 5h)" },
  { type: "output" as const, text: "7-day all         62.0% used    -> resets Sun May 10 09:00 (in 3d 0h)" },
  { type: "output" as const, text: "7-day Sonnet      31.0% used" },
  { type: "output" as const, text: "7-day Opus       100.0% used    -> resets Sun May 10 09:00 (in 3d 0h)" },
  { type: "output" as const, text: "7-day OAuth       54.0% used" },
  { type: "error" as const, text: "Drop to Sonnet for the rest of the week or wait until Sunday." },
];

const triageSteps = [
  {
    title: "Read all eight numbers, not just one",
    description:
      "claude.ai/settings/usage shows you a digest. The full picture is the JSON behind it. Open DevTools, watch /api/organizations/{org_uuid}/usage refresh, and read every utilization in the response. Then call /overage_spend_limit and check out_of_credits. That is the entire enforcement state in two GETs.",
  },
  {
    title: "Find the one bucket above 100",
    description:
      "Only one gate at a time fires the 429. The other seven can be at 99 percent and you would still be sending prompts. Look for utilization >= 1.0 (or >= 100 if the response is in the 0-100 scale). That bucket is your wall right now. Note its resets_at.",
  },
  {
    title: "Pick the matching mitigation",
    description:
      "Each gate has a different exit. five_hour wants you to wait a few hours. seven_day_opus wants you to switch to Sonnet. seven_day_oauth_apps wants you to leave Claude Code for a session. out_of_credits wants you to raise the dollar cap or wait for the billing cycle to roll. Treating all walls as one wall (the common reflex) wastes hours on the wrong fix.",
  },
  {
    title: "Stop guessing on every reset",
    description:
      "Polling the endpoints by hand once a day is a chore. The browser extension polls every 60 seconds (POLL_MINUTES = 1 in extension/background.js), so the row that goes hot in the menu bar is the gate that just fired. The 5-hour and weekly resets show up as relative durations next to each row. No DevTools, no curl loop, no cookie paste.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-max-weekly-quota-enforcement",
    title: "Claude Max weekly quota enforcement: three gates, two endpoints, one BLOCKED string",
    excerpt:
      "The exact data path from server state to the BLOCKED string in your menu bar. How each gate decides whether the next prompt 429s.",
    tag: "Internals",
  },
  {
    href: "/t/claude-agentic-loop-usage-limit",
    title: "The seven_day_oauth_apps bucket almost nobody names",
    excerpt:
      "An agentic loop has its own weekly bucket separate from the 5-hour and the all-up weekly. Here is the field name and the resets_at.",
    tag: "Deep dive",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "They measure different things. ccusage reads local Claude Code JSONL files. ClaudeMeter reads the plan quota Anthropic enforces.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Max plan still hitting limits? It is eight buckets, not one",
  description:
    "Max does not unlock unlimited Claude. Anthropic enforces eight independent server-side limit buckets and any one of them can block your next prompt. Here is the triage that maps the symptom to the bucket and the fix.",
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

export default function ClaudeMaxPlanStillHittingLimitsPage() {
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
          Claude Max plan still hitting limits?{" "}
          <GradientText>It is eight buckets, not one.</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          $100 to $200 a month buys you higher caps. It does not buy unlimited.
          Anthropic enforces eight independent server-side limit buckets and any
          one of them can stop the next prompt. The big bar on claude.ai/settings/usage
          shows you one of them. The other seven decide your week.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="7 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <GlowCard>
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold">
              Direct answer (verified 2026-05-06)
            </p>
            <p className="mt-3 text-zinc-900 text-lg leading-relaxed">
              Max raises the caps. It does not collapse the eight gates into
              one. Seven utilization buckets live on{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-base font-mono">
                /api/organizations/&#123;org_uuid&#125;/usage
              </code>{" "}
              (
              <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
                five_hour
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
                seven_day
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
                seven_day_sonnet
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
                seven_day_opus
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
                seven_day_oauth_apps
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
                seven_day_omelette
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
                seven_day_cowork
              </code>
              ) and the eighth lives on{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-base font-mono">
                /api/organizations/&#123;org_uuid&#125;/overage_spend_limit
              </code>{" "}
              as{" "}
              <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
                out_of_credits
              </code>
              . Any single bucket at 100 percent fires a 429. The most common
              Max-but-blocked culprit is{" "}
              <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
                seven_day_oauth_apps
              </code>
              , a separate weekly bucket that only counts Claude Code and
              agentic OAuth traffic. It does not appear as its own row in the
              prose at{" "}
              <a
                className="text-teal-700 underline"
                href="https://claude.ai/settings/usage"
              >
                claude.ai/settings/usage
              </a>
              . Anthropic also confirms Max users can keep working past plan
              caps via metered billing in the{" "}
              <a
                className="text-teal-700 underline"
                href="https://support.claude.com/en/articles/11049741-what-is-the-max-plan"
              >
                Max plan help center article
              </a>
              .
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 60-second triage table
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Read your /usage and /overage_spend_limit responses. Find the one
          bucket above 100. Match it to the row. Each gate has a different
          exit, so the right move depends on which bucket is hot.
        </p>
        <ComparisonTable
          productName="What it means"
          competitorName="What it actually is"
          rows={triageRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The bucket that catches Max users specifically
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Most people who pay $100 to $200 a month for Max are on it because
          they run heavy Claude Code workloads. That traffic flows through an
          OAuth-authenticated client, which means every prompt counts toward{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>{" "}
          on top of every other bucket it touches. The bucket has its own cap.
          It has its own resets_at. It is not surfaced as a row in the prose at
          claude.ai/settings/usage; you only see it if you read the JSON
          directly.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Below is what the menu bar shows when this is the active wall. The
          weekly aggregate is sitting at 30 percent. Everything looks fine on
          the dashboard. The OAuth bucket is at 100 and the next prompt 429s.
        </p>
        <TerminalOutput
          title="claude-meter"
          lines={oauthBlockedOutput}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The other Max-specific gate: seven_day_opus
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Anthropic split per-model buckets out around the November 2025 Opus
          4.5 release. The endpoint had been returning{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_sonnet
          </code>{" "}
          as their own utilization fractions for longer than that, but the
          announcement made the per-model cap official. A Max user spending a
          week on hard refactors will saturate{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          well before the all-up{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>{" "}
          fills, and the 429 message names the model bucket that fired.
        </p>
        <TerminalOutput
          title="claude-meter"
          lines={opusBlockedOutput}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            The anchor fact: the schema is open source and easy to verify
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg mb-6">
            ClaudeMeter parses the live response into a typed Rust struct.
            Lines 18 through 28 of{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              src/models.rs
            </code>{" "}
            list every bucket the endpoint returns. Lines 30 through 40 list
            the metered-billing fields on the second endpoint. The whole
            project is MIT-licensed; you can read the wire format at{" "}
            <a
              className="text-teal-700 underline"
              href="https://github.com/m13v/claude-meter"
            >
              github.com/m13v/claude-meter
            </a>{" "}
            and verify against the JSON your own browser pulls.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatedCodeBlock
              code={usageStruct}
              language="rust"
              filename="src/models.rs (lines 18-28)"
            />
            <AnimatedCodeBlock
              code={overageStruct}
              language="rust"
              filename="src/models.rs (lines 30-40)"
            />
          </div>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The 60-second triage, one step at a time
        </h2>
        <StepTimeline steps={triageSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the dashboard does not just show all eight
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          claude.ai/settings/usage is a user-facing surface. Showing eight
          progress bars with internal field names would scare most readers and
          help only the ones already running a tracker. So Anthropic compresses
          the state into a couple of bars and a banner. The compression is fine
          when only one wall is up. It gets confusing when two are. A Max user
          can read &ldquo;5-hour limit reached - resets at 6:42pm,&rdquo; wait
          90 minutes, and still be blocked because{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>{" "}
          is also at 100 and the banner did not name it.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          ClaudeMeter does not compress. The popup renders one row per bucket
          with the exact percent, the exact resets_at, and a BLOCKED suffix on
          the row that is currently the wall. The browser extension polls the
          endpoint every 60 seconds with the cookies your browser already
          holds, so the row that flips hot is the gate that just fired.
          That is what makes this Max-specific question debuggable instead of
          mysterious.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Still not sure which bucket is blocking you?"
          description="Book 20 minutes with the team and we will read your /usage JSON live and tell you the gate."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Frequently asked
        </h2>
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16 mb-20">
        <RelatedPostsGrid
          title="Keep reading"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Read your /usage JSON live with the team."
      />
    </article>
  );
}
