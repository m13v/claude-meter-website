import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  GlowCard,
  ShimmerButton,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-team-dollar-burn";
const PUBLISHED = "2026-05-21";

export const metadata: Metadata = {
  title: "Claude Code team dollar burn: the real number lives in one field ccusage can't read",
  description:
    "If your team runs Claude Code on individual Pro/Max plans, the only real dollars are the flat subscription plus metered extra-usage. ccusage shows an estimated token price you never pay. Here is where the actual billed dollars live and how to sum them across seats.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Code team dollar burn: the real number ccusage can't read",
    description:
      "On Pro/Max plans, ccusage's cost column is a token-list-price estimate, not what Anthropic bills. The real per-seat dollars live in the extra-usage balance. Here is how to read and sum it.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code team dollar burn", url: PAGE_URL },
];

const terminalRun = [
  { type: "command" as const, text: "/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           12.3% used    -> resets Wed May 21 18:40 (in 4h)" },
  { type: "output" as const, text: "7-day all        62.0% used    -> resets Mon May 26 09:00 (in 4d 18h)" },
  { type: "output" as const, text: "7-day Opus       71.0% used    -> resets Mon May 26 09:00 (in 4d 18h)" },
  { type: "success" as const, text: "Extra usage      $4.20 / $50.00 (8%)" },
  { type: "output" as const, text: "Next charge      2026-06-03   visa ••4242" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "fetched 2026-05-21 13:42:10 PDT   dev@startup.com via Chrome   org 1a2b…" },
];

const jsonScript = `# each seat runs the CLI that ships inside the brew cask
# (read-only: it just prints what claude.ai/settings/usage shows)
claude-meter --json

# the relevant slice of the payload:
# {
#   "overage": {
#     "used_credits": 420,            # CENTS -> $4.20 of metered extra usage
#     "monthly_credit_limit": 5000,   # CENTS -> the $50 cap this seat set
#     "out_of_credits": false
#   },
#   "usage": { "seven_day": { "utilization": 62.0 }, ... }
# }`;

const teamScript = `# real team dollar burn this month, summed across seats.
# used_credits is in cents (claude-meter divides by 100 to print dollars),
# so divide the sum by 100 once at the end.
for host in alice-mbp bob-mbp carol-mbp; do
  ssh "$host" '/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json'
done | jq -s 'map(.overage.used_credits // 0) | add / 100'

# => 18.60
# eighteen dollars and sixty cents of metered overage across three devs.
# this is the number Anthropic will actually invoice, not an estimate.`;

const burnRows = [
  {
    feature: "What the number means",
    competitor: "Estimated list price of tokens your sessions used",
    ours: "Dollars of metered extra-usage Anthropic will invoice",
  },
  {
    feature: "Source of truth",
    competitor: "Local ~/.claude/projects/**/*.jsonl session logs",
    ours: "claude.ai /organizations/{org}/overage_spend_limit",
  },
  {
    feature: "Matches your Anthropic bill",
    competitor: "No (plan users do not pay per token)",
    ours: "Yes (it is the same field settings/usage renders)",
  },
  {
    feature: "Sees extra-usage spend",
    competitor: "No (not in the local log)",
    ours: "Yes (used_credits, monthly_credit_limit, out_of_credits)",
  },
  {
    feature: "Knows the monthly cap and BLOCKED state",
    competitor: "No",
    ours: "Yes (prints BLOCKED when out_of_credits flips true)",
  },
  {
    feature: "Aggregates across seats",
    competitor: "Per-machine token tables only",
    ours: "--json per seat, sum with one jq line",
  },
];

const faqs = [
  {
    q: "How do I track my team's real dollar burn on Claude Code?",
    a: "On Pro and Max plans the only real dollars are two things: the flat monthly subscription, and metered extra-usage. Once a seat exhausts its plan quota, additional usage is billed at standard pay-as-you-go API rates if that seat enabled extra-usage, otherwise it just stops. The live dollar figure for the metered part lives per seat at claude.ai/settings/usage. claude-meter reads that exact balance and prints it as a line like 'Extra usage $4.20 / $50.00 (8%)'. Run 'claude-meter --json' on each machine and sum the overage.used_credits values to get the real team total. There is no per-token charge to track on a plan, so a token-cost estimate is the wrong number.",
  },
  {
    q: "Why can ccusage not tell me my team's dollar burn?",
    a: "ccusage reads ~/.claude/projects/**/*.jsonl and multiplies token counts by published API list prices. That produces a 'cost' column, but on a Pro or Max plan you are not billed per token. You paid a flat subscription, and beyond the included quota you are billed metered extra-usage at API rates only for the overflow. So ccusage's dollar figure is an estimate of what the same tokens would cost on the raw API, which is not what Anthropic invoices a plan user. It is genuinely useful for spotting which sessions are token-heavy, it just answers a different question than 'how many dollars did we burn'.",
  },
  {
    q: "Where exactly does claude-meter get the dollar number?",
    a: "It calls claude.ai/api/organizations/{org_uuid}/overage_spend_limit (see claude-meter/src/api.rs), which returns used_credits, monthly_credit_limit, currency, and out_of_credits. Those credit fields are in cents, so the formatter divides by 100 (claude-meter/src/format.rs lines 24-39) and prints 'Extra usage $4.20 / $50.00 (8%)'. If that dedicated endpoint is not available, it falls back to the extra_usage block embedded in the usage response (is_enabled, monthly_limit, used_credits). Either way the dollars match what Settings > Usage shows you, because it is the same data.",
  },
  {
    q: "Does claude-meter give me one combined team dashboard?",
    a: "No, and I want to be honest about that. claude-meter is a per-seat tool: one menu-bar app (and CLI) per developer, each reading that developer's own claude.ai session. There is no central server that aggregates everyone. The team total is something you assemble yourself: run 'claude-meter --json' on each seat and sum overage.used_credits with jq or a tiny script. That is deliberate. Anonymous telemetry is opt-out and there is no central usage collector, so nothing about your team's usage leaves each machine unless you choose to collect it.",
  },
  {
    q: "We are a team on individual Pro/Max plans, not Team or Enterprise. Does the Console help?",
    a: "The claude.com Console shows team-level aggregates only on Team and Enterprise plans. A lot of small teams and startups run on individual Pro and Max subscriptions instead, where there is no shared admin view of spend. That is exactly the gap this page is about: each person sees their own Settings > Usage, nobody sees the sum. claude-meter reads each seat's real extra-usage dollars and the --json output makes summing them a one-liner, without anyone upgrading to a Console plan.",
  },
  {
    q: "What does the BLOCKED flag mean and why does it matter for a team?",
    a: "When a seat hits its extra-usage cap, the overage_spend_limit endpoint returns out_of_credits: true, and claude-meter appends 'BLOCKED' to the extra-usage line. For a team that matters because a blocked seat is a developer who has silently stopped being able to run Claude Code mid-task, not because of the rolling 5-hour or weekly quota, but because their dollar cap is spent. Watching the dollar line lets you spot it before someone pings you confused about why their agent stopped.",
  },
  {
    q: "Is this safe to run, and what does it actually touch?",
    a: "It is MIT-licensed and open source, macOS 12+ only. With the browser extension it uses your existing claude.ai cookies to make one HTTPS request per minute to claude.ai and posts the snapshot to a localhost bridge on 127.0.0.1:63762. Anonymous telemetry is opt-out, no analytics, usage data stays on your machine except the request to claude.ai itself. The --json output is read-only: it prints, it does not change anything on your account.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-weekly-limit-extra-usage",
    title: "Claude weekly limit and extra usage: when the meter starts charging dollars",
    excerpt:
      "The moment plan quota runs out and metered extra-usage begins. Where the dollar handoff happens and how to see it coming.",
    tag: "Related",
  },
  {
    href: "/t/claude-code-cost-per-landed-pr",
    title: "Claude Code cost per landed PR: the yield-adjusted formula",
    excerpt:
      "If you want dollars per shipped unit of work, this joins ClaudeMeter utilization samples to git log --merges.",
    tag: "Related",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "The full breakdown of why local JSONL token estimates and server-truth dollars are two different numbers.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code team dollar burn: the real number lives in one field ccusage can't read",
  description:
    "On Pro/Max plans the only real dollars are the flat subscription plus metered extra-usage. ccusage's cost column estimates token list price you never pay. claude-meter reads the actual billed extra-usage balance per seat and --json lets you sum it across the team.",
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

export default function ClaudeCodeTeamDollarBurnPage() {
  return (
    <article className="text-zinc-900">
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
          Your team&apos;s real Claude Code dollar burn{" "}
          <GradientText>lives in one field ccusage can&apos;t read</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          If everyone on the team is on their own Pro or Max plan, the dollar
          number people quote from ccusage is a fiction. You do not pay per token
          on a plan. The only real dollars are the flat subscription plus metered
          extra-usage once a seat blows past its quota. That second number lives
          in exactly one place per seat, and it is not in the local logs.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="6 min read"
        />
      </div>

      {/* Direct answer */}
      <section className="max-w-4xl mx-auto px-6 mt-8">
        <GlowCard>
          <div className="p-6 sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-wide text-teal-700 mb-3">
              Direct answer (verified 2026-05-21)
            </div>
            <p className="text-lg text-zinc-800 leading-relaxed">
              On Pro and Max plans there are only two real dollar figures:{" "}
              <strong>the flat subscription</strong>, and{" "}
              <strong>metered extra-usage</strong> (billed at standard
              pay-as-you-go API rates once a seat exhausts its plan quota). The
              live extra-usage dollars sit per seat at{" "}
              <a
                href="https://claude.ai/settings/usage"
                className="text-teal-600 underline underline-offset-2"
              >
                claude.ai/settings/usage
              </a>
              . claude-meter reads that exact balance and prints it as{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[0.95em]">
                Extra usage $4.20 / $50.00 (8%)
              </code>
              ; run{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[0.95em]">
                claude-meter --json
              </code>{" "}
              on each seat and sum the values to get the true team total.
              ccusage&apos;s cost column estimates token list price, which is not
              what Anthropic invoices a plan user.
            </p>
            <p className="mt-4 text-sm text-zinc-500">
              Source for the billing mechanics:{" "}
              <a
                href="https://support.claude.com/en/articles/12429409-manage-extra-usage-for-paid-claude-plans"
                className="text-teal-600 underline underline-offset-2"
              >
                Anthropic, Usage Credits for Pro and Max Plans
              </a>
              .
            </p>
            <div className="mt-6">
              <ShimmerButton href="https://claude-meter.com/install">
                Install claude-meter
              </ShimmerButton>
            </div>
          </div>
        </GlowCard>
      </section>

      {/* The two numbers */}
      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          There are two &quot;dollar&quot; numbers, and people quote the wrong one
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          When a teammate says &quot;we burned $900 on Claude Code last month,&quot;
          ask where that came from. If it came from ccusage or a similar local-log
          tool, it is the published API list price of every token your sessions
          processed. On a plan you did not pay that. You paid your $20, $100, or
          $200 subscription, full stop, until the quota ran out. After that, and
          only after that, real metered dollars start accruing at API rates. The
          two numbers can be off by an order of magnitude in either direction:
          a heavy week that stays inside quota costs $0 extra while the token
          estimate reads in the hundreds; a single seat that spills into overage
          can quietly rack up real dollars the token table never flags as
          &quot;new spend&quot; because, to the local log, a token is a token.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          For a team this matters because the question you are actually trying to
          answer is &quot;what will the invoice say,&quot; and the only honest
          input to that is the metered extra-usage figure, summed across seats.
        </p>

        <div className="mt-8">
          <ComparisonTable
            productName="claude-meter (server-truth dollars)"
            competitorName="ccusage (local token estimate)"
            rows={burnRows}
          />
        </div>
      </section>

      {/* The anchor fact */}
      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          The exact line claude-meter prints
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The brew cask ships a CLI next to the menu-bar app. Run it and you get a
          one-shot snapshot of the same numbers{" "}
          <span className="font-mono text-sm">claude.ai/settings/usage</span>{" "}
          renders, including the metered dollars. The extra-usage line is the one
          that answers the burn question.
        </p>
        <TerminalOutput
          title="claude-meter, one seat"
          lines={terminalRun}
        />
        <p className="mt-6 text-zinc-700 leading-relaxed">
          That <span className="font-mono text-sm">$4.20 / $50.00 (8%)</span>{" "}
          comes from the{" "}
          <span className="font-mono text-sm">overage_spend_limit</span> endpoint.
          The credit fields arrive in cents, so the formatter divides by 100
          before printing dollars (
          <span className="font-mono text-sm">claude-meter/src/format.rs</span>,
          lines 24-39). When a seat hits its cap the same endpoint returns{" "}
          <span className="font-mono text-sm">out_of_credits: true</span> and the
          line gains a <span className="font-mono text-sm">BLOCKED</span> suffix.
          That is the moment a developer silently loses Claude Code, not from the
          rolling window, but from the dollar cap.
        </p>
      </section>

      {/* Reading the field */}
      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          The field, in JSON
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The CLI also speaks JSON, which is what makes a team total possible. The
          shape mirrors the Rust structs in{" "}
          <span className="font-mono text-sm">claude-meter/src/models.rs</span>{" "}
          (<span className="font-mono text-sm">OverageResponse</span> and{" "}
          <span className="font-mono text-sm">ExtraUsage</span>):
        </p>
        <AnimatedCodeBlock
          code={jsonScript}
          language="bash"
          filename="claude-meter --json (one seat)"
        />
      </section>

      {/* Team aggregation */}
      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Summing it across the team
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          claude-meter has no central server and no team dashboard, on purpose.
          Each seat reads only its own session and nothing leaves the machine. So
          the team total is something you assemble. If your developers&apos;
          machines are reachable (a shared dev box, a fleet you manage, or each
          person just pasting their <span className="font-mono text-sm">--json</span>{" "}
          into a channel), the sum is one jq line:
        </p>
        <AnimatedCodeBlock
          code={teamScript}
          language="bash"
          filename="team-dollar-burn.sh"
        />
        <p className="mt-6 text-zinc-700 leading-relaxed">
          The result is the real metered spend Anthropic will invoice, in
          dollars, with no token-price estimation in the path. Add your fixed
          subscription cost per seat on top and you have the full picture: flat
          plan dollars plus actual overage dollars. That is the team burn number,
          and it is the only one that reconciles against the bill.
        </p>
      </section>

      {/* Honest caveat */}
      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          When the token estimate is still the right tool
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          ccusage is not wrong, it answers a different question. If you want to
          know which sessions, projects, or models are token-heavy so you can cut
          waste, the local JSONL breakdown is exactly what you want, and
          claude-meter does not replace it. They read different data sources:
          ccusage reads your local Claude Code logs, claude-meter reads the
          server-truth quota and dollar fields. Use the local estimate to find
          where the tokens go; use the extra-usage dollars to know what the
          invoice will say. For a team that has both questions, run both.
        </p>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        section="team-dollar-burn-footer"
        heading="Want a real burn number for your team, not a token estimate?"
        description="Fifteen minutes on how to wire claude-meter --json into a team total that reconciles against your Anthropic bill."
      />

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-6">
          Questions teams actually ask
        </h2>
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        section="team-dollar-burn-sticky"
        text="Book a call"
        description="Team dollar burn that matches the bill? 15 min."
      />
    </article>
  );
}
