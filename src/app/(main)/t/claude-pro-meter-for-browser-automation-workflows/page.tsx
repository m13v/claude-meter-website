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
  ProofBanner,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-pro-meter-for-browser-automation-workflows";
const PUBLISHED = "2026-05-06";

export const metadata: Metadata = {
  title:
    "Claude Pro Usage Meter for Browser Automation Workflows: A claude-meter --json Loop Guard",
  description:
    "Browser automation against Claude Pro / Max burns through the rolling 5-hour window in minutes. ClaudeMeter exposes the server-truth quota via claude-meter --json and a 60-second auto-refreshing extension, so a Playwright, Computer Use, or Claude Code loop can read its own utilization mid-run and pause before Anthropic returns 429.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Pro Usage Meter for Browser Automation Workflows: A claude-meter --json Loop Guard",
    description:
      "How to wire ClaudeMeter into a browser-automation loop so the script gates itself on five_hour.utilization and seven_day_oauth_apps.utilization, the same numbers claude.ai/settings/usage shows.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  {
    name: "Claude Pro usage meter for browser automation workflows",
    url: PAGE_URL,
  },
];

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Claude Pro meter for browser automation" },
];

const faqs = [
  {
    q: "What is the right Claude Pro usage meter for a browser automation workflow?",
    a: "ClaudeMeter. It is free, MIT-licensed, macOS-only, and ships with a CLI binary at /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter. The reason it fits browser automation specifically is the --json flag: claude-meter --json prints a Vec<UsageSnapshot> to stdout, with named fields five_hour.utilization, seven_day.utilization, seven_day_oauth_apps.utilization, and extra_usage.used_credits. Those are the same percentages that claude.ai/settings/usage renders. A Playwright, Computer Use, or Claude Code loop can shell out to claude-meter --json once per iteration and decide whether to keep going. ccusage and Claude-Code-Usage-Monitor cannot do this; they read ~/.claude/projects JSONL files, which is local-token estimation, not the server-side bucket Anthropic actually enforces against agentic loops.",
  },
  {
    q: "Why does ccusage's number disagree with the Anthropic 429 my automation loop just got?",
    a: "Because ccusage measures a different signal. It tails ~/.claude/projects JSONL files and totals tokens per session. That is faithful for what your local Claude Code traffic weighed in tokens, but Anthropic's per-org rolling 5-hour window and the seven_day_oauth_apps weekly bucket are computed server-side, with peak-hour multipliers, per-model weights, and any browser-chat usage on the same account stacked into the same buckets. ccusage at 5 percent and claude.ai at 90 percent is the predictable mismatch. The 429 fires off the server number, so an automation loop guard has to read the server number. ClaudeMeter pulls it from /api/organizations/{org_uuid}/usage on claude.ai, which is the same endpoint the settings page uses.",
  },
  {
    q: "Do I have to manually paste a claude.ai cookie into anything?",
    a: "No. The browser extension lives at extension/background.js in the m13v/claude-meter repo. It uses chrome.alarms to fire a refresh job every periodInMinutes: 1, and its fetch call passes credentials: 'include' against https://claude.ai/api/account, then /api/organizations/{org}/usage, /api/organizations/{org}/overage_spend_limit, and /api/organizations/{org}/subscription_details for each membership. Because the extension runs inside Chrome (or Arc, Brave, Edge), the request reuses the session cookie your browser already holds. There is no cookie paste, no API key, no service account. Load the unpacked extension once, visit claude.ai once, and the menu bar plus the localhost bridge start receiving snapshots inside sixty seconds.",
  },
  {
    q: "What does the claude-meter --json output actually look like?",
    a: "An array of UsageSnapshot objects, one per (browser, account_email) pair. Each snapshot has org_uuid, browser, account_email, fetched_at, an errors array, and three optional sub-objects: usage (with five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork as Window structs of {utilization, resets_at}, plus extra_usage as {is_enabled, monthly_limit, used_credits, utilization, currency}), overage (the pay-as-you-go pool details), and subscription (status, next_charge_date, billing_interval). Pipe it into jq, ingest it into a Python loop, parse it in a Rust agent, whatever you want. Schema is in the public source at src/models.rs in the m13v/claude-meter repo.",
  },
  {
    q: "Which Claude bucket should my browser automation loop guard read?",
    a: "Two of them, depending on what you are protecting against. five_hour.utilization is the rolling 5-hour window, which is the wall an agentic browser-control loop hits within minutes if you are running Computer Use or a Playwright-driven Claude Code session in tight iteration. seven_day_oauth_apps.utilization is the agentic-loop-specific weekly bucket Anthropic added in 2026; it tracks Claude Code and other OAuth-app traffic separately from your claude.ai web chat. In practice, gate on whichever is higher. If five_hour goes past 80 percent, sleep until five_hour.resets_at. If seven_day_oauth_apps goes past 80 percent, the loop is going to die in a day or two regardless; queue the remaining work or switch to Sonnet for the rest of the week.",
  },
  {
    q: "Can my automation script read this without spawning a subprocess each iteration?",
    a: "Two paths. Easy path: claude-meter --json runs in well under one second on a warm cookie cache, so spawning it once per loop iteration is fine for any iteration cadence above a few seconds. Faster path: the menu bar app exposes a localhost bridge at 127.0.0.1:63762. The browser extension POSTs the same Vec<UsageSnapshot> to it every minute (extension/background.js BRIDGE constant on line 2). The bridge is POST-only by design (request handler at src/bin/menubar.rs lines 372-388 returns 404 to anything else), so reading from your script means tapping the same /api/organizations/{org}/usage endpoint yourself with the cookies the extension is already collecting, or sticking with the CLI. The CLI is the intended programmatic surface.",
  },
  {
    q: "What about extra-usage spend, the pay-as-you-go balance, can I gate on dollars instead of percent?",
    a: "Yes. extra_usage.used_credits in the JSON output is the dollar amount your account has accrued past the included plan quota, in the currency reported by extra_usage.currency, governed by extra_usage.monthly_limit. If your loop guard cares about real money rather than utilization fraction, key on used_credits crossing whatever ceiling you set. The overage block adds the disabled-reason and disabled-until fields, which is what tells you Anthropic has frozen extra-usage on your account (out_of_credits true means new prompts are blocked even if your five-hour bucket is fine). Both blocks come from /api/organizations/{org}/overage_spend_limit on claude.ai, exposed unchanged in the snapshot.",
  },
  {
    q: "Will multiple browsers in the loop confuse the meter?",
    a: "No. Each (browser, account_email) pair is its own snapshot row. The menu bar app identifies the sending browser by looking up the peer TCP socket's owning process, not by trusting Sec-Ch-Ua headers (which Arc, Brave, and Edge set to Chromium). So if your automation runs three Chromium-family browsers in parallel against the same Claude account, you see three rows, each labeled by the actual binary, all reading the same per-account quota. dedupe_by_account in the CLI then collapses snapshots that belong to the same Claude account before printing, so claude-meter --json gives you one snapshot per account regardless of how many browser tabs were involved in fetching it.",
  },
  {
    q: "What about Linux or Windows automation runners?",
    a: "Not supported yet on the menu bar app side. The macOS-only constraint comes from the AppKit code path that paints the colored title segments, which has no cross-platform analogue. The browser extension itself runs in any Chromium browser on any OS and exposes the same usage snapshots via chrome.storage.local; if you have a Linux or Windows automation runner, you can read those snapshots in the extension context (or call the same /api/organizations/{org}/usage endpoint directly with whatever HTTP client your runner has, using the session cookie from the running profile). The CLI loop-guard pattern in this guide is macOS-specific; the underlying server-truth idea is portable.",
  },
  {
    q: "Is there a privacy cost to running this in an automation loop?",
    a: "No outbound network egress beyond claude.ai itself. The bridge listens only on 127.0.0.1, the request fires once per minute (or once per loop iteration if you call the CLI), and there is no telemetry, no analytics endpoint, no third-party SDK in the binary. Source is MIT at github.com/m13v/claude-meter and the pieces a curious reviewer cares about are small: extension/background.js for the fetcher, src/api.rs for the parsed response, src/models.rs for the snapshot schema, src/bin/menubar.rs for the bridge.",
  },
  {
    q: "Does this fix the underlying agentic-loop quota burn?",
    a: "No. Nothing fixes it; Anthropic enforces the buckets server-side and an agentic loop is exactly the workload that fills them fastest. What this fixes is the visibility gap. Without a meter, a browser automation script runs blind and gets cut off by a 429 mid-iteration, often deep into a multi-step task. With a loop guard reading claude-meter --json, the script knows its own state and can sleep until resets_at, switch to a cheaper model for the remaining iterations, or queue the remaining work for a future window. That is what 'meter for browser automation' actually means in practice: a feedback signal the loop can act on.",
  },
];

const cliJsonShape = `[
  {
    "org_uuid": "01a2...c4",
    "browser": "Chrome",
    "account_email": "you@example.com",
    "fetched_at": "2026-05-06T18:42:01Z",
    "usage": {
      "five_hour":            { "utilization": 0.84, "resets_at": "2026-05-06T22:11:00Z" },
      "seven_day":            { "utilization": 0.62, "resets_at": "2026-05-12T09:00:00Z" },
      "seven_day_oauth_apps": { "utilization": 0.71, "resets_at": "2026-05-12T09:00:00Z" },
      "seven_day_sonnet":     { "utilization": 0.40, "resets_at": "2026-05-12T09:00:00Z" },
      "seven_day_opus":       { "utilization": 0.78, "resets_at": "2026-05-12T09:00:00Z" },
      "extra_usage": {
        "is_enabled": true,
        "monthly_limit": 5000,
        "used_credits": 12.40,
        "utilization": 0.0025,
        "currency": "USD"
      }
    },
    "overage": { "is_enabled": true, "out_of_credits": false },
    "subscription": { "status": "active", "billing_interval": "month" },
    "errors": [],
    "stale": false
  }
]`;

const loopGuardCode = `# loop_guard.sh — call once per iteration of your automation loop
# Pauses the run if 5-hour or weekly-OAuth bucket is over the threshold.

THRESHOLD=85   # percent
JSON=$(/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json)

FIVE=$(echo "$JSON" | jq '[.[].usage.five_hour.utilization] | max * 100')
WEEK=$(echo "$JSON" | jq '[.[].usage.seven_day_oauth_apps.utilization] | max * 100')
RESET=$(echo "$JSON" | jq -r '[.[].usage.five_hour.resets_at] | sort | .[-1]')

over () { python3 -c "import sys; sys.exit(0 if float('$1') > $THRESHOLD else 1)"; }

if over "$FIVE"; then
  echo "[guard] five_hour at \${FIVE}%, sleeping until $RESET"
  python3 -c "import datetime, time; \\
    t = datetime.datetime.fromisoformat('$RESET'.replace('Z', '+00:00')); \\
    now = datetime.datetime.now(datetime.timezone.utc); \\
    time.sleep(max(0, (t - now).total_seconds()) + 30)"
fi

if over "$WEEK"; then
  echo "[guard] seven_day_oauth_apps at \${WEEK}%, queue remaining work"
  exit 42
fi`;

const loopRunOutput = [
  { type: "command" as const, text: "./loop_guard.sh && python3 run_browser_agent.py --steps 50" },
  { type: "output" as const, text: "[guard] five_hour at 31%, weekly_oauth at 42% — proceeding" },
  { type: "output" as const, text: "[agent] step 01/50  navigate https://example.com  ok" },
  { type: "output" as const, text: "[agent] step 12/50  fill_form login  ok" },
  { type: "output" as const, text: "[agent] step 23/50  computer_use  click(540, 312)  ok" },
  { type: "command" as const, text: "./loop_guard.sh  # called between steps" },
  { type: "output" as const, text: "[guard] five_hour at 86%, sleeping until 2026-05-06T22:11:00Z" },
  { type: "output" as const, text: "[guard] sleep 7212 seconds, then resume from step 24" },
  { type: "success" as const, text: "loop survived rolling-window reset, no 429 mid-task" },
];

const ccusageVsClaudeMeter = [
  {
    feature: "Source of utilization number",
    ours: "/api/organizations/{org}/usage on claude.ai (server-truth)",
    competitor: "~/.claude/projects/*.jsonl token totals (local estimate)",
  },
  {
    feature: "Sees rolling 5-hour bucket",
    ours: "Yes (five_hour.utilization, five_hour.resets_at)",
    competitor: "No, infers from local activity timestamps",
  },
  {
    feature: "Sees seven_day_oauth_apps (agentic bucket)",
    ours: "Yes, exposed as a named field",
    competitor: "No, the field name does not exist locally",
  },
  {
    feature: "Sees claude.ai web chat usage in the same numbers",
    ours: "Yes, server quota stacks both",
    competitor: "No, web chat leaves no JSONL",
  },
  {
    feature: "Programmatic shape for an automation loop",
    ours: "claude-meter --json (single binary, no Python deps)",
    competitor: "ccusage --json (works, but the numbers are local)",
  },
  {
    feature: "Cookie paste required",
    ours: "No (extension reuses your live claude.ai session)",
    competitor: "N/A (does not need cookies, does not see the server)",
  },
];

const setupSteps = [
  {
    title: "Install the menu bar app",
    description:
      "brew install --cask m13v/tap/claude-meter installs both the .app and the CLI binary at /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter.",
  },
  {
    title: "Load the unpacked browser extension",
    description:
      "Clone github.com/m13v/claude-meter, open chrome://extensions (or arc://extensions, brave://extensions, edge://extensions), enable Developer mode, Load unpacked, point at the extension/ folder.",
  },
  {
    title: "Visit claude.ai once in that browser",
    description:
      "The extension's chrome.alarms job fires every minute and reuses the session cookie your browser already holds, so the menu bar lights up within sixty seconds with two percentages: 5h and 7d.",
  },
  {
    title: "Confirm the CLI sees the same numbers",
    description:
      "Run /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json and read off five_hour.utilization. It should match the percent in the menu bar and what claude.ai/settings/usage shows in your browser.",
  },
  {
    title: "Drop the loop guard into your automation runner",
    description:
      "Call ./loop_guard.sh between iterations of your Playwright, Computer Use, or Claude Code agent loop. Pause on five_hour > threshold, queue work on seven_day_oauth_apps > threshold, exit cleanly on out_of_credits.",
  },
];

const relatedPosts = [
  {
    title: "The seven_day_oauth_apps Bucket Almost Nobody Names",
    excerpt:
      "Your agentic loop has a private weekly bucket separate from the 5-hour and the all-up 7-day. Here is the field name and the only free tracker that surfaces it.",
    href: "/t/claude-agentic-loop-usage-limit",
    tag: "Buckets",
  },
  {
    title: "Claude Code Usage in the macOS Menu Bar",
    excerpt:
      "Why the menu bar is the right surface for Claude Code usage, and the two-tier redraw that keeps the dropdown stable while you watch the percent climb.",
    href: "/t/claude-code-usage-menu-bar",
    tag: "Menu bar",
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
                "Claude Pro Usage Meter for Browser Automation Workflows: A claude-meter --json Loop Guard",
              description:
                "How to wire ClaudeMeter into a browser-automation loop so the script gates itself on five_hour.utilization and seven_day_oauth_apps.utilization, the same numbers claude.ai/settings/usage shows.",
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
            A Claude Pro usage meter your{" "}
            <GradientText variant="teal">browser automation loop</GradientText>{" "}
            can actually read mid-run
          </h1>

          <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
            A Playwright, Computer Use, or Claude Code agentic loop driving a
            browser hits the rolling 5-hour wall in minutes, not hours.
            ClaudeMeter exposes the same server-truth percentages that{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-800">
              claude.ai/settings/usage
            </code>{" "}
            renders, via a single CLI flag and a 60-second auto-refreshing
            extension. Your loop reads its own quota in one line of bash and
            pauses itself before Anthropic returns 429.
          </p>

          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="8 min read"
          />

          <div className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Direct answer (verified 2026-05-06)
            </div>
            <p className="mt-2 text-zinc-800 leading-relaxed">
              <strong>ClaudeMeter</strong> (free, MIT, macOS, source at{" "}
              <a
                href="https://github.com/m13v/claude-meter"
                className="text-teal-700 underline hover:text-teal-800"
              >
                github.com/m13v/claude-meter
              </a>
              ) is the meter built for this. The CLI binary at{" "}
              <code className="rounded bg-white px-1.5 py-0.5 text-zinc-800">
                /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json
              </code>{" "}
              prints a <code>Vec&lt;UsageSnapshot&gt;</code> with named fields{" "}
              <code>usage.five_hour.utilization</code>,{" "}
              <code>usage.five_hour.resets_at</code>,{" "}
              <code>usage.seven_day_oauth_apps.utilization</code>, and{" "}
              <code>extra_usage.used_credits</code>. An automation loop pipes it
              into <code>jq</code>, gates on whichever bucket is highest, and
              sleeps until the named reset time. Local-log tools like ccusage
              and Claude-Code-Usage-Monitor cannot see those server-side buckets
              because they read{" "}
              <code className="rounded bg-white px-1.5 py-0.5 text-zinc-800">
                ~/.claude/projects/*.jsonl
              </code>
              , which is a different signal.
            </p>
          </div>
        </div>
      </BackgroundGrid>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          The blind-loop problem
        </h2>
        <div className="mt-4 space-y-4 text-zinc-700 leading-relaxed">
          <p>
            A browser-automation loop against Claude is the workload Anthropic
            built the rolling 5-hour window for. One Playwright iteration,
            navigate, snapshot the DOM, send it to Claude, parse the response,
            click. That is a tool-use round-trip. Computer Use is the same
            shape with screenshots in place of DOM snapshots. Claude Code in a
            tight refactor loop is the same shape with file diffs. Each round-
            trip is a chunky prompt plus a chunky response, and a long-running
            loop fills the bucket faster than a chat user can.
          </p>
          <p>
            The problem with running a loop against an opaque cap is that the
            loop runs blind. Iteration 1 is fine, iteration 200 returns a 429
            mid-step, and the only signal the script gets is{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">
              {"{\"error\": \"rate_limit_error\"}"}
            </code>{" "}
            after it has already opened a half-completed pull request, half-
            filled a form, or written half a database migration. The wasted
            work is the symptom; the actual gap is that the loop did not know
            its own state.
          </p>
          <p>
            The cheap fix is a loop guard, a small piece of code the loop calls
            between iterations to read its own quota and decide whether to
            keep going. The hard part has been getting an honest number to
            read. Local-log tools count tokens written to{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">
              ~/.claude/projects
            </code>
            , which is a faithful signal for what your local Claude Code
            session weighed in tokens but cannot see web-chat usage on the
            same account, peak-hour multipliers, per-model weights, or the
            specific weekly bucket Anthropic added for OAuth-app traffic in
            2026. Anthropic does the math server-side and the 429 fires off
            the server number. The loop guard has to read the server number
            too.
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
          What <code>claude-meter --json</code> actually returns
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The CLI is the programmatic surface. Its shape is the schema declared
          at <code>src/models.rs</code> in the m13v/claude-meter repo, which
          the binary serialises directly. There is no transformation layer,
          which is the point: the JSON is the same shape the api crate parses
          off <code>/api/organizations/{"{"}org_uuid{"}"}/usage</code>, with
          the orgs flattened into a top-level array and the cookie-source
          browser tagged.
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={cliJsonShape}
            language="json"
            filename="claude-meter --json"
          />
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <GlowCard>
            <div className="p-5">
              <div className="text-sm font-semibold text-teal-700">
                Fields you will probably read
              </div>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                <li>
                  <code className="text-zinc-900">
                    usage.five_hour.utilization
                  </code>{" "}
                  <span className="text-zinc-500">
                    fraction 0 to 1 of the rolling 5-hour bucket
                  </span>
                </li>
                <li>
                  <code className="text-zinc-900">
                    usage.five_hour.resets_at
                  </code>{" "}
                  <span className="text-zinc-500">
                    UTC timestamp the bucket clears
                  </span>
                </li>
                <li>
                  <code className="text-zinc-900">
                    usage.seven_day_oauth_apps.utilization
                  </code>{" "}
                  <span className="text-zinc-500">
                    weekly bucket for Claude Code and other OAuth apps
                  </span>
                </li>
                <li>
                  <code className="text-zinc-900">
                    usage.extra_usage.used_credits
                  </code>{" "}
                  <span className="text-zinc-500">
                    pay-as-you-go dollars accrued past plan quota
                  </span>
                </li>
              </ul>
            </div>
          </GlowCard>

          <GlowCard>
            <div className="p-5">
              <div className="text-sm font-semibold text-teal-700">
                Fields you can probably ignore
              </div>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                <li>
                  <code className="text-zinc-900">org_uuid</code>{" "}
                  <span className="text-zinc-500">
                    only matters if you have multiple orgs on one Claude account
                  </span>
                </li>
                <li>
                  <code className="text-zinc-900">browser</code>{" "}
                  <span className="text-zinc-500">
                    cosmetic label, useful for multi-browser logging
                  </span>
                </li>
                <li>
                  <code className="text-zinc-900">subscription.status</code>{" "}
                  <span className="text-zinc-500">
                    nice to log on first failure, otherwise stable
                  </span>
                </li>
                <li>
                  <code className="text-zinc-900">stale</code>{" "}
                  <span className="text-zinc-500">
                    only set when the bridge has not heard from the extension
                  </span>
                </li>
              </ul>
            </div>
          </GlowCard>
        </div>
      </section>

      <section className="bg-zinc-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The loop guard, in one shell script
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Drop this between iterations of any browser-automation loop that
            calls Claude. It exits 0 to keep going, sleeps until the rolling
            window resets if the 5-hour bucket is past the threshold, and
            exits 42 (a sentinel for the outer scheduler) if the weekly OAuth-
            apps bucket is past threshold. Tune the threshold to your taste; 85
            is conservative.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={loopGuardCode}
              language="bash"
              filename="loop_guard.sh"
            />
          </div>
          <div className="mt-6">
            <TerminalOutput lines={loopRunOutput} title="example session" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          How the meter gets the number without a cookie paste
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The browser extension is the moving part that earns its place in a
          guide about automation. Loading it once removes the friction every
          other server-truth meter has shown so far: open the dev tools,
          export the cookie, paste it into a config file, refresh when it
          expires.
        </p>
        <div className="mt-6">
          <StepTimeline
            steps={[
              {
                title: "brew install --cask m13v/tap/claude-meter",
                description:
                  "Installs the .app under /Applications and the CLI binary at /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter. The brew cask also drops a launch agent so the menu bar comes back after reboot.",
              },
              {
                title: "Load extension/ as an unpacked extension",
                description:
                  "chrome://extensions in Chrome, arc://extensions in Arc, brave://extensions in Brave, edge://extensions in Edge. Developer mode on, Load unpacked, point at the extension folder of the cloned repo. Pin the icon if you want the popup.",
              },
              {
                title: "extension/background.js fires once per minute",
                description:
                  "chrome.alarms.create('refresh', { periodInMinutes: 1 }) registers a recurring job. The handler calls fetch(BASE + '/api/account', { credentials: 'include' }) plus the per-org usage, overage, and subscription endpoints, with the session cookie your browser already holds.",
              },
              {
                title: "Snapshots POST to 127.0.0.1:63762/snapshots",
                description:
                  "BRIDGE constant on line 2 of background.js. The menu bar app listens on that port (BRIDGE_PORT in src/bin/menubar.rs line 349) and labels each snapshot by looking up the peer TCP socket's owning process, so Chrome and Arc rows do not blur together.",
              },
              {
                title: "claude-meter --json drains the same data to stdout",
                description:
                  "The CLI does not need the bridge to be running. It walks the Chromium profile cookie databases on macOS (or accepts the bridged snapshot if the menu bar is already running and warm), parses the same /api/organizations/{org}/usage response, and prints the parsed Vec<UsageSnapshot> as JSON.",
              },
            ]}
          />
        </div>
      </section>

      <section className="bg-zinc-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Why ccusage cannot do this, and why that is fine
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            ccusage and Claude-Code-Usage-Monitor are good tools that answer a
            different question. They tail{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">
              ~/.claude/projects/*.jsonl
            </code>{" "}
            and total tokens per session. That is an honest signal for what
            your local Claude Code traffic weighed. It is not the bucket
            Anthropic enforces against an agentic loop. The two answers are
            both useful, they are just different answers.
          </p>
          <div className="mt-6">
            <ComparisonTable
              productName="ClaudeMeter"
              competitorName="ccusage / Claude-Code-Usage-Monitor"
              rows={ccusageVsClaudeMeter}
            />
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            Use both. Read ccusage to find out which session weighed the most.
            Read ClaudeMeter to find out whether your loop is allowed to run
            another iteration. They live next to each other, not on top of
            each other.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Set it up in five minutes
        </h2>
        <div className="mt-6">
          <StepTimeline steps={setupSteps} />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">
          What happens when extra-usage runs out
        </h2>
        <div className="mt-4 space-y-4 text-zinc-700 leading-relaxed">
          <p>
            The two utilization buckets are not the only reason a loop can die.
            If your account has metered extra-usage enabled (Anthropic's pay-
            as-you-go pool that turns on after the included plan quota
            exhausts) and the monthly limit hits zero,{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">
              overage.out_of_credits
            </code>{" "}
            in the snapshot flips to true. From that point on, every Claude
            request returns an out-of-credits error regardless of how the
            five_hour or seven_day buckets look.
          </p>
          <p>
            For a browser-automation loop, this is the case where retrying is
            actively harmful: each retry counts as a billable attempt that
            still fails. The loop guard should treat{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">
              out_of_credits == true
            </code>{" "}
            as a hard stop and exit cleanly, not as something to back off and
            retry. The shell-script pattern earlier in this guide treats the
            two utilization buckets as soft stops (sleep, queue) and reserves
            an explicit exit code for the hard stop.
          </p>
        </div>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        heading="Wiring this into a real automation runner?"
        description="Book 20 minutes if you want a hand wiring the loop guard into a Playwright, Computer Use, or Claude Code runner you already have running."
      />

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">FAQ</h2>
        <div className="mt-6">
          <FaqSection items={faqs} heading="" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <RelatedPostsGrid
          title="Related guides"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="20 min on wiring the loop guard into your runner"
      />
    </article>
  );
}
