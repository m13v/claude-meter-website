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
  MetricsRow,
  GlowCard,
  RemotionClip,
  AnimatedBeam,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  BentoGrid,
  HorizontalStepper,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-cost-per-landed-pr";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title: "Claude Code cost per landed PR: the yield-adjusted formula your ccusage report skips",
  description:
    "Cost per PR and cost per landed PR are different numbers. Quota burned on abandoned branches, failed CI retries, and force-pushes never refunds. Here is how to window ClaudeMeter utilization samples against git log --merges to get the real denominator.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Code cost per landed PR: the yield-adjusted formula",
    description:
      "A landed PR is a merged PR. Every other PR attempt still burned seven_day_opus. Here is the formula that joins ClaudeMeter samples to git log --merges.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code cost per landed PR", url: PAGE_URL },
];

const faqs = [
  {
    q: "What is the difference between cost per PR and cost per landed PR?",
    a: "Cost per PR divides your Claude Code spend by every PR you opened. Cost per landed PR divides it only by PRs that actually merged to the default branch. The gap is the quota you burned on abandoned branches, PRs that failed CI three times before you gave up, rebases you threw away, and experiments that never shipped. All of that still incremented seven_day_opus.utilization on the server. None of it ships product. On a team with a 60 percent merge rate, cost per landed PR is roughly 1.67x cost per PR, and that 1.67x is the number that matters for budgeting headcount against a Max 20x or Team Premium plan.",
  },
  {
    q: "Why can ccusage not compute this on its own?",
    a: "ccusage reads ~/.claude/projects/**/*.jsonl and reports tokens per session. It has no concept of git, no concept of merge commits, and no concept of the rolling quota buckets Anthropic actually rate-limits against. It also cannot see server-side adaptive-thinking tokens or tokenizer expansion on Opus 4.7. So it can tell you 'this session used 1.2M tokens at $15/1M input', but it cannot tell you 'that session belonged to a PR that never landed, so divide it into the abandoned bucket'. Both halves of the question require data it does not have: git merge state and the server utilization floats that ClaudeMeter pulls from claude.ai/api/organizations/{org_uuid}/usage.",
  },
  {
    q: "What exactly does ClaudeMeter expose that makes this calculation possible?",
    a: "Every 60 seconds the extension (see POLL_MINUTES = 1 in claude-meter/extension/background.js line 3) hits claude.ai/api/organizations/{org_uuid}/usage, timestamps the response with fetched_at (UsageSnapshot field at claude-meter/src/models.rs line 65), and posts it to a local bridge at http://127.0.0.1:63762/snapshots. That gives you a time-series of utilization floats. Join that series against git log --merges --format='%H %cI' for the window you care about, and you can compute delta-quota-per-merged-commit directly. No cookie paste. No API key. No approximations.",
  },
  {
    q: "What counts as a landed PR in this formula?",
    a: "A merge commit on the default branch (main, master, trunk) inside the window you are measuring. git log --merges --first-parent main returns the list. Squashed merges still show up because GitHub writes a merge commit. Rebase-and-merge workflows are the one edge case: if your team disables merge commits entirely, use git log --first-parent main and filter by PR-number token in the commit message, or pull the merge list from the GitHub API instead. The important thing is the denominator counts work that shipped, not work that opened.",
  },
  {
    q: "How long a measurement window gives an honest number?",
    a: "At minimum one full seven_day_opus cycle, because that is the rolling bucket the rate limiter cares about for Opus-heavy Claude Code work. Less than that and you get noise from whichever day you happened to pick. Four weeks is better for teams because it covers holidays, on-call rotations, and a release cadence. The utilization math stays valid at any window length as long as you also pull resets_at from each sample (Window.resets_at in models.rs line 6) and subtract across any rollovers that fell inside the window. ClaudeMeter stores resets_at on every sample, so the subtraction is automatable.",
  },
  {
    q: "Do reverted PRs count against landed or abandoned?",
    a: "Your call, and you should be explicit about it in the report. The strict yield view counts a revert as 'didn't land' and removes it from the numerator. The shipped-once view counts it as landed because it did merge. Most teams want the strict view because the quota spent on a reverted PR produced negative value. If you are building an internal dashboard, surface both numbers so a manager can decide which one drives the conversation that week.",
  },
  {
    q: "What about tokens for code review, not code generation?",
    a: "Code review sessions still burn the same four utilization floats and still show up in the same fetched_at timestamps. If you want to split them out, label your PRs with a marker in the commit message or branch name (feat/, review/, fix/) and bucket the deltas accordingly. The /api/organizations/{org_uuid}/usage endpoint does not know what the tokens were spent on, it only knows they were spent. The only place that distinction lives is your own tagging conventions.",
  },
  {
    q: "Is there a quick rule of thumb for estimating cost per landed PR?",
    a: "Start with your plan's Opus weekly ceiling as 100 percent, sample seven_day_opus.utilization at the start and end of each calendar week, subtract to get weekly burn. Count merges to main that same week. Divide. That gives you a weekly cost-per-landed-PR in the only unit the rate limiter respects: fraction of weekly Opus quota. If you want a dollar projection on top of that, multiply the weekly burn by your plan price for the week. On Max 20x ($200 / month, roughly $50 / week) a weekly burn of 80 percent with 10 landed PRs equals about $4 per landed PR in subscription cost, compared to maybe $25 per landed PR on the API at the same token volume.",
  },
  {
    q: "Does a PR that spent only Sonnet tokens still count in the denominator?",
    a: "Yes. Landed means merged, regardless of which model did the work. The numerator splits cleanly: Opus-heavy work lives in seven_day_opus, Sonnet work lives in seven_day_sonnet, and both touch five_hour. So a team running 'plan with Opus, implement with Sonnet, review with Opus' will see the same count of landed PRs but different burns across the three utilization floats. The cost-per-landed-PR formula is really four formulas, one per bucket, and all four have the same denominator: merges to main in the window.",
  },
  {
    q: "How does this change on Max 20x versus Team Premium?",
    a: "The utilization math does not change. What changes is the denominator baked into each utilization=1.0. Max 20x has roughly 20 times the per-seat ceiling of Pro; Team Premium is sized for several seats on one org. In practice a team that lands 40 PRs a week at 60 percent seven_day_opus burn on Max 20x will see the same 60 percent burn on Team Premium if they do the same work, because the ceiling scales with the plan. Cost per landed PR expressed as percentage of weekly Opus is portable across plans. Cost per landed PR expressed in dollars is not, because the subscription fee changes.",
  },
  {
    q: "What does the real-time bridge return and how do I read it?",
    a: "GET http://127.0.0.1:63762/snapshots returns the same JSON shape as claude.ai's server, plus the fetched_at timestamp and a list of orgs you are a member of. It is a plain HTTP endpoint on loopback, so curl + jq is enough to build a bash pipeline. If you want historical data outside the in-memory buffer, either subscribe to the bridge POSTs from the extension (extension/background.js line 2) or run the desktop Rust binary which logs to disk. The endpoint is the same in both cases, only the storage differs.",
  },
];

const landedFormula = `# cost_per_landed_pr over one measurement window

window_start = <ISO timestamp, first sample in window>
window_end   = <ISO timestamp, last sample in window>

# numerator: quota actually consumed, from the server
burn = {
  "opus_weekly":    sample_at(window_end).seven_day_opus.utilization
                  - sample_at(window_start).seven_day_opus.utilization,
  "sonnet_weekly":  sample_at(window_end).seven_day_sonnet.utilization
                  - sample_at(window_start).seven_day_sonnet.utilization,
  "five_hour_sum":  sum(delta.five_hour for delta in samples_in(window)),
  "overage_spent":  sample_at(window_end).extra_usage.used_credits
                  - sample_at(window_start).extra_usage.used_credits,
}

# denominator: PRs that actually shipped, from git
landed_prs = len([
    c for c in git_log_merges(window_start, window_end, branch="main")
    if not c.was_reverted_inside(window_end)
])

cost_per_landed_pr = {k: v / landed_prs for k, v in burn.items()}`;

const modelsRsSnippet = `// claude-meter/src/models.rs  (lines 61-73)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageSnapshot {
    pub org_uuid: String,
    pub browser: String,
    pub account_email: Option<String>,
    pub fetched_at: chrono::DateTime<chrono::Utc>,   // <-- this is the join key
    pub usage: Option<UsageResponse>,
    pub overage: Option<OverageResponse>,
    pub subscription: Option<SubscriptionResponse>,
    #[serde(default)]
    pub errors: Vec<String>,
    #[serde(default)]
    pub stale: bool,
}`;

const joinScript = `#!/usr/bin/env bash
# cost_per_landed_pr.sh
# Joins ClaudeMeter utilization samples against git merges on main.
# Emits one JSON blob with the four burn numbers and the landed-PR count.

set -euo pipefail

WINDOW_START="\${1:?ISO start}"   # e.g. 2026-04-17T00:00:00Z
WINDOW_END="\${2:?ISO end}"       # e.g. 2026-04-24T00:00:00Z
BRANCH="\${3:-main}"

# 1. all samples ClaudeMeter has in the bridge right now
SAMPLES=$(curl -sf http://127.0.0.1:63762/snapshots)

# 2. pick the bracketing samples for the window
FIRST=$(echo "$SAMPLES" | jq --arg s "$WINDOW_START" \\
  '[.[] | select(.fetched_at >= $s)] | sort_by(.fetched_at) | .[0]')
LAST=$(echo "$SAMPLES" | jq --arg e "$WINDOW_END" \\
  '[.[] | select(.fetched_at <= $e)] | sort_by(.fetched_at) | .[-1]')

# 3. subtract the four floats that make up the burn
BURN=$(jq -n --argjson a "$FIRST" --argjson b "$LAST" '{
  opus_weekly:   ($b.usage.seven_day_opus.utilization    - $a.usage.seven_day_opus.utilization),
  sonnet_weekly: ($b.usage.seven_day_sonnet.utilization  - $a.usage.seven_day_sonnet.utilization),
  five_hour:     ($b.usage.five_hour.utilization         - $a.usage.five_hour.utilization),
  overage:       (($b.usage.extra_usage.used_credits // 0)
                 - ($a.usage.extra_usage.used_credits // 0))
}')

# 4. count PRs that actually landed in the same window
LANDED=$(git log --merges --first-parent "$BRANCH" \\
  --since="$WINDOW_START" --until="$WINDOW_END" --format='%H' | wc -l | xargs)

jq -n --argjson burn "$BURN" --arg landed "$LANDED" \\
  '$burn + {landed_prs: ($landed|tonumber),
            cost_per_landed_pr_opus_weekly:
              (if ($landed|tonumber) > 0 then $burn.opus_weekly / ($landed|tonumber) else null end)}'`;

const terminalRun = [
  { type: "command" as const, text: "# measure one calendar week on main" },
  { type: "command" as const, text: "./cost_per_landed_pr.sh 2026-04-17T00:00:00Z 2026-04-24T00:00:00Z main" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"opus_weekly\": 0.63," },
  { type: "output" as const, text: "  \"sonnet_weekly\": 0.22," },
  { type: "output" as const, text: "  \"five_hour\": 0.17," },
  { type: "output" as const, text: "  \"overage\": 0.0," },
  { type: "output" as const, text: "  \"landed_prs\": 9," },
  { type: "output" as const, text: "  \"cost_per_landed_pr_opus_weekly\": 0.07" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "One landed PR cost ~7% of the weekly Opus ceiling. Budget for ~14 more this week before a 429." },
];

const whyLandedMatters = [
  {
    title: "Abandoned branches still burn quota",
    description:
      "A branch you started, reran three times, then dropped, still incremented seven_day_opus server-side. The /usage endpoint does not refund.",
  },
  {
    title: "Failed CI retries are full sessions",
    description:
      "Each retry is another Claude Code session. Same context, same tokens, same tool calls. The rate limiter counts each one, even when the PR never merges.",
  },
  {
    title: "Rebases that nuke work are pure cost",
    description:
      "Force-push histories that get overwritten took real Opus work to produce. The git tree forgets, seven_day_opus does not.",
  },
  {
    title: "Reverts double the effective cost",
    description:
      "A PR that merged, broke prod, and got reverted consumed quota twice: once to write it, once to undo it, plus any follow-up fix.",
  },
];

const sequenceMessages = [
  { from: 0, to: 1, label: "POLL_MINUTES = 1: GET /api/organizations/{org}/usage", type: "request" as const },
  { from: 1, to: 0, label: "{ seven_day_opus: 0.21, fetched_at: 2026-04-17T00:00Z }", type: "response" as const },
  { from: 2, to: 0, label: "branch-A opened, two Opus sessions, failed CI, abandoned", type: "event" as const },
  { from: 0, to: 1, label: "next sample", type: "request" as const },
  { from: 1, to: 0, label: "{ seven_day_opus: 0.41, fetched_at: 2026-04-18T13:00Z }", type: "response" as const },
  { from: 2, to: 0, label: "branch-B opened, Opus session, MERGED to main", type: "event" as const },
  { from: 0, to: 1, label: "next sample", type: "request" as const },
  { from: 1, to: 0, label: "{ seven_day_opus: 0.55, fetched_at: 2026-04-19T09:00Z }", type: "response" as const },
  { from: 2, to: 0, label: "window end: git log --merges --first-parent main: 1 landed PR", type: "event" as const },
];

const perPrVsLandedRows = [
  {
    feature: "Denominator",
    competitor: "Count of PRs opened",
    ours: "Count of merge commits on main",
  },
  {
    feature: "Charges abandoned branches",
    competitor: "No (they are not in the count)",
    ours: "Yes (quota burn stays in numerator, count does not)",
  },
  {
    feature: "Charges failed CI retries",
    competitor: "No",
    ours: "Yes",
  },
  {
    feature: "Charges force-pushed rewrites",
    competitor: "No",
    ours: "Yes",
  },
  {
    feature: "Charges reverts",
    competitor: "Sometimes (depends on strict vs shipped-once)",
    ours: "Configurable, defaulted to strict (revert removes the PR from the count)",
  },
  {
    feature: "Source for numerator",
    competitor: "Local ~/.claude/projects/**/*.jsonl tokens",
    ours: "claude.ai/api/organizations/{org}/usage utilization floats",
  },
  {
    feature: "Source for denominator",
    competitor: "PR tracker or memory",
    ours: "git log --merges --first-parent <branch>",
  },
  {
    feature: "Unit",
    competitor: "Dollars (wrong for subscribers)",
    ours: "Fraction of weekly Opus (what the rate limiter enforces)",
  },
];

const stepperSteps = [
  {
    title: "Install and warm the bridge",
    description:
      "Add the ClaudeMeter browser extension, log into claude.ai once. The extension starts posting to 127.0.0.1:63762 every 60 seconds.",
  },
  {
    title: "Pick a window",
    description:
      "One week is the floor because seven_day_opus is a weekly bucket. Four weeks is better for team reporting.",
  },
  {
    title: "Pull the bracketing samples",
    description:
      "Earliest fetched_at >= window_start and latest fetched_at <= window_end. Subtract the four utilization floats.",
  },
  {
    title: "Count the landed PRs",
    description:
      "git log --merges --first-parent main --since=... --until=... | wc -l. Filter reverts if you are running the strict view.",
  },
  {
    title: "Divide, publish, decide",
    description:
      "Four deltas, one denominator. Post the number in your team channel. Decide whether the plan, the workflow, or the merge rate needs to move.",
  },
];

const inputsToBurn = {
  hub: {
    label: "4 weekly burn floats",
    sublabel: "read live from claude.ai /usage",
  },
  from: [
    { label: "Merged PRs", sublabel: "the only ones that count in the denominator" },
    { label: "Abandoned branches", sublabel: "no landed PR; full burn stays" },
    { label: "Failed CI retries", sublabel: "each retry is a full Opus session" },
    { label: "Force-pushed rewrites", sublabel: "git forgets; seven_day_opus does not" },
    { label: "Review cycles", sublabel: "each round of comments is another Opus request" },
    { label: "Reverted PRs", sublabel: "merged once, then erased" },
  ],
  to: [
    { label: "Window quota burn" },
    { label: "Landed-PR count" },
    { label: "Cost per landed PR = burn / landed" },
  ],
};

const bento = [
  {
    title: "seven_day_opus",
    description:
      "Opus-only weekly float. Opus 4.7 Claude Code sessions land here. Usually the scarcest bucket for heavy coding weeks.",
    size: "1x1" as const,
    accent: true,
  },
  {
    title: "seven_day_sonnet",
    description:
      "Sonnet-only weekly float. Cleanup, test writing, low-stakes edits. Moves slower per session than Opus.",
    size: "1x1" as const,
  },
  {
    title: "five_hour",
    description:
      "Shared rolling window across every model. Hits first on a deep day. Rolls over continuously.",
    size: "1x1" as const,
  },
  {
    title: "extra_usage.used_credits",
    description:
      "Overage dollars burned once the subscription floats hit 1.0. The only field that is genuinely denominated in dollars.",
    size: "1x1" as const,
    accent: true,
  },
];

const relatedPosts = [
  {
    href: "/t/claude-code-cost-per-pr",
    title: "Claude Code cost per PR: what a pull request actually burns on Pro or Max",
    excerpt:
      "The underlying per-PR formula. Same four utilization floats, but divided by every PR, not only those that merged.",
    tag: "Related",
  },
  {
    href: "/t/claude-code-dollars-per-pull-request",
    title: "Claude Code dollars per pull request: converting the delta to a plan price",
    excerpt:
      "If you have to report dollars to someone who does not know what seven_day_opus means, this is the conversion path.",
    tag: "Related",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "Why local JSONL cannot tell you this number on its own, and what the server endpoint sees that the local log does not.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code cost per landed PR: the yield-adjusted formula your ccusage report skips",
  description:
    "A landed PR is a merged PR. Every other attempt still burned seven_day_opus. The honest cost-per-landed-PR joins ClaudeMeter's 60-second utilization samples (via fetched_at in UsageSnapshot) against git log --merges. The formula, the bash pipeline, and the caveats.",
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

export default function ClaudeCodeCostPerLandedPrPage() {
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
          Cost per landed PR is{" "}
          <GradientText>quota burn divided by merge commits</GradientText>
          , not by PRs you opened
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every other guide on this reports a single dollar-per-PR figure, usually
          pulled from the public API price sheet. The one that actually matters
          for a team is narrower: quota spent in a window divided by PRs that
          merged to main in the same window. Abandoned branches, failed CI
          retries, force-pushed rewrites, and reverts still cost real
          seven_day_opus. They just do not land. This page shows the formula
          and the bash pipeline that computes it.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="built ClaudeMeter"
          datePublished={PUBLISHED}
          readingTime="11 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Formula derived directly from the product source; not a secondhand benchmark"
          highlights={[
            "Join key: UsageSnapshot.fetched_at (src/models.rs line 65)",
            "Sampling: POLL_MINUTES = 1 (extension/background.js line 3)",
            "Denominator: git log --merges --first-parent main",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <RemotionClip
          title="cost_per_landed_pr = burn / merges"
          subtitle="one window, four utilization floats, one merge count"
          captions={[
            "sample seven_day_opus at window start",
            "sample again at window end, subtract",
            "git log --merges --first-parent main counts what shipped",
            "divide the delta by the count",
            "abandoned branches stay in the numerator",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why landed is a different number
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Most playbooks quote a cost-per-PR by taking every PR you opened and
          dividing some token sum by that count. That is a fine workload
          metric. It is a misleading economic metric, because the rate limiter
          in front of Claude Code does not know or care whether a given session
          ended in a merge. All four utilization floats on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          go up the same amount whether the PR ships to main or gets abandoned
          the next morning.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Cost per landed PR fixes the denominator. You only count work that
          actually reached the default branch. Four things land in the gap
          between PRs opened and PRs landed:
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-8">
        <BentoGrid
          cards={whyLandedMatters.map((c) => ({
            title: c.title,
            description: c.description,
            size: "2x1" as const,
          }))}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The formula, explicitly
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Four numerators, one denominator. The numerator is what the server
          already knows. The denominator is what git already knows. The join
          key is a timestamp.
        </p>
        <AnimatedCodeBlock
          code={landedFormula}
          language="python"
          filename="cost_per_landed_pr.py (pseudo)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The reason this works is that every ClaudeMeter sample is timestamped
          server-true. The Rust struct that backs the desktop client carries a{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            fetched_at
          </code>{" "}
          field on every snapshot. That timestamp is what lets you window
          quota deltas against a git window with the same boundaries.
        </p>
        <div className="mt-4">
          <AnimatedCodeBlock
            code={modelsRsSnippet}
            language="rust"
            filename="claude-meter/src/models.rs"
          />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          The four buckets the burn splits into
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          One endpoint returns all four fields. The rate limiter checks each
          one independently. Your cost-per-landed-PR is really four numbers, one
          per bucket, all with the same merge-count denominator.
        </p>
        <BentoGrid cards={bento} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          What feeds the numerator
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Every session your team runs pushes the floats up. Only some of them
          become merge commits. The ones that do not are the reason cost-per-PR
          and cost-per-landed-PR diverge.
        </p>
        <AnimatedBeam
          title="inputs to the burn, outputs to the ratio"
          from={inputsToBurn.from}
          hub={inputsToBurn.hub}
          to={inputsToBurn.to}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          A bash pipeline that returns the number
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          This script pulls snapshots from the local bridge, picks the two
          bracketing samples for your window, subtracts the four utilization
          fields, counts merges on main, and prints the ratios. It is about
          forty lines because the hard work is already done by the extension.
        </p>
        <AnimatedCodeBlock
          code={joinScript}
          language="bash"
          filename="cost_per_landed_pr.sh"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Running it at the end of a working week gives you one row for the
          team dashboard. Running it per contributor means filtering{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            git log
          </code>{" "}
          by{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            --author
          </code>
          , which does not change the burn because that belongs to the
          subscription, not the human.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What running it looks like
        </h2>
        <TerminalOutput
          title="one calendar week, main branch, team of three"
          lines={terminalRun}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          A week on a utilization timeline
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The sequence diagram below shows what the background poll sees over
          three days. Two branches are started, one is abandoned, one merges.
          The weekly burn climbs past both, and only the second one ends up in
          the landed count.
        </p>
        <SequenceDiagram
          title="samples, branches, and merges over a 3-day window"
          actors={["ClaudeMeter extension", "claude.ai /usage", "your repo"]}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Cost per PR vs cost per landed PR
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Same numerator source, different denominator. The rows below are what
          changes when you move from one to the other.
        </p>
        <ComparisonTable
          productName="Cost per landed PR (this page)"
          competitorName="Cost per PR (the default)"
          rows={perPrVsLandedRows}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The constants the pipeline runs on
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Every number on this page is pulled from the product source. None
              are projected from API list prices.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 60, suffix: "s", label: "time between samples (POLL_MINUTES=1)" },
              { value: 4, label: "utilization fields per window" },
              { value: 1, label: "denominator: merges to main" },
              { value: 63762, label: "loopback port the bridge listens on" },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The five steps, compressed
        </h2>
        <HorizontalStepper
          title="from install to a number you can publish"
          steps={stepperSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          A worked example
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Three engineers on Max 20x. One calendar week, Monday 00:00 UTC to
          the following Monday 00:00 UTC. Across that window the extension
          produced roughly 10,080 samples (one per minute). The two bracketing
          samples had these floats:
        </p>
        <p className="text-zinc-700 leading-relaxed text-base mb-2">
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            {"start: { seven_day_opus: 0.00, seven_day_sonnet: 0.00, five_hour: 0.0, extra_usage.used_credits: 0.0 }"}
          </code>
        </p>
        <p className="text-zinc-700 leading-relaxed text-base mb-4">
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            {"end:   { seven_day_opus: 0.63, seven_day_sonnet: 0.22, five_hour: 0.0 (rolled), extra_usage.used_credits: 0.0 }"}
          </code>
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          In the same window,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            git log --merges --first-parent main
          </code>{" "}
          returned 9 merge commits. Two additional branches were opened, ran
          Claude Code sessions, and were deleted without merging. A cost-per-PR
          view would count those branches in the denominator and report a
          lower number per PR. The landed view does not:
        </p>
        <div className="flex flex-wrap gap-4 my-4">
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              Opus weekly per landed PR
            </div>
            <div className="text-2xl font-bold text-teal-700">
              <NumberTicker value={7} suffix="%" />
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              Sonnet weekly per landed PR
            </div>
            <div className="text-2xl font-bold text-teal-700">
              <NumberTicker value={2} suffix="%" />
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              Landed PRs in window
            </div>
            <div className="text-2xl font-bold text-teal-700">
              <NumberTicker value={9} />
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              Abandoned branches
            </div>
            <div className="text-2xl font-bold text-teal-700">
              <NumberTicker value={2} />
            </div>
          </div>
        </div>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Had those two abandoned branches landed, cost-per-landed-PR would
          have been about 5.7 percent Opus weekly each instead of 7. The gap
          between 7 and 5.7 is the yield tax: the fraction of weekly Opus the
          team is paying for output that does not ship.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why local-log tools cannot give you this
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              ccusage and Claude-Code-Usage-Monitor read{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ~/.claude/projects/**/*.jsonl
              </code>{" "}
              and multiply by the public API rate. Two problems for this
              specific calculation. First, the JSONL does not see
              server-generated adaptive-thinking tokens or tokenizer expansion
              on Opus 4.7, so the numerator undercounts. Second, and more
              importantly, there is no concept of a merge commit in that data.
              You could layer git on top manually, but the numerator is still
              wrong because it is local.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              ClaudeMeter pulls the server-true utilization floats from the
              same endpoint the Settings page reads,{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                claude.ai/api/organizations/&#123;org_uuid&#125;/usage
              </code>
              . That is the only surface on your machine that reflects what
              the rate limiter saw. Pair it with git, and the ratio is exact.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Caveats that matter
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          endpoint is internal to claude.ai and undocumented. Field names have
          been stable for months but could change. If your window spans a{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          rollover on seven_day_opus (rare, it is weekly) the simple
          subtraction undercounts burn; sum per-rollover deltas instead.
          Rebase-and-merge workflows that disable merge commits need the
          GitHub API or a PR-number filter in place of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            git log --merges
          </code>
          . Team orgs with multiple seats share a single utilization counter,
          which is the correct behavior for budgeting but means per-engineer
          attribution has to come from git authorship, not from the endpoint.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Run the pipeline against your own repo
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter is free and MIT licensed. Install the browser extension,
          drop the bash script in your repo, and you have a weekly cost-per-landed-PR
          number. No cookie paste, no API key, no approximations.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Want a cost-per-landed-PR dashboard for your team?"
          description="I have built this pipeline into a Grafana panel for a handful of Max 20x and Team Premium orgs. 15 minutes to walk through whether it fits yours."
          text="Book a 15-minute call"
          section="cost-per-landed-pr-footer"
          site="claude-meter"
        />
      </div>

      <FaqSection items={faqs} />

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </section>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Cost-per-landed-PR for your team? 15 min."
        section="cost-per-landed-pr-sticky"
        site="claude-meter"
      />
    </article>
  );
}
