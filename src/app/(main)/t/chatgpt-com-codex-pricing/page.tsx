import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  GlowCard,
  GradientText,
  ComparisonTable,
  TerminalOutput,
  AnimatedChecklist,
  RelatedPostsGrid,
  NumberTicker,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/chatgpt-com-codex-pricing";
const PUBLISHED = "2026-05-15";

export const metadata: Metadata = {
  title:
    "chatgpt.com/codex/pricing Explained: What OpenAI Codex Costs in 2026",
  description:
    "Codex is bundled into ChatGPT plans, not sold separately: Free $0, Go $8, Plus $20, Pro from $100, Business pay-as-you-go. Here is a plain reading of the official pricing page, what the April 2026 token-rate change did, and the usage windows the sticker price never shows you.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "chatgpt.com/codex/pricing Explained: What OpenAI Codex Costs in 2026",
    description:
      "Every plan price, the 5x/10x/20x multipliers, the April 2 token-rate change, and the 5-hour plus weekly windows the pricing page quietly leaves to you.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "chatgpt.com/codex/pricing explained", url: PAGE_URL },
];

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Guides", href: "https://claude-meter.com/t" },
  { label: "chatgpt.com/codex/pricing explained" },
];

const faqs = [
  {
    q: "How much does OpenAI Codex cost on its own?",
    a: "Nothing on its own, because there is no standalone Codex subscription. Codex usage is bundled into ChatGPT plans. The plan ladder on developers.openai.com/codex/pricing is Free at $0/month, Go at $8/month, Plus at $20/month, Pro from $100/month (with a $200/month tier on top), Business on pay-as-you-go, and Enterprise plus Edu through a sales contact. You pick a ChatGPT plan and Codex comes with it. There is no line item that says 'Codex' by itself.",
  },
  {
    q: "What is the difference between the $100 and $200 Pro tiers?",
    a: "Both are called Pro. The $100/month tier is 5x Plus usage, the $200/month tier is 20x Plus usage. The official page also runs a promotion: it doubles the $100 tier to 10x Plus usage through May 31, 2026, so until that date the $100 tier behaves like a 10x plan. After the promo ends it reverts to 5x. The $200 tier carries a 20x level on an ongoing basis.",
  },
  {
    q: "What changed in Codex pricing on April 2, 2026?",
    a: "OpenAI moved Codex billing onto API-style token rates instead of per-message pricing. Consumption is now measured as credits per million input tokens, cached input tokens, and output tokens. Credits stay the unit you buy and spend. The change applied to new and existing Plus, Pro, and Business workspaces, with Enterprise migrating on its own schedule. Practically, it means your Codex usage is now metered the way an API bill is metered, even though you are still on a flat-rate subscription.",
  },
  {
    q: "Why does the pricing page give a message range instead of one number?",
    a: "Because the number is genuinely a range. developers.openai.com/codex/pricing quotes the Pro 5x tier as 80 to 400 local messages on GPT-5.5, and the Pro 20x tier as 300 to 1600. That span is five times wide because, in the page's own words, usage varies by model and task complexity. A short question on a cheaper model lands you near the top of the range. A long agentic task on GPT-5.5 lands you near the bottom. The pricing page cannot tell you which end you will hit. Only watching your actual consumption can.",
  },
  {
    q: "What are credits in Codex pricing, and when do I start spending them?",
    a: "Credits are the pricing unit you purchase and consume. Your plan comes with included usage. Once you cross the included usage limit for your plan, further work draws down purchased credits, priced per million tokens by model. The credit system is what lets a long session keep running past the plan limit instead of hard-stopping. The catch is that the pricing page shows you the credit rate per model but not your live credit balance against your current burn rate.",
  },
  {
    q: "Does Codex have a free tier?",
    a: "Yes. The Free plan at $0/month is on the pricing ladder and includes limited Codex usage. Go at $8/month sits above it as the cheapest paid entry. For sustained daily coding, OpenAI positions Plus at $20/month and the Pro tiers as the realistic options, since Free and Go run out of headroom quickly inside the 5-hour window.",
  },
  {
    q: "How does Codex pricing compare to Claude Code pricing?",
    a: "Structurally they are almost the same shape now. Both sell a flat-rate plan, both meter you with a rolling 5-hour window plus a weekly limit, and both fall through to metered overage once the plan allowance is spent. Codex calls its overage credits priced per million tokens. Anthropic calls its overage extra usage priced in dollars. The entry prices match too: Plus is $20/month, Claude Pro is $20/month, and both have a $200/month top consumer tier. The one practical difference is where the live meter sits, covered below.",
  },
  {
    q: "Does claude-meter track my Codex usage?",
    a: "No. claude-meter reads the Anthropic side only. It shows your Claude Pro or Max rolling 5-hour window, weekly quota, and extra-usage balance in the macOS menu bar, pulled from the same usage endpoint claude.ai/settings/usage renders. It does not touch your OpenAI account and does not poll Codex. Codex already prints its own usage summary inside the CLI with /status. The reason claude-meter exists is that Claude has no equivalent live readout during an agent loop, so the Claude side of a two-tool setup is the side that goes dark.",
  },
];

const planComparisonRows = [
  {
    feature: "Consumer entry price",
    ours: "$20/month (ChatGPT Plus), Codex bundled in",
    competitor: "$20/month (Claude Pro)",
  },
  {
    feature: "Top consumer tier",
    ours: "$200/month Pro, 20x Plus usage",
    competitor: "$200/month Max, highest consumer tier",
  },
  {
    feature: "Short rolling window",
    ours: "5-hour window, shared by local messages and cloud tasks",
    competitor: "Rolling 5-hour window",
  },
  {
    feature: "Longer window",
    ours: "Weekly limits layered on top of the 5-hour window",
    competitor: "Weekly quota layered on top of the 5-hour window",
  },
  {
    feature: "Overage model",
    ours: "Credits, billed per million tokens by model",
    competitor: "Extra usage, billed in dollars",
  },
  {
    feature: "Where the live meter sits",
    ours: "/status inside the Codex CLI",
    competitor: "claude.ai/settings/usage, a web page you refresh by hand",
  },
];

const meterTerminal = [
  { type: "command" as const, text: "claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  {
    type: "output" as const,
    text: "5-hour       78.0% used   -> resets Thu May 15 19:00  (in 2h 11m)",
  },
  {
    type: "output" as const,
    text: "7-day        54.0% used   -> resets Sun May 18 09:00  (in 3d 0h)",
  },
  { type: "output" as const, text: "extra usage  $0.00 spilled" },
  { type: "info" as const, text: "" },
  {
    type: "info" as const,
    text: "(Max plan, polled every 60s from /api/organizations/{uuid}/usage)",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "chatgpt.com/codex/pricing explained: what OpenAI Codex costs in 2026",
  description:
    "A plain reading of the official Codex pricing page: every plan price, the 5x/10x/20x multipliers, the April 2026 token-rate change, and the 5-hour plus weekly usage windows the sticker price never surfaces.",
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

export default function ChatgptComCodexPricingPage() {
  return (
    <article className="min-h-screen text-zinc-900">
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
        <p className="text-xs uppercase tracking-[0.18em] text-teal-700 font-semibold mb-4">
          Codex pricing, decoded
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          chatgpt.com/codex/pricing, line by line, and{" "}
          <GradientText>the number it never shows you.</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-700 leading-relaxed max-w-3xl">
          OpenAI Codex has no price tag of its own. It rides inside a ChatGPT
          plan, and the official pricing page lists the plans cleanly enough.
          What that page leaves out is the part that actually controls your
          day: a rolling 5-hour window and a weekly limit that the flat monthly
          fee never names. This is a plain reading of both halves.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="8 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <GlowCard>
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold">
              Direct answer (verified 2026-05-15)
            </p>
            <p className="mt-3 text-zinc-900 text-lg leading-relaxed">
              There is no standalone Codex subscription. Codex usage is bundled
              into ChatGPT plans. Per{" "}
              <a
                className="text-teal-700 underline"
                href="https://developers.openai.com/codex/pricing"
              >
                developers.openai.com/codex/pricing
              </a>
              , the ladder is <strong>Free $0/month</strong>,{" "}
              <strong>Go $8/month</strong>, <strong>Plus $20/month</strong>,{" "}
              <strong>Pro from $100/month</strong> (with a separate{" "}
              <strong>$200/month</strong> tier),{" "}
              <strong>Business on pay-as-you-go</strong>, and{" "}
              <strong>Enterprise plus Edu</strong> through a sales contact. The
              $100 Pro tier is 5x Plus usage, the $200 tier is 20x, and a
              promotion doubles the $100 tier to 10x through May 31, 2026.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
            <div className="text-3xl font-bold text-teal-700">
              <NumberTicker value={20} prefix="$" />
            </div>
            <p className="mt-2 text-sm text-zinc-700 leading-snug">
              ChatGPT Plus, per month. The cheapest plan where Codex is
              genuinely usable for daily coding.
            </p>
          </div>
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
            <div className="text-3xl font-bold text-teal-700">
              <NumberTicker value={100} prefix="$" />
            </div>
            <p className="mt-2 text-sm text-zinc-700 leading-snug">
              Pro, lowest tier, per month. 5x Plus usage, doubled to 10x
              through May 31, 2026.
            </p>
          </div>
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
            <div className="text-3xl font-bold text-teal-700">
              <NumberTicker value={20} suffix="x" />
            </div>
            <p className="mt-2 text-sm text-zinc-700 leading-snug">
              Plus usage on the $200/month Pro tier, the top consumer level.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The full plan ladder
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Here is every plan from the official pricing page, with the Codex
          allowance attached. The prices are flat monthly fees. The usage
          column is where the real spread lives.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-4 py-3 font-semibold text-zinc-900">Plan</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">Price</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">
                  Codex usage
                </th>
              </tr>
            </thead>
            <tbody className="text-zinc-700">
              <tr className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">Free</td>
                <td className="px-4 py-3">$0/month</td>
                <td className="px-4 py-3">
                  Limited Codex access, runs out quickly inside the 5-hour
                  window
                </td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">Go</td>
                <td className="px-4 py-3">$8/month</td>
                <td className="px-4 py-3">
                  Cheapest paid entry, more headroom than Free
                </td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">Plus</td>
                <td className="px-4 py-3">$20/month</td>
                <td className="px-4 py-3">
                  Baseline Codex usage, the 1x reference every multiplier is
                  measured against
                </td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">Pro</td>
                <td className="px-4 py-3">From $100/month</td>
                <td className="px-4 py-3">
                  5x Plus usage, doubled to 10x through May 31, 2026
                </td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  Pro (20x)
                </td>
                <td className="px-4 py-3">$200/month</td>
                <td className="px-4 py-3">
                  20x Plus usage, the top consumer tier
                </td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  Business
                </td>
                <td className="px-4 py-3">Pay-as-you-go</td>
                <td className="px-4 py-3">
                  Credit-based, token-metered per workspace
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  Enterprise &amp; Edu
                </td>
                <td className="px-4 py-3">Contact sales</td>
                <td className="px-4 py-3">Custom limits and billing</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-zinc-500 leading-relaxed text-sm mt-3">
          Plans and prices verified against developers.openai.com/codex/pricing
          on 2026-05-15. The chatgpt.com/codex/pricing page sits behind a bot
          wall, so the developer subdomain is the readable mirror of the same
          ladder.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The pricing page quotes a range, not a number
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          This is the detail almost every pricing write-up flattens out. When
          the official page describes the Pro tiers, it does not give you a
          message count. It gives you a band. The Pro 5x tier is quoted as{" "}
          <strong>80 to 400 local messages on GPT-5.5</strong>. The Pro 20x
          tier is quoted as <strong>300 to 1600</strong>. Those are five-times
          wide ranges, and the page is explicit about why: usage varies by
          model and task complexity.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          So the honest reading of &ldquo;5x more usage&rdquo; is not &ldquo;a
          fixed bigger number&rdquo;. It is &ldquo;a wider band, and where you
          land inside it depends on what you actually do.&rdquo; A handful of
          short prompts on a cheaper model puts you near 400. One long agentic
          refactor on GPT-5.5, with the model re-reading files and chaining
          tool calls, drops you toward 80. The pricing page cannot resolve that
          for you. It is a menu, not a meter.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          That is the structural reason a flat monthly fee feels unpredictable.
          You paid one clean number. You then live inside a range that the
          number does not pin down, gated by a rolling 5-hour window and a
          weekly limit on top.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedChecklist
            title="What chatgpt.com/codex/pricing spells out"
            items={[
              { text: "Plan prices: Free $0, Go $8, Plus $20, Pro from $100, Business pay-as-you-go" },
              { text: "Usage multipliers: Pro 5x and Pro 20x relative to Plus" },
              { text: "Per-million-token credit rates for each model" },
              { text: "That a 5-hour rolling window exists, with weekly limits on top" },
            ]}
          />
          <AnimatedChecklist
            title="What it leaves you to find out the hard way"
            items={[
              { text: "Where you sit in the current 5-hour window right now", checked: false },
              { text: "How close the weekly limit is before it walls a long task", checked: false },
              { text: "Which model and task mix pushed you to the low end of the range", checked: false },
              { text: "When your credits run out at the current burn rate", checked: false },
            ]}
          />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The April 2, 2026 change: from messages to tokens
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          On April 2, 2026, OpenAI moved Codex billing off per-message pricing
          and onto API-style token rates. Consumption is now measured as{" "}
          <strong>
            credits per million input tokens, cached input tokens, and output
            tokens
          </strong>
          . Credits stayed the unit you buy and spend, but what draws them down
          changed: it is now token volume, the same way an API bill works. The
          shift applied to new and existing Plus, Pro, and Business workspaces,
          with Enterprise migrating on its own schedule.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The pricing page publishes the credit rate for each model. The two
          most relevant ones for daily Codex work look like this:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-4 py-3 font-semibold text-zinc-900">Model</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">
                  Input
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-900">
                  Cached input
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-900">
                  Output
                </th>
              </tr>
            </thead>
            <tbody className="text-zinc-700">
              <tr className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  GPT-5.5
                </td>
                <td className="px-4 py-3">125 credits</td>
                <td className="px-4 py-3">12.50 credits</td>
                <td className="px-4 py-3">750 credits</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  GPT-5.4
                </td>
                <td className="px-4 py-3">62.50 credits</td>
                <td className="px-4 py-3">6.25 credits</td>
                <td className="px-4 py-3">375 credits</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-zinc-500 leading-relaxed text-sm mt-3">
          Rates are credits per one million tokens, verified on
          developers.openai.com/codex/pricing on 2026-05-15. GPT-5.4 is roughly
          half the credit cost of GPT-5.5 per token, which is why model choice
          inside a session moves your effective spend as much as message count
          does.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Once your included plan usage is spent, further work draws down
          purchased credits at these rates. That is the mechanism that keeps a
          long session running past the plan limit instead of hard-stopping.
          The trade is that your monthly cost is no longer fixed. It is the
          flat fee plus however many credits the work above the line consumed,
          and the pricing page does not show you that running total.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Codex pricing and Claude pricing are now the same shape
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          If you are pricing out Codex, you are almost certainly weighing it
          against Claude Code, or already running both. Worth knowing: after
          the April change, the two pricing models are close to isomorphic. A
          flat plan, a rolling 5-hour window, a weekly limit, and a metered
          overage path. The prices line up too.
        </p>
        <ComparisonTable
          productName="OpenAI Codex (ChatGPT plans)"
          competitorName="Claude Code (Anthropic Pro / Max)"
          rows={planComparisonRows}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The interesting row is the last one. Both tools gate you the same
          way, but they put the live readout in different places. Codex prints
          a usage summary inside its own CLI when you run{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /status
          </code>
          . Claude does not print anything comparable during an active agent
          loop. The only place to see your real Claude position is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>
          , a web page you have to remember to open and refresh. So in a
          two-tool setup, the Codex side has a meter and the Claude side goes
          dark.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why this matters for the Claude side of your bill
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          claude-meter exists for exactly that dark side. It is a free,
          open-source macOS menu bar app and browser extension that reads your
          Claude Pro or Max usage and shows it live. It does not track Codex,
          and it makes no attempt to. Codex already has{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /status
          </code>
          . What was missing was the matching readout on the Anthropic side.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The browser extension makes one HTTPS request per minute to claude.ai
          using the session cookies your browser already holds, then pushes the
          snapshot to the menu bar app over a localhost bridge. No cookie
          paste, no telemetry, no separate login. The numbers come from the
          same usage endpoint that backs claude.ai/settings/usage, so they
          match the page exactly. There is also a CLI:
        </p>
        <TerminalOutput
          title="claude-meter, the Claude side of the meter"
          lines={meterTerminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          That is the readout the Codex pricing page has a sibling for and the
          Claude settings page only offers behind a manual refresh. Pair it
          with Codex&rsquo;s{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /status
          </code>{" "}
          and both of your flat-rate plans finally have a live meter, so you
          see a window filling up before it walls a task rather than after. If
          you run both agents in rotation, the{" "}
          <a
            className="text-teal-700 underline"
            href="https://claude-meter.com/t/claude-code-codex-token-juggling"
          >
            token-juggling guide
          </a>{" "}
          walks through the exact handoff that asymmetry makes possible.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The short version
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Codex pricing is plan pricing. You pick a ChatGPT plan, $20 for Plus
          up to $200 for the top Pro tier, and Codex comes with it. The April 2
          change turned the overage into token-metered credits. None of that is
          hard to read off the official page.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The part the page does not give you is your position. A 5x plan is a
          wider range, not a fixed number, and the 5-hour and weekly windows
          decide when a long task stops. That is true on the Codex side, where{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /status
          </code>{" "}
          at least shows you, and on the Claude side, where nothing does until
          you install something that reads it. The sticker price is the easy
          half. The meter is the half worth watching.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Running Codex and Claude Code side by side?"
          description="Book 20 minutes and we will set up claude-meter against your real claude.ai session, so the Anthropic side of your two-tool stack has a live meter that matches the Codex /status readout."
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <RelatedPostsGrid
          title="Keep reading"
          subtitle="More on plan quotas and metered billing"
          posts={[
            {
              title: "Claude Code + Codex token juggling",
              href: "/t/claude-code-codex-token-juggling",
              excerpt:
                "Two CLIs, one plan-shape, independent reset clocks. The handoff pattern that asymmetry makes possible.",
              tag: "Workflow",
            },
            {
              title: "Tracking Claude plan pricing live",
              href: "/t/claude-plan-pricing-tracker",
              excerpt:
                "What a flat Claude plan actually costs once the rolling window and extra usage are in the picture.",
              tag: "Pricing",
            },
            {
              title: "Rolling window vs metered billing",
              href: "/t/rolling-window-metered-billing",
              excerpt:
                "When the plan allowance ends and metered overage begins, and how to see the line before you cross it.",
              tag: "Billing",
            },
          ]}
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
        description="See your Claude plan quota live, the way Codex /status shows yours."
      />
    </article>
  );
}
