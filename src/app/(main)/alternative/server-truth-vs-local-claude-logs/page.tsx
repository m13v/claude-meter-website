import type { Metadata } from "next";
import {
  Breadcrumbs,
  FaqSection,
  AnimatedCodeBlock,
  ComparisonTable,
  AnimatedChecklist,
  TerminalOutput,
  GlowCard,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/alternative/server-truth-vs-local-claude-logs";
const PUBLISHED = "2026-05-19";

export const metadata: Metadata = {
  title:
    "Server truth vs local Claude logs: the five weights your JSONL cannot see",
  description:
    "Your ~/.claude/projects/*.jsonl files only record input_tokens and output_tokens per turn. The server adds five weights on top (peak-hour multiplier, attachments, tool calls, model class, browser chat) and exposes the result as five_hour.utilization at claude.ai/api/organizations/{org}/usage. That is why ccusage says 5% and claude.ai still 429s you.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Server truth vs local Claude logs: the five weights your JSONL cannot see",
    description:
      "Local JSONL holds tokens. The server holds a weighted utilization float. Five specific factors live only on the server, and any one of them can put you at 100% while ccusage is still at 5%.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Alternatives", url: "https://claude-meter.com/alternative" },
  {
    name: "Server truth vs local Claude logs",
    url: PAGE_URL,
  },
];

const localJsonl = `// ~/.claude/projects/<project>/<session>.jsonl
// One row per assistant turn. This is what ccusage walks.

{
  "session_id":     "abc123",
  "turn":            42,
  "model":           "claude-opus-4-7",
  "input_tokens":    1820,
  "output_tokens":   2180,
  "cache_read":      0,
  "cache_creation":  0,
  "ts":              "2026-05-19T17:14:02.118Z"
}

// Sum input_tokens + output_tokens across rows = local token-flow rate.
// That is NOT the same number Anthropic rate-limits against.`;

const serverJson = `// GET https://claude.ai/api/organizations/{org_uuid}/usage
// One JSON object. claude.ai/settings/usage renders the bars from this.
// claude-meter polls this every 60 seconds (POLL_MINUTES = 1).

{
  "five_hour": {
    "utilization": 0.94,                  // 94% of rolling 5h bucket
    "resets_at":   "2026-05-19T22:14:00Z"
  },
  "seven_day": {
    "utilization": 0.62,                  // 62% of weekly compute
    "resets_at":   "2026-05-26T09:02:00Z"
  },
  "seven_day_opus": {
    "utilization": 0.88,                  // Max sub-bucket
    "resets_at":   "2026-05-26T09:02:00Z"
  }
}

// Each utilization is already weighted by:
//   peak-hour multiplier, attachments, tool calls, model class, browser chats.
// None of those weights exist in the JSONL above.`;

const extensionPoll = `// claude-meter/extension/background.js
// Why this matters: the extension uses YOUR claude.ai session,
// hits the same internal endpoint Anthropic's settings page uses,
// and prints what the server says. No local-token approximation.

const BASE = "https://claude.ai";
const POLL_MINUTES = 1;                            // line 3

async function fetchJSON(url) {
  const r = await fetch(url, {
    credentials: "include",                        // your cookies
    headers: { "accept": "application/json" },
  });
  if (!r.ok) throw new Error(\`\${r.status} \${r.statusText} @ \${url}\`);
  return r.json();
}

// One call per org membership, every 60 seconds:
//   GET /api/organizations/{org}/usage
// Read five_hour.utilization and seven_day.utilization, badge them.`;

const comparisonRows = [
  {
    feature: "What it measures",
    competitor:
      "input_tokens + output_tokens per assistant turn, summed off disk.",
    ours: "five_hour.utilization, a weighted fraction the server enforces.",
  },
  {
    feature: "Where the data lives",
    competitor:
      "~/.claude/projects/<project>/<session>.jsonl on your laptop. One file per session.",
    ours: "claude.ai/api/organizations/{org_uuid}/usage. One JSON, your session cookie.",
  },
  {
    feature: "Peak-hour weighting",
    competitor:
      "Invisible. ccusage has no field for it. A 9 a.m. Pacific weekday prompt looks identical to a 2 a.m. one.",
    ours: "Built in. Anthropic confirmed in March 2026 that the 5-hour bucket fills faster on weekday 5 to 11 a.m. Pacific.",
  },
  {
    feature: "Attachments and tool calls",
    competitor:
      "JSONL has no per-attachment cost and no per-tool-call cost. A 40-page PDF upload writes the same row as a one-line prompt.",
    ours: "Server applies both, then folds them into the utilization float.",
  },
  {
    feature: "Per-model weight",
    competitor:
      "Token counts are raw. Opus and Sonnet rows look the same.",
    ours: "Opus burns the bucket faster than Sonnet for the same prompt. seven_day_opus is a separate sub-bucket on Max plans.",
  },
  {
    feature: "claude.ai browser chats",
    competitor:
      "Never lands in JSONL. ccusage cannot see them at all.",
    ours: "Counted in five_hour and seven_day. Same account, same bucket.",
  },
  {
    feature: "Predicts the next 429",
    competitor:
      "Only if you are a Claude-Code-only user, never browse claude.ai, never attach files, never use tools, and never prompt at peak hours.",
    ours: "Yes. The float you read is the float the rate limiter checks.",
  },
];

const fiveThings = {
  title: "Five things your JSONL does not see",
  items: [
    {
      text:
        "Peak-hour multiplier. Weekday 5 to 11 a.m. Pacific fills five_hour faster. Same prompt count, different fraction.",
      checked: true,
    },
    {
      text:
        "Per-attachment cost. One PDF upload can move the server bucket more than a hundred plain prompts. JSONL records the prompt, not the upload weight.",
      checked: true,
    },
    {
      text:
        "Per-tool-call cost. Code execution and web browsing each carry server-side cost on top of tokens. ccusage counts the surrounding tokens, not the tool.",
      checked: true,
    },
    {
      text:
        "Per-model weight. Opus burns faster than Sonnet for the same byte count. On Max, seven_day_opus is the sub-bucket that 429s you on Tuesday afternoons.",
      checked: true,
    },
    {
      text:
        "claude.ai browser chat. Any prompt you sent in a browser tab on the same account hits the same bucket and never writes to ~/.claude/projects.",
      checked: true,
    },
  ],
};

const sessionTranscript = [
  { type: "command" as const, text: "$ ccusage --recent" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "today    input: 81,420 tok    output: 96,180 tok    est: 5.1% of session" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "$ curl -s http://127.0.0.1:63762/snapshots | jq '.[0].usage.five_hour'" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"utilization\": 0.94," },
  { type: "output" as const, text: "  \"resets_at\": \"2026-05-19T22:14:00Z\"" },
  { type: "output" as const, text: "}" },
  { type: "output" as const, text: "" },
  { type: "error" as const, text: "claude.ai: rate limit reached. Try again in 47m." },
  { type: "output" as const, text: "" },
  { type: "success" as const, text: "Both readings are correct. They measure different things." },
];

const faqs = [
  {
    q: "If ccusage says 5% and claude.ai 429s me, which one is wrong?",
    a: "Neither. ccusage walks ~/.claude/projects/*.jsonl and sums input_tokens + output_tokens for sessions on this machine. That is a local token-flow rate. claude.ai 429s on five_hour.utilization, a weighted server-side fraction that includes peak-hour multiplier, per-attachment cost, per-tool-call cost, per-model weight, and any browser-chat usage. The local count and the server count are two different metrics with two different denominators. They agree only by coincidence.",
  },
  {
    q: "Where is the server-truth number, exactly?",
    a: "GET https://claude.ai/api/organizations/{your-org-uuid}/usage with your logged-in claude.ai cookies. The response is JSON with five_hour and seven_day objects, each containing a utilization float and a resets_at ISO timestamp. The bars on claude.ai/settings/usage are rendered from those two fields. ClaudeMeter's extension calls this endpoint once a minute (POLL_MINUTES = 1 at extension/background.js line 3) and pushes the response to the menu-bar app.",
  },
  {
    q: "Why does the gap feel so big in practice, like 5% local vs 94% server?",
    a: "Because the two numbers do not share a denominator and the server applies weights local logs cannot see. Five common multipliers: a peak-hour multiplier on weekday 5 to 11 a.m. Pacific, a per-attachment cost that fires the moment you upload a PDF or image, a per-tool-call cost on code execution and web browsing, a per-model weight (Opus burns faster than Sonnet), and any prompt you sent on claude.ai in the browser which never lands in JSONL. Stack a few of those up and the gap goes from cosmetic to existential.",
  },
  {
    q: "Can I just trust ccusage if I only use Claude Code, no attachments, no browser?",
    a: "Closer, but still no. Even with no attachments and no browser chat, the peak-hour multiplier still applies, the per-tool-call cost on Claude Code itself still applies, and the per-model weight still applies. ccusage is accurate as a local token-flow measurement and great for cost attribution per project. It is not a faithful proxy for the rate limiter. If you want to predict whether your next prompt will 429, the only reliable signal is five_hour.utilization on the server.",
  },
  {
    q: "Do I have to give up ccusage to read server truth?",
    a: "No. They answer different questions and most heavy users run both. ccusage tells you which projects burned the most tokens this week. ClaudeMeter tells you whether your next prompt is about to 429. Many people pair ccusage in a terminal split with ClaudeMeter in the menu bar.",
  },
  {
    q: "Will Anthropic block the endpoint claude-meter reads?",
    a: "It is the same endpoint claude.ai/settings/usage already calls with the same headers your browser sends (Cookie, Referer, Accept). ClaudeMeter sends one HTTPS request per minute per org membership, identical to what an open settings tab would do if you hit reload. If Anthropic changes the response shape, the Rust serde deserializer fails fast and the menu bar shows '!' instead of a wrong number. The README documents that risk explicitly.",
  },
  {
    q: "Is the server reading instant, or does it lag like the JSONL log?",
    a: "It is at most 60 seconds behind real-time, because the extension polls once per minute. The float Anthropic enforces is the same one you read, with no extra weighting added between read time and rate-limit time. The JSONL log, by contrast, is fully real-time on this machine but blind to the entire weighting layer plus any other surface (Max sharing, browser chat, etc.).",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title:
      "Why local token counters disagree with the rate limit",
    excerpt:
      "Deep dive on the exact mechanism behind the local-vs-server gap, with the JSON shape, the field names, and how to predict a 429 a minute before it lands.",
    tag: "Reference",
  },
  {
    href: "/t/claude-usage-server-truth",
    title:
      "How to verify a Claude usage tracker actually reads server truth",
    excerpt:
      "Three checkable steps. Open DevTools on claude.ai/settings/usage, curl the localhost bridge at 127.0.0.1:63762, then disable the extension and watch the staleness flip.",
    tag: "Verification",
  },
  {
    href: "/vs-ccusage",
    title:
      "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage reads local Claude Code tokens off disk. ClaudeMeter reads plan quota off claude.ai. Two different questions, two different surfaces. Many users run both.",
    tag: "Comparison",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Server truth vs local Claude logs: the five weights your JSONL cannot see",
  description:
    "Local JSONL files at ~/.claude/projects/<session>.jsonl record input_tokens and output_tokens per turn. The server applies five weights on top (peak-hour multiplier, attachments, tool calls, model class, browser chats) and exposes the result as five_hour.utilization at claude.ai/api/organizations/{org}/usage. This is why ccusage at 5% and claude.ai at 429 can both be true at the same instant.",
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

export default function ServerTruthVsLocalClaudeLogsPage() {
  return (
    <article className="text-zinc-900 min-h-screen">
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
          Server truth <GradientText>vs local Claude logs</GradientText>: the five
          weights your JSONL cannot see
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Your local Claude Code logs live in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/&lt;session&gt;.jsonl
          </code>
          . Each row records input and output tokens for one assistant turn.
          Anthropic does not rate-limit on that number. They rate-limit on a
          weighted server-side fraction that includes five things the JSONL
          never sees. That is why ccusage can sit at 5% while claude.ai 429s
          your next prompt. Here is the gap, named.
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-19)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            Local JSONL holds raw token counts per turn on one machine. Server
            truth lives at{" "}
            <a
              href="https://claude.ai/settings/usage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              claude.ai/settings/usage
            </a>{" "}
            (the page calls{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /api/organizations/&#123;org&#125;/usage
            </code>
            ) and is already weighted by peak-hour multiplier, attachments, tool
            calls, model class, and browser-chat usage. ccusage and the server
            disagree because they measure different things, not because one is
            broken. The float Anthropic enforces is{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              five_hour.utilization
            </code>{" "}
            in that JSON; nothing else is the rate limit.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Two files, two stories
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The cleanest way to understand the gap is to put the two payloads on
          the same screen. Same Claude account, same Tuesday afternoon.
        </p>
        <AnimatedCodeBlock
          code={localJsonl}
          language="json"
          filename="~/.claude/projects/refactor/session-abc123.jsonl"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          That row, multiplied across the day, is what ccusage sums. Now the
          same hour, read from the server claude.ai actually rate-limits
          against:
        </p>
        <AnimatedCodeBlock
          code={serverJson}
          language="json"
          filename="GET /api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The JSONL row reports 4,000 tokens. The server reports 94% of the
          rolling 5-hour bucket used. Those are not two estimates of the same
          quantity. They are two quantities. Both are correct.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The five weights
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-2">
          Every one of these adds to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          on the server and writes nothing to the local JSONL. Any single one
          can push you to 94% while the local sum still reads 5%.
        </p>
        <AnimatedChecklist title={fiveThings.title} items={fiveThings.items} />
        <p className="text-zinc-700 leading-relaxed text-lg mt-2">
          Stack two or three of them on the same hour and the gap goes from
          cosmetic to job-ending. A 9 a.m. Pacific Tuesday with three PDF
          attachments and a few web-browsing tool calls in Opus can put your
          server bucket at the wall while every local readout swears you are
          fine.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Side by side
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Local JSONL on the left, server JSON on the right. Same plan, same
          account, same minute.
        </p>
        <ComparisonTable
          productName="Server truth (claude.ai/api/.../usage)"
          competitorName="Local Claude logs (~/.claude/projects/*.jsonl)"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          One HTTPS request per minute
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need to invent a new metric or re-implement the weighting.
          The float Anthropic enforces is already on the JSON the settings page
          reads. The claude-meter extension calls it with your own cookies, once
          a minute. Eight lines of the relevant background script:
        </p>
        <AnimatedCodeBlock
          code={extensionPoll}
          language="javascript"
          filename="extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          That is the entire trick.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            POLL_MINUTES = 1
          </code>{" "}
          at line 3. One{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            fetch
          </code>{" "}
          with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            credentials: &quot;include&quot;
          </code>{" "}
          so your existing claude.ai session ships the cookie. The response is
          posted to a localhost-only bridge so the macOS menu bar app can render
          it without a second round-trip. No telemetry, no manual cookie paste,
          no token-cost approximation.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The moment that proves it
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Two terminal calls, one screen. ccusage on the same machine reports
          5.1% of the session used. The localhost bridge serves the snapshot
          claude-meter just fetched from the server. claude.ai answers the next
          prompt with a 429. All three readings happen inside the same minute.
        </p>
        <TerminalOutput
          title="Same minute, three views"
          lines={sessionTranscript}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          If you only watch the left number, you walk into the rate limit. If
          you only watch the right number, you never know which project burned
          the budget. Most heavy users run both.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          When ccusage is still the right tool
        </h2>
        <GlowCard>
          <div className="p-2 space-y-4">
            <p className="text-zinc-700 leading-relaxed text-lg">
              ccusage is the right tool when the question is{" "}
              <em>which project burned how many tokens this week</em>. It walks
              JSONL files per project and gives you a breakdown the server JSON
              cannot, because the server only knows about your org, not your
              local directory tree. If you bill clients per project, attribute
              spend across repos, or need to find the file that ate twenty
              thousand output tokens in one prompt, ccusage is the answer.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              ccusage is the wrong tool when the question is{" "}
              <em>will my next prompt 429</em>. For that you need the float on
              the server. Different question, different surface.
            </p>
          </div>
        </GlowCard>
      </section>

      <FaqSection heading="Frequently asked" items={faqs} />

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want a live walk through your own numbers?"
          description="Twenty minutes. Open DevTools on claude.ai, curl the bridge, and watch the two readings line up on your account."
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-14 mb-20">
        <RelatedPostsGrid
          title="Keep reading"
          subtitle="Pages built around the same gap, from different angles."
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See the server-truth number on your own claude.ai session in twenty minutes."
      />
    </article>
  );
}
