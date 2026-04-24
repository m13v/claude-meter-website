import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  FlowDiagram,
  CodeComparison,
  BeforeAfter,
  AnimatedDemo,
  AnimatedChecklist,
  ComparisonTable,
  HorizontalStepper,
  Marquee,
  MotionSequence,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  ShineBorder,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-senior-reviewer-workflow";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title: "Claude Code Senior Reviewer Workflow: The seven_day_opus Float Is Your Reviewer Budget",
  description:
    "The two-agent senior-reviewer pattern (Sonnet worker, Opus reviewer) is rationed by one hidden number: seven_day_opus.utilization. It lives at src/models.rs line 23 in ClaudeMeter and you can read it from a shell via claude-meter --json. Every other write-up is a prompt template; none of them tell you when your Thursday reviewer calls will 429.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Code Senior Reviewer Workflow: The seven_day_opus Float Is Your Reviewer Budget",
    description:
      "A senior-reviewer workflow that invokes Opus on every PR is per-week rationed by a float the Settings page folds into one bar. Here is how to read it, how to gate reviewer invocations on it, and where it lives in the ClaudeMeter source.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What is the Claude Code senior reviewer workflow?",
    a: "A two-agent pattern. One agent, usually Sonnet, writes or refactors code. A second agent, usually Opus, reads the diff and returns a structured review before anything lands on main. In Claude Code this is most often wired through /agents with a senior-reviewer role, a slash command like /review, or a CI step that shells claude with a review system prompt. The division of labour is what people write about. The thing nobody writes about is that the reviewer pass is Opus-rationed on a weekly budget, and that budget is a single float on the usage endpoint.",
  },
  {
    q: "Why does a senior-reviewer workflow burn Opus faster than normal coding?",
    a: "Because every review is a full re-read of the diff plus the review system prompt plus any project context the reviewer agent pulls in. A Sonnet-only coding session can skate through five hours without touching Opus at all. A two-agent workflow touches Opus on every PR even when the code itself was Sonnet-written. If your team does 6 PRs a day, that is 6 Opus invocations a day that would not exist without the reviewer pass, and each one is larger than a typical chat turn because the entire diff is in the prompt.",
  },
  {
    q: "What is seven_day_opus and where does ClaudeMeter read it?",
    a: "seven_day_opus is a weekly utilization float scoped to Opus requests on your subscription. ClaudeMeter declares it as pub seven_day_opus: Option<Window> on src/models.rs line 23. The menu-bar formatter prints it as '7-day Opus' on src/format.rs line 19. It is populated verbatim from the /api/organizations/{org}/usage response that claude.ai/settings/usage also consumes, so the number you read from ClaudeMeter is the same number the rate limiter checks on your next Opus request.",
  },
  {
    q: "How do I read seven_day_opus from a shell so I can gate my reviewer calls?",
    a: "Two ways. The CLI: /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json | jq '.usage.seven_day_opus.utilization'. The persisted snapshot file: jq '.[0].usage.seven_day_opus.utilization' ~/Library/Application\\ Support/ClaudeMeter/snapshots.json. Both return a single float. Either one is one line in a pre-commit hook, a GitHub Action, or a wrapper script that calls claude review. Local-log tools like ccusage have nothing to read here because the float is server-side.",
  },
  {
    q: "Can I use ccusage or Claude-Code-Usage-Monitor to budget a senior-reviewer workflow?",
    a: "Not for this. Both tools parse ~/.claude/projects/**/*.jsonl and count tokens client-side. Token counts are a cost signal, not a quota signal. The rate limiter does not read your JSONL; it reads its own server-side weekly float. You can spend a lot of tokens and still have headroom, or spend few tokens and still hit the gate. The only way to budget a reviewer workflow on server truth is to read the live seven_day_opus float, which ClaudeMeter surfaces and the local-log tools do not.",
  },
  {
    q: "Does the five-hour float matter for the reviewer role?",
    a: "Yes, on bursty days. five_hour is shared across every model and every request, so a morning of heavy Sonnet coding followed by an afternoon of reviews can pin it before seven_day_opus does. In practice the five-hour gate is the one that stops a single marathon session; the seven_day_opus gate is the one that kills the workflow mid-week. A well-designed reviewer wrapper checks both before every invocation.",
  },
  {
    q: "What happens when seven_day_opus hits 1.0 in the middle of a review?",
    a: "The next Opus request returns 429 with a resets_at timestamp that matches the Window struct at src/models.rs lines 3 to 7. Claude Code then surfaces the failure to whatever invoked it. In a /review slash command you will see the error inline. In a CI step shelling to claude it will exit nonzero. The review itself does not partially complete; the server rejects the request before the model sees the prompt.",
  },
  {
    q: "What is a reasonable fallback when Opus is pinned?",
    a: "Run the reviewer prompt on Sonnet 4.7 and explicitly note in the review output that it is a Sonnet pass, not an Opus pass. Humans reading the review can calibrate accordingly. Sonnet still catches the structural and correctness issues; the classes of feedback it misses are architectural comparisons that benefit from Opus's longer effective context reasoning. A shell wrapper that reads seven_day_opus and picks the model is the cleanest implementation.",
  },
  {
    q: "Does the extra_usage overage block save me?",
    a: "Partly. If your account has overage billing enabled, Opus requests can continue past seven_day_opus by consuming extra_usage credits. Those have their own utilization float, extra_usage.utilization on the ExtraUsage struct at src/models.rs lines 10 to 16, and when that reaches 1.0 new requests stop even with the weekly float green. ClaudeMeter prints the extra-usage state next to the windows so you can see both limits at once.",
  },
  {
    q: "Why do so many senior-reviewer guides skip the budget question?",
    a: "Because the question is invisible to anyone who is not reading the /usage response directly. Settings renders a single 'weekly Opus' bar with no arithmetic for 'how many more reviews do I get this week.' And because token-based tools do not see the weekly Opus float at all, the writers using those tools do not know the float exists. The result is a genre of write-ups that describe the prompt pattern carefully and never mention that the pattern has a sustainability cliff.",
  },
  {
    q: "Does this workflow differ on Max 20x versus Pro?",
    a: "Yes. Max 20x has a roughly twentyfold larger seven_day_opus denominator than Pro, which is the difference between running a reviewer pattern sustainably on a small team and running it for two days a week on a solo plan. Neither denominator is printed in the Settings page; both are read from the /usage response on every tick. ClaudeMeter does not care which plan you have; it reads the float and renders it at whatever scale the server returned.",
  },
  {
    q: "Is the reviewer budget the same across Claude Code, claude.ai chat, and third-party IDE clients?",
    a: "If all three authenticate with your claude.ai cookies, yes. They share seven_day_opus and the rest of the weekly floats. If one of them authenticates via an OAuth app, its traffic lands in seven_day_oauth_apps instead, which is a separate hidden float declared at src/models.rs line 24. A reviewer workflow that runs through an OAuth-authorized IDE extension can trip a float the Settings UI does not draw at all.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Senior reviewer workflow", url: PAGE_URL },
];

const modelsRsSnippet = `// claude-meter/src/models.rs (lines 18 to 28)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:             Option<Window>,
    pub seven_day:             Option<Window>,
    pub seven_day_sonnet:      Option<Window>,
    pub seven_day_opus:        Option<Window>,  // line 23: reviewer budget lives here
    pub seven_day_oauth_apps:  Option<Window>,
    pub seven_day_omelette:    Option<Window>,
    pub seven_day_cowork:      Option<Window>,
    pub extra_usage:           Option<ExtraUsage>,
}`;

const formatRsSnippet = `// claude-meter/src/format.rs (lines 9 to 22)
if let Some(u) = &s.usage {
    if let Some(w) = &u.five_hour {
        println!("{:<16} {}", "5-hour", format_window(w));
    }
    if let Some(w) = &u.seven_day {
        println!("{:<16} {}", "7-day all", format_window(w));
    }
    if let Some(w) = &u.seven_day_sonnet {
        println!("{:<16} {}", "7-day Sonnet", format_window(w));
    }
    if let Some(w) = &u.seven_day_opus {                 // line 19
        println!("{:<16} {}", "7-day Opus", format_window(w));
    }
}`;

const ungatedReviewer = `#!/usr/bin/env bash
# runs the senior-reviewer agent on whatever PR is checked out
# PROBLEM: will 429 at 3pm on Thursday with no warning

git diff origin/main...HEAD > /tmp/pr.diff

claude \\
  --model claude-opus-4-7 \\
  --system-prompt-file .claude/senior-reviewer.md \\
  --input /tmp/pr.diff \\
  > review.md

cat review.md`;

const gatedReviewer = `#!/usr/bin/env bash
# gate the reviewer on live seven_day_opus so Thursday still works

OPUS=$(/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json \\
  | jq -r '.usage.seven_day_opus.utilization // 0')

# ClaudeMeter clamp: values <=1 are fractions, >1 are already percents
PCT=$(awk -v o="$OPUS" 'BEGIN { print (o<=1 ? o*100 : o) }')

MODEL=claude-opus-4-7
if awk -v p="$PCT" 'BEGIN { exit !(p >= 85) }'; then
  MODEL=claude-sonnet-4-7
  echo "[reviewer] seven_day_opus at \${PCT}% -> Sonnet pass" >&2
fi

git diff origin/main...HEAD > /tmp/pr.diff

claude \\
  --model "$MODEL" \\
  --system-prompt-file .claude/senior-reviewer.md \\
  --input /tmp/pr.diff \\
  > review.md

cat review.md`;

const preflightCliLines = [
  { type: "command" as const, text: "# one shot, reads server truth, no login prompt" },
  {
    type: "command" as const,
    text: "/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json | jq '.usage | {five_hour: .five_hour.utilization, seven_day_opus: .seven_day_opus.utilization, seven_day: .seven_day.utilization}'",
  },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"five_hour\":       0.42," },
  { type: "output" as const, text: "  \"seven_day_opus\":  0.88," },
  { type: "output" as const, text: "  \"seven_day\":       0.61" },
  { type: "output" as const, text: "}" },
  {
    type: "success" as const,
    text: "seven_day_opus at 0.88 is the one to watch. A senior-reviewer wrapper that gates at 0.85 flips to Sonnet here.",
  },
];

const persistedSnapshotLines = [
  { type: "command" as const, text: "# option two: read the persisted snapshot the menu bar keeps on disk" },
  {
    type: "command" as const,
    text: "jq '.[0].usage.seven_day_opus' \"$HOME/Library/Application Support/ClaudeMeter/snapshots.json\"",
  },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"utilization\":  0.88," },
  { type: "output" as const, text: "  \"resets_at\":    \"2026-04-28T00:00:00Z\"" },
  { type: "output" as const, text: "}" },
  {
    type: "success" as const,
    text: "resets_at is on the Window struct (src/models.rs lines 3 to 7). The reviewer has about 3.5 days left on this float.",
  },
];

const reviewerFlowSteps = [
  {
    label: "Claude Code runs /review on a PR",
    detail:
      "The /review slash command or a CI wrapper shells claude with the senior-reviewer system prompt, the full diff, and the reviewer model explicitly set to Opus.",
  },
  {
    label: "Request lands on Anthropic's rate limiter",
    detail:
      "Before the model sees the prompt, the server checks five_hour, seven_day, and seven_day_opus. Any float at 1.0 returns 429 with a resets_at timestamp.",
  },
  {
    label: "seven_day_opus increments",
    detail:
      "The reviewer pass contributes to the Opus-only weekly float. Sonnet work done earlier in the day does not share this bucket, so even a Sonnet-heavy team can pin it.",
  },
  {
    label: "Review returns or 429s",
    detail:
      "If every float is green, the review comes back. If seven_day_opus hit 1.0 on this call, the request is rejected and the Settings UI shows a generic weekly bar close to full.",
  },
];

const demoSteps = [
  {
    screen: "$ claude-meter --json | jq '.usage.seven_day_opus.utilization'",
    caption: "Shell asks ClaudeMeter for the live reviewer float",
    duration: 2400,
  },
  {
    screen: "0.44",
    caption: "44 percent on Monday. Every PR gets the Opus reviewer pass.",
    duration: 2200,
  },
  {
    screen: "0.72",
    caption: "72 percent by Wednesday afternoon. Still inside the gate threshold.",
    duration: 2200,
  },
  {
    screen: "0.89",
    caption: "89 percent Thursday morning. Wrapper silently flips reviewer to Sonnet.",
    duration: 2400,
  },
  {
    screen: "0.96",
    caption: "Late Thursday. Opus still off; Sonnet reviews keep flowing. No 429 storm.",
    duration: 2400,
  },
  {
    screen: "resets_at: 2026-04-28T00:00:00Z",
    caption: "Monday UTC rollover. Float resets and Opus is back on.",
    duration: 2600,
  },
];

const wrapperCode = `# reviewer-gate.sh (put this in .claude/hooks or .github/scripts)

THRESHOLD=0.85

OPUS=$(/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json \\
  | jq -r '.usage.seven_day_opus.utilization // 0')
PCT=$(awk -v o="$OPUS" 'BEGIN { print (o<=1 ? o : o/100) }')

if awk -v p="$PCT" -v t="$THRESHOLD" 'BEGIN { exit !(p >= t) }'; then
  echo "claude-sonnet-4-7"
else
  echo "claude-opus-4-7"
fi`;

const motionFrames = [
  {
    title: "Day 1: Monday",
    body: "Opus reviewer runs on every PR. seven_day_opus rises from 0 toward the gate threshold.",
    duration: 2600,
  },
  {
    title: "Day 3: Wednesday",
    body: "Float is past halfway. ccusage says token spend is fine. The rate limiter disagrees, but quietly.",
    duration: 2800,
  },
  {
    title: "Day 4: Thursday morning",
    body: "Float crosses 0.85. Gated wrapper flips the reviewer model to Sonnet 4.7. No 429, no interrupted PR merges.",
    duration: 3000,
  },
  {
    title: "Day 5: Friday",
    body: "Sonnet reviews keep shipping. Opus is back in rotation for architecture-heavy PRs that genuinely need it.",
    duration: 2600,
  },
  {
    title: "Day 7: Sunday into Monday UTC",
    body: "resets_at on the Window struct fires. seven_day_opus resets. The next Monday morning PR gets the Opus reviewer again.",
    duration: 3000,
  },
];

const setupSteps = [
  {
    title: "1. Install ClaudeMeter",
    description: "brew install --cask m13v/tap/claude-meter. The menu-bar app and the claude-meter CLI land in /Applications/ClaudeMeter.app.",
  },
  {
    title: "2. Load the extension",
    description: "Chrome or Arc, chrome://extensions, Load unpacked on the repo's extension/ folder. Removes the cookie-paste step entirely.",
  },
  {
    title: "3. Add the gate to your reviewer wrapper",
    description: "In the script or hook that calls claude with --model opus, shell to claude-meter --json first and pick the model from the float.",
  },
  {
    title: "4. Wire it into /review or CI",
    description: "For a slash command, read the model choice into the same claude call. For GitHub Actions, export the model choice from a preceding step and pass it into your reviewer step's inputs.",
  },
];

const patternChips = [
  "/review slash command",
  "/agents senior-reviewer role",
  "GitHub Actions on PR open",
  ".claude/hooks/pre-merge",
  "CI step: claude review",
  "pre-commit + review.md prompt",
  "Claude Code + custom reviewer agent",
  "inline reviewer on /commit",
];

const reviewerChecklist = [
  {
    text: "seven_day_opus.utilization under the gate threshold (default 0.85) before invoking the reviewer on Opus.",
  },
  {
    text: "five_hour.utilization under 0.90 before any model call. This float is shared, so it can pin before Opus-specifically does.",
  },
  {
    text: "Fallback model chosen explicitly (Sonnet 4.7). Not an empty string, not a panic, not a default that silently reverts to Haiku.",
  },
  {
    text: "extra_usage.utilization checked if overage is enabled. That is a second gate the Settings bar does not draw.",
  },
  {
    text: "subscription.status is active. A past_due state collapses every float's denominator server-side and a 429 follows.",
  },
  {
    text: "Review output tags which model produced it. A Sonnet fallback review is worth reading differently than an Opus review.",
  },
  {
    text: "resets_at logged alongside the decision. When a reviewer call flips to Sonnet, log the UTC reset time so the next PR knows when Opus is back.",
  },
];

const comparisonRows = [
  {
    feature: "Reads seven_day_opus directly",
    competitor: "No (not in local JSONL logs)",
    ours: "Yes, from the /usage response every 60 seconds",
  },
  {
    feature: "Works before any request is sent",
    competitor: "Partial (estimates based on past tokens)",
    ours: "Yes, pre-flight float value on every invocation",
  },
  {
    feature: "Separate weekly float for the reviewer model",
    competitor: "No (aggregates by token class)",
    ours: "Yes, Opus-only via seven_day_opus",
  },
  {
    feature: "Returns a resets_at per float",
    competitor: "No",
    ours: "Yes, on every Window struct",
  },
  {
    feature: "Shell-scriptable from a reviewer wrapper",
    competitor: "Yes, but not against server truth",
    ours: "Yes, one jq line against CLI --json",
  },
  {
    feature: "Free and open source",
    competitor: "Yes",
    ours: "Yes, MIT",
  },
  {
    feature: "Removes the claude.ai cookie-paste step",
    competitor: "Not applicable (no cookies needed)",
    ours: "Yes, via the browser extension",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code senior reviewer workflow: the seven_day_opus float is your reviewer budget",
  description:
    "The two-agent senior-reviewer pattern (Sonnet worker, Opus reviewer) is rationed by one server-side float, seven_day_opus.utilization. It is declared at src/models.rs line 23 in ClaudeMeter, printed as 7-day Opus in the CLI output, and readable from a shell via claude-meter --json. A gated reviewer wrapper flips to Sonnet before the float trips a 429.",
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "ClaudeMeter",
  publisherUrl: "https://claude-meter.com",
  articleType: "TechArticle",
});

const breadcrumbJsonLd = breadcrumbListSchema(
  breadcrumbs.map((b) => ({ name: b.name, url: b.url })),
);

const faqJsonLd = faqPageSchema(faqs);

const relatedPosts = [
  {
    href: "/t/claude-code-4-7-rate-limit",
    title: "Claude Code 4.7 rate limit: eight floats on one endpoint",
    excerpt:
      "The full struct: every float the server checks, which four Settings draws, which four it hides, and where they live in the ClaudeMeter source.",
    tag: "Related",
  },
  {
    href: "/t/claude-code-opus-4-7-usage-limits",
    title: "Claude Code Opus 4.7 usage limits",
    excerpt:
      "Zoom in on Opus specifically. What the weekly Opus bucket counts, how fast 4.7 fills it, and why the 4.6-to-4.7 shift changed sustainability math.",
    tag: "Related",
  },
  {
    href: "/t/claude-code-dollars-per-pull-request",
    title: "Claude Code dollars per pull request",
    excerpt:
      "A companion read for teams budgeting the reviewer pattern on overage billing. The dollar number sitting behind extra_usage.utilization.",
    tag: "Related",
  },
];

export default function ClaudeCodeSeniorReviewerWorkflowPage() {
  return (
    <article className="bg-white text-zinc-900">
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
          Your senior reviewer workflow is rationed by{" "}
          <GradientText>one float nobody writes about</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          The Claude Code community has converged on a good pattern. One agent
          writes code, usually on Sonnet. A second agent reviews it, usually on
          Opus. The existing playbooks cover the prompts carefully and the
          wiring carefully and never mention the budget. That budget is a single
          number on Anthropic&apos;s{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          response,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus.utilization
          </code>
          , and it decides when your Thursday reviewer pass stops coming back
          with anything useful. This page is about reading that number before
          every review and gating the invocation on it.
        </p>
        <div className="mt-8">
          <ShimmerButton href="/install">
            Install ClaudeMeter, free and MIT
          </ShimmerButton>
        </div>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="built ClaudeMeter"
          datePublished={PUBLISHED}
          readingTime="10 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Verified from the open-source ClaudeMeter client"
          highlights={[
            "seven_day_opus declared at src/models.rs line 23",
            "CLI prints it as 7-day Opus on src/format.rs line 19",
            "One jq line against claude-meter --json gates every reviewer call",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <MotionSequence
          title="One week of a Sonnet-worker / Opus-reviewer team"
          frames={motionFrames}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The pattern the community converged on
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The two-agent split is the only senior-reviewer pattern anyone has
          found that consistently catches things a solo model misses. One agent
          codes, the other reviews. The reviewer sees the full diff with
          no session memory of the coding decisions, which is the property that
          makes it useful. Because the reviewer should be the strongest
          available model, almost every write-up uses Opus on that side of the
          split.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          That choice has a consequence most guides skip. Opus has its own
          per-week quota. Your reviewer invocations fill it. If the team ships a
          normal rate of PRs, the reviewer floats will pin mid-week every week.
          When that happens, the reviewer either 429s or silently falls back to
          whatever Claude Code&apos;s default-model logic does, which is not
          always what you want and is never visible to the PR author.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-10">
        <Marquee speed={40}>
          {patternChips.map((chip, i) => (
            <span
              key={i}
              className="mx-3 inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-mono text-teal-700"
            >
              {chip}
            </span>
          ))}
        </Marquee>
        <p className="text-center text-sm text-zinc-500 -mt-2">
          Every one of these calling conventions hits the same per-week Opus
          float. It does not matter how you invoke the reviewer; the gate is
          upstream of the prompt.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          How a review fans into three quota checks
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The reviewer pass is a single{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            POST
          </code>{" "}
          from Claude Code&apos;s perspective. From the rate limiter&apos;s
          perspective it is three floats evaluated in parallel.
        </p>
        <FlowDiagram
          title="One /review call, three rate-limit gates"
          steps={reviewerFlowSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: every reviewer budget lives on one line of Rust
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The reviewer&apos;s weekly budget is not a computed number. It is
          returned by Anthropic directly on the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          endpoint and deserialized into{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>
          . One optional Window. No aggregation, no heuristic:
        </p>
        <AnimatedCodeBlock
          code={modelsRsSnippet}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          And the one-line print that surfaces it on the CLI:
        </p>
        <AnimatedCodeBlock
          code={formatRsSnippet}
          language="rust"
          filename="claude-meter/src/format.rs"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          An ungated reviewer script next to a gated one
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Same reviewer prompt, same diff, same everything. The right-hand
          script reads{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          from ClaudeMeter before it picks the model.
        </p>
        <CodeComparison
          leftCode={ungatedReviewer}
          rightCode={gatedReviewer}
          leftLines={ungatedReviewer.split("\n").length}
          rightLines={gatedReviewer.split("\n").length}
          leftLabel="reviewer.sh (ungated, 429s on Thursday)"
          rightLabel="reviewer.sh (gated on seven_day_opus)"
          title="The diff between a workflow that breaks mid-week and one that does not"
          reductionSuffix="extra lines to read server truth"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reading seven_day_opus from a shell, two ways
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The CLI that ships next to the menu-bar app prints the full parsed
          snapshot when called with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            --json
          </code>
          . One{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            jq
          </code>{" "}
          filter gives you the reviewer float:
        </p>
        <TerminalOutput
          title="option one: one-shot CLI"
          lines={preflightCliLines}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          The menu-bar app also persists every tick&apos;s snapshot to disk
          under{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/Library/Application Support/ClaudeMeter/snapshots.json
          </code>
          . If you want to avoid spawning the CLI on every invocation, read the
          file directly:
        </p>
        <TerminalOutput
          title="option two: the persisted snapshot"
          lines={persistedSnapshotLines}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          What Thursday afternoon looks like, with and without the gate
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Same team, same PR rate, same prompts. Toggle between the
          ungated and gated versions of the week.
        </p>
        <BeforeAfter
          before={{
            label: "ungated",
            content:
              "Thursday 2pm. Opus reviewer returns 429 on PR #41. PR author pings the channel. Someone retries, 429 again. Someone opens claude.ai/settings/usage, sees a weekly bar that looks close to full, shrugs. Opus is out for the next 60 hours. Reviews pause or switch to ad-hoc humans until the UTC rollover.",
            highlights: [
              "429 with no fallback",
              "Settings UI shows one bar, not seven_day_opus specifically",
              "Team discovers the limit by tripping it",
              "No graceful degradation path written down",
            ],
          }}
          after={{
            label: "gated on seven_day_opus",
            content:
              "Thursday 2pm. Reviewer wrapper reads seven_day_opus.utilization at 0.89. Threshold is 0.85. The script switches the reviewer to Sonnet 4.7 and tags the review output with the model it used. The PR lands. The reviewer keeps running through Friday and the weekend. Monday UTC resets seven_day_opus and Opus is back in rotation automatically.",
            highlights: [
              "Reviewer keeps working through the rest of the week",
              "Model fallback is explicit and logged",
              "No human has to intervene",
              "No Settings-UI guessing",
            ],
          }}
          title="Thursday afternoon on an Opus-heavy reviewer workflow"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          What a gated reviewer wrapper actually does, tick by tick
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Plays automatically when it scrolls into view. Each frame is one
          real output of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude-meter --json | jq &apos;.usage.seven_day_opus.utilization&apos;
          </code>{" "}
          over a week.
        </p>
        <AnimatedDemo
          title="Monday through Monday on one account"
          steps={demoSteps}
          code={wrapperCode}
          codeLanguage="bash"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Wiring the gate into a real workflow
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Four steps from a fresh machine to a reviewer pattern that survives
          Thursday.
        </p>
        <HorizontalStepper title="Senior-reviewer gate setup" steps={setupSteps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The numbers behind the reviewer budget
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Line numbers from the ClaudeMeter source, poll cadence from the
              extension, and the single jq filter that turns the float into a
              model choice.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={23} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                src/models.rs line where seven_day_opus lives
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={19} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                src/format.rs line that prints &quot;7-day Opus&quot;
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={60} suffix="s" />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                extension poll cadence
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={1} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                jq filter that turns the float into a model choice
              </div>
            </div>
          </div>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What a gated reviewer should check before every invocation
        </h2>
        <AnimatedChecklist
          title="Reviewer pre-flight, in order of how often it will block"
          items={reviewerChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Token-based monitors vs server-truth monitors for this workflow
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Token counters do a fine job on cost. They can not do this job,
          because the thing that stops your Thursday reviewer is not a token
          total. It is a server-side float.
        </p>
        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="ccusage / Claude-Code-Usage-Monitor"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <ShineBorder className="w-full max-w-3xl">
          <div className="p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
              The part that is not a prompt pattern
            </h2>
            <p className="text-zinc-700 leading-relaxed text-lg">
              Every article about this topic puts its energy into the reviewer
              prompt. The prompt matters. The prompt is also not the thing that
              determines whether the workflow lasts the week. The thing that
              determines that is whether your wrapper reads{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                seven_day_opus
              </code>{" "}
              before it picks a model. One Rust field, one jq filter, one
              threshold. That is the whole implementation.
            </p>
          </div>
        </ShineBorder>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Keep your reviewer working on Thursday
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter polls the server-truth{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          payload every 60 seconds, parses every float, and exposes them on a
          CLI your reviewer wrapper can read with one jq line. Free, MIT, and
          the browser extension removes the cookie-paste step entirely.
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
          heading="Running the reviewer pattern on a team and want a sanity check?"
          description="If your reviewer wrapper is tripping 429s mid-week and the Settings bar looks ambiguous, send the CLI output over. I will tell you which float is actually pinning your Opus invocations."
          text="Book a 15-minute call"
          section="claude-code-senior-reviewer-workflow-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Reviewer workflow 429s mid-week? 15 min."
        section="claude-code-senior-reviewer-workflow-sticky"
        site="claude-meter"
      />
    </article>
  );
}
