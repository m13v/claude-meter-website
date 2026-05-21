import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  BeforeAfter,
  GradientText,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/alternative/server-truth-usage-vs-local-jsonl";
const PUBLISHED = "2026-05-21";

export const metadata: Metadata = {
  title:
    "Server-truth usage vs local JSONL: open your own file in 60 seconds",
  description:
    "Your ~/.claude/projects/*.jsonl is a token diary, not a quota statement. The number Anthropic rate-limits on lives at claude.ai/api/organizations/{org}/usage. Cat the file, curl the endpoint, and watch them disagree on the same minute.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Server-truth usage vs local JSONL: open your own file in 60 seconds",
    description:
      "Walk through the two surfaces on your own machine. The JSONL holds tokens. The server holds the weighted float the rate limiter checks.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Alternatives", url: "https://claude-meter.com/alternative" },
  { name: "Server-truth usage vs local JSONL", url: PAGE_URL },
];

const jsonlPeek = `# pick the newest session JSONL Claude Code has written today
$ ls -t ~/.claude/projects/*/*.jsonl | head -1
~/.claude/projects/refactor-2026-05/session-abc123.jsonl

# print one row, pretty
$ tail -n 1 ~/.claude/projects/refactor-2026-05/session-abc123.jsonl | jq .
{
  "session_id":     "abc123",
  "turn":            42,
  "model":           "claude-opus-4-7",
  "input_tokens":    1820,
  "output_tokens":   2180,
  "cache_read":      0,
  "cache_creation":  0,
  "ts":              "2026-05-21T17:14:02.118Z"
}

# 4,000 tokens this turn. That is ALL this file knows.
# No peak-hour multiplier. No attachment cost. No browser chats.
# No "% of 5-hour bucket". It is a token diary, not a quota statement.`;

const serverPeek = `# now grab the float Anthropic actually rate-limits against
# (use your org uuid; open claude.ai/settings/usage and copy it from devtools)
$ curl -s 'https://claude.ai/api/organizations/<org-uuid>/usage' \\
    -H "cookie: $(pbpaste)" -H 'accept: application/json' | jq .

{
  "five_hour":      { "utilization": 0.94, "resets_at": "2026-05-21T22:14:00Z" },
  "seven_day":      { "utilization": 0.62, "resets_at": "2026-05-28T09:02:00Z" },
  "seven_day_opus": { "utilization": 0.88, "resets_at": "2026-05-28T09:02:00Z" }
}

# 94% of the rolling 5-hour bucket used.
# Same account, same minute, same wall clock as the JSONL row above.
# The two readings cannot both be wrong. They are measuring different things.`;

const minuteTranscript = [
  { type: "command" as const, text: "$ ccusage --today" },
  { type: "output" as const, text: "" },
  {
    type: "output" as const,
    text: "today    input: 81,420 tok    output: 96,180 tok    est: 5.1% of session",
  },
  { type: "output" as const, text: "" },
  {
    type: "command" as const,
    text: "$ curl -s http://127.0.0.1:63762/snapshots | jq '.[0].usage.five_hour.utilization'",
  },
  { type: "output" as const, text: "0.94" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "$ # send one more prompt in claude.ai" },
  {
    type: "error" as const,
    text: "claude.ai: rate limit reached. Try again in 47m.",
  },
  { type: "output" as const, text: "" },
  {
    type: "success" as const,
    text: "Both numbers are correct. ccusage measured the diary; the bridge measured the quota.",
  },
];

const faqs = [
  {
    q: "Server-truth usage vs local JSONL: what is the actual difference in one sentence?",
    a: "Local JSONL records raw input_tokens and output_tokens per assistant turn on one machine; server-truth usage is the weighted utilization float Anthropic publishes at https://claude.ai/api/organizations/{org_uuid}/usage and enforces with 429s. The first is a token diary, the second is the live quota meter.",
  },
  {
    q: "Where exactly is each one stored?",
    a: "Local JSONL is on disk at ~/.claude/projects/<project>/<session>.jsonl, written by Claude Code itself, one row per turn. Server truth is JSON returned by GET https://claude.ai/api/organizations/{org}/usage, the same endpoint claude.ai/settings/usage renders its bars from. ClaudeMeter polls that endpoint once a minute through your own browser session.",
  },
  {
    q: "If ccusage walks the JSONL and says 5%, why does claude.ai still 429 me?",
    a: "Because five things land in server-truth that never appear in the JSONL: a peak-hour multiplier (weekday 5 to 11 a.m. Pacific fills the 5-hour bucket faster), per-attachment cost (a PDF upload moves the bucket far more than the prompt that uploaded it), per-tool-call cost (code execution and browsing both carry server cost on top of tokens), per-model weight (Opus burns the bucket faster than Sonnet for the same byte count), and any prompts you sent in a claude.ai browser tab on the same account. Stack two of those and the 5% reading and the 94% reading both look right.",
  },
  {
    q: "Can I read server-truth myself without installing anything?",
    a: "Yes. Open claude.ai/settings/usage in Chrome, open DevTools, watch the Network tab, find the request to /api/organizations/<uuid>/usage, copy it as cURL, run it in a terminal. The JSON body is the same one ClaudeMeter reads. The only thing ClaudeMeter adds is doing that fetch every 60 seconds and drawing it in your menu bar without you re-pasting cookies.",
  },
  {
    q: "Does the JSONL file ever match server-truth?",
    a: "Only for a narrow user: Claude Code only, no claude.ai browser chat on the same account, no attachments, no tool calls, no peak-hour sessions, and exclusively on a model whose multiplier you have memorised. For anyone outside that envelope the two numbers will disagree, sometimes by an order of magnitude, and the gap will be widest exactly when you most need to predict a 429.",
  },
  {
    q: "Do I have to choose between ccusage and a server-truth tool?",
    a: "No. ccusage is the right answer for 'which project burned how many tokens this week', because the server JSON does not know about your local directory tree. ClaudeMeter is the right answer for 'will my next prompt 429'. Most heavy users run both: ccusage in a terminal split for cost attribution, ClaudeMeter in the menu bar for live quota.",
  },
  {
    q: "How fresh is the server-truth reading in practice?",
    a: "At most 60 seconds stale, because the extension polls the endpoint once a minute. The float you read is the float the rate limiter checks, with no extra weighting added between read time and limit time. The JSONL is real-time on disk but blind to the entire weighting layer plus any browser-chat usage on the same account.",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Server-truth usage vs local JSONL: open your own file in 60 seconds",
  description:
    "Walk through both surfaces on your own machine. The JSONL at ~/.claude/projects/*.jsonl is a token diary; server truth is the weighted utilization float at claude.ai/api/organizations/{org}/usage. Why they disagree on the same minute and which one the 429 is gated on.",
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

export default function ServerTruthUsageVsLocalJsonlPage() {
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

      <header className="max-w-3xl mx-auto px-6 pb-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          Server-truth usage <GradientText>vs local JSONL</GradientText>: open
          your own file in 60 seconds
        </h1>
        <div className="mt-6">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="4 min read"
          />
        </div>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
          Two readings, same Claude account, same minute. One says 5%, the
          other 429s your next prompt. Neither is broken. They are measuring
          two different things, and once you see both files on one screen the
          gap stops being mysterious.
        </p>
      </header>

      <section className="max-w-3xl mx-auto px-6 mt-6">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-21)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            <strong>Local JSONL</strong> at{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              ~/.claude/projects/&lt;session&gt;.jsonl
            </code>{" "}
            records raw <code className="font-mono">input_tokens</code> and{" "}
            <code className="font-mono">output_tokens</code> per turn on one
            machine.{" "}
            <strong>Server-truth usage</strong> lives at{" "}
            <a
              href="https://claude.ai/settings/usage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              claude.ai/settings/usage
            </a>{" "}
            (which calls{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /api/organizations/&#123;org&#125;/usage
            </code>
            ) and is a weighted utilization float that includes peak-hour
            multiplier, attachments, tool calls, model class, and browser-chat
            usage. The 429 is gated on{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              five_hour.utilization
            </code>{" "}
            from that JSON, nothing else.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-3">
          Step 1: cat your JSONL
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Open a terminal. This is what local JSONL actually looks like, and
          why it cannot answer the question the rate limiter asks:
        </p>
        <AnimatedCodeBlock
          code={jsonlPeek}
          language="bash"
          filename="terminal"
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-3">
          Step 2: curl server truth
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Same minute, same account, different surface. The number Anthropic
          enforces is a single float behind your own session cookie:
        </p>
        <AnimatedCodeBlock
          code={serverPeek}
          language="bash"
          filename="terminal"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Both readings are correct. The JSONL row knows you spent 4,000
          tokens this turn. The server JSON knows you are 94% of the way
          through your rolling 5-hour bucket because three PDF uploads and
          some Opus tool calls earlier in the window already moved the float
          that the JSONL never recorded.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The mental shift
        </h2>
        <BeforeAfter
          title="What you thought you were reading vs what is actually under the hood"
          before={{
            label: "Before: tokens = quota",
            content:
              "Local JSONL is the canonical source. ccusage walks it, sums tokens, gives me a percentage. If the percentage is low, I am fine. If claude.ai 429s me anyway, something is broken.",
            highlights: [
              "Treats tokens and quota as the same number",
              "Cannot see attachments, tool calls, or browser chats",
              "Silently wrong during peak hours and on Opus",
              "Surprises you at the wall, never before it",
            ],
          }}
          after={{
            label: "After: two surfaces, two questions",
            content:
              "Local JSONL is a token diary on this machine. Server truth is a weighted utilization float on claude.ai. ccusage answers 'which project burned what'. Server truth answers 'will my next prompt 429'. I read both, for different reasons.",
            highlights: [
              "Two surfaces, two questions, no contradiction",
              "Server JSON already includes every server-side weight",
              "Rate limit is predictable a minute before it lands",
              "ccusage stays useful for cost attribution per project",
            ],
          }}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-3">
          Three views, same minute
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ccusage on the same machine. The localhost bridge ClaudeMeter
          exposes after polling the server endpoint. The next prompt against
          claude.ai. Stitched together on one screen:
        </p>
        <TerminalOutput title="The receipt" lines={minuteTranscript} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want to do this on your own account, live?"
          description="Twenty minutes. Open DevTools on claude.ai, cat your JSONL, watch the two numbers diverge in real time, then decide whether you want the menu-bar version doing it for you."
        />
      </section>

      <FaqSection heading="Frequently asked" items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See server truth on your own claude.ai session in 20 minutes."
      />
    </article>
  );
}
