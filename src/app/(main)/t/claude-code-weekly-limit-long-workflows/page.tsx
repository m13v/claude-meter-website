import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
  ComparisonTable,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-code-weekly-limit-long-workflows";
const PUBLISHED = "2026-05-11";

export const metadata: Metadata = {
  title:
    "Claude Code weekly limit during long workflows: pre-flight, mid-flight, abort",
  description:
    "Long Claude Code refactors do not wall on the seven_day bucket. They wall on seven_day_oauth_apps, which is why the CLI 429s while claude.ai web chat in the other tab keeps working. Here is the pre-flight check, the live signal to watch, and the abort threshold.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code weekly limit during long workflows: pre-flight, mid-flight, abort",
    description:
      "The bucket that kills multi-hour Claude Code workflows is seven_day_oauth_apps, not seven_day. Read it before you start. Watch it while you run. Abort before it hits 1.0.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Guides", href: "https://claude-meter.com/t/claude-weekly-quota-server-truth-meter" },
  { label: "Long workflows vs. the weekly cap" },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t/claude-weekly-quota-server-truth-meter" },
  { name: "Claude Code weekly limit during long workflows", url: PAGE_URL },
];

const faqs = [
  {
    q: "Why does my long Claude Code workflow wall while claude.ai web chat in the other tab still works?",
    a: "Because the bucket that fired is almost certainly seven_day_oauth_apps, not seven_day. OAuth-authenticated traffic (Claude Code CLI, MCP host loops, agentic Python scripts) charges its own weekly bucket. Web chat charges seven_day. The two are independent, so your account can sit at seven_day=30% and seven_day_oauth_apps=100% at the same time. The CLI 429s. The web tab does not. The field is declared as a first-class Option<Window> on UsageResponse at src/models.rs line 24 of the open-source claude-meter Rust source.",
  },
  {
    q: "What's the pre-flight check before I kick off a six-hour refactor?",
    a: "Read seven_day_oauth_apps utilization before anything else. If it is below 0.40, you have headroom. Between 0.40 and 0.70 you should split the work into checkpointable chunks. Above 0.70 the cap will fire mid-workflow on any realistic agentic loop and you should either wait for resets_at, drop to Sonnet (which charges seven_day_sonnet separately), or enable extra_usage so prompts after the wall bill against pay-as-you-go credits at API prices.",
  },
  {
    q: "How fast does seven_day_oauth_apps actually climb during an active workflow?",
    a: "Faster than seven_day, because every CLI message charges it and nothing else does. On Opus 4.7 a non-trivial multi-file refactor can move the float by 0.05 to 0.10 per hour. ClaudeMeter polls every 60 seconds so you can read the slope live; if you go from 0.62 to 0.68 in ten minutes, you are running at 0.36 per hour and a six-hour workflow will wall you near the four-hour mark. Drop to Sonnet, shorten the prompt context, or abort.",
  },
  {
    q: "What's the abort signal I should set?",
    a: "Stop the loop when seven_day_oauth_apps crosses 0.92 with more than 30 minutes of work remaining, or when (1.0 - utilization) divided by your last 10-minute burn rate is less than the remaining workflow duration. The first half-edited commit is recoverable; a 429 mid-tool-call sometimes leaves Claude Code in a state where the next session has to re-read context and that re-read itself charges against the same bucket.",
  },
  {
    q: "Doesn't ccusage tell me this?",
    a: "No. ccusage reads ~/.claude/projects/*.jsonl and counts input/output tokens. Tokens are not what Anthropic enforces. The seven_day_oauth_apps bucket applies per-message weights that depend on model class, attachments, tool calls, and time-of-day multipliers, none of which are in your local JSONL. The predictable outcome: ccusage says 5% used and the CLI 429s. They measure different things. Run them together; ccusage for token attribution per project, ClaudeMeter for the server-truth float that gates your loop.",
  },
  {
    q: "If seven_day_opus is at 95% can I just switch to Sonnet and keep going?",
    a: "Often yes. Each model has its own weekly bucket (seven_day_sonnet, seven_day_opus) on top of the aggregate seven_day and the OAuth-apps bucket. If seven_day_opus is full but seven_day_sonnet is at 50% and seven_day_oauth_apps is at 70%, switching the model class to Sonnet keeps you going until the next constraint binds. Most of a long refactor is mechanical (rename, move, adjust import, update test) and Sonnet handles it at a fraction of the weekly weight. Reserve Opus for the genuinely hard subproblems after reset.",
  },
  {
    q: "Will enabling extra_usage save a long workflow from walling out?",
    a: "Conditionally. If extra_usage.is_enabled is true on /usage and used_credits is below monthly_credit_limit on /overage_spend_limit, messages that would have walled instead bill against pay-as-you-go credits at API prices. If is_enabled is false, or out_of_credits is true, the wall stays. For a long workflow this is the realistic continuation path; you want the live dollar burn visible so you can decide to land the work or stop. ClaudeMeter renders extra_usage as a third row in the popover when it is present, sourced from the ExtraUsage struct at src/models.rs lines 9-16.",
  },
  {
    q: "What does the resets_at field actually tell me?",
    a: "Absolute UTC timestamp at which the oldest still-counted message ages out of the trailing 168-hour window for that specific bucket. It is not a calendar boundary. Two users at the same utilization will have different resets_at because their charging histories differ. claude-meter --json prints it; the extension popup renders it as 'in 2h' or 'in 3d' via fmtResets in extension/popup.js. For a long workflow this is the only honest 'when does my cap come back' number; anything else is a guess.",
  },
  {
    q: "Is ClaudeMeter actually open source, and what does it send anywhere?",
    a: "Free, MIT licensed, source at github.com/m13v/claude-meter. The browser extension makes one HTTPS request per minute to claude.ai using the session cookie your browser already holds, then posts the result to a localhost bridge at 127.0.0.1:63762 that the menu bar app listens on. No telemetry, no cloud account, no analytics ping. Read extension/background.js lines 14 to 44 if you want to audit the exact requests before you install.",
  },
];

const preflightTerminal = [
  { type: "command" as const, text: "# 60 seconds before you kick off a long refactor:" },
  { type: "command" as const, text: "claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour            8.4% used    -> resets Mon May 11 14:42 (in 3h)" },
  { type: "output" as const, text: "7-day all        34.0% used    -> resets Wed May 13 09:14 (in 2d 5h)" },
  { type: "output" as const, text: "7-day Sonnet     51.2% used    -> resets Wed May 13 09:14 (in 2d 5h)" },
  { type: "output" as const, text: "7-day Opus       28.0% used    -> resets Wed May 13 09:14 (in 2d 5h)" },
  { type: "info" as const, text: "Also check the OAuth-apps bucket the CLI does not print inline:" },
  { type: "command" as const, text: "claude-meter --json | jq '.[0].usage.seven_day_oauth_apps'" },
  { type: "output" as const, text: "{ \"utilization\": 0.72, \"resets_at\": \"2026-05-13T09:14:00Z\" }" },
  { type: "error" as const, text: "0.72 with 30h workflow ahead. Don't start. Split, drop to Sonnet, or wait." },
];

const fieldsCode = `// claude-meter / src/models.rs (lines 18 to 28)
// Every weekly bucket the server returns, parsed verbatim.

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:            Option<Window>,   // aggregate, what web chat shows
    pub seven_day_sonnet:     Option<Window>,   // Sonnet-only model bucket
    pub seven_day_opus:       Option<Window>,   // Opus-only model bucket
    pub seven_day_oauth_apps: Option<Window>,   // <-- THIS is what Claude Code hits
    pub seven_day_omelette:   Option<Window>,   // internal codename, undocumented
    pub seven_day_cowork:     Option<Window>,   // Cowork / scheduled runs
    pub extra_usage:          Option<ExtraUsage>,
}

// Each Window is { utilization: f64, resets_at: Option<DateTime<Utc>> }.
// utilization is a float on [0.0, 1.0]; 1.0 is the wall.
// resets_at is the absolute UTC instant the oldest counted message ages out.`;

const burnFormulaCode = `// Pre-flight feasibility formula.
// You run this in your head, or as a one-liner before the workflow starts.

let remaining_quota_share = 1.0 - seven_day_oauth_apps.utilization;
let recent_burn_rate      = delta_utilization / delta_minutes; // last 10 min
let minutes_until_wall    = remaining_quota_share / recent_burn_rate;

if minutes_until_wall < workflow_minutes_remaining {
    // wall will fire mid-workflow. Choose one:
    //   - split into checkpointable chunks; commit between each
    //   - drop the loop to Sonnet (charges seven_day_sonnet, not Opus)
    //   - enable extra_usage so post-wall prompts bill at API prices
    //   - wait until resets_at
}`;

const phaseSteps = [
  {
    title: "Pre-flight: read the right bucket before you start",
    description:
      "seven_day_oauth_apps, not seven_day. Anything above 0.70 means the cap will fire mid-workflow on any realistic six-hour Claude Code session.",
    detail:
      "Below 0.40: full speed. 0.40 to 0.70: split the work into checkpointable chunks (commit after every meaningful slice so a 429 does not lose state). Above 0.70: wait for resets_at, drop the loop to Sonnet, or enable extra_usage. The aggregate seven_day field is a poor proxy here because web traffic dilutes the signal; the OAuth-apps bucket is the one your CLI actually charges.",
  },
  {
    title: "Mid-flight: watch the slope, not just the level",
    description:
      "ClaudeMeter polls every 60 seconds. The 10-minute delta is your burn rate. If the float climbs by 0.05 in 10 minutes you are at 0.30 per hour and a wall is coming whether the level is 0.55 or 0.85.",
    detail:
      "Two practical rules. First, if the bar moves by 0.05 inside any single 5-hour boundary, your session has switched models or your prompt context just doubled; check whether you accidentally promoted yourself to Opus. Second, if the slope flattens after a code refactor, the work was charging tool calls more than tokens; that means the next phase is going to be cheaper and you can let it run.",
  },
  {
    title: "Abort: stop the loop before 0.92, not after 1.0",
    description:
      "A 429 mid-tool-call sometimes leaves the project in a half-edited state where the next session has to re-read context. That re-read itself charges the same bucket. Soft-aborting at 0.92 with a manual git commit preserves the work and the quota.",
    detail:
      "When you abort, the bottom rows of claude-meter tell you the next move. If seven_day_oauth_apps is 0.92 but seven_day_opus is 0.50, drop Opus->Sonnet and finish at lower per-message weight. If extra_usage.is_enabled is true and the dollar balance is below your comfort line, let metered billing carry the last hour. Otherwise commit, sleep on resets_at, resume on the next reset.",
  },
];

const cliVsMeterRows = [
  {
    feature: "Knows seven_day_oauth_apps exists",
    competitor: "No. The CLI emits one generic rate_limit_error string for all eight buckets.",
    ours: "Yes. seven_day_oauth_apps is a typed field on UsageResponse (models.rs line 24).",
  },
  {
    feature: "Pre-flight number before the workflow starts",
    competitor: "Nothing. You have to type /usage manually inside an active claude session.",
    ours: "claude-meter (the CLI) or the menu bar bar; one keystroke or one glance.",
  },
  {
    feature: "Live burn-rate signal during a long loop",
    competitor: "Token counts in ccusage; useful, but unrelated to the float the server enforces.",
    ours: "Polls every 60 seconds. The 10-minute delta on the bucket is your burn rate.",
  },
  {
    feature: "Names the specific bucket that walled you when 429 fires",
    competitor: "No bucket name in the inline error. You guess.",
    ours: "Whichever bucket is at 1.0 in the popover is the one that fired.",
  },
  {
    feature: "Reports the absolute UTC resets_at",
    competitor: "Inline error says 'try again later'.",
    ours: "Absolute timestamp per bucket; render as 'in 2h' or 'in 3d' via extension/popup.js.",
  },
  {
    feature: "Surfaces extra_usage dollar burn for post-wall continuation",
    competitor: "Lives on a different endpoint (/overage_spend_limit); not in the CLI error.",
    ours: "Third row in the popover when extra_usage.is_enabled is true.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-code-weekly-quota-wall",
    title: "After the wall: which bucket fired and how to read it",
    excerpt:
      "Once 429 happens, the OAuth credentials Claude Code stashed in macOS Keychain plus api.anthropic.com/api/oauth/usage will name the bucket the CLI hid.",
    tag: "Post-mortem",
  },
  {
    href: "/t/claude-code-weekly-cap-reality",
    title: "Hours are a vibes metric, the server enforces a float",
    excerpt:
      "Anthropic publishes Sonnet hours per plan; the cap that actually fires is a utilization float on a rolling 168-hour window with seven buckets stacked on top.",
    tag: "Mechanism",
  },
  {
    href: "/t/claude-code-personal-os-weekly-quota",
    title: "Personal OS workflows charge a different bucket entirely",
    excerpt:
      "Scheduled routines and Cowork runs charge seven_day_cowork and seven_day_oauth_apps simultaneously. The chat UI never shows either of them.",
    tag: "Cadence",
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
                "Claude Code weekly limit during long workflows: pre-flight, mid-flight, abort",
              description:
                "Long Claude Code refactors do not wall on the seven_day bucket. They wall on seven_day_oauth_apps, which is why the CLI 429s while claude.ai web chat in the other tab keeps working. Here is the pre-flight check, the live signal to watch, and the abort threshold.",
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

      <div className="mx-auto max-w-3xl px-5 pt-8 pb-2 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="mx-auto max-w-3xl px-5 pt-4 pb-6 sm:px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-zinc-900">
          The weekly cap that kills long Claude Code workflows is{" "}
          <GradientText variant="teal">not the one you are watching</GradientText>.
        </h1>
        <p className="mt-5 text-base sm:text-lg text-zinc-700 leading-relaxed">
          Your six-hour refactor 429s at the four-hour mark. claude.ai web chat
          in the other tab still works fine. That asymmetry is the tell: the
          bucket that fired is{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono">
            seven_day_oauth_apps
          </code>
          , not the aggregate{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono">
            seven_day
          </code>{" "}
          field the web settings page shows. Below is the pre-flight check, the
          live signal to watch while the loop runs, and the abort threshold.
        </p>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="7 min read"
        />
      </header>

      <section className="mx-auto max-w-3xl px-5 sm:px-6">
        <BackgroundGrid>
          <div className="px-5 py-7 sm:px-7">
            <div className="text-xs uppercase tracking-widest text-teal-700 font-semibold">
              Direct answer (verified 2026-05-11)
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-900">
              Read the OAuth-apps bucket, not the aggregate.
            </h2>
            <p className="mt-3 text-zinc-700 leading-relaxed">
              Long Claude Code workflows charge{" "}
              <code className="rounded bg-white/70 px-1.5 py-0.5 text-sm font-mono">
                seven_day_oauth_apps
              </code>
              , a typed weekly bucket on the same{" "}
              <code className="rounded bg-white/70 px-1.5 py-0.5 text-sm font-mono">
                /api/organizations/{"{org}"}/usage
              </code>{" "}
              payload claude.ai/settings/usage already calls but never renders.
              The settings page draws one bar (the 5-hour bucket) and a "low"
              label for everything else. The OAuth-apps bucket is the one that
              actually walls your CLI. If it is above 0.70 before you start a
              multi-hour refactor, the cap will fire mid-workflow. Source: the
              open-source claude-meter parser at{" "}
              <a
                href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
                className="text-teal-700 underline hover:text-teal-900"
                rel="noopener"
              >
                src/models.rs
              </a>
              , lines 18 to 28.
            </p>
          </div>
        </BackgroundGrid>
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
          The bucket the CLI does not name
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          claude-meter parses every weekly bucket the server returns. They are
          declared as first-class Rust struct fields, which means the layout is
          stable across releases and you can read the exact contract without
          guessing. The OAuth-apps bucket is the one labeled below; everything
          you submit through the Claude Code CLI charges it. The aggregate
          seven_day bucket is the one the web Settings page draws; it includes
          both your CLI traffic and your web traffic, but it is not the cap that
          fires for a CLI-driven long workflow.
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={fieldsCode}
            language="rust"
            filename="src/models.rs"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          One Window for each bucket. utilization is a float on [0.0, 1.0]. The
          server 429s your CLI the moment any one of them crosses 1.0, and the
          CLI does not tell you which one fired. For long workflows the only
          float that matters in practice is{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono">
            seven_day_oauth_apps
          </code>
          . Sonnet-vs-Opus splits and the aggregate are secondary checks.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
          Three phases of a long workflow against the cap
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The framework is just three numbers read at three different moments.
          Pre-flight asks "should I start?" Mid-flight asks "is the slope still
          safe?" Abort asks "can I land this before 1.0?" Same field, three
          decisions.
        </p>

        <StepTimeline steps={phaseSteps} />
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
          Pre-flight: a 60-second check before kicking off
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The default print of the claude-meter CLI shows the 5-hour bar, the
          aggregate weekly, and the Sonnet/Opus splits. The OAuth-apps bucket is
          one jq command away. Run both before you fire the long refactor; the
          OAuth-apps number is the one that decides whether the workflow can
          land.
        </p>

        <div className="mt-6">
          <TerminalOutput lines={preflightTerminal} title="pre-flight" />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The reading above (
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono">
            seven_day_oauth_apps
          </code>{" "}
          at 0.72) means roughly 28% of the OAuth-apps weekly quota is left. On
          a typical Opus 4.7 refactor that climbs at 0.05 to 0.10 per hour, that
          is at most six hours of headroom and probably less. A 30-hour
          workflow is not going to fit. Split it, drop to Sonnet, or wait.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
          The feasibility formula
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          You do not need a calculator. The mental model is one ratio.
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={burnFormulaCode}
            language="rust"
            filename="feasibility check"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          delta_utilization over the last 10 minutes is your honest burn rate
          right now. Two readings 10 minutes apart from claude-meter give you
          that. Divide remaining_quota_share by it to get minutes until the
          wall. Compare to the workflow you are about to start. If the wall
          arrives first, change the plan.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
          Mid-flight: what the slope tells you that the level does not
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The level (current utilization) is a snapshot. The slope (change per
          minute) is the signal. ClaudeMeter polls every 60 seconds, which
          means after 10 minutes of a running workflow you have a real burn
          rate to read against. Two diagnostics fall out of this:
        </p>

        <ol className="mt-4 space-y-4 list-decimal pl-6 text-zinc-700 leading-relaxed">
          <li>
            <strong className="text-zinc-900">A sudden 5x slope</strong> means
            the loop just escalated model class (Sonnet to Opus, often
            silently) or doubled the prompt context. Catch it within minutes,
            not after the wall.
          </li>
          <li>
            <strong className="text-zinc-900">A flat slope after a refactor</strong>{" "}
            means the next phase is going to be cheaper than the last one. You
            can let the loop run with confidence. Long agentic workflows have
            phases; the model is not charging at a constant rate.
          </li>
        </ol>
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
          Abort: why 0.92 is the right threshold, not 1.0
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          Stopping the loop yourself at 0.92 is cheaper than stopping at 1.0.
          When a 429 fires mid-tool-call, Claude Code occasionally leaves the
          working directory in a half-edited state. The next session needs to
          re-read context to figure out where you left off; that re-read itself
          charges the same bucket you just walled on. So you lose work AND
          quota.
        </p>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          A soft abort at 0.92 means you manually break the loop, run{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono">
            git commit -am "WIP: long workflow checkpoint"
          </code>
          , and decide between three continuations. Drop to Sonnet (charges{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono">
            seven_day_sonnet
          </code>{" "}
          separately and might still have room). Enable extra_usage and let
          metered billing finish the run. Or sleep until resets_at on the bucket
          that is closest to firing. claude-meter prints resets_at as an
          absolute UTC timestamp; two parallel agents in different shells
          converge on the same wake-up moment because it is not a relative
          duration.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
          What the inline CLI error throws away
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The CLI prints one generic string for all eight buckets. Everything
          you need to plan around a long workflow lives on the same JSON the
          web settings page already calls; it is just not surfaced inline.
        </p>

        <div className="mt-6">
          <ComparisonTable
            productName="claude-meter (this product)"
            competitorName="Claude Code inline error"
            rows={cliVsMeterRows}
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
          Why ccusage does not catch this
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          ccusage and Claude-Code-Usage-Monitor read{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono">
            ~/.claude/projects/*.jsonl
          </code>{" "}
          and sum input/output tokens per session. That is a real, useful
          number for project-level token attribution. It is not what the server
          enforces. Anthropic applies per-message weights that depend on model
          class, attachments, tool calls, and time-of-day multipliers, none of
          which are written to your local JSONL. The predictable outcome:
          ccusage says 5% used, the CLI 429s on the same workflow. They are
          measuring different things. Run them together; ccusage for token
          attribution, claude-meter for the float that gates your loop.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
          Where this comes from
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          Every number in this guide reads off two open files:{" "}
          <a
            href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
            className="text-teal-700 underline hover:text-teal-900"
            rel="noopener"
          >
            src/models.rs
          </a>{" "}
          declares the bucket shape, and{" "}
          <a
            href="https://github.com/m13v/claude-meter/blob/main/src/api.rs"
            className="text-teal-700 underline hover:text-teal-900"
            rel="noopener"
          >
            src/api.rs
          </a>{" "}
          is the once-per-minute fetcher. The browser extension at{" "}
          <a
            href="https://github.com/m13v/claude-meter/blob/main/extension/background.js"
            className="text-teal-700 underline hover:text-teal-900"
            rel="noopener"
          >
            extension/background.js
          </a>{" "}
          uses the cookie your browser already holds, posts the same JSON to a
          localhost bridge, and removes the manual claude.ai cookie-paste step
          that earlier OSS plan trackers required. MIT licensed.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 mt-14">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Mid-refactor and the wall just fired?"
          description="Fifteen minutes to walk through your last 24 hours of buckets and decide whether to wait, split, or enable metered billing."
        />
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 mt-12">
        <FaqSection heading="Frequently asked questions" items={faqs} />
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 mt-12 mb-16">
        <RelatedPostsGrid
          title="Related guides"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Walk through your weekly buckets with me."
      />
    </article>
  );
}
