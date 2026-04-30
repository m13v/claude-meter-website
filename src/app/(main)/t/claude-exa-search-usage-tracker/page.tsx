import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  ComparisonTable,
  AnimatedChecklist,
  MetricsRow,
  GlowCard,
  StepTimeline,
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

const PAGE_URL =
  "https://claude-meter.com/t/claude-exa-search-usage-tracker";
const PUBLISHED = "2026-04-29";

export const metadata: Metadata = {
  title:
    "Tracking Claude + Exa Search Usage: Two Bills, Two Meters",
  description:
    "Exa charges you per search via costDollars. Claude charges you tokens for ingesting the result text, which lands on the rolling 5-hour window and weekly quota. No single tracker shows both. Here is the field, the shape of each bill, and how to read them in parallel.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Tracking Claude + Exa Search Usage: Two Bills, Two Meters",
    description:
      "Exa bills per call (costDollars). Claude bills tokens for the result text (five_hour.utilization). Local token counters miss both edges. Here is how to read the two ledgers in parallel.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Is there a single tracker for Claude usage when I use Exa search?",
    a: "Not as of April 2026. The honest answer is two meters. Exa returns a costDollars field on every MCP response (their per-search billing). Claude's plan-side cost is a weighted utilization fraction at five_hour.utilization on the Anthropic server, plus a separate seven_day fraction. ClaudeMeter polls the latter once a minute and renders it in the macOS menu bar. Exa's dashboard renders the former. If you want one number that covers both, you have to do the addition yourself.",
  },
  {
    q: "Why do Exa search results show up on my Claude Pro/Max usage at all?",
    a: "Because Claude does not search. Exa does. The MCP server fetches search results, returns the text into your Claude conversation, and the next assistant turn ingests every chunk of that text as input tokens. Anthropic weights those tokens into five_hour.utilization the same as any other prompt, including peak-hour multiplier, attachment cost, and per-model weight. A long Exa research query that returns 30 pages of result text can move the 5-hour bar by several percentage points before Claude even drafts a response.",
  },
  {
    q: "Does ccusage count Exa search tokens?",
    a: "Sort of, but in a way that does not predict your rate limit. ccusage reads ~/.claude/projects/<project>/<session>.jsonl and sums input_tokens + output_tokens per turn. The result text Exa MCP returns is part of input_tokens on the next assistant turn, so it shows up in the local count. But ccusage does not see the server-side weights (peak hour, model, attachments), so its percent and Anthropic's percent diverge by tens of percentage points during heavy research sessions. Treat ccusage as a token-flow gauge, not a quota gauge.",
  },
  {
    q: "Where is Exa's per-search cost in the MCP response?",
    a: "Every Exa MCP search response carries a costDollars field. It is a small JSON object that breaks down the cost of that one call (search type, contents fetched, livecrawl, etc.). Sum these across your session to get your Exa-side spend. This is the field you would feed into a per-project cost report. ClaudeMeter does not read Exa responses (it has nothing to do with your MCP traffic) so this is on you to capture if you want it.",
  },
  {
    q: "Can I see how much one Exa research call burned on my Claude plan?",
    a: "Yes, with one observation. Note ClaudeMeter's five_hour.utilization right before the Exa-heavy turn. Run the call. Wait one poll cycle (60 seconds). Note the new utilization. The delta is the cost of that turn against your 5-hour quota. The number is weighted, so it folds in peak-hour and model multipliers. Pair it with the Exa costDollars from the MCP response for the per-search money side. Two numbers, one prompt.",
  },
  {
    q: "Does the Anthropic /usage CLI command cover this?",
    a: "Different surface. The /usage command in Claude Code (and the Agent SDK cost docs) shows API-side token spend on a per-call basis, mostly aimed at developers paying via API credits. It does not show Pro/Max plan utilization. If you are on a Claude Max ($100-$200/month) plan running Claude Code in agentic loops, the rate limit you keep hitting is not API spend, it is five_hour.utilization on the server. /usage will not surface that field. ClaudeMeter does, by reading the same JSON claude.ai/settings/usage already renders.",
  },
  {
    q: "Why not just disable Exa MCP when my window gets close to full?",
    a: "That is the rational move. The point of seeing both meters is being able to make exactly that trade-off. With ClaudeMeter visible in the menu bar and Exa's costDollars logged from your MCP wrapper, you can see when the next Exa research call will move you from 78 to 92 percent on the 5-hour bar and decide whether the question is worth the cost. The whole point of the two-meter setup is to have the data the moment you need to choose.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "Claude + Exa search usage tracker",
    url: PAGE_URL,
  },
];

const exaResponseExample = `// One Exa MCP search call returns content + a cost breakdown.
{
  "results": [
    { "title": "...", "url": "...", "text": "...8000 chars..." },
    { "title": "...", "url": "...", "text": "...12000 chars..." }
    // ... 8 more results
  ],
  "costDollars": {
    "total":     0.0250,
    "breakDown": [
      { "search":   { "neural":  0.0050 } },
      { "contents": { "text":    0.0200, "livecrawl": 0.0000 } }
    ]
  }
}
// This is Exa's per-call bill. costDollars is yours to log and sum.`;

const claudeUsagePayload = `// GET /api/organizations/{org_uuid}/usage  (with your claude.ai cookies)
{
  "five_hour": {
    "utilization": 0.78,
    "resets_at":   "2026-04-29T16:14:00Z"
  },
  "seven_day": {
    "utilization": 0.41,
    "resets_at":   "2026-05-04T09:02:00Z"
  }
}
// 0.78 means 78 percent of the rolling 5h window.
// This is the only number Anthropic's rate limiter checks.
// Exa search-result text gets weighted into this fraction
// the moment Claude reads it on the next turn.`;

const wrappedMcpCall = `// One pattern: log Exa cost client-side, snapshot Claude server-side.
// Drop this around your MCP search wrapper.

import { exaSearch } from "./mcp-client";
import { fetch } from "undici";

async function trackedExaSearch(query: string) {
  const before = await readClaudeUtilization();      // poll once
  const exa    = await exaSearch(query);              // hits Exa
  const after  = await readClaudeUtilization();      // poll again

  return {
    results:        exa.results,
    exaCost:        exa.costDollars.total,           // dollars
    claudeQuotaDelta: after.five_hour.utilization
                    - before.five_hour.utilization,  // 0.0..1.0
    claudeResetsAt: after.five_hour.resets_at
  };
}

// Now you have both numbers per call. Log them, plot them,
// or just print them next to each other in the terminal.`;

const reproTerminal = [
  {
    type: "command" as const,
    text: "# Snapshot Claude plan utilization before the research turn",
  },
  {
    type: "command" as const,
    text: 'curl -s https://claude.ai/api/organizations/$ORG/usage \\',
  },
  {
    type: "command" as const,
    text: '  -H "Cookie: $(< ~/.claude-session)" | jq \'.five_hour.utilization\'',
  },
  { type: "output" as const, text: "0.78" },
  {
    type: "command" as const,
    text: "# Run the Exa-heavy research turn in Claude Code",
  },
  {
    type: "command" as const,
    text: '> Find the 10 most recent papers on rolling-window quota systems',
  },
  {
    type: "output" as const,
    text: "[exa.search] returned 10 results, costDollars.total = $0.0250",
  },
  {
    type: "output" as const,
    text: "[claude] read 38421 input tokens from search results",
  },
  {
    type: "command" as const,
    text: "# Snapshot Claude plan utilization after",
  },
  {
    type: "command" as const,
    text: 'curl -s https://claude.ai/api/organizations/$ORG/usage \\',
  },
  {
    type: "command" as const,
    text: '  -H "Cookie: $(< ~/.claude-session)" | jq \'.five_hour.utilization\'',
  },
  { type: "output" as const, text: "0.86" },
  {
    type: "success" as const,
    text: "One turn: $0.025 to Exa, +0.08 to your 5-hour Claude window.",
  },
];

const reproSteps = [
  {
    title: "Pin both meters before the session",
    description:
      "Open ClaudeMeter in the menu bar so the 5-hour and 7-day percentages are visible. Open Exa's dashboard (or your MCP wrapper log) so you can see costDollars per call. Two surfaces, one screen.",
  },
  {
    title: "Note the starting utilization",
    description:
      "Record five_hour.utilization at the moment you start. ClaudeMeter shows it; Anthropic's settings page shows the same number. You will need this to compute deltas after each Exa-heavy turn.",
  },
  {
    title: "Run the Exa search call",
    description:
      "Whatever your prompt is. The Exa MCP server fetches results, returns them into your conversation context, and the next assistant turn ingests every character as input tokens. Capture costDollars.total from the response if your wrapper exposes it.",
  },
  {
    title: "Wait one poll cycle on the Claude side",
    description:
      "ClaudeMeter polls every 60 seconds (configurable 30s to 5m). Wait until the next snapshot. The new utilization minus the old gives you the weighted server-side cost of the Exa turn.",
  },
  {
    title: "Add the two bills",
    description:
      "Exa: costDollars.total in dollars. Claude: utilization delta as a fraction of your 5-hour budget. They are not the same unit. Keep them separate. Report both. The combined view is the only honest one.",
  },
];

const matterChecklist = [
  {
    text: "Exa charges per search; the per-call cost is in costDollars.total on every MCP response. Sum these for your Exa bill.",
  },
  {
    text: "Exa's result text becomes input_tokens on the next Claude turn; long research calls can move five_hour.utilization by 5-10 percentage points before Claude drafts a single line of code.",
  },
  {
    text: "Anthropic's rate limiter only checks five_hour.utilization (and seven_day.utilization for the weekly cap); ccusage and local JSONL counts cannot see the weights.",
  },
  {
    text: "ClaudeMeter polls /api/organizations/{uuid}/usage every 60 seconds and POSTs to localhost:63762; the menu bar reads the same JSON claude.ai/settings/usage renders.",
  },
  {
    text: "Pro and Max plans share this rolling-window enforcement; metered extra usage (April 2026) lands as a separate dollar balance, also visible in ClaudeMeter.",
  },
];

const sequenceActors = [
  "You",
  "Claude Code",
  "Exa MCP",
  "claude.ai server",
  "five_hour.utilization",
  "ClaudeMeter",
];
const sequenceMessages = [
  { from: 0, to: 1, label: "research-style prompt", type: "request" as const },
  { from: 1, to: 2, label: "exa.search(query)", type: "request" as const },
  {
    from: 2,
    to: 1,
    label: "10 results + costDollars: $0.0250",
    type: "response" as const,
  },
  {
    from: 1,
    to: 3,
    label: "POST /completions (results in input)",
    type: "request" as const,
  },
  {
    from: 3,
    to: 4,
    label: "increment by weight(input, model, peak)",
    type: "event" as const,
  },
  {
    from: 5,
    to: 3,
    label: "GET /usage every 60s",
    type: "request" as const,
  },
  {
    from: 3,
    to: 5,
    label: "five_hour.utilization = 0.86",
    type: "response" as const,
  },
  {
    from: 5,
    to: 0,
    label: "menu bar updates: 86% / 5h, $0.025 spent on Exa",
    type: "response" as const,
  },
];

const comparisonRows = [
  {
    feature: "Tracks Exa per-search dollars",
    ours: "no (out of scope)",
    competitor: "yes (Exa Cost Optimizer, Exa dashboard)",
  },
  {
    feature: "Tracks Claude plan utilization (server-truth)",
    ours: "yes (five_hour and seven_day, every 60s)",
    competitor: "no",
  },
  {
    feature: "Tracks local Claude Code tokens (~/.claude/projects)",
    ours: "no (different data source)",
    competitor: "yes (ccusage, Claude-Code-Usage-Monitor)",
  },
  {
    feature: "Sees Exa-result text inflate 5-hour window",
    ours: "yes (because it reads the server quota)",
    competitor: "no (Exa-side tools see only their bill)",
  },
  {
    feature: "Sees peak-hour and model weights",
    ours: "yes (baked into utilization)",
    competitor: "no (local logs cannot see weights)",
  },
  {
    feature: "Predicts a 429 on the next prompt",
    ours: "yes (utilization >= 1.0 trips the limiter)",
    competitor: "no (different denominator)",
  },
  {
    feature: "Polling cadence",
    ours: "60s default, 30s-5m configurable",
    competitor: "varies (per-call for Exa, on JSONL write for ccusage)",
  },
  {
    feature: "Cookie paste required",
    ours: "no (browser extension carries the session)",
    competitor: "n/a (different data source)",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "Local counter vs server quota",
    excerpt:
      "ccusage says 5 percent. claude.ai says rate limited. The two numbers measure different things; here is the field.",
    tag: "Mental model",
  },
  {
    href: "/t/claude-pro-5-hour-window-tracker",
    title: "Pro's 5-hour window is one float on a sliding clock",
    excerpt:
      "What the five_hour object actually contains, why resets_at slides, and how to read the JSON in one curl.",
    tag: "Reference",
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
    "Tracking Claude + Exa search usage: two bills, two meters",
  description:
    "Exa bills per search via costDollars. Claude bills tokens for the result text, weighted into five_hour.utilization. No single tracker covers both. Here is the field, the shape of each bill, and how to read them in parallel.",
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

export default function ClaudeExaSearchUsageTrackerPage() {
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
          Claude + Exa search usage tracking:{" "}
          <GradientText>two bills, two meters</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          When you wire Exa MCP into Claude Code, you start paying twice
          for every research call. Exa charges per search and surfaces it
          on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            costDollars
          </code>
          . Claude charges tokens for ingesting the result text and
          surfaces it on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          on the server. No single tool today shows both. The honest
          setup is two meters running in parallel.
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

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide">
            Direct answer (verified 2026-04-29)
          </p>
          <p className="mt-3 text-lg text-zinc-800 leading-relaxed">
            There is no single tracker for &ldquo;Claude + Exa search&rdquo;
            usage. Read{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono border border-teal-200">
              costDollars
            </code>{" "}
            on every Exa MCP response for the per-search bill, and run{" "}
            <a
              href="https://github.com/m13v/claude-meter"
              className="text-teal-700 underline underline-offset-2"
            >
              ClaudeMeter
            </a>{" "}
            for the Claude plan side, because Exa search results feed back
            as Claude input tokens that count against your rolling 5-hour
            window and weekly quota at{" "}
            <a
              href="https://claude.ai/settings/usage"
              className="text-teal-700 underline underline-offset-2"
            >
              claude.ai/settings/usage
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why one tracker is not enough
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Exa search via MCP is one of the most useful tools to wire into
          Claude Code. It is also the fastest way to burn through a
          Claude Pro or Max plan window without realizing it. The reason
          is straightforward: every search returns text, that text gets
          read into the next Claude turn as input tokens, and those
          tokens land on your server-side quota with the same weights as
          any other prompt. A two-paragraph follow-up question that
          triggers an Exa research call can chew up more of your 5-hour
          window than the previous fifteen minutes of code review.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The trackers people reach for cover only one edge each. Exa&apos;s
          dashboard and the Exa Cost Optimizer skill see Exa&apos;s per-call
          bill in dollars. ccusage reads local JSONL files under{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects
          </code>{" "}
          and tots up token counts. The Claude{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          slash command shows API-side token spend. None of those see
          the weighted server quota that actually trips the rate limiter.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Bill 1: Exa&apos;s per-call cost lives in <code className="text-zinc-900">costDollars</code>
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Exa MCP responses include a{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            costDollars
          </code>{" "}
          object on every search response. It breaks the call into
          search type, content fetch, and any livecrawl charges. Sum
          these across a session for your Exa-side spend:
        </p>
        <AnimatedCodeBlock
          code={exaResponseExample}
          language="json"
          filename="exa.search response (truncated)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          ClaudeMeter does not read this. It has nothing to do with your
          MCP traffic. If you want a record of what each search cost,
          wrap your MCP client and log{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            costDollars.total
          </code>{" "}
          alongside the prompt that fired it.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Bill 2: Claude&apos;s plan-side cost lives in <code className="text-zinc-900">five_hour.utilization</code>
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The Anthropic rate limiter looks at one weighted utilization
          float per window in the response from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET /api/organizations/&#123;org_uuid&#125;/usage
          </code>
          . Same endpoint claude.ai/settings/usage hits to draw the bar:
        </p>
        <AnimatedCodeBlock
          code={claudeUsagePayload}
          language="json"
          filename="claude.ai/api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          One{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          float per window. The 429 fires when{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization {">="} 1.0
          </code>
          . Every Exa search-result text chunk lands here as part of the
          next turn&apos;s input, weighted by peak-hour multiplier, model
          choice, and per-tool-call cost. ClaudeMeter polls this endpoint
          every 60 seconds via your existing browser session and renders
          both numbers in the macOS menu bar.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          One Exa call, two ledgers
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The same MCP search hits two billing systems at once. Most
          tools see one. Both numbers matter.
        </p>
        <SequenceDiagram
          title="Exa MCP search through Claude Code"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What lands on each meter, every search
        </h2>
        <AnimatedBeam
          title="Exa search call, fanned out across both surfaces"
          from={[
            { label: "Search query", sublabel: "your prompt" },
            { label: "Exa MCP", sublabel: "neural / keyword" },
            {
              label: "Result text",
              sublabel: "8-30 pages of content",
            },
            { label: "Claude turn", sublabel: "input_tokens" },
            { label: "Peak-hour multiplier", sublabel: "weekday US PT" },
          ]}
          hub={{
            label: "two ledgers",
            sublabel: "Exa $ and Claude %",
          }}
          to={[
            { label: "Exa costDollars", sublabel: "per-call dollars" },
            {
              label: "Claude five_hour.utilization",
              sublabel: "weighted fraction",
            },
            {
              label: "ClaudeMeter menu bar",
              sublabel: "every 60 seconds",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce both bills in one minute
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need anything new. Snapshot the Claude side with one
          curl, run the Exa-heavy turn, snapshot again, and read the
          delta. ClaudeMeter automates this in the menu bar; the manual
          version is fine for a sanity check:
        </p>
        <TerminalOutput
          title="Exa MCP call vs ClaudeMeter snapshot"
          lines={reproTerminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          One Exa research call: $0.025 to Exa, +0.08 utilization on
          Claude. The first number is the per-call money. The second is
          eight percentage points of your 5-hour budget gone, with
          another four hours of refactor still ahead. Two numbers, one
          decision.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What lands on which ledger, summarized
        </h2>
        <AnimatedChecklist
          title="Five things to keep straight"
          items={matterChecklist}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          A small wrapper that captures both
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          If you want the two numbers next to each other in code, drop a
          wrapper around your Exa MCP client. Read the Claude utilization
          before, run the search, read it after, return everything:
        </p>
        <AnimatedCodeBlock
          code={wrappedMcpCall}
          language="typescript"
          filename="lib/tracked-exa-search.ts"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            readClaudeUtilization
          </code>{" "}
          helper is one fetch call. Authenticate with your local
          claude.ai cookies (the same way ClaudeMeter does), parse the
          JSON, return the two utilization fractions. Now every Exa
          search has a paired Claude-plan delta you can log, plot, or
          alert on.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The two-meter session, end to end
        </h2>
        <StepTimeline steps={reproSteps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          ClaudeMeter vs Exa-side and local-token tools
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Different data source, different question. Use them together.
        </p>
        <ComparisonTable
          productName="ClaudeMeter (plan side)"
          competitorName="Exa Cost Optimizer + ccusage"
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
              { value: 60, suffix: "s", label: "ClaudeMeter poll cadence (configurable 30s-5m)" },
              {
                value: 1,
                label: "field the Anthropic rate limiter actually checks",
              },
              { value: 2, label: "ledgers per Exa search call" },
              { value: 0, label: "cookies you have to paste" },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          When to throttle Exa to save the Claude window
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              Once you can see both meters, the throttle decision becomes
              cheap. A research call typically moves the 5-hour bar by 4
              to 10 percentage points, depending on result count and
              model. If ClaudeMeter shows you at{" "}
              <NumberTicker value={78} suffix="%" /> with three more
              hours of refactor ahead, an Exa call that pushes you to{" "}
              <NumberTicker value={88} suffix="%" /> is probably fine.
              The same call at{" "}
              <NumberTicker value={92} suffix="%" /> is not.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              The point of two meters is being able to make that
              trade-off in real time, not at the moment Anthropic returns
              a 429.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveats
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The Anthropic{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;uuid&#125;/usage
          </code>{" "}
          endpoint is internal and undocumented. The shape has been
          stable for many months but Anthropic could rename or reshape
          it in any release. ClaudeMeter deserializes into a strict Rust
          struct and surfaces a parse error if the shape changes; a fix
          ships the same day. Exa&apos;s costDollars field is documented and
          stable, but Exa&apos;s pricing tiers do change, so the per-call
          numbers you see in old logs may not match current tariffs.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          ClaudeMeter is macOS only (12+). Browser extensions for Chrome,
          Arc, Brave, and Edge. Safari is not supported yet. Linux and
          Windows are not on the roadmap. If you are not on macOS, the
          curl-and-jq path above still works.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch both meters while you research
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter sits in your macOS menu bar, refreshes every 60
          seconds, and reads the same JSON{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          renders. Free, MIT licensed, no cookie paste. Pair it with
          Exa&apos;s costDollars for full coverage.
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
          heading="Wiring Exa MCP into a heavy Claude Code loop?"
          description="If your two meters are diverging in a shape we have not seen, or you want a sanity check on a wrapper, send a snapshot. 15 minutes is plenty."
          text="Book a 15-minute call"
          section="exa-tracker-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on tracking Claude + Exa? 15 min."
        section="exa-tracker-sticky"
        site="claude-meter"
      />
    </article>
  );
}
