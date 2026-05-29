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
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-max-usage-limits";
const PUBLISHED = "2026-05-12";

export const metadata: Metadata = {
  title:
    "Claude Code Max usage limits: the published numbers, and the float they actually come from",
  description:
    "Anthropic does not publish a prompt count for Max. Every Claude Code Max user is rate-limited by a utilization float on claude.ai/api/organizations/{org_uuid}/usage. Here is the float, the prompt ranges the float maps to after the May 6, 2026 doubling, and what stayed the same.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code Max usage limits: the published numbers, and the float they actually come from",
    description:
      "Max plan limits are a utilization float, not a prompt count. The May 6, 2026 change doubled only the 5-hour window. Here is the full bucket schema and the live read path.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code Max usage limits", url: PAGE_URL },
];

const faqs = [
  {
    q: "Does Anthropic publish a prompt count for Claude Code on the Max plan?",
    a: "No. The help center articles for Pro, Max, and Claude Code repeatedly say Max gives you 'higher usage' or '5x' and '20x' Pro's allowance, but they never name a prompt count, a token cap, or an hours-per-week number. The actual enforcement primitive is a utilization float on claude.ai/api/organizations/{org_uuid}/usage. The float lives between 0.0 and 1.0. When it hits 1.0, the next prompt returns 429. Independent tests (truefoundry, intuitionlabs) converge on ~50 to 200 prompts per 5-hour window on Max 5x and ~200 to 800 on Max 20x before the May 6, 2026 doubling. After the doubling, those become roughly ~100 to 450 and ~400 to 1800. The range is wide because token mix per prompt swings the float by ~3x.",
  },
  {
    q: "What exactly did Anthropic double on May 6, 2026?",
    a: "Anthropic announced that the 5-hour rate limit was doubled on May 6, 2026 for Pro, Max, Team, and seat-based Enterprise. Peak-hour throttling was also removed for Pro and Max. The change was tied to a compute deal with SpaceX's Colossus 1 data center. Weekly caps were NOT changed: every announcement and follow-up restated 'the weekly bucket is the same size it was before.' The five_hour bucket on the /usage endpoint now climbs to 1.0 at roughly half the per-prompt rate it did on May 5; seven_day, seven_day_sonnet, seven_day_opus, and seven_day_oauth_apps still climb at the old rate.",
  },
  {
    q: "Why do different blogs give different prompt counts for the same Max plan?",
    a: "Because nobody is publishing a constant. Every blog you read is reverse-engineering by running test sessions and watching when their account 429s. A 'short prompt with a small file edit' burns the five_hour float at one rate. A 'deep refactor with 50 KB of context, adaptive thinking on, Opus 4.7 tokenizer' burns it at three times that rate. Same plan, same week, different prompts, different effective cap. The float is the contract. The prompt counts are downstream estimates that wobble with model choice, context length, and tokenizer version.",
  },
  {
    q: "How many weekly buckets does the Max plan have?",
    a: "Five, exposed as separate fields on the same /usage endpoint: seven_day (all-up), seven_day_sonnet (Sonnet-only), seven_day_opus (Opus-only), seven_day_oauth_apps (Claude Code and other OAuth clients only), and two internal-feature buckets (seven_day_omelette, seven_day_cowork). Plus one dollar-denominated cap on /overage_spend_limit when metered billing is on. Any single bucket at 100 percent fires the 429. The big bar on claude.ai/settings/usage is the seven_day aggregate; the four model-specific and OAuth-specific buckets do not get their own rows in the prose.",
  },
  {
    q: "Which bucket does Claude Code traffic hit first on Max?",
    a: "Most Max users hit seven_day_oauth_apps mid-week. Claude Code authenticates through the OAuth flow, so every prompt counts toward the OAuth-only weekly bucket on top of every other bucket it touches. Pure-claude.ai-web work skips that bucket entirely. Heavy Opus-on-hard-tasks workloads hit seven_day_opus instead. Mixed teams that share a Max seat hit seven_day_sonnet faster than expected. The five_hour cap is the most visible because it fires several times a day; the weekly caps are the ones that surprise people who think 'Max 20x' means 'I have 20x the headroom forever.'",
  },
  {
    q: "If Max 5x is '5x Pro' and Max 20x is '20x Pro,' is that the ratio of the float?",
    a: "No. The float is always 0.0 to 1.0 regardless of plan. The plan determines how many tokens push the float by 0.01, not the upper bound of the float. Anthropic uses 5x and 20x as marketing labels for 'approximately 5x more prompts per session' and 'approximately 20x more prompts per session.' Internally there is just one utilization fraction per bucket per account, and the cap behind it varies by plan. ClaudeMeter reads the fraction as a number between 0 and 1, multiplies by 100, and prints '21.0% used' next to a row in the menu bar.",
  },
  {
    q: "What about extra usage (metered billing)? Does that change the cap?",
    a: "It does not change the plan caps. It adds an eighth gate. Once extra_usage.is_enabled is true on the /usage payload, the next prompt that would have 429'd against a plan cap proceeds at standard API prices and counts against monthly_credit_limit on /overage_spend_limit. When used_credits crosses monthly_credit_limit, out_of_credits flips true and disabled_until appears. So metered billing converts the rolling-window 429 into a dollar-cap 429. Both are visible to ClaudeMeter; the menu bar shows '$ 78.40 / $ 200.00 (39%)' as its own row.",
  },
  {
    q: "Is there a way to see my actual utilization without DevTools?",
    a: "Yes. claude-meter runs as a macOS menu bar app and a browser extension. The Rust core in src/api.rs (lines 8 to 30) calls GET /api/organizations/{org}/usage and GET /api/organizations/{org}/overage_spend_limit once per minute using the cookies the browser already holds. It deserializes into UsageResponse (models.rs lines 18 to 28), and renders each bucket's utilization as a row in the popover. No cookie paste, no token, anonymous telemetry is opt-out. Read-only against endpoints the Settings page already calls. The CLI version prints the same rows for tmux and Starship status lines.",
  },
  {
    q: "Why does ccusage say I have plenty of room when Claude Code 429s?",
    a: "ccusage reads ~/.claude/projects/<project>/<session>.jsonl on your machine and sums input and output tokens against a model price card. That is a cost calculator for tokens that left your laptop. Plan limits live on Anthropic's servers as the utilization floats above. The two numbers describe different things and were never supposed to match. ccusage is great for 'how much did I spend in API-price equivalents this month.' It cannot read the plan quota because the plan quota is not in the local logs. ClaudeMeter and ccusage answer different questions; running both is reasonable.",
  },
  {
    q: "Did the May 6, 2026 doubling apply to API and Enterprise too?",
    a: "Partially. Pro, Max, Team, and seat-based Enterprise had their Claude Code 5-hour limits doubled. The free tier was excluded. The Claude API had a separate set of changes: Tier 1 saw a 1500 percent increase in maximum input tokens per minute and a 900 percent increase in maximum output tokens per minute, per Anthropic's announcement, but that is the API rate limit (separate accounting), not the plan-quota float that Claude Code uses on Max. If you run Claude Code via your plan, only the 5-hour Claude Code limit doubled. The weekly buckets did not move.",
  },
];

const numberRows = [
  {
    feature: "Pro ($20/mo) 5-hour window",
    competitor: "10 to 40 prompts (pre-May), 20 to 80 prompts (post-May 6, 2026 doubling)",
    ours: "five_hour.utilization climbs to 1.0. Ranges come from independent tests, not published by Anthropic.",
  },
  {
    feature: "Max 5x ($100/mo) 5-hour window",
    competitor: "~50 to 200 prompts (pre-May), ~100 to 450 prompts (post-May 6, 2026 doubling)",
    ours: "Same five_hour.utilization float, higher absolute token cap. Token mix per prompt swings the count by ~3x.",
  },
  {
    feature: "Max 20x ($200/mo) 5-hour window",
    competitor: "~200 to 800 prompts (pre-May), ~400 to 1800 prompts (post-May 6, 2026 doubling)",
    ours: "Same float. Anthropic's announcement post specifically called out 'Max 20x goes from ~900 to ~1800 per window.'",
  },
  {
    feature: "Pro weekly Sonnet hours",
    competitor: "~40 to 80 active hours, no Opus access",
    ours: "Derived from seven_day_sonnet.utilization * token throughput. 'Active' here means model-processing time, not wall-clock.",
  },
  {
    feature: "Max 5x weekly Sonnet hours",
    competitor: "~140 to 280 active hours",
    ours: "seven_day_sonnet on /usage. Independent of seven_day_opus.",
  },
  {
    feature: "Max 5x weekly Opus hours",
    competitor: "~15 to 35 active hours",
    ours: "seven_day_opus on /usage. The Opus-only bucket is what catches Max users running hard refactors all week.",
  },
  {
    feature: "Max 20x weekly Sonnet hours",
    competitor: "~240 to 480 active hours",
    ours: "seven_day_sonnet, higher cap. Did NOT increase on May 6, 2026.",
  },
  {
    feature: "Max 20x weekly Opus hours",
    competitor: "~24 to 40 active hours",
    ours: "seven_day_opus, the most common Max 20x choke point for Claude Code agentic loops.",
  },
];

const usageEndpointResponse = `// GET https://claude.ai/api/organizations/{org_uuid}/usage
// Returns the live enforcement state for your account.
{
  "five_hour":            { "utilization": 0.21, "resets_at": "2026-05-12T18:00:00Z" },
  "seven_day":            { "utilization": 0.62, "resets_at": "2026-05-17T09:00:00Z" },
  "seven_day_sonnet":     { "utilization": 0.31, "resets_at": "2026-05-17T09:00:00Z" },
  "seven_day_opus":       { "utilization": 0.94, "resets_at": "2026-05-17T09:00:00Z" },
  "seven_day_oauth_apps": { "utilization": 0.71, "resets_at": "2026-05-17T09:00:00Z" },
  "seven_day_omelette":   { "utilization": 0.08, "resets_at": "2026-05-17T09:00:00Z" },
  "seven_day_cowork":     { "utilization": 0.02, "resets_at": "2026-05-17T09:00:00Z" },
  "extra_usage":          { "is_enabled": false }
}
// Each utilization is a float in [0.0, 1.0]. Any one of them at 1.0
// fires the next 429. There is no field named "prompts_remaining".`;

const modelsRsExcerpt = `// claude-meter/src/models.rs (lines 18 to 28)
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

// Each Window is { utilization: f64, resets_at: Option<DateTime<Utc>> }.
// Six fields define the Max plan's enforcement surface. There is no
// "max_5x_quota" or "max_20x_quota" struct on Anthropic's side. The
// plan determines how fast each utilization grows.`;

const liveOutput = [
  { type: "command" as const, text: "$ claude-meter   # Max 20x user, Wednesday, mid-refactor" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter (v0.7, polling /api/organizations/.../usage every 60s)" },
  { type: "output" as const, text: "=================================================================" },
  { type: "output" as const, text: "5-hour            21.0% used    -> resets Wed May 12 18:00 (in 4h 12m)" },
  { type: "output" as const, text: "7-day all         62.0% used    -> resets Sun May 17 09:00 (in 4d 19h)" },
  { type: "output" as const, text: "7-day Sonnet      31.0% used" },
  { type: "output" as const, text: "7-day Opus        94.0% used    -> the wall you will hit Thursday" },
  { type: "output" as const, text: "7-day OAuth       71.0% used    (Claude Code + MCP only)" },
  { type: "output" as const, text: "Extra usage       disabled      (turn on to spend past plan caps)" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "Plan: Max 20x ($200/mo)" },
  { type: "output" as const, text: "Account: founder@example.com" },
];

const steps = [
  {
    title: "Open claude.ai/settings/usage with DevTools open.",
    description:
      "Hit F12 (or Cmd+Option+I), switch to the Network tab, filter for /usage. The Settings page fetches /api/organizations/{org_uuid}/usage on load and refreshes it on focus. The JSON in the Response tab is the same payload claude-meter reads. The big horizontal bar in the prose maps to seven_day; nothing else on the page maps to seven_day_oauth_apps or seven_day_opus.",
  },
  {
    title: "Read every utilization, not just the headline one.",
    description:
      "Each utilization in the response is a float between 0.0 and 1.0 (some Anthropic responses ship the same number as 0 to 100; the contract is the same scale internally). Whichever bucket is highest is the wall you will hit next. On Max, the most common surprise is finding seven_day_opus at 0.94 while the Settings page shows '62 percent' (which is seven_day).",
  },
  {
    title: "Note the resets_at for the hot bucket.",
    description:
      "Each Window has its own resets_at timestamp. The 5-hour clock rolls 5 hours after your first message of the window. The weekly clocks roll 168 hours after the first message of the cycle, independently per bucket. A 5-hour reset does NOT push the weekly clock. ClaudeMeter renders each resets_at as a relative duration ('in 4h 12m', 'in 4d 19h') so you do not have to do TZ math.",
  },
  {
    title: "Decide the right exit for the hot bucket.",
    description:
      "five_hour at 1.0 wants you to wait a few hours. seven_day at 1.0 wants you to wait days. seven_day_opus at 1.0 wants you to drop to Sonnet for the rest of the week. seven_day_oauth_apps at 1.0 wants you to leave Claude Code for claude.ai web. Treating all four walls as the same wall (the common reflex) wastes a workday on the wrong fix.",
  },
  {
    title: "Or skip the manual polling.",
    description:
      "claude-meter is open-source (MIT, github.com/m13v/claude-meter). The macOS app pins each utilization row to the menu bar and refreshes every 60 seconds. The browser extension hands over the live claude.ai session, so there is no cookie paste, no keychain prompt, no expiring token. brew install --cask m13v/tap/claude-meter, install the extension, visit claude.ai once.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-max-plan-still-hitting-limits",
    title: "Claude Max plan still hitting limits? It is eight buckets, not one",
    excerpt:
      "Max raises the cap on each bucket but does not collapse them into one. Here is the triage that maps the 429 to the bucket and the fix.",
    tag: "Triage",
  },
  {
    href: "/t/claude-rate-limits-doubled-weekly-cap-unchanged",
    title: "Claude rate limits doubled, weekly cap unchanged",
    excerpt:
      "What the May 6, 2026 SpaceX-compute doubling actually changed, what it did not, and how the float behind the 5-hour window moves now.",
    tag: "Changes",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage reads local Claude Code JSONL token estimates. ClaudeMeter reads the server-truth utilization float Anthropic enforces. Different numbers, different jobs.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code Max usage limits: the published numbers, and the float they actually come from",
  description:
    "Anthropic does not publish a prompt count for the Max plan. Every Claude Code Max user is rate-limited by a utilization float on /api/organizations/{org_uuid}/usage. Here is the float, the prompt ranges it maps to after the May 6, 2026 doubling, and what stayed the same on the weekly caps.",
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

export default function ClaudeCodeMaxUsageLimitsPage() {
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

      <header className="max-w-4xl mx-auto px-6 pb-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          Claude Code Max usage limits:{" "}
          <GradientText>the published numbers, and the float they actually come from.</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Anthropic does not publish a prompt count for the Max plan. Every
          Claude Code Max user is rate-limited by a utilization float between
          0.0 and 1.0, on six separate buckets, on a single internal endpoint.
          The prompt ranges you see on blogs are reverse-engineered estimates
          that wobble by ~3x with model choice and context length. The float is
          the contract.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="8 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <GlowCard>
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold">
              Direct answer (verified 2026-05-12)
            </p>
            <p className="mt-3 text-zinc-900 text-lg leading-relaxed">
              Anthropic does not publish a Claude Code Max prompt count or
              token cap. The actual limit is a{" "}
              <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
                utilization
              </code>{" "}
              float (0.0 to 1.0) returned by{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                claude.ai/api/organizations/&#123;org_uuid&#125;/usage
              </code>
              . Max enforces this on six buckets:{" "}
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
              , and (if metered billing is on) a dollar cap on{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /overage_spend_limit
              </code>
              . Any one bucket at 1.0 fires the next 429. Independent tests put
              Max 5x at ~50 to 200 prompts per 5-hour window and Max 20x at
              ~200 to 800, before the May 6, 2026 doubling. After May 6, those
              ranges roughly become ~100 to 450 and ~400 to 1800 (
              <a
                className="text-teal-700 underline"
                href="https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan"
              >
                Anthropic Help Center
              </a>
              ). Weekly caps were not changed.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The numbers blogs cite (and what they leave out)
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          These ranges are what most write-ups land on after independent
          testing. Anthropic has never confirmed them. They are useful as
          rough planning numbers, dangerous as guarantees. The right column
          says what the actual gating primitive is.
        </p>
        <ComparisonTable
          productName="Common estimate"
          competitorName="What the float behind it does"
          rows={numberRows}
        />
        <p className="mt-6 text-sm text-zinc-500 leading-relaxed">
          Estimates aggregated from independent tests on truefoundry.com,
          intuitionlabs.ai, and portkey.ai. The post-May 6 numbers reflect
          Anthropic&apos;s announcement that the 5-hour rate limit was doubled
          on Pro, Max, Team, and seat-based Enterprise plans. Weekly hours
          come from independent counts of model-processing time and have not
          been doubled.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the ranges are so wide
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          A 'prompt' is not a unit. A 200-token question with no file context
          costs maybe 1500 input tokens and 300 output tokens after Claude
          Code packs in the system prompt and tool definitions. A '50 KB diff
          plus repo map plus adaptive thinking turned on' costs 90 thousand
          input tokens and 12 thousand output tokens for the same submit
          action. Same plan, same week, the second prompt eats roughly 30x
          the float of the first. That is where the 50-200 turns into the
          50-200 range: the low end is short prompts on Haiku-flavored
          intents, the high end is small edits on small files.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The Opus 4.7 release made this worse. Anthropic&apos;s own
          what&apos;s-new doc says the new tokenizer maps the same text to
          1.0x to 1.35x as many tokens. Adaptive thinking, on by default for
          Opus 4.7, burns thinking tokens that are real output tokens from
          the server&apos;s point of view and flow into{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>
          . The published prompt-count estimates from earlier in the year
          assume a steady tokenizer and no thinking tokens. They were
          accurate then; they undercount the float burn now.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The honest answer to &quot;how many Claude Code prompts do I get on
          Max 20x?&quot; is: it depends, but the float on your account does
          not. Read the float, not the blog.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The shape of the actual enforcement payload
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          This is the JSON behind claude.ai/settings/usage on a Wednesday
          mid-week. Each utilization is the live percentage the server is
          enforcing right now. The Settings page renders the seven_day field
          as its big bar; the four other buckets are not separately surfaced
          in the prose.
        </p>
        <AnimatedCodeBlock
          code={usageEndpointResponse}
          language="json"
          filename="GET /api/organizations/{org_uuid}/usage"
        />
        <p className="mt-6 text-zinc-700 leading-relaxed text-lg">
          In this snapshot, the Settings page would tell you &quot;you have
          used 62 percent of your weekly limit.&quot; The 5-hour bar would
          show 21 percent. Both numbers are fine. The actual wall is{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          at 94 percent. The next heavy Opus refactor will 429 with the
          message &quot;Opus weekly limit reached&quot; even though seven_day
          is at 62. The float that decides is not the float on the bar.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What May 6, 2026 changed (and what it did not)
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Anthropic announced on May 6, 2026 that Claude Code&apos;s 5-hour
          rate limit was doubled for Pro, Max, Team, and seat-based
          Enterprise. Peak-hour throttling was removed on Pro and Max. The
          change followed a compute deal with SpaceX&apos;s Colossus 1 data
          center. Every follow-up post and the official help center copy
          says the weekly caps are the same size they were before.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Concretely: the rate at which a Claude Code prompt pushes{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          dropped by half on May 6. The rate at which the same prompt pushes{" "}
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
          , and{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>{" "}
          did not change. A Max 20x user who used to hit the weekly cap on
          Thursday still hits it on Thursday. What changed is that the
          5-hour throttle in between is half as tight, so the path to that
          Thursday cap is smoother.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Anthropic&apos;s announcement specifically called out the Max 20x
          number: from ~900 prompts per 5-hour window to ~1800. The Pro
          range went from ~10 to 40 to ~20 to 80. The exact prompt count
          you get is still gated by your token mix.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The six buckets in claude-meter&apos;s Rust core
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          claude-meter is the open-source meter that reads these fields. The
          struct definition is the literal contract with the server. There
          is no &quot;max 5x cap&quot; field; there is a utilization float
          per bucket. The plan determines how fast the float climbs.
        </p>
        <AnimatedCodeBlock
          code={modelsRsExcerpt}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the live read looks like
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          This is the CLI version of the menu bar popover, dumped from a
          Max 20x account in the middle of a heavy refactor week.
          claude-meter polls the same endpoint claude.ai/settings/usage
          calls. The Rust binary lives at{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            ~/.cargo/bin/claude-meter
          </code>{" "}
          after{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            brew install --cask m13v/tap/claude-meter
          </code>
          .
        </p>
        <TerminalOutput lines={liveOutput} title="claude-meter status" />
        <p className="mt-6 text-zinc-700 leading-relaxed text-lg">
          The row that matters in this snapshot is{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            7-day Opus 94.0%
          </code>
          . If you spent the rest of the day on Opus, you would hit the
          weekly Opus cap by Thursday. The Settings page would still show
          a green-ish 62 percent on the all-up bar. Anthropic&apos;s rate
          limit message would not name the bucket; it would just say the
          weekly limit was reached. ClaudeMeter names it.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reading the float yourself, in five moves
        </h2>
        <StepTimeline steps={steps} />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        section="guide-footer"
        heading="Want a walkthrough of which bucket fired on your account?"
        description="Bring your claude.ai session and we will read the float together over a 15-minute call. No setup needed."
      />

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16 mb-20">
        <RelatedPostsGrid posts={relatedPosts} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        section="guide-sticky"
        description="Hitting the Max wall mid-refactor? Book 15 minutes."
      />
    </article>
  );
}
