import type { Metadata } from "next";
import {
  Breadcrumbs,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  BeforeAfter,
  GlowCard,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/alternative/rate-limit-wall-vs-api-cost";
const PUBLISHED = "2026-05-20";

export const metadata: Metadata = {
  title:
    "Claude Code rate limit wall vs API cost: two failure modes, not one calculation",
  description:
    "The Pro/Max plan walls you mid-PR when five_hour.utilization crosses 1.0. The API never walls but has unbounded cost variance. Most guides reduce this to a static break-even number (Max wins above $100/mo). The harder variable is which failure mode you can tolerate. ClaudeMeter prints both gauges as sibling rows in the menu bar because format.rs handles them as two different units.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code rate limit wall vs API cost: two failure modes, not one calculation",
    description:
      "The wall halts work. The API never halts but has unbounded variance. The right call depends on which failure mode you can absorb, not on a single break-even number.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Alternatives", url: "https://claude-meter.com/alternative" },
  {
    name: "Rate limit wall vs API cost",
    url: PAGE_URL,
  },
];

const formatRs = `// claude-meter/src/format.rs (the relevant rows)

// Plan windows print as percent utilization + reset time.
println!("{:<16} {}", "5-hour",         format_window(w));        // line 12
println!("{:<16} {}", "7-day all",      format_window(w));        // line 15
println!("{:<16} {}", "7-day Sonnet",   format_window(w));        // line 18
println!("{:<16} {}", "7-day Opus",     format_window(w));        // line 21

// Extra usage prints as DOLLARS spent / DOLLARS capped, with a BLOCKED suffix.
let status = if ov.out_of_credits { "  BLOCKED" } else { "" };   // line 26
let line = format!(
    "\${:.2} / \${:.2} ({:.0}%){}",                              // line 31
    used, cap, pct, status
);
println!("{:<16} {}", "Extra usage", line);                       // line 39

// Two format strings. Two failure surfaces. Same dropdown.`;

const liveMenuBar = `claude-meter
============
5-hour            94.0% used    resets 17:14
7-day all         62.1% used    resets Mon 26
7-day Opus        88.4% used    resets Mon 26
Extra usage       $12.40 / $50.00 (25%)
Subscription      Max ($200/mo) renews May 28`;

const sessionTranscript = [
  { type: "command" as const, text: "$ claude-meter status --json | jq '.usage.five_hour'" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"utilization\": 0.94," },
  { type: "output" as const, text: "  \"resets_at\": \"2026-05-20T22:14:00Z\"" },
  { type: "output" as const, text: "}" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "$ claude-meter status --json | jq '.overage'" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"used_credits\": 1240.0," },
  { type: "output" as const, text: "  \"monthly_credit_limit\": 5000," },
  { type: "output" as const, text: "  \"out_of_credits\": false" },
  { type: "output" as const, text: "}" },
  { type: "output" as const, text: "" },
  { type: "success" as const, text: "Plan bucket near the wall. Extra usage spending. Both true at 14:32 PT." },
];

const comparisonRows = [
  {
    feature: "Cost shape",
    competitor:
      "Linear per token. Sonnet $3/1M input + $15/1M output, Opus $15/$75. You never get surprised by a wall, you get surprised by the invoice.",
    ours: "Fixed monthly ($20 Pro, $100 Max 5x, $200 Max 20x). Cost is bounded. The price of going over is your work stopping, not money.",
  },
  {
    feature: "Failure mode",
    competitor:
      "No failure mode for hours. Cost variance is the failure mode. One runaway agent loop can spend $50 before you notice.",
    ours: "Hard 429 the moment five_hour.utilization or seven_day.utilization crosses 1.0. Work halts until the rolling window slides.",
  },
  {
    feature: "Where the limit lives",
    competitor:
      "Tier-based RPM and TPM on the API (Tier 1 input bumped to 500,000 TPM in 2026). You hit it briefly per minute, not for hours.",
    ours: "five_hour.utilization and seven_day.utilization on /api/organizations/{org}/usage. The bar that walls you is the same one claude.ai/settings/usage renders.",
  },
  {
    feature: "Break-even at heavy use",
    competitor:
      "Reddit power user's instrumented sample, 10B tokens over 8 months, would have cost ~$15,000 on the API.",
    ours: "Same usage on Max plan: ~$1,600 over the same 8 months. About 9x cheaper in absolute dollars, ignoring the wall cost.",
  },
  {
    feature: "Cost predictability inside one month",
    competitor:
      "Low. You don't know the invoice until it lands. A wrong tool loop in an agent run can quadruple it.",
    ours: "High for the plan portion. The metered 'extra usage' line is what introduces variance, and only after you opt in.",
  },
  {
    feature: "Wall cost (downtime, broken flow)",
    competitor:
      "None. The API does not gate you on a rolling-window quota.",
    ours: "Real. A wall at 62% weekly on Tuesday morning kills the rest of the refactor until the bucket slides 5h or the week rolls over.",
  },
  {
    feature: "Who can see it live",
    competitor:
      "console.anthropic.com usage page. Updates with a few minutes of lag.",
    ours: "claude.ai/settings/usage in the browser. ClaudeMeter polls the same endpoint once a minute and prints both meters as sibling rows in the macOS menu bar.",
  },
];

const faqs = [
  {
    q: "If the Max plan is ~9x cheaper at heavy use, why is anyone on the API?",
    a: "Because the API never walls. If you run agentic loops where a 5-hour halt mid-run is worse than spending more, the API's unbounded cost is actually the lower-pain option. The plan optimizes for steady-state cost; the API optimizes for never being blocked. The right pick depends on which kind of pain you can absorb, not which has a smaller cents-per-token number. A Reddit user instrumented 10B tokens over 8 months that would have cost ~$15,000 on the API vs $800 on Max; the same person would have made the opposite trade if their work was a single 12-hour agent loop that 429ing mid-way would have invalidated.",
  },
  {
    q: "What is the literal break-even number?",
    a: "Public guides converge around $100 of monthly API equivalent for Max 5x and $200 for Max 20x. Below those thresholds the API is cheaper per token because you're not using your subscription. Above them, the plan starts winning, and at heavy professional use the gap widens to single-digit multiples (~9x in the public Reddit sample, ~5-7x in our own snapshots). But none of that math accounts for the wall, which is the variable that actually decides the question for most heavy Claude Code users.",
  },
  {
    q: "How do I see the plan wall coming before it lands?",
    a: "Read five_hour.utilization on https://claude.ai/api/organizations/{your_org_uuid}/usage. That's the same float Anthropic's rate limiter checks. claude.ai/settings/usage renders it as a bar. ClaudeMeter polls it once a minute through your existing claude.ai session and shows it in the macOS menu bar so you don't need a browser tab open. When the 5-hour row crosses ~85%, you have roughly 15 minutes of normal use left before the wall.",
  },
  {
    q: "What about extra usage, is that a third option or part of the plan?",
    a: "It's a third gate that runs in parallel to the plan, not a phase of it. Extra usage lives on /api/organizations/{org}/overage_spend_limit, ships dollars (cents-divided-by-100) not percent, and a separate flag (out_of_credits) sets a BLOCKED suffix when you exhaust the monthly cap. So your dropdown has three things to watch: rolling-window utilization, weekly utilization, and the extra-usage dollar ledger. ClaudeMeter shows all three. format.rs uses '{:>5.1}% used' for the plan rows and '${:.2} / ${:.2} ({:.0}%)' for the extra-usage row because they are not the same unit and pretending they are loses information.",
  },
  {
    q: "Does the API also have rate limits, isn't it just a slower wall?",
    a: "The API has tier-based RPM and TPM limits but they're per-minute, not rolling-5-hour. Tier 1 input tokens bumped from 30,000 to 500,000 TPM in 2026, so even an aggressive agent loop is rarely blocked for more than a few seconds. The plan wall is structurally different: it gates your whole org for hours at a time once seven_day.utilization crosses 1.0. The API is a speed bump. The plan is a closed door until reset.",
  },
  {
    q: "Why doesn't ccusage answer this question?",
    a: "Because ccusage reads ~/.claude/projects/*.jsonl on disk and sums input_tokens + output_tokens. That's a local token-flow number and it tells you nothing about whether the next prompt will 429. The float that Anthropic enforces (five_hour.utilization on the org usage endpoint) is already weighted for peak hours, attachments, tool calls, and model class; none of those weights write to JSONL. You can be at 5% in ccusage and 94% on the server in the same minute. ccusage answers 'which project burned tokens this week'. The wall answer needs the server number.",
  },
  {
    q: "If I'm a hobby user under 50M tokens a month, does any of this matter?",
    a: "Probably not. At that volume the API costs <$50/month and you'll never hit the wall on Pro either. The decision sharpens above ~150M tokens/month, where the plan starts winning by 3-5x but the wall becomes a real consideration because heavy use is when you actually wall. The asymmetry is also worse at the top: a 20x-Max user with 1B+ tokens/month is leaving thousands on the table by paying the API, but is also one bad refactor away from being walled at 60% weekly on a Monday.",
  },
  {
    q: "Can I do both, plan plus API fallback?",
    a: "Yes, and the operative metric is the same one ClaudeMeter prints. When five_hour.utilization passes ~85% you swing over to the API for the next 5h, then back to the plan after reset. The hard part is knowing the threshold lived without keeping claude.ai/settings/usage open in a tab. That's the gap ClaudeMeter fills: a menu bar percent that's accurate to within 60 seconds of the server, no manual cookie paste, no telemetry, MIT licensed.",
  },
];

const relatedPosts = [
  {
    href: "/alternative/claude-max-plan-bar-vs-extra-usage",
    title:
      "Claude Max plan bar vs extra usage: two parallel meters",
    excerpt:
      "Field-by-field on the two endpoints (/usage and /overage_spend_limit), why one ships percent and the other ships dollars, and the exact format.rs lines that print them.",
    tag: "Comparison",
  },
  {
    href: "/alternative/server-truth-vs-local-claude-logs",
    title:
      "Server truth vs local Claude logs: the five weights JSONL cannot see",
    excerpt:
      "Why ccusage at 5% and claude.ai at 429 can both be true in the same minute. The five server-side weights that don't write to ~/.claude/projects.",
    tag: "Reference",
  },
  {
    href: "/t/claude-code-cost-per-landed-pr",
    title:
      "Claude Code: dollars per landed pull request",
    excerpt:
      "Working backwards from shipped work, the per-PR cost on Max plan vs API, and why the wall makes the API the more expensive option even when the cents-per-token are smaller.",
    tag: "Cost analysis",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code rate limit wall vs API cost: two failure modes, not one calculation",
  description:
    "Most guides reduce this to a static break-even number (Max wins above $100/mo of API equivalent). The harder variable is the wall: the plan halts work the moment five_hour.utilization or seven_day.utilization crosses 1.0, while the API never walls but has unbounded cost variance. The right pick depends on which failure mode you can absorb. ClaudeMeter prints plan utilization (percent) and extra usage (dollars) as sibling rows in the macOS menu bar because format.rs treats them as two different units; that is the only view that lets you decide live.",
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

export default function RateLimitWallVsApiCostPage() {
  return (
    <article className="text-zinc-900 min-h-screen">
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
          The wall <GradientText>vs the bill</GradientText>: two failure modes
          you keep collapsing into one number
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every guide on Claude Code rate limits eventually lands on the same
          spreadsheet: at <em>X</em> tokens per month the Max plan is cheaper
          than the API. That math is correct and almost beside the point. The
          API never walls you. The plan walls you the moment{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          crosses 1.0. Which one you should pick depends on which failure mode
          you can absorb, not on which has a smaller cents-per-token number.
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-20)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            For sustained heavy use, the Max plan beats the API on raw dollars
            by roughly 5-10x (one public Reddit sample: ~$15,000 of API
            equivalent vs ~$800 on Max over the same 8 months). For agentic
            loops that cannot tolerate a multi-hour halt, the API's unbounded
            cost is the lower-pain option. Most people land on a hybrid: stay
            on the plan, watch{" "}
            <a
              href="https://claude.ai/settings/usage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              claude.ai/settings/usage
            </a>{" "}
            (or a menu bar mirror of it), and flip to the API only after
            crossing ~85% of the rolling 5-hour bucket. API pricing reference:{" "}
            <a
              href="https://platform.claude.com/docs/en/about-claude/pricing"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              platform.claude.com/docs/en/about-claude/pricing
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Side by side
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The two surfaces compared on the dimensions that actually decide it
          for a Claude Code user.
        </p>
        <ComparisonTable
          productName="Pro / Max plan"
          competitorName="Anthropic API (pay-as-you-go)"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The wall is not free
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          A clean way to put a number on the wall: imagine you're refactoring a
          service and you're three hours in. At 14:32 your next prompt comes
          back with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            rate limit reached
          </code>
          . The rolling 5-hour bucket slid past 1.0. Now you wait until 17:14
          for the earliest prompt in the window to age out. That's 2 hours and
          42 minutes of work you can't do. If you're paid hourly, that has a
          number. If you're trying to ship before a meeting, it has a worse
          number.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The static break-even calculations ignore this. They treat the wall
          as if hitting it costs nothing, only as if you'd then be making
          metered calls past the wall. In practice most heavy users don't have
          metered overage enabled, so hitting the wall on Max just stops the
          work entirely. That's the variable the cost-per-token math leaves
          out.
        </p>
        <GlowCard>
          <div className="p-2 space-y-3">
            <p className="text-zinc-700 leading-relaxed text-lg">
              The API also has rate limits, but they're per-minute, not
              rolling-5-hour. After Anthropic's Tier 1 bump to 500,000 input
              TPM in 2026, even an aggressive agent loop is rarely blocked for
              more than a few seconds. The plan wall is structurally different:
              it gates your whole org for hours at a time. One is a speed bump.
              The other is a closed door until reset.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why ClaudeMeter prints both
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The reason ClaudeMeter's menu bar shows percent rows for the plan
          windows and a dollar row for the extra usage line is not stylistic.
          They're two different units on two different endpoints, and they
          guard two different things. The plan rows tell you whether the next
          prompt will 429. The extra usage row tells you whether the month-end
          bill is about to surprise you.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            format.rs
          </code>{" "}
          uses two different format strings on purpose:
        </p>
        <AnimatedCodeBlock
          code={formatRs}
          language="rust"
          filename="claude-meter/src/format.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          The output looks like this when both are live. Five rows. Three units
          (percent, dollars, plan name). The reader is supposed to see all of
          them at once, because the decision being made changes based on which
          row is hot.
        </p>
        <AnimatedCodeBlock
          code={liveMenuBar}
          language="text"
          filename="$ claude-meter status"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          On a Tuesday afternoon where the 5-hour row is at 94% and the
          extra-usage row is at $12.40, the decision is concrete: 6 more
          minutes of plan headroom, then I'll flip to the API for the next
          two hours, then back when 17:14 lands. The static break-even
          spreadsheet cannot tell me that.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          With and without a live read
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The honest difference between staying on the plan and switching to
          the API isn't a per-token number. It's whether you can see the wall
          coming. Toggle the two states below.
        </p>
        <BeforeAfter
          title="Same Tuesday, two strategies"
          before={{
            label: "Plan, no live read",
            content:
              "You're on Max. You don't know your bucket state. The 5-hour row crossed 0.95 forty seconds ago and you have no idea. The next prompt comes back rate-limited mid-refactor. You wait 2h 40m for the window to slide. Static cost math says you saved money this month, which is true and not useful at 14:32 PT.",
            highlights: [
              "Cheaper per token: yes",
              "Wall lands unannounced: yes",
              "Recovery time after wall: 2-5 hours",
              "Work blocked until reset: yes",
            ],
          }}
          after={{
            label: "Plan, with live read",
            content:
              "Same plan, same prompts, but the menu bar shows 5-hour at 94% and extra usage at $12.40 of $50. At ~85% you switched the next batch of prompts to the API. The plan bucket slid back below 80% by 16:00. You flipped back. The month bill stays under $25 of metered overage and zero hours of blocked work.",
            highlights: [
              "Cheaper per token: yes",
              "Wall lands unannounced: no",
              "Recovery time after wall: doesn't apply, you didn't wall",
              "Cost ceiling for the month: visible in dollars on the same screen",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The moment of choice
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Two terminal calls, same minute. The plan bucket is one prompt away
          from walling. The extra usage is spending. Both true. The user is
          deciding whether to keep prompting on the plan, flip to the API for
          the next batch, or coast on the metered overage line until the 5-hour
          slides at 17:14.
        </p>
        <TerminalOutput
          title="claude-meter status, 14:32 PT"
          lines={sessionTranscript}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          You can't get to that decision from a static break-even table. You
          need the two numbers live in the same view.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Pick by failure mode, not by cents
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The honest version of this answer: most heavy Claude Code users
          should stay on Max because the per-token savings dwarf the API at
          their volume. The cost is the wall. The wall is mitigatable if you
          can see the bucket approaching it. If you can't, the wall lands
          unannounced and the math wins on paper while your Tuesday afternoon
          loses.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The cases where the API is the right pick anyway: agentic loops
          where a 5-hour halt mid-run invalidates the run, work where billing
          is passed through to a client at API rates, or workloads under ~50M
          tokens a month where the API is genuinely cheaper. Everyone else,
          the move is plan + live read + occasional API fallback when the
          rolling window is hot.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want a 20-minute look at your own numbers?"
          description="Open DevTools on claude.ai/settings/usage, curl the org endpoint, and watch the two meters line up on your own account. Twenty minutes is enough to know whether to stay on Max or flip."
        />
      </section>

      <FaqSection heading="Frequently asked" items={faqs} />

      <section className="max-w-5xl mx-auto px-6 mt-14 mb-20">
        <RelatedPostsGrid
          title="Keep reading"
          subtitle="Three angles on the same gap, written from different starting points."
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See your plan bucket and extra-usage ledger as sibling rows in your own menu bar."
      />
    </article>
  );
}
