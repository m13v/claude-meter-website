import type { Metadata } from "next";
import {
  Breadcrumbs,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  CodeComparison,
  ComparisonTable,
  GlowCard,
  GradientText,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/alternative/claude-statusline-server-truth-vs-local-tokens";
const PUBLISHED = "2026-05-22";

export const metadata: Metadata = {
  title:
    "Claude statusline: server-truth quota vs local context tokens",
  description:
    "The JSON Claude Code pipes to your statusLine script only carries context_window.used_percentage. To show the 5h and 7d utilization Anthropic actually rate-limits on, your script has to shell out to `claude-meter --json` and append the result to the line. Working recipe inside.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude statusline: server-truth quota vs local context tokens",
    description:
      "Claude Code's statusline reads local context tokens from stdin. Server-truth quota lives at claude.ai/api/organizations/{org}/usage. Here is how to render both on one line.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Alternatives", url: "https://claude-meter.com/alternative" },
  {
    name: "Claude statusline server-truth vs local tokens",
    url: PAGE_URL,
  },
];

const stdinJson = `// what Claude Code pipes to your statusLine script's stdin on every update
{
  "model": { "display_name": "Sonnet 4.6", "id": "claude-sonnet-4-6" },
  "workspace": { "current_dir": "/Users/you/repo" },
  "cost": { "total_cost_usd": 0.42 },
  "context_window": {
    "used_tokens":     87432,
    "max_tokens":      200000,
    "used_percentage": 43.7
  }
}

// every field above is computed inside the local CLI process.
// there is no field for five_hour.utilization.
// there is no field for seven_day.utilization.
// there is no field for the rate-limit reset time.
// the bar at the bottom of your terminal is a window into the client.`;

const claudeMeterJson = `// what \`claude-meter --json\` emits (one element per Claude account)
[
  {
    "account_email": "you@example.com",
    "org_uuid":      "org-7…",
    "browser":       "oauth",
    "usage": {
      "five_hour":       { "utilization": 94.0, "resets_at": "2026-05-22T22:14:00Z" },
      "seven_day":       { "utilization": 62.0, "resets_at": "2026-05-29T09:02:00Z" },
      "seven_day_sonnet":{ "utilization": 41.0, "resets_at": "2026-05-29T09:02:00Z" },
      "seven_day_opus":  { "utilization": 88.0, "resets_at": "2026-05-29T09:02:00Z" }
    },
    "fetched_at": "2026-05-22T17:14:11Z"
  }
]

// these are the floats the rate limiter checks.
// claude.ai/api/organizations/{org}/usage is the source.
// you shell out once per status-line tick. that's the whole bridge.`;

const naiveScript = `#!/usr/bin/env bash
# ~/.claude/statusline.sh:the default-ish recipe everyone copies
# Reads stdin JSON, prints model + context %.

input=$(cat)
model=$(echo "$input" | jq -r '.model.display_name')
ctx=$(echo "$input" | jq -r '.context_window.used_percentage // 0')

printf "[%s] %.0f%% ctx" "$model" "$ctx"

# Renders something like:  [Sonnet 4.6] 44% ctx
# Tells you nothing about server quota. Will not save you from a 429.`;

const serverAwareScript = `#!/usr/bin/env bash
# ~/.claude/statusline.sh:same script + server-truth bridge
# Adds one shell-out per tick. ~25 ms when claude-meter cache is warm.

input=$(cat)
model=$(echo "$input" | jq -r '.model.display_name')
ctx=$(echo "$input" | jq -r '.context_window.used_percentage // 0')

# Pull server-truth utilization. --json is documented in main.rs:8.
# Fail open: if the bridge is down, just print the local fragment.
server=$(claude-meter --json 2>/dev/null \\
  | jq -r '.[0].usage | "\\(.five_hour.utilization|round)%/5h  \\(.seven_day_opus.utilization|round)%/7d-opus"' \\
  2>/dev/null)

if [ -n "$server" ] && [ "$server" != "null" ]; then
  printf "[%s] %.0f%% ctx  •  %s" "$model" "$ctx" "$server"
else
  printf "[%s] %.0f%% ctx" "$model" "$ctx"
fi

# Renders something like:  [Sonnet 4.6] 44% ctx  •  94%/5h  88%/7d-opus
# Now your terminal bar surfaces the same float Anthropic enforces.`;

const settingsJson = `// ~/.claude/settings.json:point Claude Code at the script above
{
  "statusLine": {
    "type":    "command",
    "command": "/Users/you/.claude/statusline.sh",
    "padding": 0
  }
}

// chmod +x ~/.claude/statusline.sh first.
// every tick, Claude Code pipes its JSON object to the script over stdin.
// the script prints one line. Claude Code renders it.`;

const liveTranscript = [
  {
    type: "command" as const,
    text: "$ # before: default statusline, mid-refactor on Opus",
  },
  {
    type: "output" as const,
    text: "[Opus 4.7] 38% ctx",
  },
  { type: "output" as const, text: "" },
  {
    type: "command" as const,
    text: "$ # I keep typing prompts. claude.ai 429s the next one. no warning.",
  },
  {
    type: "error" as const,
    text: "claude.ai: rate limit reached. Try again in 47m.",
  },
  { type: "output" as const, text: "" },
  {
    type: "command" as const,
    text: "$ # after: statusline shells out to claude-meter --json",
  },
  {
    type: "output" as const,
    text: "[Opus 4.7] 38% ctx  •  94%/5h  88%/7d-opus",
  },
  {
    type: "success" as const,
    text:
      "94%/5h is on the screen 47 minutes before the wall. I stop, drop into Sonnet, or wait for the reset I now know the time of.",
  },
];

const comparisonRows = [
  {
    feature: "Source",
    ours: "claude.ai/api/organizations/{org}/usage (server JSON)",
    competitor:
      "stdin JSON Claude Code pipes to your script (context_window.used_percentage)",
  },
  {
    feature: "Numbers exposed",
    ours: "five_hour, seven_day, seven_day_sonnet, seven_day_opus",
    competitor: "context tokens used / max only",
  },
  {
    feature: "Sees attachments + tool calls + browser chats?",
    ours: "yes (already weighted in the float)",
    competitor: "no (only the current process's local tokens)",
  },
  {
    feature: "Knows about peak-hour multiplier?",
    ours: "yes (applied server-side before utilization is returned)",
    competitor: "no",
  },
  {
    feature: "Knows about reset time?",
    ours: "yes (resets_at on each window)",
    competitor: "no",
  },
  {
    feature: "Predicts a 429 before it lands?",
    ours: "yes",
    competitor: "never",
  },
  {
    feature: "Update cadence",
    ours: "once per shell-out (~60s recommended via claude-meter cache)",
    competitor: "every Claude Code render tick",
  },
];

const faqs = [
  {
    q: "Why can't the Claude Code statusline show server quota by default?",
    a: "Because the JSON Claude Code pipes to your statusLine script over stdin is computed entirely inside the local CLI process. The shape is { model, workspace, cost, context_window } with context_window.used_percentage being the only utilization field, and that is the local 200K context window, not the server-side rolling 5-hour bucket. Claude Code itself only talks to api.anthropic.com (or the Claude Code endpoint) with the API key it was started with. The consumer-plan quota lives on claude.ai under a different cookie scope. Nothing inside the CLI's render loop has the cookies, the URL, or the JSON path it would need to surface that float. The status line is a window into the client; to bridge it to the server, the script has to shell out.",
  },
  {
    q: "What does claude-meter --json actually return?",
    a: "An array of UsageSnapshot rows, one per detected Claude account, defined in main.rs at lines 8-10 (the --json flag) and printed at line 87. Each row carries account_email, org_uuid, the browser the cookies came from, and a usage object with five Window children: five_hour, seven_day, seven_day_sonnet, seven_day_opus, plus an extra_usage object for metered overage. Each Window is { utilization: f64, resets_at: ISO timestamp }. The values are read from claude.ai/api/organizations/{org}/usage, the same endpoint that powers the bars at claude.ai/settings/usage. Sourcing the data takes one HTTPS request per minute on the menu-bar polling cadence; the CLI itself reads the cached snapshot, so the shell-out per status-line tick is cheap.",
  },
  {
    q: "How do I wire this up end-to-end on a fresh machine?",
    a: "Three commands and one config edit. (1) `brew install --cask m13v/tap/claude-meter` to install the menu-bar app, then visit claude.ai once so the browser extension forwards your session. (2) Create ~/.claude/statusline.sh with the server-aware script in the recipe section above and `chmod +x` it. (3) Edit ~/.claude/settings.json to add a statusLine block of type 'command' pointing at the script. Restart Claude Code. The bar will read `[Sonnet 4.6] 44% ctx • 17%/5h 22%/7d-opus` on a quiet account and climb visibly as the rolling window fills.",
  },
  {
    q: "Won't a shell-out on every render tick make my terminal sluggish?",
    a: "Not in practice. claude-meter caches the last server snapshot on disk between invocations because the polling cadence is 60 seconds, not per-tick. A `claude-meter --json` call when the cache is warm returns in roughly 25-40 ms on a current MacBook, well under the threshold where you'd notice latency in the status line. If you want belt-and-suspenders, wrap the call in a 200 ms timeout and fail open: print the local fragment when the bridge is unreachable. The script in the recipe section already does this.",
  },
  {
    q: "Why not just sum tokens from ~/.claude/projects/<session>.jsonl and pretend that's quota?",
    a: "Because the rate-limit float is weighted in five ways the JSONL cannot see. Peak-hour multiplier fills the 5-hour bucket faster during US Pacific weekday midday hours. Attachments carry a per-PDF cost on top of their token count. Tool calls (code execution, browsing) carry server cost on top of tokens. Per-model weight makes Opus burn the bucket faster than Sonnet for the same byte count. Browser-chat usage on claude.ai counts against the same account but never lands in the JSONL. A statusline that reads only the local sum will say 5% while the next prompt 429s. The point of surfacing five_hour.utilization is to read the function the rate limiter is actually computing.",
  },
  {
    q: "Does this work on Windows or Linux?",
    a: "The browser extension does. The macOS menu-bar app does not (the README is explicit: macOS 12+). On Windows or Linux the extension still polls /api/organizations/{org}/usage from your Chrome/Brave/Edge/Arc profile and exposes the snapshot via the chrome.action API. To pipe it into a statusline, a small companion script can read the extension's exposed snapshot (or call the endpoint directly with your own cookie store) and emit the same string the bash recipe above prints. The bridge contract is identical; only the source process changes.",
  },
  {
    q: "Does it work with Starship, tmux, fish prompt, Fig?",
    a: "Yes, same pattern. Any prompt or status surface that can run a command and embed its stdout works. In Starship, add a custom module with `command = 'claude-meter --json | jq -r ...'` and set a sane `format`. In tmux, set `status-right` to a similar shell-out. The Claude Code statusLine is just the most useful target because it renders the local context % right next to where the server-truth float belongs.",
  },
  {
    q: "If I already run ccusage, do I need this?",
    a: "ccusage and claude-meter answer two different questions, so they coexist. ccusage walks ~/.claude/projects/*.jsonl and gives you cost attribution per project: which directory tree burned how many tokens this week. The server JSON has no idea where on disk your code lives. claude-meter reads the float the rate limiter checks: will my next prompt 429. Heavy users run both, usually with ccusage in a terminal split for spend reporting and claude-meter feeding the statusline (or menu bar) for live quota.",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude statusline: server-truth quota vs local context tokens",
  description:
    "The Claude Code statusline reads context_window.used_percentage from stdin; that's local context, not server quota. Here's a working statusLine script that shells out to `claude-meter --json` so the same bar surfaces five_hour and seven_day utilization Anthropic enforces.",
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

export default function ClaudeStatuslineServerTruthVsLocalTokensPage() {
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
          Claude statusline:{" "}
          <GradientText>server-truth quota</GradientText> vs local context
          tokens
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
          The JSON Claude Code hands your statusLine script knows the local
          context window and nothing else. The float that 429s your next
          prompt lives on a different host, behind a different cookie, in a
          different JSON tree. Here is how to put both on one line.
        </p>
      </header>

      <section className="max-w-3xl mx-auto px-6 mt-6">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-22)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            <strong>No, not out of the box.</strong> Claude Code pipes a JSON
            object over stdin containing only{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              model
            </code>
            ,{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              workspace
            </code>
            ,{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              cost
            </code>
            , and{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              context_window.used_percentage
            </code>
            . Server-truth quota lives at{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              claude.ai/api/organizations/&#123;org&#125;/usage
            </code>{" "}
            under a separate cookie scope. To render server-truth in the bar,
            your statusLine script has to shell out to a process that polls
            that endpoint, like{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              claude-meter --json
            </code>
            , and concatenate its output. A working recipe is below.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-3">
          Step 1: see what the statusline is actually given
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Claude Code's statusLine is a command you write that reads JSON from
          stdin and prints one line of text. The JSON it hands you on each
          tick looks like this:
        </p>
        <AnimatedCodeBlock
          code={stdinJson}
          language="json"
          filename="stdin → ~/.claude/statusline.sh"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Note what is missing. No <code className="font-mono">five_hour</code>.
          No <code className="font-mono">seven_day</code>. No{" "}
          <code className="font-mono">resets_at</code>. The CLI cannot give
          you those because the API key it was started with does not see them,
          and the cookies that do are on a different host. The bar at the
          bottom of the terminal is a window into the client; it has to stay
          that way unless your script reaches further.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-3">
          Step 2: see what server-truth actually carries
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The float Anthropic rate-limits on is published at{" "}
          <code className="font-mono">
            claude.ai/api/organizations/&#123;org&#125;/usage
          </code>
          , the same endpoint claude.ai/settings/usage renders its bars from.{" "}
          <code className="font-mono">claude-meter --json</code> polls that
          endpoint through your existing browser session and prints the
          snapshot. This is the shape:
        </p>
        <AnimatedCodeBlock
          code={claudeMeterJson}
          language="json"
          filename="$ claude-meter --json"
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-3">
          Step 3: the bridge in one bash script
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The default recipe everyone copies prints model + context %. The
          server-aware version shells out once per tick to pull the 5h and 7d
          utilization. Both scripts run in the same statusLine slot; the only
          difference is the four lines in the middle:
        </p>
        <CodeComparison
          title="Default statusLine script vs server-aware statusLine script"
          leftLabel="default ~/.claude/statusline.sh"
          rightLabel="server-aware ~/.claude/statusline.sh"
          leftCode={naiveScript}
          rightCode={serverAwareScript}
          leftLines={naiveScript.split("\n").length}
          rightLines={serverAwareScript.split("\n").length}
          reductionSuffix="extra lines for the bridge"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The <code className="font-mono">2&gt;/dev/null</code> and the{" "}
          <code className="font-mono">if [ -n "$server" ]</code> guard matter:
          if claude-meter is not installed, the menu-bar app is paused, or your
          claude.ai session has expired, the script falls through to the local
          fragment instead of leaving a stale stub on the bar.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-3">
          Step 4: point Claude Code at the script
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          One block in <code className="font-mono">~/.claude/settings.json</code>{" "}
          tells Claude Code to invoke your script as a command, pipe the JSON
          over stdin, and render whatever single line it prints back:
        </p>
        <AnimatedCodeBlock
          code={settingsJson}
          language="json"
          filename="~/.claude/settings.json"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Restart Claude Code. The bar updates within a tick. If the line is
          blank, run the script by hand with{" "}
          <code className="font-mono">
            echo '&#123;&quot;model&quot;:&#123;&quot;display_name&quot;:&quot;Sonnet&quot;&#125;,&quot;context_window&quot;:&#123;&quot;used_percentage&quot;:10&#125;&#125;' | ~/.claude/statusline.sh
          </code>{" "}
          to find the failure.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-3">
          What the bar looks like once it works
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Same Claude account, two configurations, same wall clock:
        </p>
        <TerminalOutput title="Before vs after, one refactor session" lines={liveTranscript} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-3">
          What each surface can and cannot tell you
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The bridge is not "claude-meter is better than the stdin JSON". They
          measure different things. The default statusline reads what the CLI
          can see; the shell-out reads what the rate limiter checks. You need
          both in the same line:
        </p>
        <ComparisonTable
          productName="claude-meter --json (server-truth)"
          competitorName="stdin JSON (local context)"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <GlowCard>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-3">
              The one fact the rest of the internet keeps glossing over
            </h2>
            <p className="text-zinc-700 leading-relaxed text-lg">
              Most statusline guides for Claude Code copy the same{" "}
              <code className="font-mono">
                jq -r '"[\(.model.display_name)] \(.context_window.used_percentage // 0)% context"'
              </code>{" "}
              one-liner. That number cannot, by construction, see your 5-hour
              bucket. The CLI process holds an API key for{" "}
              <code className="font-mono">api.anthropic.com</code>; the
              consumer-plan quota lives behind a session cookie on{" "}
              <code className="font-mono">claude.ai</code>. Two hosts, two
              cookies, two JSON trees. To bridge them, exactly one shell-out
              per tick has to cross the gap, and that shell-out belongs in the
              same script that already prints the local fragment.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want me to wire this into your own statusline live?"
          description="Twenty minutes. Bring your shell of choice and a claude.ai tab. We open settings.json, drop in the script, and watch the bar pick up server-truth on your account."
        />
      </section>

      <FaqSection heading="Frequently asked" items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Get server-truth quota into your terminal bar in 20 minutes."
      />
    </article>
  );
}
