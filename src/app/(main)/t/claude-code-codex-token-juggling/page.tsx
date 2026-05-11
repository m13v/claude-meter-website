import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  TerminalOutput,
  AnimatedCodeBlock,
  ComparisonTable,
  BeforeAfter,
  GlowCard,
  GradientText,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-code-codex-token-juggling";
const PUBLISHED = "2026-05-10";

export const metadata: Metadata = {
  title:
    "Claude Code + Codex Token Juggling: Two CLIs, One Plan-Shape, Independent Clocks",
  description:
    "Both Claude Code and Codex now ship the same plan caps: a rolling 5-hour bucket plus a weekly bucket. They reset on different clocks. Here is the juggle pattern that uses that asymmetry, and the one piece of plumbing it needs to actually work proactively.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code + Codex Token Juggling: Two CLIs, One Plan-Shape, Independent Clocks",
    description:
      "The juggle works because the two agents wear identical plan caps with different reset clocks. Codex shows its gauge inside the CLI; Claude shows its gauge on a web page. Bridge that gap and the juggle becomes a glance.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code + Codex token juggling", url: PAGE_URL },
];

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Guides", href: "https://claude-meter.com/t" },
  { label: "Claude Code + Codex token juggling" },
];

const faqs = [
  {
    q: "What does 'token juggling' between Claude Code and Codex actually mean?",
    a: "It is the workflow where you run both CLIs on the same machine, default to one, and switch the active session to the other the moment the first agent's plan bucket is about to wall. The 'tokens' you are juggling are not raw model tokens, they are plan-quota utilization fractions: how much of your 5-hour bucket on each side is spent. The point is to keep one continuous flow of work moving without paying metered API rates and without waiting hours for a single vendor's window to roll.",
  },
  {
    q: "Why does the juggle work? Are these not the same model anyway?",
    a: "The juggle works because both vendors ship the same plan shape: a rolling 5-hour bucket plus a weekly bucket, gated server-side, charged against your subscription. Anthropic Pro/Max enforces this through /api/oauth/usage and /api/organizations/{uuid}/usage. OpenAI Codex enforces it through its own usage dashboard and surfaces it inside the CLI as /status. The two clocks are independent. Your Claude five_hour window resets on Anthropic's schedule, your Codex 5h limit resets on OpenAI's schedule, and the two virtually never coincide. While one is at 98% the other is almost always at 30% or less.",
  },
  {
    q: "What does Codex's /status output look like, and what does claude-meter show?",
    a: "Per openai/codex issue 18742, Codex /status prints something like '5h limit: [████████████████░░] 82% left (resets 15:18)' and 'Weekly limit: [████████░░░░░░░░░░░░░░] 36% left (resets 03:08)'. ClaudeMeter prints the Anthropic-side equivalent in your macOS menu bar: a 5-hour row and a weekly row with utilization percent and resets_at timestamp for each. Same gauge, same units, different vendor. Both are 'percent of bucket spent, time until reset'.",
  },
  {
    q: "Why not just run both agents at once and let them race?",
    a: "Because in practice each agent edits the same files in the same repo, so two parallel sessions trample each other's diffs and you spend more time merging than coding. The juggle is sequential, not parallel. One agent is the active driver, the other is on standby with a fresh 5-hour bucket. The switch is a context handoff, not a fork. The interesting question is when to do the handoff, and the answer is 'before the wall, not after'.",
  },
  {
    q: "What is the 95% rule and why that number?",
    a: "Flip to the other agent when the current one's five_hour bucket crosses 0.95 utilization. The reason it is 95 and not 100: a 429 mid-tool-call usually leaves the active CLI holding partial output and a pending edit, which costs you a few minutes of context rebuild every time you re-enter the session. Flipping at 95% gives you 5% of headroom to finish the current turn cleanly, save state, and hand off without losing context. The 5% number is rough; if your turns are huge (large refactors), drop to 85%. If your turns are small (Q&A, single-file edits), 97% is fine.",
  },
  {
    q: "Why can ccusage not drive this?",
    a: "ccusage reads ~/.claude/projects/<project>/<session>.jsonl and prices the tokens against a model card. That is local-truth: tokens that left your machine, dollars per million. The plan caps you actually care about for juggling live on Anthropic's servers as utilization fractions on /api/oauth/usage, and on OpenAI's servers as the percentages Codex /status pulls down. ccusage cannot see either of those numbers. ClaudeMeter reads the Anthropic one. Codex /status reads the OpenAI one. The two complement each other; ccusage is a third lens (tokens) that does not help with the juggle decision.",
  },
  {
    q: "What about the weekly bucket? Does the juggle save me if I hit it?",
    a: "The 5-hour juggle, yes. The weekly juggle, partially. If your Claude seven_day_oauth_apps fires on a Wednesday, the rolling weekly window will not save you for days. But if your Codex weekly is still at 30%, you have most of a week of headroom on the other side. The juggle becomes 'switch fully to Codex for the rest of this Anthropic week, then back when it rolls'. ClaudeMeter shows seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps individually (see src/models.rs lines 18-28 of the open-source repo) so you can see exactly which weekly bucket fired before you commit to a full-week switch.",
  },
  {
    q: "Does the juggle change how Anthropic or OpenAI bills me?",
    a: "No. Each session bills against the plan whose CLI you are running. Time spent in Claude Code charges against your Anthropic plan; time in Codex charges against your ChatGPT plan. You are not paying API rates anywhere as long as you stay inside the two plan envelopes. The juggle is two subscription plans cooperating, not metered billing kicking in. The economics work because $20 ChatGPT Plus + $20 Claude Pro = $40 covers more agentic-loop time than $200 spent on one vendor's top tier once you hit weekly caps, for many workloads.",
  },
  {
    q: "What is the one piece of plumbing I actually need to make this work?",
    a: "Visibility on the Anthropic side, outside of claude.ai. Codex already prints its gauge in /status inside the CLI session. Claude does not have an equivalent during an active agent loop; the only place to see your real utilization is claude.ai/settings/usage in a browser tab, which you have to remember to refresh. ClaudeMeter pulls the same JSON that page renders and puts it in your menu bar so the gauge is always glanceable. Without it, the juggle is reactive (you wait for the 429, lose the in-flight turn, then switch). With it, the juggle is proactive (you see 94% on the bar, finish your current message, type the same prompt into the other CLI).",
  },
  {
    q: "Is ClaudeMeter free, and what does it touch on my machine?",
    a: "Free, MIT licensed, source at github.com/m13v/claude-meter. The browser extension makes one HTTPS request per minute to claude.ai using the cookies your browser already holds, then POSTs the JSON snapshot to a localhost bridge at 127.0.0.1:63762 that the menu bar app listens on. No telemetry, no cloud account, no analytics. It does not touch Codex or your OpenAI account at all; Codex's gauge stays inside its own CLI. The juggle is a workflow, not a unified dashboard.",
  },
];

const comparisonRows = [
  {
    feature: "5-hour rolling bucket",
    competitor: "Codex CLI: 5h limit, shared between local messages and cloud tasks",
    ours: "Claude Code: five_hour bucket on /api/oauth/usage, same shape",
  },
  {
    feature: "Weekly bucket",
    competitor: "Codex CLI: Weekly limit, separate from 5h",
    ours: "Claude Code: seven_day (plus per-model splits like seven_day_opus, seven_day_oauth_apps)",
  },
  {
    feature: "Gauge inside the active CLI",
    competitor: "Codex: /status prints percent left and resets_at",
    ours: "Claude Code: /usage prints a one-shot snapshot; not surfaced during an active loop",
  },
  {
    feature: "Gauge outside the CLI",
    competitor: "Codex: usage dashboard at chatgpt.com/codex/pricing",
    ours: "Claude: claude.ai/settings/usage (web page, manual refresh)",
  },
  {
    feature: "Glanceable signal for the juggle decision",
    competitor: "Codex: nothing menu-bar; you alt-tab to chat or run /status mid-session",
    ours: "Claude: ClaudeMeter puts five_hour and seven_day in the menu bar, polled every 60s",
  },
  {
    feature: "What 'walled' looks like",
    competitor: "Codex: usage limit reached message, exact bucket named",
    ours: "Claude Code: 429 rate_limit_error with a generic 'limit reached' string, bucket NOT named",
  },
];

const codexTerminal = [
  { type: "command" as const, text: "codex" },
  { type: "info" as const, text: "Codex 0.x running, GPT-5.5 default" },
  { type: "command" as const, text: "> /status" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "Codex usage" },
  { type: "output" as const, text: "-----------" },
  { type: "output" as const, text: "5h limit:     [████████████░░░░░░] 33% left   (resets 18:18)" },
  { type: "output" as const, text: "Weekly limit: [████████████████░░░░] 78% left   (resets Fri 03:08)" },
  { type: "info" as const, text: "" },
  { type: "info" as const, text: "(Pro 5x plan, GPT-5.5)" },
];

const claudeTerminal = [
  { type: "command" as const, text: "claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour            94.0% used  -> resets Sun May 10 21:00 (in 0h 47m)" },
  { type: "output" as const, text: "7-day all         62.0% used  -> resets Wed May 13 04:00 (in 3d 8h)" },
  { type: "output" as const, text: "7-day Opus        71.0% used  -> resets Wed May 13 04:00 (in 3d 8h)" },
  { type: "output" as const, text: "7-day OAuth apps  58.0% used  -> resets Wed May 13 04:00 (in 3d 8h)" },
  { type: "info" as const, text: "" },
  { type: "info" as const, text: "(Max 5x plan, Opus 4.7)" },
  { type: "success" as const, text: "five_hour at 0.94, ten minutes from the wall. Time to juggle." },
];

const aliasScript = `# ~/.zshrc, ~/.bashrc, or wherever you keep aliases
# Two one-liners so the handoff is muscle memory, not typing.

# Drive Claude Code (default)
alias dr='claude'

# Drive Codex (the standby agent)
alias dr2='codex'

# Optional: a 'who has headroom?' one-liner
# Pulls Anthropic side from claude-meter, leaves the Codex side to /status inside the codex session.
who_has_headroom() {
  local five_hour
  five_hour=$(claude-meter --json 2>/dev/null \\
    | jq -r '.[0].usage.five_hour.utilization')
  if [ -z "$five_hour" ] || [ "$five_hour" = "null" ]; then
    echo "claude: no signal. run /status inside codex to check the other side."
    return
  fi
  echo "claude five_hour: $five_hour"
  if (( $(echo "$five_hour > 0.95" | bc -l) )); then
    echo "  -> juggle. drop to codex, run /status to confirm it has room."
  else
    echo "  -> stay on claude."
  fi
}`;

const articleJsonLd = articleSchema({
  headline:
    "Claude Code + Codex token juggling: two CLIs, one plan-shape, independent clocks",
  description:
    "Both Claude Code and Codex ship the same plan caps (5-hour rolling + weekly bucket) on independent reset clocks. The juggle pattern exploits that asymmetry. ClaudeMeter is the plumbing that makes it proactive instead of reactive.",
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

export default function ClaudeCodeCodexTokenJugglingPage() {
  return (
    <article className="text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd, faqJsonLd]),
        }}
      />

      <div className="py-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-4xl mx-auto px-6 pb-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          Claude Code + Codex token juggling:{" "}
          <GradientText>two CLIs, one plan-shape, two clocks.</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-700 leading-relaxed max-w-3xl">
          Both agents now wear the same plan caps: a rolling 5-hour bucket and a
          weekly bucket. The reset clocks are independent. That is the entire
          mechanic the juggle exploits. The only thing in the way is that each
          vendor only shows you its own gauge.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="7 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <GlowCard>
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold">
              Direct answer (verified 2026-05-10)
            </p>
            <p className="mt-3 text-zinc-900 text-lg leading-relaxed">
              Run both Claude Code and Codex. Watch each CLI&rsquo;s plan gauge:
              Codex prints its 5-hour and weekly bars inside{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /status
              </code>{" "}
              (
              <a
                className="text-teal-700 underline"
                href="https://developers.openai.com/codex/pricing"
              >
                pricing page
              </a>
              ); Claude exposes the same fractions on{" "}
              <a
                className="text-teal-700 underline"
                href="https://claude.ai/settings/usage"
              >
                claude.ai/settings/usage
              </a>
              , and{" "}
              <a
                className="text-teal-700 underline"
                href="https://github.com/m13v/claude-meter"
              >
                ClaudeMeter
              </a>{" "}
              puts those same fractions in your macOS menu bar. The juggle rule
              is one line: when the current agent&rsquo;s 5-hour bucket crosses{" "}
              <strong>0.95</strong>, finish the in-flight turn, paste the same
              prompt into the other agent, and keep going. The two reset clocks
              are independent, so the standby agent almost always has bucket
              headroom.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why people search for &ldquo;token juggling&rdquo;
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The classic version of this complaint shows up on X every Sunday
          evening: someone is mid-refactor on Claude Code Opus, the agent
          touched twelve files, and a 429 fires with a generic{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            rate_limit_error: limit reached on this plan
          </code>{" "}
          string. The CLI does not name the bucket. The settings page in the
          other tab says the rolling 5-hour window resets in three hours. Three
          hours is too long. So you open Codex in another terminal, paste in
          the same prompt, and keep going. That is the juggle.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          What is new in 2026 is that both vendors now run the same plan
          architecture. Anthropic Pro/Max has been on rolling 5-hour + weekly
          buckets for most of the year. OpenAI&rsquo;s{" "}
          <a
            className="text-teal-700 underline"
            href="https://developers.openai.com/codex/pricing"
          >
            April 2 pricing update
          </a>{" "}
          moved Codex onto the same 5-hour-shared-between-local-and-cloud-tasks
          model with weekly limits on top. Two coding agents, same plan-shape,
          two independent reset schedules. The juggle is the obvious workflow
          consequence of that.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The two plan-shapes, side by side
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Isomorphic. The only meaningful difference is{" "}
          <em>where you read the gauge</em>.
        </p>
        <ComparisonTable
          productName="Claude Code (Anthropic Pro/Max)"
          competitorName="Codex CLI (ChatGPT Plus/Pro)"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the two gauges actually look like
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Here is the standby agent (Codex) with a fresh-ish bucket. Run{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /status
          </code>{" "}
          inside the active session per the openai/codex repo&rsquo;s{" "}
          <a
            className="text-teal-700 underline"
            href="https://github.com/openai/codex/issues/19555"
          >
            issue #19555
          </a>{" "}
          conventions:
        </p>
        <TerminalOutput title="codex (standby)" lines={codexTerminal} />
        <p className="text-zinc-700 leading-relaxed text-lg mt-8 mb-6">
          And here is the active agent (Claude Code), printed by{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude-meter
          </code>{" "}
          straight from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/oauth/usage
          </code>
          . Note that{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          is at 94% and the Codex side is at 67% remaining. That is the moment
          to juggle.
        </p>
        <TerminalOutput title="claude (active)" lines={claudeTerminal} />
        <p className="text-zinc-700 leading-relaxed text-base mt-6 text-zinc-600">
          The fields are stable. The Rust schema in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude-meter/src/models.rs
          </code>{" "}
          lines 18-28 declares{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>{" "}
          as the public contract, so anything you build on top of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude-meter --json
          </code>{" "}
          will not silently move.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reactive juggle vs proactive juggle
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Most people start with the reactive version because it is what
          naturally happens the first time. The proactive version takes one
          piece of plumbing and a habit. The cost difference between the two is
          the difference between &ldquo;most of an afternoon&rdquo; and
          &ldquo;all of an afternoon&rdquo;.
        </p>
        <BeforeAfter
          before={{
            label: "Reactive (default)",
            content:
              "You are deep in a Claude Code refactor. The 429 fires. Mid-tool-call. Partial diff applied, half a migration written, Claude was about to run cargo check. You see 'limit reached', stop, copy the last few user prompts into a note, open a new terminal, start codex, paste them back, ask Codex to also catch up on what was happening. Five to ten minutes lost every cycle. Repeat three times a day and you have lost half an hour to handoff overhead alone.",
            highlights: [
              "Mid-tool-call 429 leaves Claude Code holding partial state",
              "You only learn what bucket fired by alt-tabbing to claude.ai/settings/usage",
              "Context handoff to Codex is manual and lossy",
              "Both sides are unaware of each other, so you re-explain what you were doing",
            ],
          }}
          after={{
            label: "Proactive (with claude-meter)",
            content:
              "The menu bar shows five_hour at 94%. You finish the current turn cleanly, ask Claude Code to write a one-paragraph 'where we are' note, paste the same /codex prompt with that note prepended. Codex picks up from the same state, on its own fresh 5-hour bucket. Total handoff cost: 30 seconds and one paragraph. The wall never fires because you switched before it did. Net effect: you stay in flow on Claude until the bucket is genuinely spent, then you ride Codex while Claude rolls.",
            highlights: [
              "Glanceable gauge means the 95% trigger is a non-event",
              "Last turn finishes cleanly, so there is real state to hand off",
              "Codex bucket is still fresh because the clocks are independent",
              "Switch back the moment claude-meter shows five_hour < 0.50 again",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The handoff itself, two aliases and one optional helper
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The juggle does not need a clever script. It needs two short aliases
          so the switch is a single keystroke difference, and an optional
          one-liner that reads{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude-meter --json
          </code>{" "}
          if you want a shell hint without looking at the menu bar.
        </p>
        <AnimatedCodeBlock
          code={aliasScript}
          language="bash"
          filename="~/.zshrc"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The Codex half is unchanged from default: you run{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            codex
          </code>{" "}
          and ask{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /status
          </code>{" "}
          inside the session to read its gauge. (
          <a
            className="text-teal-700 underline"
            href="https://github.com/openai/codex/issues/18742"
          >
            Issue #18742
          </a>{" "}
          notes a known quirk where the first{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /status
          </code>{" "}
          after launch can show stale numbers; run it twice to get a current
          read.) The Claude half is where the plumbing matters: without
          ClaudeMeter you have no live signal, so your 95% trigger turns into
          &ldquo;check claude.ai in the other tab every few minutes&rdquo;,
          which nobody actually does and that is why the wall hits in the first
          place.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What this is not
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          It is not a unified dashboard. ClaudeMeter reads the Anthropic side
          only; it does not touch your OpenAI account, does not poll Codex,
          does not even know Codex exists. The Codex gauge stays inside the
          Codex CLI where{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /status
          </code>{" "}
          puts it. You are still the orchestrator. The thing the menu bar adds
          is the one piece of state that was previously only on a web page, so
          the handoff decision becomes a glance instead of a context switch.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          It is also not a way to dodge weekly walls indefinitely. If both your
          weekly buckets are spent, you are out for the rest of the cycle on
          both vendors, and the only fixes are (a) Anthropic&rsquo;s metered
          extra-usage (visible as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extra_usage
          </code>{" "}
          on the same JSON; ClaudeMeter renders it as a third row when it is
          enabled), (b) the OpenAI API at metered token rates, or (c) actually
          waiting for the rolling weekly window to roll. The juggle handles 5-hour
          walls and most weekly walls if you only hit one vendor&rsquo;s
          weekly cap before the other.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          And it is not, finally, a token counter. If you want to know how many
          input/output tokens Claude Code sent today,{" "}
          <a
            className="text-teal-700 underline"
            href="https://github.com/ryoppippi/ccusage"
          >
            ccusage
          </a>{" "}
          reads{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/&lt;project&gt;/&lt;session&gt;.jsonl
          </code>{" "}
          and prices it for you. That is local-truth, dollars and tokens.
          ClaudeMeter is plan-truth: the utilization fraction Anthropic
          actually enforces. They are different numbers, both useful, neither
          replaces the other.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want help wiring this into your daily flow?"
          description="Book 20 minutes and we will set up ClaudeMeter against your real claude.ai session, walk through the 95% rule on your machine, and confirm the Codex handoff works on your shell."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Frequently asked
        </h2>
        <FaqSection items={faqs} />
      </section>

      <div className="h-20" />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See your plan quota live, juggle Claude and Codex on glance."
      />
    </article>
  );
}
