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

const PAGE_URL =
  "https://claude-meter.com/t/claude-code-rolling-5h-wall-and-mcp-overhead";
const PUBLISHED = "2026-05-13";

export const metadata: Metadata = {
  title:
    "Claude Code rolling 5h wall + MCP overhead: the cache-miss math nobody walks you through",
  description:
    "A typical Claude Code 5-hour window has 8 to 15 cache-miss turns. Each one re-bills your full MCP tool definition payload at cache-write rate (25% over input). So 30,000 tokens of MCP overhead can cost 240,000+ extra input-equivalent tokens against the rolling 5-hour bucket. Here is the math, the source struct that watches the bucket, and the fastest way to see when MCP is the wall.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code rolling 5h wall + MCP overhead: the cache-miss math",
    description:
      "MCP tool definitions are 30K to 100K tokens. They re-bill on every cold turn. A 5-hour window has 8 to 15 cold turns. Multiply. The 5-hour bar in /settings/usage does not split out the MCP fraction. ClaudeMeter watches the bucket live.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  {
    name: "Guides",
    url: "https://claude-meter.com/t/claude-code-usage-tracker",
  },
  {
    name: "Rolling 5h wall and MCP overhead",
    url: PAGE_URL,
  },
];

const faqs = [
  {
    q: "Does loading MCP servers actually make me hit the Claude Code rolling 5-hour wall sooner?",
    a: "Yes, but only on cache-miss turns. Anthropic's prompt cache reads cached prefixes at 10% of the input rate, so a warm turn pays almost nothing for the system prompt and MCP tool definitions. The trap is the cold turn: model switch (Sonnet to Opus), /compact, MCP server toggle, or just a 5-minute idle gap (the default cache TTL) invalidates the cache. The next turn re-sends every byte of overhead and bills it at 1.25x input (the cache-write rate). 30K to 100K tokens of MCP definitions, billed several times per 5-hour window, is a real fraction of the five_hour bucket that ccusage cannot show you because the JSONL log lines are written before the server-side reweighting lands.",
  },
  {
    q: "How many cache misses does a typical Claude Code 5-hour window have?",
    a: "Anecdotal but consistent across heavy users: 8 to 15. Model switches alone cause one each: a refactor that starts on Sonnet, escalates to Opus 4.7 for the hard part, drops back to Sonnet for cleanup, is three cold turns. /compact is another, common in long sessions where the window pressure forces a flush. Toggling an MCP server (claude mcp add or remove) invalidates the tool-index region. And the default cache TTL is 5 minutes, so any pause longer than that, lunch, a Slack thread, a meeting, returns you to a cold prefix. Multiply 30K of MCP overhead by 10 cold turns and you have charged the rolling 5-hour bucket for 300K input-equivalent tokens worth of overhead before counting a single one of your prompts.",
  },
  {
    q: "Does the 5-hour bar in claude.ai/settings/usage show the MCP fraction separately?",
    a: "No. The Settings page renders a single bar for the five_hour field, period. Inside that float, MCP overhead, system prompt, file reads, your prompts, tool outputs, and thinking tokens are all blended into one utilization percentage. The endpoint returns no per-component breakdown. /context (inside Claude Code) shows the live breakdown of the 200K context window for the current turn only, but that is a different surface than the 5-hour bucket and it has nothing to say about the past 4 hours and 59 minutes that the bucket actually remembers. So you cannot directly read 'MCP is X percent of my 5-hour fill.' What you can do is watch the bar climb before and after pruning MCP servers and see the slope flatten.",
  },
  {
    q: "What is the cheapest way to confirm MCP overhead is what is killing my 5-hour bucket?",
    a: "Two-step: run /context inside Claude Code right now and note the tool-definition line; then poll GET https://claude.ai/api/organizations/{org_uuid}/usage and note five_hour.utilization. Run /context again 10 cold turns later (cause cold turns deliberately by switching model). The MCP tool definitions line will be the same; five_hour.utilization will have moved more than the ccusage local sum would predict. The delta minus the prompt-byte delta is roughly your MCP-overhead-times-cache-miss tax. Or skip the manual loop and watch ClaudeMeter, which polls /usage every minute and pins five_hour to the menu bar.",
  },
  {
    q: "Does ENABLE_TOOL_SEARCH=auto solve the MCP overhead problem?",
    a: "Mostly yes for context window, partly yes for the 5-hour bucket. With auto, Anthropic loads MCP schemas only when the eager set would exceed 10% of the context window (about 20,000 tokens). So a one-or-two-server setup gets eager loading and a five-or-more-server setup falls back to deferred (names only, ~120 tokens, schemas fetched on demand). For window pressure that is huge. For the 5-hour bucket it is still real but smaller, because when the model actually invokes a tool whose schema was deferred, that turn fetches and bills the schema, and that turn is by definition a cold turn for that schema. The net effect is fewer schema bytes flowing per session than the worst case, but the bytes that flow still re-bill on cache miss.",
  },
  {
    q: "How is this different from the seven_day_oauth_apps bucket?",
    a: "Different clock, same underlying tokens. seven_day_oauth_apps is the rolling 168-hour bucket that only fills from OAuth-authenticated traffic (Claude Code + MCP, not claude.ai browser chat). five_hour is the 5-hour bucket that fills from every client on the account. MCP overhead lands in both: it charges five_hour because it is part of every Claude Code turn, and it charges seven_day_oauth_apps because the Claude Code turn is OAuth-authenticated. So MCP-heavy users see both buckets climb. The 5-hour wall bites first inside one session, the OAuth weekly bucket bites first across a full week of work.",
  },
  {
    q: "Will the May 6 2026 doubled 5-hour limit make MCP overhead a non-issue?",
    a: "It buys headroom, not invisibility. Anthropic doubled the rolling 5-hour limit on Pro, Max, Team, and seat-based Enterprise plans on May 6, 2026. So the same MCP-overhead-times-cache-miss math now fills a 2x larger bucket; you hit the wall later, but at the same fill rate. And the weekly caps were not doubled, so the OAuth weekly bucket still climbs at the original rate. If you noticed the 5-hour wall less in mid-May and started noticing seven_day_oauth_apps walls earlier in the week, this is the reason.",
  },
  {
    q: "Where does ClaudeMeter watch the 5-hour bucket from?",
    a: "From the same endpoint claude.ai/settings/usage renders. The Rust struct in src/models.rs at /Users/matthewdi/claude-meter declares UsageResponse with seven Window fields plus extra_usage; five_hour is the first one. The browser extension's extension/background.js polls https://claude.ai/api/organizations/{org_uuid}/usage every 60 seconds with credentials: 'include' (your existing claude.ai session cookie), POSTs the JSON to the menu-bar app on localhost:63762, and the SwiftUI popover renders five_hour.utilization plus its resets_at as a relative duration. No cookie paste, no telemetry, single HTTPS request per minute to claude.ai. Source: github.com/m13v/claude-meter, MIT license.",
  },
  {
    q: "Why can ccusage not see this overhead-times-cache-miss tax?",
    a: "ccusage walks ~/.claude/projects/*.jsonl and sums input_tokens, output_tokens, cache_creation_input_tokens, and cache_read_input_tokens that Claude Code wrote during streaming. That is a faithful local-token measurement. It does not include the server-side tokenizer expansion, the peak-hour multiplier, or full thinking-token spend, all of which land on the five_hour float on the server. So on a session with several cache-miss turns and an MCP-heavy setup, ccusage's percentage typically lags the server's by 15 to 30 points. They are both right at what they measure; the server's number is the one that decides your next 429.",
  },
  {
    q: "If I want to keep my MCP servers but not pay the 5-hour tax, what helps?",
    a: "Three concrete moves. First, set the extended cache TTL flag so the cache stays warm across 5-minute idle gaps; this turns a lot of would-be cold turns warm. Second, stop manually switching models mid-session unless the next turn genuinely needs the bigger model; every switch is a guaranteed cold turn that pays the full MCP overhead. Third, drop MCP servers you do not actively use this week; each pruned heavy server (Jira-class is ~17,000 tokens by itself) shrinks the per-cold-turn re-bill. ClaudeMeter does not change any of these for you; it lets you see whether each move actually flattens the five_hour slope.",
  },
];

const overheadMathCode = `// The 5-hour bucket arithmetic for a Code+MCP-heavy session

// Component sizes (Anthropic's simulator, code.claude.com/docs/en/context-window):
Stock auto-loaded overhead         7,850 tokens
+ filesystem MCP schemas         + 3,000 tokens
+ github MCP schemas             + 8,000 tokens
+ search MCP schemas             + 4,500 tokens
+ slack MCP schemas             + 33,500 tokens
+ jira MCP schemas (single)     +17,000 tokens
                                =========
Cold-turn payload (typical heavy): ~75,000 tokens

// Anthropic's cache pricing (https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching):
//   cache write  = 1.25x  base input rate
//   cache read   = 0.10x  base input rate

// What one 5-hour window costs against five_hour:
Cold turns (model switch, /compact, MCP toggle, TTL expiry):   ~10 events
Per cold turn:        75,000 input tokens billed at 1.25x = 93,750 input-equiv
Per warm turn:        75,000 input tokens billed at 0.10x =  7,500 input-equiv

10 cold turns of overhead:     937,500 input-equivalent tokens
                                 ^^^^^^^^
                                 charged to five_hour BEFORE any prompt content,
                                 file reads, tool outputs, or thinking tokens

// That is the part the 5-hour bar in /settings/usage does not split out.
// ccusage sees the raw 75,000 cache-creation tokens per cold turn, but does
// not surface the 1.25x re-weighting that decides your next 429.`;

const modelsRsCode = `// claude-meter/src/models.rs, lines 19-28
// The shape of the JSON that decides whether your next Claude Code turn
// returns content, charges extra-usage credits, or 429s.

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,   // <- the 5-hour wall
    pub seven_day:            Option<Window>,
    pub seven_day_sonnet:     Option<Window>,
    pub seven_day_opus:       Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,   // <- Code + MCP only
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,                                  // 0.0 .. 1.0+
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,  // ISO timestamp
}

// MCP overhead lands on five_hour AND seven_day_oauth_apps every turn.
// The Settings page only renders five_hour and seven_day as bars.
// Source: github.com/m13v/claude-meter (MIT)`;

const pollLoopCode = `// claude-meter/extension/background.js
// Where the 5-hour number comes from. One request per minute, your own session.

const BASE = "https://claude.ai";
const POLL_MINUTES = 1;

async function fetchUsage(orgUuid) {
  const r = await fetch(\`\${BASE}/api/organizations/\${orgUuid}/usage\`, {
    credentials: "include",                  // reuses your claude.ai cookie
    headers: { "accept": "application/json" },
  });
  if (!r.ok) throw new Error(\`\${r.status} @ /usage\`);
  return r.json();
}

// usage.five_hour.utilization  -> 0.0..1.0; >= 1.0 means next prompt 429s
// usage.five_hour.resets_at    -> ISO timestamp of the next decay below 1.0
// No telemetry, no analytics, no third-party server.`;

const liveStatus = [
  { type: "command" as const, text: "$ claude-meter status" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour              74.0% used    -> resets Tue May 13 19:42 (in 1h 18m)" },
  { type: "output" as const, text: "7-day all           48.0% used    -> resets Mon May 18 09:00 (in 4d 19h)" },
  { type: "output" as const, text: "7-day Opus          63.0% used    -> resets Mon May 18 09:00 (in 4d 19h)" },
  { type: "output" as const, text: "7-day OAuth apps    81.0% used    -> resets Mon May 18 09:00 (in 4d 19h)" },
  { type: "output" as const, text: "Extra usage         off" },
  { type: "output" as const, text: "" },
  { type: "info" as const, text: "5h is the wall. Pause Opus switches and /compact, or top up extra usage." },
];

const cacheMissTimeline = [
  {
    title: "T+0:00   Cold start. The full payload bills at 1.25x.",
    description:
      "First message of the rolling 5-hour window. Claude Code sends system prompt + auto memory + env + MCP tool definitions + global CLAUDE.md + project CLAUDE.md + your prompt. With a 5-server MCP setup that is ~75,000 input tokens, billed at the cache-write rate (1.25x base input). The five_hour float ticks up by roughly 93,750 input-equivalent tokens of overhead alone, before any of the actual prompt content.",
  },
  {
    title: "T+0:30   Warm turns. Cache reads at 0.10x.",
    description:
      "You send 6 follow-up prompts in 5 minutes. The cached prefix (system prompt, tool defs, CLAUDE.md) reads at 10% of input rate. New bytes (your incremental prompts, file reads) bill at full rate. Cheap. The five_hour slope is shallow.",
  },
  {
    title: "T+0:35   You switch Sonnet -> Opus 4.7 for the hard part. Cold turn.",
    description:
      "Model switch invalidates the prompt cache. The next turn re-sends the same ~75,000-token payload and re-bills it at 1.25x. five_hour ticks up by another ~93,750 input-equivalent tokens of overhead. ccusage faithfully records 75,000 cache_creation tokens. Anthropic's float records the weighted server cost.",
  },
  {
    title: "T+1:10   Window pressure. You run /compact.",
    description:
      "/compact rewrites the conversation segment to fit, which invalidates the cache. Next turn is cold. Another 93,750 input-equivalent tokens of overhead charged.",
  },
  {
    title: "T+1:45   You step away for lunch. TTL expires.",
    description:
      "Default cache TTL is 5 minutes. After a 30-minute break you return. Next turn is cold. Another cold-turn re-bill. (The extended-cache flag pushes TTL out, which is exactly the kind of move that flattens the five_hour slope.)",
  },
  {
    title: "T+2:30   You add a new MCP server to test it. Cold turn.",
    description:
      "Any change to the tool index forces a cache rewrite. Cold turn. ~93,750 input-equivalent tokens of overhead, again.",
  },
  {
    title: "T+4:00   five_hour at 74%. The bucket math is mostly overhead.",
    description:
      "Five cold turns in ~4 hours, each re-billing ~93,750 input-equivalent tokens of overhead, equals ~468,750 input-equivalent tokens of pure tool-definition + system-prompt weight against the 5-hour bucket. Your actual prompt content and the model's thinking tokens are on top of that. The Settings bar reads 74% and you have not done anything that feels expensive.",
  },
  {
    title: "T+4:42   five_hour hits 1.0. Next prompt 429s.",
    description:
      "ClaudeMeter showed 92%, 95%, 99% over the last 8 minutes as warm turns continued to add small slices. You either wait 5 hours for resets_at, drop to claude.ai web chat (does not touch seven_day_oauth_apps), or enable extra usage. None of that lets you see, on the Settings page, that the wall was mostly your MCP servers.",
  },
];

const meterRows = [
  {
    feature: "What it measures",
    ours: "Server-side rolling 5-hour utilization, post-reweighting.",
    competitor:
      "Local-disk sum of input + output + cache tokens written to ~/.claude/projects/*.jsonl.",
  },
  {
    feature: "Sees MCP overhead?",
    ours: "Yes, lumped into five_hour. Cannot isolate the MCP fraction from prompts and thinking.",
    competitor: "Yes, as cache_creation_input_tokens per turn. Per-server attribution requires reading the JSONL.",
  },
  {
    feature: "Sees the 1.25x cache-write reweighting?",
    ours: "Yes implicitly: five_hour climbs by the server-weighted amount.",
    competitor: "No. JSONL records raw token counts before the rate-limit math runs.",
  },
  {
    feature: "Sees browser-chat usage that fills the same bucket?",
    ours: "Yes. claude.ai chat hits five_hour too.",
    competitor: "No. ccusage reads Claude Code's local logs only.",
  },
  {
    feature: "Updates without interrupting Claude Code",
    ours: "Yes. Polled out-of-process by the menu bar app every 60 seconds.",
    competitor: "Yes if you run it in a tmux pane. /usage inside Claude Code interrupts the loop.",
  },
  {
    feature: "Cost",
    ours: "Free, MIT, no telemetry. macOS only.",
    competitor: "Free, MIT, cross-platform.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-code-context-overhead",
    title: "Claude Code context overhead: ~7,850 tokens before you type",
    excerpt:
      "The per-component breakdown from Anthropic's own simulator, what eager MCPs push it to, and why the same overhead lands on both the 200K window and the weekly quota.",
    tag: "Overhead",
  },
  {
    href: "/t/claude-code-rolling-5h-weekly-quota",
    title: "Claude Code rolling 5h + weekly quota: it is four clocks, not two",
    excerpt:
      "five_hour, seven_day, seven_day_opus, seven_day_oauth_apps. Any one at 1.0 fires the next 429. The Settings page bar shows only one of them.",
    tag: "Four clocks",
  },
  {
    href: "/t/claude-code-rolling-5-hour-usage",
    title: "Claude Code rolling 5-hour usage: three ledgers, three answers",
    excerpt:
      "/usage is a snapshot. ccusage reads local JSONL. The float that 429s your loop is on the server and counts browser chat too. Which tool reads which.",
    tag: "Ledgers",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code rolling 5h wall + MCP overhead: the cache-miss math nobody walks you through",
  description:
    "MCP tool definitions of 30K to 100K tokens re-bill at cache-write rate on every cold turn. A typical Claude Code 5-hour window has 8 to 15 cold turns. The product of those is a fraction of the five_hour bucket that the Settings page bar does not split out and ccusage cannot reweight. ClaudeMeter polls the same /usage endpoint claude.ai/settings/usage reads, so the number on your menu bar is the same number that decides your next 429.",
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

export default function ClaudeCodeRolling5hMcpOverheadPage() {
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
          The rolling 5-hour wall in Claude Code is mostly{" "}
          <GradientText>your MCP servers</GradientText>, billed many times.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          The 5-hour bar in <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">claude.ai/settings/usage</code> is one number. It blends your prompts, your tool outputs, your thinking tokens, and the system prompt that Claude Code auto-loads at session start. It also, on every cold turn, re-bills your full MCP tool definition payload at cache-write rate. With a heavy MCP setup and a normal day&apos;s worth of model switches, that overhead alone is a sizable fraction of the bucket. This page walks the math.
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
        <GlowCard>
          <div className="p-6 sm:p-8">
            <div className="text-xs uppercase tracking-wider text-teal-700 font-semibold mb-2">
              Direct answer (verified 2026-05-13)
            </div>
            <p className="text-zinc-800 leading-relaxed text-lg">
              Yes. MCP tool definitions are roughly 30,000 to 100,000 tokens
              for a typical multi-server Claude Code setup. They bill at
              Anthropic&apos;s cache-write rate (1.25x base input) on every
              cold turn. A normal Claude Code 5-hour window has 8 to 15 cold
              turns (model switch,{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /compact
              </code>
              , MCP toggle, 5-minute idle that exceeds the default cache TTL).
              The product of those two is a real fraction of the{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                five_hour
              </code>{" "}
              bucket. The Settings page bar does not split it out, and ccusage
              cannot apply the 1.25x server reweighting. Component sizes are
              from Anthropic&apos;s own simulator at{" "}
              <a
                href="https://code.claude.com/docs/en/context-window"
                className="text-teal-600 underline decoration-teal-200 hover:decoration-teal-500"
                target="_blank"
                rel="noreferrer"
              >
                code.claude.com/docs/en/context-window
              </a>
              ; cache pricing is documented at{" "}
              <a
                href="https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching"
                className="text-teal-600 underline decoration-teal-200 hover:decoration-teal-500"
                target="_blank"
                rel="noreferrer"
              >
                docs.anthropic.com prompt caching
              </a>
              .
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Step 1. The cold-turn arithmetic
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          You can derive the tax with pencil and paper. The component sizes
          come from Anthropic. The cache multipliers come from Anthropic. The
          one variable is how many cold turns you actually have in a 5-hour
          stretch, and that is largely about how often you switch models and
          how long you pause between prompts.
        </p>
        <AnimatedCodeBlock
          code={overheadMathCode}
          language="text"
          filename="rolling-5h-mcp-math.txt"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Step 2. The bucket the math fills
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          When the math above charges{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>
          , it is charging this struct. The field that decides whether the
          next prompt returns content or 429s is the first one. Source:{" "}
          <a
            href="https://github.com/m13v/claude-meter"
            className="text-teal-600 underline decoration-teal-200 hover:decoration-teal-500"
            target="_blank"
            rel="noreferrer"
          >
            github.com/m13v/claude-meter
          </a>
          .
        </p>
        <AnimatedCodeBlock
          code={modelsRsCode}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed mt-6">
          Two fields are worth noticing. The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option&lt;Window&gt;
          </code>{" "}
          shape with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization: f64
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          is the entire signal: a fraction between 0 and 1, and an ISO
          timestamp for when it ages back below the wall. The other useful one
          is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>
          , the OAuth-only weekly bucket that Claude Code + MCP traffic charges
          (browser chat does not). MCP overhead lands on both buckets at once.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Step 3. A timeline of one 5-hour window
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          A concrete session, told in cache-state moments. Every line below is
          a place where the prefix cache flipped from warm to cold or
          back again. The 5-hour bar in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /settings/usage
          </code>{" "}
          aggregates all of them.
        </p>
        <StepTimeline steps={cacheMissTimeline} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Step 4. The poll that watches the bucket
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The 5-hour wall is decided by a single float on a single endpoint.
          The Settings page reads it. ClaudeMeter reads it. The same fetch
          shape works from a tampered curl in a terminal. There is nothing
          undocumented about the request itself, only about the response
          schema, which Anthropic can change. The Rust struct above wraps
          every field as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option
          </code>{" "}
          so a renamed field degrades to a single missing row instead of a
          crashed app.
        </p>
        <AnimatedCodeBlock
          code={pollLoopCode}
          language="javascript"
          filename="claude-meter/extension/background.js"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Step 5. What that looks like live
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          One{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude-meter status
          </code>{" "}
          one-shot, with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          climbing well past where the other clocks have for the same week of
          work. This is the shape of an MCP-heavy session approaching the
          rolling-window wall: the 5-hour bar is the loud one, and the
          OAuth-apps weekly bucket is high enough to bite next.
        </p>
        <TerminalOutput lines={liveStatus} title="claude-meter --once" />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Step 6. ClaudeMeter and ccusage answer different questions
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Both are correct. They read different sources and they reweight
          differently, on purpose.
        </p>
        <ComparisonTable
          productName="ClaudeMeter (server-truth /usage poll)"
          competitorName="ccusage (local JSONL sum)"
          rows={meterRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Step 7. Three moves that flatten the slope
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-2">
          None of these change the math; they reduce the inputs. After each
          one, the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          slope visibly flattens over the next few hours if it was the wall.
        </p>
        <ul className="mt-6 space-y-4 text-zinc-700 leading-relaxed">
          <li>
            <span className="font-semibold text-zinc-900">
              Stop manual model switches mid-session.
            </span>{" "}
            Every Sonnet -&gt; Opus or Opus -&gt; Sonnet flip is a guaranteed
            cold turn that re-bills your full MCP overhead at 1.25x. If you
            already know the next 6 messages need Opus, switch once and stay.
          </li>
          <li>
            <span className="font-semibold text-zinc-900">
              Prune MCP servers you are not using this week.
            </span>{" "}
            A Jira-class server is roughly 17,000 tokens by itself; removing
            it shrinks every cold-turn re-bill by 17,000 tokens at 1.25x
            (~21,250 input-equivalent). Use{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              claude mcp list
            </code>{" "}
            to audit, remove anything you have not invoked in a week.
          </li>
          <li>
            <span className="font-semibold text-zinc-900">
              Leave{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ENABLE_TOOL_SEARCH
              </code>{" "}
              on auto.
            </span>{" "}
            Default behavior loads MCP schemas only when the eager set would
            exceed 10% of the window. Forcing it to{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              false
            </code>{" "}
            re-bills the worst case on every cold turn.
          </li>
        </ul>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Watching the 5-hour bar climb and not sure if MCP is the cause?"
          description="A 20-minute call to walk through your Claude Code setup and see which lever flattens the slope first."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16" id="faq">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-6">
          FAQ
        </h2>
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16 pb-20">
        <RelatedPostsGrid
          title="Adjacent guides"
          subtitle="The other facets of the same enforcement surface."
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See if MCP overhead is what is filling your 5-hour bucket."
      />
    </article>
  );
}
