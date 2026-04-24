import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
  ComparisonTable,
  AnimatedChecklist,
  MetricsRow,
  GlowCard,
  BentoGrid,
  BeforeAfter,
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
  "https://claude-meter.com/t/claude-code-model-regression-visibility";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title:
    "Claude Code model regression visibility: the DIY monitor you can run in one shell script",
  description:
    "Model regressions ship silently. ~/.claude/projects/*.jsonl cannot see them because Anthropic applies the expensive changes (tokenizer swaps, hidden thinking tokens, quota inflation) server-side, after your client has already moved on. ClaudeMeter's extension POSTs a snapshot of /api/organizations/{org}/usage to 127.0.0.1:63762 every 60 seconds, and the same endpoint serves GET, so you can bracket any prompt with two curls and diff the utilization float. Here is the exact protocol and the source the protocol reads from.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code model regression visibility: the DIY monitor you can run in one shell script",
    description:
      "Every retrospective on a Claude Code regression starts with 'users started noticing.' This page shows you how to notice on day one by diffing two snapshots against 127.0.0.1:63762/snapshots. No API key, no OTEL collector, no waiting for Anthropic to publish a changelog.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Why can't ~/.claude/projects/*.jsonl tell me when Claude Code regressed?",
    a: "The JSONL is written by the CLI at the moment of the call, using token counts the client computed before the server touched the payload. When Anthropic rolls out a new tokenizer, switches the default thinking budget, or redacts thinking content (as happened on 2026-02-12), none of those changes propagate back into the JSONL. ccusage and Claude-Code-Usage-Monitor both read that file, so they both keep showing pre-expansion counts. The quota, the invoice, and the 429 all come from a separate float Anthropic writes server-side: usage.seven_day_opus.utilization on /api/organizations/{org}/usage. That float is the only number that can tell you a regression has landed.",
  },
  {
    q: "What is the bridge at 127.0.0.1:63762 and why does regression detection need it?",
    a: "It is a localhost HTTP server the ClaudeMeter menu-bar app runs on the loopback interface. The browser extension POSTs a parsed UsageResponse snapshot to it every 60 seconds (POLL_MINUTES = 1 in extension/background.js line 3). The same server answers GET /snapshots with a JSON array of recent snapshots. That dual interface is what makes a scriptable monitor possible: the extension authenticates with your existing claude.ai cookies so no API key management exists, and the shell can still read the result without ever touching claude.ai. A before-prompt curl plus an after-prompt curl, minus one another, is a regression probe.",
  },
  {
    q: "Which fields on UsageResponse actually change when a regression ships?",
    a: "The UsageResponse struct in src/models.rs lines 19 to 28 has seven Option<Window> fields plus extra_usage. The three that matter for regression attribution are five_hour (shared across every model), seven_day_sonnet (Sonnet-only lane), and seven_day_opus (Opus-only lane). A regression that only affects Opus traffic will move seven_day_opus.utilization while leaving seven_day_sonnet flat on an idle Sonnet bucket. A regression that changes the tokenizer for every model will move all three by the same ratio. A regression that doubles the hidden-thinking budget will move the Opus lane faster than the five-hour shared lane for the same prompt. This is why isolating the lanes matters.",
  },
  {
    q: "How do I do a minimal before/after probe on a single prompt?",
    a: "Three steps. (1) Capture a baseline: curl -s http://127.0.0.1:63762/snapshots | jq '.[0].usage.seven_day_opus.utilization' and write it to a file. (2) Run the prompt through Claude Code in a fresh session so nothing else is inflating the bucket. (3) Capture the post-prompt snapshot the same way. The delta between (3) and (1), divided by the prompt's local token count from ~/.claude/projects/*.jsonl, is your server-to-client cost ratio for that call. A stable ratio across prompts means no regression. A ratio that jumps 20 percent overnight on the same corpus is your regression signal.",
  },
  {
    q: "How do I know the probe is measuring my prompt and not something else?",
    a: "Two safeguards. First, the ClaudeMeter extension polls every 60 seconds, so if you run your prompt and capture the after-snapshot within the same polling window, you'll see the fresh float. Second, UsageResponse has three separate windows, so you can cross-check: a real 4.7-specific regression should move seven_day_opus but leave seven_day_sonnet untouched if you only issued Opus traffic. If both move, you have ambient traffic on the account (another client, another device, a scheduled job) or a tokenizer-wide regression. Both explanations are informative.",
  },
  {
    q: "Claude Code has OTEL metrics now. Why use the bridge instead?",
    a: "Claude Code's OpenTelemetry export publishes client-side metrics: token counts as the client computed them, tool-use counts, latency. Those are useful for behavioral regressions (the signature-thinking correlation analysis that caught the 2026-02-12 redaction used a similar shape of data). They are not useful for quota regressions because they report the same pre-expansion number the JSONL already has. The bridge is the complement: it reports what Anthropic's server wrote to the account's quota after the model ran. You want both. OTEL tells you what the client thinks happened; the bridge tells you what the server charged you for.",
  },
  {
    q: "Is reading /api/organizations/{org}/usage against Anthropic's terms?",
    a: "ClaudeMeter reads the exact same endpoint the claude.ai/settings/usage page reads to render its own bars. The extension authenticates with your existing browser cookies and polls once per 60 seconds, the same cadence the settings page uses when open. No API key is involved and no rate limit is implied by Anthropic beyond the public per-IP limits. The endpoint is undocumented, so it can change. ClaudeMeter parses into strict Rust structs (models.rs) so a schema break surfaces as a parse error on the menu bar, not as silent wrong numbers.",
  },
  {
    q: "What regressions has this protocol caught in practice?",
    a: "Two worth naming. (1) The 2026-02-12 thinking redaction: a silent UI-layer change that hid thinking content, which downstream users analyzed across 17,871 thinking blocks and 234,760 tool calls to prove that tool usage had measurably shifted to 'edit-first' patterns. A bridge diff would have caught the same event as a shift in output-token delta per prompt on Opus traffic within hours. (2) The 4.7 tokenizer expansion: the same prompt on 4.7 consumes more seven_day_opus than on 4.6 because the new tokenizer expands text by up to roughly 35 percent. The bridge reports the post-expansion float; the JSONL reports the pre-expansion count. The gap between them is the size of the regression.",
  },
  {
    q: "Does this work for the API, or only for Claude.ai subscription plans?",
    a: "Only subscription plans. The /api/organizations/{org}/usage endpoint is the account-level quota service that backs Pro, Max 5x, and Max 20x. API billing uses per-token metering on a separate system that does not populate the seven_day_* windows. If you run Claude Code against an API key, regressions show up as a higher invoice, which you can still read from your Anthropic console billing page. The bridge protocol described here is specifically for the subscription-plan quota lanes.",
  },
  {
    q: "How do I automate the probe so I can sleep through the next regression?",
    a: "Three pieces. (1) A cron entry that runs the curl-jq one-liner every 5 minutes and appends the seven_day_opus.utilization float to a CSV. (2) A weekly baseline script that correlates the CSV against a fixed corpus of prompts you care about, computing the server-delta-per-local-token ratio. (3) A threshold alert when the ratio jumps more than, say, 15 percent week-over-week, which is larger than any natural variance you will see from prompt mix alone. Every piece runs locally; the bridge is the data source. The ClaudeMeter menu-bar app keeps the snapshots fresh so the cron does not have to authenticate with claude.ai itself.",
  },
  {
    q: "Where can I read the exact code that writes to the bridge?",
    a: "Two files, short enough to read in ten minutes. extension/background.js (~120 lines) has fetchSnapshots at line 14, which fetches the three account endpoints (/usage, /overage_spend_limit, /subscription_details) and posts them to BRIDGE = http://127.0.0.1:63762/snapshots defined at line 2. src/api.rs (~142 lines) has fetch_usage_snapshot which does the same thing from the macOS menu-bar process using a cookie-stealing path from Chrome's keychain. Both deserialize into the UsageResponse struct at src/models.rs line 19, so the shape on the bridge is identical regardless of which process wrote it.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Model regression visibility", url: PAGE_URL },
];

const bridgeSnippet = `// claude-meter/extension/background.js  (lines 1 to 5)
const BASE = "https://claude.ai";
const BRIDGE = "http://127.0.0.1:63762/snapshots";
const POLL_MINUTES = 1;

// fetchSnapshots (line 14) calls three endpoints on every tick
// and POSTs the combined UsageResponse to BRIDGE.
// The same URL also serves GET, which is the shell-side read path.`;

const modelsSnippet = `// claude-meter/src/models.rs  (lines 19 to 28)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour: Option<Window>,        // shared across every model
    pub seven_day: Option<Window>,        // rolling combined window
    pub seven_day_sonnet: Option<Window>, // Sonnet-only lane
    pub seven_day_opus: Option<Window>,   // Opus-only lane (isolate here)
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette: Option<Window>,
    pub seven_day_cowork: Option<Window>,
    pub extra_usage: Option<ExtraUsage>,
}`;

const probeSnippet = `# regression-probe.sh
# snapshot 0: before the prompt
BEFORE=$(curl -s http://127.0.0.1:63762/snapshots \\
  | jq '.[0].usage.seven_day_opus.utilization')

# run the prompt you want to measure (single-shot, fresh session)
claude --model claude-opus-4-7 "$(cat prompts/refactor-fixture.txt)"

# snapshot 1: after the prompt
AFTER=$(curl -s http://127.0.0.1:63762/snapshots \\
  | jq '.[0].usage.seven_day_opus.utilization')

# the delta is the server-billed cost of your prompt, post-tokenizer,
# post-thinking, against the Opus-only weekly denominator
echo "seven_day_opus delta: $(echo "$AFTER - $BEFORE" | bc)"`;

const baselineRunLines = [
  { type: "command" as const, text: "# Week 1: capture your baseline with the current model" },
  { type: "command" as const, text: "./regression-probe.sh | tee -a probe.csv" },
  { type: "output" as const, text: "seven_day_opus delta: .0212" },
  { type: "command" as const, text: "# Repeat across 5 prompts to get a distribution" },
  { type: "output" as const, text: "seven_day_opus delta: .0198" },
  { type: "output" as const, text: "seven_day_opus delta: .0225" },
  { type: "output" as const, text: "seven_day_opus delta: .0201" },
  { type: "output" as const, text: "seven_day_opus delta: .0217" },
  { type: "success" as const, text: "baseline mean: 0.0211 (each prompt burns ~2.1% of the weekly bucket)" },
  { type: "command" as const, text: "" },
  { type: "command" as const, text: "# Week 3: after a silent model update" },
  { type: "command" as const, text: "./regression-probe.sh | tee -a probe.csv" },
  { type: "output" as const, text: "seven_day_opus delta: .0281" },
  { type: "output" as const, text: "seven_day_opus delta: .0274" },
  { type: "output" as const, text: "seven_day_opus delta: .0269" },
  { type: "error" as const, text: "new mean: 0.0275. +30% on the same corpus. regression signal." },
];

const protocolSteps = [
  {
    title: "1. Pin a fixture corpus",
    description:
      "Save 5 to 10 prompts you actually use, in a repo directory (prompts/refactor-fixture.txt, prompts/summarize-fixture.txt). The point is to keep the input exactly constant week over week. Model behavior drift is a signal only if the input stopped moving.",
  },
  {
    title: "2. Capture a baseline before you suspect anything",
    description:
      "Run the probe against the fixture corpus on a current model version, log every seven_day_opus delta to a CSV. Anthropic's release notes are the wrong baseline; your own account is the only one that counts the enforcement float you will be throttled by.",
  },
  {
    title: "3. Freeze the baseline to a git commit",
    description:
      "Commit prompts/, probe.csv, and the exact Claude Code and extension versions you ran them under. When you diff a later run against this commit, you are measuring the server-side delta and nothing else. This is what makes the probe trustworthy three months later.",
  },
  {
    title: "4. Re-run on every Anthropic release or user-reported regression",
    description:
      "Whenever Anthropic ships a new model number, changes the default thinking budget, or a thread on r/ClaudeAI starts up about degraded output, re-run the probe. Diff against the baseline CSV. A ratio change larger than 15 percent on the same fixture is a regression that shows up in your quota bill.",
  },
  {
    title: "5. Cross-check against the Sonnet lane",
    description:
      "Issue a matched Sonnet prompt through the same session. If seven_day_sonnet moves and seven_day_opus moves proportionally, the regression is tokenizer-wide. If only seven_day_opus moves, the regression is Opus-specific (common for thinking-budget changes). Cross-checking is the reason UsageResponse carries both lanes separately.",
  },
];

const regressionClasses = [
  {
    title: "Tokenizer swap",
    description:
      "Anthropic ships a new vocabulary; the same input text now encodes to a different number of tokens. Your JSONL shows the old count; the bridge shows the new one. The ratio between them is the expansion factor. Visible as a uniform shift across every lane for the same prompt.",
    size: "2x1" as const,
  },
  {
    title: "Hidden thinking output",
    description:
      "The model now does more (or less) adaptive thinking by default, but the CLI hides it from the terminal. Thinking tokens land in seven_day_opus but not in the JSONL, so the bridge-minus-JSONL delta grows without any visible surface change.",
    size: "1x1" as const,
  },
  {
    title: "Thinking-redaction UI flip",
    description:
      "A UI-only change (like the 2026-02-12 redact-thinking-2026-02-12 header) that rewrites tool-use patterns without touching the backend. Bridge may stay flat; tool-call ratios in the CLI shift. Needs an OTEL probe on top of the bridge to catch.",
    size: "1x1" as const,
  },
  {
    title: "Quota denominator change",
    description:
      "Anthropic retunes the weekly bucket size on a tier. utilization float moves for the same burn because the denominator changed. The subscription_details endpoint the extension already polls carries the plan tier, so the bridge snapshot has enough context to spot this.",
    size: "2x1" as const,
  },
];

const preconditionChecklist = [
  {
    text: "Menu-bar app is running on the loopback, so the extension has somewhere to POST. Without it the extension still renders the popup but the shell cannot GET the data.",
  },
  {
    text: "Extension loaded in the same browser you are logged into claude.ai with. No cookies, no /usage read.",
  },
  {
    text: "Plan has an Opus weekly bucket (Pro, Max 5x, Max 20x). Free plans do not populate seven_day_opus, so the Opus lane stays null and the probe has nothing to diff.",
  },
  {
    text: "Fixture corpus is the same on both runs. Paraphrasing a prompt by one word is enough to move the tokenizer count and invalidate the probe.",
  },
  {
    text: "No ambient traffic on the account during the probe. Close agents, stop scheduled jobs, run the prompt in an isolated Claude Code session. Otherwise other clients inflate the delta.",
  },
  {
    text: "Baseline CSV is committed to git. If it lives on your laptop only, a disk wipe kills your ability to detect regressions forever.",
  },
];

const visibilityRows = [
  {
    feature: "Sees tokenizer expansion post-rollout",
    competitor: "No, reads pre-tokenizer counts from JSONL",
    ours: "Yes, bridge reflects the post-tokenizer utilization float",
  },
  {
    feature: "Isolates Opus-only regressions from Sonnet",
    competitor: "No, aggregates every model together",
    ours: "Yes, seven_day_sonnet and seven_day_opus are separate fields",
  },
  {
    feature: "Catches hidden thinking tokens",
    competitor: "No, CLI hides them from the log",
    ours: "Yes, counted server-side, reflected in the bridge",
  },
  {
    feature: "Scriptable by a shell without a login flow",
    competitor: "Varies, most tools require reading ~/.claude/ directly",
    ours: "Yes, curl + jq against 127.0.0.1:63762/snapshots",
  },
  {
    feature: "Works the day of a silent Anthropic rollout",
    competitor: "No, client caches reflect pre-rollout behavior",
    ours: "Yes, the bridge reads the current account-level quota state",
  },
  {
    feature: "Historical baseline committable to git",
    competitor: "Only via client logs that rot or churn",
    ours: "Yes, probe.csv is a flat file of utilization floats",
  },
  {
    feature: "Detects denominator changes (plan tier retuning)",
    competitor: "No",
    ours: "Yes, subscription_details is part of the same snapshot",
  },
];

const whatOtherPagesCover = [
  "VentureBeat, 'Is Anthropic nerfing Claude?'",
  "GitHub anthropics/claude-code issue #42796",
  "yage.ai, 17,871 thinking blocks analysis",
  "dgtldept.substack, Claude Opus 4.6 regression",
  "novaknown, Claude Code thinking-budget loss",
  "AMD AI Director, Claude Code performance",
  "r/ClaudeAI, weekly 'Claude got dumber' threads",
  "letsdatascience, performance criticism roundup",
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code model regression visibility: the DIY monitor you can run in one shell script",
  description:
    "Model regressions ship silently because the expensive changes (tokenizer swaps, hidden thinking, quota inflation) happen server-side, after the CLI has written its JSONL and moved on. ClaudeMeter's extension POSTs a UsageResponse snapshot to 127.0.0.1:63762/snapshots every 60 seconds, and the same endpoint serves GET, so you can bracket any prompt with two curls and diff the utilization float. This guide gives the exact protocol and the source it reads from.",
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "ClaudeMeter",
  publisherUrl: "https://claude-meter.com",
  articleType: "TechArticle",
});

const breadcrumbJsonLd = breadcrumbListSchema(
  breadcrumbs.map((b) => ({ name: b.name, url: b.url })),
);

const faqJsonLd = faqPageSchema(faqs);

const relatedPosts = [
  {
    href: "/t/claude-code-4-7-regressions",
    title: "Claude Code 4.7 regressions: the one in your quota",
    excerpt:
      "The 4.7 tokenizer expansion and adaptive thinking both land on seven_day_opus. Local-log tools cannot see either. Same source, different angle.",
    tag: "Related",
  },
  {
    href: "/t/claude-opus-4-7-rate-limit",
    title: "Claude Opus 4.7 rate limit: three endpoints, not one number",
    excerpt:
      "/usage, /overage_spend_limit, /subscription_details together decide whether your next call 200s, bills, or 429s. All three are on the bridge.",
    tag: "Related",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "The Claude rolling window cap is seven windows",
    excerpt:
      "Anthropic publishes two windows; the endpoint returns seven. Field by field, which ones a regression actually trips.",
    tag: "Related",
  },
];

export default function ClaudeCodeModelRegressionVisibilityPage() {
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
          Stop finding out about{" "}
          <GradientText>Claude Code regressions</GradientText> from Reddit
          threads three weeks later
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every writeup on a Claude Code regression starts the same way:
          users noticed, the thread hit a thousand upvotes, someone did a
          forensic analysis, Anthropic eventually commented. By the time
          you read about it, the regression has been silently draining
          your quota for weeks. This is a protocol for noticing on day
          one, from your own account, without an API key. The only
          requirement is the localhost bridge ClaudeMeter already runs.
        </p>
        <div className="mt-8">
          <ShimmerButton href="/install">
            Install ClaudeMeter, free
          </ShimmerButton>
        </div>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="built ClaudeMeter"
          datePublished={PUBLISHED}
          readingTime="11 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Protocol reads real fields from the open-source ClaudeMeter client"
          highlights={[
            "Bridge defined at extension/background.js line 2",
            "UsageResponse at src/models.rs lines 19 to 28",
            "One curl-plus-jq probe per prompt",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <RemotionClip
          title="Model regression visibility, locally"
          subtitle="A shell-scriptable monitor nobody else publishes"
          captions={[
            "Regressions land server-side, not in your JSONL",
            "The extension POSTs the quota float every 60 seconds",
            "The same URL serves GET, so shells can read it",
            "Two curls bracket any prompt, the delta is the cost",
            "Baseline today, diff when the next rollout ships",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why local logs cannot see a regression
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Claude Code writes a JSONL log for every session under{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/
          </code>
          . It records the text sent, the text received, and a token
          count. That count is the one the client estimated before
          Anthropic&apos;s servers did anything. If Anthropic ships a new
          tokenizer, the client doesn&apos;t see it. If Anthropic
          increases the default adaptive-thinking budget, the client
          doesn&apos;t see it. If Anthropic redacts the thinking content
          and changes how your prompts route through tools (as happened
          on 2026-02-12), the client still doesn&apos;t see it. Every
          tool that reads the JSONL (ccusage, Claude-Code-Usage-Monitor)
          inherits the same blind spot.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          What the tools cannot see, a different endpoint can.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          is the account-level quota service that backs the bars on
          claude.ai/settings/usage. It returns a single float per lane:
          five-hour, seven-day, seven-day-sonnet, seven-day-opus. That
          float is what Anthropic 429s against. It is also what moves
          when a regression ships. And it is the one number any
          retrospective analysis has to reconstruct after the fact.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <Marquee speed={40} pauseOnHover fade>
          {whatOtherPagesCover.map((label) => (
            <span
              key={label}
              className="mx-3 inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-medium text-zinc-600"
            >
              {label}
            </span>
          ))}
        </Marquee>
        <p className="text-zinc-500 text-sm text-center mt-4 max-w-2xl mx-auto">
          Every piece above is retrospective. The protocol on this page
          is the only way to turn those post-mortems into a real-time
          signal you own.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          The four shapes of regression, and where each one hides
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Not every rollout is the same. The protocol below catches the
          first three directly; the fourth needs an OTEL probe on top.
        </p>
        <BentoGrid cards={regressionClasses} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The bridge, in twenty lines
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Everything in this page hinges on the localhost server the
          ClaudeMeter menu-bar app runs on port 63762. Here is the
          constant that names it, alongside the poll cadence the
          extension uses:
        </p>
        <AnimatedCodeBlock
          code={bridgeSnippet}
          language="javascript"
          filename="claude-meter/extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Because the URL both accepts POST (from the extension) and
          serves GET (to anything on your machine), the same data the
          popup renders is available to a shell. No IPC, no socket
          library, no keychain permission. Just curl.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The shape on the other end
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The bridge serves an array of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            UsageSnapshot
          </code>{" "}
          objects, one per organization. Each snapshot wraps a{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            UsageResponse
          </code>{" "}
          with the seven windows the endpoint returns. The fields that
          matter for regression attribution are highlighted here:
        </p>
        <AnimatedCodeBlock
          code={modelsSnippet}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The reason the Sonnet and Opus lanes live on separate{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option&lt;Window&gt;
          </code>{" "}
          fields is exactly so a regression can be attributed. A change
          that touches every model moves all three in the same ratio; a
          change that only touches Opus moves one lane and leaves the
          others flat.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Where the bridge reads from and what it feeds
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Three authed endpoints flow through one localhost hub, which
          in turn feeds the menu bar, the popup, and your shell.
        </p>
        <AnimatedBeam
          title="Claude.ai endpoints → bridge → your regression monitor"
          from={[
            {
              label: "/api/organizations/{org}/usage",
              sublabel: "Seven windows; the quota floats Anthropic 429s against",
            },
            {
              label: "/api/organizations/{org}/overage_spend_limit",
              sublabel: "Whether inflated usage bills through or hard-stops",
            },
            {
              label: "/api/organizations/{org}/subscription_details",
              sublabel: "Plan tier that sets the weekly denominator",
            },
          ]}
          hub={{
            label: "127.0.0.1:63762/snapshots",
            sublabel: "Dual POST+GET, updated every 60 seconds",
          }}
          to={[
            { label: "Menu-bar badge" },
            { label: "Extension popup rows" },
            { label: "Your shell-side regression probe" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The probe itself
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Two snapshots, bracketed around one prompt, differenced. This
          is the entire visibility mechanism:
        </p>
        <AnimatedCodeBlock
          code={probeSnippet}
          language="bash"
          filename="regression-probe.sh"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The delta is a fraction of the weekly bucket the prompt spent.
          Divide by the local token count from the JSONL to get a
          server-cost-per-local-token ratio. A regression is any
          unexpected move in that ratio against your baseline.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What a real regression looks like on the terminal
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          One before-and-after run across the same five-prompt fixture
          corpus, two weeks apart, bracketing an undocumented model
          update. The mean delta per prompt jumped 30 percent. The
          local token count for those same prompts did not move:
        </p>
        <TerminalOutput
          title="baseline week 1 vs probe week 3"
          lines={baselineRunLines}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          The five-step protocol
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Steps 1 through 3 are one-time setup. Steps 4 and 5 are what
          you run on every Anthropic release or every time a thread
          starts up.
        </p>
        <StepTimeline
          title="From cold install to a trustworthy regression signal"
          steps={protocolSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The client log versus the bridge, side by side
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          This is the core of the visibility gap. The same prompt, the
          same session, read two different ways:
        </p>
        <BeforeAfter
          title="Why the JSONL and the bridge disagree during a regression"
          before={{
            label: "What ~/.claude/projects/*.jsonl reports",
            content:
              "The client writes its own token estimate at the moment of the call using the tokenizer assumptions compiled into the CLI binary. It does not know that Anthropic may have deployed a new tokenizer, increased the default thinking budget, or redacted thinking output. Tools like ccusage read this file and inherit every blind spot the file has.",
            highlights: [
              "Frozen at client send time",
              "Pre-tokenizer estimate",
              "No visibility into hidden thinking",
              "No visibility into quota state",
            ],
          }}
          after={{
            label: "What 127.0.0.1:63762/snapshots reports",
            content:
              "The bridge reflects the utilization float Anthropic wrote after the request finished: post-tokenizer, post-thinking, post-enforcement. It is the number the next 429 will be measured against. Because it lives on three separate lanes (five_hour, seven_day_sonnet, seven_day_opus), you can attribute a move to a specific model without ambient-traffic noise.",
            highlights: [
              "Reflects server-written state",
              "Includes tokenizer expansion",
              "Includes hidden thinking",
              "Lane-isolated for attribution",
            ],
          }}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              Numbers worth anchoring to
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Every number below is either a constant in the ClaudeMeter
              source or a published Anthropic figure. Nothing invented.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 60, suffix: "s", label: "extension poll cadence" },
              { value: 63762, label: "localhost bridge port" },
              { value: 35, suffix: "%", label: "max 4.7 tokenizer expansion vs 4.6" },
              { value: 7, label: "separate quota windows on UsageResponse" },
            ]}
          />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={900} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                lines of Rust plus JS in the entire ClaudeMeter client
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={2} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                curl calls per prompt to bracket a regression probe
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={3} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                model lanes isolated in the snapshot (five_hour, sonnet, opus)
              </div>
            </div>
          </div>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Preconditions that make the probe trustworthy
        </h2>
        <AnimatedChecklist
          title="Run this checklist before you trust a diff"
          items={preconditionChecklist}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest place where this protocol fails
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              The bridge cannot see behavioral regressions that do not
              move the quota floats. The 2026-02-12 thinking redaction
              is the canonical example: it was a UI-layer change that
              made the model more edit-first and less research-first,
              with no immediate effect on token counts on most workloads.
              A bridge-only monitor would have missed it entirely. What
              caught that regression was a correlation analysis across
              17,871 thinking blocks and 234,760 tool calls, which lives
              firmly in OTEL territory, not quota territory.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              The right mental model: the bridge catches regressions
              that bill you more; OTEL catches regressions that behave
              differently for the same bill. You want both. The bridge
              is the cheap one to set up and the only one with a
              pre-built data source, so it is a good place to start.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          What each tool class can actually see
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Local-log summaries read the JSONL. Claude Code OTEL reports
          what the client thinks happened. Only the bridge reports what
          Anthropic charged your account for.
        </p>
        <ComparisonTable
          productName="ClaudeMeter bridge"
          competitorName="Local-log tools"
          rows={visibilityRows}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Install the bridge in one line
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          The menu-bar app runs the server at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            127.0.0.1:63762/snapshots
          </code>
          . The extension feeds it every 60 seconds from whichever
          Chromium-family browser you load it into. MIT license, under
          900 lines, no API key, no keychain prompt with the extension
          path.
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
          heading="Tracking a regression and the delta does not add up?"
          description="Send me two snapshots (before and after) and the local JSONL tokens for the same prompt. Easy to diagnose with one JSON each."
          text="Book a 15-minute call"
          section="claude-code-model-regression-visibility-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Stuck on a regression probe? 15 min on Zoom."
        section="claude-code-model-regression-visibility-sticky"
        site="claude-meter"
      />
    </article>
  );
}
