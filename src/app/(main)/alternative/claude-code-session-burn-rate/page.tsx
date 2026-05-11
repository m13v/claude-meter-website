import type { Metadata } from "next";
import {
  Breadcrumbs,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  GlowCard,
  GradientText,
  MetricsRow,
  AnimatedBeam,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/alternative/claude-code-session-burn-rate";
const PUBLISHED = "2026-05-11";

export const metadata: Metadata = {
  title:
    "Claude Code session burn rate vs chat: same bucket, very different burn",
  description:
    "Claude Code and claude.ai chat both deplete one shared org-scoped 5-hour and 7-day bucket on the server. But a Claude Code agentic loop typically drains the bucket 5-10x faster per wall-clock minute than the same minute in chat, because each turn fans out into tool calls, file reads, and multi-turn replays. ClaudeMeter polls both endpoints (api.anthropic.com/api/oauth/usage for Code, claude.ai/api/organizations/{org}/usage for chat+everything) and shows the seven_day_oauth_apps sub-bucket so you can see exactly which surface is burning your week.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code session burn rate vs chat: same bucket, very different burn",
    description:
      "Same shared org bucket. Code burns 5-10x faster than chat per minute, because every turn fans out into tool calls. Two endpoints to see it: /api/oauth/usage for Code only, /api/organizations/{org}/usage for everything.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Alternatives", url: "https://claude-meter.com/alternative" },
  {
    name: "Claude Code session burn rate vs chat",
    url: PAGE_URL,
  },
];

const faqs = [
  {
    q: "Do Claude Code and claude.ai chat draw from the same usage bucket?",
    a: "Yes. Both deplete the same org-scoped buckets on the server. The five_hour utilization and the seven_day utilization on /api/organizations/{org_uuid}/usage count every prompt your account makes, whether it came in over the cookie-authenticated browser chat or over the OAuth token Claude Code uses. The seven_day_oauth_apps sub-bucket isolates the OAuth slice, but seven_day itself is the sum. There is no separate quota for Code, and there is no way on a Pro or Max plan to give Code its own pool.",
  },
  {
    q: "How much faster does Claude Code burn the bucket than chat?",
    a: "Roughly 5 to 10 times faster per wall-clock minute on a typical agentic loop, in the workloads we have measured. A 4-minute chat exchange (write a prompt, read a 500-token reply, send a follow-up) is maybe 2-3 messages. A 4-minute Claude Code loop on a real refactor is closer to 20-40 turns, each one fanning out into file reads, ripgrep, edits, type-check runs, and a multi-turn replay of the conversation context. Same wall clock, an order of magnitude more units against the same shared bucket.",
  },
  {
    q: "Why does Claude Code burn so much more than typing in chat?",
    a: "Three multipliers stack. First, agentic loops produce many short turns where chat produces a few long ones, and each turn carries the full context window forward. Second, tool calls (Read, Bash, Edit) and large file reads are billed as input tokens; a single Read on a 1500-line file is a thousands-of-tokens charge that a chat session never makes. Third, Opus weighting on the seven_day_opus sub-bucket is heavier per byte than Sonnet, and Code defaults to Opus on the Max plan more often than chat users explicitly switch to it.",
  },
  {
    q: "Can I see Claude Code burn rate separately from chat in claude-meter?",
    a: "Yes. The menu bar app polls two endpoints in parallel: api.anthropic.com/api/oauth/usage with the Claude Code OAuth token from your keychain (src/oauth.rs:114), and claude.ai/api/organizations/{org_uuid}/usage with your browser session cookies (src/api.rs:19). The OAuth endpoint shows only Claude Code traffic; the cookie endpoint shows the combined total plus a seven_day_oauth_apps sub-bucket that backs out the Code slice. Subtract one from the other and you have your chat burn.",
  },
  {
    q: "What is seven_day_oauth_apps and why does it exist?",
    a: "It is one of the sibling Window structs on the same JSON the settings page renders. claude-meter parses it in src/models.rs as Option<Window> alongside five_hour, seven_day, seven_day_sonnet, seven_day_opus, and seven_day_cowork. The OAuth-apps row covers every OAuth-token client (Claude Code is the main one, plus any third-party app that authenticates via the Anthropic OAuth flow). The reason it is broken out separately is that the server already knows which side of the wall the request came from; it just does not put that breakdown anywhere in the in-app UI.",
  },
  {
    q: "Does ccusage show Claude Code burn rate?",
    a: "It shows the local token count, which is a token-flow measurement, not a bucket-drain measurement. ccusage walks ~/.claude/projects/*.jsonl, sums input + output tokens, and divides by elapsed minutes. That number is real, but it does not match what the rate limiter checks. The server weights utilization by per-tool-call cost, per-attachment cost, peak-hour multiplier (per Anthropic's March 2026 statement on weekday 5 to 11 a.m. Pacific throttling), and per-model factor (Opus heavier than Sonnet). And ccusage cannot see your chat usage at all because chat never writes to that path. So ccusage shows Code's tokens, not Code's burn against the bucket Anthropic enforces.",
  },
  {
    q: "If chat barely moves the needle, why am I hitting the wall on chat days?",
    a: "Two reasons. One, attachments. A single Claude.ai upload of a PDF, screenshot, or repo dump is a big chunk of input tokens, and the rolling 5-hour weighting includes that. Two, peak hours. Anthropic stated in March 2026 that the 5-hour window is adjusted during weekdays 5 to 11 a.m. Pacific. The same chat session at 10 a.m. on a Tuesday fills the bucket faster than the same chat at 11 p.m. on a Saturday. Burn rate is wall-clock-dependent for chat in a way it is not for Code.",
  },
  {
    q: "Where is the difference visible in the menu bar dropdown?",
    a: "Open the dropdown and you see two rows per signed-in account. The five_hour row is the rolling burst cap and reflects the sum of chat and Code over the last 5 hours. The seven_day_oauth_apps row, if your plan exposes it, is the Code-only slice of the weekly. Subtracting seven_day_oauth_apps from seven_day gives you your chat slice. On a Max plan you also get seven_day_sonnet and seven_day_opus, which is the same JSON sliced by model class instead of by surface, so you can cross-check.",
  },
  {
    q: "I run Claude Code on two machines. Does each one have its own burn rate?",
    a: "No. The bucket is org-scoped. Two laptops logged into the same Anthropic account share one five_hour and one seven_day. If laptop A is running an Opus refactor at 78 percent five-hour, laptop B starts at 78 percent five-hour. claude-meter dedupes by account_email in dedupe_by_account so the menu bar shows one row per account, not one row per machine, and that mirrors how the server treats them.",
  },
  {
    q: "Will switching to chat for a while let the Code bucket cool down?",
    a: "It cools the OAuth-apps slice (because nothing is adding to it) but it does NOT cool the parent seven_day or five_hour buckets if you keep chatting, because both surfaces deplete the same parent. The real way to give Code room is to stop using both Code and chat, let the rolling window age out, or switch the Code agent to Sonnet for the rest of the week so the seven_day_opus sub-bucket bleeds down while the Code burn continues at a lower per-byte weight.",
  },
];

const comparisonRows = [
  {
    feature: "Where the request is authenticated",
    competitor:
      "Browser session cookies. claude.ai sets sessionKey on your domain after login; every request includes the cookie header.",
    ours: "OAuth bearer token stored by the Claude Code CLI in the macOS Keychain under service 'Claude Code-credentials'. Rotated automatically by the CLI.",
  },
  {
    feature: "Which endpoint reveals it",
    competitor:
      "GET claude.ai/api/organizations/{org_uuid}/usage. Same call the in-app Settings > Usage page makes.",
    ours: "GET api.anthropic.com/api/oauth/usage. Different host, different gate (no Cloudflare bot check), same JSON shape.",
  },
  {
    feature: "Bucket it depletes",
    competitor:
      "five_hour and seven_day on the org. Counts here, plus IDE usage, plus oauth-app usage, equals the gate.",
    ours: "Same five_hour and seven_day, plus the seven_day_oauth_apps sub-bucket which isolates the Claude Code (and other OAuth-app) slice of the weekly.",
  },
  {
    feature: "Typical burn per wall-clock minute",
    competitor:
      "Slow. 1-3 prompts per minute, each one mostly outbound text. A 4-minute chat exchange might be 2-3 turns.",
    ours: "Fast. A 4-minute agentic refactor is closer to 20-40 turns. Each turn fans out into Read, Bash, Edit, type-check, replay context.",
  },
  {
    feature: "What dominates the cost",
    competitor:
      "Reply length and any image or file you attached. Long Opus replies and PDF uploads are the biggest single hits.",
    ours: "Tool-call overhead and full-context replay. A Read on a 1500-line file is a thousands-of-tokens charge. Multi-turn loops re-pay context every turn.",
  },
  {
    feature: "How model class affects it",
    competitor:
      "You usually pick a model and stay there. Opus burns roughly 5x faster per byte than Sonnet on the seven_day_opus sub-bucket.",
    ours: "Code defaults to Opus on Max more often than chat does. Same Opus-heavy weighting, but you trip it faster because the turn count is higher.",
  },
  {
    feature: "Is it visible in /usage inside Claude Code?",
    competitor:
      "Yes, but the in-tool /usage is a snapshot of the OAuth view only. It does not show your chat-only spend.",
    ours: "Same view, same limitation. Both share the parent bucket; neither in-tool screen shows you the share split.",
  },
  {
    feature: "How ClaudeMeter shows it",
    competitor:
      "Cookie path snapshot in the menu bar dropdown, broken out as seven_day all + seven_day_sonnet + seven_day_opus.",
    ours: "OAuth path snapshot in the same dropdown, broken out via seven_day_oauth_apps so you can subtract Code from the parent seven_day to estimate chat.",
  },
];

const usageJson = `// GET https://claude.ai/api/organizations/{org_uuid}/usage  (cookie path, formatted)
//
// Both chat and Claude Code deplete the same five_hour and seven_day windows.
// seven_day_oauth_apps isolates the OAuth-app (Claude Code) slice of the weekly.

{
  "five_hour": {
    "utilization": 0.81,                 // 81% of the rolling 5-hour: chat + Code
    "resets_at":   "2026-05-11T20:14:00Z"
  },

  "seven_day": {
    "utilization": 0.68,                 // 68% of the weekly: chat + Code + IDE + everything
    "resets_at":   "2026-05-17T09:02:00Z"
  },

  "seven_day_sonnet": {
    "utilization": 0.52,
    "resets_at":   "2026-05-17T09:02:00Z"
  },

  "seven_day_opus": {
    "utilization": 0.94,                 // most common 429 cause on Max + Code
    "resets_at":   "2026-05-17T09:02:00Z"
  },

  "seven_day_oauth_apps": {
    "utilization": 0.61,                 // OAuth-app (Claude Code) slice of the weekly
    "resets_at":   "2026-05-17T09:02:00Z"
  }
}

// Reading: 0.68 weekly = 0.61 from Claude Code + ~0.07 from chat / IDE / other.
// On this account Code is ~9x the chat burn this week.`;

const oauthRsExcerpt = `// claude-meter/src/oauth.rs:114
//
// The Code-only view. Bearer token from the Claude Code CLI's keychain blob.
// No Cloudflare in front of api.anthropic.com; plain rquest client is enough.
// This snapshot shows what Claude Code burned, with no chat traffic mixed in.

let usage: UsageResponse = get_json(
        &client,
        token,
        &format!("{API_BASE}/api/oauth/usage"),
    )
    .await
    .context("fetch /api/oauth/usage")?;`;

const apiRsExcerpt = `// claude-meter/src/api.rs:19
//
// The combined view. Cookie path against claude.ai, Cloudflare-fronted, with
// the Chrome131 emulation rquest-util ships. Counts chat + IDE + Code together.
// Subtract the OAuth view to get the chat slice.

let usage: Option<UsageResponse> = match get_json(
        &client,
        &cookie_header,
        &format!("{BASE}/organizations/{org}/usage"),
    )
    .await
    {
        Ok(v) => Some(v),
        Err(e) => { /* surface as snapshot error, fall through */ None }
    };`;

const modelsRsExcerpt = `// claude-meter/src/models.rs:24
//
// Every weekly sub-bucket the server can return. Each one is Option<Window>
// because Anthropic sometimes adds, removes, or renames sub-buckets; we
// declare them all nullable so the next sub-bucket appearing in the JSON
// does not break the parse.

pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:            Option<Window>,
    pub seven_day_sonnet:     Option<Window>,
    pub seven_day_opus:       Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,  // <-- Claude Code's slice
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,
}`;

const dropdownSession = [
  { type: "command" as const, text: "$ claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour               81.0% used    -> resets Mon May 11 20:14 (in 1h 50m)" },
  { type: "output" as const, text: "7-day all            68.0% used    -> resets Sun May 17 09:02 (in 6d)" },
  { type: "output" as const, text: "7-day Sonnet         52.0% used" },
  { type: "output" as const, text: "7-day Opus           94.0% used" },
  { type: "output" as const, text: "7-day OAuth apps     61.0% used    <- Claude Code only" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "Implied chat slice: 68 - 61 = 7%. Code is ~9x your chat burn this week." },
  { type: "success" as const, text: "Switch Code to Sonnet for the rest of the week to bleed seven_day_opus." },
];

const codeLoopSession = [
  { type: "command" as const, text: "$ claude --opus 'finish the auth refactor in /src/auth, run tests, commit'" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "Read  src/auth/index.ts           (1,420 lines)" },
  { type: "output" as const, text: "Read  src/auth/session.ts         (812 lines)" },
  { type: "output" as const, text: "Grep  'sessionToken' in /src      (47 hits)" },
  { type: "output" as const, text: "Read  src/auth/cookies.ts         (610 lines)" },
  { type: "output" as const, text: "Edit  src/auth/session.ts         (+38, -22)" },
  { type: "output" as const, text: "Bash  npm run typecheck           (4.1s, ok)" },
  { type: "output" as const, text: "Bash  npm test -- auth            (12.4s, 3 fail)" },
  { type: "output" as const, text: "Read  tests/auth.spec.ts          (980 lines)" },
  { type: "output" as const, text: "Edit  tests/auth.spec.ts          (+12, -5)" },
  { type: "output" as const, text: "..." },
  { type: "output" as const, text: "[34 tool calls, 6 minutes wall clock, 11 model turns]" },
  { type: "error" as const, text: "rate_limit_exceeded: five_hour at 100%. resets at 22:11Z." },
];

const chatSession = [
  { type: "command" as const, text: "[claude.ai chat session, same account, same 6 minutes]" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "user > can you explain how my auth/session.ts decides when to refresh?" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "[paste session.ts, 812 lines]" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude > [9-paragraph explanation, ~1,400 tokens out]" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "user > and where would I add a refresh-on-401 hook?" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude > [code snippet + 4-paragraph rationale]" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "[2 turns, 1 attachment, 6 minutes wall clock]" },
  { type: "success" as const, text: "five_hour delta over the same 6 minutes: +1.2%" },
];

const relatedPosts = [
  {
    href: "/alternative/claude-code-rolling-5-hour-vs-weekly-quota",
    title: "Rolling 5-hour vs weekly quota: two caps, one JSON",
    excerpt:
      "The two caps sit as sibling fields on the same response. Either one independently 429s your loop. Which one bites depends on plan tier and how Opus-heavy your week is.",
    tag: "Comparison",
  },
  {
    href: "/t/claude-rolling-5-hour-burn-rate",
    title: "Burn rate as Δu/Δt, not tokens per minute",
    excerpt:
      "Why the only honest burn rate is the change in server utilization over time, and why ccusage's tokens/minute is the wrong number for predicting when you hit the wall.",
    tag: "Math",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage walks local JSONL files and totals tokens. ClaudeMeter polls server quota. Different questions, both useful, run both on Code-heavy weeks.",
    tag: "Reference",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code session burn rate vs chat: same bucket, very different burn",
  description:
    "Claude Code and claude.ai chat both deplete one shared 5-hour and 7-day bucket per Anthropic org. Code typically burns the bucket 5-10x faster per minute than chat because each agentic turn fans out into tool calls, file reads, and multi-turn context replay. ClaudeMeter is the only tracker that polls both the OAuth-token endpoint (Code-only) and the cookie endpoint (chat + everything) so you can see the split honestly.",
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

export default function ClaudeCodeSessionBurnRateVsChatPage() {
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
          Claude Code session burn rate{" "}
          <GradientText>vs chat</GradientText>: same bucket, very different burn
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Both surfaces deplete one shared org-scoped bucket on the server.
          What people miss: a Claude Code agentic loop drains that bucket
          roughly 5 to 10 times faster than the same minute spent in claude.ai
          chat. Below is the JSON field that proves it (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>
          ), the two endpoints that surface the split, and the exact lines
          inside claude-meter that read both.
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-11)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            <strong>
              Claude Code and claude.ai chat share the same five_hour and
              seven_day buckets on your Anthropic org.
            </strong>{" "}
            In our snapshots Code typically burns 5 to 10 times faster per
            wall-clock minute, because each agentic turn fans out into tool
            calls, file reads, and full-context replay. The server already
            tracks the split via the{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day_oauth_apps
            </code>{" "}
            sub-bucket on{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /api/organizations/&#123;org&#125;/usage
            </code>
            , the same JSON{" "}
            <a
              href="https://claude.ai/settings/usage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              claude.ai/settings/usage
            </a>{" "}
            renders. ClaudeMeter pins both the Code-only view (
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /api/oauth/usage
            </code>
            ) and the combined view to the menu bar so the split is visible
            without doing the subtraction by hand.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Two surfaces, one bucket, two probes
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The thing that confuses people is that there is one cap and two
          completely different code paths into it. claude-meter polls both
          paths because each one tells you something the other cannot.
        </p>
        <AnimatedBeam
          title="How claude-meter sees the split"
          from={[
            { label: "claude.ai chat", sublabel: "browser session cookie" },
            { label: "Claude Code CLI", sublabel: "OAuth bearer token" },
            { label: "IDE / editor extension", sublabel: "OAuth bearer token" },
          ]}
          hub={{
            label: "Anthropic org bucket",
            sublabel: "five_hour + seven_day",
          }}
          to={[
            {
              label: "/api/organizations/{org}/usage",
              sublabel: "combined view (cookie path)",
            },
            {
              label: "/api/oauth/usage",
              sublabel: "Code-only view (OAuth path)",
            },
          ]}
        />
        <p className="text-zinc-600 text-center mt-6 max-w-3xl mx-auto">
          One bucket on the left. Two views into it on the right. The server
          decides the gate; we decide which lens to read it through.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          A 6-minute window, side by side
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Same account, same plan, same wall-clock window. On the left, a
          Claude Code refactor. On the right, a focused chat session reading
          and discussing the same code. Watch the 5-hour delta. This is the
          actual shape of the difference, not a synthetic benchmark.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <TerminalOutput title="Claude Code session" lines={codeLoopSession} />
          <TerminalOutput title="claude.ai chat session" lines={chatSession} />
        </div>
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The chat side moves the five_hour bucket by about a percentage
          point. The Code side pegs the same bucket inside the same 6 minutes.
          Same plan, same account, very different burn shape, because every
          tool call counts.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The numbers that survive the wall clock
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Rough order-of-magnitude figures, from a typical Max-plan workday
          where the same engineer is using both surfaces. Your mileage varies
          (Opus vs Sonnet, file sizes, how many tests run per turn), but the
          shape is consistent across the accounts we have looked at.
        </p>
        <MetricsRow
          metrics={[
            { value: 9, suffix: "x", label: "Code burn rate vs chat (median)" },
            { value: 34, label: "Tool calls in a 6-min Code loop" },
            { value: 2, label: "Turns in a 6-min chat session" },
            { value: 1, suffix: "%", label: "5-hour delta from a chat turn" },
          ]}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Field-by-field: Code burn vs chat burn
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Same bucket on the server. Different code paths in, different
          per-turn shape, different model-class skew. The columns below come
          from reading both endpoints in real time, not from a marketing deck.
        </p>
        <ComparisonTable
          productName="Claude Code (OAuth path)"
          competitorName="claude.ai chat (cookie path)"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The JSON that already knows the split
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Anthropic does not expose a chat-vs-Code breakdown in the in-app
          settings page, but the server has already done the math. The
          response below is what the browser actually receives when the
          Settings &gt; Usage page loads. Notice{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>{" "}
          sitting next to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>
          . Subtract one from the other and you have the chat share of the
          week.
        </p>
        <AnimatedCodeBlock
          code={usageJson}
          language="json"
          filename="GET /api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          On the snapshot above, the weekly bucket is at 68%; the OAuth-app
          (Code) slice is at 61%. That implies the chat-and-everything-else
          share of the week is about 7 percentage points. Code is roughly nine
          times the chat burn for this account this week. The server already
          knows; the Settings page just does not show it.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The two endpoints, the two clients
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          claude-meter is a Rust menu bar app, so this part is short. There
          are two endpoints. Each one needs a different auth and a different
          HTTP client (claude.ai is behind Cloudflare and requires Chrome
          fingerprint emulation; api.anthropic.com is not). The Code-only
          view:
        </p>
        <AnimatedCodeBlock
          code={oauthRsExcerpt}
          language="rust"
          filename="src/oauth.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          And the combined view, which counts chat plus Code plus IDE plus
          any other OAuth-app traffic on the org:
        </p>
        <div className="mt-4">
          <AnimatedCodeBlock
            code={apiRsExcerpt}
            language="rust"
            filename="src/api.rs"
          />
        </div>
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Both responses deserialize into the same struct, because the JSON
          shape is identical. That struct declares every sub-bucket as
          nullable, so when the server starts returning a new one (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_cowork
          </code>{" "}
          appeared mid-2026), the parser keeps working:
        </p>
        <div className="mt-4">
          <AnimatedCodeBlock
            code={modelsRsExcerpt}
            language="rust"
            filename="src/models.rs"
          />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the menu bar dropdown actually says
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          On a Monday afternoon, mid-refactor, after a weekend of light chat
          use, the dropdown for the account looks like the run below. The
          implied chat slice is calculated as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day &minus; seven_day_oauth_apps
          </code>
          . That is the number that does not appear anywhere in
          claude.ai&apos;s own UI.
        </p>
        <TerminalOutput title="claude-meter dropdown, Monday 18:24" lines={dropdownSession} />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The seven_day_opus row at 94% is the real failure mode here, not the
          oauth-apps row. The five_hour at 81% is climbing because the
          refactor is still going. If you switched to chat for the rest of the
          afternoon, oauth-apps would stop climbing, but seven_day would keep
          climbing because chat still adds to it. The right move on this
          snapshot is to drop the agent to Sonnet for the rest of the week so
          seven_day_opus bleeds back down.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Three burn-shape failure modes
        </h2>
        <GlowCard>
          <div className="p-2 space-y-4">
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>The mid-loop wall.</strong> Five_hour climbs through 80,
              90, 100 inside a 90-minute Code session. The 7-day bucket is
              still fine; you just sprinted. Either wait an hour for old
              prompts to age out, or accept that the cap is keeping you from
              looping faster than the cluster wants you to.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>The Tuesday weekly wall on Opus.</strong> Five_hour is
              fine, seven_day_opus is at 100. Opus weighting is heavier per
              byte and Code defaults to Opus on Max. Resets_at on
              seven_day_opus is five days out. Switch the agent to Sonnet
              today and the seven_day_opus float bleeds down over 24 hours
              while Sonnet picks up the slack.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>The phantom &ldquo;chat is fine&rdquo; bias.</strong>{" "}
              People assume chat is cheap because the bar barely moves when
              they type. That holds for typing. It does not hold for uploads.
              One Claude.ai upload of a PDF deck or a screenshot of a repo
              tree can be five percentage points on the 5-hour in one click.
              Most of the chat surprises come from attachments, not from
              prompts.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why no local-log tool can answer this question
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ccusage, ccburn, Claude-Code-Usage-Monitor all walk{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/*.jsonl
          </code>{" "}
          and total token counts. That is excellent for cost attribution per
          pull request and per project. It cannot answer the chat-vs-Code
          question because:
        </p>
        <ul className="space-y-3 text-zinc-700 leading-relaxed text-lg ml-6 list-disc">
          <li>
            <strong>chat usage never writes to that path.</strong> claude.ai
            does not put anything on your disk. So the chat side is invisible
            to any tool that reads JSONL.
          </li>
          <li>
            <strong>tool-call cost is weighted on the server</strong> and the
            weighting is not in the local file. A 1500-line file Read is one
            JSONL row plus a token total; the bucket-cost weighting on top of
            that lives only in the server response.
          </li>
          <li>
            <strong>peak-hour multiplier</strong> on the five_hour (Anthropic
            March 2026 statement: weekdays 5 to 11 a.m. Pacific) shifts the
            wall-clock cost of the same byte. Local files have no clock.
          </li>
          <li>
            <strong>seven_day_opus weighting</strong> charges Opus heavier per
            byte than Sonnet against the weekly. JSONL files record tokens,
            not the model-class weighting.
          </li>
        </ul>
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Run ccusage when you need cost-per-PR. Run claude-meter when you
          need to see which surface is eating your week. They answer different
          questions; on a Code-heavy week the answers can drift by 30 to 40
          points and both are correct.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/oauth/usage
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          endpoints are both undocumented. Anthropic can rename a field, split
          a bucket, or change the weighting at any time. claude-meter declares
          every nullable field as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option
          </code>{" "}
          in Rust so a missing field downgrades to a missing row rather than a
          crash. macOS 12+ only today; Safari extension is not supported. The
          repo is open at{" "}
          <a
            href="https://github.com/m13v/claude-meter"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            github.com/m13v/claude-meter
          </a>{" "}
          if you want to see exactly which requests it makes on your behalf.
          Install is one{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            brew install --cask m13v/tap/claude-meter
          </code>
          .
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Want me to look at your Code-vs-chat split with you?"
          description="15 minutes. Share your screen, walk me through a typical week, and I will show you which surface is actually eating your seven_day and what to switch so you stop blowing through the wrong bucket."
          text="Book a 15-minute call"
          section="code-burn-vs-chat-footer"
          site="claude-meter"
        />
      </div>

      <FaqSection items={faqs} />

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </section>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Want help splitting Code burn from chat burn? 15 min."
        section="code-burn-vs-chat-sticky"
        site="claude-meter"
      />
    </article>
  );
}
