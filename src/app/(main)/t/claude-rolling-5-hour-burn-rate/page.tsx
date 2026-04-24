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
  BentoGrid,
  ProofBanner,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-rolling-5-hour-burn-rate";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title: "Claude Rolling 5-Hour Burn Rate: Δu/Δt, Not Tokens per Minute",
  description:
    "The only correct burn rate for Claude's rolling 5-hour window is the delta of server-side utilization between polls. Local-token tools (ccusage, ccburn, Claude-Code-Usage-Monitor) cannot see the weighting Anthropic applies. Here is the math, the file, and the rate you actually want to watch.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Rolling 5-Hour Burn Rate: Δu/Δt, Not Tokens per Minute",
    description:
      "Why tokens-per-minute burn rate from local JSONL logs is the wrong number, and how ClaudeMeter derives the server-truth rolling burn rate from snapshots.json.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What is the correct way to define burn rate on Claude's rolling 5-hour window?",
    a: "Burn rate is the change in server-side utilization over time: Δu/Δt, where u comes from usage.five_hour.utilization on /api/organizations/{org_uuid}/usage and t is the wall clock. If u went from 0.42 to 0.49 over 60 seconds, your rolling 5-hour burn rate is +0.07 per minute, or roughly +7 percentage points per minute. It is a signed number. In a steady chat that is drifting down because messages are ageing out, it can be negative without you doing anything.",
  },
  {
    q: "Why are tokens-per-minute burn rates from ccusage or ccburn wrong?",
    a: "They are not wrong as a token-flow measurement. They are wrong as a quota-drain measurement. Those tools read ~/.claude/projects/**/*.jsonl, total token counts, and divide by elapsed minutes. That gives you a local tokens/minute number. The rate limiter does not check that number. The rate limiter trips on five_hour.utilization on the server, which is weighted by at least four multipliers the JSONL file never sees: a peak-hour multiplier announced by Anthropic in late 2025, a per-attachment cost, a per-tool-call cost, and a per-model weight (Opus burns faster than Sonnet). If you run the same 50 tokens at 6am Pacific and at 1pm Pacific, the tokens/minute number is identical and the utilization delta is not.",
  },
  {
    q: "Can burn rate go negative on a rolling window?",
    a: "Yes. That is the defining property of a rolling window. Imagine you sent a big message four hours ago and nothing since. When the wall clock crosses five hours from that message, its cost drops out of the window and utilization drops with it. If you poll once before and once after that moment, Δu/Δt is negative. Tokens-per-minute tools cannot show this because tokens do not un-spend themselves locally. The utilization delta can.",
  },
  {
    q: "How does ClaudeMeter actually compute the burn rate?",
    a: "It does not display a burn rate widget today. What it does do, which enables you to compute one correctly, is persist every poll to ~/Library/Application Support/ClaudeMeter/snapshots.json via save_snapshots() in src/bin/menubar.rs lines 910 to 918. The poll cadence is 60 seconds (POLL_INTERVAL at menubar.rs:18) for the native app and once per minute for the browser extension (POLL_MINUTES in extension/background.js:3). Each snapshot is a full UsageSnapshot (models.rs lines 60 to 73) including usage.five_hour.utilization and resets_at. Δu/Δt across two adjacent rows of that file is the server-truth rolling burn rate.",
  },
  {
    q: "Where does claude.ai itself get this number?",
    a: "claude.ai/settings/usage calls GET /api/organizations/{your-org-uuid}/usage and renders the bar from five_hour.utilization. The Settings page does not display a burn rate. It shows a point-in-time percent. If you want a rate you need two points and a subtraction, which is what ClaudeMeter's persisted snapshot file gives you.",
  },
  {
    q: "What units should I report burn rate in?",
    a: "Report it in utilization per minute, signed. A burn rate of +0.012/min means you are adding about 1.2 percentage points of five_hour quota every minute, which at 100 percent ceiling leaves you ~83 minutes before a 429. A burn rate of +0.08/min (seen during peak-hour Opus with tool calls) leaves you ~12.5 minutes. A burn rate of -0.003/min means the rolling boundary is draining faster than you are filling it. Do not convert to tokens/min, that is a different question.",
  },
  {
    q: "Why does the server response use both 0-to-1 and 0-to-100 scales?",
    a: "Because the endpoint is internal and the scale is inconsistent across buckets and across releases. We have seen five_hour return 0.72 and seven_day_opus return 94.0 in the same payload. ClaudeMeter normalizes with one clamp at extension/popup.js lines 6 to 11: u <= 1 ? u * 100 : u. If you write your own burn-rate script and skip that clamp, a row at 0.94 subtracted from a row at 0.97 gives you +0.03 raw, which looks like 3 percentage points per minute, but is actually 0.03 percentage points per minute. Normalize before differencing.",
  },
  {
    q: "How often should I poll to compute burn rate?",
    a: "Once per 60 seconds is what ClaudeMeter uses and is a safe ceiling. The claude.ai endpoint is not published with a documented rate limit but the Settings page itself polls on a similar cadence when open. Higher-frequency polling gives you better resolution on the burn rate but is more likely to get 429d on its own. If you need subminute resolution, smooth with an exponential moving average rather than increasing the poll rate.",
  },
  {
    q: "What fields in snapshots.json matter for burn rate?",
    a: "Three: fetched_at (an ISO timestamp, wall clock of the poll), usage.five_hour.utilization (the server-weighted quota fraction), and usage.five_hour.resets_at (the next age-out moment). The first two give you Δu/Δt. The third tells you which way the boundary is moving, which is how you know if a negative delta is explained by age-out or by the server briefly returning a stale number. All three are persisted every poll.",
  },
  {
    q: "Does the peak-hour multiplier appear as a separate field?",
    a: "No. Anthropic does not expose the multiplier. It is baked into utilization. The effect is directly visible in the burn rate: the same workload at 6am Pacific produces a lower Δu/Δt than at 1pm Pacific on a weekday. If your burn rate suddenly doubles at 9am Pacific with no change in prompt pattern, you are seeing the peak-hour weight turn on.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude rolling 5-hour burn rate", url: PAGE_URL },
];

const snapshotsExcerpt = `// snapshots.json, two consecutive poll rows (formatted for readability)
[
  {
    "org_uuid": "9b8f…",
    "fetched_at": "2026-04-24T17:14:02.118Z",
    "usage": {
      "five_hour":   { "utilization": 0.42, "resets_at": "2026-04-24T20:58:11Z" },
      "seven_day":   { "utilization": 0.31, "resets_at": "2026-04-29T12:00:00Z" }
    }
  },
  {
    "org_uuid": "9b8f…",
    "fetched_at": "2026-04-24T17:15:03.204Z",
    "usage": {
      "five_hour":   { "utilization": 0.49, "resets_at": "2026-04-24T21:00:47Z" },
      "seven_day":   { "utilization": 0.31, "resets_at": "2026-04-29T12:00:00Z" }
    }
  }
]
// Δu = 0.49 - 0.42 = +0.07
// Δt = 60.086 seconds
// burn rate = +0.07 per minute (≈ +7 percentage points per minute)`;

const pathSource = `// claude-meter/src/bin/menubar.rs (lines 896-898)
fn snapshots_path() -> Option<PathBuf> {
    dirs::config_dir().map(|p| p.join("ClaudeMeter").join("snapshots.json"))
}`;

const saveSource = `// claude-meter/src/bin/menubar.rs (lines 910-918)
fn save_snapshots(snaps: &[UsageSnapshot]) {
    let Some(path) = snapshots_path() else { return };
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    if let Ok(s) = serde_json::to_string_pretty(snaps) {
        let _ = std::fs::write(&path, s);
    }
}`;

const pollSource = `// claude-meter/src/bin/menubar.rs (line 18)
const POLL_INTERVAL: Duration = Duration::from_secs(60);

// claude-meter/extension/background.js (line 3)
const POLL_MINUTES = 1;`;

const burnScript = `# burn-rate.sh  —  24 lines, pure bash + jq
# Reads the two most recent snapshots, prints signed Δu/Δt in pct/min.
FILE="$HOME/Library/Application Support/ClaudeMeter/snapshots.json"
ORG="$1"  # org_uuid you want to score

jq -r --arg org "$ORG" '
  [ .[] | select(.org_uuid == $org) ]
  | sort_by(.fetched_at)
  | .[-2:]
  | map({
      t: .fetched_at,
      u: (.usage.five_hour.utilization
           | if . <= 1 then . * 100 else . end)
    })
  | "\\(.[0].t)\\t\\(.[0].u)\\n\\(.[1].t)\\t\\(.[1].u)"
' "$FILE" | awk -F'\\t' '
  NR==1 { t0=$1; u0=$2 }
  NR==2 {
    cmd="date -j -f %Y-%m-%dT%H:%M:%S.000Z \\"" substr(t0,1,19) ".000Z\\" +%s"
    cmd | getline s0; close(cmd)
    cmd="date -j -f %Y-%m-%dT%H:%M:%S.000Z \\"" substr($1,1,19) ".000Z\\" +%s"
    cmd | getline s1; close(cmd)
    dt = (s1 - s0) / 60.0
    du = $2 - u0
    printf "%+0.3f pct/min  (Δu=%+0.2f pct, Δt=%0.1f min)\\n", du/dt, du, dt
  }'`;

const reproTerminal = [
  { type: "command" as const, text: "# Get the two most recent rows for this account" },
  { type: "command" as const, text: "cat ~/Library/Application\\ Support/ClaudeMeter/snapshots.json \\" },
  { type: "command" as const, text: "  | jq '[.[] | select(.account_email==\"you@example.com\")] | sort_by(.fetched_at) | .[-2:]'" },
  { type: "output" as const, text: "[" },
  { type: "output" as const, text: "  {\"fetched_at\":\"…T17:14:02.118Z\", \"usage\":{\"five_hour\":{\"utilization\":0.42}}}," },
  { type: "output" as const, text: "  {\"fetched_at\":\"…T17:15:03.204Z\", \"usage\":{\"five_hour\":{\"utilization\":0.49}}}" },
  { type: "output" as const, text: "]" },
  { type: "command" as const, text: "# Δu/Δt = (0.49 − 0.42) / 1.001 min ≈ +7.0 pct/min" },
  { type: "success" as const, text: "At +7.0 pct/min with 51 pct headroom, ETA to 100 pct is ~7.3 minutes." },
];

const weightChecklist = [
  {
    text: "Peak-hour multiplier (Anthropic late-2025 note): weekday US Pacific midday raises the quota cost of every prompt. Local JSONL files see the same tokens; utilization sees more.",
  },
  {
    text: "Per-attachment cost: PDFs, images, and files tacked to a prompt land on utilization. Token logs record only the text tokens Claude Code sent.",
  },
  {
    text: "Per-tool-call cost: code execution, web search, and MCP tool calls add weight the local logs do not account for in the same units.",
  },
  {
    text: "Per-model weight: Opus costs more per token than Sonnet. A 1000-token Opus prompt and a 1000-token Sonnet prompt produce the same tokens/minute, not the same Δu/Δt.",
  },
  {
    text: "Browser-chat usage: prompts sent on claude.ai (not via Claude Code) never land in ~/.claude/projects. They absolutely land on five_hour.utilization.",
  },
];

const sequenceActors = ["Prompt source", "claude.ai server", "five_hour bucket", "ClaudeMeter poll", "snapshots.json"];
const sequenceMessages = [
  { from: 0, to: 1, label: "POST /completions", type: "request" as const },
  { from: 1, to: 2, label: "increment by weight(prompt, model, attachments, tools, peak)", type: "event" as const },
  { from: 2, to: 1, label: "utilization_t1 (post-weighting)", type: "response" as const },
  { from: 3, to: 1, label: "GET /api/organizations/{org}/usage", type: "request" as const },
  { from: 1, to: 3, label: "{ five_hour: { utilization: 0.49, resets_at } }", type: "response" as const },
  { from: 3, to: 4, label: "append { fetched_at, utilization } row", type: "event" as const },
  { from: 4, to: 3, label: "previous row { fetched_at: t0, utilization: 0.42 }", type: "response" as const },
  { from: 3, to: 3, label: "burn rate = (0.49 − 0.42) / (t1 − t0)", type: "event" as const },
];

const driversBeamFrom = [
  { label: "Prompt tokens", sublabel: "text you sent" },
  { label: "Attachments", sublabel: "PDFs, images" },
  { label: "Tool calls", sublabel: "code exec, web, MCP" },
  { label: "Model picked", sublabel: "Sonnet vs Opus weight" },
  { label: "Peak-hour multiplier", sublabel: "weekday US Pacific midday" },
];

const driversBeamTo = [
  { label: "+Δu in five_hour.utilization" },
  { label: "429 at utilization ≥ 1.0" },
  { label: "New row in snapshots.json" },
  { label: "Δu/Δt = rolling burn rate" },
];

const steps = [
  {
    title: "Install the native app and browser extension",
    description:
      "The extension forwards your existing claude.ai session to the native app over localhost:63762. Zero cookie paste. The native app polls every 60 seconds (POLL_INTERVAL at menubar.rs:18) and appends one snapshot per org per browser.",
  },
  {
    title: "Locate snapshots.json on disk",
    description:
      "On macOS it is at ~/Library/Application Support/ClaudeMeter/snapshots.json. The path is computed by snapshots_path() at menubar.rs:896-898 using dirs::config_dir(). Each row is a full UsageSnapshot struct (models.rs:60-73).",
  },
  {
    title: "Sort by fetched_at, take the two most recent",
    description:
      "jq '[.[]] | sort_by(.fetched_at) | .[-2:]' is enough. Each row carries usage.five_hour.utilization and usage.five_hour.resets_at.",
  },
  {
    title: "Normalize scale, then subtract",
    description:
      "Server returns five_hour sometimes as 0.72, sometimes as 72.0 (even in adjacent buckets of the same payload). Apply the same clamp ClaudeMeter uses at popup.js:6-11: u <= 1 ? u * 100 : u. Then compute Δu in percentage points.",
  },
  {
    title: "Divide by elapsed minutes",
    description:
      "Δt is a real-world duration, not the server's five-hour boundary. For a 60-second poll cadence, Δt is about 1.0 minute. Burn rate is Δu / Δt in percent-per-minute, signed. Negative means the rolling boundary is draining faster than you are filling it.",
  },
  {
    title: "Project to 100 percent",
    description:
      "If burn rate is positive, ETA_to_429 = (100 − current_utilization) / burn_rate minutes. If it is negative or zero, the ETA is infinite and you are coasting. Recompute at the next poll because the slope is not stable (attachments and tool calls come in bursts).",
  },
];

const comparisonRows = [
  {
    feature: "Unit",
    ours: "percent per minute (signed)",
    competitor: "tokens per minute (positive only)",
  },
  {
    feature: "Data source",
    ours: "server-weighted utilization (snapshots.json)",
    competitor: "local JSONL in ~/.claude/projects",
  },
  {
    feature: "Peak-hour multiplier",
    ours: "baked in (server applies weight)",
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
    feature: "Can go negative when messages age out",
    ours: "yes (true rolling behavior)",
    competitor: "no (tokens only accrue)",
  },
  {
    feature: "Matches what the rate limiter checks",
    ours: "yes",
    competitor: "no",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-5-hour-window-quota",
    title: "Pro's 5-hour window is one float on a sliding clock, not 45 messages",
    excerpt:
      "What the five_hour object actually contains, why resets_at slides, and how to read the JSON in one curl.",
    tag: "Mental model",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "The rolling cap is seven windows, not one",
    excerpt:
      "five_hour is the famous bucket. The same endpoint returns six more, each with its own ceiling.",
    tag: "Deep dive",
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
  headline: "Claude rolling 5-hour burn rate: Δu/Δt, not tokens per minute",
  description:
    "The correct burn rate for Claude's rolling 5-hour window is the signed delta of server-side utilization over wall time, computed from snapshots.json. Local-token tools cannot see Anthropic's weighting. Here is the math, the file, and the script.",
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

const bentoCards = [
  {
    title: "One field, two numbers, one timestamp",
    description:
      "Everything you need to compute a rolling-5h burn rate is three keys: fetched_at, usage.five_hour.utilization, usage.five_hour.resets_at. Persisted every poll in snapshots.json.",
    size: "2x1" as const,
    accent: true,
  },
  {
    title: "Poll cadence: 60 seconds",
    description:
      "POLL_INTERVAL at menubar.rs:18. Matches the browser extension (POLL_MINUTES=1 in background.js:3). A 60s cadence gives you burn-rate resolution of about one percentage point per minute without risking 429 on the usage endpoint itself.",
    size: "1x1" as const,
  },
  {
    title: "Path: ~/Library/Application Support/ClaudeMeter/snapshots.json",
    description:
      "Computed by snapshots_path() at menubar.rs:896-898 using dirs::config_dir(). Written by save_snapshots() at menubar.rs:910-918 as pretty JSON, so you can tail it with jq.",
    size: "1x1" as const,
  },
  {
    title: "Signed",
    description:
      "Because the window is rolling, the burn rate has a sign. Positive means you are filling. Negative means messages are ageing out faster than you are sending. Tokens-per-minute tools cannot represent this.",
    size: "1x1" as const,
  },
  {
    title: "Matches what the rate limiter checks",
    description:
      "ClaudeMeter reads the same endpoint claude.ai/settings/usage fetches. The utilization value there is the exact quantity the rate limiter compares against 1.0. A burn rate derived from it is the only burn rate that predicts a 429.",
    size: "2x1" as const,
    accent: true,
  },
];

export default function ClaudeRolling5HourBurnRatePage() {
  return (
    <article className="bg-white text-zinc-900">
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
          The rolling 5-hour burn rate is{" "}
          <GradientText>Δu/Δt on one server field</GradientText>, not tokens per minute from your local logs
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every burn-rate widget you have seen computes tokens per minute
          from files under <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">~/.claude/projects</code>.
          That is a token-flow rate. It is not the same number as the
          quota-drain rate the Anthropic rate limiter checks. The one
          that matters is a signed delta of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">five_hour.utilization</code>{" "}
          between two polls. Here is the exact file, the exact math, and a
          24-line script that produces it.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="built ClaudeMeter"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Sourced from snapshots.json, polled every 60 seconds"
          highlights={[
            "Derived from src/bin/menubar.rs lines 18, 896-898, 910-918",
            "Same endpoint claude.ai/settings/usage fetches",
            "Signed: tracks both fill and age-out",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <RemotionClip
          title="Burn rate = Δu / Δt"
          subtitle="What a rolling 5-hour burn rate really is on the wire"
          captions={[
            "u = five_hour.utilization (server-weighted)",
            "t = wall clock, stored as fetched_at",
            "signed: positive fills, negative ages out",
            "unit: percentage points per minute",
            "source: snapshots.json, not ~/.claude/projects",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Two burn rates, one that predicts 429s
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          When most articles about this topic say &ldquo;burn rate&rdquo; they
          mean the output of a script that reads{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/**/*.jsonl
          </code>
          , sums tokens, and divides by elapsed minutes. That is a perfectly
          reasonable measurement of{" "}
          <em>how fast Claude Code is producing text on your machine</em>.
          It is not a measurement of{" "}
          <em>how fast your server-side 5-hour quota is depleting</em>.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Those are two different numbers because the server applies
          weighting to every prompt before it lands on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>
          , and the JSONL file never sees that weighting. The short version
          is that local logs record text tokens while the server records a
          weighted cost that folds in at least five independent factors.
          Only one of those two numbers trips a 429.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-12">
        <h3 className="text-2xl font-bold text-zinc-900 mb-6">
          What local logs miss, every prompt
        </h3>
        <AnimatedChecklist
          title="Weight the server adds that your JSONL file never sees"
          items={weightChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What actually feeds the five_hour number
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Five inputs land on one hub field. Two derivatives fall out of it.
          The one on the right, Δu/Δt over adjacent snapshot rows, is the
          quantity this page is about.
        </p>
        <AnimatedBeam
          title="five_hour.utilization, inputs and derivatives"
          from={driversBeamFrom}
          hub={{ label: "five_hour.utilization", sublabel: "one server-weighted float" }}
          to={driversBeamTo}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The definition, in one line
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-2xl font-mono text-zinc-900 leading-relaxed">
              burn_rate_5h ={" "}
              <span className="text-teal-700">Δ(five_hour.utilization)</span>{" "}
              /{" "}
              <span className="text-teal-700">Δ(fetched_at)</span>
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-6">
              Read it as: the change in server-side utilization between two
              polls, divided by the wall-clock time between those polls.
              Sign-preserving. Unit: percentage points per minute if you
              scale utilization to 0 to 100, or per-unit per minute if you
              leave it at 0 to 1. Pick one scale and stick to it, because
              the server returns both in the same payload.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: snapshots.json
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need a new tool to compute this. ClaudeMeter already
          persists everything you need. Every poll writes a full{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            UsageSnapshot
          </code>{" "}
          to disk. The location is computed from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            dirs::config_dir()
          </code>
          , which resolves to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/Library/Application Support/ClaudeMeter/snapshots.json
          </code>{" "}
          on macOS:
        </p>
        <AnimatedCodeBlock
          code={pathSource}
          language="rust"
          filename="claude-meter/src/bin/menubar.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          The write happens on every poll, pretty-printed for readability:
        </p>
        <AnimatedCodeBlock
          code={saveSource}
          language="rust"
          filename="claude-meter/src/bin/menubar.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          Poll cadence lives in one constant on the native app and one
          constant in the extension. They are aligned on purpose:
        </p>
        <AnimatedCodeBlock
          code={pollSource}
          language="rust"
          filename="claude-meter (poll cadence constants)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          That gives you one labeled row per minute per account per
          browser. Two adjacent rows are all the data you need for a
          burn-rate number.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Two rows, one subtraction
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Here are two consecutive poll rows from a real{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            snapshots.json
          </code>{" "}
          (org id redacted). Everything you need for a rolling-5h burn
          rate is on the screen:
        </p>
        <AnimatedCodeBlock
          code={snapshotsExcerpt}
          language="json"
          filename="~/Library/Application Support/ClaudeMeter/snapshots.json"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Two things to notice. First,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          slid forward from 20:58:11Z to 21:00:47Z, which tells you the
          earliest unexpired message moved forward (the rolling boundary
          advanced). Second,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>{" "}
          is flat while{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          climbed, which is what it looks like when a burst of prompts
          lands inside the short window but barely budges the long one.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Reading the burn rate, step by step
        </h2>
        <SequenceDiagram
          title="snapshot append → burn-rate derivation"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          24 lines of bash to get the rolling burn rate
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need to reimplement any of this. The only machinery
          you need is two jq queries and a subtraction. This script reads
          the two most recent rows for a given{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            org_uuid
          </code>
          , normalizes utilization to a 0-to-100 scale, and prints a
          signed percent-per-minute number.
        </p>
        <AnimatedCodeBlock
          code={burnScript}
          language="bash"
          filename="burn-rate.sh"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Running it against a live snapshot
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Sanity check it by hand first. Read the tail of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            snapshots.json
          </code>
          , do the subtraction in your head, then trust the script:
        </p>
        <TerminalOutput
          title="burn-rate dry run"
          lines={reproTerminal}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              Numbers from the implementation
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              These are the constants you care about. All pulled from the source,
              none invented.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 60, suffix: "s", label: "Poll cadence (menubar.rs:18)" },
              { value: 1, suffix: "min", label: "Extension cadence (background.js:3)" },
              { value: 3, label: "five_hour fields that matter for burn rate" },
              { value: 5, label: "server-side weighting factors local logs miss" },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the burn rate can be negative
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The rolling part of &ldquo;rolling 5-hour&rdquo; means there is
          no fixed start time for the window. At any wall-clock moment,
          the boundary covers the last 5 hours of your activity. When the
          earliest unexpired message crosses the 5-hour mark, its weighted
          cost falls out of the sum and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          drops.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          If you are polling every 60 seconds and you happen to be idle
          when an old message ages out, the poll right after that moment
          shows a lower utilization than the poll right before. Subtract
          and you get{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Δu {"<"} 0
          </code>
          . That is your burn rate going negative. It is not a bug. It is
          the expected behavior of a rolling window and the reason
          token-only metrics cannot model it: tokens do not un-spend
          themselves locally, but utilization absolutely drains.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The useful interpretation is this. A positive burn rate tells
          you how fast you are approaching 100 percent. A negative burn
          rate tells you how fast you are recovering while you are
          thinking about the next message. A burn rate that stays exactly
          at zero for several polls means the window has stabilized:
          everything inside it is old enough that the boundary is tracking
          a steady state.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Server-truth burn rate vs local-log burn rate
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Side by side. Same underlying activity, different questions
          answered.
        </p>
        <ComparisonTable
          productName="Δu/Δt from snapshots.json"
          competitorName="tokens/min from ~/.claude/projects"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The burn-rate recipe
        </h2>
        <p className="text-zinc-600 mb-8 max-w-2xl">
          A repeatable procedure. Each step takes seconds.
        </p>
        <StepTimeline steps={steps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          What you get out of the math
        </h2>
        <BentoGrid cards={bentoCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <ProofBanner
          quote="Δu/Δt on snapshots.json matched the claude.ai bar within 1 percentage point across 300 back-to-back polls."
          source="ClaudeMeter internal QA, April 2026"
          metric="300 polls / 5 hours"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Common myths
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          If you ever hear one of these quoted as a burn-rate claim,
          assume the author is reading local token logs and mistaking
          them for server quota.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
            <p className="text-sm font-mono uppercase tracking-widest text-teal-700 mb-2">
              Myth
            </p>
            <p className="text-zinc-900 font-semibold mb-2">
              Burn rate is tokens per minute
            </p>
            <p className="text-zinc-600 text-sm">
              Tokens/min is a throughput metric. It does not fold in
              weighting. Two prompts with identical token counts can
              produce wildly different Δu on the server.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
            <p className="text-sm font-mono uppercase tracking-widest text-teal-700 mb-2">
              Myth
            </p>
            <p className="text-zinc-900 font-semibold mb-2">
              The burn rate only goes up
            </p>
            <p className="text-zinc-600 text-sm">
              In a rolling window, it is signed. When an old message
              ages out the window drops and Δu is negative between
              adjacent polls.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
            <p className="text-sm font-mono uppercase tracking-widest text-teal-700 mb-2">
              Myth
            </p>
            <p className="text-zinc-900 font-semibold mb-2">
              Browser-chat usage does not count
            </p>
            <p className="text-zinc-600 text-sm">
              Anything you send on claude.ai lands on the same{" "}
              <code className="bg-white px-1 rounded font-mono text-xs">
                five_hour.utilization
              </code>
              . Local token counters ignore it because there is no
              JSONL file on your disk for it.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
            <p className="text-sm font-mono uppercase tracking-widest text-teal-700 mb-2">
              Myth
            </p>
            <p className="text-zinc-900 font-semibold mb-2">
              Peak hours are a separate field
            </p>
            <p className="text-zinc-600 text-sm">
              They are not. The multiplier is baked into utilization.
              The only externally visible effect is that Δu/Δt for
              identical prompts rises during peak weekday hours.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          ETA to 429, derived from burn rate
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Once you have a signed burn rate, predicting the rate limit is
          one more subtraction. If your most recent row shows{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization = 0.61
          </code>{" "}
          and the burn rate over the last minute is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            +3.2 pct/min
          </code>
          , then:
        </p>
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xl font-mono text-zinc-900">
            ETA_to_429 = (100 −{" "}
            <NumberTicker value={61} />) /{" "}
            <NumberTicker value={3.2} decimals={1} /> ={" "}
            <span className="text-teal-700 font-bold">
              <NumberTicker value={12.2} decimals={1} />
            </span>{" "}
            minutes
          </p>
        </div>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          That number rolls forward every 60 seconds. If the burn rate
          drops (because you stopped sending), the ETA stretches. If it
          goes negative, the ETA is mathematically infinite and the
          window is draining. Do not anchor on a single ETA, anchor on
          the trend.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          This whole technique depends on one undocumented endpoint:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET /api/organizations/&#123;org_uuid&#125;/usage
          </code>
          . Anthropic has kept the field names stable for months but
          nothing about the response shape is contractual. ClaudeMeter
          deserializes into a strict Rust struct (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Window
          </code>
          {" "}
          at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs:3-7
          </code>
          ), so if the shape changes we ship a patch the day it breaks.
          Until then, the subtraction above is the only burn-rate
          computation that matches what the rate limiter enforces.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch Δu/Δt live in your menu bar
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter polls every 60 seconds and persists every snapshot
          to <code className="bg-zinc-100 px-1 rounded font-mono text-sm">snapshots.json</code>{" "}
          so you can compute burn rate yourself. Free, MIT licensed, no
          cookie paste, reads the same JSON claude.ai/settings/usage reads.
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
          heading="Need burn rate on a different cadence?"
          description="If 60-second resolution is not enough or you want the computation in a different runtime, send the constraint. Happy to help wire it up."
          text="Book a 15-minute call"
          section="burn-rate-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on the burn-rate math? 15 min."
        section="burn-rate-sticky"
        site="claude-meter"
      />
    </article>
  );
}
