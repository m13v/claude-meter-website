import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  FlowDiagram,
  GlowCard,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-context-overhead";
const PUBLISHED = "2026-05-10";

export const metadata: Metadata = {
  title:
    "Claude Code context overhead: ~7,850 tokens before you type, and the part nobody tells you about your weekly quota",
  description:
    "Anthropic's official simulator quotes the per-component sizes: 4,200 for the system prompt, 1,800 for project CLAUDE.md, 680 for MEMORY.md, and so on. Sum a stock setup and you start every session at 7,850 tokens. With eager-loaded MCPs, 30K-100K. Here's what those numbers mean for the 200K window AND, separately, for your seven-day quota meter.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code context overhead: ~7,850 tokens stock, and the cache-miss tax against your weekly quota",
    description:
      "The /context command shows where the 200K goes. It does not show where the seven-day quota goes. Same overhead, two different meters, and on a cache-miss turn the second meter pays for the first one all over again.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t/claude-code-usage-tracker" },
  { name: "Claude Code context overhead", url: PAGE_URL },
];

const faqs = [
  {
    q: "How big is Claude Code's context overhead before I type anything?",
    a: "On a stock Claude Code session, ~7,850 tokens. The number comes from Anthropic's own interactive simulator at code.claude.com/docs/en/context-window, where the EVENTS array lists each auto-loaded component with its token count: System prompt 4,200, MEMORY.md 680, environment info 280, MCP tool index (deferred names only) 120, skill descriptions 450, ~/.claude/CLAUDE.md 320, project CLAUDE.md 1,800. That is roughly 4 percent of the 200,000-token context window. Eager-loaded MCP servers stack on top of this and routinely push real-world overhead into the 30,000 to 100,000 range.",
  },
  {
    q: "Where does that overhead come from? I never asked for it.",
    a: "Seven things load before your first prompt: the system prompt (Claude Code's identity, tool-use rules, formatting rules), MEMORY.md (notes Claude wrote to itself in past sessions), environment info (working directory, OS, shell, git branch and recent commits), an index of MCP tool names so the model knows what is available, one-line skill descriptions, your global ~/.claude/CLAUDE.md, and the project's CLAUDE.md. By default MCP tool schemas stay deferred (names only, ~120 tokens). Setting ENABLE_TOOL_SEARCH=auto loads schemas if they fit in 10 percent of the window; ENABLE_TOOL_SEARCH=false loads them all upfront, regardless of size.",
  },
  {
    q: "What pushes the overhead from 7,850 to 30K or 100K?",
    a: "MCP servers loaded eagerly. A five-server setup (filesystem, GitHub, search, postgres, slack) typically lands around 55,000 tokens of tool definitions. A heavier server like Jira ships ~17,000 tokens by itself. Stack three or four heavy servers and the eager load reaches 100,000+. Anthropic now auto-enables MCP Tool Search whenever your eager-loaded tools would exceed 10 percent of the window (so above 20,000 tokens), which is why a clean install rarely shows the worst case anymore. But if you forced ENABLE_TOOL_SEARCH=false, or you are on an older Claude Code release, you pay it all upfront.",
  },
  {
    q: "Does the 200K context window have anything to do with my weekly quota?",
    a: "They are two different meters that share an input. The 200K context window is a hard ceiling on what a single turn can carry; if your transcript exceeds it Claude Code compacts or truncates. The seven-day quota is a rolling utilization fraction that Anthropic computes server-side from billed input and output tokens, including everything in the system prompt, the tool definitions, the auto memory, the file reads, and the conversation history. Both meters look at the same overhead. They count it differently and they fail differently. Hitting the 200K wall produces a /compact, hitting the seven-day wall produces a 429.",
  },
  {
    q: "If overhead lives in the system prompt and Claude caches that, why does it cost anything?",
    a: "It is much cheaper, not free, and only when cache hits. Anthropic's prompt cache reads at 10 percent of the input rate; cache writes are 25 percent more expensive than uncached input. So an idle cache-hit turn bills the overhead at one-tenth of full rate. The trap is cache misses. The cache invalidates on a model switch, on /compact, on a tool toggle, on certain MCP reconnections, and on cache TTL (5 minutes by default unless you set the longer TTL). After any of those, the next turn re-bills the full overhead at the cache-write rate. Several of those misses in an hour and your seven-day quota fraction moves visibly faster than ccusage's local sum predicts.",
  },
  {
    q: "Where does ccusage see all of this?",
    a: "ccusage walks ~/.claude/projects/**/*.jsonl and sums the input, output, cache_creation, and cache_read counts your Claude Code CLI wrote during streaming. It is correct as a token-flow measurement on this device. It cannot see browser-chat traffic on claude.ai. It cannot see traffic from another device on the same account. And it does not always reflect the server's billing weights cleanly: the seven_day_opus utilization fraction includes thinking tokens that are not always written to JSONL in full, plus tokenizer expansion that runs server-side after Claude Code wrote the line. So ccusage reads what was sent. It does not read what the rate limiter is actually counting.",
  },
  {
    q: "How do I see where the overhead is going right now?",
    a: "Inside an active Claude Code session, type /context. It prints a breakdown of every component currently in the window, with token counts and percentages: system prompt, tools, memory, skills, conversation history, and free space. That is the live source of truth for context utilization. It is a one-shot snapshot, not a continuous meter, but it is exactly the breakdown that drives the simulator numbers above. Run it twice, ten minutes apart in the same session, and the deltas show you what file reads and tool outputs are doing to your window.",
  },
  {
    q: "Does /context show the seven-day quota too?",
    a: "No. /context reads internal CLI state about the local context window. The seven-day quota lives at GET https://claude.ai/api/organizations/{org}/usage on the claude.ai host (the same endpoint claude.ai/settings/usage renders behind the bar charts). The response shape, deserialized by ClaudeMeter's Rust UsageResponse struct in src/models.rs lines 18-28, has seven Window-shaped fields, each carrying just utilization (f64) and resets_at (Option<DateTime<Utc>>). Nothing in /context touches that endpoint, and nothing in /api/organizations/{org}/usage exposes per-component context overhead. They are different surfaces with different cookies.",
  },
  {
    q: "How do I actually reduce the overhead?",
    a: "The cheap wins, in priority order: keep project CLAUDE.md under 200 lines (the simulator caps it at 1,800 tokens, but a 5,000-line one will load every relevant byte and dominate the budget), let ENABLE_TOOL_SEARCH stay on auto so MCP schemas load lazily, prune MCP servers you don't actually use this week (each removed Jira-class server is roughly 17,000 tokens back), move per-directory rules into .claude/rules/ with paths: matchers so they only load when Claude reads a matching file, and run /compact early when you notice the window past 50 percent rather than waiting for the 200K wall. The single biggest free win is auditing project CLAUDE.md.",
  },
  {
    q: "Will trimming overhead actually save quota, or just window space?",
    a: "Both, and the quota saving is bigger than people realize. Every cache-miss turn pays for whatever overhead is loaded right now, billed at the cache-write rate (25 percent above plain input). A 50,000-token MCP definition that you never invoke this session costs you roughly 50,000 input tokens on every cold turn, even though you never used a tool from that server. Trim it to deferred or remove the server, and those tokens stop landing in your seven-day bucket. Window space comes back too, but the quota effect is what makes the seven_day_opus fraction move slower over a week.",
  },
  {
    q: "Where does ClaudeMeter fit in this picture?",
    a: "ClaudeMeter watches the second meter, not the first. The /context command and the status line cover the local 200K window well. ClaudeMeter polls /api/organizations/{org}/usage once a minute through your existing claude.ai browser session and shows the live five_hour and seven_day_opus utilization in the macOS menu bar. When you trim project CLAUDE.md or disable an unused MCP, you can watch the seven-day fraction climb slower over the next few hours instead of guessing. It is the single signal that closes the loop between context-overhead choices and quota-meter behavior.",
  },
];

const stockOverheadJson = `// from Anthropic's official simulator at
// code.claude.com/docs/en/context-window
// (see the EVENTS array, kind: 'auto' entries)

System prompt              4,200 tokens   // identity, tool rules, format rules
Auto memory (MEMORY.md)      680 tokens   // up to 200 lines or 25KB
Environment info             280 tokens   // cwd, platform, shell, git branch
MCP tools (deferred index)   120 tokens   // names only, schemas on demand
Skill descriptions           450 tokens   // one line per skill
~/.claude/CLAUDE.md          320 tokens   // your global preferences
Project CLAUDE.md          1,800 tokens   // project conventions
                          ──────────
Stock overhead             7,850 tokens   // ≈ 4% of the 200,000 window
                                         // billed at cache-write rate on
                                         // every cache-miss turn`;

const eagerMcpJson = `// What changes when you set ENABLE_TOOL_SEARCH=false
// or a heavy MCP server loads schemas eagerly:

Stock overhead              7,850 tokens
+ filesystem MCP            ~3,000 tokens
+ github MCP                ~8,000 tokens
+ search MCP                ~4,500 tokens
+ postgres MCP              ~6,000 tokens
+ slack MCP                ~33,500 tokens
+ jira MCP (alone)         ~17,000 tokens
                          ──────────
Five-server typical        ≈55,000 tokens of tool defs alone
Five servers + jira         72,000 tokens
Three heavy + stock        100,000+ tokens (Anthropic's own ceiling
                                            on the documented worst case)
                                            // before any file reads,
                                            // before any conversation,
                                            // re-billed on every cache miss`;

const usageResponseStruct = `// claude-meter/src/models.rs, lines 3-28
// the response shape that decides whether your next turn 200s, meters
// to overage, or 429s.

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,                                  // 0.0 .. 1.0+
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,  // ISO timestamp
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:           Option<Window>,
    pub seven_day:           Option<Window>,
    pub seven_day_sonnet:    Option<Window>,
    pub seven_day_opus:      Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:  Option<Window>,
    pub seven_day_cowork:    Option<Window>,
    pub extra_usage:         Option<ExtraUsage>,
}

// There is no per-component breakdown here. The server returns
// utilization fractions only. Whatever overhead just landed in your
// last turn shows up as a delta on these floats, with no telemetry
// pointing back at "system prompt" or "tool definitions" or "file read."`;

const contextTerminal = [
  { type: "command" as const, text: "/context" },
  { type: "output" as const, text: "Context window: 200,000 tokens" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "  System prompt          4,200    2.1%" },
  { type: "output" as const, text: "  Auto memory              680    0.3%" },
  { type: "output" as const, text: "  Env + git status         310    0.2%" },
  { type: "output" as const, text: "  MCP tools (deferred)     120    0.1%" },
  { type: "output" as const, text: "  Skill descriptions       450    0.2%" },
  { type: "output" as const, text: "  ~/.claude/CLAUDE.md      320    0.2%" },
  { type: "output" as const, text: "  Project CLAUDE.md      1,800    0.9%" },
  { type: "output" as const, text: "  Conversation          18,300    9.2%" },
  { type: "output" as const, text: "  File reads            22,400   11.2%" },
  { type: "output" as const, text: "  Tool outputs          14,500    7.3%" },
  { type: "output" as const, text: "                       ──────  ──────" },
  { type: "info" as const, text: "  Used:                 63,080   31.5%" },
  { type: "info" as const, text: "  Free:                136,920   68.5%" },
  { type: "output" as const, text: "" },
  {
    type: "output" as const,
    text: "Tip: /compact will collapse the conversation segment.",
  },
];

const cacheMissSteps = [
  {
    title: "Cold turn (first prompt or after a cache miss).",
    description:
      "Claude Code sends the full input: system prompt + auto memory + env + MCP tool index + skill descriptions + global CLAUDE.md + project CLAUDE.md + transcript so far + your prompt. All of it bills at the cache-write rate, which is 25 percent more expensive than plain input. On a stock setup that is 7,850 tokens of overhead; with eager MCPs, 30K-100K. The seven_day_opus float ticks up by the full amount.",
  },
  {
    title: "Warm turns (cache TTL, default 5 minutes).",
    description:
      "The system prompt prefix and tool definitions are read from cache at 10 percent of the input rate. Your incremental prompt and any new file reads bill at full rate. A run of 4-6 follow-up prompts inside the cache window costs an order of magnitude less than the cold turn that started it. ccusage and the seven_day_opus fraction agree closely here.",
  },
  {
    title: "Cache miss (model switch, /compact, MCP toggle, TTL expiry).",
    description:
      "Switch from Sonnet to Opus mid-session, run /compact to free window space, toggle an MCP server, or simply pause for more than 5 minutes (or whatever you set the TTL to). The next turn is cold again. The full overhead re-bills at cache-write rate. Three cache misses in an afternoon equals three full re-bills of whatever your overhead currently is.",
  },
  {
    title: "Where the meters disagree.",
    description:
      "ccusage faithfully sums what your Claude Code wrote to JSONL, which includes the cache-creation and cache-read tokens but not the server-side tokenizer expansion or the full thinking-token spend. seven_day_opus, deserialized by claude-meter into a Window with utilization (f64) and resets_at, reflects what the server actually counted. After several cache-miss turns in a session, the gap between the two becomes visible: ccusage may say you spent 12 percent of plan today, the menu bar reads 18 percent.",
  },
  {
    title: "Where to spend the savings.",
    description:
      "Trim project CLAUDE.md, leave ENABLE_TOOL_SEARCH on auto, prune unused MCP servers. Each of those reduces the overhead that gets re-billed on every cache-miss turn. The 200K window comes back too, but the bigger win is the seven-day quota fraction moving slower over a week. Watch the menu bar and the trade-off becomes visible.",
  },
];

const flowSteps = [
  {
    label: "Auto-loaded at session start",
    detail:
      "System prompt, auto memory, env, MCP tool index, skill descriptions, global CLAUDE.md, project CLAUDE.md. ~7,850 tokens stock; 30K-100K with eager MCPs.",
  },
  {
    label: "Sent on every turn",
    detail:
      "Full transcript so far + auto-loaded overhead + your new prompt. Subject to Anthropic's prompt cache (TTL 5 minutes by default; longer with the extended-cache flag).",
  },
  {
    label: "Meter 1: 200K context window",
    detail:
      "Hard ceiling on a single turn. Fails by triggering /compact or transcript truncation. Visible via /context inside the CLI.",
  },
  {
    label: "Meter 2: seven-day quota",
    detail:
      "Rolling utilization fraction at /api/organizations/{org}/usage on claude.ai. Counts overhead bytes again on every cache-miss turn at cache-write rate. Fails by 429. ClaudeMeter polls it once a minute.",
  },
];

const meterRows = [
  {
    feature: "What it bounds",
    ours: "Total tokens loaded into a single turn (200,000 hard ceiling).",
    competitor:
      "Rolling-window utilization across all turns and all devices on this account.",
  },
  {
    feature: "Where you read it",
    ours:
      "/context inside Claude Code, plus context_window.used_percentage on the status line.",
    competitor:
      "claude.ai/settings/usage (or its source endpoint /api/organizations/{org}/usage). Polled by ClaudeMeter every 60 seconds.",
  },
  {
    feature: "How it fails",
    ours: "Triggers /compact or transcript truncation; never returns an error.",
    competitor:
      "Returns 429 from the API path that Claude Code hits, with no client-side warning before the wall.",
  },
  {
    feature: "How overhead lands on it",
    ours:
      "Once per turn, regardless of cache state. 7,850 tokens of stock load is 7,850 tokens of window pressure on every turn.",
    competitor:
      "Once at cache-write rate on cold turns; once at one-tenth rate on warm turns. Multiple cold turns per session means the same overhead is billed several times in a week.",
  },
  {
    feature: "What ClaudeMeter shows",
    ours: "Nothing. /context already covers it.",
    competitor:
      "Live worst-bucket utilization plus the soonest resets_at, color-coded green/amber/red, in the macOS menu bar.",
  },
  {
    feature: "What ccusage shows",
    ours:
      "Indirectly: token sums per JSONL log let you compute per-turn input size.",
    competitor:
      "Local-token sum, useful as a flow measurement; structurally cannot see server-side weighting or browser-chat traffic.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-code-opus-token-usage",
    title: "Why ccusage's Opus tokens never match the server fraction",
    excerpt:
      "Two ledgers. ccusage reads ~/.claude/projects/*.jsonl. seven_day_opus reads what the rate limiter is actually counting. Here is the field map and why the gap is structural, not a bug.",
    tag: "Token math",
  },
  {
    href: "/t/claude-code-hang-status-signal",
    title: "Hung Claude Code: which signal tells you it's a rate-limit",
    excerpt:
      "The status line, /status, and the spinner all read local state. Only /api/organizations/{org}/usage can confirm a server-side wall. How to read each signal in under a minute.",
    tag: "Diagnosis",
  },
  {
    href: "/t/claude-code-rolling-5-hour-usage",
    title: "Rolling 5-hour window, not a calendar window",
    excerpt:
      "Why utilization drifts minute to minute even when you stop sending messages. The bucket ages out continuously; a snapshot from 30 minutes ago is usually wrong.",
    tag: "Drift",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code context overhead: ~7,850 tokens before you type, and the part nobody tells you about your weekly quota",
  description:
    "Anthropic's official simulator quotes the per-component overhead exactly. Sum a stock setup and a Claude Code session starts at 7,850 tokens before your first prompt; eager MCPs push it to 30K-100K. That overhead lands on the 200K context window AND on the seven-day quota meter. On every cache-miss turn, the second meter pays for it again at cache-write rate.",
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

export default function ClaudeCodeContextOverheadPage() {
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
          Claude Code context overhead is{" "}
          <GradientText>~7,850 tokens</GradientText> before you type. The part
          that surprises people: it bills against your weekly quota too.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Anthropic publishes the per-component sizes in its own interactive
          simulator. Sum them and a stock Claude Code session starts at 7,850
          tokens, well before your first prompt. With eager-loaded MCPs, real
          setups land at 30,000 to 100,000 tokens. That overhead lives on the
          200,000-token context window. It also, separately, gets billed
          against the seven-day quota meter on every cache-miss turn. The two
          meters are easy to confuse and ccusage only sees one of them.
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
              Direct answer (verified 2026-05-10)
            </div>
            <p className="text-zinc-800 leading-relaxed text-lg">
              Stock Claude Code overhead is approximately 7,850 tokens before
              the first user prompt: 4,200 system prompt + 680 auto memory +
              280 environment info + 120 MCP tool index + 450 skill
              descriptions + 320 global{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ~/.claude/CLAUDE.md
              </code>{" "}
              + 1,800 project{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                CLAUDE.md
              </code>
              . Numbers per Anthropic&apos;s simulator at{" "}
              <a
                href="https://code.claude.com/docs/en/context-window"
                className="text-teal-600 underline decoration-teal-200 hover:decoration-teal-500"
                target="_blank"
                rel="noreferrer"
              >
                code.claude.com/docs/en/context-window
              </a>
              . Eager-loaded MCP servers push overhead into the 30K to 100K
              range; a five-server setup typically lands near 55,000 tokens
              of tool definitions alone. The same overhead bytes are also
              counted by Anthropic&apos;s seven-day quota meter, at full
              cache-write rate on every cache-miss turn (model switch,{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /compact
              </code>
              , MCP toggle, TTL expiry).
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What loads before your first keystroke
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Anthropic ships an interactive simulator on its own docs site that
          enumerates every auto-loaded component in a Claude Code session,
          with a token count attached to each. The numbers below are pulled
          straight from the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            EVENTS
          </code>{" "}
          array on that page. Treat them as Anthropic-authoritative for a
          stock setup; the only thing you can do to make them smaller is
          shrink your CLAUDE.md files.
        </p>
        <AnimatedCodeBlock
          code={stockOverheadJson}
          language="text"
          filename="Anthropic simulator: kind: 'auto' entries"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Two of these line items are worth a second look. First, the system
          prompt at 4,200 tokens is fixed by Anthropic; you cannot trim it.
          It carries the identity instructions, the tool-use rules, the
          response-formatting rules, and the safety scaffolding. Second, the
          MCP tool index at 120 tokens is the deferred-loading default: only
          tool names ship up front, schemas load on demand when a tool is
          actually needed. That 120-token line is the lazy path. Force the
          eager path and that one number changes a lot.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What pushes 7,850 to 100,000+: eager MCP loads
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Anthropic auto-enables MCP Tool Search when your eager-loaded tool
          definitions would consume more than 10 percent of the context
          window (above 20,000 tokens). That guardrail keeps the worst case
          off most clean installs. But three cases bypass it: setting{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ENABLE_TOOL_SEARCH=false
          </code>
          , using a Claude Code release that predates the feature, or running
          a single MCP server that ships its full schema set as a non-search
          payload. Stack a few of those and you get the numbers below.
        </p>
        <AnimatedCodeBlock
          code={eagerMcpJson}
          language="text"
          filename="Eager-loaded MCP definitions, real-world ranges"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          A user running Jira plus three other heavy MCPs with eager loading
          easily lands at 100,000 tokens of overhead before the conversation
          starts. That is half the 200,000-token window, gone. It is also,
          separately, 100,000 input tokens billed against the seven-day
          quota on the next cache-miss turn. The two costs do not feel like
          the same problem until you look at the meter.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            Two meters, one input
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg mb-6">
            The 200K context window and the seven-day quota are not the same
            constraint. They look at the same overhead bytes from two
            different angles, and they fail in two different ways. The
            window is a hard ceiling per turn; the quota is a rolling
            utilization fraction across all turns from all devices on this
            account in the last seven days. Hitting the first triggers{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              /compact
            </code>{" "}
            or transcript truncation. Hitting the second returns a 429 with
            no client-side warning.
          </p>
          <p className="text-zinc-700 leading-relaxed text-lg">
            Anthropic does not expose per-component breakdowns on the quota
            side. The response shape is plain:
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={usageResponseStruct}
              language="rust"
              filename="claude-meter/src/models.rs"
            />
          </div>
          <p className="text-zinc-700 leading-relaxed text-lg mt-6">
            Each of those{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              Window
            </code>{" "}
            structs is exactly two fields:{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              utilization
            </code>{" "}
            (a float between 0 and 1+) and{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              resets_at
            </code>{" "}
            (when the oldest chargeable traffic in the bucket ages out).
            Whatever overhead just landed in your last turn shows up as a
            delta on{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day_opus.utilization
            </code>
            , with no telemetry pointing back at &quot;system prompt&quot;
            or &quot;tool definitions&quot; or &quot;file read.&quot; That
            is why context-overhead choices feel disconnected from quota
            outcomes; the server collapses them into one float.
          </p>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The 200K window vs the seven-day quota, side by side
        </h2>
        <ComparisonTable
          productName="200K context window"
          competitorName="Seven-day quota"
          rows={meterRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The cache-miss tax: why your overhead bills more than once
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-8">
          Anthropic&apos;s prompt cache is what makes the per-turn overhead
          tolerable. Cache reads bill at 10 percent of the input rate; cache
          writes bill at 125 percent of plain input. So the first cold turn
          of a session pays full price on the overhead, the next handful of
          warm turns pay a tenth of it, and anything that invalidates the
          cache restarts the cycle. The five things that invalidate it are
          worth memorizing.
        </p>
        <StepTimeline steps={cacheMissSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Read your own breakdown with{" "}
          <code className="bg-zinc-100 px-2 py-0.5 rounded font-mono">/context</code>
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The numbers above are Anthropic&apos;s baseline. Yours will differ
          based on your CLAUDE.md size, MCP load, and how much of the
          conversation has accumulated. Inside an active Claude Code
          session, type{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /context
          </code>
          . The output is a per-component breakdown of the live window with
          token counts and percentages.
        </p>
        <TerminalOutput
          title="claude /context, mid-refactor session"
          lines={contextTerminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Run{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /context
          </code>{" "}
          twice ten minutes apart and the deltas tell you which file reads
          and tool outputs are doing the work. If the first three lines (the
          stock overhead) look much larger than the simulator numbers above,
          that is your CLAUDE.md or your MCP load, and that is where the
          easy savings live.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          How a single Claude Code turn flows through both meters
        </h2>
        <FlowDiagram
          title="One input, two meters, two failure modes"
          steps={flowSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The quota side is what ClaudeMeter shows
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Anthropic ships{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /context
          </code>{" "}
          for the window side. It does not ship anything for the quota side
          in the CLI. To see whether your last cold turn actually moved{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus.utilization
          </code>{" "}
          from 0.62 to 0.71, you have to either curl the endpoint by hand or
          run something that polls it for you. ClaudeMeter polls the same{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          endpoint claude.ai/settings/usage renders, every 60 seconds,
          through your existing browser session. The macOS menu bar shows
          the worst bucket (five_hour or seven_day_opus, whichever is
          higher) plus the soonest{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>
          .
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          That makes the cache-miss tax visible in real time. Toggle an MCP
          server, watch the next turn land, watch the bar tick. Run{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /compact
          </code>{" "}
          mid-session, watch the bar tick again. Trim CLAUDE.md, watch the
          bar tick more slowly over the next afternoon. It is the closed
          loop between context-overhead choices and quota-meter outcomes
          that{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /context
          </code>{" "}
          alone cannot show you because it does not look at the server.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          One install (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            brew install --cask m13v/tap/claude-meter
          </code>
          ) plus the browser extension, no cookie paste, MIT licensed, no
          telemetry, single HTTPS request per minute to claude.ai using
          your own session. The extension picks up the session that is
          already in your browser; the menu-bar app listens on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            127.0.0.1:63762
          </code>{" "}
          for snapshots.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Your Claude Code overhead looks fine in /context but you keep hitting the weekly wall. Want a 15-minute walkthrough?"
          description="Bring a session log and a screenshot of your menu bar. We'll trace which cache-miss pattern is moving your seven_day_opus fraction faster than ccusage suggests."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-20 mb-24">
        <RelatedPostsGrid
          title="More on the gap between local and server"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Context overhead landing on your weekly quota? Walk through a session."
      />
    </article>
  );
}
