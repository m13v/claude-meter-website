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

const PAGE_URL = "https://claude-meter.com/t/claude-code-opus-token-usage";
const PUBLISHED = "2026-05-08";

export const metadata: Metadata = {
  title:
    "Claude Code Opus token usage: the local-token sum and the server fraction never match (and only one decides your next 429)",
  description:
    "Claude Code on Opus has two different 'token usage' numbers. ccusage sums local JSONL tokens. The server endpoint that rate-limits you returns only a utilization fraction, no raw token count. Here is why they diverge and how to read both at once.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code Opus token usage: two numbers, and only one decides your next 429",
    description:
      "Local JSONL token sums (ccusage) and the server's seven_day_opus fraction measure different things. The server response has zero raw token counts. Here is the field map.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Does Anthropic's usage endpoint return a raw Opus token count?",
    a: "No. The endpoint is GET https://claude.ai/api/organizations/{org_uuid}/usage, the same one claude.ai/settings/usage renders behind the bar charts. Per ClaudeMeter's Rust model in src/models.rs lines 3-7, the Window struct that represents each bucket has exactly two fields: utilization (f64) and resets_at (Option<DateTime<Utc>>). The seven_day_opus key on the response uses that same Window. There is nowhere on the response to read 'tokens used' or 'tokens remaining' as integers. Any tool that claims to read your live server-side Opus tokens is reading something else (typically your local JSONL).",
  },
  {
    q: "Then what does ccusage actually show me?",
    a: "ccusage reads ~/.claude/projects/**/*.jsonl on your machine and sums the input, output, cache_creation, and cache_read token counts that Claude Code wrote to those files when it streamed. With --model opus it filters to records where model is claude-opus-* and shows that subset. Those numbers are accurate as a local accounting of what your CLI sent and received, but they are not the number Anthropic checks before deciding whether to 429 your next Opus request. Two different ledgers.",
  },
  {
    q: "Why don't ccusage's tokens add up to the server's utilization?",
    a: "Three reasons documented in Anthropic's Opus 4.7 release notes and visible in actual usage data. First, the 4.7 tokenizer maps the same text to 1.0x to 1.35x as many tokens as 4.6 did. That expansion runs server-side, after Claude Code has already written its JSONL line. Your local sum sees the pre-expansion count. Second, adaptive thinking on Opus 4.7 generates thinking tokens that count against your seven_day_opus float; those tokens are not always written to JSONL in full. Third, your Opus quota is also touched by browser-chat sessions on claude.ai, which never write to a Claude Code JSONL at all. ccusage cannot see those.",
  },
  {
    q: "Then how do I read 'real' Opus token usage at all?",
    a: "Read both numbers, side by side, and treat them as different signals. ccusage --model opus shows what your Claude Code CLI sent on this machine, in tokens. claude.ai/settings/usage (or any tool that polls /api/organizations/{org}/usage, like ClaudeMeter) shows the seven_day_opus utilization the rate limiter actually checks, in a fraction. The first answers 'what did I send'. The second answers 'will my next Opus request 200, meter to overage, or 429'. Both are useful. Neither is a substitute for the other.",
  },
  {
    q: "Does /usage inside Claude Code show server-truth Opus tokens?",
    a: "No. Typing /usage inside an active Claude Code session prints a snapshot of your session and weekly percentages, but it interrupts the loop and gives you a fraction, not a token count. It also reads through Claude Code's own session, so it does not see browser-chat usage, and it cannot see what other Claude Code sessions on other machines have used against the same org. It is fine for a one-off check. It is not a continuous meter.",
  },
  {
    q: "What about Claude-Code-Usage-Monitor or other local-only tools?",
    a: "Claude-Code-Usage-Monitor and similar tools also tail ~/.claude/projects/*.jsonl. They are slightly different presentations of the same local data ccusage reads. They share the same blind spots: no tokenizer expansion, no full thinking-token accounting, no browser-chat visibility. A user who relies on a local-only tool and then gets rate-limited mid-session almost always sees this gap close to zero on the local count and close to 1.0 on the server fraction.",
  },
  {
    q: "Can I just multiply ccusage's Opus output by 1.35x to get the server number?",
    a: "Not reliably. The 1.0x to 1.35x expansion is not a fixed multiplier. It varies by content type (code, prose, JSON, markdown all hit different ratios) and Anthropic does not publish the per-content-type weighting. On top of that, the seven_day_opus fraction is not raw tokens divided by a fixed ceiling: it is utilization, and the denominator depends on your plan tier (Pro, Max 5x, Max 20x). Multiplying ccusage by 1.35 gives a worst-case input estimate. It does not reproduce the server fraction.",
  },
  {
    q: "Where exactly does ClaudeMeter read the Opus number from?",
    a: "From the same JSON returned by GET https://claude.ai/api/organizations/{org}/usage, then it deserializes that into the UsageResponse struct in src/models.rs. The relevant key is seven_day_opus, which is an Option<Window>. The popup at extension/popup.js line 63 conditionally renders that window if present. The Rust CLI exposes the same field via claude-meter status. No raw Opus token count appears anywhere in the pipeline because the server does not return one.",
  },
  {
    q: "If the server doesn't expose tokens, how does it bill extra-usage in dollars?",
    a: "Anthropic computes extra-usage credits server-side from the same token counts they use to update utilization, but they only expose used_credits and monthly_limit on the overage_spend_limit endpoint, not the raw tokens. So you can see your overage spend tick up in dollars without ever seeing how many extra Opus tokens that came from. ClaudeMeter pulls overage_spend_limit alongside the usage payload (src/api.rs lines 31 to 45) and shows the dollar figure. The token-to-dollar ratio is not exposed.",
  },
  {
    q: "Does the same divergence apply to Sonnet, or only Opus?",
    a: "Same shape, different magnitude. seven_day_sonnet exists on the same usage payload. Sonnet token usage from ccusage and the seven_day_sonnet fraction also disagree, but the gap tends to be smaller because Sonnet adaptive thinking is less aggressive than Opus 4.7's. The structural answer is identical though: the server returns utilization, never raw tokens, for any model.",
  },
  {
    q: "What's the smallest setup to see both numbers without writing my own poller?",
    a: "Two commands. brew install ryoppippi/tap/ccusage gives you the local JSONL summary. brew install --cask m13v/tap/claude-meter plus the browser extension gives you the live seven_day_opus fraction in the macOS menu bar. The extension picks up your existing claude.ai session, so there is no cookie paste step. Run ccusage when you want the raw token breakdown by model and project. Glance at the menu bar to know whether your next Opus request will go through.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t/claude-code-usage-tracker" },
  { name: "Claude Code Opus token usage", url: PAGE_URL },
];

const usageStruct = `// claude-meter/src/models.rs, lines 3-7
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}

// And the response that wraps it, lines 18-28
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:           Option<Window>,
    pub seven_day:           Option<Window>,
    pub seven_day_sonnet:    Option<Window>,
    pub seven_day_opus:      Option<Window>,
    pub seven_day_oauth_apps:Option<Window>,
    pub seven_day_omelette:  Option<Window>,
    pub seven_day_cowork:    Option<Window>,
    pub extra_usage:         Option<ExtraUsage>,
}`;

const ccusageOutput = [
  { text: "ccusage --model opus", type: "command" as const },
  { text: "Period: last 7 days", type: "output" as const },
  { text: "Project        Input      Output    Cache R   Cache W   Total tokens", type: "output" as const },
  { text: "claude-meter   84,210    312,884    920,118    14,700    1,331,912", type: "output" as const },
  { text: "site-redo      62,540    287,421    705,332     9,840    1,065,133", type: "output" as const },
  { text: "scratch        18,701     94,002    192,704     3,120      308,527", type: "output" as const },
  { text: "----------------------------------------------------------------", type: "output" as const },
  { text: "totals        165,451    694,307  1,818,154    27,660    2,705,572", type: "output" as const },
  { text: "this is a local sum from ~/.claude/projects/*.jsonl", type: "info" as const },
  { text: "the server's rate limiter does not check this number", type: "info" as const },
];

const meterStatus = [
  { text: "claude-meter status --json | jq '.usage'", type: "command" as const },
  { text: "{", type: "output" as const },
  { text: '  "five_hour":        { "utilization": 0.41, "resets_at": "2026-05-08T18:02:00Z" },', type: "output" as const },
  { text: '  "seven_day":        { "utilization": 0.62, "resets_at": "2026-05-12T09:00:00Z" },', type: "output" as const },
  { text: '  "seven_day_sonnet": { "utilization": 0.18, "resets_at": "2026-05-12T09:00:00Z" },', type: "output" as const },
  { text: '  "seven_day_opus":   { "utilization": 0.94, "resets_at": "2026-05-12T09:00:00Z" },', type: "output" as const },
  { text: '  "extra_usage":      { "is_enabled": true, "used_credits": 4.20, "monthly_limit": 40 }', type: "output" as const },
  { text: "}", type: "output" as const },
  { text: "no token field exists on this payload, only fractions", type: "info" as const },
  { text: "seven_day_opus at 0.94 is the number that decides your next Opus 429", type: "info" as const },
];

const tableRows = [
  {
    feature: "Where does the data come from?",
    competitor: "~/.claude/projects/*.jsonl on this machine",
    ours: "claude.ai/api/organizations/{org}/usage (server)",
  },
  {
    feature: "What units does it report?",
    competitor: "Raw input/output/cache token counts",
    ours: "A utilization fraction (0.0 to 1.0+), no raw tokens",
  },
  {
    feature: "Sees browser-chat usage?",
    competitor: "No. Browser chats never write a JSONL.",
    ours: "Yes. Server tracks all Opus traffic against the org.",
  },
  {
    feature: "Includes 4.7 tokenizer expansion?",
    competitor: "No. JSONL is written before server expansion.",
    ours: "Yes. Expansion is applied before utilization is updated.",
  },
  {
    feature: "Includes thinking tokens?",
    competitor: "Partial. JSONL writes are inconsistent.",
    ours: "Yes. Generated server-side, written to seven_day_opus.",
  },
  {
    feature: "Sees other machines on the same org?",
    competitor: "No. Only this machine's CLI traffic.",
    ours: "Yes. Org-scoped server count.",
  },
  {
    feature: "Is it the number that decides the next 429?",
    competitor: "No. The rate limiter never reads JSONL.",
    ours: "Yes. The rate limiter reads this float.",
  },
];

const honestPairing = {
  title: "What each tool can and can't tell you",
  items: [
    { text: "ccusage --model opus is the only way to see raw token counts broken down by project and message type" },
    { text: "ccusage cannot see browser-chat usage, server-side tokenizer expansion, or thinking tokens that didn't make it into JSONL" },
    { text: "claude.ai/settings/usage and ClaudeMeter both read seven_day_opus.utilization, the float that gates your next request" },
    { text: "Neither one gives you a raw 'tokens left on Opus' integer; the server does not expose one" },
    { text: "The honest answer to 'what is my Opus token usage' is two numbers, not one" },
  ],
};

const relatedPosts = [
  {
    title: "Claude Code Opus 4.7 usage limits: the two server floats that gate you",
    href: "/t/claude-code-opus-4-7-usage-limits",
    excerpt:
      "The 4.7 tokenizer's 1.0x to 1.35x expansion explained, plus the seven_day_opus field path.",
    tag: "Opus 4.7",
  },
  {
    title: "Claude Code rolling 5-hour usage: three ledgers, three answers",
    href: "/t/claude-code-rolling-5-hour-usage",
    excerpt:
      "How /usage, ccusage, and ClaudeMeter all answer 'where am I in the 5-hour window' differently.",
    tag: "Rolling window",
  },
  {
    title: "Claude Code Opus cost per PR: the one field that actually moves",
    href: "/t/claude-code-opus-cost-per-pr",
    excerpt:
      "The delta on seven_day_opus.utilization across a branch is the one number that captures Opus PR cost.",
    tag: "Per-PR cost",
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
                "Claude Code Opus token usage: the local-token sum and the server fraction never match",
              description:
                "Claude Code on Opus has two different 'token usage' numbers. ccusage sums local JSONL tokens. The server endpoint that rate-limits you returns only a utilization fraction, no raw token count. Here is why they diverge.",
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
          __html: JSON.stringify(
            faqPageSchema(faqs.map((f) => ({ q: f.q, a: f.a })))
          ),
        }}
      />

      <Breadcrumbs
        items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))}
        className="pt-8"
      />

      <header className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          Claude Code Opus token usage: <GradientText>two numbers</GradientText>{" "}
          that never match, and only one decides your next 429
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          You probably came here from a thread asking how to actually see Opus
          token usage when you run Claude Code. The honest answer is that there
          are two different numbers and they read from different places.
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono mx-1">
            ccusage
          </code>
          sums tokens out of your local JSONL files. claude.ai{"'"}s server
          returns only a utilization fraction, no raw token count. This page
          walks each one with the actual field path, then shows the pair you
          can run together so you stop being surprised mid-loop.
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

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-08)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            Two different ledgers, both legitimately called {'"'}Opus token
            usage{'"'}. (1) Run{" "}
            <a
              href="https://github.com/ryoppippi/ccusage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              ccusage
            </a>{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              --model opus
            </code>{" "}
            for raw token counts pulled from{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              ~/.claude/projects/*.jsonl
            </code>
            . (2) Read{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day_opus.utilization
            </code>{" "}
            on{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              claude.ai/api/organizations/&#123;org_uuid&#125;/usage
            </code>{" "}
            (the same JSON{" "}
            <a
              href="https://claude.ai/settings/usage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              claude.ai/settings/usage
            </a>{" "}
            renders, and the same JSON{" "}
            <a
              href="https://github.com/m13v/claude-meter"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              ClaudeMeter
            </a>{" "}
            polls in its menu bar). The server payload contains{" "}
            <strong>zero raw Opus token counts</strong>; only a utilization
            fraction. The two never reconcile because the 4.7 tokenizer expands
            tokens server-side after JSONL is written, thinking tokens are
            written incompletely, and browser-chat usage skips JSONL entirely.
            Verified against{" "}
            <a
              href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              claude-meter/src/models.rs
            </a>{" "}
            today.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: the server response has no token field at all
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Before walking the tools, fix one thing in your head. The endpoint
          claude.ai uses to know whether to 429 your next Opus request is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET /api/organizations/&#123;org_uuid&#125;/usage
          </code>
          . That JSON has buckets named{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_sonnet
          </code>
          , and a few more. Every single one of those buckets has the same
          shape: a fraction and a reset time. No tokens.
        </p>
        <AnimatedCodeBlock
          code={usageStruct}
          language="rust"
          filename="claude-meter/src/models.rs"
          typingSpeed={0}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Two fields per bucket. Utilization (a float, almost always 0.0 to
          1.0, sometimes scaled 0 to 100 by quirk of the API) and resets_at (a
          timestamp). If you want to verify this yourself, grep the deserializer
          for{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            tokens
          </code>{" "}
          in the same file. You will not find one. The Opus rate limiter never
          tells you how many tokens you have used or have left. It only ever
          tells you how close you are to a percentage ceiling whose denominator
          it also does not publish.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Tool 1: ccusage{" "}
          <span className="text-teal-700 font-mono text-2xl">--model opus</span>
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ccusage tails{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/**/*.jsonl
          </code>{" "}
          and aggregates the input, output, cache_read, and cache_creation
          token counts that Claude Code wrote during streaming. With{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            --model opus
          </code>{" "}
          it filters to records where{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            model
          </code>{" "}
          starts with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude-opus
          </code>
          . You get a per-project breakdown that looks like this:
        </p>
        <TerminalOutput lines={ccusageOutput} title="ccusage" />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Useful for: knowing what your CLI sent on this machine, broken down
          by project and message type. Not useful for: knowing whether your
          next Opus request will go through. The numbers in this terminal are
          the only place {'"'}raw Opus tokens{'"'} appears in the entire
          stack and they live entirely on your local disk. Anthropic{"'"}s rate
          limiter never sees this output.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Tool 2: the server fraction at{" "}
          <span className="text-teal-700 font-mono text-2xl">
            seven_day_opus
          </span>
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter (and the bar chart on{" "}
          <a
            href="https://claude.ai/settings/usage"
            className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
          >
            claude.ai/settings/usage
          </a>
          ) both read the same JSON. Run{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude-meter status --json
          </code>{" "}
          and you get the parsed structure verbatim:
        </p>
        <TerminalOutput lines={meterStatus} title="claude-meter" />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Read the Opus line. Utilization is 0.94. There is no token count.
          There is no {'"'}you have used 1.7M Opus tokens out of 1.8M{'"'}{" "}
          rendering happening anywhere. The fraction by itself is what the
          server checks. Anthropic does not tell its own client what the
          denominator is. The bar on Settings is drawn from this exact float;
          ClaudeMeter{"'"}s extension reads it on a 60-second alarm in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extension/background.js
          </code>{" "}
          line 24.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the two numbers diverge
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-3">
          If both ledgers are accurate, why don{"'"}t they reconcile? Because
          they are accurate about different events.
        </p>
        <ul className="space-y-3 text-zinc-700 leading-relaxed text-lg list-disc pl-6">
          <li>
            <strong>Server-side tokenizer expansion (Opus 4.7).</strong> Per
            Anthropic{"'"}s 4.7 release notes, the new tokenizer maps the same
            text to 1.0x to 1.35x as many tokens as 4.6 did. The expansion
            runs after Claude Code has already streamed a chunk and written it
            to JSONL. Your local sum is the pre-expansion count; the
            seven_day_opus float is updated against the post-expansion count.
          </li>
          <li>
            <strong>Adaptive thinking tokens.</strong> Opus 4.7 generates
            thinking tokens by default when the caller opts in. They count
            against seven_day_opus on the server. They are written to JSONL
            inconsistently (some streams write the full thinking block, some
            write a redacted token count, some write neither). ccusage sees
            whatever made it into the file.
          </li>
          <li>
            <strong>Browser-chat traffic.</strong> If you also use claude.ai
            in a browser tab on the same Anthropic account, that traffic
            depletes the same seven_day_opus float. It never writes a Claude
            Code JSONL. ccusage cannot see it.
          </li>
          <li>
            <strong>Other machines and other Claude Code sessions.</strong>{" "}
            seven_day_opus is org-scoped on the server. ccusage on this laptop
            only sees this laptop{"'"}s JSONL. A teammate on the same org or a
            second machine of yours will move the server number while ccusage
            stays flat.
          </li>
          <li>
            <strong>The denominator changes by plan.</strong> The same absolute
            token spend is a different fraction on Pro vs Max 5x vs Max 20x. The
            server bakes this into utilization. Local-token tools have no idea
            which plan you are on, so they cannot compute the equivalent
            fraction even if every other gap were closed.
          </li>
        </ul>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <ComparisonTable
          heading="ccusage vs the server endpoint, as objects of measurement"
          intro="Same product, two ledgers. They answer different questions."
          competitorName="ccusage (local JSONL)"
          productName="server /usage (seven_day_opus)"
          rows={tableRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The Reddit-thread version: what to actually do
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You came here looking for one number. You are leaving with two and an
          honest reason why. Here is the smallest pair that covers both
          questions.
        </p>
        <GlowCard>
          <div className="p-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-700 mb-3">
              Three commands, two numbers
            </p>
            <ol className="space-y-3 text-zinc-700 leading-relaxed list-decimal pl-6">
              <li>
                <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs">
                  brew install ryoppippi/tap/ccusage
                </code>
                . Then{" "}
                <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs">
                  ccusage --model opus
                </code>{" "}
                whenever you want to see what your CLI actually sent, broken
                down by project. Raw tokens, your machine.
              </li>
              <li>
                <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs">
                  brew install --cask m13v/tap/claude-meter
                </code>{" "}
                plus the browser extension from the{" "}
                <a
                  href="https://github.com/m13v/claude-meter/releases"
                  className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
                >
                  releases page
                </a>
                . Visit{" "}
                <a
                  href="https://claude.ai"
                  className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
                >
                  claude.ai
                </a>{" "}
                once. The menu bar shows seven_day_opus live within a minute.
                No cookie paste.
              </li>
              <li>
                For status lines:{" "}
                <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs">
                  claude-meter status --json
                </code>{" "}
                from any shell drops the same JSON into your tmux, Starship, or
                a CI gate.
              </li>
            </ol>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <AnimatedChecklist
          title={honestPairing.title}
          items={honestPairing.items}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Common questions about Opus token usage
        </h2>
        <FaqSection
          heading="Common questions about Opus token usage"
          items={faqs}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="More on the same buckets, the same fields, the same wall."
          posts={relatedPosts}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="ccusage and Settings are giving you different answers?"
          description="If your team runs Claude Code on Opus and the local-token sum keeps disagreeing with the bar on claude.ai, book a 20-minute call and I will help you wire the right pair into your workflow."
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Book a call: stop guessing which Opus token number is the real one."
      />
    </article>
  );
}
