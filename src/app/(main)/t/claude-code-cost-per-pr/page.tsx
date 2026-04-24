import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  BeforeAfter,
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
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-cost-per-pr";
const PUBLISHED = "2026-04-23";

export const metadata: Metadata = {
  title: "Claude Code Cost Per PR: What a Pull Request Actually Burns on Pro or Max",
  description:
    "On a Claude Code subscription the real cost of a PR is not a dollar figure. It is the delta in seven_day_opus.utilization between your first and last commit. Here is the formula, the endpoint, and why ccusage's dollar estimate is off for subscribers.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Code Cost Per PR: What a Pull Request Actually Burns on Pro or Max",
    description:
      "On a subscription plan, a PR does not cost dollars, it costs a fraction of your weekly Opus quota. Here is how to read the exact delta from claude.ai's usage endpoint.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "How do I actually measure what one PR costs on Claude Code?",
    a: "On a Pro or Max subscription, open claude.ai/settings/usage (or run ClaudeMeter) right before you start the session that becomes your PR, and record seven_day_opus.utilization and five_hour.utilization. Do the same right after the last commit. The delta on seven_day_opus is what the PR cost you against the Opus-only weekly ceiling. The delta on five_hour is what it cost against the shared 5-hour ceiling. You are not looking for dollars. You are looking for two fractions, both of which have to stay under 1.0 for your next Claude Code request to succeed.",
  },
  {
    q: "Why does ccusage give me a dollar amount that feels wrong?",
    a: "ccusage reads ~/.claude/projects/**/*.jsonl and multiplies the tokens it finds by the public API list price. That number is correct for API usage, where Anthropic actually bills you in dollars per million tokens. Subscribers do not pay that. You pay a flat $20, $100, or $200 a month. The 'dollar cost' your PR rang up is genuinely $0 beyond your subscription fee. The resource it consumed is a percentage of your rolling windows. That is what can run out mid-PR, and that is what ccusage has no way to read.",
  },
  {
    q: "What exact endpoint does ClaudeMeter hit to read the before/after floats?",
    a: "GET https://claude.ai/api/organizations/{your_org_uuid}/usage, the same endpoint the Settings page calls. The browser extension calls it at claude-meter/extension/background.js line 24 and polls every minute (POLL_MINUTES = 1 on line 3). The desktop Rust client calls the same URL at claude-meter/src/api.rs line 19. Both deserialize into the struct declared at claude-meter/src/models.rs line 19 to 28, so five_hour, seven_day, seven_day_sonnet, and seven_day_opus land in the same response.",
  },
  {
    q: "Is a 60-second poll really fast enough to measure a PR?",
    a: "For a realistic PR, yes. The two floats that matter on Opus 4.7 both update server-side within seconds of the request landing, and the resets_at rollover is either 5 hours out or days out. A PR that spans 20 minutes of Claude Code time gets sampled roughly 20 times by the extension. The math only breaks if your session crosses a five_hour resets_at, in which case the 5-hour float snaps back to 0 mid-session. seven_day_opus resets weekly so that almost never happens inside one PR.",
  },
  {
    q: "I use extra_usage credits to overflow. Does that show up in the delta?",
    a: "It shows up in a different field, not in seven_day_opus. Look at extra_usage.utilization in the same payload (field declared at claude-meter/src/models.rs line 10 to 16). Once your subscription floats hit 1.0, requests start burning overage credits instead of the weekly bucket, so seven_day_opus stops climbing and extra_usage.used_credits starts climbing. For an end-to-end PR cost on a subscriber who flipped to overage mid-session, you need three deltas: seven_day_opus, five_hour, and extra_usage.used_credits.",
  },
  {
    q: "Does a PR that uses only Sonnet touch seven_day_opus at all?",
    a: "No. Sonnet requests flow into five_hour (shared) and seven_day_sonnet (Sonnet-only weekly). seven_day_opus is untouched. That is why 'switch the small edits to Sonnet' is the most common cheap optimization, and why the cost of a PR depends heavily on which model ran which step. A PR with 10 percent Opus planning and 90 percent Sonnet cleanup can be cheaper on the Opus weekly float than a single deep Opus session even if the Sonnet run logged more tokens in ccusage.",
  },
  {
    q: "What about thinking tokens, do they count toward the PR's cost?",
    a: "Yes, and they are invisible to ccusage. Opus 4.7 runs adaptive thinking by default, with display set to omitted. Thinking content is generated server-side and billed against seven_day_opus, but it is not always written to your local JSONL in full. So the delta you read off the server endpoint is larger than the token sum ccusage would report for the same session. Both are real numbers, they just answer different questions: ccusage reports what your model output; the endpoint reports what your plan's rate limiter saw.",
  },
  {
    q: "How much of seven_day_opus does one PR typically burn?",
    a: "There is no honest universal answer because it depends on model mix, plan, effort level, and how agentic the session was. What the product gives you is the ability to measure your own number. Run ClaudeMeter during a single PR, note the delta, and you have your personal cost-per-PR on that plan. Published benchmarks that quote 'about 3 percent per PR' or 'Max 20x gets 100 PRs a week' are converting messages to floats through guesses; the delta on your own account is the only number the rate limiter cares about.",
  },
  {
    q: "Can I script this so every PR auto-logs its utilization delta?",
    a: "Yes. The extension posts every snapshot to a local bridge at http://127.0.0.1:63762/snapshots (extension/background.js line 2). If you run the desktop binary, it exposes the same data on the same loopback port. A git hook on post-commit that curls the bridge and appends seven_day_opus.utilization to a log file gives you a per-commit trail, and diffing the first and last sample for a branch gives you cost-per-PR directly. The endpoint returns JSON so the hook is about four lines of shell.",
  },
  {
    q: "Does this work for the Team or Enterprise plans?",
    a: "Yes, because the endpoint is per-organization. On a Team or Enterprise org, /api/organizations/{org_uuid}/usage still returns the same four utilization floats under the org you are authed into. Different plans just change the denominator baked into each utilization fraction. ClaudeMeter reads the fraction verbatim, so whatever plan you are on, the delta math is the same.",
  },
  {
    q: "What happens to my PR if five_hour hits 1.0 halfway through?",
    a: "The next Claude Code request returns 429, the session pauses, and the delta you measured up to that point is the partial cost of the PR so far. When five_hour rolls over (see resets_at in the same payload), the float drops and you can resume. The seven_day_opus float does not reset at that time, so the resume cost keeps accumulating on the weekly bucket. This is the main reason subscribers care about the delta, not about dollars: a PR that rang a 429 mid-session does not cost more money, but it did cost you real minutes of blocked Claude Code time.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code cost per PR", url: PAGE_URL },
];

const deltaFormula = `# Cost of one PR on a Claude Code subscription

before = GET /api/organizations/{org_uuid}/usage          # at first commit
after  = GET /api/organizations/{org_uuid}/usage          # at last commit

cost_per_pr = {
  "opus_weekly_fraction":  after.seven_day_opus.utilization - before.seven_day_opus.utilization,
  "five_hour_fraction":    after.five_hour.utilization      - before.five_hour.utilization,
  "sonnet_weekly_fraction":after.seven_day_sonnet.utilization - before.seven_day_sonnet.utilization,
  "overage_credits_spent": after.extra_usage.used_credits   - before.extra_usage.used_credits,
}`;

const backgroundJsPoll = `// claude-meter/extension/background.js  (lines 1-24)
const BASE = "https://claude.ai";
const BRIDGE = "http://127.0.0.1:63762/snapshots";
const POLL_MINUTES = 1;                                   // <-- the sampling cadence

// ...

async function fetchSnapshots() {
  const account = await fetchJSON(\`\${BASE}/api/account\`);
  const memberships = account.memberships || [];
  for (const m of memberships) {
    const org = m.organization?.uuid || m.uuid;
    // This is the server-truth endpoint that returns seven_day_opus,
    // five_hour, seven_day_sonnet, and extra_usage in one payload:
    usage = await fetchJSON(\`\${BASE}/api/organizations/\${org}/usage\`);
  }
}`;

const modelsRsSnippet = `// claude-meter/src/models.rs  (lines 18-28)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,   // shared across all models
    pub seven_day:            Option<Window>,   // all-models weekly
    pub seven_day_sonnet:     Option<Window>,   // Sonnet-only weekly
    pub seven_day_opus:       Option<Window>,   // Opus-only weekly  <-- most PRs land here
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,  // overage credits, separate field
}`;

const postCommitHook = `#!/usr/bin/env bash
# .git/hooks/post-commit
# Appends the four quota fractions at every commit to .git/cm-usage.log.
# Pair with the first snapshot on branch create to get PR cost on merge.

BRANCH=$(git rev-parse --abbrev-ref HEAD)
SHA=$(git rev-parse --short HEAD)
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# ClaudeMeter's local bridge — same port as extension/background.js line 2
curl -sf http://127.0.0.1:63762/snapshots \\
  | jq --arg b "$BRANCH" --arg s "$SHA" --arg t "$TS" \\
       '[$t, $b, $s,
         .[0].usage.five_hour.utilization,
         .[0].usage.seven_day_opus.utilization,
         .[0].usage.seven_day_sonnet.utilization,
         .[0].usage.extra_usage.used_credits] | @tsv' \\
  >> .git/cm-usage.log`;

const deltaCurl = [
  { type: "command" as const, text: "# before the PR: snapshot seven_day_opus and five_hour" },
  { type: "command" as const, text: "curl -s http://127.0.0.1:63762/snapshots | jq -c '.[0].usage | {five_hour, seven_day_opus}'" },
  { type: "output" as const, text: "{\"five_hour\":{\"utilization\":0.41},\"seven_day_opus\":{\"utilization\":0.62}}" },
  { type: "command" as const, text: "# ...work happens, Claude Code runs, commits land..." },
  { type: "command" as const, text: "# after the PR: snapshot again" },
  { type: "command" as const, text: "curl -s http://127.0.0.1:63762/snapshots | jq -c '.[0].usage | {five_hour, seven_day_opus}'" },
  { type: "output" as const, text: "{\"five_hour\":{\"utilization\":0.58},\"seven_day_opus\":{\"utilization\":0.66}}" },
  { type: "success" as const, text: "PR cost = seven_day_opus delta 0.04 (4% of weekly Opus) + five_hour delta 0.17 (17% of 5h shared)" },
];

const preconditionChecklist = [
  {
    text: "You sampled seven_day_opus.utilization once before the session that becomes the PR started, and once after the last commit. The delta is the PR cost on the Opus weekly float.",
  },
  {
    text: "You sampled five_hour.utilization at the same two points. This delta is what the PR cost against the shared rolling window every Claude Code request touches.",
  },
  {
    text: "Neither sample crossed a resets_at rollover. If the five_hour resets_at fell inside your PR, subtract across a reset and report the delta as 'incomplete' instead of treating it as the PR's true cost.",
  },
  {
    text: "You noted which model ran. Opus work hits seven_day_opus + five_hour; Sonnet work hits seven_day_sonnet + five_hour; tool calls and attachments count against whatever model was active when the call ran.",
  },
  {
    text: "You recorded extra_usage.used_credits in both snapshots. If either subscription float was >= 1.0 during the PR, the overage delta is part of the true cost.",
  },
];

const sequenceMessages = [
  { from: 0, to: 1, label: "first commit: GET /api/organizations/{org}/usage", type: "request" as const },
  { from: 1, to: 0, label: "{ seven_day_opus: 0.62, five_hour: 0.41 }", type: "response" as const },
  { from: 2, to: 1, label: "Claude Code Opus request (tool use, thinking, output)", type: "request" as const },
  { from: 1, to: 2, label: "increments seven_day_opus + five_hour server-side", type: "event" as const },
  { from: 0, to: 1, label: "next minute: POLL_MINUTES = 1 sample", type: "request" as const },
  { from: 1, to: 0, label: "{ seven_day_opus: 0.63, five_hour: 0.44 }", type: "response" as const },
  { from: 0, to: 1, label: "last commit: GET /api/organizations/{org}/usage", type: "request" as const },
  { from: 1, to: 0, label: "{ seven_day_opus: 0.66, five_hour: 0.58 }", type: "response" as const },
];

const dollarVsDeltaRows = [
  {
    feature: "What the source of truth is",
    competitor: "~/.claude/projects/**/*.jsonl (local log)",
    ours: "claude.ai/api/organizations/{org_uuid}/usage (server)",
  },
  {
    feature: "Matches what the rate limiter enforces",
    competitor: "No, converts via published API rate",
    ours: "Yes, same JSON Settings renders",
  },
  {
    feature: "Correct unit for subscribers",
    competitor: "Dollars (wrong, you paid flat)",
    ours: "Fraction of rolling window (correct)",
  },
  {
    feature: "Includes server-side tokenizer expansion",
    competitor: "No, pre-tokenizer count",
    ours: "Yes, post-tokenizer applied",
  },
  {
    feature: "Includes hidden adaptive-thinking tokens",
    competitor: "No, not written to JSONL in full",
    ours: "Yes, already in utilization",
  },
  {
    feature: "Needs you to be logged into claude.ai",
    competitor: "No",
    ours: "Yes",
  },
  {
    feature: "Works offline",
    competitor: "Yes",
    ours: "No",
  },
  {
    feature: "Usable on API-only accounts",
    competitor: "Yes, this is its best fit",
    ours: "No, subscriptions only",
  },
];

const prTimelineSteps = [
  {
    title: "First commit: take snapshot A",
    description:
      "Either click the ClaudeMeter menu bar, or curl the local bridge. Record five_hour.utilization and seven_day_opus.utilization. Put them in the PR description for future-you.",
  },
  {
    title: "Work the PR (Claude Code runs, commits land)",
    description:
      "The extension keeps sampling every minute in the background. You do not have to do anything. Each sample hits /api/organizations/{org_uuid}/usage and the floats drift upward in real time.",
  },
  {
    title: "Last commit: take snapshot B",
    description:
      "Same two fields, again. If you ran the post-commit hook you already have a sample at every commit and can point at the tightest before and after.",
  },
  {
    title: "Subtract to get the true PR cost",
    description:
      "opus_delta = B.seven_day_opus.utilization - A.seven_day_opus.utilization. five_hour_delta similarly. Those two numbers are what the PR cost you on this plan, full stop. Multiply by the weekly budget (implicit in utilization=1.0) for a plan-adjusted picture.",
  },
  {
    title: "If a sample crossed a reset, flag it",
    description:
      "five_hour.resets_at rolls roughly every 5 hours. If it fell inside your PR window the simple subtraction understates cost. ClaudeMeter stores resets_at on every Window, so the post-commit hook can detect it and mark the delta incomplete.",
  },
];

const articleJsonLd = articleSchema({
  headline: "Claude Code cost per PR: what a pull request actually burns on Pro or Max",
  description:
    "On a Claude Code subscription, the real cost of a PR is a delta in seven_day_opus.utilization, not a dollar figure. The claude.ai usage endpoint returns the four fractions that the rate limiter enforces. Every 60 seconds ClaudeMeter samples that endpoint, which is the cadence required to compute cost-per-PR honestly.",
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

const relatedPosts = [
  {
    href: "/t/claude-code-opus-4-7-usage-limits",
    title: "Claude Code Opus 4.7 usage limits: the two server floats that gate you",
    excerpt:
      "The seven_day_opus field is the Opus-only weekly float. Where it lives, how the 4.7 tokenizer fills it faster, and how to read it live.",
    tag: "Related",
  },
  {
    href: "/t/claude-pro-5-hour-window-quota",
    title: "Claude Pro's 5-hour window is one float on a sliding clock",
    excerpt:
      "The 5-hour bucket is not a 45-message counter. It is a utilization fraction on a rolling clock, returned on the same /usage endpoint.",
    tag: "Related",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage sums local tokens and multiplies by public API rates. ClaudeMeter reads the four server-side utilization floats. Different questions, different answers.",
    tag: "Compare",
  },
];

export default function ClaudeCodeCostPerPrPage() {
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
          What a Claude Code PR actually costs is{" "}
          <GradientText>a delta on seven_day_opus.utilization</GradientText>
          , not a dollar amount
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every cost guide on this topic converts your local token log to a
          dollar figure. That number answers a question API users are asking.
          If you are on Pro, Max, Team, or Enterprise, you already paid a flat
          fee and the thing a PR actually spent is a fraction of your rolling
          windows. This page is about how to measure that fraction, because
          the rate limiter in front of Claude Code cares about it and Stripe
          does not.
        </p>
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
          ratingCount="Every formula on this page is pulled from the same endpoint the Settings page calls"
          highlights={[
            "Formula from claude-meter/src/models.rs line 19 to 28",
            "Poll cadence from extension/background.js line 3",
            "Verifiable in 30 seconds with two curl calls",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <RemotionClip
          title="cost_per_pr is a subtraction, not a multiplication"
          subtitle="Two samples from claude.ai/api/organizations/{org}/usage, one at first commit, one at last"
          captions={[
            "before: seven_day_opus.utilization = 0.62",
            "after:  seven_day_opus.utilization = 0.66",
            "delta:  0.04 = 4% of your weekly Opus ceiling",
            "five_hour delta tracks separately",
            "no dollars involved, because you paid flat",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The one-paragraph version
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          On any Claude Code subscription (Pro, Max 5x, Max 20x, Team Premium,
          Enterprise) you do not pay per PR in dollars. You pay a flat monthly
          fee. What a PR costs you is a fraction of four rolling buckets on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/api/organizations/&#123;org_uuid&#125;/usage
          </code>
          :{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_sonnet
          </code>
          , and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extra_usage
          </code>
          . The only honest cost-per-PR is the delta on those four fields
          between your first and last commit. That delta is what the rate
          limiter checks. Anything else, including every &quot;PR cost about
          $0.47&quot; estimate you will see online, is a dollar projection from
          your local JSONL against public API rates and has no relationship to
          your actual spend on a subscription plan.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The formula, in one code block
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Two snapshots of the same endpoint, subtracted field by field. That
          is the whole mechanism:
        </p>
        <AnimatedCodeBlock
          code={deltaFormula}
          language="python"
          filename="cost_per_pr.py (pseudo)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The four deltas answer different questions. The Opus weekly delta is
          usually what you care about because it is the scarcest bucket for
          most Claude Code users in 2026. The five-hour delta tells you
          whether this PR pushed you toward a same-day 429. The Sonnet weekly
          delta captures any cleanup / test-writing work you shunted to
          Sonnet. The overage credits delta only moves if one of the
          subscription floats hit 1.0 mid-session.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: 60-second server-truth polling
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          For the delta to be accurate, the sampling cadence has to be tight
          enough that a typical PR is covered by more than one sample. The
          extension is configured for that at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            POLL_MINUTES = 1
          </code>{" "}
          on line 3 of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude-meter/extension/background.js
          </code>
          . Every minute it hits the same{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          endpoint the Settings page reads, posts the JSON to a local bridge,
          and updates the menu-bar badge:
        </p>
        <AnimatedCodeBlock
          code={backgroundJsPoll}
          language="javascript"
          filename="claude-meter/extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          And here is the full struct the desktop client deserializes the
          response into. Every field that can appear in a cost-per-PR delta is
          named here. There is no seven_day_4.7 bucket. Opus 4.7 and 4.6 both
          write to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>
          :
        </p>
        <AnimatedCodeBlock
          code={modelsRsSnippet}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Dollar estimate vs utilization delta
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Toggle between the two ways to report &quot;what this PR cost.&quot;
          One is the number ccusage, Claude-Code-Usage-Monitor, and most blog
          posts return. The other is the number Anthropic&apos;s rate limiter
          actually checks.
        </p>
        <BeforeAfter
          before={{
            label: "Dollar estimate (from local logs)",
            content:
              "Sum every token in ~/.claude/projects/**/*.jsonl for the branch lifetime. Multiply input tokens by $15/1M (Opus 4.7 input). Multiply output tokens by $75/1M (Opus 4.7 output). Report the result as 'this PR cost $X.XX'.",
            highlights: [
              "Ignores you already paid flat for the subscription",
              "Misses adaptive-thinking tokens the server kept hidden",
              "Misses the 1.0x to 1.35x tokenizer expansion on 4.7",
              "Misses peak-hour multipliers and plan denominators",
              "Gives a number that has nothing to do with your 429 risk",
            ],
          }}
          after={{
            label: "Utilization delta (from the server)",
            content:
              "Snapshot seven_day_opus.utilization, five_hour.utilization, seven_day_sonnet.utilization, and extra_usage.used_credits at first commit and last commit. Subtract. Report four deltas as 'this PR cost X% Opus weekly, Y% 5-hour, Z% Sonnet weekly, $K overage'.",
            highlights: [
              "Matches the exact fractions the rate limiter enforces",
              "Already includes server-side tokenizer expansion",
              "Already includes hidden adaptive-thinking tokens",
              "Already includes any peak-hour multiplier applied",
              "Maps directly to 'how many more PRs I can ship this week'",
            ],
          }}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          What the browser does while you work the PR
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Three actors: your git working copy, the Anthropic server, and the
          ClaudeMeter extension polling in the background. Each request moves
          the floats. Each sample captures where they landed.
        </p>
        <SequenceDiagram
          title="PR lifetime on Claude Code, as utilization floats"
          actors={["git + extension", "claude.ai /usage", "Claude Code Opus"]}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Measuring one PR from the command line
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter exposes the live snapshot on a local bridge at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            http://127.0.0.1:63762/snapshots
          </code>{" "}
          (same port the extension posts to). Two curl calls plus jq, one at
          the start of the branch and one at the end, get you the four
          deltas:
        </p>
        <TerminalOutput
          title="measuring one PR, no extra tooling"
          lines={deltaCurl}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Per-commit logging with a post-commit hook
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          If you want a dense sampling across the PR without remembering to
          snapshot, drop this in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            .git/hooks/post-commit
          </code>{" "}
          for the repo. Every commit writes a TSV line with the branch, the
          short SHA, and the four fractions at that moment. Diff the first
          and last rows for a branch when you merge:
        </p>
        <AnimatedCodeBlock
          code={postCommitHook}
          language="bash"
          filename=".git/hooks/post-commit"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why local-log tools cannot give you this number
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              ccusage and Claude-Code-Usage-Monitor both work off{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ~/.claude/projects/**/*.jsonl
              </code>
              . They sum tokens, multiply by the public API rate, and return a
              dollar figure. If you are on the API, that number is the truth.
              If you are on a subscription, it answers the wrong question.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              Three reasons the local-token approach undercounts compared to
              what the rate limiter saw. First, Opus 4.7&apos;s tokenizer
              expands the same text to 1.0x to 1.35x more tokens than 4.6, and
              the expansion happens server-side, after the JSONL is written.
              Second, Opus 4.7 runs adaptive thinking with{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                display: omitted
              </code>{" "}
              by default, so thinking content is generated server-side and
              billed against{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                seven_day_opus
              </code>{" "}
              but not always logged locally in full. Third, Anthropic applies
              peak-hour multipliers and plan-specific denominators before
              writing to the float, and those are server-private.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              All three land on the four numbers in the{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /usage
              </code>{" "}
              payload. That is the only place on your machine where the
              rate-limiter-honest cost-per-PR is computable.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Everything that flows into your PR&apos;s utilization delta
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          None of these are fields in the response. They all collapse into
          the four utilization fractions, which is why the delta is the only
          honest measurement.
        </p>
        <AnimatedBeam
          title="inputs to the cost of one PR"
          from={[
            { label: "Tokens in your prompt", sublabel: "tokenizer 1.0x to 1.35x on Opus 4.7" },
            { label: "Thinking tokens", sublabel: "generated server-side, often hidden" },
            { label: "Tool calls", sublabel: "code exec, web fetch, file IO" },
            { label: "Attachments", sublabel: "screenshots, PDFs, large files" },
            { label: "Peak-hour multiplier", sublabel: "weekday midday Pacific" },
            { label: "Model mix", sublabel: "Opus vs Sonnet split across the PR" },
          ]}
          hub={{
            label: "4 utilization floats",
            sublabel: "five_hour, seven_day_opus, seven_day_sonnet, extra_usage",
          }}
          to={[
            { label: "ClaudeMeter sample A (first commit)" },
            { label: "ClaudeMeter sample B (last commit)" },
            { label: "PR cost = B - A" },
          ]}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The numbers this page is built on
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              All four come straight from the product source; none are
              invented benchmarks or projected dollar figures.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 4, label: "utilization fields a PR can move" },
              { value: 1, label: "endpoint that returns all four" },
              { value: 60, suffix: "s", label: "extension poll cadence (POLL_MINUTES = 1)" },
              { value: 0, prefix: "$", label: "extra dollars per PR on a flat subscription" },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          How to run the measurement, step by step
        </h2>
        <StepTimeline
          title="measuring cost_per_pr on a subscription"
          steps={prTimelineSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Preconditions for an accurate delta
        </h2>
        <AnimatedChecklist
          title="before you trust the cost_per_pr number"
          items={preconditionChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Side by side: which cost is the cost?
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Both answer something real. Only one answers the question
          subscribers are actually asking when they look up &quot;cost per
          PR.&quot;
        </p>
        <ComparisonTable
          productName="ClaudeMeter (utilization delta)"
          competitorName="Local log + API rate"
          rows={dollarVsDeltaRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          A worked example in numbers you can verify
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Pick a branch where Claude Code did most of the work. Before the
          first commit, the extension recorded (from the local bridge at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            127.0.0.1:63762
          </code>
          ):
        </p>
        <p className="text-zinc-700 leading-relaxed text-base mb-2">
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            {"{ five_hour: 0.41, seven_day_opus: 0.62, seven_day_sonnet: 0.11, extra_usage.used_credits: 0.0 }"}
          </code>
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4 mb-4">
          You wrote specs, ran Claude Code on Opus for planning, switched to
          Sonnet for the implementation, merged. Last commit snapshot:
        </p>
        <p className="text-zinc-700 leading-relaxed text-base mb-4">
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            {"{ five_hour: 0.58, seven_day_opus: 0.66, seven_day_sonnet: 0.19, extra_usage.used_credits: 0.0 }"}
          </code>
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-2">
          Subtract:
        </p>
        <div className="flex flex-wrap gap-4 my-4">
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              five_hour delta
            </div>
            <div className="text-2xl font-bold text-teal-700">
              <NumberTicker value={17} suffix="%" />
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              seven_day_opus delta
            </div>
            <div className="text-2xl font-bold text-teal-700">
              <NumberTicker value={4} suffix="%" />
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              seven_day_sonnet delta
            </div>
            <div className="text-2xl font-bold text-teal-700">
              <NumberTicker value={8} suffix="%" />
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              overage spent
            </div>
            <div className="text-2xl font-bold text-teal-700">$0</div>
          </div>
        </div>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          &quot;This PR cost me 4 percent of my Opus weekly, 8 percent of my
          Sonnet weekly, and 17 percent of my 5-hour rolling window, with no
          overage.&quot; That is a sentence the rate limiter agrees with. A
          dollar figure from ccusage would have said &quot;$2.40,&quot; and
          neither you nor Anthropic would charge that.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          endpoint is internal to claude.ai and undocumented. Field names
          have been stable for many months and are named the same in the
          Settings page&apos;s own JavaScript, but Anthropic could rename,
          split, or remove them at any release. ClaudeMeter deserializes into
          a strict Rust struct, so if the shape shifts the macOS app surfaces
          a parse error and the project patches it. If your plan is API-only
          and you pay per million tokens, the dollar-per-PR view is the
          correct one; ccusage is the right tool for that, and this page does
          not replace it. The delta view is specifically for the Claude Code
          Pro, Max, Team, and Enterprise subscriber who wants to know what a
          PR costs them against their actual plan, not against a public API
          price sheet.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Measure your own cost-per-PR live
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter sits in your macOS menu bar and refreshes the four
          utilization floats every 60 seconds. Free, MIT licensed, no cookie
          paste, reads the same JSON the Settings page reads.
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
          heading="Want a cost-per-PR dashboard wired into CI?"
          description="I have built the post-commit hook plus a Grafana panel for teams on Max 20x and Team Premium. 15 minutes to walk through whether it fits."
          text="Book a 15-minute call"
          section="cost-per-pr-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on cost-per-PR on a subscription? 15 min."
        section="cost-per-pr-sticky"
        site="claude-meter"
      />
    </article>
  );
}
