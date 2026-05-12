import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  BeforeAfter,
  ComparisonTable,
  StepTimeline,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-code-goal-feature-weekly-quota-burn";
const PUBLISHED = "2026-05-11";

export const metadata: Metadata = {
  title:
    "Claude Code /goal feature: why it burns the weekly quota faster",
  description:
    "/goal lets Claude Code run unattended turn after turn until a Haiku-evaluated condition is met. Anthropic doubled the 5-hour cap in May 2026 but left the weekly cap unchanged, so /goal sessions wall on seven_day_oauth_apps days earlier than interactive use. Here is the math, the bucket to watch, and the guards.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code /goal weekly quota burn (and the bucket to watch)",
    description:
      "/goal removes the per-turn human checkpoint. Five-hour cap doubled, weekly cap did not. The seven_day_oauth_apps utilization float is the live signal that tells you the wall is coming.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  {
    name: "Guides",
    url: "https://claude-meter.com/t/claude-weekly-quota-server-truth-meter",
  },
  { name: "Claude Code /goal weekly quota burn", url: PAGE_URL },
];

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  {
    label: "Guides",
    href: "https://claude-meter.com/t/claude-weekly-quota-server-truth-meter",
  },
  { label: "Claude Code /goal weekly quota burn" },
];

const interactiveLane = {
  label: "Interactive Claude Code",
  content:
    "You read the diff, you decide what to ask next, you accept or reject the next tool call. Each turn has a free human checkpoint. If the model goes off the rails, you stop it on turn 3, not turn 30. Weekly burn is naturally throttled by your reading speed.",
  highlights: [
    "One human read between every main-model call.",
    "Easy to abandon a bad path after a few turns.",
    "seven_day_oauth_apps creeps up at the rate you can review.",
  ],
};

const goalLane = {
  label: "Claude Code with /goal",
  content:
    "/goal sets a completion condition. After every turn, a small evaluator model returns yes or no on whether the condition is met. No means another turn fires, with the evaluator's reason as guidance. The main model can run dozens of turns before you look up. The 5-hour cap doubled in May 2026; the weekly cap did not.",
  highlights: [
    "No per-turn human checkpoint; the loop runs until the evaluator says yes.",
    "Bad paths cost full turns of Opus, not seconds of your reading time.",
    "seven_day_oauth_apps walls days earlier than the same workload run interactively.",
  ],
};

const goalCommand = `# Set a completion condition. Claude keeps working
# until the evaluator (Haiku by default) says yes.
> /goal the test suite passes and the diff is committed

# Status indicator appears in the prompt:
◎ /goal active

# Inspect spend so far on this goal:
> /goal
turns: 17  tokens: 142,318

# Cancel before the wall hits you:
> /goal clear`;

const goalDocsQuote = `# From https://code.claude.com/docs/en/goal
"After each turn, the evaluator (a small fast model, typically Haiku)
 receives the conversation and the condition and returns yes/no plus a
 short reason. Evaluator token cost is typically negligible."

# What the docs do not say: the main-model spend is not negligible.
# Each turn the evaluator answers "no", a full Opus turn fires next.`;

const usageTerminal = [
  {
    type: "command" as const,
    text: "claude-meter --json | jq '.usage'",
  },
  {
    type: "output" as const,
    text: '"five_hour":            { "utilization": 0.41, "resets_at": "2026-05-11T19:08:00Z" },',
  },
  {
    type: "output" as const,
    text: '"seven_day":            { "utilization": 0.58, "resets_at": "2026-05-13T11:22:00Z" },',
  },
  {
    type: "output" as const,
    text: '"seven_day_opus":       { "utilization": 0.79, "resets_at": "2026-05-13T11:22:00Z" },',
  },
  {
    type: "output" as const,
    text: '"seven_day_oauth_apps": { "utilization": 0.93, "resets_at": "2026-05-13T11:22:00Z" },',
  },
  {
    type: "info" as const,
    text: "seven_day_oauth_apps is the bucket that fires when /goal sessions stack up. Watch this one.",
  },
];

const capAsymmetryRows = [
  {
    feature: "Per-turn human checkpoint",
    ours: "Yes (you decide what to ask next)",
    competitor: "No (evaluator decides)",
  },
  {
    feature: "5-hour cap (doubled May 2026)",
    ours: "Generous; rarely the binding constraint",
    competitor: "Generous; rarely the binding constraint",
  },
  {
    feature: "Weekly cap (unchanged May 2026)",
    ours: "Throttled by your reading speed",
    competitor: "Throttled by the evaluator's stop signal",
  },
  {
    feature: "Bucket that walls Claude Code",
    ours: "seven_day_oauth_apps",
    competitor: "seven_day_oauth_apps (same, sooner)",
  },
  {
    feature: "Cost of a bad path",
    ours: "Seconds of your reading time",
    competitor: "Full Opus turns until the evaluator notices",
  },
  {
    feature: "Live visibility into weekly burn",
    ours: "/usage costs a turn; meter is ambient",
    competitor: "/usage breaks the goal; meter is the only honest option",
  },
];

const guardSteps = [
  {
    title: "Set a turn budget in the condition itself",
    description:
      "/goal accepts up to 4,000 characters. Spend some of them on a stop clause. 'The test suite passes and the diff is committed, OR you have made 12 attempts.' The evaluator counts attempts and returns yes when the budget is hit.",
  },
  {
    title: "Route the main model to Sonnet, not Opus",
    description:
      "Opus turns are the heaviest line item against seven_day_opus and seven_day_oauth_apps. If the goal is mechanical (fix the failing test, regenerate types, run the migration), Sonnet finishes in fewer turns of cheaper tokens. Switch with --model sonnet on the claude command before the goal fires.",
  },
  {
    title: "Watch seven_day_oauth_apps in the menu bar, not in /usage",
    description:
      "Typing /usage inside the conversation interrupts the goal. ClaudeMeter polls the same /api/organizations/{uuid}/usage endpoint every 60 seconds outside the loop, so you watch the bucket tick up while the goal keeps working.",
  },
  {
    title: "Set a personal abort line at 80% on the OAuth bucket",
    description:
      "ClaudeMeter speeds polling up to 90 seconds when any bucket crosses 80% utilization (HIGH_UTIL_FAST_POLL = 80.0 in src/bin/menubar.rs line 108). When the popover badge flips, /goal clear before the next Opus turn fires. You will leave a few percent on the table; you keep the rest of the week.",
  },
  {
    title: "Run a small test goal before the big one",
    description:
      "First /goal of a session: 'Print the current git status.' Confirm the evaluator behaves and the meter ticks the way you expect. Then set the real condition. The Anthropic docs recommend the same warm-up; the small goal costs almost nothing and tells you whether the loop is going to spiral.",
  },
];

const faqs = [
  {
    q: "Does Claude Code's /goal feature burn the weekly quota faster than interactive use?",
    a: "Yes. /goal sets a completion condition; after every turn a small evaluator model (Haiku by default) returns yes/no on whether the condition is met, and 'no' fires another main-model turn automatically. There is no per-turn human checkpoint, so the main model can run dozens of turns before you look up. Anthropic doubled the 5-hour cap in May 2026 (announced May 7, 2026) but left the weekly cap unchanged, so the weekly bucket is now the binding constraint for /goal sessions on Claude Code. The evaluator tokens themselves are 'typically negligible' per the docs at code.claude.com/docs/en/goal; the burn is the main model running unattended.",
  },
  {
    q: "Which weekly bucket does a /goal session actually wall on?",
    a: "seven_day_oauth_apps, almost always. Claude Code authenticates via OAuth, so its requests count against the OAuth-apps weekly bucket on top of the all-up seven_day aggregate. Your account can sit at seven_day = 58% and seven_day_oauth_apps = 93% at the same time; the web UI on claude.ai/settings/usage emphasizes the all-up bar, the CLI walls on the OAuth one. The field is declared on line 24 of src/models.rs in the open-source ClaudeMeter repo.",
  },
  {
    q: "How is /goal implemented internally? Why does it cost so many turns?",
    a: "Per the official docs, /goal is a session-scoped wrapper around a prompt-based Stop hook. The condition you typed is passed to a small fast evaluator model (defaults to Haiku) along with the conversation; the evaluator returns yes/no plus a short reason. 'No' starts another main-model turn with the evaluator's reason as guidance. 'Yes' clears the goal and returns control. The cost shape: one full main-model turn per evaluator-no, plus one tiny evaluator call per turn. With Opus as the main model, every wrong evaluator-no costs you full Opus pricing against seven_day_opus and seven_day_oauth_apps.",
  },
  {
    q: "Anthropic doubled the rate limits in May 2026. Doesn't that fix /goal?",
    a: "It fixes the 5-hour wall, not the weekly wall. The May 7, 2026 announcement doubled the rolling 5-hour Sonnet and Opus budgets for Pro and Max accounts. The weekly cap was left at the level Anthropic tightened to in 2026; it was not doubled. /goal sessions that previously hit the 5-hour wall and forced a 5-hour cooldown now keep running, which means more main-model turns charge against the same unchanged weekly bucket. Net effect: /goal users now hit the weekly wall earlier in the week than they did before the doubling, not later.",
  },
  {
    q: "How do I see the weekly burn live without typing /usage and breaking the goal?",
    a: "Run an ambient meter outside Claude Code. ClaudeMeter (github.com/m13v/claude-meter, MIT) polls the same /api/organizations/{uuid}/usage endpoint claude.ai/settings/usage hits, every 60 seconds (extension/background.js line 3, const POLL_MINUTES = 1), and renders the six weekly buckets plus the 5-hour bucket in the macOS menu bar. The /goal loop never sees the call. When seven_day_oauth_apps crosses 80% the popover badge changes and you can /goal clear before the next Opus turn fires. ccusage cannot do this; it sums tokens from local Claude Code JSONL files but cannot see Anthropic's server-enforced weekly utilization.",
  },
  {
    q: "What is the cheapest guard I can put on a /goal so it does not eat the week?",
    a: "Bound the condition itself. /goal accepts up to 4,000 characters; spend some of them on an OR clause: 'The test suite passes and the diff is committed, OR you have attempted this 12 times.' The evaluator counts attempts and returns yes once the cap is hit. This costs nothing extra and stops the worst failure mode (a bad path that the evaluator keeps saying no to forever). Pair it with --model sonnet on the main model unless the goal genuinely needs Opus reasoning.",
  },
  {
    q: "Does /goal cost a session even when the evaluator returns yes immediately?",
    a: "Yes, a small one. Even on a goal the model finishes in one turn, the evaluator still runs once on the resulting conversation. That call is small (Haiku-tier) and typically negligible per the docs. The cost shape only becomes significant when the evaluator returns no repeatedly and the main model fires repeatedly. Watch seven_day_oauth_apps; if it ticks up by more than 1-2 percentage points per minute during a goal, the loop is spiralling and the guard you set in the condition (or your manual /goal clear) is what saves the rest of the week.",
  },
  {
    q: "What happens to the goal across --resume or --continue?",
    a: "The goal survives. Per the docs, /goal is session-scoped but persists across --resume and --continue, though the turn and token counters reset to zero on resume. The completion condition is the same; the next time you resume the session the evaluator immediately checks against it and either fires another main-model turn or clears the goal. This means a goal you forgot about can fire fresh main-model turns the next time you resume the session and resume burning seven_day_oauth_apps. /goal clear before suspending a session you do not plan to come back to.",
  },
  {
    q: "Does ClaudeMeter actually distinguish a /goal session from a normal one?",
    a: "Not by name. Anthropic's /api/organizations/{uuid}/usage endpoint reports utilization per bucket, not per session or per slash command. ClaudeMeter shows you the bucket utilization regardless of how the load got there. In practice, a /goal session shows up as seven_day_oauth_apps climbing faster than your reading speed; the rate of change is the signal. If you watch the popover for 60 seconds and the OAuth bucket jumped 2-3 percentage points, that is a /goal-shaped burn.",
  },
];

const relatedPosts = [
  {
    title: "The Claude Code weekly quota wall: what the CLI hides",
    href: "/t/claude-code-weekly-quota-wall",
    excerpt:
      "When the wall fires, Claude Code prints a generic 'rate_limit_error: ... limit reached' string. The OAuth token in your Keychain plus the right endpoint will tell you which bucket actually walled you.",
    tag: "Weekly wall",
  },
  {
    title:
      "Claude Code 5-hour limit doubled, weekly cap unchanged (May 2026)",
    href: "/t/claude-code-5-hour-limit-doubled-may-2026",
    excerpt:
      "The May 7, 2026 doubling moved the 5-hour cap and left the weekly cap alone. Why /goal users now hit the weekly wall earlier in the week, not later.",
    tag: "May 2026",
  },
  {
    title: "Claude Code weekly quota meter: the meter you watch instead of typing /usage",
    href: "/t/claude-code-weekly-quota-meter",
    excerpt:
      "/usage costs a turn and prints stale data. A meter polls the same endpoint outside Claude Code on a 60-second tick, so the loop never sees it.",
    tag: "Live signal",
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
                "Claude Code /goal feature: why it burns the weekly quota faster",
              description:
                "Claude Code's /goal slash command runs the main model unattended turn after turn until a Haiku evaluator says the condition is met. Anthropic doubled the 5-hour cap in May 2026 and left the weekly cap unchanged, so /goal sessions wall on seven_day_oauth_apps days earlier than interactive use.",
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "ClaudeMeter",
              publisherUrl: "https://claude-meter.com",
            }),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqs)) }}
      />

      <div className="pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-3xl mx-auto px-6 mt-6 mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
          Claude Code /goal: why it burns the weekly quota faster
        </h1>
        <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
          /goal sets a condition and lets Claude Code run unattended,
          turn after turn, until a small evaluator model says the
          condition is met. Anthropic doubled the 5-hour cap in May
          2026 and left the weekly cap unchanged, so the bucket that
          fires is{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            seven_day_oauth_apps
          </code>
          , and it fires earlier in the week than interactive use ever
          did.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="6 min read"
      />

      <section className="max-w-3xl mx-auto px-6 my-8">
        <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-11)
          </p>
          <p className="text-zinc-900 text-base leading-relaxed">
            Yes, /goal burns the weekly quota faster than interactive
            use. /goal removes the per-turn human checkpoint: after
            every turn a small evaluator model (Haiku by default)
            returns yes/no on whether the completion condition is
            met, and &ldquo;no&rdquo; fires another full main-model
            turn automatically. Anthropic&apos;s May 2026 rate-limit
            doubling moved the 5-hour cap, not the weekly cap, so the
            weekly bucket{" "}
            <code className="text-sm bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
              seven_day_oauth_apps
            </code>{" "}
            is now the binding constraint and a /goal session can
            land it days earlier than the same workload run
            interactively. Source: Anthropic&apos;s official docs at{" "}
            <a
              href="https://code.claude.com/docs/en/goal"
              className="text-teal-700 underline underline-offset-2"
            >
              code.claude.com/docs/en/goal
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What /goal actually does
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The slash command is small. You give it a condition. Claude
          Code keeps running until the condition is met. Underneath,
          per Anthropic&apos;s docs, it is a session-scoped wrapper
          around a prompt-based Stop hook: every turn the evaluator
          model receives the conversation and the condition and
          returns yes or no plus a short reason. &ldquo;No&rdquo;
          starts the next main-model turn with the reason as
          guidance.
        </p>
        <AnimatedCodeBlock
          code={goalCommand}
          language="bash"
          filename="claude · /goal"
        />
        <p className="text-sm text-zinc-500 mt-4">
          One goal per session, condition up to 4,000 characters.{" "}
          <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">
            ◎ /goal active
          </code>{" "}
          is the status indicator. /goal with no arg shows turns and
          tokens spent on the active goal.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The line in the docs that hides the burn
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Anthropic&apos;s docs are explicit about evaluator cost.
          They are silent about main-model cost. That is the gap the
          weekly bucket falls into.
        </p>
        <AnimatedCodeBlock
          code={goalDocsQuote}
          language="bash"
          filename="quoted from code.claude.com/docs/en/goal"
        />
        <p className="text-sm text-zinc-500 mt-4">
          Negligible evaluator + Opus main model, fired turn after
          turn until yes, is not a small number. It is the entire
          weekly bucket if you are not watching.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Interactive vs. /goal: where the weekly burn comes from
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          Same workload, two execution shapes. The shape is what
          changes the weekly bill.
        </p>
        <BeforeAfter
          title="Where seven_day_oauth_apps comes from in each shape"
          before={interactiveLane}
          after={goalLane}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The May 2026 doubling, and why it makes /goal worse, not better
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          On May 7, 2026 Anthropic doubled the rolling 5-hour cap on
          Sonnet and Opus for Pro and Max accounts. The weekly cap
          was not doubled. /goal sessions that previously crashed
          into the 5-hour wall and were forced to wait now keep
          running and keep charging the same unchanged weekly bucket.
        </p>
        <ComparisonTable
          productName="Interactive Claude Code"
          competitorName="/goal session"
          rows={capAsymmetryRows}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The bucket to watch (and what it looks like at 93%)
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The bucket is{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            seven_day_oauth_apps
          </code>{" "}
          (line 24 of{" "}
          <a
            href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
            className="text-teal-700 underline underline-offset-2"
          >
            src/models.rs
          </a>
          ). Web chat charges{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            seven_day
          </code>
          ; OAuth-token clients like Claude Code charge that one and
          this one. Your account can sit at 58% on the all-up bar and
          93% on the OAuth-apps bar at the same time.
        </p>
        <TerminalOutput title="claude-meter --json | jq .usage" lines={usageTerminal} />
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Five guards that keep /goal from eating the week
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          None of these turn /goal off. They put a ceiling on how
          much of the weekly bucket a single goal can spend.
        </p>
        <StepTimeline title="Bounding /goal in five steps" steps={guardSteps} />
      </section>

      <FaqSection title="FAQ" faqs={faqs} />

      <section className="max-w-3xl mx-auto px-6 my-12">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Set up the meter before the next /goal session"
          description="Fifteen minutes: install ClaudeMeter, walk the buckets together, set your personal abort line on seven_day_oauth_apps so the weekly wall stops being a surprise."
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <RelatedPostsGrid title="Related guides" posts={relatedPosts} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Stop guessing where the weekly bucket is. 15 min walkthrough."
      />
    </article>
  );
}
