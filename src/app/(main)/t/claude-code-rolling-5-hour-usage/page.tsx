import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  AnimatedChecklist,
  GlowCard,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-code-rolling-5-hour-usage";
const PUBLISHED = "2026-05-01";

export const metadata: Metadata = {
  title:
    "Claude Code rolling 5-hour usage: three ledgers, three answers, none of them /usage by itself",
  description:
    "How to actually see your rolling 5-hour usage when you run Claude Code. Built-in /usage is a snapshot that interrupts your loop. Local-token tools (ccusage) only see Claude Code traffic. Browser-chat depletes the same five_hour bucket and only one ledger sees both halves.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code rolling 5-hour usage: three ledgers, three answers, none of them /usage by itself",
    description:
      "Built-in /usage prints a snapshot. ccusage reads the local JSONL. The float that 429s your loop is on claude.ai's server and counts your browser-chat usage too. Here is which tool reads which.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code rolling 5-hour usage", url: PAGE_URL },
];

const faqs = [
  {
    q: "What is the rolling 5-hour usage in Claude Code?",
    a: "It is a 5-hour sliding window. The clock starts when you send your first prompt, and at any moment the bucket measures the cost of all your activity in the last 5 hours. The bucket fills based on a server-side weighting (per model, peak-hour multiplier, attachments, tool calls), not on raw token counts. When the bucket crosses 1.0, every further prompt from your org returns 429 until the earliest unexpired message ages out. Per Anthropic's help docs, claude.ai chat and Claude Code share this same bucket on Pro and Max plans.",
  },
  {
    q: "How do I see my rolling 5-hour usage from inside Claude Code?",
    a: "Type /usage at the Claude Code prompt. It is a snapshot of session percentage, weekly percentage, and any extra-usage balance. It interrupts whatever you were doing, prints once, and does not update. The same Help Center note that introduces /status says nothing about how to read the rolling window itself; for a live always-visible meter you need a tool that polls the same endpoint /usage is reading, but does it from outside the CLI so it does not block your loop.",
  },
  {
    q: "What does /usage actually read under the hood?",
    a: "The OAuth-authenticated endpoint at api.anthropic.com/api/oauth/usage. The cookie-authenticated equivalent that claude.ai/settings/usage uses is GET claude.ai/api/organizations/{org_uuid}/usage. Both return a JSON object with a five_hour field that has utilization (a float between 0 and 1, or sometimes 0 and 100 in the same payload) and resets_at (an ISO timestamp). Same shape, two auth paths. Pick whichever matches the credential you already have.",
  },
  {
    q: "Why does ccusage say 5% used while Claude Code 429s me?",
    a: "Different ledgers. ccusage walks ~/.claude/projects/*.jsonl and totals input_tokens + output_tokens across every session on this machine. The 429 is decided by the server-side five_hour utilization, which factors in browser-chat usage, per-model weights (Opus is heavier than Sonnet on the same byte count), the peak-hour multiplier Anthropic announced in late 2025, attachments, and tool-call overhead. The two numbers can drift by 30 to 40 points and still both be correct readings of what they actually measure.",
  },
  {
    q: "Does my claude.ai browser chat eat into my Claude Code rolling 5-hour usage?",
    a: "Yes. Anthropic's help article 'Using Claude Code with your Pro or Max plan' is explicit: claude.ai chat and Claude Code share the same usage pool on subscription plans. If you draft a PR description in the chat tab and then run an agentic loop in Claude Code, both deplete the same five_hour bucket. Local-token tools like ccusage and Claude-Code-Usage-Monitor only see the Claude Code half because the JSONL files do not exist for browser sessions.",
  },
  {
    q: "Can I see the rolling 5-hour usage without typing /usage every time?",
    a: "Yes, but not from inside Claude Code. The CLI does not have a passive status line that updates while you work. Three ways out: (1) watch claude.ai/settings/usage in a tab, (2) install a local-token monitor like ccusage --watch (sees only your Claude Code traffic, will lag the server), (3) install a server-quota monitor that polls the same endpoint /usage reads but from outside the CLI. ClaudeMeter is the third path: it polls /api/organizations/{org}/usage every 60 seconds (POLL_INTERVAL at src/bin/menubar.rs:18, POLL_MINUTES at extension/background.js:3) and renders the float in the macOS menu bar so you can glance at it during the loop.",
  },
  {
    q: "Is the rolling window per-machine or per-account?",
    a: "Per-account, more precisely per-organization. The five_hour bucket is computed on the server and keyed off your org_uuid. If you run Claude Code on a laptop and a desktop logged into the same Anthropic account, both deplete the same bucket. If you also chat in a browser, that adds to the same bucket. ccusage on the laptop will only ever see the laptop's local Claude Code traffic, so on a multi-machine or chat-heavy day it underestimates the rolling 5-hour usage by a lot.",
  },
  {
    q: "What does the /usage output actually look like?",
    a: "Per third-party walkthroughs (the official help docs are sparse): three numbers in one block, current session percentage, current week percentage, and any extra-usage balance from Anthropic's metered fall-through. It does not show a countdown to the rolling 5-hour reset and it does not stream. You read it once and go back to coding. If you want the resets_at timestamp the server actually returns, you have to read it from the underlying endpoint yourself or use a tool that surfaces it.",
  },
  {
    q: "Does Anthropic block tools that poll /api/organizations/{org}/usage?",
    a: "It is your own session calling the same endpoint claude.ai/settings/usage already calls every time you open the page. ClaudeMeter polls once per minute per browser, well below normal browsing traffic. The endpoint is undocumented, which means Anthropic can rename fields, not that they prohibit reading them. The Rust types in src/models.rs declare every Window field as Option, so when fields change the next brew release patches them in one line.",
  },
  {
    q: "What is the right pair of tools for someone running agentic Claude Code loops?",
    a: "Run a local-token tool (ccusage) and a server-quota tool (ClaudeMeter, or ccusage with the OAuth flag) at the same time. The first answers 'what did this machine spend?'. The second answers 'when does my next prompt 429?'. Treating them as alternatives is a category error; they read non-overlapping sources and give you complementary data. The /usage slash command is fine as a one-shot sanity check but it will not save you from a mid-refactor 429 because by the time you remember to type it, you are already at 91 percent.",
  },
];

const usageSlashCommandLines = [
  { type: "command" as const, text: "$ claude" },
  { type: "output" as const, text: "Claude Code 1.0.x" },
  { type: "command" as const, text: "> finish the refactor in src/ingest.rs" },
  { type: "info" as const, text: "(working...)" },
  { type: "command" as const, text: "> /usage" },
  { type: "output" as const, text: "Session: 73%" },
  { type: "output" as const, text: "Week:    41%" },
  { type: "output" as const, text: "Extra:   $0.00" },
  { type: "info" as const, text: "(snapshot. printed once. does not update. interrupted whatever was running.)" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "> /usage" },
  { type: "output" as const, text: "Session: 73%" },
  { type: "info" as const, text: "(typed it 30 seconds later, same number. it is not live.)" },
];

const ccusageLines = [
  { type: "command" as const, text: "$ ccusage daily" },
  { type: "output" as const, text: "2026-05-01  Sonnet  127k  Opus  41k  total 168k" },
  { type: "info" as const, text: "(reads ~/.claude/projects/*.jsonl, sums tokens this CLI sent.)" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "$ ccusage --watch" },
  { type: "output" as const, text: "ccusage 0.x" },
  { type: "output" as const, text: "Session  168,420 tokens · 5%" },
  { type: "info" as const, text: "(your Claude Code traffic this session, in tokens. nothing else.)" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "$ claude code 'apply the patch'" },
  { type: "error" as const, text: "Error: rate limit reached. retry in 1h47m." },
  { type: "info" as const, text: "(ccusage at 5%, the server at 100%. ccusage cannot see browser-chat or weighting.)" },
];

const serverQuotaLines = [
  { type: "command" as const, text: "# what claude.ai/api/organizations/{org_uuid}/usage actually returns:" },
  {
    type: "output" as const,
    text: '{ "five_hour":   { "utilization": 91.4, "resets_at": "2026-05-01T19:14:00Z" },',
  },
  { type: "output" as const, text: '  "seven_day":   { "utilization": 64.2, "resets_at": "2026-05-05T08:00:00Z" },' },
  { type: "output" as const, text: '  "seven_day_opus": { "utilization": 78.6, "resets_at": "2026-05-05T08:00:00Z" } }' },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# the same number, in the menu bar, on the same minute, no command typed:" },
  { type: "output" as const, text: "Claude  5h [91%]  ·  7d 64%" },
  { type: "info" as const, text: "(painted orange because 91 is past the 80 warn threshold.)" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "$ claude-meter status --json | jq '.usage.five_hour'" },
  { type: "output" as const, text: '{ "utilization": 91.4, "resets_at": "2026-05-01T19:14:00Z" }' },
  { type: "success" as const, text: "live, machine-readable, drop into Starship/tmux/Fig." },
];

const backgroundJsExcerpt = `// extension/background.js, the seven lines that read the same float /usage prints
const BASE = "https://claude.ai";
const POLL_MINUTES = 1;

async function fetchJSON(url) {
  const r = await fetch(url, {
    credentials: "include",                 // <- the trick: reuse the existing cookie
    headers: { "accept": "application/json" },
  });
  if (!r.ok) throw new Error(\`\${r.status} \${r.statusText} @ \${url}\`);
  return r.json();
}

// Then once per minute:
//   const usage = await fetchJSON(\`\${BASE}/api/organizations/\${org}/usage\`);
//   const five  = usage.five_hour.utilization;
//   const reset = usage.five_hour.resets_at;
//
// usage.five_hour is the same float Claude Code's /usage prints as "Session: 73%".
// The difference is this code does not interrupt your loop and runs every 60s.`;

const ledgerRows = [
  {
    feature: "How you read it",
    ours: "Always-visible menu bar chip + claude-meter status JSON. No command typed.",
    competitor:
      "/usage at the Claude Code prompt (interrupts the loop) or ccusage --watch (terminal pane).",
  },
  {
    feature: "What it actually queries",
    ours:
      "GET claude.ai/api/organizations/{org_uuid}/usage (or /api/oauth/usage). Server-truth.",
    competitor:
      "/usage: same server endpoint, snapshot only. ccusage: ~/.claude/projects/*.jsonl on disk.",
  },
  {
    feature: "Live or snapshot?",
    ours: "Live. Polled every 60s (POLL_INTERVAL src/bin/menubar.rs:18).",
    competitor:
      "/usage: snapshot, you re-type it. ccusage --watch: live but only on local tokens.",
  },
  {
    feature: "Sees browser-chat usage on the same plan?",
    ours: "Yes. The five_hour bucket counts every prompt against your plan, regardless of source.",
    competitor:
      "/usage: yes, it reads the same bucket. ccusage: no. JSONL only has Claude Code traffic.",
  },
  {
    feature: "Sees per-model weighting and peak-hour multiplier?",
    ours: "Yes. The server returns post-weighting utilization.",
    competitor:
      "/usage: yes. ccusage: no, it counts raw tokens.",
  },
  {
    feature: "Multi-machine?",
    ours: "Yes. The bucket is per-org, so any machine that polls sees the same number.",
    competitor:
      "/usage: yes. ccusage: only this machine's JSONL.",
  },
  {
    feature: "Predicts the 429 before you hit it?",
    ours: "Yes, at 80% threshold. The chip turns orange before the next prompt fails.",
    competitor:
      "/usage: only if you remember to type it. ccusage: no, the local count and server count diverge.",
  },
  {
    feature: "Cost",
    ours: "Free. MIT.",
    competitor: "/usage: built into Claude Code. ccusage: free, MIT.",
  },
];

const invariants = [
  {
    text: "/usage is a snapshot. It prints session percent, week percent, extra-usage balance, then returns control. It does not update. If you want a live meter you need something that polls the same endpoint /usage reads, but from outside the CLI.",
  },
  {
    text: "Browser-chat and Claude Code share the same five_hour bucket on Pro and Max. Local-token tools (ccusage, Claude-Code-Usage-Monitor) read ~/.claude/projects/*.jsonl, which only contains Claude Code traffic. They are blind to the chat half of the same bucket.",
  },
  {
    text: "The 429 fires on server-side utilization. Any tool that does not call /api/organizations/{org_uuid}/usage (or /api/oauth/usage with the OAuth beta header) is structurally unable to predict it. Local token counts and server utilization can drift 30-40 points and both still be correct.",
  },
  {
    text: "The bucket is rolling, not sliding. resets_at is a wall-clock timestamp that slides forward as you keep sending messages. Stopping for 5 hours from now is not the reset; the earliest unexpired message ageing out is.",
  },
  {
    text: "An Anthropic API key from console.anthropic.com cannot read this. The console API key sees console spend, not plan quota. Trackers that ask for an API key are reading a different ledger and will never see the rolling 5-hour bucket.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-code-usage-tracker",
    title: "Claude Code usage tracker: there are two of them, run both",
    excerpt:
      "ccusage and ClaudeMeter measure non-overlapping things. The full walk through the gap and the seven lines of background.js that close it.",
    tag: "Tracker pair",
  },
  {
    href: "/t/claude-rolling-5-hour-burn-rate",
    title: "Burn rate is delta of utilization, not tokens per minute",
    excerpt:
      "The only correct burn rate for the rolling 5-hour window is delta-u over delta-t between server polls. The math, the file, and why ccusage cannot compute it.",
    tag: "Burn rate",
  },
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "Why ccusage and claude.ai disagree on your usage percent",
    excerpt:
      "Peak-hour multiplier, per-model weights, attachments, tool calls, browser-chat. Five reasons local tokens and server utilization diverge.",
    tag: "Local vs server",
  },
  {
    href: "/t/claude-5-hour-server-side-wall",
    title: "The 5-hour server-side wall is three walls, not one",
    excerpt:
      "When Claude 429s at the 5-hour mark, three separate conditions across two endpoints can fire identical errors. Here is each layer with field names.",
    tag: "Three walls",
  },
];

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline:
                "Claude Code rolling 5-hour usage: three ledgers, three answers, none of them /usage by itself",
              description:
                "How to see your rolling 5-hour usage when you run Claude Code. /usage is a snapshot, ccusage only sees Claude Code traffic, and the float that decides your next 429 lives on the server. Three ledgers picked apart.",
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "ClaudeMeter",
              publisherUrl: "https://claude-meter.com",
              articleType: "TechArticle",
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema(
              breadcrumbs.map((b) => ({ name: b.name, url: b.url }))
            )
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema(faqs.map((f) => ({ q: f.q, a: f.a })))),
        }}
      />

      <Breadcrumbs
        items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))}
        className="pt-8"
      />

      <header className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          Claude Code rolling 5-hour usage:{" "}
          <GradientText>three ledgers</GradientText>, three answers, and /usage is only one of them
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          You probably came here from a thread asking how to watch the rolling
          5-hour bucket while Claude Code is running. There is no single right
          answer because three tools read three different sources. This page
          walks each one with its actual field path, calls out the part most
          posts get wrong (browser-chat depletes the same bucket), and tells
          you which pair to run together so you stop being surprised by
          mid-loop 429s.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="6 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-01)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            Type <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">/usage</code> at
            the Claude Code prompt for a snapshot. Run{" "}
            <a
              href="https://github.com/ryoppippi/ccusage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              ccusage
            </a>{" "}
            for what your CLI sent on this machine. Run a server-quota tool
            like{" "}
            <a
              href="https://github.com/m13v/claude-meter"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              ClaudeMeter
            </a>{" "}
            for the live float Anthropic actually checks before throwing 429.
            All three read different ledgers. The third one is the only one
            that sees your browser-chat usage, which depletes the same{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              five_hour
            </code>{" "}
            bucket per Anthropic{"'"}s help docs. Source for the cookie path is
            verifiable at{" "}
            <a
              href="https://github.com/m13v/claude-meter/blob/main/extension/background.js"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              extension/background.js
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Ledger 1: <span className="text-teal-700">/usage</span> inside Claude Code
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Claude Code ships a built-in slash command. Type{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          inside an active session and it prints a three-line snapshot:
          current session percentage, current week percentage, any extra-usage
          balance. That is the entire output. It does not stream, it does not
          show the rolling 5-hour countdown, and it interrupts whatever
          long-running task you typed it on top of.
        </p>
        <TerminalOutput
          title="What /usage prints, and what it does not"
          lines={usageSlashCommandLines}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Under the hood it is calling Anthropic{"'"}s OAuth-authenticated
          endpoint at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            api.anthropic.com/api/oauth/usage
          </code>
          {" "}with the Bearer token Claude Code already has, plus the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            anthropic-beta: oauth-2025-04-20
          </code>{" "}
          header. The cookie-authenticated equivalent that{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          uses is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET claude.ai/api/organizations/&#123;org_uuid&#125;/usage
          </code>
          . Same JSON shape, two auth paths.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          shows you the value once. Anything that wants a live meter needs to
          poll one of those two endpoints itself.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Ledger 2: ccusage and other local-token tools
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The most-recommended Claude Code usage tools in 2026 are{" "}
          <a
            href="https://github.com/ryoppippi/ccusage"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            ccusage
          </a>{" "}
          and{" "}
          <a
            href="https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            Claude-Code-Usage-Monitor
          </a>
          . Both walk{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/*.jsonl
          </code>{" "}
          and total the tokens your Claude Code CLI has sent on this machine.
          That is a faithful, complete record of one channel and an excellent
          way to attribute spend to a specific session, project, or model.
        </p>
        <TerminalOutput
          title="What ccusage sees, and what it cannot see"
          lines={ccusageLines}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          What it cannot see is the rest of the rolling 5-hour bucket. Per
          Anthropic{"'"}s help article{" "}
          <a
            href="https://support.claude.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            Using Claude Code with your Pro or Max plan
          </a>
          , claude.ai chat and Claude Code share the same usage pool. If you
          drafted a PR description in the browser tab this morning, that
          drafting depleted the same{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          bucket your loop is now hitting. ccusage will not see it because
          there is no JSONL on disk for browser sessions. Same on a multi-
          machine setup: ccusage on your laptop knows nothing about the
          desktop. Recent ccusage versions added an OAuth flag that calls the
          server endpoint directly, which closes this gap, but plain ccusage
          watching JSONL does not.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Ledger 3: the float that 429s your loop
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The number Anthropic{"'"}s rate limiter actually compares against 1.0
          before it 429s your next prompt is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            usage.five_hour.utilization
          </code>{" "}
          on the response from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET /api/organizations/&#123;org_uuid&#125;/usage
          </code>
          . Same field{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          prints as the session percentage. Same field{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          renders as the bar. The trick is reading it without typing a slash
          command and without opening a browser tab.
        </p>
        <TerminalOutput
          title="The same float, live, no slash command"
          lines={serverQuotaLines}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-6">
          The thing every other server-quota tracker stumbles on is auth.
          Three common patterns: paste your{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            sessionKey
          </code>{" "}
          from DevTools, sign into claude.ai inside an embedded webview, or
          hand over a console API key (which sees console spend, never plan
          quota). All three add a manual step the user has to redo when the
          cookie rotates. A real Manifest V3 extension running inside the same
          Chromium browser you are already logged into has a fourth option, and
          it is one keyword on a fetch call:
        </p>
        <AnimatedCodeBlock
          code={backgroundJsExcerpt}
          language="javascript"
          filename="extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The browser attaches the existing claude.ai cookie to the request the
          same way it would for any tab on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>
          . No paste. No second sign-in. No console API key. The endpoint
          returns eight Window structs (rolling 5-hour, plus seven 7-day
          buckets including Sonnet-specific and Opus-specific) and an{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extra_usage
          </code>{" "}
          block for the April 2026 metered-billing fall-through, all typed in{" "}
          <a
            href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            src/models.rs
          </a>
          . The macOS menu bar polls every 60 seconds (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            POLL_INTERVAL
          </code>{" "}
          at{" "}
          <a
            href="https://github.com/m13v/claude-meter/blob/main/src/bin/menubar.rs"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            src/bin/menubar.rs:18
          </a>
          ).
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Three ledgers, eight rows that distinguish them
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          /usage is the easiest to reach (it is in the CLI), ccusage is the
          most precise on local spend, ClaudeMeter is the only one that runs
          live without a typed command. They are not alternatives.
        </p>
        <ComparisonTable
          productName="Live server-quota meter (ClaudeMeter)"
          competitorName="/usage and local-token tools (ccusage, Claude-Code-Usage-Monitor)"
          rows={ledgerRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Five things to remember before you pick a tool
        </h2>
        <AnimatedChecklist
          title="Mental model for the rolling 5-hour bucket"
          items={invariants}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Install path, the 60-second version
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Read this from your phone, install later from a Mac. The full path
          is one brew command plus a one-time browser-extension load. Both
          halves are open source on GitHub.
        </p>
        <GlowCard>
          <div className="p-6 sm:p-7">
            <ol className="space-y-5 text-zinc-800 leading-relaxed">
              <li>
                <span className="block text-xs font-mono uppercase tracking-widest text-teal-700 mb-1">
                  Step 1
                </span>
                <code className="bg-zinc-100 px-2 py-1 rounded text-sm font-mono">
                  brew install --cask m13v/tap/claude-meter
                </code>
                <span className="block text-sm text-zinc-600 mt-1">
                  Drops the macOS menu bar app and the{" "}
                  <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs">
                    claude-meter
                  </code>{" "}
                  CLI in one command.
                </span>
              </li>
              <li>
                <span className="block text-xs font-mono uppercase tracking-widest text-teal-700 mb-1">
                  Step 2
                </span>
                Load the unpacked browser extension from{" "}
                <a
                  href="https://github.com/m13v/claude-meter/tree/main/extension"
                  className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
                >
                  github.com/m13v/claude-meter/tree/main/extension
                </a>{" "}
                into Chrome, Arc, Brave, or Edge. The extension is what
                forwards your existing claude.ai cookie so the menu bar app
                does not need a second sign-in.
                <span className="block text-sm text-zinc-600 mt-1">
                  Or pull the prebuilt zip from{" "}
                  <a
                    href="https://github.com/m13v/claude-meter/releases"
                    className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
                  >
                    Releases
                  </a>
                  .
                </span>
              </li>
              <li>
                <span className="block text-xs font-mono uppercase tracking-widest text-teal-700 mb-1">
                  Step 3
                </span>
                Visit{" "}
                <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs">
                  claude.ai
                </code>{" "}
                once so the extension can pick up your session. Within about
                60 seconds the menu bar shows your rolling 5-hour percent and
                the resets-at countdown. Type{" "}
                <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs">
                  claude-meter status --json
                </code>{" "}
                from any shell to drop the same number into a status line.
              </li>
            </ol>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <FaqSection
          heading="Common questions about the rolling 5-hour bucket"
          items={faqs}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="More on the same buckets, the same fields, and the same wall."
          posts={relatedPosts}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Hitting the wall mid-refactor and not sure why?"
          description="If your team runs Claude Code in agentic loops and the rolling 5-hour math keeps surprising you, book a 20-minute call and I will help you wire the right meter into your workflow."
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Book a call: stop guessing when your next Claude Code prompt 429s."
      />
    </article>
  );
}
