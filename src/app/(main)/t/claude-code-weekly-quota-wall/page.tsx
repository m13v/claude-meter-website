import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
  ComparisonTable,
  ProofBanner,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-code-weekly-quota-wall";
const PUBLISHED = "2026-05-10";

export const metadata: Metadata = {
  title:
    "The Claude Code Weekly Quota Wall: Claude Code Already Knows, It Just Won't Tell You",
  description:
    "When the weekly wall fires, Claude Code prints a generic 'rate_limit_error: ... limit reached' string. But the credentials and the endpoint that would tell you which of the seven weekly buckets actually blocked you are already on your machine. Here is what the CLI is hiding and how to read it.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "The Claude Code Weekly Quota Wall: Claude Code Already Knows",
    description:
      "Seven weekly buckets. Claude Code names none of them in its error. The OAuth token in your macOS Keychain plus the api.anthropic.com/api/oauth/usage endpoint will. Mobile-friendly guide.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code weekly quota wall", url: PAGE_URL },
];

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Guides", href: "https://claude-meter.com/t" },
  { label: "Claude Code weekly quota wall" },
];

const faqs = [
  {
    q: "What is the Claude Code weekly quota wall?",
    a: "It is the rolling 168-hour per-account ceiling Anthropic enforces against your Claude Code traffic. Anthropic's /api/organizations/{org_uuid}/usage endpoint returns seven weekly buckets (seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork, plus the cross-cutting seven_day aggregate) and a five_hour bucket on top. When any one of them crosses utilization 1.0 the API responds 429 and Claude Code prints rate_limit_error: ... limit reached and stops the loop. The clock is rolling, not calendar; the bucket that fired is not named in the CLI output.",
  },
  {
    q: "Why does the CLI just say 'rate limit reached' without saying which limit?",
    a: "Because Claude Code shows you the server's textual error string, and Anthropic's 429 body uses one shape regardless of which bucket fired. The structured detail lives in a separate JSON payload at api.anthropic.com/api/oauth/usage (the endpoint the OAuth token has scope for) and at claude.ai/api/organizations/{org_uuid}/usage (the endpoint the web Settings page calls). Neither is surfaced inline by the CLI. The slash command /usage shows a one-shot snapshot if you stop and type it, but during an active loop the next message is the one that 429s, and by then you are looking at the wall, not the bucket name.",
  },
  {
    q: "How can I see which bucket actually walled me?",
    a: "Two ways. (1) Run claude with /usage right after the wall fires; it prints the rolling-window percentages for five_hour, seven_day, and the per-model splits. (2) Read the raw JSON directly. The OAuth credentials Claude Code stores in macOS Keychain under service 'Claude Code-credentials' have user:profile scope, which is sufficient. Pull the access token with `security find-generic-password -s 'Claude Code-credentials' -w` and curl https://api.anthropic.com/api/oauth/usage with Authorization: Bearer <token>. You will see every bucket with its own utilization float and its own resets_at timestamp. ClaudeMeter polls that endpoint every 60 seconds so you do not have to.",
  },
  {
    q: "Why does this fire while claude.ai web chat still works?",
    a: "Because the bucket that walled you is probably seven_day_oauth_apps, which only counts traffic from OAuth-authenticated clients (Claude Code, MCP host loops, agentic CLIs). The web chat charges against seven_day (the all-up aggregate) and ignores the OAuth bucket. Your account can sit at seven_day=30% and seven_day_oauth_apps=100% at the same time, the web stays usable, the terminal does not. The field name is declared in models.rs lines 18-28 of the open-source ClaudeMeter repo.",
  },
  {
    q: "How long until the wall lifts?",
    a: "Whatever the resets_at field on the specific bucket that fired says. The seven_day buckets are rolling: resets_at is the UTC instant the oldest still-counted message will age out of the trailing 168-hour window. It is not a fixed weekday boundary. Two users at identical utilization will have different resets_at because their charging histories differ. claude-meter --json prints it. ClaudeMeter's popup renders it as 'in 2h' or 'in 3d' depending on distance, via fmtResets in extension/popup.js lines 17-27.",
  },
  {
    q: "Will switching from Pro to Max fix it, or just push the wall later?",
    a: "It pushes the wall later for the same workload. Max raises the cap on every weekly bucket. If you keep landing at 100% on a Wednesday with Pro, a bigger bucket means you land at 60% instead and finish the week. If you keep landing at 100% because one runaway agentic loop spent the whole week's quota in four hours, a bigger bucket just makes the next runaway loop more expensive. Read the rolling burn rate before you upgrade. Anthropic's July 2025 hours framing put Pro at roughly 40 to 80 Sonnet hours per week, Max 5x at 140 to 280, Max 20x at 240 to 480; those are estimated upper and lower bounds, not a stable conversion to the utilization float the server enforces.",
  },
  {
    q: "Does enabling metered billing get me past the wall?",
    a: "Conditionally. If extra_usage.is_enabled is true on /usage and used_credits is below monthly_credit_limit on /overage_spend_limit, prompts that would have walled instead bill against extra usage at standard API prices. If is_enabled is false, or out_of_credits is true on /overage_spend_limit, the wall stays the wall. ClaudeMeter shows extra_usage as a third row when it is present so you can see the live dollar burn instead of finding out at the end of the cycle. The field is in models.rs ExtraUsage struct, lines 9-16 of the repo.",
  },
  {
    q: "Can I count my Claude Code tokens locally and avoid this?",
    a: "No. ccusage and Claude-Code-Usage-Monitor walk ~/.claude/projects/*.jsonl and sum the inputTokens / outputTokens fields per session. The numerator is real. The denominator (Anthropic's plan cap) is not on disk. The server applies per-model weights and peak-hour multipliers that are not in the local logs. ccusage at 5% and claude.ai at 91% is the predictable mismatch that catches every team that tries this. The two are complementary: ccusage tells you what you spent in tokens, ClaudeMeter tells you where that puts you against the server's actual ceiling.",
  },
  {
    q: "Is ClaudeMeter free, and what does it send anywhere?",
    a: "Free, MIT licensed, source at github.com/m13v/claude-meter. The browser extension makes one HTTPS request per minute to claude.ai using the session cookie your browser already holds; the result is posted to a localhost bridge at 127.0.0.1:63762 that the menu bar app listens on. No telemetry, no cloud account, no analytics ping. Read background.js lines 14 to 44 if you want to audit the exact requests.",
  },
];

const wallTerminal = [
  { type: "command" as const, text: "claude code refactor the auth flow to use the new SessionToken type" },
  { type: "info" as const, text: "Opus 4.7 plan run, 31 files in scope" },
  { type: "output" as const, text: "[14:11:02] reading src/auth/session.rs ..." },
  { type: "output" as const, text: "[14:18:47] modified 9 files, running cargo check ..." },
  { type: "error" as const, text: "API Error: 429 rate_limit_error: limit reached on this plan; please try again later" },
  { type: "info" as const, text: "Claude Code stopped the loop here. No bucket name. No resets_at. No which-plan-cap-fired." },
  { type: "info" as const, text: "claude.ai web chat in the other tab still works fine, which is confusing." },
];

const keychainBlob = `{
  "claudeAiOauth": {
    "accessToken":  "sk-ant-oat01-...",
    "refreshToken": "sk-ant-ort01-...",
    "expiresAt":     1778299177154,
    "scopes":       ["user:profile", "user:inference"],
    "subscriptionType": "max",
    "rateLimitTier":    "default_claude_max_20x"
  }
}
// Stored by Claude Code itself, under macOS Keychain service
// "Claude Code-credentials". Read with:
//
//   security find-generic-password -s "Claude Code-credentials" -w
//
// Reference: src/oauth.rs lines 27-77, github.com/m13v/claude-meter`;

const curlUsage = `# Read the same data the web Settings page reads.
# user:profile scope is enough; the token Claude Code already has works.

TOKEN=$(security find-generic-password -s "Claude Code-credentials" -w \\
  | jq -r '.claudeAiOauth.accessToken')

curl -sS https://api.anthropic.com/api/oauth/usage \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Accept: application/json" \\
  | jq '{
      five_hour:            .five_hour            | {utilization, resets_at},
      seven_day:            .seven_day            | {utilization, resets_at},
      seven_day_sonnet:     .seven_day_sonnet     | {utilization, resets_at},
      seven_day_opus:       .seven_day_opus       | {utilization, resets_at},
      seven_day_oauth_apps: .seven_day_oauth_apps | {utilization, resets_at},
      extra_usage:          .extra_usage
    }'`;

const sampleResponse = `{
  "five_hour":            { "utilization": 0.18, "resets_at": "2026-05-10T18:42Z" },
  "seven_day":            { "utilization": 0.62, "resets_at": "2026-05-12T09:14Z" },
  "seven_day_sonnet":     { "utilization": 0.41, "resets_at": "2026-05-12T09:14Z" },
  "seven_day_opus":       { "utilization": 0.74, "resets_at": "2026-05-12T09:14Z" },
  "seven_day_oauth_apps": { "utilization": 1.00, "resets_at": "2026-05-12T09:14Z" },
  "extra_usage":          { "is_enabled": false }
}
//
// Read this top-to-bottom and the wall stops being a mystery:
//   five_hour            18%  -> not the issue
//   seven_day            62%  -> not the issue (web chat keeps working)
//   seven_day_oauth_apps 100% -> THIS IS WHY CLAUDE CODE STOPPED
//
// The CLI threw this detail away. The endpoint did not.`;

const recoverySteps = [
  {
    title: "Commit the half-done work first.",
    description:
      "Run git commit -am 'WIP: refactor checkpoint' so the work is recoverable from disk. Claude Code's next session reads from git diff; if you skip the commit and the editor crashes, the wall cost you the work too.",
  },
  {
    title: "Read which bucket fired.",
    description:
      "Inside Claude Code, type /usage. Outside it, curl the OAuth endpoint with the token from your Keychain (snippet above) or open ClaudeMeter's popup. Whichever bucket is at 100% is the one that walled you. seven_day_oauth_apps at 100% with seven_day at 30% explains why claude.ai web chat still works.",
  },
  {
    title: "Defer model-specific work.",
    description:
      "If seven_day_opus is at 100% but seven_day_sonnet is at 60%, drop to Sonnet for the rest of the cycle. Most of a refactor is mechanical (rename, move, adjust import, update test) and Sonnet handles it at a fraction of the weekly cost. Reserve Opus for the genuinely hard subproblems on the next reset.",
  },
  {
    title: "Sleep on resets_at, not on a guess.",
    description:
      "The clock is rolling, so 'try again in 4 hours' is wrong. Wrap the next batch in a four-line bash guard that reads the resets_at field of the bucket that fired and sleeps until that exact timestamp plus 30 seconds of grace. Two parallel agents in different shells converge on the same wake-up because resets_at is absolute UTC, not a relative duration.",
  },
];

const guardScript = `#!/usr/bin/env bash
# weekly_wall_guard.sh — sleep until the bucket that fired actually lifts,
# not until an arbitrary "+4h" guess.

set -euo pipefail

TOKEN=$(security find-generic-password -s "Claude Code-credentials" -w \\
  | jq -r '.claudeAiOauth.accessToken')

JSON=$(curl -sS https://api.anthropic.com/api/oauth/usage \\
  -H "Authorization: Bearer $TOKEN")

# Pick whichever bucket is hottest and sleep on ITS resets_at.
RESET=$(echo "$JSON" | jq -r '
  [
    {b:"five_hour",            u:.five_hour.utilization,            r:.five_hour.resets_at},
    {b:"seven_day",            u:.seven_day.utilization,            r:.seven_day.resets_at},
    {b:"seven_day_sonnet",     u:.seven_day_sonnet.utilization,     r:.seven_day_sonnet.resets_at},
    {b:"seven_day_opus",       u:.seven_day_opus.utilization,       r:.seven_day_opus.resets_at},
    {b:"seven_day_oauth_apps", u:.seven_day_oauth_apps.utilization, r:.seven_day_oauth_apps.resets_at}
  ]
  | map(select(.u >= 0.95))
  | sort_by(.r) | .[0].r // empty
')

if [ -n "$RESET" ]; then
  echo "blocked; sleeping until $RESET (+30s)"
  python3 -c "import datetime, time; \\
    t = datetime.datetime.fromisoformat('$RESET'.replace('Z', '+00:00')); \\
    now = datetime.datetime.now(datetime.timezone.utc); \\
    time.sleep(max(0, (t - now).total_seconds()) + 30)"
fi`;

const cliVsServerRows = [
  {
    feature: "Names which weekly bucket walled you",
    competitor: "No. One generic 'rate_limit_error: ... limit reached' string for all seven weekly buckets and the 5-hour bucket.",
    ours: "Yes. Each bucket has its own utilization float and its own resets_at timestamp; the bucket at 100% is the one that fired.",
  },
  {
    feature: "Says when the wall lifts",
    competitor: "No precise resets_at in the inline error. The /usage slash command shows it if you remember to run it.",
    ours: "Yes. Absolute UTC timestamp on every bucket, polled every 60 seconds. Two parallel agents converge on the same wake-up moment.",
  },
  {
    feature: "Separates Claude Code traffic from web chat",
    competitor: "No bucket-level visibility in the CLI. You have to guess from context why web chat still works while the terminal is blocked.",
    ours: "seven_day_oauth_apps is its own field. If it is the one at 100%, web chat keeps working; that explains the asymmetric block.",
  },
  {
    feature: "Reports extra-usage dollar balance",
    competitor: "Inline error does not mention it. extra_usage is on a different endpoint (/overage_spend_limit).",
    ours: "extra_usage row on the same /usage response. monthly_limit, used_credits, is_enabled, currency all read in one call.",
  },
  {
    feature: "Aggregates across multiple Claude accounts on one machine",
    competitor: "Per-CLI-process only. The CLI you ran has no idea another shell is racing for the same weekly bucket on the same account.",
    ours: "dedupe_by_account in lib.rs collapses snapshots from OAuth + cookies + multiple browsers into one row per account.",
  },
];

const relatedPosts = [
  {
    title: "Why Max Users Still Hit Limits: Eight Buckets, Not One",
    excerpt:
      "Anthropic enforces eight independent server-side gates. Max raises caps; it does not collapse them. Triage which one fired in 60 seconds.",
    href: "/t/claude-max-plan-still-hitting-limits",
    tag: "Buckets",
  },
  {
    title: "Hours Are a Vibes Metric, the Server Enforces a Float",
    excerpt:
      "Anthropic publishes weekly caps as 40 to 480 Sonnet hours by plan. The cap your account hits is a utilization float between 0.0 and 1.0. Here is the real contract.",
    href: "/t/claude-code-weekly-cap-reality",
    tag: "Quota",
  },
  {
    title: "ccusage at 5%, claude.ai at 91%: the predictable mismatch",
    excerpt:
      "Local-log tools count tokens that left your machine. Plan limits are utilization fractions on the server. Why they disagree, which one to trust.",
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
                "The Claude Code Weekly Quota Wall: Claude Code Already Knows, It Just Won't Tell You",
              description:
                "When Claude Code hits the weekly quota wall, the CLI prints a generic rate_limit_error string. The credentials and the endpoint that would name the bucket are already on your machine. Here is what the CLI hides and how to read it yourself.",
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
            The Claude Code weekly quota wall:{" "}
            <GradientText variant="teal">
              Claude Code already knows
            </GradientText>
            , it just will not tell you.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-zinc-700 leading-relaxed">
            The CLI just emitted{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">
              rate_limit_error: limit reached
            </code>{" "}
            and stopped your loop. claude.ai web chat in the other tab still
            works, which is confusing. The credentials and the endpoint that
            would name the bucket that walled you are already on your machine.
            Here is what the CLI threw away and how to read it.
          </p>

          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="6 min read"
          />

          <div className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Direct answer (verified 2026-05-10)
            </div>
            <p className="mt-2 text-zinc-800 leading-relaxed">
              The Claude Code weekly quota wall is Anthropic&apos;s rolling
              168-hour per-account ceiling. The server returns seven weekly
              buckets on{" "}
              <code className="rounded bg-white px-1.5 py-0.5">
                /api/organizations/{"{org}"}/usage
              </code>{" "}
              (and on{" "}
              <code className="rounded bg-white px-1.5 py-0.5">
                api.anthropic.com/api/oauth/usage
              </code>{" "}
              for OAuth clients). The CLI 429s the moment any one of them
              crosses utilization 1.0, but the inline error string does not
              name the bucket. Pull the access token Claude Code already
              stashed in macOS Keychain under service{" "}
              <code className="rounded bg-white px-1.5 py-0.5">
                Claude Code-credentials
              </code>
              , hit the OAuth usage endpoint, and you will see which one
              fired plus the absolute UTC{" "}
              <code className="rounded bg-white px-1.5 py-0.5">
                resets_at
              </code>{" "}
              when it lifts. ClaudeMeter is the open-source menu bar app that
              polls that endpoint every 60 seconds for you; source at{" "}
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

      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
            The terminal moment
          </h2>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            This is the exact UX of hitting the weekly wall mid-loop. Read
            line 5 carefully: no bucket name, no{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              resets_at
            </code>
            , no indication that{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              seven_day_oauth_apps
            </code>{" "}
            is the one that fired and not{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              seven_day
            </code>{" "}
            (which is why your web tab still works).
          </p>
          <div className="mt-5">
            <TerminalOutput
              title="claude code session, the wall fires"
              lines={wallTerminal}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
            What Claude Code already has on your machine
          </h2>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            Claude Code authenticated you with an OAuth flow at install time.
            The credentials it received are sitting in your macOS Keychain
            right now, under a single keychain item. The shape:
          </p>
          <div className="mt-5">
            <AnimatedCodeBlock
              filename="Keychain item: service = 'Claude Code-credentials'"
              language="json"
              code={keychainBlob}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two fields matter for the wall.{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              accessToken
            </code>{" "}
            is what authorizes calls to{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              api.anthropic.com
            </code>
            ; the scope{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              user:profile
            </code>{" "}
            is enough to read your own usage. And{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              rateLimitTier
            </code>{" "}
            tells you which cap row to read against (Max 20x users see{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              default_claude_max_20x
            </code>{" "}
            here). Claude Code wrote both. Claude Code is choosing not to
            show them inline when the wall fires.
          </p>
        </section>

        <ProofBanner
          quote="The CLI prints one error string. The endpoint behind it returns seven utilization floats and seven reset timestamps. Same auth, same machine, two different surfaces."
          source="src/oauth.rs, github.com/m13v/claude-meter"
          metric="7 buckets"
        />

        <section className="mt-14">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
            The endpoint Claude Code reads but does not surface
          </h2>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            The same token authorizes a GET on{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              https://api.anthropic.com/api/oauth/usage
            </code>
            . You can call it from a terminal in about ten seconds without
            installing anything else.
          </p>
          <div className="mt-5">
            <AnimatedCodeBlock
              filename="check-claude-code-wall.sh"
              language="bash"
              code={curlUsage}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The response on a wall-fired account looks like this. The bucket
            that walled you is whichever{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              utilization
            </code>{" "}
            is at 1.0 (or 100 on payloads that ship 0 to 100 instead of 0 to 1).
          </p>
          <div className="mt-5">
            <AnimatedCodeBlock
              filename="response from /api/oauth/usage"
              language="json"
              code={sampleResponse}
            />
          </div>
        </section>

        <section className="mt-14">
          <ComparisonTable
            heading="What the CLI shows vs what the endpoint returns"
            productName="api.anthropic.com/api/oauth/usage"
            competitorName="Claude Code CLI error string"
            rows={cliVsServerRows}
          />
        </section>

        <section className="mt-14">
          <StepTimeline
            title="What to do in the next 60 seconds"
            steps={recoverySteps}
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
            Wrap the next batch in a guard that sleeps on resets_at
          </h2>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            Sleeping on a guess wastes minutes you could have been coding,
            because the rolling window does not refill on the hour. The
            absolute UTC timestamp on the bucket that fired tells you exactly
            when the oldest still-counted message ages out. Sleep on that
            plus a 30-second grace and the next batch lands the second the
            wall lifts.
          </p>
          <div className="mt-5">
            <AnimatedCodeBlock
              filename="weekly_wall_guard.sh"
              language="bash"
              code={guardScript}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two parallel agents in two shells will converge on the same wake-up
            moment because the timestamp is absolute UTC, not a relative
            duration. ClaudeMeter packages the same logic in a menu bar app so
            you do not have to maintain the shell script; the bar shows the
            hottest bucket continuously and the popup names which one is at
            100% the moment it crosses.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
            Why this matters for parallel Claude Code sessions
          </h2>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            Running five Claude Code agents in five worktrees does not get you
            five separate weekly quotas. The{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              seven_day_oauth_apps
            </code>{" "}
            bucket is per-account, not per-process. Five agents in five panes
            stack into the same utilization float. Each individual CLI sees
            only its own 429 and prints the same generic error string; none of
            them knows about the others. The OAuth usage endpoint is the only
            place the per-account number is visible to any one shell, which is
            why a single menu bar reader that polls it once per minute beats
            five independent CLIs that learn about the wall after they hit it.
          </p>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            ClaudeMeter&apos;s{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              dedupe_by_account
            </code>{" "}
            in src/lib.rs collapses snapshots that share{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              account_email
            </code>{" "}
            or{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
              org_uuid
            </code>{" "}
            into one row, so the popup shows the one shared percent every
            parallel agent on that account is racing to fill.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want help wiring this into your Claude Code loop?"
          description="20 minutes with the team. We walk through your weekly burn, install ClaudeMeter, and drop the wall-guard script into your wrapper."
        />

        <section className="mt-14">
          <FaqSection items={faqs} heading="Frequently asked" />
        </section>

        <section className="mt-14">
          <RelatedPostsGrid
            title="Adjacent reading"
            posts={relatedPosts}
          />
        </section>
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Talk to the team about your weekly burn."
      />
    </article>
  );
}
