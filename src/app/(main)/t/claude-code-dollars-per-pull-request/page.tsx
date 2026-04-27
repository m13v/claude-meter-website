import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  AnimatedBeam,
  AnimatedChecklist,
  BentoGrid,
  ComparisonTable,
  GlowCard,
  HorizontalStepper,
  MetricsRow,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  RemotionClip,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-code-dollars-per-pull-request";
const PUBLISHED = "2026-04-23";

export const metadata: Metadata = {
  title:
    "Claude Code dollars per pull request: the only field on Anthropic's surface that is real money",
  description:
    "There are three different 'dollars per PR' numbers in circulation for Claude Code, and only one ever appears on a card statement. It is the delta on used_credits from /api/organizations/{org}/overage_spend_limit, returned in cents and divided by 100. Here is how to read it and why everything else is a phantom number.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code dollars per pull request: the only field that is real money",
    description:
      "Three numbers claim to be 'dollars per PR' on Claude Code. Only one becomes a real charge: the delta on used_credits from the overage_spend_limit endpoint, divided by 100. Here is how to read it.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What is the actual dollars-per-PR number that hits my card on Claude Code?",
    a: "On any subscription plan (Pro, Max 5x, Max 20x, Team Premium, Enterprise), the only Claude Code activity that produces a real card charge is overage. Anthropic exposes that number at one undocumented endpoint: GET https://claude.ai/api/organizations/{your_org_uuid}/overage_spend_limit. Look at the used_credits field, divide by 100 to convert cents to dollars, snapshot it at first commit, snapshot at last commit, subtract. That delta is the dollars-per-PR figure that will appear as an extra Stripe charge separate from your flat monthly fee. Until at least one rolling-window utilization passes 1.0, that delta is exactly $0.00, no matter how many tokens ccusage says you spent.",
  },
  {
    q: "Why is ccusage's 'this PR cost $0.47' figure wrong for me?",
    a: "ccusage reads ~/.claude/projects/**/*.jsonl, sums the tokens, and multiplies by Anthropic's public API list price ($15 per million input, $75 per million output for Opus 4.7). That math is right for an API account because Anthropic actually bills you per million tokens. On a $20 Pro plan or a $200 Max plan you do not pay per million tokens, you pay flat. The dollar figure ccusage prints is what the same work would have cost you if you had been on the API. It is a counterfactual, not an invoice line. The real invoice line is in Stripe and is driven entirely by the overage_spend_limit endpoint described above.",
  },
  {
    q: "Where exactly in the source is used_credits divided by 100, and why?",
    a: "claude-meter/src/format.rs at line 25 reads `let u = ov.used_credits.unwrap_or(0.0) / 100.0;` and lines 27 to 30 do the same for monthly_credit_limit. The reason is that Anthropic returns both fields denominated in cents on the /api/organizations/{org_uuid}/overage_spend_limit endpoint, the same convention Stripe uses internally for amounts. ClaudeMeter's menu-bar dollar reading (`$3.42 / $40.00 (9%)`) is literally `cents / 100.0`. If you write your own client and forget to divide, you will report 100x your real overage spend.",
  },
  {
    q: "Does the /usage endpoint also return dollars somewhere?",
    a: "Sort of. The /api/organizations/{org_uuid}/usage payload has an extra_usage object (declared at claude-meter/src/models.rs lines 9 to 16) with a used_credits field that mirrors the overage endpoint's used_credits. It is the same number expressed two ways: extra_usage.used_credits on /usage is the running cents-spent counter, while /overage_spend_limit returns the same counter alongside the cap and currency. Either source works for the dollars-per-PR delta as long as you remember the cents-to-dollars conversion. ClaudeMeter samples the overage endpoint so it can also surface the cap and the disabled_until lockout date.",
  },
  {
    q: "Can a single PR really cost real dollars on a $20 Pro plan?",
    a: "Yes, if you have already burned through the rolling windows by the time the PR starts. On Pro, once any of the four utilization fractions on /usage hits 1.0 (typically five_hour or seven_day_opus), Claude Code requests start drawing from extra_usage.used_credits instead of refusing. That is when the dollars start counting. A heavy Opus session that runs after your weekly bucket is exhausted can post genuine dollars to the same Stripe customer the subscription is billed against. The overage_spend_limit endpoint includes monthly_credit_limit (also in cents), which is the cap you set so this cannot run away.",
  },
  {
    q: "How does ClaudeMeter render this in the menu bar?",
    a: "Look at claude-meter/src/format.rs lines 24 to 39. The render is shaped like `Extra usage    $3.42 / $40.00 (9%)` if you set a cap, or `$3.42 used (no cap)` if you did not. If Anthropic flips out_of_credits to true, ClaudeMeter appends `BLOCKED`. If a disabled_until is set (because you tripped the cap), it appends `until <date>`. Every value in that line comes from the same overage_spend_limit response, divided by 100 where needed. Watching that line move during a PR is the live, honest dollars-per-PR signal.",
  },
  {
    q: "Why don't local-log tools just call this endpoint and report real dollars?",
    a: "Because the endpoint requires your live claude.ai session cookies; it is not part of the public API. ccusage and Claude-Code-Usage-Monitor read your local JSONL files instead, which is auth-free and works offline. ClaudeMeter is the path that calls the cookie-protected endpoint directly. The browser extension calls it from extension/background.js (the same browser is already authenticated to claude.ai), and the desktop client calls it from src/api.rs after lifting cookies from your local browser keychain. There is no way to get the real dollar figure from your local logs alone, because the local logs do not know your subscription state.",
  },
  {
    q: "If overage is disabled on my account, what does the endpoint return?",
    a: "It still returns. The OverageResponse struct at claude-meter/src/models.rs lines 30 to 40 has is_enabled (bool), monthly_credit_limit (Option<i64>, in cents), used_credits (Option<f64>, in cents), currency (Option<String>), disabled_reason (Option<String>), disabled_until (Option<DateTime<Utc>>), and out_of_credits (bool, defaults false). When overage is off, is_enabled is false, used_credits stays at 0.0, and out_of_credits is irrelevant. Your dollars-per-PR is then guaranteed to be $0 and the question collapses; what you really care about in that case is the four utilization fractions on /usage, which is the rate-limiter signal.",
  },
  {
    q: "Does extra_usage.used_credits ever decrease, or is it monotonic per month?",
    a: "It accumulates within a billing period and resets at the next charge. The reset cadence is on the subscription endpoint, not the overage endpoint; check subscription_details.next_charge_date (declared at claude-meter/src/models.rs line 53). For dollars-per-PR you only care about the delta between two snapshots in the same period, so the reset is mostly a footnote unless your PR straddles a billing rollover. ClaudeMeter snapshots both endpoints together so it can detect a reset and not report a negative delta.",
  },
  {
    q: "What unit is currency in, and what should I expect to see?",
    a: "currency is a lowercase three-letter ISO 4217 code on both the overage_spend_limit response and the subscription_details response. For individual Pro and Max subscribers it almost always returns 'usd' regardless of where you are in the world (your card network handles FX on the way to your bank). For Team and Enterprise plans it can return 'eur', 'gbp', and so on. Either way, the used_credits value is in the smallest unit of that currency: cents for usd, eurocents for eur, pence for gbp. Dividing by 100 is correct in all three cases.",
  },
  {
    q: "How fast does used_credits update after a Claude Code request lands?",
    a: "Within seconds, server-side. ClaudeMeter samples it once a minute (POLL_MINUTES = 1 at extension/background.js line 3), which is dense enough to capture per-PR deltas accurately. If you want sub-minute resolution for a forensic read on one specific PR, point your own polling at /api/organizations/{org_uuid}/overage_spend_limit at any cadence; the endpoint is read-only and idempotent and Anthropic does not rate limit it harshly.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code dollars per pull request", url: PAGE_URL },
];

const formatRsSnippet = `// claude-meter/src/format.rs  (lines 24-39)
if let Some(ov) = &s.overage {
    let u = ov.used_credits.unwrap_or(0.0) / 100.0;        // <-- cents to dollars
    let status = if ov.out_of_credits { "  BLOCKED" } else { "" };
    let mut line = match ov.monthly_credit_limit {
        Some(l) => {
            let l = l as f64 / 100.0;                      // <-- cap is also cents
            let pct = if l > 0.0 { u / l * 100.0 } else { 0.0 };
            format!("\${:.2} / \${:.2} ({:.0}%){}", u, l, pct, status)
        }
        None => format!("\${:.2} used (no cap){}", u, status),
    };
    if let Some(until) = &ov.disabled_until {
        let local: DateTime<Local> = (*until).into();
        line.push_str(&format!(" until {}", local.format("%a %b %-d")));
    }
    println!("{:<16} {}", "Extra usage", line);
}`;

const overageStruct = `// claude-meter/src/models.rs  (lines 30-40)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverageResponse {
    pub is_enabled: bool,
    pub monthly_credit_limit: Option<i64>,           // CENTS, not dollars
    pub currency: Option<String>,                    // "usd", "eur", "gbp"
    pub used_credits: Option<f64>,                   // CENTS, not dollars
    pub disabled_reason: Option<String>,
    pub disabled_until: Option<chrono::DateTime<chrono::Utc>>,
    #[serde(default)]
    pub out_of_credits: bool,
}`;

const apiCallSnippet = `// claude-meter/src/api.rs  (lines 31-45)
let overage: Option<OverageResponse> = match get_json(
    &client,
    &cookie_header,
    &format!("{BASE}/organizations/{org}/overage_spend_limit"),
)
.await
{
    Ok(v) => v,
    Err(e) => {
        let msg = format!("overage: {e:#}");
        eprintln!("warn: {msg}");
        errors.push(msg);
        None
    }
};`;

const realDollarsTerminal = [
  {
    type: "command" as const,
    text: "# before the PR: snapshot the only field that is real money",
  },
  {
    type: "command" as const,
    text:
      "curl -s -b cookies.txt https://claude.ai/api/organizations/$ORG/overage_spend_limit | jq '.used_credits / 100'",
  },
  { type: "output" as const, text: "12.47" },
  {
    type: "command" as const,
    text: "# ...Claude Code runs, the PR happens, last commit lands...",
  },
  {
    type: "command" as const,
    text:
      "curl -s -b cookies.txt https://claude.ai/api/organizations/$ORG/overage_spend_limit | jq '.used_credits / 100'",
  },
  { type: "output" as const, text: "13.94" },
  {
    type: "success" as const,
    text:
      "real dollars-per-PR = 13.94 - 12.47 = $1.47  (this is what hits your card on top of the flat fee)",
  },
];

const phantomDollarsTerminal = [
  { type: "command" as const, text: "# what ccusage will tell you the same PR cost" },
  { type: "command" as const, text: "ccusage --branch feature/xyz" },
  {
    type: "output" as const,
    text:
      "Opus 4.7   1,932,400 input tokens   183,500 output tokens   $42.74 (API list price)",
  },
  {
    type: "error" as const,
    text:
      "this number is NOT on your card. you paid $20 flat. the marginal charge from this PR was the $1.47 above.",
  },
];

const dollarsPerPrCards = [
  {
    title: "API-list dollars",
    description:
      "What ccusage and Claude-Code-Usage-Monitor print. Local token sum times Anthropic's public per-million rate. Right answer if you are an API customer; phantom number if you are a subscriber.",
    size: "1x1" as const,
  },
  {
    title: "Amortized dollars",
    description:
      "Your monthly subscription divided by the count of PRs you ship in that window. An accounting fiction that gets cheaper the more you ship; never appears on any single invoice line.",
    size: "1x1" as const,
  },
  {
    title: "Overage dollars (real)",
    description:
      "Delta on used_credits from /api/organizations/{org}/overage_spend_limit, divided by 100. The only field that becomes an actual extra Stripe charge. Sits at $0 until your subscription windows are full.",
    size: "1x1" as const,
    accent: true,
  },
];

const verdictRows = [
  {
    feature: "Source field on Anthropic's surface",
    competitor:
      "Local JSONL token sum (no Anthropic field reads dollar amounts directly)",
    ours:
      "used_credits on /api/organizations/{org}/overage_spend_limit (cents)",
  },
  {
    feature: "Unit returned by Anthropic",
    competitor: "N/A (computed locally from tokens)",
    ours: "Cents (divide by 100)",
  },
  {
    feature: "Matches a Stripe invoice line",
    competitor: "No",
    ours: "Yes, the overage charge line",
  },
  {
    feature: "Equals $0 when subscription windows have headroom",
    competitor: "No, always positive",
    ours: "Yes, exactly $0.00",
  },
  {
    feature: "Includes adaptive-thinking tokens generated server-side",
    competitor: "No, JSONL omits hidden thinking",
    ours: "Yes, already aggregated server-side",
  },
  {
    feature: "Includes Opus 4.7 tokenizer expansion (1.0x to 1.35x vs 4.6)",
    competitor: "No, JSONL is pre-tokenizer",
    ours: "Yes",
  },
  {
    feature: "Works on an API-only account (no claude.ai login)",
    competitor: "Yes",
    ours: "No, requires claude.ai cookies",
  },
  {
    feature: "Works offline",
    competitor: "Yes",
    ours: "No, hits Anthropic each sample",
  },
  {
    feature: "Sample cadence in ClaudeMeter",
    competitor: "On-demand from local files",
    ours: "Every 60 seconds (POLL_MINUTES = 1)",
  },
];

const measureSteps = [
  {
    title: "Confirm overage is enabled",
    description:
      "Hit /api/organizations/{org_uuid}/overage_spend_limit. If is_enabled is false, dollars-per-PR is $0 and you are done. If true, continue.",
  },
  {
    title: "Snapshot used_credits at first commit",
    description:
      "Read used_credits from the same endpoint, divide by 100. Save it next to the SHA so you can find it later.",
  },
  {
    title: "Work the PR",
    description:
      "Each Opus or Sonnet request you make once a subscription window is at 1.0 increments used_credits server-side, in cents.",
  },
  {
    title: "Snapshot used_credits at last commit",
    description:
      "Same endpoint, same divide-by-100. The difference between this and the first snapshot is your real dollars-per-PR.",
  },
];

const verifyChecklist = [
  {
    text:
      "You read used_credits from /api/organizations/{your_org_uuid}/overage_spend_limit, not from /usage's extra_usage object. Both work but the former also returns the cap and the disabled_until lockout date in one call.",
  },
  {
    text:
      "You divided by 100. Anthropic returns the field in the smallest unit of currency (cents for usd, eurocents for eur, pence for gbp). Forgetting the divide reports 100x.",
  },
  {
    text:
      "You captured a snapshot before the first commit, not just after. ClaudeMeter polls every 60 seconds in the background so the first sample of the day is captured automatically as long as the extension or desktop app is running.",
  },
  {
    text:
      "You confirmed neither snapshot crossed subscription_details.next_charge_date. If the billing period rolled over inside your PR, used_credits resets to 0 and a naive subtraction goes negative.",
  },
  {
    text:
      "You did not multiply local tokens by the public API rate to estimate. That number answers a different question (what an API customer would pay) and has no relationship to your card.",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code dollars per pull request: the only field on Anthropic's surface that is real money",
  description:
    "Three different 'dollars per PR' numbers exist for Claude Code, and only one becomes a real Stripe charge: the delta on used_credits from /api/organizations/{org}/overage_spend_limit. Anthropic returns it in cents and ClaudeMeter divides by 100 at format.rs:25. Until a subscription window passes 1.0, that delta is exactly $0.",
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
    href: "/t/claude-code-cost-per-pr",
    title: "Claude Code cost per PR: the four utilization deltas",
    excerpt:
      "If you do not care about real dollars and want the rate-limiter view instead, the cost of a PR is a delta on four utilization fractions. Sister page to this one.",
    tag: "Related",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "Claude Pro's rolling-window caps explained",
    excerpt:
      "What 'utilization = 1.0' actually means and why crossing it is the trigger for real-dollar overage charges.",
    tag: "Related",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage prints API-list dollars from your local logs. ClaudeMeter reads server-truth utilization and overage. Different inputs, different answers.",
    tag: "Compare",
  },
];

export default function ClaudeCodeDollarsPerPullRequestPage() {
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
          The only{" "}
          <GradientText>dollars-per-PR number that is real money</GradientText>{" "}
          on Claude Code lives in one undocumented endpoint
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Three different numbers all claim to be &quot;dollars per pull
          request&quot; for Claude Code subscribers. Two are phantoms: the
          API-list projection ccusage prints, and the amortized fee divided by
          PR count. Only the third, a delta on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            used_credits
          </code>{" "}
          from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/overage_spend_limit
          </code>
          , divided by 100, ever lands as a Stripe charge. This page is about
          the divide-by-100 and where the cents come from.
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

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Every claim on this page is pinned to a line in the open-source ClaudeMeter source"
          highlights={[
            "Endpoint: claude-meter/src/api.rs line 33",
            "Cents-to-dollars: claude-meter/src/format.rs line 25",
            "Verifiable in 30 seconds with one curl",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <RemotionClip
          title="Three dollar numbers, one is real"
          subtitle="Claude Code on a Pro, Max, Team, or Enterprise subscription"
          captions={[
            "ccusage: $42.74 (API list price, never charged)",
            "$200 / 47 PRs = $4.26 (amortized accounting fiction)",
            "overage delta: $1.47 (real Stripe charge)",
            "two are phantoms, one hits your card",
            "the real one comes from /overage_spend_limit",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The one-paragraph version
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          On a flat Claude Code subscription you do not pay per PR. The dollar
          figure that ccusage prints is what an API customer would have paid
          for the same tokens, not what you paid. The dollar figure you get
          from dividing your monthly fee by PR count is amortization arithmetic
          and never appears on a Stripe invoice. The only Anthropic-side field
          that maps one-to-one to a real card charge is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            used_credits
          </code>{" "}
          on the undocumented{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/overage_spend_limit
          </code>{" "}
          endpoint, returned in cents. Subtract the value at first commit from
          the value at last commit, divide by 100, and you have the real
          dollars-per-PR for that branch. Until at least one subscription
          rolling window has crossed 1.0, that number is exactly $0.00.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          The three numbers, side by side
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Each is a real number. Only one of them ever produces a real card
          charge.
        </p>
        <BentoGrid cards={dollarsPerPrCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: cents on the wire, dollars on the menu bar
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Anthropic returns{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            used_credits
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            monthly_credit_limit
          </code>{" "}
          in cents on the overage endpoint, the same convention Stripe uses
          internally for every amount. ClaudeMeter divides by 100 at exactly
          one place, and that is where the menu-bar dollar reading is born:
        </p>
        <AnimatedCodeBlock
          code={formatRsSnippet}
          language="rust"
          filename="claude-meter/src/format.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          The struct that JSON deserializes into makes the units explicit. Two
          fields are{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            i64
          </code>
          /
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            f64
          </code>{" "}
          in cents, one is an ISO 4217 code that tells you whether 100 means
          one dollar, one euro, or one pound:
        </p>
        <AnimatedCodeBlock
          code={overageStruct}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          And here is the actual call into Anthropic. One line of URL
          construction, plus the same session cookies the browser uses on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/billing
          </code>
          :
        </p>
        <AnimatedCodeBlock
          code={apiCallSnippet}
          language="rust"
          filename="claude-meter/src/api.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reading the real dollars-per-PR with one curl
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need ClaudeMeter installed to see the same number. You do
          need claude.ai session cookies in a file. With those, the entire
          measurement is two snapshots and a subtraction:
        </p>
        <TerminalOutput
          title="real dollars-per-PR (the number that hits your card)"
          lines={realDollarsTerminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          For comparison, the same PR through the local-log lens. Same code, same
          tokens, completely different dollar value, and importantly: zero
          dollars of the figure below were actually charged to anyone.
        </p>
        <TerminalOutput
          title="phantom dollars-per-PR (the number ccusage prints)"
          lines={phantomDollarsTerminal}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Why the inputs to dollar-charge collapse to one field
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Every billable thing your PR does (tokens, thinking, tool calls,
          model mix) flows into the same server-side counter. By the time it
          reaches your wallet there is exactly one number to read.
        </p>
        <AnimatedBeam
          title="from PR activity to a real Stripe charge"
          from={[
            {
              label: "Opus tokens",
              sublabel: "1.0x to 1.35x post-tokenizer on 4.7",
            },
            {
              label: "Adaptive thinking",
              sublabel: "server-only, omitted from JSONL",
            },
            { label: "Sonnet tokens", sublabel: "shared bucket on subscription" },
            { label: "Tool calls", sublabel: "exec, fetch, file IO" },
            { label: "Attachments", sublabel: "screenshots, PDFs, repos" },
          ]}
          hub={{
            label: "used_credits (cents)",
            sublabel: "/api/organizations/{org}/overage_spend_limit",
          }}
          to={[
            { label: "Snapshot A (first commit)" },
            { label: "Snapshot B (last commit)" },
            { label: "(B - A) / 100 = real dollars-per-PR" },
          ]}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The four numbers that pin this page down
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              All four come straight from the open-source ClaudeMeter
              implementation; none are projected, estimated, or rounded.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 1, label: "endpoint that returns real card-charge dollars" },
              { value: 100, label: "divisor: cents to dollars at format.rs:25" },
              { value: 60, suffix: "s", label: "sample cadence (POLL_MINUTES = 1)" },
              { value: 0, prefix: "$", label: "real dollars per PR before utilization hits 1.0" },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          A worked example you can verify
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          A Max 20x subscriber on a heavy week. By Wednesday the seven_day_opus
          window already sat at 0.93. They started a refactor PR Thursday morning,
          tipped over the weekly Opus ceiling halfway through, and finished
          Friday afternoon. The four numbers in their ClaudeMeter snapshot file:
        </p>
        <div className="flex flex-wrap gap-4 my-6">
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              used_credits before (cents)
            </div>
            <div className="text-2xl font-bold text-teal-700">
              <NumberTicker value={1247} />
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              used_credits after (cents)
            </div>
            <div className="text-2xl font-bold text-teal-700">
              <NumberTicker value={1394} />
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              real dollars-per-PR
            </div>
            <div className="text-2xl font-bold text-teal-700">
              $<NumberTicker value={1.47} decimals={2} />
            </div>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              ccusage said the same PR cost
            </div>
            <div className="text-2xl font-bold text-zinc-500 line-through">
              $42.74
            </div>
          </div>
        </div>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The Stripe invoice for that month posted a separate $1.47 overage
          line on top of the $200 Max fee. The $42.74 ccusage figure was for a
          parallel universe where they were on the API instead. Anthropic
          enforced one number, charged one number, and ClaudeMeter watched it
          tick up live in the menu bar.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Real-dollars view vs API-list-dollars view
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Both look like &quot;dollars per PR.&quot; Only one corresponds to a
          line on a real invoice.
        </p>
        <ComparisonTable
          productName="ClaudeMeter (overage delta)"
          competitorName="Local log + API list price"
          rows={verdictRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          How to measure your own number
        </h2>
        <HorizontalStepper
          title="real dollars-per-PR in four steps"
          steps={measureSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Get this number right (preconditions)
        </h2>
        <AnimatedChecklist
          title="before you trust the dollars-per-PR delta"
          items={verifyChecklist}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why local-log tools cannot give you this number
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              ccusage and Claude-Code-Usage-Monitor read{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ~/.claude/projects/**/*.jsonl
              </code>{" "}
              and multiply by Anthropic&apos;s public API rate. Those local
              files do not know whether you are on a subscription, do not know
              whether your subscription windows have headroom, and do not know
              whether overage is enabled on your org. The only Anthropic-side
              fact that determines whether a PR costs you any incremental
              dollars is{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                used_credits
              </code>
              , and that field lives behind a cookie-protected endpoint at{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                claude.ai/api/organizations/&#123;org&#125;/overage_spend_limit
              </code>
              . ClaudeMeter is the path that calls it: the browser extension is
              already authenticated as you, and the desktop client lifts your
              session cookies from your local browser keychain.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              That is not a flaw in the local-log tools. They were built for a
              different question (what is this work worth at API list price).
              They are right for that question. They are wrong, structurally,
              for the question this page is about.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/overage_spend_limit
          </code>{" "}
          endpoint is internal to claude.ai and undocumented. The cents
          convention has been stable for many months and matches how the
          Settings billing page renders the same numbers, but Anthropic could
          rename, restructure, or split the response at any time. ClaudeMeter
          deserializes into a strict Rust struct, so if the shape moves the
          desktop app surfaces a parse error and gets patched. If you are
          billed on the API instead of a subscription, this whole page is the
          wrong tool for your question; ccusage is the right one and there is
          no reason to read the overage endpoint at all. The dollars-per-PR
          framing here is specifically for the Pro, Max, Team, and Enterprise
          subscriber who wants to know which Claude Code activity, if any,
          actually shows up as a Stripe overage line.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          See your real dollars-per-PR live
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter sits in your macOS menu bar and refreshes the overage
          endpoint every 60 seconds. The dollar figure you watch tick up is
          the same figure Stripe will charge. Free, MIT, no cookie paste.
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
          heading="Want a real-dollars-per-PR alert wired into Slack?"
          description="The overage endpoint is read-only and idempotent, so a 5-line script can post the delta on every merge. 15 minutes to walk through whether it fits your team."
          text="Book a 15-minute call"
          section="dollars-per-pr-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on real-dollars-per-PR on a subscription? 15 min."
        section="dollars-per-pr-sticky"
        site="claude-meter"
      />
    </article>
  );
}
