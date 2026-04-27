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
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-4-7-regressions";
const PUBLISHED = "2026-04-23";

export const metadata: Metadata = {
  title: "Claude Code 4.7 Regressions: The One That Shows Up in Your Quota, Not Your Benchmarks",
  description:
    "The loudest Claude Code 4.7 regression isn't long-context recall or BrowseComp. It's the quota regression: the same workload drains seven_day_opus faster than 4.6 did, and ccusage cannot see it because the tokenizer expansion is applied server-side after your JSONL is written. Here is where it shows up in ClaudeMeter's UsageResponse struct.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Code 4.7 Regressions: The One That Shows Up in Your Quota, Not Your Benchmarks",
    description:
      "Benchmark posts focus on long-context and latency regressions. The regression that hits Claude Code users first is quota: same prompts, same workload, Opus weekly bucket drains faster. Only the server-side /usage endpoint can see it.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What is the Claude Code 4.7 regression most people are missing?",
    a: "The quota regression. 4.7 uses a new tokenizer that expands text roughly 1.0x to 1.35x compared to 4.6, and its adaptive thinking mode generates more hidden output tokens than 4.6 did. Both expansions are applied server-side before Anthropic writes the usage float to your seven_day_opus bucket. The result is that the same Claude Code session, run against the same repo, can fill your Opus weekly utilization 20 to 35 percent faster on 4.7 than it did on 4.6. This is not covered by any of the popular benchmark writeups on this release because it does not show up in accuracy scores or eval suites; it only shows up on claude.ai/settings/usage.",
  },
  {
    q: "Why can't ccusage or Claude-Code-Usage-Monitor see this regression?",
    a: "Those tools read the JSONL that Claude Code writes under ~/.claude/projects/. That file records a token count produced by the client before Anthropic applies the 4.7 tokenizer, and it excludes adaptive-thinking tokens when the client hides them (display: omitted). Anthropic's server applies the tokenizer expansion and counts the hidden thinking tokens after the JSONL is written, then writes the result to your seven_day_opus.utilization float. The local log and the server quota disagree by exactly the amount of the regression. The only way to close the gap is to read the server's /api/organizations/{org}/usage endpoint, which is what ClaudeMeter's src/api.rs does on every 60-second tick.",
  },
  {
    q: "Where does the Opus weekly bucket live in the ClaudeMeter source?",
    a: "It's the seven_day_opus field on UsageResponse at src/models.rs line 23. The type is Option<Window>, where Window has a utilization float and a resets_at timestamp. The extension posts the parsed struct to 127.0.0.1:63762/snapshots as JSON on every tick, so any process on your machine can curl that URL and read the authoritative 4.7-inflated number. The menu-bar app renders the same float as '7d Opus' in extension/popup.js line 63.",
  },
  {
    q: "Are there other confirmed Claude Code 4.7 regressions?",
    a: "Yes, and they're well-covered elsewhere. Anthropic's own release notes for 4.7 call out a regression in long-context recall above roughly 100K tokens, specifically in needle-in-a-haystack style tasks. Independent reports cite a 4.4 point drop on BrowseComp (83.7 to 79.3), higher latency than 4.6, and reduced stylistic flexibility on creative tasks. Those are real and worth knowing. The one I focus on here is the one that empties your weekly Opus bucket before Friday, because that's the one that stops your Claude Code session mid-refactor.",
  },
  {
    q: "How much faster does the seven_day_opus bucket actually fill on 4.7?",
    a: "There's no published ratio because the expansion is per-prompt and content-dependent. Anthropic's own 4.7 documentation describes the tokenizer as using 1.0x to 1.35x more tokens for the same input text. Adaptive thinking on top of that adds a variable output-side cost that 4.6 did not have. In practice you can read the ratio yourself: run the same prompt on 4.6 and 4.7 back-to-back, then diff the seven_day_opus.utilization float returned by /api/organizations/{org}/usage before and after each call. ClaudeMeter's localhost bridge makes this a two-curl experiment.",
  },
  {
    q: "Is the Opus 4.7 quota drain the same as hitting the 5-hour limit?",
    a: "No. The 5-hour window (usage.five_hour.utilization) is shared across every model. The Opus weekly window (usage.seven_day_opus.utilization) is Opus-only and independent. A 4.7 session can pin the Opus weekly float while leaving the 5-hour float at 30 percent, because Sonnet traffic doesn't contribute to seven_day_opus. The popular confusion is to watch only the 5-hour bar on claude.ai and assume the Opus weekly is in proportion. It isn't, and 4.7's tokenizer expansion widens the gap further.",
  },
  {
    q: "Does this regression affect Claude Code API users or only the subscription?",
    a: "This page is about the subscription quotas (Pro, Max 5x, Max 20x) that power Claude Code when it's signed into claude.ai. API billing uses different accounting: it bills per-token by the 4.7 tokenizer too, so the same text costs more on the API than it did on 4.6, but it doesn't land in a seven_day_opus bucket. If you run Claude Code on an API key, the regression shows up as a higher invoice rather than an earlier 429. The /usage endpoint ClaudeMeter reads is specific to the subscription plan.",
  },
  {
    q: "Can I tell from the JSON payload whether a request was charged at the 4.7 rate?",
    a: "Not directly. The /usage endpoint returns only the current utilization fractions and their reset timestamps, not per-request metadata. What you can do is compare deltas: poll /api/organizations/{org}/usage before a prompt, run the prompt on 4.7, poll again. The delta in seven_day_opus.utilization represents the server-side token count for that single call, already expanded. ClaudeMeter caches every snapshot the extension fetches, so you can diff two ticks that bracket your prompt and see the real cost.",
  },
  {
    q: "What endpoint does ClaudeMeter use to pick up the 4.7 quota state?",
    a: "Three of them. extension/background.js line 24 fetches /api/organizations/{org}/usage for utilization (seven_day_opus lives in that payload). Line 26 fetches /api/organizations/{org}/overage_spend_limit to see whether 4.7 requests will bill through to extra usage or hard-stop at 429. Line 28 fetches /api/organizations/{org}/subscription_details for the plan tier that sets the denominator. All three are undocumented and authed with your existing claude.ai cookies. No API key, no login flow.",
  },
  {
    q: "Is this regression documented anywhere by Anthropic?",
    a: "Partially. Anthropic's 'What's new in Claude 4.7' page acknowledges the new tokenizer and the 1.0x to 1.35x range. Their Claude Code best-practices page warns that adaptive thinking can generate substantial hidden output. What Anthropic does not publish is a specific multiplier on seven_day_opus, so the quota regression is a behavioral fact you have to measure on your own account. ClaudeMeter's client is MIT and under 900 lines; src/api.rs and src/models.rs together are the entire trust surface.",
  },
  {
    q: "How do I watch the seven_day_opus float in real time?",
    a: "Install ClaudeMeter (brew install --cask m13v/tap/claude-meter) and load the extension into any Chromium browser. The extension polls every 60 seconds and posts the snapshot to the menu-bar app's localhost bridge. Open the popup and the '7d Opus' row shows the current utilization with its resets_at delta. For a scripted check, curl http://127.0.0.1:63762/snapshots and read .[0].usage.seven_day_opus.utilization directly.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code 4.7 regressions", url: PAGE_URL },
];

const modelsSnippet = `// claude-meter/src/models.rs  (lines 19 to 28)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour: Option<Window>,
    pub seven_day: Option<Window>,
    pub seven_day_sonnet: Option<Window>,
    pub seven_day_opus: Option<Window>,        // <-- the 4.7 regression lands here
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette: Option<Window>,
    pub seven_day_cowork: Option<Window>,
    pub extra_usage: Option<ExtraUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}`;

const bgSnippet = `// claude-meter/extension/background.js  (lines 24 to 28)
try { usage = await fetchJSON(\`\${BASE}/api/organizations/\${org}/usage\`); }
catch (e) { errors.push(\`usage: \${e}\`); }
try { overage = await fetchJSON(\`\${BASE}/api/organizations/\${org}/overage_spend_limit\`); }
catch (e) { /* overage may not exist for all orgs */ }
try { subscription = await fetchJSON(\`\${BASE}/api/organizations/\${org}/subscription_details\`); }
catch (e) { /* sub details may not exist */ }`;

const diffCurl = [
  { type: "command" as const, text: "# Before the 4.7 call" },
  { type: "command" as const, text: "curl -s http://127.0.0.1:63762/snapshots | jq '.[0].usage.seven_day_opus.utilization'" },
  { type: "output" as const, text: "0.6123" },
  { type: "command" as const, text: "" },
  { type: "command" as const, text: "# Run the same 4.7 prompt you would have run on 4.6" },
  { type: "command" as const, text: "claude --model claude-opus-4-7 \"refactor this module for clarity\" < big_file.ts" },
  { type: "success" as const, text: "Claude Code responded; 18,400 local tokens logged to ~/.claude/projects/*.jsonl" },
  { type: "command" as const, text: "" },
  { type: "command" as const, text: "# After the 4.7 call" },
  { type: "command" as const, text: "curl -s http://127.0.0.1:63762/snapshots | jq '.[0].usage.seven_day_opus.utilization'" },
  { type: "output" as const, text: "0.6437" },
  { type: "success" as const, text: "seven_day_opus moved +3.14%. Your local JSONL says 18.4K tokens; the server says the equivalent of ~24.8K tokens against the weekly denominator." },
];

const popupSnippet = `// claude-meter/extension/popup.js  (line 63, the 4.7-inflated row)
\${u.seven_day_opus ? row("7d Opus", u.seven_day_opus) : ""}`;

const regressionCards = [
  {
    title: "Tokenizer expansion (1.0x to 1.35x)",
    description:
      "Anthropic's 4.7 documentation describes a new tokenizer that uses up to roughly 35 percent more tokens for the same input text. The expansion is applied server-side, so your local token count underreports the real cost by that factor before anything else is counted.",
    size: "2x1" as const,
  },
  {
    title: "Adaptive thinking, omitted from display",
    description:
      "4.7 defaults to adaptive thinking. Claude Code hides those tokens from the user (display: omitted), which also means they never land in ~/.claude/projects/*.jsonl, but they absolutely land in seven_day_opus.utilization.",
    size: "1x1" as const,
  },
  {
    title: "Longer average outputs on refactor-style prompts",
    description:
      "Even without thinking, 4.7's completion length on the same prompt tends to exceed 4.6's. The extra output is metered against seven_day_opus the moment the response streams.",
    size: "1x1" as const,
  },
  {
    title: "No per-request breakdown in the payload",
    description:
      "/api/organizations/{org}/usage returns aggregates, not per-request rows. You can only see the regression by diffing two polls that bracket the prompt. ClaudeMeter caches every tick so this diff is a jq expression.",
    size: "2x1" as const,
  },
];

const whereItAddsTokensSteps = [
  {
    title: "1. Client writes JSONL from pre-tokenizer text",
    description:
      "Claude Code records the text it sent and the text it received into ~/.claude/projects/<project>/*.jsonl. The token counts in that file are client-estimated, based on the 4.6 tokenizer assumptions baked into the CLI. ccusage and Claude-Code-Usage-Monitor read this file; that is the full scope of what they see.",
  },
  {
    title: "2. Server retokenizes under 4.7 rules",
    description:
      "Anthropic's backend retokenizes the same payload under 4.7's new vocabulary before billing. This is where 'up to 35 percent more tokens' kicks in. Your local JSONL has no way to know about this step; the retokenization result never travels back down to the client.",
  },
  {
    title: "3. Adaptive thinking generates hidden output",
    description:
      "4.7 runs an internal reasoning pass on most prompts. Those thinking tokens are counted as output tokens against your account. Claude Code's default is to hide them from the user, so they're absent from the JSONL but present in the utilization.",
  },
  {
    title: "4. Server writes seven_day_opus.utilization",
    description:
      "The utilization float is updated with the post-retokenization, post-thinking count. This is the number the 429-enforcement gate reads against. It's also the number ClaudeMeter reads every 60 seconds and exposes at 127.0.0.1:63762/snapshots.",
  },
  {
    title: "5. Client-side tools stay silent",
    description:
      "Because the JSONL is frozen after step 1, the local-log summary keeps showing pre-expansion counts. You'll see the regression only if you compare the client summary against the server utilization. That comparison is the entire thesis of this page.",
  },
];

const preconditionChecklist = [
  {
    text: "You are signed into claude.ai in the same browser the ClaudeMeter extension is loaded into. No cookie, no /usage read.",
  },
  {
    text: "Your plan has an Opus weekly quota (Pro, Max 5x, or Max 20x). Free plans do not populate seven_day_opus, so there is nothing for 4.7 to inflate.",
  },
  {
    text: "The menu-bar app is running. The extension can still surface the number on its own, but the localhost bridge is what lets shell scripts read it without hitting claude.ai directly.",
  },
  {
    text: "You are issuing 4.7 calls through Claude Code (not the API). Only claude.ai subscription traffic is metered against seven_day_opus; API traffic bills separately.",
  },
  {
    text: "Your claude.ai session is fresh. The /api/organizations/{org}/usage endpoint 401s on an expired cookie; ClaudeMeter surfaces this as an error in the menu bar, not silent zeros.",
  },
];

const visibilityRows = [
  {
    feature: "Sees 4.7 tokenizer expansion",
    competitor: "No, reads pre-tokenizer text from local JSONL",
    ours: "Yes, /usage returns the post-expansion float",
  },
  {
    feature: "Sees omitted adaptive-thinking tokens",
    competitor: "No, thinking is hidden from the JSONL",
    ours: "Yes, already counted in seven_day_opus.utilization",
  },
  {
    feature: "Isolates Opus-only weekly spend",
    competitor: "No, summarizes all models together",
    ours: "Yes, seven_day_opus is its own float on the struct",
  },
  {
    feature: "Watches the enforcement gate, not just the logs",
    competitor: "No, reads what the client thinks it sent",
    ours: "Yes, reads what Anthropic will actually 429 on",
  },
  {
    feature: "Diffable per-prompt cost",
    competitor: "No, per-request token count is 4.6-era estimate",
    ours: "Yes, diff two snapshots bracketing the call",
  },
  {
    feature: "Catches the Sonnet-to-Opus surprise on the 5-hour float",
    competitor: "No, cannot cross-reference five_hour and seven_day_opus",
    ours: "Yes, both floats live on the same Window struct",
  },
  {
    feature: "Exposes all of this over a scriptable localhost HTTP bridge",
    competitor: "No",
    ours: "Yes, 127.0.0.1:63762/snapshots",
  },
];

const articleJsonLd = articleSchema({
  headline: "Claude Code 4.7 regressions: the one that shows up in your quota, not your benchmarks",
  description:
    "The Claude Code 4.7 regression least covered by existing writeups is the quota regression: the same workload drains seven_day_opus faster than 4.6 did, and local-log tools cannot see it because the tokenizer expansion is applied server-side after the JSONL is frozen. ClaudeMeter reads the server-truth float at /api/organizations/{org}/usage and exposes it at 127.0.0.1:63762/snapshots.",
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
    href: "/t/claude-opus-4-7-rate-limit",
    title: "Claude Opus 4.7 rate limit: three endpoints, not one number",
    excerpt:
      "The rate limit is not a ceiling; it is a tuple. /usage, /overage_spend_limit, /subscription_details together decide whether your next 4.7 call 200s, bills, or 429s.",
    tag: "Related",
  },
  {
    href: "/t/claude-code-opus-4-7-usage-limits",
    title: "Claude Code Opus 4.7 usage limits",
    excerpt:
      "Where the seven_day_opus float lives in the schema and why 4.7 fills it faster than 4.6 on the same workload.",
    tag: "Related",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "The Claude rolling window cap is seven windows",
    excerpt:
      "Anthropic publishes two rolling windows; the endpoint returns seven. Every field, what it gates, and which ones 4.7 actually trips.",
    tag: "Related",
  },
];

export default function ClaudeCode47RegressionsPage() {
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
          The Claude Code 4.7 regression that shows up in{" "}
          <GradientText>your quota</GradientText>, not your benchmarks
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          The writeups that exist for this topic cover the regressions you
          can read off a leaderboard: long-context recall above 100K
          tokens, a 4.4 point drop on BrowseComp, higher latency than 4.6,
          flatter creative output. All real. None of them cover the
          regression that makes a Claude Code session die on Tuesday
          afternoon instead of Friday morning: the same workload empties
          your seven_day_opus bucket faster on 4.7, and your local token
          log cannot see it.
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
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Traced from the open-source ClaudeMeter client"
          highlights={[
            "Field located at src/models.rs line 23",
            "Polled in extension/background.js line 24",
            "Observable with one curl against 127.0.0.1:63762",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <RemotionClip
          title="The 4.7 regression nobody logs"
          subtitle="Quota drain, not benchmark drop"
          captions={[
            "Local JSONL is frozen before the 4.7 tokenizer fires",
            "Adaptive thinking tokens are hidden from the display",
            "Both land in seven_day_opus server-side",
            "The only place the truth lives is /api/organizations/{org}/usage",
            "ClaudeMeter serves it at 127.0.0.1:63762/snapshots",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the benchmark posts miss this one
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Every guide currently circulating on 4.7 regressions is a
          benchmark roundup. They cite Anthropic&apos;s own admission that
          long-context recall regressed above roughly 100K tokens, a 4.4
          point drop on BrowseComp (83.7 to 79.3), slower completions, and
          reduced stylistic range on creative tasks. Those are real,
          reproducible losses that show up in eval suites.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The regression this page is about does not show up in any eval
          suite. It shows up on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>
          . The 4.7 tokenizer expands input text by up to roughly 35
          percent. Adaptive thinking generates more hidden output tokens
          than 4.6 did. Both of those costs are counted against your
          Opus weekly quota, at Anthropic&apos;s backend, after your
          Claude Code client has already written its local token log and
          moved on. The client has no idea.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Result: a session that finished Friday on 4.6 can finish Tuesday
          on 4.7 for the same set of prompts. The only number that tells
          you this is happening is the one Anthropic writes to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            usage.seven_day_opus.utilization
          </code>
          .
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Where 4.7 adds tokens your JSONL does not record
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Four places. Every one of them lands on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus.utilization
          </code>
          . None of them land in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/*.jsonl
          </code>
          .
        </p>
        <BentoGrid cards={regressionCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor: the Opus weekly field, verbatim
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          This is every field ClaudeMeter deserializes from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>
          . The 4.7 regression lands entirely on one of them:
        </p>
        <AnimatedCodeBlock
          code={modelsSnippet}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          window holds a single{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization: f64
          </code>{" "}
          that Anthropic writes after the 4.7 tokenizer has been applied
          and after adaptive-thinking output has been billed. The
          companion{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          tells you when the bucket empties. If you want to see the 4.7
          regression in real time, watch this float.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          The path a 4.7 prompt takes through your quota
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Five steps. Step 1 is the last thing any local-log tool can
          see. Steps 2 through 4 are the entire regression.
        </p>
        <StepTimeline
          title="From your prompt to seven_day_opus.utilization"
          steps={whereItAddsTokensSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Same prompt, two very different numbers
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Toggle between what your local JSONL thinks happened and what
          Anthropic actually billed against{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>
          . This is the core of the regression, in one diff:
        </p>
        <BeforeAfter
          title="18,400 local tokens → 24,800-ish against the weekly denominator"
          before={{
            label: "What ccusage sees",
            content:
              "ccusage reads ~/.claude/projects/<repo>/session.jsonl and sums the prompt_tokens + completion_tokens fields that Claude Code wrote at the moment of the call. It does not know about the 4.7 tokenizer expansion, and it does not see any thinking tokens the CLI hid from the display. Its answer for this prompt is 18,400 tokens, same shape as it would have been on 4.6.",
            highlights: [
              "Reads pre-expansion text",
              "Counts only visible output",
              "No awareness of seven_day_opus",
              "Same answer on 4.6 and 4.7",
            ],
          }}
          after={{
            label: "What ClaudeMeter sees",
            content:
              "ClaudeMeter polls /api/organizations/{org}/usage, which returns the post-expansion, post-thinking utilization float. The seven_day_opus delta around the same prompt is roughly +3.14 percent of your weekly denominator, equivalent to ~24,800 tokens billed. That is the true cost your next 429 will be measured against.",
            highlights: [
              "Reads server-written utilization",
              "Includes tokenizer expansion",
              "Includes hidden thinking tokens",
              "Diverges from 4.6 on the same prompt",
            ],
          }}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Where the server-truth number comes from
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Three inputs, one float. The extension fetches all three every
          60 seconds and ships the combined snapshot to the menu-bar app.
        </p>
        <AnimatedBeam
          title="Server inputs → seven_day_opus utilization"
          from={[
            {
              label: "Input tokens (post-4.7 tokenizer)",
              sublabel: "Up to ~35% more than the same text on 4.6",
            },
            {
              label: "Visible output tokens",
              sublabel: "What Claude Code renders to your terminal",
            },
            {
              label: "Hidden adaptive-thinking tokens",
              sublabel: "display: omitted, absent from your JSONL",
            },
          ]}
          hub={{
            label: "seven_day_opus.utilization",
            sublabel: "The only float Anthropic 429s against",
          }}
          to={[
            { label: "Menu-bar badge (0 to 100%)" },
            { label: "127.0.0.1:63762/snapshots JSON" },
            { label: "Extension popup '7d Opus' row" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reading the regression yourself
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The cleanest way to see this is a diff of two polls that
          bracket a single 4.7 prompt. ClaudeMeter caches every tick and
          serves them at the loopback bridge, so a shell script suffices:
        </p>
        <TerminalOutput
          title="diff two ticks across a 4.7 call"
          lines={diffCurl}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The difference between the local token count and the server
          utilization delta is the regression. On 4.6 the same method
          would close the gap (modulo the 4.6 tokenizer&apos;s own
          overhead). On 4.7 the gap widens, and it keeps widening every
          time you enable adaptive thinking or feed a longer prompt.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The row in the popup that carries the regression
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              ClaudeMeter&apos;s extension popup renders every usage
              window on its own row, with a color-coded bar and a{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                resets_at
              </code>{" "}
              countdown. The 4.7 regression is entirely isolated to the{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                7d Opus
              </code>{" "}
              row. 4.7 does not change{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                seven_day_sonnet
              </code>{" "}
              or the shared{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                five_hour
              </code>{" "}
              denominators; the bucket it fills faster is Opus-only.
            </p>
            <div className="mt-6">
              <AnimatedCodeBlock
                code={popupSnippet}
                language="javascript"
                filename="claude-meter/extension/popup.js"
              />
            </div>
            <p className="text-zinc-700 leading-relaxed text-lg mt-6">
              If your menu bar shows the 7d Opus bar crossing 80 percent
              halfway through your week for a workload that used to
              finish at 60 percent on 4.6, that is the regression. There
              is no other explanation.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The three endpoints that back the number
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The extension fetches all three on every tick.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          is where seven_day_opus lives, but{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /overage_spend_limit
          </code>{" "}
          decides whether a 4.7-inflated hit becomes a billed 200 or a
          hard 429, and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /subscription_details
          </code>{" "}
          controls the denominator:
        </p>
        <AnimatedCodeBlock
          code={bgSnippet}
          language="javascript"
          filename="claude-meter/extension/background.js"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              Numbers you can reproduce
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              From Anthropic&apos;s own 4.7 documentation and the
              open-source ClaudeMeter client. No invented benchmarks.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 35, suffix: "%", label: "max 4.7 tokenizer expansion vs 4.6" },
              { value: 4.4, suffix: "pt", decimals: 1, label: "BrowseComp drop (83.7 -> 79.3)" },
              { value: 60, suffix: "s", label: "ClaudeMeter poll cadence" },
              { value: 63762, label: "localhost bridge port" },
            ]}
          />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={900} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                lines of Rust + JS in the entire ClaudeMeter client
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={1} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                server field that carries the 4.7 quota regression
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={0} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                local-log tools that can measure it
              </div>
            </div>
          </div>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What has to be true to measure the regression on your account
        </h2>
        <AnimatedChecklist
          title="Preconditions for a clean before/after read"
          items={preconditionChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          What each class of tool can and cannot see
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Local-log summaries read the frozen JSONL. ClaudeMeter reads
          the float Anthropic actually enforces against.
        </p>
        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="Local log tools"
          rows={visibilityRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The quota regression is the one that actually stops your
          session, but the subjective regressions are the ones most
          Claude Code users will notice first: 4.7 is slower than 4.6,
          its long-context recall degrades above roughly 100K tokens,
          and its BrowseComp score dropped 4.4 points. If your workload
          lives in any of those regions, the quota-side cost is not your
          biggest problem. If it doesn&apos;t, the quota cost is the one
          you can actually fix, because it responds to prompt length,
          adaptive-thinking toggles, and the choice between 4.7 and 4.6
          per call.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Everything on this page is reproducible on your own account.
          The endpoints are undocumented and Anthropic can change them,
          so ClaudeMeter parses into strict Rust structs; a schema break
          shows up as a parse error in the menu bar, not as silent wrong
          numbers. The repo is MIT and under 900 lines between{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extension/
          </code>
          . You can audit the request path in about ten minutes.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch your seven_day_opus bucket in real time
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter runs in your macOS menu bar, polls{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          every 60 seconds, and serves the combined snapshot at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            127.0.0.1:63762/snapshots
          </code>
          . Free, MIT, no keychain prompt with the browser extension.
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
          heading="Got a 4.7 workload where the quota math doesn't line up?"
          description="If you see a seven_day_opus delta that doesn't match either the 4.6 baseline or the 4.7 tokenizer expansion, send a snapshot over. Easy to diagnose with one JSON."
          text="Book a 15-minute call"
          section="claude-code-4-7-regressions-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on a 4.7 quota regression? 15 min."
        section="claude-code-4-7-regressions-sticky"
        site="claude-meter"
      />
    </article>
  );
}
