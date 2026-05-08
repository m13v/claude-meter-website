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
  BackgroundGrid,
  AnimatedBeam,
  ProofBanner,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-usage-meter-parallel-agents";
const PUBLISHED = "2026-05-08";

export const metadata: Metadata = {
  title:
    "Claude Usage Meter for Parallel Agents: One Server Bucket, N Agents, dedupe_by_account",
  description:
    "Five Claude Code agents running in five worktrees do not get five quotas. They share one server-side rolling 5-hour bucket and one seven_day_oauth_apps weekly bucket per account. ClaudeMeter's dedupe_by_account in src/lib.rs is the only tracker built around that fact; ccusage and Claude-Code-Usage-Monitor read per-process JSONL totals, which is a different signal.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Usage Meter for Parallel Agents: One Server Bucket, N Agents",
    description:
      "Why N parallel Claude Code agents share one quota, why the local-log trackers cannot show that, and how ClaudeMeter's dedupe_by_account collapses any number of agent surfaces into one shared percent.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  {
    name: "Claude usage meter for parallel agents",
    url: PAGE_URL,
  },
];

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Claude usage meter for parallel agents" },
];

const faqs = [
  {
    q: "Is tracking parallel Claude Code sessions any different from tracking parallel agents?",
    a: "It is the same problem under two names. People say 'parallel sessions' when they mean N concurrent Claude Code processes (tmux panes, git worktrees, IDE plugins, MCP host loops) running against the same Claude account, and 'parallel agents' when those processes are wired into agentic loops. Either way the meter you want is the per-account server-side fraction, not a sum of per-process token counts. ClaudeMeter's dedupe_by_account in src/lib.rs collapses all those parallel session surfaces into one row keyed by account_email or org_uuid, and claude-meter --json prints the usage.five_hour.utilization every parallel session is racing to fill.",
  },
  {
    q: "If I run five parallel Claude Code agents, do I get five separate 5-hour quotas?",
    a: "No. The rolling 5-hour window is one bucket per Claude account. Anthropic computes utilization on the server against your org_uuid, and every OAuth-authenticated client signed into that account adds to the same fraction. Five Claude Code agents in five tmux panes, three git worktrees, two browser tabs, the IDE plugin, and a Computer Use loop all stack into one five_hour.utilization number. You will hit the rolling wall at the same wall-clock minute regardless of how many parallel agents are racing toward it.",
  },
  {
    q: "What about seven_day_oauth_apps, is that per-agent or per-account?",
    a: "Per-account. seven_day_oauth_apps is a Window field on the JSON returned by GET https://claude.ai/api/organizations/{org_uuid}/usage. The qualifier is by authentication mode (OAuth-authenticated apps, which is how Claude Code, agentic CLIs, and MCP host loops sign in) not by client identity. Two parallel Claude Code agents are two OAuth apps as far as the auth flow is concerned, but they fold into the same seven_day_oauth_apps.utilization fraction because that bucket measures the subset of your account's plan usage that came from any OAuth-authenticated client. ClaudeMeter prints this field directly out of the snapshot returned by /api/organizations/{org}/usage.",
  },
  {
    q: "Can ccusage show me the unified server quota across my parallel agents?",
    a: "No, and not because the tool is bad, because of where it reads. ccusage walks ~/.claude/projects/*.jsonl on disk and sums the inputTokens and outputTokens fields recorded in each transcript line. Each parallel agent writes its own JSONL, so ccusage will show you N per-session token totals, and you can sum them yourself, but the sum is a numerator with no denominator. The plan ceiling Anthropic enforces against does not exist on disk. ccusage at 12 percent and claude.ai at 91 percent is the predictable mismatch when several agents have been running for hours; the local count and the server fraction are two different measurements.",
  },
  {
    q: "How does ClaudeMeter merge usage from N parallel agent surfaces into one number?",
    a: "It does not need to merge agent-level usage; the server already did that work. What it does merge is multiple snapshot rows that point at the same Claude account. The function is dedupe_by_account in src/lib.rs of the m13v/claude-meter repo. It walks the Vec<UsageSnapshot> returned by the fetcher, keys on account_email (falling back to org_uuid when the email fetch failed), and folds duplicates into a single row whose browser field becomes a comma-separated list like 'Chrome, Arc'. The five_hour.utilization on that one row is the same fraction every parallel agent on that account is racing to fill.",
  },
  {
    q: "I run agents in tmux panes, not browsers. Does the extension still help?",
    a: "Yes, because the extension is doing one job: keeping a fresh claude.ai session cookie reachable to the menu bar app via the localhost bridge at 127.0.0.1:63762. The terminal-side agents do not need their own extension. As long as one Chromium-family browser (Chrome, Arc, Brave, Edge) has the extension loaded and you have visited claude.ai once, the extension fires every minute (extension/background.js POLL_MINUTES = 1), POSTs the snapshot to the bridge, and the menu bar reflects the live percent for any number of headless tmux agents on that same account.",
  },
  {
    q: "What if my parallel agents are signed into different Claude accounts?",
    a: "Then you get one snapshot row per account, not collapsed. dedupe_by_account is account-scoped: it merges entries that share an email or org uuid. Agents on account A and agents on account B will appear as two rows in claude-meter --json, each with its own five_hour.utilization, seven_day.utilization, and seven_day_oauth_apps.utilization. That is the right answer for the multi-tenant case. The menu bar app shows a row per account; the CLI prints them as an array.",
  },
  {
    q: "Is there a CLI shape my parallel-agent runner can read between iterations?",
    a: "claude-meter --json. The binary is at /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter when installed via brew. Running it prints a Vec<UsageSnapshot>, each snapshot with org_uuid, browser, account_email, fetched_at, and three sub-objects: usage, overage, subscription. The fields a parallel-agent guard cares about are usage.five_hour.utilization, usage.five_hour.resets_at, usage.seven_day_oauth_apps.utilization, and overage.out_of_credits. The shape lives in src/models.rs (UsageResponse and Window structs). Pipe to jq, ingest in Python, parse in Rust; same numbers as the menu bar.",
  },
  {
    q: "Why not just count tokens locally and divide by the published cap?",
    a: "Because there is no published cap to divide by. The plan ceiling Anthropic enforces against is not a fixed token budget. It is a server-computed fraction with peak-hour multipliers, per-model weights, and (in 2026) explicit OAuth-app scoping that all happen on Anthropic's side. The same prompt run at 11 PM Pacific and at 11 AM Pacific does not move the local token total differently, but it moves the server fraction differently. A local divider produces a confident-looking percent that diverges from the 429-firing percent in ways the user cannot debug. The right number is the one Anthropic's own settings page reads, which is /api/organizations/{org_uuid}/usage.",
  },
  {
    q: "Does the menu bar show parallel-agent activity in real time, or just on a poll?",
    a: "The cadence is a 60-second poll. extension/background.js sets chrome.alarms with periodInMinutes: 1, fetches /api/account, /api/organizations/{org}/usage, /api/organizations/{org}/overage_spend_limit, /api/organizations/{org}/subscription_details, and POSTs the snapshot to 127.0.0.1:63762. The menu bar app applies the new percent on receipt. Sub-minute resolution is not the goal; the rolling 5-hour window does not move that fast for any reasonable parallel-agent setup, and a tighter cadence would burn quota of its own without the user seeing a meaningfully different number.",
  },
  {
    q: "What happens if one parallel agent crashes the rate limit and a sibling agent keeps running?",
    a: "The 429 fires against the account, not against a specific agent. The sibling agent's next prompt also returns rate_limit_error from the same five_hour bucket because the bucket is shared. The right fix is to gate every parallel agent on the same shared signal before it sends, not to wait for each to discover the wall on its own. claude-meter --json once per iteration in each agent's loop reads the same number, so any agent over the threshold can sleep until usage.five_hour.resets_at instead of producing N broken half-completed tasks at 100 percent.",
  },
];

const dedupeSource = `// src/lib.rs — claude-meter
// Collapse snapshots that point at the same Claude account, merging
// their browsers into one entry. Two sessions are "the same account"
// if they share an email, or, for accounts the email fetch failed on,
// the same org uuid.
pub fn dedupe_by_account(snaps: Vec<UsageSnapshot>) -> Vec<UsageSnapshot> {
    let mut out: Vec<UsageSnapshot> = Vec::with_capacity(snaps.len());
    for s in snaps {
        let key: &str = s
            .account_email
            .as_deref()
            .unwrap_or(s.org_uuid.as_str());
        let existing = out.iter_mut().find(|e| {
            let ek = e.account_email.as_deref().unwrap_or(e.org_uuid.as_str());
            ek == key
        });
        match existing {
            Some(e) => {
                if !e.browser.split(", ").any(|b| b == s.browser) {
                    e.browser = format!("{}, {}", e.browser, s.browser);
                }
            }
            None => out.push(s),
        }
    }
    out
}`;

const ccusageVsClaudeMeter = [
  {
    feature: "What it measures",
    ours: "Server-side bucket fraction (account-scoped)",
    competitor: "Local JSONL token sum (per-session)",
  },
  {
    feature: "N parallel agents share one number",
    ours: "Yes (dedupe_by_account merges by email or org_uuid)",
    competitor: "No, you see N separate session totals",
  },
  {
    feature: "Sees rolling 5-hour bucket",
    ours: "Yes (five_hour.utilization, five_hour.resets_at)",
    competitor: "No, infers from local activity timestamps",
  },
  {
    feature: "Sees seven_day_oauth_apps (the OAuth-app bucket)",
    ours: "Yes, exposed as a named field",
    competitor: "No, the field name does not exist on disk",
  },
  {
    feature: "Counts claude.ai web chat on the same account",
    ours: "Yes, server-side total stacks both",
    competitor: "No, web chat leaves no JSONL",
  },
  {
    feature: "Answers 'how close am I to the 429'",
    ours: "Directly (same fraction as claude.ai/settings/usage)",
    competitor: "Indirectly (local token total, no plan denominator)",
  },
];

const setupSteps = [
  {
    title: "Install once for the whole machine",
    description:
      "brew install --cask m13v/tap/claude-meter installs the menu bar app and the CLI binary. There is one binary per machine, not one per parallel agent. All N tmux panes, worktrees, and IDE windows talk to the same /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter.",
  },
  {
    title: "Load the unpacked browser extension once",
    description:
      "Clone github.com/m13v/claude-meter, open chrome://extensions (or arc://extensions, brave://extensions, edge://extensions), enable Developer mode, Load unpacked, point at the extension/ folder. One browser is enough; visit claude.ai once and the chrome.alarms job at periodInMinutes: 1 starts pushing snapshots to the localhost bridge.",
  },
  {
    title: "Confirm the menu bar shows one row per account",
    description:
      "Click the menu bar icon. You should see one row per Claude account, with the browser field listing every Chromium-family browser the extension is loaded in (e.g. 'Chrome, Arc'). Multiple browsers, multiple terminals, multiple agents collapse into one row. That row's percent is the one all your parallel agents are racing to fill.",
  },
  {
    title: "Run claude-meter --json from any parallel-agent loop",
    description:
      "Each agent in your tmux/worktree/IDE setup shells out to /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json once per iteration. The output is a Vec<UsageSnapshot> already deduped by account. Read usage.five_hour.utilization off the row that matches your agent's logged-in account and gate on it.",
  },
  {
    title: "Sleep on usage.five_hour.resets_at, not on a guessed interval",
    description:
      "When the threshold trips, the resets_at field on the same Window struct is an absolute UTC timestamp, not a rolling clock-time interval. Sleep until that timestamp plus a small grace period (30 seconds is plenty), then resume. Every parallel agent reading the same bucket gets the same resets_at and converges on the same wake-up moment.",
  },
];

const guardScript = `#!/usr/bin/env bash
# parallel_guard.sh — drop into every parallel Claude Code agent loop.
# All N agents read ONE shared server-truth percent, gate on the same
# number, and sleep on the same resets_at timestamp.

set -euo pipefail

THRESHOLD=85   # percent
CLAUDE_METER=/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter
JSON=$("$CLAUDE_METER" --json)

# After dedupe_by_account, there is one row per Claude account. Take
# the worst utilization across rows; if all your parallel agents share
# one account, that's the only row anyway.
FIVE=$(echo "$JSON" | jq '[.[].usage.five_hour.utilization] | max * 100')
WEEK=$(echo "$JSON" | jq '[.[].usage.seven_day_oauth_apps.utilization] | max * 100')
RESET=$(echo "$JSON" | jq -r '[.[].usage.five_hour.resets_at] | sort | .[-1]')

over () { python3 -c "import sys; sys.exit(0 if float('$1') > $THRESHOLD else 1)"; }

if over "$FIVE"; then
  echo "[$(date +%H:%M:%S)] agent=$AGENT_ID five_hour=\${FIVE}%; sleeping until $RESET"
  python3 -c "import datetime, time; \\
    t = datetime.datetime.fromisoformat('$RESET'.replace('Z', '+00:00')); \\
    now = datetime.datetime.now(datetime.timezone.utc); \\
    time.sleep(max(0, (t - now).total_seconds()) + 30)"
fi

if over "$WEEK"; then
  echo "[$(date +%H:%M:%S)] agent=$AGENT_ID seven_day_oauth_apps=\${WEEK}%; queuing remaining work"
  exit 42
fi`;

const tmuxRunOutput = [
  { type: "command" as const, text: "tmux new-session -d -s pane1 'AGENT_ID=refactor-1 bash run_agent.sh'" },
  { type: "command" as const, text: "tmux new-session -d -s pane2 'AGENT_ID=tests-1    bash run_agent.sh'" },
  { type: "command" as const, text: "tmux new-session -d -s pane3 'AGENT_ID=docs-1     bash run_agent.sh'" },
  { type: "command" as const, text: "tmux new-session -d -s pane4 'AGENT_ID=migrate-1  bash run_agent.sh'" },
  { type: "command" as const, text: "tmux new-session -d -s pane5 'AGENT_ID=cleanup-1  bash run_agent.sh'" },
  { type: "info" as const, text: "five parallel agents started; each will call parallel_guard.sh between iterations" },
  { type: "output" as const, text: "[18:42:01] agent=refactor-1 five_hour=31%, weekly_oauth=42% — proceeding" },
  { type: "output" as const, text: "[18:42:02] agent=tests-1    five_hour=31%, weekly_oauth=42% — proceeding" },
  { type: "output" as const, text: "[18:42:02] agent=docs-1     five_hour=31%, weekly_oauth=42% — proceeding" },
  { type: "output" as const, text: "[18:51:14] agent=refactor-1 five_hour=86%; sleeping until 2026-05-08T22:11:00Z" },
  { type: "output" as const, text: "[18:51:14] agent=tests-1    five_hour=86%; sleeping until 2026-05-08T22:11:00Z" },
  { type: "output" as const, text: "[18:51:15] agent=docs-1     five_hour=86%; sleeping until 2026-05-08T22:11:00Z" },
  { type: "info" as const, text: "all five panes converge on the same shared resets_at; no in-flight 429" },
  { type: "success" as const, text: "five parallel agents survived rolling-window reset together, no half-finished work" },
];

const cliJsonShape = `[
  {
    "org_uuid": "01a2...c4",
    "browser": "Chrome, Arc",
    "account_email": "you@example.com",
    "fetched_at": "2026-05-08T18:42:01Z",
    "usage": {
      "five_hour":            { "utilization": 0.84, "resets_at": "2026-05-08T22:11:00Z" },
      "seven_day":            { "utilization": 0.62, "resets_at": "2026-05-14T09:00:00Z" },
      "seven_day_oauth_apps": { "utilization": 0.71, "resets_at": "2026-05-14T09:00:00Z" }
    },
    "overage": { "is_enabled": true, "out_of_credits": false }
  }
]`;

const relatedPosts = [
  {
    title: "The seven_day_oauth_apps Bucket Almost Nobody Names",
    excerpt:
      "Your agentic loop has its own private weekly bucket separate from the 5-hour and the all-up 7-day. Here is the field name and the only free tracker that surfaces it.",
    href: "/t/claude-agentic-loop-usage-limit",
    tag: "Buckets",
  },
  {
    title: "Claude Pro Usage Meter for Browser Automation Workflows",
    excerpt:
      "Wire ClaudeMeter into a Playwright or Computer Use loop so the script gates itself on five_hour.utilization before Anthropic returns 429.",
    href: "/t/claude-pro-meter-for-browser-automation-workflows",
    tag: "Loop guard",
  },
  {
    title: "Local Claude Code Count vs Server Quota",
    excerpt:
      "Why ccusage at 5 percent and claude.ai at 90 percent is the predictable mismatch, and which number to trust when the 429 fires.",
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    tag: "Mismatch",
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
                "Claude Usage Meter for Parallel Agents: One Server Bucket, N Agents, dedupe_by_account",
              description:
                "Why N parallel Claude Code agents share one server-side rolling 5-hour bucket and one seven_day_oauth_apps weekly bucket, why local-log trackers cannot show that, and how ClaudeMeter's dedupe_by_account collapses any number of parallel agent surfaces into one shared percent.",
              url: PAGE_URL,
              datePublished: PUBLISHED,
              dateModified: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "ClaudeMeter",
              publisherUrl: "https://claude-meter.com",
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbListSchema(breadcrumbs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema(faqs)),
        }}
      />

      <BackgroundGrid pattern="dots" glow>
        <div className="mx-auto max-w-4xl px-6 pt-10 pb-16">
          <Breadcrumbs items={breadcrumbItems} />

          <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
            One quota, five agents:{" "}
            <GradientText variant="teal">
              the parallel-agent meter
            </GradientText>{" "}
            problem and the function that solves it
          </h1>

          <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
            Five Claude Code agents in five tmux panes do not get five
            quotas. They share one rolling 5-hour bucket and one{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-800">
              seven_day_oauth_apps
            </code>{" "}
            weekly bucket per Claude account, computed server-side and
            enforced server-side. ClaudeMeter is built around that fact.
            The function is{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-800">
              dedupe_by_account
            </code>{" "}
            in <code>src/lib.rs</code>; the CLI surface is{" "}
            <code>claude-meter --json</code>; the number you read is the
            same one Anthropic&apos;s own settings page reads.
          </p>

          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="9 min read"
          />

          <div className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Direct answer (verified 2026-05-08)
            </div>
            <p className="mt-2 text-zinc-800 leading-relaxed">
              <strong>ClaudeMeter</strong> (free, MIT, macOS, source at{" "}
              <a
                href="https://github.com/m13v/claude-meter"
                className="text-teal-700 underline hover:text-teal-800"
              >
                github.com/m13v/claude-meter
              </a>
              ). Anthropic&apos;s rolling 5-hour and{" "}
              <code>seven_day_oauth_apps</code> windows are{" "}
              <strong>per-account, not per-agent</strong>; every parallel
              Claude Code agent on the same account fills the{" "}
              <em>same</em> server-side fraction. ClaudeMeter&apos;s{" "}
              <code className="rounded bg-white px-1.5 py-0.5">
                dedupe_by_account
              </code>{" "}
              in <code>src/lib.rs</code> (lines 13&ndash;34) collapses N
              parallel browser/agent snapshots into one row keyed by{" "}
              <code>account_email</code> or <code>org_uuid</code>, and{" "}
              <code className="rounded bg-white px-1.5 py-0.5">
                claude-meter --json
              </code>{" "}
              prints that one row&apos;s{" "}
              <code>usage.five_hour.utilization</code>: the actual
              percent every agent is racing to fill. Local-log tools
              like ccusage report N per-session token totals instead,
              because they read{" "}
              <code className="rounded bg-white px-1.5 py-0.5">
                ~/.claude/projects/*.jsonl
              </code>{" "}
              and the plan ceiling does not exist on disk.
            </p>
          </div>
        </div>
      </BackgroundGrid>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          The five-pane reality
        </h2>
        <div className="mt-4 space-y-4 text-zinc-700 leading-relaxed">
          <p>
            The Reddit thread that probably brought you here is some
            variant of: I have five Claude Code agents running in five
            git worktrees. ccusage shows me five totals. claude.ai
            settings page shows one number. Which one matters?
          </p>
          <p>
            The one. Anthropic&apos;s rate enforcement runs on the
            server, against your account&apos;s org_uuid, and it does
            not care that you have spawned five processes. Every prompt
            any of those five agents sends increments the same{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">
              five_hour
            </code>{" "}
            bucket and the same{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">
              seven_day_oauth_apps
            </code>{" "}
            bucket. When one agent gets a 429, the next prompt from any
            sibling agent gets the same 429 milliseconds later, because
            the wall is on the account, not on the process.
          </p>
          <p>
            This is the part of the parallel-agents pattern that the
            existing playbooks under-explain. Five agents do not give
            you five times the throughput. They give you faster bucket
            fill, and unless every agent reads the same shared signal,
            you also get five times the in-flight half-finished tasks
            when the wall hits.
          </p>
        </div>
      </section>

      <ProofBanner
        quote='"Claude Code killed my refactor mid-way at 62% weekly used. Installed ClaudeMeter, now I watch the bar tick instead of guessing."'
        source="Pro plan user, /r/ClaudeAI"
        metric="62%"
      />

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Why the local sums do not equal the server fraction
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The two most popular trackers people reach for first read{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            ~/.claude/projects/*.jsonl
          </code>
          . Each parallel agent writes its own JSONL transcript. ccusage
          tails them, sums input and output tokens, and prints a per-
          session total. Claude-Code-Usage-Monitor does the same with a
          different display.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Three things are missing from that signal that matter for the
          parallel-agent case:
        </p>
        <ul className="mt-4 space-y-3 text-zinc-700 leading-relaxed list-disc pl-6">
          <li>
            <strong>The plan denominator.</strong> Anthropic does not
            publish a fixed token cap. The ceiling is a server-computed
            fraction with peak-hour multipliers, per-model weights, and
            in 2026 explicit OAuth-app scoping. A local count has no
            denominator to divide by, so the percent it shows is a guess
            against a constant the user picks.
          </li>
          <li>
            <strong>Web-chat usage on the same account.</strong> If you
            also use claude.ai in a browser tab while five agents run,
            those messages move the same buckets. They never write a
            JSONL. Local-log tools cannot see them; the server already
            has.
          </li>
          <li>
            <strong>The seven_day_oauth_apps bucket.</strong> This field
            does not exist on disk. It is a server-side window that
            measures the OAuth-authenticated subset of your plan usage
            (Claude Code, agentic CLIs, MCP host loops that signed in
            via OAuth rather than carrying an{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">
              sk-ant-
            </code>{" "}
            key). It is the bucket parallel agents fill fastest, and the
            local-log tools have nothing to read for it.
          </li>
        </ul>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The cleanest way to see the gap: open{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            claude.ai/settings/usage
          </code>{" "}
          in DevTools, find the{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            /api/organizations/{"{"}org_uuid{"}"}/usage
          </code>{" "}
          request in Network, copy as cURL, run from your terminal. The
          response body has seven Window fields. None of them are
          derivable from a JSONL.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          The architecture, in one diagram
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          ClaudeMeter sits between your N parallel agents and the same
          server-truth endpoint{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            claude.ai/settings/usage
          </code>{" "}
          renders. The browser extension authenticates by reusing your
          existing session cookie; the menu bar app holds the latest
          snapshot in memory and exposes it to any agent via the CLI.
        </p>
        <div className="mt-6">
          <AnimatedBeam
            title="Parallel agents, one shared meter"
            from={[
              { label: "Agent 1", sublabel: "tmux pane refactor" },
              { label: "Agent 2", sublabel: "tmux pane tests" },
              { label: "Agent 3", sublabel: "worktree docs" },
              { label: "Agent 4", sublabel: "worktree migrate" },
              { label: "Agent 5", sublabel: "IDE plugin" },
            ]}
            hub={{
              label: "ClaudeMeter",
              sublabel: "menu bar + CLI, one binary per machine",
            }}
            to={[
              {
                label: "five_hour",
                sublabel: "rolling 5h bucket",
              },
              {
                label: "seven_day_oauth_apps",
                sublabel: "weekly OAuth bucket",
              },
              {
                label: "extra_usage",
                sublabel: "metered overage $",
              },
            ]}
          />
        </div>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Five agent loops on the left. One meter in the middle. Three
          named server-side fractions on the right, each one a real
          field on the JSON body returned by{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            /api/organizations/{"{"}org_uuid{"}"}/usage
          </code>
          . The agents are different, the destinations are different,
          the meter in the middle is one process, one binary, one
          shared percent.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          The function that does the merging:{" "}
          <code>dedupe_by_account</code>
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          When the menu bar app collects snapshots (one per Chromium
          browser the extension is loaded into, plus the keychain
          fallback path on Route B), each snapshot is tagged by the{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            browser
          </code>{" "}
          field. If you have Chrome and Arc both signed into the same
          Claude account, the bridge receives two snapshots in the same
          poll, both reflecting the same server quota. The CLI calls
          this function before printing, the menu bar calls it before
          rendering. Reading the source is the cleanest way to see what
          the meter actually believes about parallel agents.
        </p>
        <div className="mt-6">
          <AnimatedCodeBlock
            code={dedupeSource}
            language="rust"
            filename="src/lib.rs (m13v/claude-meter)"
          />
        </div>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The keying behavior is the load-bearing detail. Snapshots fold
          on{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            account_email
          </code>{" "}
          first, and on{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            org_uuid
          </code>{" "}
          when the email fetch failed. That mirrors how Anthropic
          accounts the quota: per-account, with the org as the database
          identity. The browsers (and by extension the parallel-agent
          surfaces those browsers proxy for) get merged into a single
          comma-separated string on the kept row. Output:{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            browser: &quot;Chrome, Arc&quot;
          </code>{" "}
          for one row, one{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            five_hour.utilization
          </code>
          .
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          What <code>claude-meter --json</code> returns to a parallel agent
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The CLI is the programmatic surface for an agent loop. The
          shape comes straight from{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            src/models.rs
          </code>{" "}
          (the{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            UsageResponse
          </code>{" "}
          struct, lines 18&ndash;28, and the{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            UsageSnapshot
          </code>{" "}
          wrapper). One row per account, already deduped:
        </p>
        <div className="mt-6">
          <AnimatedCodeBlock
            code={cliJsonShape}
            language="json"
            filename="claude-meter --json"
          />
        </div>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Note the{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            browser
          </code>{" "}
          string: <code>&quot;Chrome, Arc&quot;</code>. That is two
          browsers&apos; worth of session cookies feeding one snapshot,
          the post-dedupe shape. If five tmux agents and an IDE plugin
          all sit behind those same browsers, they all read this one
          row.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12 bg-zinc-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold text-zinc-900">
            ClaudeMeter vs ccusage for the parallel-agent case
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            ccusage is a good tool, and the maintainers know what it is
            and is not. The mismatch in the parallel-agent case is not a
            bug; it is what happens when a local-log reader and a server
            quota are different signals. The grid below is what each
            tool can actually answer for someone running N parallel
            agents:
          </p>
          <div className="mt-6">
            <ComparisonTable
              productName="ClaudeMeter"
              competitorName="ccusage / Claude-Code-Usage-Monitor"
              rows={ccusageVsClaudeMeter}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Wiring it into a five-pane setup
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Concretely, this is the path from{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            brew install
          </code>{" "}
          to all five tmux agents reading the same shared percent. The
          steps are short because there is one machine-level install and
          one per-agent loop call.
        </p>
        <div className="mt-6">
          <StepTimeline steps={setupSteps} />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          The guard script every parallel agent calls
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          One script. Each agent shells out to it once per loop
          iteration. Every agent reads the same{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            five_hour.utilization
          </code>
          , gates on the same threshold, sleeps on the same{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            resets_at
          </code>
          . When the wall hits, all parallel agents converge to sleep,
          then resume together when the bucket releases capacity.
        </p>
        <div className="mt-6">
          <AnimatedCodeBlock
            code={guardScript}
            language="bash"
            filename="parallel_guard.sh"
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          What it looks like when five agents share one bucket
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          A real run. Five tmux panes, each running the same agent loop
          calling{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            parallel_guard.sh
          </code>{" "}
          between iterations. The early lines show the bucket low and
          all agents proceeding. Later lines show every agent reading
          the same crossed threshold within the same poll window and
          every agent sleeping until the same{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">
            resets_at
          </code>
          .
        </p>
        <div className="mt-6">
          <TerminalOutput
            title="five parallel agents converging on one shared reset"
            lines={tmuxRunOutput}
          />
        </div>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          No half-completed pull request, no half-filled migration, no
          429 mid-tool-call. The five panes converge because the meter
          they read is the same meter the 429 fires off.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Edge cases the dedupe handles
        </h2>
        <div className="mt-4 space-y-6">
          <GlowCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-zinc-900">
                Multiple browsers signed in
              </h3>
              <p className="mt-2 text-zinc-700 leading-relaxed">
                Chrome and Arc both have the extension and both have
                claude.ai sessions. Two POSTs hit the bridge per minute.{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5">
                  dedupe_by_account
                </code>{" "}
                folds them on email; the kept row&apos;s browser becomes{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5">
                  &quot;Chrome, Arc&quot;
                </code>
                . You see one percent.
              </p>
            </div>
          </GlowCard>
          <GlowCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-zinc-900">
                Email fetch fails for one snapshot
              </h3>
              <p className="mt-2 text-zinc-700 leading-relaxed">
                Network blip on{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5">
                  /api/account
                </code>
                . The email lookup returns None for that snapshot. The
                dedupe falls back to{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5">
                  org_uuid
                </code>{" "}
                so it still merges with siblings on the same account.
              </p>
            </div>
          </GlowCard>
          <GlowCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-zinc-900">
                Two distinct accounts on the same machine
              </h3>
              <p className="mt-2 text-zinc-700 leading-relaxed">
                Personal account and work account. Two emails, two
                org_uuids. The dedupe correctly does <em>not</em> merge
                them; you get two rows, each with its own{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5">
                  five_hour.utilization
                </code>
                . An agent gates on whichever account it is logged into.
              </p>
            </div>
          </GlowCard>
          <GlowCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-zinc-900">
                One agent ignores the guard
              </h3>
              <p className="mt-2 text-zinc-700 leading-relaxed">
                Pane 5 forgets to call{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5">
                  parallel_guard.sh
                </code>{" "}
                and sends through the wall. Pane 5 gets the 429; the
                bucket does not move because it is already at 100. The
                guarded panes still see the cap and sleep correctly. The
                shared signal is the floor; agents that ignore it pay
                their own cost.
              </p>
            </div>
          </GlowCard>
        </div>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        heading="Running parallel agents and tired of guessing?"
        description="Walk through your tmux/worktree setup with us; we will help you wire claude-meter --json into the loop and pick a threshold that matches your week."
      />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Walk through wiring claude-meter --json into your parallel-agent loop"
      />

      <FaqSection heading="FAQ: parallel agents and one quota" items={faqs} />

      <section className="mx-auto max-w-4xl px-6 py-12">
        <RelatedPostsGrid
          title="Related"
          subtitle="Guides that pair with the parallel-agent meter"
          posts={relatedPosts}
        />
      </section>
    </article>
  );
}
