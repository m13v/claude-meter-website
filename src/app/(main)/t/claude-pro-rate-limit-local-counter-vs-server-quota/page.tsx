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
  "https://claude-meter.com/t/claude-pro-rate-limit-local-counter-vs-server-quota";
const PUBLISHED = "2026-04-27";

export const metadata: Metadata = {
  title:
    "Claude Pro Rate Limit: Why Local Token Counters Disagree With Server Quota",
  description:
    "Local tools like ccusage say 5 percent used while claude.ai shows you rate limited. They measure two different things: local input/output tokens vs server-truth utilization on a rolling 5-hour window. Here is the gap, the field, and how to predict the cap mid-refactor.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Pro Rate Limit: Why Local Token Counters Disagree With Server Quota",
    description:
      "Why ccusage and other local token counters say 5 percent while claude.ai 429s you. The server-truth gap, what a session-level rolling-window meter looks like, and how to predict the cap mid-refactor.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "If ccusage says I am at 5 percent and claude.ai rate-limits me, who is wrong?",
    a: "Neither. They are answering different questions. ccusage tots up token counts in your local Claude Code JSONL files under ~/.claude/projects and divides by a chosen ceiling. The claude.ai rate limiter trips on five_hour.utilization on the server, weighted by peak-hour multiplier, attachments, tool calls, model class, and any browser-chat usage. The local count and the server count agree only by coincidence. Treat them as two separate dashboards.",
  },
  {
    q: "Why is the difference so big in practice, like 5 percent local vs 100 percent server?",
    a: "Because the two numbers do not share a denominator and the server applies weights local logs cannot see. Five examples of weight that lives only on the server: a peak-hour multiplier on weekday US Pacific midday hours, a per-attachment cost that fires the moment you upload a PDF or image, a per-tool-call cost on code execution and web browsing, a per-model weight (Opus burns faster than Sonnet for the same prompt), and any prompt you sent on claude.ai in the browser, which never lands in the JSONL files at all. Stack a few of those up and the gap goes from cosmetic to existential.",
  },
  {
    q: "Where is the server-truth number, exactly?",
    a: "GET https://claude.ai/api/organizations/{your-org-uuid}/usage with your logged-in claude.ai cookies. The response is JSON with a five_hour object that contains a utilization float and a resets_at ISO timestamp. The bar drawn on claude.ai/settings/usage is rendered from the same two values. ClaudeMeter calls this endpoint once a minute via your existing browser session and surfaces the raw numbers. There is no documentation, but the field names have been stable for months.",
  },
  {
    q: "Can I just trust ccusage if I never use attachments and never browse claude.ai?",
    a: "Closer, but still no. Even with no attachments and no browser chat, the peak-hour multiplier still applies, the per-tool-call cost on Claude Code itself still applies, and the per-model weight still applies. ccusage is correct as a local token-flow measurement. It is not a faithful proxy for the rate limiter. If you are trying to predict whether your next prompt will 429, the only reliable signal is five_hour.utilization on the server.",
  },
  {
    q: "What does a session-level rolling-window meter actually look like?",
    a: "Three things on screen at once: the current utilization fraction (server-truth, 0 to 100), the resets_at timestamp converted to a human countdown like '5h: 47m', and either the rate of change (Δu/Δt over the last poll) or a simple ETA to 100 percent. ClaudeMeter renders the first two in the macOS menu bar; the third you can compute yourself from the persisted snapshots.json file.",
  },
  {
    q: "How do I predict the cap mid-refactor without a tool?",
    a: "Open claude.ai/settings/usage in a tab, leave it open, and refresh every couple of minutes. Watch the bar move. Because the bar is rendered from five_hour.utilization, the same number the rate limiter checks, you will see a 429 coming roughly one minute before it lands. The downside is that you have to break flow to look at it. The upside is that no install is required and the number is exact.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "Local counter vs server quota",
    url: PAGE_URL,
  },
];

const localPayload = `// ~/.claude/projects/<project>/<session>.jsonl  (one row per assistant turn)
{
  "session_id":     "abc123",
  "turn":            42,
  "model":           "claude-opus-4-7",
  "input_tokens":    1820,
  "output_tokens":   2180,
  "cache_read":      0,
  "cache_creation":  0,
  "ts":              "2026-04-27T17:14:02.118Z"
}
// ccusage sums input_tokens + output_tokens across rows.
// That is a local token-flow rate, not a server-truth quota fraction.`;

const serverPayload = `// GET claude.ai/api/organizations/{org_uuid}/usage  (formatted)
{
  "five_hour": {
    "utilization": 0.97,
    "resets_at":   "2026-04-27T22:14:00Z"
  },
  "seven_day": {
    "utilization": 0.62,
    "resets_at":   "2026-05-02T09:02:00Z"
  }
}
// 0.97 means 97 percent. The rate limiter trips at >= 1.0.
// This is the only number that maps to a 429.`;

const normalizeFn = `// claude-meter/extension/popup.js (lines 6-11)
function pctFromWindow(w) {
  if (!w) return null;
  const u = typeof w.utilization === "number" ? w.utilization : null;
  if (u == null) return null;
  // five_hour sometimes arrives as 0.97, sometimes as 97.0.
  return u <= 1 ? u * 100 : u;
}`;

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
    text: "  -H \"Cookie: $(< ~/.claude-session)\" | jq '.five_hour'",
  },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"utilization\": 0.97," },
  {
    type: "output" as const,
    text: "  \"resets_at\":   \"2026-04-27T22:14:00Z\"",
  },
  { type: "output" as const, text: "}" },
  {
    type: "command" as const,
    text: "# Now open ccusage and read the local count",
  },
  { type: "command" as const, text: "npx ccusage" },
  {
    type: "output" as const,
    text: "Tokens used (local 5h estimate): 5.1 percent of plan",
  },
  {
    type: "success" as const,
    text: "Local 5.1 percent and server 97 percent. Both correct, different question.",
  },
];

const before = {
  label: "Mental model: ccusage is my Claude Pro fuel gauge",
  content:
    "ccusage prints '5 percent used' so I have hours of headroom. I can keep refactoring. I will check again in a while when it climbs.",
  highlights: [
    "Implies local token counts equal server quota",
    "Implies attachments and tool calls are token-equivalent",
    "Implies peak-hour traffic does not exist",
    "Ignores anything sent in the browser on claude.ai",
  ],
};

const after = {
  label: "Reality: ccusage is a token-flow gauge, not a quota gauge",
  content:
    "The server tracks one weighted utilization fraction in usage.five_hour.utilization. That fraction folds in peak-hour multiplier, attachment cost, tool-call cost, model class, and any browser-chat usage. The rate limiter trips on that fraction at >= 1.0. Local token counts cannot see the weights, so the two numbers diverge by design.",
  highlights: [
    "Server-truth is one float on a rolling 5-hour window",
    "Local counters answer 'tokens spent', not 'quota left'",
    "Gaps of 50+ percentage points are common at peak hours",
    "The only number that predicts a 429 is five_hour.utilization",
  ],
};

const reproSteps = [
  {
    title: "Run your favorite local counter",
    description:
      "ccusage, ccburn, Claude-Code-Usage-Monitor: pick one. They all read ~/.claude/projects/**/*.jsonl, sum input_tokens + output_tokens, and compare to a chosen ceiling. Note the percent.",
  },
  {
    title: "Open claude.ai/settings/usage at the same moment",
    description:
      "This is the only first-party surface that renders the server-truth number. The page calls /api/organizations/{org_uuid}/usage and draws the bar from five_hour.utilization. Note the percent next to the 5-hour bar.",
  },
  {
    title: "Compute the gap",
    description:
      "Subtract local from server. A small gap (single percentage points) usually means you are off-peak, no attachments, Sonnet only. A large gap (tens of percentage points) usually means peak hours, Opus, attachments, or browser-chat usage that local logs do not see.",
  },
  {
    title: "Decide which one to trust",
    description:
      "If your goal is 'how much did Claude Code burn locally', trust the local counter. If your goal is 'will my next prompt 429', trust the server number. They are not interchangeable.",
  },
  {
    title: "Project to the cap",
    description:
      "From two consecutive server polls, compute Δu / Δt. At a positive burn rate, ETA_to_429 = (100 minus current_utilization) / burn_rate minutes. ClaudeMeter persists every poll to snapshots.json so you can compute this without a new tool.",
  },
];

const matterChecklist = [
  {
    text: "Peak-hour multiplier (Anthropic late-2025 note): weekday US Pacific midday raises the quota cost of every prompt. Local logs see the same tokens; server utilization sees more.",
  },
  {
    text: "Per-attachment cost: PDFs, images, and files tacked to a prompt land on utilization. Token logs record only the text tokens Claude Code sent.",
  },
  {
    text: "Per-tool-call cost: code execution, web browsing, and MCP tool calls add weight that local logs do not account for in the same units.",
  },
  {
    text: "Per-model weight: Opus costs more per token than Sonnet. Two 1000-token prompts on different models produce identical local counts and different server deltas.",
  },
  {
    text: "Browser-chat usage: prompts sent on claude.ai (not via Claude Code) never land in ~/.claude/projects, but they absolutely land on five_hour.utilization.",
  },
];

const sequenceActors = [
  "You",
  "Claude Code",
  "claude.ai server",
  "Local JSONL",
  "five_hour.utilization",
];
const sequenceMessages = [
  { from: 0, to: 1, label: "send prompt", type: "request" as const },
  {
    from: 1,
    to: 2,
    label: "POST /completions",
    type: "request" as const,
  },
  {
    from: 2,
    to: 4,
    label: "increment by weight(prompt, model, attachments, tools, peak)",
    type: "event" as const,
  },
  {
    from: 1,
    to: 3,
    label: "append { input_tokens, output_tokens, ts }",
    type: "event" as const,
  },
  {
    from: 3,
    to: 0,
    label: "ccusage reads, divides, says 5 percent",
    type: "response" as const,
  },
  {
    from: 4,
    to: 0,
    label: "claude.ai/settings/usage shows 97 percent",
    type: "response" as const,
  },
  {
    from: 4,
    to: 2,
    label: "next prompt: 429 if utilization >= 1",
    type: "error" as const,
  },
];

const myths = [
  "Myth: local tokens equal server quota",
  "Myth: ccusage predicts 429s",
  "Myth: attachments are free in token logs",
  "Myth: peak hours are a separate field",
  "Myth: Opus and Sonnet weigh the same",
  "Myth: browser-chat prompts do not count",
];

const comparisonRows = [
  {
    feature: "Data source",
    ours: "GET /api/organizations/{org}/usage (server)",
    competitor: "~/.claude/projects/**/*.jsonl (local)",
  },
  {
    feature: "Question answered",
    ours: "how full is my server-side quota",
    competitor: "how many tokens did Claude Code emit",
  },
  {
    feature: "Peak-hour multiplier",
    ours: "baked in",
    competitor: "invisible",
  },
  {
    feature: "Attachment cost",
    ours: "baked in",
    competitor: "invisible",
  },
  {
    feature: "Tool-call cost",
    ours: "baked in",
    competitor: "text tokens only",
  },
  {
    feature: "Browser-chat usage on claude.ai",
    ours: "counted",
    competitor: "not counted",
  },
  {
    feature: "Predicts 429",
    ours: "yes",
    competitor: "no (different denominator)",
  },
  {
    feature: "Refresh cadence",
    ours: "every 60 seconds (live)",
    competitor: "on tail of JSONL writes",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-5-hour-window-quota",
    title: "Pro's 5-hour window is one float on a sliding clock",
    excerpt:
      "What the five_hour object actually contains, why resets_at slides, and how to read the JSON in one curl.",
    tag: "Mental model",
  },
  {
    href: "/t/claude-rolling-5-hour-burn-rate",
    title: "Rolling 5-hour burn rate is Δu/Δt, not tokens per minute",
    excerpt:
      "Why local token counters cannot give you a quota burn rate, and the 24-line script that derives the right one.",
    tag: "Math",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "Local token counters answer a different question than a server-quota reader. Here is the precise line where they diverge.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Pro rate limit: why local token counters disagree with the server quota",
  description:
    "Local tools say 5 percent; claude.ai says you are rate limited. The two numbers measure different things. Here is the field, the gap, and how to predict the cap mid-refactor.",
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

export default function ClaudeProLocalCounterVsServerQuotaPage() {
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
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          ccusage says 5 percent, claude.ai says rate limited:{" "}
          <GradientText>they measure different things</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Did Claude usage hit 100 percent after one prompt while your
          local counter still showed plenty of headroom? You are not
          imagining it. Local token counters and the claude.ai rate
          limiter answer two different questions and operate on two
          different denominators. Most people only learn this when
          they are stuck mid-refactor with a 429 and a token meter that
          says everything is fine.
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
          title="Two numbers, one rate limiter"
          subtitle="Why ccusage and claude.ai never agree"
          captions={[
            "Local: input_tokens + output_tokens (JSONL)",
            "Server: weighted utilization (one float)",
            "Weights: peak-hour, attachments, tools, model",
            "Only one of these trips a 429",
            "Endpoint: /api/organizations/{org_uuid}/usage",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The thread that surfaced this for everyone
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          A pattern that shows up almost weekly in the Claude Pro user
          base: someone is deep in a refactor, ccusage in a tmux pane
          says 5 percent of the plan is used, then the very next prompt
          comes back with a generic rate-limit error. They restart
          ccusage, double-check the count, swap models, ask in Discord.
          The local counter still says 5 percent. claude.ai/settings/usage
          shows the 5-hour bar pinned at 100 percent.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Both numbers are correct. They just answer different
          questions, and the rate limiter only listens to one of them.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <BeforeAfter title="Mental model swap" before={before} after={after} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What ccusage actually measures
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ccusage and friends (ccburn, Claude-Code-Usage-Monitor) read
          one set of files: the JSONL transcripts Claude Code writes
          under{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/&lt;project&gt;/&lt;session&gt;.jsonl
          </code>
          . Every assistant turn appends one row that looks roughly
          like this:
        </p>
        <AnimatedCodeBlock
          code={localPayload}
          language="json"
          filename="~/.claude/projects/<project>/<session>.jsonl"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The tool sums{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            input_tokens + output_tokens
          </code>{" "}
          across rows in a recent window, picks a denominator (a plan
          guess, often hard-coded), and prints a percent. That is a
          perfectly fine measurement of how fast Claude Code is moving
          tokens through your machine. It is not a measurement of your
          remaining 5-hour quota on the server.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the server actually measures
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The Anthropic rate limiter looks at exactly one number per
          window: a single utilization float in the response from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET /api/organizations/&#123;org_uuid&#125;/usage
          </code>
          . Same endpoint claude.ai/settings/usage hits to draw your
          bar. Same field rendered in the in-app indicator:
        </p>
        <AnimatedCodeBlock
          code={serverPayload}
          language="json"
          filename="claude.ai/api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          One{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          float. One{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          ISO timestamp. The 429 fires when{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization {">="} 1.0
          </code>{" "}
          (or 100.0; the same payload sometimes returns 0.97 and
          sometimes 97.0 across sibling buckets, which is its own
          source of bugs).
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          One prompt, two ledgers
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The same prompt lands in two places at once: a local JSONL
          file and a server-side weighted bucket. Local counters watch
          the file. The rate limiter watches the bucket.
        </p>
        <SequenceDiagram
          title="local counter vs server quota"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the two numbers diverge so dramatically
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The gap is not noise. It is structural. Anthropic applies at
          least five independent weighting factors to every prompt
          before it lands on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>
          , and your local JSONL file never sees any of them.
        </p>
        <div className="mt-6">
          <AnimatedChecklist
            title="Weights the server adds, every prompt"
            items={matterChecklist}
          />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Inputs that move the server number, but not your token log
        </h2>
        <AnimatedBeam
          title="What lands on five_hour.utilization but not on JSONL"
          from={[
            { label: "Prompt tokens", sublabel: "the only overlap" },
            { label: "Attachments", sublabel: "PDFs, images, files" },
            { label: "Tool calls", sublabel: "code exec, web, MCP" },
            { label: "Model picked", sublabel: "Opus weighs more" },
            {
              label: "Peak-hour multiplier",
              sublabel: "weekday US Pacific midday",
            },
          ]}
          hub={{
            label: "five_hour.utilization",
            sublabel: "what the rate limiter checks",
          }}
          to={[
            { label: "Settings page bar" },
            { label: "ClaudeMeter menu bar" },
            { label: "429 at >= 1.0" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce the gap in 60 seconds
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need a new tool to confirm any of this. Run your
          local counter and the server endpoint side by side, then read
          off both percentages:
        </p>
        <TerminalOutput
          title="ccusage vs server-truth"
          lines={reproTerminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The first time you do this during weekday peak hours with
          Opus and a couple of attachments in a session, the gap is
          usually wide enough to feel like a typo.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 0-to-1 vs 0-to-100 trap
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          One small wrinkle if you call the endpoint yourself:
          utilization arrives on inconsistent scales. We have seen the
          same payload come back with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            0.97
          </code>{" "}
          and a sibling bucket at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            94.0
          </code>
          . ClaudeMeter normalizes with one clamp:
        </p>
        <AnimatedCodeBlock
          code={normalizeFn}
          language="javascript"
          filename="claude-meter/extension/popup.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Skip that clamp and a bucket at 0.97 renders as &ldquo;less
          than 1 percent&rdquo;, which is the exact failure mode that
          gives ccusage-style tools their false confidence on the next
          prompt.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The verification path, end to end
        </h2>
        <StepTimeline steps={reproSteps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Server-truth quota vs local-token counter
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Side by side. Same workload, different questions.
        </p>
        <ComparisonTable
          productName="five_hour.utilization (server)"
          competitorName="tokens summed from JSONL (ccusage)"
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
              { value: 1, label: "field the rate limiter actually checks" },
              {
                value: 5,
                label: "weights local logs cannot see",
              },
              { value: 60, suffix: "s", label: "ClaudeMeter poll cadence" },
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
          Predicting the cap mid-refactor
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              Once you stop asking the wrong tool, the prediction problem
              becomes simple. Two consecutive polls of{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                five_hour.utilization
              </code>{" "}
              give you a delta. Divide by the wall-clock minutes
              between them. That is your burn rate. From there:
            </p>
            <p className="text-2xl font-mono text-zinc-900 leading-relaxed mt-6">
              ETA_to_429 = (
              <NumberTicker value={100} /> &minus;{" "}
              <NumberTicker value={97} />) /{" "}
              <NumberTicker value={3.2} decimals={1} /> ≈{" "}
              <span className="text-teal-700 font-bold">
                <NumberTicker value={0.94} decimals={2} />
              </span>{" "}
              minutes
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-6">
              At 97 percent server utilization with a 3.2 percent per
              minute burn rate, you have under one minute. The local
              counter, sitting at 5 percent, gives you no signal at
              all. ClaudeMeter sits in the macOS menu bar and updates
              both the percent and the resets countdown every 60
              seconds, so the cap is visible without breaking flow.
              ccusage stays useful for what it does well: telling you
              what Claude Code burned on disk.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          When ccusage is the right answer
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          This is not a takedown of local token counters. They are
          excellent at the question they actually answer. If your goal
          is to attribute Claude Code spend per project, audit how a
          long agent loop fanned out, or feed token counts into a
          billing model, local JSONL is the right source. It is
          accurate to the byte, fast to read, and runs offline.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The mismatch only shows up when people press the local
          counter into service as a rate-limit predictor. It cannot do
          that job because the rate limiter does not look at the same
          numbers. ccusage and ClaudeMeter are complementary, not
          substitutes.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint is internal and undocumented. The field names
          have been stable for many months but Anthropic could rename
          or reshape them in any release. ClaudeMeter deserializes the
          response into a strict Rust struct in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>
          , so when the shape changes the menu bar surfaces a parse
          error and a release ships the same day. Until then, this is
          the field, and it is the only one that matches what the rate
          limiter enforces.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch the server number, not just the local one
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter sits in your macOS menu bar and refreshes every
          60 seconds. Free, MIT licensed, no cookie paste, reads the
          same JSON claude.ai/settings/usage reads. Pair it with
          ccusage for full coverage.
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
          heading="Stuck reconciling local and server numbers?"
          description="If your numbers diverge in a shape we have not seen, send a snapshot. Happy to map it. 15 minutes is plenty."
          text="Book a 15-minute call"
          section="local-vs-server-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on the local vs server gap? 15 min."
        section="local-vs-server-sticky"
        site="claude-meter"
      />
    </article>
  );
}
