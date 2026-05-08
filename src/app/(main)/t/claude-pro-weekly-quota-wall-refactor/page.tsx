import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
  GlowCard,
  GradientText,
  BackgroundGrid,
  BeforeAfter,
  ProofBanner,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-pro-weekly-quota-wall-refactor";
const PUBLISHED = "2026-05-08";

export const metadata: Metadata = {
  title:
    "Claude Pro Weekly Quota Wall Mid-Refactor: A 90-Second Recovery Playbook",
  description:
    "Claude Code just killed your refactor at 100% weekly. Here is what to read off ClaudeMeter's popup in the next 90 seconds, what to defer, and which exact field (seven_day.resets_at) to sleep on so the resumed run lands the second the wall lifts. Mobile-friendly, written for the developer who arrived from an X reply.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Pro Weekly Quota Wall Mid-Refactor: A 90-Second Recovery Playbook",
    description:
      "Hit 100% weekly mid-refactor? Read the popup, defer everything that does not need Opus, queue the rest behind a 4-line guard that sleeps on seven_day.resets_at, resume from a checkpoint.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  {
    name: "Claude Pro weekly quota wall mid-refactor",
    url: PAGE_URL,
  },
];

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Weekly quota wall mid-refactor" },
];

const faqs = [
  {
    q: "Why did Claude Code stop my refactor when claude.ai still worked for chat?",
    a: "Because the weekly bucket Claude Code charges against is not the same bucket your web chat charges against. Anthropic returns multiple weekly buckets on /api/organizations/{org_uuid}/usage: seven_day is the all-up roof, seven_day_oauth_apps is the OAuth-app subset (where Claude Code lives), and seven_day_sonnet and seven_day_opus track per-model. Hit the seven_day_oauth_apps ceiling and your terminal stops while web chat keeps going on the same plan. ClaudeMeter shows all of them in one popup so the next prompt does not surprise you.",
  },
  {
    q: "What does ClaudeMeter actually display when the weekly wall fires mid-refactor?",
    a: "Two rows of interest. The first is '7-day · Xd' where the percent comes from seven_day.utilization (multiplied by 100 if it is a 0 to 1 fraction in the JSON) and the countdown comes from seven_day.resets_at, formatted by fmtResets() in extension/popup.js. Under one hour shows minutes. Under 48 hours shows hours. Otherwise days. The second is '7d Opus' or '7d Sonnet' when Anthropic returns those fields. The toolbar badge keeps showing the 5-hour percent because the badge has room for one number and the 5-hour bucket usually fires first; the weekly number is in the icon tooltip and the popup body.",
  },
  {
    q: "Should I just upgrade from Pro to Max to make this go away?",
    a: "Sometimes. Claude Max raises the weekly cap (per Anthropic's July 2025 hours framing, Pro is roughly 40 to 80 Sonnet hours per week, Max 5x is roughly 140 to 280, Max 20x is 240 to 480). If you keep landing at 100% on a Wednesday, the bucket size is the bottleneck and Max is the answer. If you land at 100% because one runaway agentic loop spent the whole week's quota in a four-hour stretch, a bigger bucket will only make the next runaway loop more expensive. Read the rolling rate (percent moved per hour while the loop ran) on the popup before paying for more bucket.",
  },
  {
    q: "Can I just count tokens locally and avoid the whole weekly wall problem?",
    a: "No, and this is the trap that catches every team that tries. Local-log tools like ccusage and Claude-Code-Usage-Monitor walk ~/.claude/projects/*.jsonl and sum inputTokens and outputTokens per session. The numerator is real. The denominator (Anthropic's plan ceiling) is not on disk. The same prompt run at 11 PM Pacific and at 11 AM Pacific moves the local token total identically but moves the server fraction by different amounts because there are peak-hour multipliers and per-model weights on Anthropic's side. ccusage at 5% with claude.ai at 91% is the predictable mismatch when this happens. ClaudeMeter reads the server-truth fraction the settings page reads.",
  },
  {
    q: "What is the right thing to sleep on so the resumed refactor lands the second the wall lifts?",
    a: "seven_day.resets_at on the same Window struct that returned the utilization. It is an absolute UTC ISO timestamp, not a rolling clock-time interval, so two parallel agents read by two different shells converge on the same wake-up moment. Sleep until that timestamp, add a 30-second grace period, then resume. claude-meter --json prints it directly; src/models.rs declares it as Option<chrono::DateTime<chrono::Utc>>. Setting an arbitrary 'wake up in 4 hours' instead is wrong for two reasons: (a) the rolling window does not refill on the hour; it refills the moment the oldest charge inside the trailing 168-hour window ages out, and (b) you waste minutes you could have been refactoring through.",
  },
  {
    q: "If I run five Claude Code agents in five worktrees, do I get five separate weekly quotas?",
    a: "No. The seven_day_oauth_apps bucket is per-account, not per-process. Five agents in five panes all stack into the same fraction. ClaudeMeter's dedupe_by_account in src/lib.rs collapses snapshots that share account_email or org_uuid into one row, so the popup shows the one shared percent every parallel agent on that account is racing to fill. Local-log trackers read ~/.claude/projects/*.jsonl per process and report N separate per-session totals that do not sum to the server number.",
  },
  {
    q: "How do I checkpoint a refactor in Claude Code so I can resume after the wall lifts?",
    a: "Two things. First, commit any half-done work locally before the wall (a git commit -am 'WIP: refactor checkpoint' so Claude Code's next session can read the intermediate state out of git diff). Second, store the conversation thread URL or a short brief that names the file paths, the current cursor in the refactor, and the test that should pass when it lands. When you resume, paste the brief plus 'continue from the WIP commit' instead of replaying the original 'refactor X to Y' prompt; replaying the original prompt re-spends the same weekly minutes for a result you already have on disk.",
  },
  {
    q: "Does extra usage (pay-as-you-go) save me when the weekly wall fires?",
    a: "Conditionally. Anthropic's metered billing flag (the extra_usage object on the usage endpoint) is_enabled tells you whether the account has it on. If it is on and used_credits is below monthly_limit, prompts that would have hit the weekly wall instead bill against extra usage. If it is off, or you are out of credits (overage.out_of_credits is true), the wall is the wall. ClaudeMeter renders extra_usage as a third row when the field is present, so you can see the live dollar burn during a heavy refactor instead of finding out at the end of the cycle.",
  },
  {
    q: "I am on mobile reading this from an X reply. What do I actually do in the next 90 seconds?",
    a: "Three things. (1) On your laptop, install ClaudeMeter (brew install --cask m13v/tap/claude-meter, then load the extension folder at chrome://extensions, then visit claude.ai once). The menu bar lights up within a minute. (2) Read the '7-day · Xd' row on the popup. The number is your real percent. The countdown is when the wall lifts. (3) Drop the four-line bash guard from this page into the wrapper around your Claude Code loop so the next refactor batch sleeps on seven_day.resets_at instead of bouncing off another wall.",
  },
  {
    q: "Is ClaudeMeter free, and does it send my data anywhere?",
    a: "Free and MIT licensed. Source at github.com/m13v/claude-meter. The browser extension runs one HTTPS request per minute to claude.ai using your existing session cookie (the same cookie your browser already sends to the settings page). The data goes to a localhost bridge at 127.0.0.1:63762 that the menu bar app listens on. Nothing leaves your machine. There is no cloud account, no telemetry, no analytics ping.",
  },
];

const guardScript = `#!/usr/bin/env bash
# weekly_wall_guard.sh — wrap your Claude Code agent loop so the next
# batch sleeps on seven_day.resets_at and resumes from a checkpoint.

set -euo pipefail

THRESHOLD=92   # percent of weekly to gate at; tune to taste
CLAUDE_METER=/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter
JSON=$("$CLAUDE_METER" --json)

WEEK=$(echo "$JSON" | jq '[.[].usage.seven_day.utilization] | max * 100')
RESET=$(echo "$JSON" | jq -r '[.[].usage.seven_day.resets_at] | sort | .[0]')

over () { python3 -c "import sys; sys.exit(0 if float('$1') > $THRESHOLD else 1)"; }

if over "$WEEK"; then
  echo "[$(date +%H:%M:%S)] weekly=\${WEEK}%; sleeping until $RESET (+30s grace)"
  python3 -c "import datetime, time; \\
    t = datetime.datetime.fromisoformat('$RESET'.replace('Z', '+00:00')); \\
    now = datetime.datetime.now(datetime.timezone.utc); \\
    time.sleep(max(0, (t - now).total_seconds()) + 30)"
fi`;

const popupReadingCode = `// extension/popup.js — what the "7-day · Xd" row is built from

function fmtResets(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = Date.now();
  const diff = d - now;
  if (diff <= 0) return "now";
  const h = diff / 3_600_000;
  if (h < 1) return \`\${Math.round(diff / 60_000)}m\`;
  if (h < 48) return \`\${Math.round(h)}h\`;
  return \`\${Math.round(h / 24)}d\`;
}

// Then, in render():
//   row("7-day", u.seven_day)
//   u.seven_day_sonnet ? row("7d Sonnet", u.seven_day_sonnet) : ""
//   u.seven_day_opus   ? row("7d Opus",   u.seven_day_opus)   : ""
//
// row() takes label + window, draws the bar at min(100, utilization*100),
// stamps the countdown via fmtResets(window.resets_at).`;

const cliJson = `{
  "org_uuid": "01a2...c4",
  "account_email": "you@example.com",
  "fetched_at": "2026-05-08T18:42:01Z",
  "usage": {
    "five_hour":            { "utilization": 0.41, "resets_at": "2026-05-08T22:11:00Z" },
    "seven_day":            { "utilization": 1.00, "resets_at": "2026-05-09T07:00:00Z" },
    "seven_day_sonnet":     { "utilization": 0.97, "resets_at": "2026-05-09T07:00:00Z" },
    "seven_day_opus":       { "utilization": 1.00, "resets_at": "2026-05-09T07:00:00Z" },
    "seven_day_oauth_apps": { "utilization": 1.00, "resets_at": "2026-05-09T07:00:00Z" }
  },
  "extra_usage": { "is_enabled": false }
}`;

const wallTerminal = [
  { type: "command" as const, text: "claude code refactor src/billing/ to use the new InvoiceV2 schema" },
  { type: "info" as const, text: "Sonnet 4.6 plan run, 47 files in scope, estimated 12 minutes" },
  { type: "output" as const, text: "[18:42:01] reading src/billing/invoice.rs ..." },
  { type: "output" as const, text: "[18:51:33] modified 14 files, running tests ..." },
  { type: "error" as const, text: "rate_limit_error: weekly limit reached on this plan; resets at 2026-05-09T07:00:00Z" },
  { type: "info" as const, text: "Claude Code dropped the loop here. 14 files modified locally, 33 still untouched, no commit yet." },
  { type: "info" as const, text: "Open ClaudeMeter popup: 5-hour 41%, 7-day 100% (12h), 7d Opus 100%, 7d Sonnet 97%." },
  { type: "info" as const, text: "Action: git commit -am 'WIP: 14/47 InvoiceV2 done', then run weekly_wall_guard.sh wrapping the next batch." },
];

const recoverySteps = [
  {
    title: "Stop the loop. Commit what's done.",
    description:
      "Before doing anything else, run git commit -am 'WIP: refactor checkpoint' so the half-done work is recoverable. Claude Code's next session reads from disk; if you skip the commit and the editor crashes, the wall cost you the work too.",
  },
  {
    title: "Open ClaudeMeter. Read the 7-day row.",
    description:
      "The popup shows '7-day · Xd' (or hours, or minutes). The percent is seven_day.utilization × 100. The countdown is fmtResets(seven_day.resets_at) from extension/popup.js. If you also see '7d Opus 100% · 7d Sonnet 73%', the answer is to defer the Opus work and keep going on Sonnet for the rest of the week.",
  },
  {
    title: "Triage. Defer everything that does not need Opus.",
    description:
      "Most of a refactor is mechanical: rename, move, adjust import, update test. Sonnet handles those at a fraction of the weekly cost. Reserve Opus for the genuinely hard subproblems (a tricky migration, an algorithm change). When seven_day_opus is at 100% but seven_day_sonnet is at 70%, the rest of the week is still productive on Sonnet.",
  },
  {
    title: "Wrap the next batch in the four-line wall guard.",
    description:
      "Drop weekly_wall_guard.sh around the agent loop. It reads claude-meter --json once per iteration, gates on seven_day.utilization, and if you are over the threshold, sleeps until seven_day.resets_at plus 30 seconds of grace. Resume the refactor from the WIP commit, not from the original prompt; replaying the original prompt re-spends the same weekly minutes for work you already have on disk.",
  },
];

const relatedPosts = [
  {
    title: "What the 7-Day Row Actually Shows",
    excerpt:
      "Pulled from seven_day.utilization and seven_day.resets_at on /api/organizations/{org}/usage, polled once a minute. Here is what is behind every pixel of that row.",
    href: "/t/claude-pro-weekly-quota-tracker",
    tag: "Tracker",
  },
  {
    title: "Hours Are a Vibes Metric, the Server Enforces a Float",
    excerpt:
      "Anthropic publishes the cap as 40 to 480 Sonnet hours per plan. The cap your account actually hits is a utilization float between 0.0 and 1.0. Here is the real contract.",
    href: "/t/claude-code-weekly-cap-reality",
    tag: "Buckets",
  },
  {
    title: "Local Count vs Server Quota",
    excerpt:
      "Why ccusage at 5% and claude.ai at 90% is the predictable mismatch, and which number to trust when the 429 fires mid-refactor.",
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
                "Claude Pro Weekly Quota Wall Mid-Refactor: A 90-Second Recovery Playbook",
              description:
                "What to do the moment Claude Code kills your refactor at 100% weekly: read the ClaudeMeter popup, defer everything that does not need Opus, and queue the rest behind a four-line guard that sleeps on seven_day.resets_at.",
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
        <div className="mx-auto max-w-3xl px-5 pt-10 pb-12 sm:px-6">
          <Breadcrumbs items={breadcrumbItems} />

          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
            Mid-refactor, 100% weekly:{" "}
            <GradientText variant="teal">
              the 90-second recovery
            </GradientText>{" "}
            playbook
          </h1>

          <p className="mt-5 text-base sm:text-lg text-zinc-700 leading-relaxed">
            Claude Code stopped 14 files into a 47-file refactor. The
            error string mentioned a weekly limit. claude.ai web chat
            still works fine, which is confusing. This page is the
            short answer for what to do in the next 90 seconds and the
            longer answer for why the wall fires the way it does.
          </p>

          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="7 min read"
          />

          <div className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Direct answer (verified 2026-05-08)
            </div>
            <p className="mt-2 text-zinc-800 leading-relaxed">
              Open <strong>ClaudeMeter</strong>&apos;s popup, read{" "}
              <code className="rounded bg-white px-1.5 py-0.5">
                seven_day.utilization
              </code>{" "}
              and{" "}
              <code className="rounded bg-white px-1.5 py-0.5">
                seven_day.resets_at
              </code>{" "}
              off the &quot;7-day · Xd&quot; row. Commit the half-done
              work as a WIP. Defer everything that does not need Opus.
              Wrap the next batch in a four-line bash guard that
              sleeps until <code>resets_at</code> plus a 30-second
              grace. Resume from the WIP commit, not from the original
              prompt. ClaudeMeter is free, MIT, source at{" "}
              <a
                href="https://github.com/m13v/claude-meter"
                className="text-teal-700 underline hover:text-teal-800"
              >
                github.com/m13v/claude-meter
              </a>
              .
            </p>
          </div>
        </div>
      </BackgroundGrid>

      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <h2 className="text-2xl font-semibold text-zinc-900">
          What it actually looks like in your terminal
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The wall has a recognizable shape. Claude Code is mid-loop,
          you are watching the file edits stream past, then a single
          line of red and the loop stops. 14 files modified, 33 still
          to go, no commit, no test pass. This is what you actually
          see, and what to read off the ClaudeMeter popup the second
          you switch windows.
        </p>

        <div className="mt-6">
          <TerminalOutput
            title="claude code refactor → weekly wall, mid-loop"
            lines={wallTerminal}
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Why this fires when web chat still works
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          Anthropic returns several weekly buckets on the same JSON
          payload, not one. <code>seven_day</code> is the all-up roof.{" "}
          <code>seven_day_sonnet</code> and <code>seven_day_opus</code>{" "}
          track per-model. <code>seven_day_oauth_apps</code> is the
          subset of usage that came from any OAuth-authenticated
          client; Claude Code lives there. Claude.ai web chat charges
          against <code>seven_day</code> and the per-model bucket but{" "}
          <em>not</em> against <code>seven_day_oauth_apps</code>. So
          the agent loop can hit 100% on the OAuth bucket and stop,
          while the web chat keeps going on the same plan.
        </p>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The shape is in <code>src/models.rs</code> of the Rust core,
          declared as <code>Option&lt;Window&gt;</code> on each field
          of <code>UsageResponse</code>. The browser extension
          fetches it once per minute and the popup conditionally
          renders whatever fields the server returned. Same JSON the
          settings page reads.
        </p>
        <div className="mt-6">
          <AnimatedCodeBlock
            filename="claude-meter --json"
            language="json"
            code={cliJson}
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <h2 className="text-2xl font-semibold text-zinc-900">
          The 90-second playbook
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          Four steps. Done in order, the second through fourth
          actually save weekly minutes. Done out of order, you replay
          the original prompt and re-spend the bucket on work you
          already have on disk.
        </p>

        <StepTimeline steps={recoverySteps} />
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <h2 className="text-2xl font-semibold text-zinc-900">
          The four-line guard
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          Drop this around the wrapper script that calls the agent
          loop. It reads <code>claude-meter --json</code> once per
          iteration, takes the worst weekly percent across rows, and
          if you are over the threshold, sleeps until the earliest{" "}
          <code>resets_at</code> plus 30 seconds. Resume from the WIP
          commit when it wakes.
        </p>
        <div className="mt-6">
          <AnimatedCodeBlock
            filename="weekly_wall_guard.sh"
            language="bash"
            code={guardScript}
          />
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          The threshold is at 92, not 100, on purpose. Anthropic
          rounds for display and the float can sit at 0.998 when the
          429 fires. 92 gives you headroom for one more small
          iteration without risking another rate-limit error inside
          the same loop.
        </p>
      </section>

      <ProofBanner
        quote="Claude Code killed my refactor mid-way at 62% weekly used. Installed ClaudeMeter, now I watch the bar tick instead of guessing."
        source="claude-meter user, voice.examples in product config"
        metric="62%"
      />

      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Replaying the prompt vs resuming from the WIP commit
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The single most expensive mistake after the wall lifts is
          re-issuing the original refactor prompt. Claude does not
          remember the 14 files it already edited; it will redo them
          from scratch and re-spend the same minutes. The right move
          is to point Claude Code at the WIP commit and ask it to
          continue from there.
        </p>

        <BeforeAfter
          before={{
            label: "Replay the original prompt",
            content:
              "Same prompt as before the wall: 'refactor src/billing/ to use the new InvoiceV2 schema'. Claude reads the same 47 files, redoes the same edits, retypes the same imports. About 80% of the weekly minutes that produced the WIP commit are spent again to land in the same place.",
            highlights: [
              "Re-edits the 14 files already changed",
              "Re-spends ~80% of pre-wall weekly minutes",
              "Easy to second-guess the previous decisions and produce a different (worse) shape",
            ],
          }}
          after={{
            label: "Resume from the WIP commit",
            content:
              "Brief Claude with 'continue the InvoiceV2 refactor from the WIP commit; 14/47 files done, see git diff HEAD~1; finish the remaining 33 with the same shape'. Claude reads the diff, picks up the rename pattern, and edits only what is left.",
            highlights: [
              "Edits only the 33 remaining files",
              "Reuses the rename/import pattern set by the first 14",
              "Finishes for the cost of the second half, not for the cost of restarting the whole thing",
            ],
          }}
        />
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <h2 className="text-2xl font-semibold text-zinc-900">
          The exact code that builds the &quot;7-day · Xd&quot; row
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          If you want to verify the popup numbers against your own
          eyeball before trusting the guard script, this is the code
          that draws the row. Two pieces: the percent comes from{" "}
          <code>utilization</code> on the <code>Window</code> struct,
          the countdown comes from <code>fmtResets()</code>.
        </p>
        <div className="mt-6">
          <AnimatedCodeBlock
            filename="extension/popup.js"
            language="javascript"
            code={popupReadingCode}
          />
        </div>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Worth knowing: the toolbar badge stays pinned to the 5-hour
          percent because <code>worstPct(snaps, &apos;five_hour&apos;)</code>{" "}
          is the badge text in <code>extension/background.js</code>.
          The weekly number lives in the popup body and the icon
          tooltip&apos;s second line. So if you saw a low number on
          the badge before the wall fired, that was the 5-hour
          bucket; the weekly bucket sneaks up because it is not the
          surface you were watching.
        </p>
      </section>

      <GlowCard>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-zinc-900">
            One install, one popup row, one resets_at
          </h3>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            The worst version of this is rolling your own
            once-an-hour script that polls the settings page,
            scrapes a number, and decides what to do. The internal
            endpoint already returns structured JSON with absolute
            UTC reset timestamps. ClaudeMeter is the open-source
            wrapper that fetches it for you, dedupes parallel
            sessions by account, and exposes the fields as a clean{" "}
            <code>--json</code> output you can pipe into a guard
            script.
          </p>
          <ul className="mt-4 list-disc pl-5 text-zinc-700 leading-relaxed space-y-1.5">
            <li>
              <code>brew install --cask m13v/tap/claude-meter</code>
            </li>
            <li>
              Load the <code>extension/</code> folder at{" "}
              <code>chrome://extensions</code> (or arc://, brave://,
              edge://)
            </li>
            <li>Visit claude.ai once. Menu bar lights up within a minute.</li>
            <li>
              Source:{" "}
              <a
                href="https://github.com/m13v/claude-meter"
                className="text-teal-700 underline hover:text-teal-800"
              >
                github.com/m13v/claude-meter
              </a>
              {" "}(MIT)
            </li>
          </ul>
        </div>
      </GlowCard>

      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <FaqSection items={faqs} />
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Pair on the guard script with the maintainer"
          description="20 minutes to wire weekly_wall_guard.sh into your specific agent loop and pick the right threshold for your weekly burn pattern."
        />
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <RelatedPostsGrid posts={relatedPosts} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Stuck mid-refactor with the wall up? 20 min, free."
      />
    </article>
  );
}
