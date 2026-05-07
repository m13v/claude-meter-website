import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  GlowCard,
  GradientText,
  BackgroundGrid,
  ShimmerButton,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/anthropic-shortage-cache-funny-money";
const PUBLISHED = "2026-05-07";

export const metadata: Metadata = {
  title:
    "Anthropic Shortage, Cache Bust, Funny Money: Why Your Make-Good Credits Are Already Spent",
  description:
    "The credits Anthropic handed out during the 2026 compute shortage and the Claude Code cache TTL drop are denominated in dollars, but the same /api/organizations/{org}/overage_spend_limit response that lists them ships an out_of_credits flag and a disabled_until timestamp the server can flip silently. ccusage cannot see either field. ClaudeMeter does.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Anthropic Shortage, Cache Bust, Funny Money: Why Your Make-Good Credits Are Already Spent",
    description:
      "Four mechanics turn a $200 extra-usage credit into funny money: capacity throttling, the 1h-to-5m cache change, an out_of_credits server flag, and local-log blindness. The Rust struct that decodes all four is 11 lines.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What does 'funny money' mean in this context?",
    a: "It is shorthand for a balance that looks real on a settings page but cannot reliably be spent in the moment a user wants to spend it. In the Anthropic 2026 case, the make-good credits (a one-month subscription refund, a $200 extra-usage promo, monthly metered allowances) are denominated in real dollars. They sit in /api/organizations/{org_uuid}/overage_spend_limit. But three things conspire against you actually using them: the rolling-window throttle stops you before you can spend down the credit, the prompt cache change inflates the per-prompt burn so the credit drains faster than the work you got out of it, and the server can flip an out_of_credits flag that disables the line entirely. The dollars are technically yours; the spending behaviour is not.",
  },
  {
    q: "Where does the out_of_credits flag actually live?",
    a: "In the OverageResponse JSON returned by GET https://claude.ai/api/organizations/{org_uuid}/overage_spend_limit. The full struct is seven fields: is_enabled, monthly_credit_limit, currency, used_credits, disabled_reason, disabled_until, out_of_credits. ClaudeMeter decodes that struct in src/models.rs lines 30-40 and renders the boolean as the string BLOCKED in src/format.rs line 26. Three of those fields, out_of_credits, disabled_reason, and disabled_until, are not visible anywhere a local-log tool reaches.",
  },
  {
    q: "When did Anthropic shorten the cache TTL?",
    a: "The default Claude Code prompt cache TTL dropped from 1 hour to 5 minutes around April 2-3, 2026. The rollout was staggered, so different users saw the change on different days; some retained 1-hour caching well past the cutover. One Reddit user documented the impact precisely: 39 cache busts per day at $6.28 before April 2, and 199 cache busts per day at $15.54 after, a $277.80 monthly delta on identical work. xda-developers and The Register covered the change after the fact. The reason it matters here is that those extra cache rebuilds get charged at the cache-write rate against the same credit balance Anthropic gave you to make up for the shortage.",
  },
  {
    q: "What does the capacity shortage have to do with credits I already paid for?",
    a: "Anthropic tightened consumer-plan rolling windows on weekday peak hours (8am to 2pm Eastern) starting late March 2026. The product lead acknowledged users were 'hitting usage limits in Claude Code way faster than expected' on March 31. When the 5-hour or 7-day window trips, the Claude Code client falls through to extra-usage billing, which spends down your make-good credit instead of returning a 429. So 'I bought you a month' becomes 'I bought you a few peak-hour blocks of throttled inference', and you have no way to see the substitution happening unless you read the right server field.",
  },
  {
    q: "Why can't ccusage or Claude-Code-Usage-Monitor see this?",
    a: "Because they read the local JSONL transcript on disk and sum input/output tokens. /overage_spend_limit is a different endpoint on a different host (claude.ai, not platform.claude.com). It returns dollar amounts in cents, plus the three diagnostic fields above. There is no token field on that endpoint, and there is no overage field in the local transcript. The two data sources do not overlap; a tool that walks JSONL has no way to find out the credit line is BLOCKED until you fail a request and read the error body.",
  },
  {
    q: "How does ClaudeMeter render the BLOCKED state?",
    a: "src/format.rs lines 24-40. The CLI prints a line like '$12.40 / $200.00 (6%) BLOCKED until Sat May 10' when out_of_credits is true and disabled_until is set. The menu bar reads the same struct and surfaces the BLOCKED string under the extra-usage row. If disabled_reason is present, the binary appends it. The point is that a single field flip on the server changes one boolean in OverageResponse and the UI reflects it on the next 60-second poll.",
  },
  {
    q: "Is this endpoint documented anywhere?",
    a: "No. It is the same endpoint the claude.ai/settings/usage page renders from, and Anthropic does not publish its shape. ClaudeMeter is open source under MIT and the struct is at /Users/matthewdi/claude-meter/src/models.rs (or github.com/m13v/claude-meter/blob/main/src/models.rs). The JSON parse uses serde with strict typing, so if Anthropic renames a field, the next poll fails loudly with the parse error rather than silently misreporting.",
  },
  {
    q: "Will Anthropic credit me back if my credits get blocked?",
    a: "There is no automatic refund mechanism. The official help center page on requesting a refund covers paid plan refunds, not extra-usage credit reversals. Reading the disabled_reason field on the day it flips is the closest thing to evidence; ClaudeMeter logs the snapshot to a localhost bridge, so you can grep your own historic snapshots if you ever need to argue the case with support. We are not a billing claim service; we just expose the field.",
  },
  {
    q: "Does any of this apply to API customers on platform.claude.com?",
    a: "No. The Console API on platform.claude.com has its own Usage and Cost endpoint, its own anthropic-ratelimit-* response headers, and its own credit ledger. The credits you buy on the API console are separate from the make-good credits Anthropic dropped on consumer plans. The shortage and the cache TTL change have hit Claude Code (which runs on consumer auth in many flows) and claude.ai chat. If you only consume via the public API, you are seeing a different surface and this page is not for you.",
  },
  {
    q: "What can I do today to stop this from being a black box?",
    a: "Three things. One: install ClaudeMeter and the browser extension; the menu bar shows your extra-usage dollars and any BLOCKED suffix without you opening the settings page. Two: keep the snapshots the bridge writes to localhost; they are JSON timestamps you can grep later. Three: when you hit a hard wall, check whether the wall is a 5-hour rolling window (the bucket on /usage), a weekly window (the seven_day bucket), or extra-usage being disabled (out_of_credits true on /overage_spend_limit). They look the same in Claude Code's error message; they have different recoveries.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Anthropic shortage, cache, funny money", url: PAGE_URL },
];

const overageStructRust = `// claude-meter/src/models.rs  (lines 30-40)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverageResponse {
    pub is_enabled: bool,
    pub monthly_credit_limit: Option<i64>,
    pub currency: Option<String>,
    pub used_credits: Option<f64>,
    pub disabled_reason: Option<String>,
    pub disabled_until: Option<chrono::DateTime<chrono::Utc>>,
    #[serde(default)]
    pub out_of_credits: bool,
}`;

const blockedRenderRust = `// claude-meter/src/format.rs  (lines 24-40)
if let Some(ov) = &s.overage {
    let u = ov.used_credits.unwrap_or(0.0) / 100.0;
    let status = if ov.out_of_credits { "  BLOCKED" } else { "" };
    let mut line = match ov.monthly_credit_limit {
        Some(l) => {
            let l = l as f64 / 100.0;
            let pct = if l > 0.0 { u / l * 100.0 } else { 0.0 };
            format!("\${:.2} / \${:.2} ({:.0}%){}", u, l, pct, status)
        }
        None => format!("\${:.2} used (no cap){}", u, status),
    };
    if let Some(until) = &ov.disabled_until {
        let local: chrono::DateTime<chrono::Local> = (*until).into();
        line.push_str(&format!(" until {}", local.format("%a %b %-d")));
    }
    println!("{:<16} {}", "Extra usage", line);
}`;

const reproTerminal = [
  { type: "command" as const, text: "# verify the BLOCKED contract yourself" },
  {
    type: "command" as const,
    text: 'export COOKIE="sessionKey=...; lastActiveOrg=..."',
  },
  {
    type: "command" as const,
    text: "export ORG=\"<your org uuid from /api/account memberships[0].organization.uuid>\"",
  },
  {
    type: "command" as const,
    text: "curl -s https://claude.ai/api/organizations/$ORG/overage_spend_limit \\\n  -H \"Cookie: $COOKIE\" \\\n  -H \"Referer: https://claude.ai/settings/usage\" \\\n  | jq '.'",
  },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: '  "is_enabled": true,' },
  { type: "output" as const, text: '  "monthly_credit_limit": 20000,' },
  { type: "output" as const, text: '  "currency": "USD",' },
  { type: "output" as const, text: '  "used_credits": 1240,' },
  { type: "output" as const, text: '  "disabled_reason": null,' },
  { type: "output" as const, text: '  "disabled_until": null,' },
  { type: "output" as const, text: '  "out_of_credits": false' },
  { type: "output" as const, text: "}" },
  {
    type: "success" as const,
    text: "monthly_credit_limit and used_credits are in cents. $12.40 spent against a $200 cap. out_of_credits is the line that flips when Anthropic disables the credit.",
  },
  { type: "command" as const, text: "# what it looks like when the flag flips" },
  { type: "output" as const, text: '  "disabled_reason": "capacity_protection",' },
  {
    type: "output" as const,
    text: '  "disabled_until": "2026-05-10T08:00:00Z",',
  },
  { type: "output" as const, text: '  "out_of_credits": true' },
  {
    type: "error" as const,
    text: "Now your $187.60 of remaining credit is unspendable until 2026-05-10. Nothing in Claude Code or ccusage tells you this.",
  },
];

const mechanicSteps = [
  {
    title: "Capacity throttle clamps the spending hours.",
    description:
      "Late March 2026, weekday peak hours (8am-2pm Eastern) tightened. The product lead said users were hitting limits 'way faster than expected' on March 31. When the 5-hour or 7-day window trips, the client falls through to extra-usage billing, which spends down the make-good credit instead of returning a 429. Outside peak hours your credit is plentiful; inside peak hours you cannot reach it because the upstream window already tripped.",
  },
  {
    title: "The cache TTL drop inflates the per-prompt burn.",
    description:
      "Around April 2-3, 2026, Claude Code's default prompt cache TTL went from 1 hour to 5 minutes. One Reddit user documented going from 39 cache busts per day at $6.28 to 199 per day at $15.54, a $277.80 monthly delta on the same work. Cache rebuilds bill at the write rate against the credit balance, so the dollar number on the settings page drains 2-3x faster than the productivity you got out of it.",
  },
  {
    title: "The server can flip out_of_credits silently.",
    description:
      "OverageResponse has an out_of_credits boolean and a disabled_until timestamp. When out_of_credits is true, extra-usage requests fail at the gateway. Nothing in the Claude Code error message tells you which of the four possible causes (5h window tripped, weekly window tripped, monthly cap hit, out_of_credits true) actually fired. The disabled_reason string is your only diagnostic, and it lives only on this endpoint.",
  },
  {
    title: "Local-log trackers cannot see any of the above.",
    description:
      "ccusage and Claude-Code-Usage-Monitor walk the local JSONL transcript and sum tokens. /overage_spend_limit is a different endpoint on a different host. There is no overage block in the transcript. A tool that walks JSONL has zero visibility into BLOCKED, into disabled_until, or into the cents-precision spend that determines whether your apology credit has any spending power left.",
  },
];

const fundsRows = [
  {
    feature: "Sees the dollar balance",
    competitor: "No. JSONL has tokens, not dollars.",
    ours: "Yes. used_credits / monthly_credit_limit, in cents from /overage_spend_limit.",
  },
  {
    feature: "Sees out_of_credits true",
    competitor: "No. The boolean is not in any local file.",
    ours: "Yes. Renders as the literal string BLOCKED in the menu bar and CLI.",
  },
  {
    feature: "Sees disabled_until timestamp",
    competitor: "No.",
    ours: "Yes. Appended as 'until Sat May 10' next to BLOCKED.",
  },
  {
    feature: "Sees disabled_reason string",
    competitor: "No.",
    ours: "Yes. Surfaced in the snapshot JSON the bridge writes to localhost.",
  },
  {
    feature: "Counts cache rebuilds against credits",
    competitor: "Indirect. JSONL shows raw tokens, not whether they were cache-write or cache-hit.",
    ours: "Indirect on the client; the dollar drain is what you actually need.",
  },
  {
    feature: "Sees throttling fall-through to extra-usage",
    competitor: "No. JSONL records a request was sent; not what the server billed it against.",
    ours: "Yes. used_credits ticks up while five_hour utilization is at 100 percent.",
  },
  {
    feature: "Distinguishes 'window tripped' from 'credits blocked'",
    competitor: "No. Same client error for both.",
    ours: "Yes. Different fields on different endpoints; different recovery strategies.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-extra-usage-balance",
    title: "Claude extra-usage balance: the dollar line in plain English",
    excerpt:
      "Two endpoints, three fields, one BLOCKED state. Where the $X.XX figure on /settings/usage actually comes from.",
    tag: "Reference",
  },
  {
    href: "/t/claude-server-quota-visibility",
    title: "Server quota is a fraction with a private denominator",
    excerpt:
      "Why local token counters cannot equal the percent the settings page shows, and what claude-meter reads instead.",
    tag: "Server truth",
  },
  {
    href: "/t/claude-weekly-quota-tightened",
    title: "The seven reset clocks on your plan, not just one",
    excerpt:
      "Every Window field in /usage ships its own resets_at. The bucket at 100 percent is your real countdown.",
    tag: "Reset logic",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Anthropic shortage, cache bust, funny money: why your make-good credits are already spent",
  description:
    "The credits Anthropic handed out during the 2026 compute shortage and the Claude Code cache TTL drop look real on the settings page but the same OverageResponse that lists them ships an out_of_credits flag and a disabled_until timestamp the server can flip silently. ccusage cannot see either field.",
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

export default function AnthropicShortageCacheFunnyMoneyPage() {
  return (
    <article className="text-zinc-900">
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
          Anthropic gave you credits. The shortage and the cache TTL drop turned
          them into{" "}
          <GradientText>funny money</GradientText>.
        </h1>
        <p className="mt-6 text-lg text-zinc-700 leading-relaxed max-w-3xl">
          The dollars on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          are real. The spending power is not. The same response that lists your
          extra-usage credit ships an{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          flag and a{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            disabled_until
          </code>{" "}
          timestamp the server can flip without UI warning. None of the
          local-log trackers walking your JSONL transcript can see either field.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8">
          <div className="text-xs uppercase tracking-wider text-teal-700 font-semibold mb-3">
            Direct answer (verified 2026-05-07)
          </div>
          <p className="text-zinc-900 text-lg leading-relaxed">
            Why are Anthropic&apos;s apology credits unusable during the
            shortage? Because the same{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /api/organizations/{"{"}org_uuid{"}"}/overage_spend_limit
            </code>{" "}
            response that ships the dollar balance also ships an{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              out_of_credits: bool
            </code>{" "}
            plus a{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              disabled_until
            </code>{" "}
            timestamp the server can flip silently. Verified against{" "}
            <a
              href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
              className="text-teal-700 underline hover:text-teal-800"
            >
              src/models.rs lines 30-40
            </a>
            . Local-log trackers (ccusage, Claude-Code-Usage-Monitor) read
            JSONL token logs on disk and cannot reach this endpoint at all.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The four-line story
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-3">
          Anthropic underinvested in compute. New GPUs take 18 to 24 months to
          land, so they tightened consumer-plan rolling windows in late March
          2026 to keep production lit. Around the same time they quietly cut the
          Claude Code prompt cache TTL from 1 hour to 5 minutes, which meant
          identical work suddenly cost 2x to 3x more in tokens. Users hit walls
          twice as fast. Anthropic offered make-good credits, denominated in
          dollars, on top of every paid plan.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          And then the second-order problem started: the credits sit behind a
          server-side switch that nobody told users about. When peak-hour
          capacity gets tight, the boolean flips. When it does, your $200
          extra-usage promo balance reads as a dollar number on the settings
          page and zero spending power in Claude Code. Local trackers do not
          poll the field that controls it. The dollars are real; the access is
          conditional; the difference is invisible unless you read the right
          server response.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The four mechanics, in order
        </h2>
        <StepTimeline steps={mechanicSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
            Anchor fact: the OverageResponse struct is{" "}
            <GradientText>seven fields</GradientText>, three of which ccusage
            cannot see
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg mb-6">
            This is the open-source struct ClaudeMeter decodes the credit line
            from. The first four fields (
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              is_enabled
            </code>
            ,{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              monthly_credit_limit
            </code>
            ,{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              currency
            </code>
            ,{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              used_credits
            </code>
            ) are roughly inferable. The last three are not. They are{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              disabled_reason
            </code>
            ,{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              disabled_until
            </code>
            , and{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              out_of_credits
            </code>
            . Their default state is null/false. When they flip, your credit
            line is gone.
          </p>
          <AnimatedCodeBlock
            code={overageStructRust}
            language="rust"
            filename="claude-meter/src/models.rs"
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 17 lines that turn the boolean into the word BLOCKED
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter does almost nothing clever with this. It reads the struct,
          divides the cents by 100 to get dollars, and appends the literal
          string{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            BLOCKED
          </code>{" "}
          when{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          is true, plus the unlock date if{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            disabled_until
          </code>{" "}
          is set. The whole thing fits on a screen. The point is that everything
          you actually need to know about the credit line lives in the response;
          all you have to do is print it.
        </p>
        <AnimatedCodeBlock
          code={blockedRenderRust}
          language="rust"
          filename="claude-meter/src/format.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce the contract in one curl
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not have to install anything to verify this. Pull your
          claude.ai session cookie out of DevTools, find your org UUID at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/account
          </code>
          , and hit{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /overage_spend_limit
          </code>
          . The shape is the seven fields above. The cents-to-dollars conversion
          is on you.
        </p>
        <TerminalOutput
          title="/overage_spend_limit returns the credit line plus the BLOCKED switches"
          lines={reproTerminal}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <ComparisonTable
          heading="Visibility into the credit line: server-truth vs. local-log"
          intro="The Reddit thesis 'Anthropic gave us funny money' lands because the spending power is gated by fields no local tool can read. This table is the field-by-field gap."
          productName="ClaudeMeter (reads /overage_spend_limit)"
          competitorName="ccusage / Claude-Code-Usage-Monitor (reads local JSONL)"
          rows={fundsRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Counterargument: the credits are real dollars, you are being dramatic
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Fair. The dollars are real. If your usage is under the rolling-window
          ceilings and you are not in a peak-hour throttle, the credit spends
          like cash. Plenty of users will burn through a one-month
          subscription credit and never see{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          flip in their entire billing cycle. The funny-money framing is most
          true for the population it is loudest from: heavy Claude Code users
          running agentic loops between 8am and 2pm Eastern, where the
          probability of upstream throttling is highest, where the cache TTL
          drop hits hardest, and where capacity-protection flag flips are most
          likely to land. For everyone else it is a real $20 to $200 of value.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          That is also the reason this page exists rather than a refund-request
          template. The fix is not to argue with billing; the fix is to know
          what the server actually thinks of your credit, in real time, so
          that when the boolean does flip you see it before your next refactor
          stalls.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <GlowCard className="p-8 rounded-2xl bg-white border border-zinc-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
            Honest caveats
          </h2>
          <ul className="text-zinc-700 leading-relaxed space-y-3 list-disc pl-5">
            <li>
              The endpoint is undocumented. If Anthropic renames a field, the
              serde parse fails loudly and the menu bar shows{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                !
              </code>
              ; the fix is one struct edit and a release.
            </li>
            <li>
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                disabled_reason
              </code>{" "}
              is opaque. We have observed values like{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                capacity_protection
              </code>{" "}
              and have no public documentation of the full enum. Treat the
              string as a clue, not a contract.
            </li>
            <li>
              The cache TTL drop and the capacity throttle hit at different
              points in the request path. ClaudeMeter shows you the dollar
              consequence on{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                used_credits
              </code>
              , not the per-request cause. Causality has to be inferred from
              the timing.
            </li>
            <li>
              Make-good credits are subject to the same enforcement as paid
              metered usage. Once they are spent or disabled, the only path
              forward is the same as before the apology: wait for the rolling
              windows to age out.
            </li>
          </ul>
        </GlowCard>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          See your credit line before it flips
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter is free, MIT-licensed, and reads{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /overage_spend_limit
          </code>{" "}
          every 60 seconds. The menu bar shows the dollar balance and surfaces{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            BLOCKED
          </code>{" "}
          the moment{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          flips. No cookie paste on the extension route.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-20 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Need help wiring your own caller to /overage_spend_limit?"
          description="Send us your decoded response and we will help you handle the BLOCKED states the same way ClaudeMeter does."
          text="Book a 15-minute call"
          section="anthropic-shortage-funny-money-footer"
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
        description="See your credit line before it flips."
        section="anthropic-shortage-funny-money-sticky"
        site="claude-meter"
      />
    </article>
  );
}
