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

const PAGE_URL = "https://claude-meter.com/t/claude-code-hang-status-signal";
const PUBLISHED = "2026-05-09";

export const metadata: Metadata = {
  title:
    "Claude Code hang vs rate-limit: which status signal is actually telling you the truth",
  description:
    "When Claude Code freezes mid-edit, the status line, the /status command, and the spinner are all local signals. None of them can tell you if Anthropic has rate-limited you. The one signal that can lives on the server.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code hang vs rate-limit: which status signal is actually telling you the truth",
    description:
      "The status line, /status, and the spinner all read local state. The one signal that distinguishes a client-side hang from a rate-limit wall lives on the server, at /api/organizations/{org}/usage.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "How do I tell if Claude Code is hung or rate-limited?",
    a: "The status line at the bottom of the terminal reads context_window.used_percentage from a JSON object piped over stdin. That is local context-window utilization, not server-side quota. To check if you've actually been rate-limited, open claude.ai/settings/usage in a browser tab. If the five-hour or seven-day bar is at or near 100 percent, the hang is a rate-limit and waiting is the only fix until resets_at. If both bars are clean and the process has consumed zero tokens for several minutes, the hang is client-side, almost certainly the streaming-stall pattern from issue #25979 or the wedged-renderer pattern from issue #25286, and SIGKILL is safe.",
  },
  {
    q: "What does the Claude Code status line actually show?",
    a: "It is a customizable bar fed by a script you write. Claude Code pipes a JSON object to that script's stdin on each update, with fields for the model display name, the workspace directory, cost so far in the session, and context_window.used_percentage. A common config is jq -r '\"[\\(.model.display_name)] \\(.context_window.used_percentage // 0)% context\"'. Every field is computed inside the local CLI process. There is no field for server quota, no field for five-hour utilization, and no field for weekly utilization. The status line is a window into the client; it cannot be a window into the server.",
  },
  {
    q: "Does /status show server-side rate-limit state?",
    a: "Partially, and only retroactively. /status surfaces the current model, the session's local context, and any error from the most recent API call. If your last call returned an anthropic-ratelimit-* header or a 429, you'll see it. But /status does not poll. If you've been hung for five minutes with no requests in flight, /status will show whatever state existed at your last successful call, which is older than the hang itself. It is a snapshot of the past, not a live signal of the rate-limit ceiling.",
  },
  {
    q: "If the spinner is moving, is Claude Code working?",
    a: "Not reliably. The spinner is driven by the terminal renderer, not by API progress. Issue #25286 documents a pattern where the renderer keeps animating at a 100 percent write ratio while the underlying request has stalled. Issue #44921 documents a pattern where token consumption sits at zero for 25-30 minutes while the spinner keeps spinning. The spinner means the process is alive. It does not mean a request is moving.",
  },
  {
    q: "What is the one signal that actually answers the question?",
    a: "GET the path /api/organizations/{your-org-uuid}/usage on the claude.ai host with your logged-in claude.ai cookies and a Referer header pointing to claude.ai/settings/usage. The response is JSON with seven Window objects (five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork) each shaped { utilization: f64, resets_at: Option<DateTime<Utc>> }. The same endpoint claude.ai/settings/usage renders the bar from. If five_hour.utilization is at or near 1.0, you've been rate-limited. ClaudeMeter polls this endpoint once a minute via your existing browser session and renders the worst bucket in the macOS menu bar.",
  },
  {
    q: "Why can't ccusage tell me whether I've been rate-limited?",
    a: "Because ccusage walks ~/.claude/projects/*.jsonl and sums local input/output tokens. That sum is correct as a token-flow measurement on this device. It is not the function the server's rate-limiter is computing. The server applies weights local logs cannot see (a peak-hour multiplier on weekday US Pacific midday hours, a per-attachment cost, a per-tool-call cost, a per-model weight where Opus burns faster than Sonnet for the same prompt, plus any traffic from claude.ai browser chats or other devices on the same account). The local sum and the server's utilization can diverge by an order of magnitude. There are reproducible reports of ccusage saying 5 percent while claude.ai 429s the next request.",
  },
  {
    q: "If I see five_hour.utilization at 0.95 while Claude Code is hung, what should I do?",
    a: "Three things, in this order. (1) Don't SIGKILL; the next prompt will hit the same wall. (2) Read resets_at to know when the wall lifts; the value is an ISO timestamp like 2026-05-09T19:22:00Z, which is when the oldest chargeable traffic in the bucket ages out. (3) If extra usage is enabled on your plan, switch to it for the rest of the session: Anthropic's metered overage path keeps working when the rolling-window bucket is full. ClaudeMeter renders the dollar amount used on extra usage next to the bar so you can see where you stand at a glance.",
  },
  {
    q: "If both bars are clean and Claude Code is still hung, what's actually wrong?",
    a: "It's a client-side stall. The four documented patterns: (1) the stream-json mode hang on issue #25629, where stdout buffering wedges after the result event; (2) the streaming-stall hang on issue #25979, where the SSE connection stops emitting events but the request stays open with no read timeout; (3) the wedged-renderer hang on issue #25286, where the terminal renderer reaches 100 percent write ratio and refuses input; (4) the zero-token-consumption hang on issue #44921, where the process runs but never sends a request. Press Esc once. If the process doesn't recover in 30 seconds, run pkill -f claude in another shell.",
  },
  {
    q: "What about the anthropic-ratelimit-* headers?",
    a: "Those are on responses from the Anthropic API surface (api.anthropic.com), not from claude.ai. They give you the most restrictive currently-active API rate limit for your API key (tokens-per-minute, requests-per-minute, input-tokens-remaining). They do not expose the rolling 5-hour or 7-day consumer-plan utilization that gates Claude Code on a Pro or Max subscription. The consumer plan's utilization comes back only on the private claude.ai endpoint. Different surface, different contract, not interchangeable.",
  },
  {
    q: "Why doesn't Claude Code show server quota in the status line itself?",
    a: "Because the CLI is given an API key or session credential at startup and talks only to api.anthropic.com or the equivalent Claude Code-specific endpoint. The consumer-plan quota lives on claude.ai under a different cookie scope. To bridge them, something has to call claude.ai/api/organizations/{org}/usage with your browser cookies and feed the result somewhere visible. That's exactly what ClaudeMeter's browser extension does: it runs inside Chrome, calls the endpoint with credentials: 'include', and POSTs the snapshot to the menu-bar app on localhost:63762. The status line could in principle shell out to that bridge, but it doesn't ship that way out of the box.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code hang status signal", url: PAGE_URL },
];

const statuslineStdinJson = `// what Claude Code pipes to your statusLine script's stdin
{
  "model": { "display_name": "Sonnet 4.6", "id": "claude-sonnet-4-6" },
  "workspace": { "current_dir": "/Users/you/repo" },
  "cost": { "total_cost_usd": 0.42 },
  "context_window": {
    "used_tokens": 87432,
    "max_tokens": 200000,
    "used_percentage": 43.7
  }
}
// every field is computed inside the local CLI process.
// no field for five_hour utilization, no field for weekly quota,
// no field for any server-side rate-limit state.`;

const serverEndpointJson = `// what /api/organizations/{org}/usage returns
{
  "five_hour": { "utilization": 0.97, "resets_at": "2026-05-09T19:22:00Z" },
  "seven_day": { "utilization": 0.61, "resets_at": "2026-05-15T09:02:00Z" },
  "seven_day_opus":   { "utilization": 0.84, "resets_at": "2026-05-15T09:02:00Z" },
  "seven_day_sonnet": { "utilization": 0.42, "resets_at": "2026-05-15T09:02:00Z" }
  // ... and three more buckets
}
// utilization is a fraction (or already-scaled percent if > 1).
// no tokens_used, no remaining, no limit. just utilization + resets_at.`;

const reproTerminal = [
  { type: "command" as const, text: "# claude code is hung. spinner is moving. status line says 31% context." },
  { type: "command" as const, text: "# is this a rate limit, or a client stall?" },
  { type: "command" as const, text: "" },
  { type: "command" as const, text: "# step 1: grab your org uuid from /api/account" },
  { type: "command" as const, text: "curl -s https://claude.ai/api/account \\\n  -H \"Cookie: $COOKIE\" \\\n  -H \"Referer: https://claude.ai/settings/usage\" \\\n  | jq -r '.memberships[0].organization.uuid'" },
  { type: "output" as const, text: "f3a2b1c4-9d6e-4f0a-8b22-1c4d5e6f7890" },
  { type: "command" as const, text: "" },
  { type: "command" as const, text: "# step 2: read the server's quota" },
  { type: "command" as const, text: "ORG=f3a2b1c4-9d6e-4f0a-8b22-1c4d5e6f7890" },
  { type: "command" as const, text: "HOST=claude.ai" },
  { type: "command" as const, text: "curl -s \"https://$HOST/api/organizations/$ORG/usage\" \\\n  -H \"Cookie: $COOKIE\" \\\n  -H \"Referer: https://$HOST/settings/usage\" \\\n  | jq '{five_hour, seven_day}'" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"five_hour\":  { \"utilization\": 0.99, \"resets_at\": \"2026-05-09T19:22:00Z\" }," },
  { type: "output" as const, text: "  \"seven_day\": { \"utilization\": 0.71, \"resets_at\": \"2026-05-15T09:02:00Z\" }" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "five_hour at 0.99. this is a rate-limit wall. SIGKILL won't help. wait until 19:22 UTC." },
];

const signalRows = [
  {
    feature: "Reads server-side quota",
    competitor: "No. Pulls JSON from local stdin only.",
    ours: "Yes. Reads /api/organizations/{org}/usage directly.",
  },
  {
    feature: "Updates while no request is in flight",
    competitor: "No. The status line only fires on Claude Code lifecycle events.",
    ours: "Yes. Polls every 60 seconds independently of Claude Code.",
  },
  {
    feature: "Shows whether you'll 429 on the next prompt",
    competitor: "No. Nothing in the stdin payload reflects rate-limit state.",
    ours: "Yes. five_hour.utilization is the same field the rate-limiter checks.",
  },
  {
    feature: "Shows resets_at countdown",
    competitor: "No.",
    ours: "Yes. Each Window carries its own resets_at timestamp.",
  },
  {
    feature: "Shows extra-usage dollars spent for metered billing",
    competitor: "No.",
    ours: "Yes. Companion /overage_spend_limit endpoint, used_credits in cents.",
  },
  {
    feature: "Includes traffic from other devices on the same account",
    competitor: "No. Local stdin payload covers this CLI process only.",
    ours: "Yes. Server aggregates across devices before computing utilization.",
  },
  {
    feature: "Includes claude.ai browser-chat traffic",
    competitor: "No. That traffic never enters Claude Code's stdin.",
    ours: "Yes. The server applies it to the same buckets.",
  },
  {
    feature: "Survives a hung Claude Code process",
    competitor: "No. If Claude Code is wedged, it stops piping JSON to the script.",
    ours: "Yes. The browser extension runs in Chrome, independent of the CLI.",
  },
];

const decisionSteps = [
  {
    title: "Glance at the status line first.",
    description:
      "If context_window.used_percentage is above ~85, your context is bloated and Claude is spending real time recomputing across the whole transcript on every prompt. That looks like a hang but it isn't, it's just slow. Press Esc, run /compact, and try again. If the percentage is below 70, context bloat is not your problem and you can rule it out.",
  },
  {
    title: "Run /status next.",
    description:
      "If the most recent API call returned a 429 or a rate-limit error, /status will show it. If /status reports an active error, you have a server-side rate-limit and your job is to wait for resets_at, not to debug the CLI. If /status looks clean, the hang predates any error response and you need a live signal, which /status cannot give you.",
  },
  {
    title: "Read the server endpoint directly.",
    description:
      "Open claude.ai/settings/usage in a browser tab, or curl /api/organizations/{org}/usage. If five_hour.utilization is at or above 0.95, you are about to be (or have just been) rate-limited and the hang is the queue forming on the server side. If both five_hour and seven_day utilization are below 0.80, the server has plenty of headroom and your hang is not a quota problem.",
  },
  {
    title: "Branch on what you found.",
    description:
      "Rate-limit branch: don't SIGKILL, the next prompt will hit the same wall. Read resets_at; switch to extra-usage if your plan has it enabled; otherwise wait. Client-side branch: press Esc, then if the process doesn't recover in 30 seconds, pkill -f claude in another shell. The wedged-renderer hang on issue #25286 specifically requires SIGKILL because Esc is buffered behind the renderer and never read.",
  },
  {
    title: "Make this signal continuous, not a curl.",
    description:
      "Polling claude.ai/settings/usage manually every time Claude Code feels stuck is a context-switch tax you'll pay dozens of times a week. The point of ClaudeMeter is to make the server signal a glance instead of a workflow: the macOS menu bar shows the worst bucket's utilization plus a countdown to the soonest resets_at, refreshed every 60 seconds. Same number, no alt-tab.",
  },
];

const flowSteps = [
  {
    label: "Local: Claude Code CLI",
    detail:
      "Reads context_window.used_percentage. Writes status line via stdin to your script. Knows nothing about server quota.",
  },
  {
    label: "Boundary: api.anthropic.com",
    detail:
      "Returns anthropic-ratelimit-* headers on each response. Visible in /status only after a request completes; not a poll.",
  },
  {
    label: "Server-truth: claude.ai/api/organizations/{org}/usage",
    detail:
      "Returns five_hour.utilization and six other buckets. The same endpoint claude.ai/settings/usage renders. Polled every 60s by the ClaudeMeter extension.",
  },
  {
    label: "Display: macOS menu bar",
    detail:
      "Worst-bucket percentage and the soonest resets_at. Color-coded: green under 80, amber 80-100, red at 100. Independent of the Claude Code process state.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-server-quota-visibility",
    title: "Server quota is a fraction with a private denominator",
    excerpt:
      "Why local token counters can't see what claude.ai/settings/usage actually enforces, and the two-field Window struct it returns instead.",
    tag: "Server truth",
  },
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "Local counter vs server quota, side by side",
    excerpt:
      "Why ccusage says 5 percent while claude.ai 429s the next request. The weights local logs cannot see.",
    tag: "Comparison",
  },
  {
    href: "/t/claude-rolling-5-hour-burn-rate",
    title: "Burn rate against a rolling window, not a calendar window",
    excerpt:
      "How utilization drifts minute to minute even when you stop sending messages, and why a sample from 30 minutes ago is usually wrong.",
    tag: "Drift",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code hang vs rate-limit: which status signal is actually telling you the truth",
  description:
    "When Claude Code freezes, the status line and /status read local state. Only the server's /api/organizations/{org}/usage endpoint can tell you if you've been rate-limited. Here's how to read each signal and decide.",
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

export default function ClaudeCodeHangStatusSignalPage() {
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
          Claude Code hung. Which{" "}
          <GradientText>status signal</GradientText> is actually telling you
          what happened?
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Three signals are usually on screen when Claude Code freezes: the
          status line at the bottom of the terminal, the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /status
          </code>{" "}
          command, and the spinner. All three read local state. None of them
          can tell you whether Anthropic has rate-limited you on the server.
          The signal that can answer that lives at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>
          , and you can read it directly.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="7 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <GlowCard>
          <div className="p-6 sm:p-8">
            <div className="text-xs uppercase tracking-wider text-teal-700 font-semibold mb-2">
              Direct answer (verified 2026-05-09)
            </div>
            <p className="text-zinc-800 leading-relaxed text-lg">
              The Claude Code status line is fed JSON over stdin with{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                context_window.used_percentage
              </code>
              , a local context-window count. It does not show server-side
              quota. To distinguish a rate-limit hang from a client-side stall,
              read{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                claude.ai/settings/usage
              </code>{" "}
              (or its source endpoint{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /api/organizations/&#123;org&#125;/usage
              </code>
              ). If{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                five_hour.utilization
              </code>{" "}
              is at or near 1.0, your hang is a rate-limit and SIGKILL will not
              help. If both rolling windows are clean and Claude Code has shown
              zero token consumption for several minutes, the process is
              wedged client-side and SIGKILL is safe.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Signal 1: the status line
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The bar at the bottom of your Claude Code terminal is fed by a
          script you write. On every update, Claude Code pipes a JSON object
          to that script&apos;s stdin. The fields the docs guarantee are the
          model name, the workspace directory, cumulative session cost, and
          the context window&apos;s{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            used_percentage
          </code>
          .
        </p>
        <AnimatedCodeBlock
          code={statuslineStdinJson}
          language="json"
          filename="stdin to your statusLine script"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Every number in this payload comes from inside the local CLI
          process. There is no field for five-hour quota. There is no field
          for weekly quota. There is no field for any server-side rate-limit
          state. The status line is, by design, a window into the client.
          That makes it useful for context bloat (above ~85 percent and your
          next prompt will be slow regardless of quota) and useless for
          quota itself.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Signal 2: the <code className="bg-zinc-100 px-2 py-0.5 rounded font-mono">/status</code> command
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Running{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /status
          </code>{" "}
          inside Claude Code surfaces the current model, the session&apos;s
          context, and any error from the most recent API call. If your last
          completed call returned a 429 or an{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            anthropic-ratelimit-*
          </code>{" "}
          header, you&apos;ll see it.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The catch is that{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /status
          </code>{" "}
          does not poll. If you&apos;ve been hung for five minutes with no
          requests in flight, it shows whatever state existed at your last
          completed call, which is by definition older than the hang itself.
          And on Pro and Max plans, the rate limiter that fires for Claude
          Code traffic is the rolling 5-hour and 7-day window on the consumer
          side, not the API rate-limit headers. So{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /status
          </code>{" "}
          can confirm a past 429, but it cannot tell you whether your{" "}
          <em>next</em> prompt will hit the wall.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Signal 3: the spinner (don&apos;t trust it)
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The animated spinner is driven by the terminal renderer, not by API
          progress. There are several open issues on{" "}
          <a
            href="https://github.com/anthropics/claude-code/issues"
            className="text-teal-600 underline decoration-teal-200 hover:decoration-teal-500"
            target="_blank"
            rel="noreferrer"
          >
            anthropics/claude-code
          </a>{" "}
          documenting hangs where the spinner keeps animating while the
          underlying request has stalled or never started:
        </p>
        <ul className="space-y-2 text-zinc-700 text-lg list-disc pl-6">
          <li>
            Issue #25286: terminal renderer reaches 100 percent write ratio,
            input is buffered and never read.
          </li>
          <li>
            Issue #25979: streaming connection stalls mid-response with no
            read timeout; process stays alive, no progress.
          </li>
          <li>
            Issue #25629: stream-json mode hangs indefinitely after the
            result event due to stdout buffering.
          </li>
          <li>
            Issue #44921: zero token consumption for 25-30 minutes; the
            spinner spins, the API never sees a request.
          </li>
        </ul>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The spinner means the process is alive. It does not mean a request
          is moving. Treat it as a liveness check, not as progress.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            The one signal that answers the question
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg mb-6">
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              GET /api/organizations/&#123;org_uuid&#125;/usage on claude.ai
            </code>{" "}
            with your logged-in claude.ai cookies and{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              Referer: https://claude.ai/settings/usage
            </code>
            . The response is JSON with seven Window-shaped objects. Each
            Window has exactly two fields: a utilization fraction and a
            resets_at timestamp. The same endpoint{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              claude.ai/settings/usage
            </code>{" "}
            renders. The same field the rate limiter checks.
          </p>
          <AnimatedCodeBlock
            code={serverEndpointJson}
            language="json"
            filename="GET /api/organizations/{org}/usage"
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Side by side: what each signal can answer
        </h2>
        <ComparisonTable
          productName="Server endpoint"
          competitorName="Status line / /status / spinner"
          rows={signalRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Walking the decision: hang vs rate-limit, in five steps
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-8">
          When Claude Code locks up mid-refactor, you have under a minute
          before context-switching to a different terminal feels worse than
          the hang itself. Run this in order. It&apos;s designed to rule
          things out cheaply.
        </p>
        <StepTimeline steps={decisionSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce it yourself with curl
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Two requests answer the question. The first finds your org UUID
          (which is needed because the usage endpoint is org-scoped). The
          second reads quota for that org. Both reuse your existing
          claude.ai cookie; nothing is pasted.
        </p>
        <TerminalOutput
          title="curl /api/organizations/{org}/usage during a hang"
          lines={reproTerminal}
        />
        <p className="text-zinc-600 leading-relaxed text-base mt-6">
          The Referer header is load-bearing. Drop it and the endpoint
          returns 403. The server checks Referer as part of its CSRF story;
          both ClaudeMeter routes (extension and binary) set it explicitly.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why local tools structurally cannot answer this
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ccusage and Claude-Code-Usage-Monitor both walk{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/*.jsonl
          </code>{" "}
          and sum tokens. That sum is real and useful as a measurement of
          token flow on this device. It is not the function the
          rate-limiter computes on the server. The server applies weights
          local logs cannot see:
        </p>
        <ul className="space-y-2 text-zinc-700 text-lg list-disc pl-6">
          <li>
            A peak-hour multiplier on weekday US Pacific midday hours.
          </li>
          <li>
            A per-attachment cost that fires the moment you upload a PDF
            or image.
          </li>
          <li>A per-tool-call cost on code execution and web browsing.</li>
          <li>
            A per-model weight where Opus burns faster than Sonnet for the
            same prompt.
          </li>
          <li>
            Any prompt sent on{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              claude.ai
            </code>{" "}
            in the browser, which never lands in the local JSONL files.
          </li>
          <li>
            Any traffic from other devices on the same account.
          </li>
        </ul>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Stack a few of those up and the local count and the server count
          can diverge by an order of magnitude. There are reproducible
          reports of ccusage saying 5 percent while the next prompt 429s.
          The local number isn&apos;t wrong; it&apos;s answering a
          different question.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Where each signal lives in the stack
        </h2>
        <FlowDiagram
          title="Four layers, three of them local, only one of them authoritative for quota"
          steps={flowSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Making the server signal continuous
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Curling{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          every time Claude Code feels stuck is a context-switch tax. The
          ClaudeMeter extension does this for you on a 60-second cadence
          (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            POLL_MINUTES = 1
          </code>{" "}
          in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extension/background.js
          </code>
          ) and renders the worst bucket plus the soonest{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          in the macOS menu bar. Color-coded: green under 80, amber 80 to
          100, red at 100. When Claude Code hangs, you glance at the menu
          bar instead of opening{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          in a tab.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          One install command (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            brew install --cask m13v/tap/claude-meter
          </code>
          ), one extension load, no cookie paste. The extension reads your
          existing claude.ai session from the browser; the menu-bar app
          listens on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            127.0.0.1:63762
          </code>{" "}
          for snapshots. No telemetry, MIT licensed, single HTTPS request
          per minute to claude.ai.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Your Claude Code keeps stalling at random times of day. Want a 15-minute walkthrough?"
          description="Bring a session log. We'll trace which of the four hang patterns matches and whether the server-side wall is what's actually firing."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-20 mb-24">
        <RelatedPostsGrid
          title="More on the server-truth gap"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Stuck Claude Code? Walk through which signal is actually firing."
      />
    </article>
  );
}
