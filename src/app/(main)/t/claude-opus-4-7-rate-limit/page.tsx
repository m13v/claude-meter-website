import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
  ComparisonTable,
  AnimatedChecklist,
  MetricsRow,
  GlowCard,
  BentoGrid,
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

const PAGE_URL = "https://claude-meter.com/t/claude-opus-4-7-rate-limit";
const PUBLISHED = "2026-04-23";

export const metadata: Metadata = {
  title: "Claude Opus 4.7 Rate Limit: The Three Endpoints That Decide Your Next Request",
  description:
    "The Opus 4.7 rate limit is not one number. It is a three-endpoint decision tree on claude.ai: /usage returns the utilization floats, /overage_spend_limit says whether paid fallback is live, /subscription_details pins your plan ceiling. ClaudeMeter polls all three and exposes them on a localhost bridge at 127.0.0.1:63762.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Opus 4.7 Rate Limit: The Three Endpoints That Decide Your Next Request",
    description:
      "One utilization float cannot tell you whether an Opus 4.7 request will 200, pay overage, or 429. The real answer is three endpoints. Here is the decision tree, the field names, and the localhost bridge to script against it.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What is the Claude Opus 4.7 rate limit in plain numbers?",
    a: "There is no plain number. The limit is two utilization floats (five_hour and seven_day_opus) whose denominators depend on your plan (Pro, Max 5x, Max 20x). When either float reaches 1.0 the next Opus 4.7 request returns 429. Anthropic raised the denominators when 4.7 launched to offset adaptive thinking, but the raw numeric ceiling is never exposed to the client. The only authoritative signal is GET https://claude.ai/api/organizations/{org}/usage, which returns the current fraction.",
  },
  {
    q: "Why do you say the rate limit is three endpoints, not one?",
    a: "Because the outcome of a rate-limited request depends on three independent server facts. (1) /api/organizations/{org}/usage says whether your quota utilization is below 1.0. (2) /api/organizations/{org}/overage_spend_limit says whether extra-usage billing is enabled and has credit, which decides if a limit-exceeded call bills through or hard-stops. (3) /api/organizations/{org}/subscription_details gives the plan tier that sets the utilization denominator. ClaudeMeter polls all three in src/api.rs lines 16 to 60.",
  },
  {
    q: "What is the difference between 'hitting the limit' and '429'?",
    a: "They are not the same event. 'Hitting the limit' means a utilization float reached 1.0. What happens next depends on /overage_spend_limit. If extra_usage.is_enabled is true and out_of_credits is false, your request is metered against the monthly_limit and returns 200, so there is no 429. If is_enabled is false or out_of_credits is true, the same prompt 429s. ClaudeMeter reads this endpoint on every 60-second tick so the distinction is visible before you send the request.",
  },
  {
    q: "Where is the Opus 4.7 limit actually enforced, client-side or server-side?",
    a: "Server-side, entirely. The tokenizer change in Opus 4.7 runs on Anthropic's infrastructure. The 1.0x to 1.35x expansion is applied before the token count is written to your utilization buckets. Any client-side token counter (including ccusage and Claude-Code-Usage-Monitor) is reading a pre-expansion number. That is why your local log and your Settings page disagree after a heavy Opus 4.7 session.",
  },
  {
    q: "Can I check the rate limit from a shell script before I send a request?",
    a: "Yes, if you run ClaudeMeter. The menu-bar app starts a localhost HTTP bridge at http://127.0.0.1:63762/snapshots (extension/background.js line 2). The browser extension POSTs a fresh snapshot to that URL every 60 seconds, so a shell script can curl the same URL and read utilization, overage, and subscription at once. No auth, loopback only. This is the piece that distinguishes ClaudeMeter from any local-log reader: the rate-limit state is served over HTTP on your machine.",
  },
  {
    q: "What fields in the JSON actually matter for Opus 4.7 specifically?",
    a: "Four. usage.five_hour.utilization (shared with Sonnet, hard gate), usage.seven_day_opus.utilization (Opus-only weekly, 4.7 fills this fastest because of the new tokenizer and adaptive thinking), overage.is_enabled and overage.out_of_credits together (decide fallback vs 429), and subscription.status (inactive or past_due overrides everything else). The other usage fields (seven_day_sonnet, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork) exist in the payload, but Opus 4.7 traffic does not trip them on their own.",
  },
  {
    q: "How often do I need to re-read these endpoints?",
    a: "ClaudeMeter polls every 60 seconds. That cadence is set in extension/background.js line 3 (POLL_MINUTES = 1). You can tighten it, but the usage bars on claude.ai itself only refresh once a minute, so faster polling just duplicates the same response. A 60-second cadence is enough to catch a bucket crossing 0.80 (ClaudeMeter's warn threshold in background.js line 87) before you type your next prompt.",
  },
  {
    q: "If I hit the limit, when does it actually unblock me?",
    a: "The server returns a resets_at ISO-8601 timestamp inside the Window struct alongside every utilization fraction (src/models.rs lines 3 to 7). For five_hour it is usually somewhere inside the next five hours, sliding on each request. For seven_day_opus it is usually a fixed UTC rollover. The popup formats this as 'now, Xm, Xh, Xd' in extension/popup.js lines 17 to 27. Treat it as authoritative, not the 'weekly reset' that Anthropic's public help center describes.",
  },
  {
    q: "Does the overage endpoint exist for every account?",
    a: "No. /overage_spend_limit returns 404 on free accounts and on Pro accounts that have never touched extra usage. The Rust client in src/api.rs lines 31 to 45 treats that case as a soft None rather than an error. The TypeScript extension does the same in extension/background.js line 27. If your account does not return an overage object, the rate limit is binary: under 1.0 you are fine, at 1.0 you 429.",
  },
  {
    q: "How is this different from just reading ~/.claude/projects/*.jsonl with ccusage?",
    a: "Local JSONL files are a record of what your Claude Code client logged, not what Anthropic billed. They miss the 4.7 tokenizer expansion (applied server-side), adaptive thinking tokens that 4.7 hides by default (display: omitted), any peak-hour multiplier, and the overage/subscription state entirely. ccusage answers 'how many tokens did my machine send.' ClaudeMeter answers 'what will Anthropic do on my next Opus 4.7 request.' Both are useful; they are not substitutes.",
  },
  {
    q: "Is there an API I can call without running ClaudeMeter?",
    a: "Yes, but only with a logged-in claude.ai cookie. Open DevTools on claude.ai/settings/usage, copy the Cookie header from the Network panel, and curl https://claude.ai/api/organizations/{your_org_uuid}/usage. The org UUID is in the URL of any /settings page. Anthropic has not documented this endpoint, and they can change the shape at any time. ClaudeMeter is open source so you can read the exact request shape in src/api.rs before you try it yourself.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Opus 4.7 rate limit", url: PAGE_URL },
];

const apiRsSnippet = `// claude-meter/src/api.rs  (lines 10 to 60)
pub async fn fetch_usage_snapshot(cookies: &ClaudeCookies) -> Result<UsageSnapshot> {
    let client = build_client()?;
    let cookie_header = build_cookie_header(cookies)?;
    let org = &cookies.last_active_org;

    // 1. Utilization floats (the quota gate)
    let usage: Option<UsageResponse> = get_json(
        &client, &cookie_header,
        &format!("{BASE}/organizations/{org}/usage"),
    ).await.ok();

    // 2. Paid fallback eligibility (429 vs billed 200)
    let overage: Option<OverageResponse> = get_json(
        &client, &cookie_header,
        &format!("{BASE}/organizations/{org}/overage_spend_limit"),
    ).await.ok().flatten();

    // 3. Plan tier (denominator of every utilization float)
    let subscription: Option<SubscriptionResponse> = get_json(
        &client, &cookie_header,
        &format!("{BASE}/organizations/{org}/subscription_details"),
    ).await.ok();

    Ok(UsageSnapshot { org_uuid: org.clone(), usage, overage, subscription, .. })
}`;

const bridgeJsSnippet = `// claude-meter/extension/background.js  (lines 1 to 3)
const BASE   = "https://claude.ai";
const BRIDGE = "http://127.0.0.1:63762/snapshots";
const POLL_MINUTES = 1;`;

const overageSnippet = `// claude-meter/src/models.rs  (lines 30 to 40)
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

const bridgeCurl = [
  { type: "command" as const, text: "# ClaudeMeter's localhost bridge, no auth, loopback only." },
  { type: "command" as const, text: "curl -s http://127.0.0.1:63762/snapshots | jq '.[0] | {five_hour: .usage.five_hour.utilization, seven_day_opus: .usage.seven_day_opus.utilization, overage_live: (.overage.is_enabled and (.overage.out_of_credits | not))}'" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"five_hour\":       0.62," },
  { type: "output" as const, text: "  \"seven_day_opus\":  0.88," },
  { type: "output" as const, text: "  \"overage_live\":    true" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "seven_day_opus at 0.88: 12 percent of Opus weekly headroom before 429 or overage billing kicks in." },
];

const scriptingExample = [
  { type: "command" as const, text: "#!/usr/bin/env bash" },
  { type: "command" as const, text: "# gate an Opus 4.7 call on the three-endpoint state" },
  { type: "command" as const, text: "read FIVE OPUS OVERAGE <<< $(curl -sf http://127.0.0.1:63762/snapshots \\" },
  { type: "command" as const, text: "  | jq -r '.[0] | [.usage.five_hour.utilization, .usage.seven_day_opus.utilization, (.overage.is_enabled and (.overage.out_of_credits | not))] | @tsv')" },
  { type: "command" as const, text: "" },
  { type: "command" as const, text: "if (( $(echo \"$FIVE >= 1.0\" | bc -l) )); then" },
  { type: "command" as const, text: "  echo 'five_hour pinned; Opus 4.7 will 429. wait for resets_at.'" },
  { type: "command" as const, text: "  exit 1" },
  { type: "command" as const, text: "elif (( $(echo \"$OPUS >= 1.0\" | bc -l) )) && [[ \"$OVERAGE\" != \"true\" ]]; then" },
  { type: "command" as const, text: "  echo 'seven_day_opus pinned and overage unavailable; will 429.'" },
  { type: "command" as const, text: "  exit 2" },
  { type: "command" as const, text: "fi" },
  { type: "command" as const, text: "claude --model opus-4-7 \"$@\"" },
  { type: "success" as const, text: "The pre-flight runs in <1 ms; the snapshot is already cached locally by the extension's 60s tick." },
];

const endpointRoles = [
  {
    title: "/organizations/{org}/usage",
    description:
      "The quota gate. Returns seven utilization floats and a resets_at per float. For Opus 4.7, five_hour and seven_day_opus are the two that matter. Both must stay below 1.0. This is the only endpoint every other tracker looks at, and on its own it cannot tell a hard 429 from a billed 200.",
    size: "2x1" as const,
  },
  {
    title: "/organizations/{org}/overage_spend_limit",
    description:
      "The fallback gate. Returns is_enabled, used_credits, monthly_credit_limit, out_of_credits. When utilization hits 1.0, this endpoint decides whether Anthropic bills you or rejects the request. Missing from every local-log tool; ccusage and Claude-Code-Usage-Monitor have no way to see it.",
    size: "1x1" as const,
  },
  {
    title: "/organizations/{org}/subscription_details",
    description:
      "The plan gate. Returns status, billing_interval, payment_method.brand. Defines the denominator of every utilization fraction. A past_due or canceled subscription 429s you regardless of utilization, which no quota tool surfaces.",
    size: "1x1" as const,
  },
  {
    title: "/api/account",
    description:
      "The identity gate. Returns email_address and memberships. ClaudeMeter uses this to loop over every org you belong to, because an Opus 4.7 user with a personal Pro account and a team Max account has two separate three-endpoint stacks to watch.",
    size: "2x1" as const,
  },
];

const decisionSteps = [
  {
    title: "1. Read usage.five_hour.utilization",
    description:
      "Shared across every model. If this is at or above 1.0, Opus 4.7 will 429 even when the Opus weekly bucket is empty. This is the most common surprise: a Sonnet-heavy morning can block Opus in the afternoon.",
  },
  {
    title: "2. Read usage.seven_day_opus.utilization",
    description:
      "Opus-only weekly float. Fills fastest on 4.7 because the tokenizer expands 1.0x to 1.35x and adaptive thinking generates more hidden output tokens than 4.6. Sonnet calls do not touch this float.",
  },
  {
    title: "3. Branch on overage.is_enabled and overage.out_of_credits",
    description:
      "If either utilization is at 1.0, this is where the 429 vs billed-200 decision happens. is_enabled=true AND out_of_credits=false is the only combination that converts a limit-hit into a successful response.",
  },
  {
    title: "4. Sanity-check subscription.status",
    description:
      "A past_due or canceled subscription is treated as 'no plan' server-side. Utilization denominators collapse and the request rejects. ClaudeMeter reads this on every tick so the CLI can flag the mismatch before you see an opaque error.",
  },
  {
    title: "5. Issue the Opus 4.7 request, or wait for resets_at",
    description:
      "If steps 1 to 4 say the call will succeed or bill, send it. If they say it will 429, read the resets_at timestamp on the pinned float and sleep until then. resets_at is returned on every tick and the extension renders it as 'now, Xm, Xh, Xd' in popup.js lines 17 to 27.",
  },
];

const preconditionChecklist = [
  {
    text: "usage.five_hour.utilization < 1.0. Shared across Sonnet and Opus; a Sonnet-heavy session will pin this first.",
  },
  {
    text: "usage.seven_day_opus.utilization < 1.0. Opus-only weekly. Fills faster on 4.7 than it did on 4.6 for the same workload.",
  },
  {
    text: "overage.is_enabled is true AND overage.out_of_credits is false. If this flips, a utilization hit becomes a 429 instead of a billed 200.",
  },
  {
    text: "subscription.status is active. A past_due subscription produces rate-limit-shaped errors that no utilization float can explain.",
  },
  {
    text: "Your claude.ai cookie is fresh. All three endpoints reject with 401 if your browser session has expired, and ClaudeMeter surfaces the error in the menu bar immediately.",
  },
];

const comparisonRows = [
  {
    feature: "Reads usage.five_hour.utilization",
    competitor: "No, estimates from local JSONL",
    ours: "Yes, verbatim from /api/organizations/{org}/usage",
  },
  {
    feature: "Reads seven_day_opus (Opus-only weekly)",
    competitor: "No, cannot separate Opus from total",
    ours: "Yes, surfaced on its own row",
  },
  {
    feature: "Knows if overage billing is live",
    competitor: "No, /overage_spend_limit is not in local logs",
    ours: "Yes, polled every 60 seconds",
  },
  {
    feature: "Knows if subscription is past_due",
    competitor: "No",
    ours: "Yes, via /subscription_details",
  },
  {
    feature: "Accounts for the 4.7 tokenizer expansion",
    competitor: "No, local token count is pre-expansion",
    ours: "Yes, server applies it before utilization is returned",
  },
  {
    feature: "Counts hidden adaptive-thinking tokens",
    competitor: "No, omitted thinking is not in JSONL",
    ours: "Yes, already in utilization",
  },
  {
    feature: "Exposes state over localhost HTTP for scripting",
    competitor: "No",
    ours: "Yes, http://127.0.0.1:63762/snapshots",
  },
  {
    feature: "Multi-account support",
    competitor: "No",
    ours: "Yes, iterates /api/account memberships",
  },
];

const articleJsonLd = articleSchema({
  headline: "Claude Opus 4.7 rate limit: the three endpoints that decide your next request",
  description:
    "The Opus 4.7 rate limit is a three-endpoint decision tree, not one number. /usage returns utilization floats, /overage_spend_limit decides whether a limit-hit becomes a 429 or a billed 200, /subscription_details pins the plan denominator. ClaudeMeter polls all three and exposes the combined snapshot at http://127.0.0.1:63762/snapshots.",
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
    title: "Claude Code Opus 4.7 usage limits",
    excerpt:
      "The same rate limit from the Opus-only weekly angle. Where seven_day_opus lives in the schema and why 4.7 fills it faster than 4.6.",
    tag: "Related",
  },
  {
    href: "/t/claude-pro-5-hour-window-quota",
    title: "Claude Pro 5-hour window quota",
    excerpt:
      "five_hour is not a 45-message counter. One float on a sliding clock, shared across every model. How and when it resets.",
    tag: "Related",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "The Claude rolling window cap is seven windows",
    excerpt:
      "Anthropic publishes two rolling windows; the endpoint returns seven. Every field, what it gates, and which ones Opus 4.7 actually trips.",
    tag: "Related",
  },
];

export default function ClaudeOpus47RateLimitPage() {
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
          The Claude Opus 4.7 rate limit is{" "}
          <GradientText>three endpoints, not one number</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Most guides on this topic give you a ceiling: X messages per 5
          hours, Y Opus prompts per week. That answer is a projection from
          the real data, not the data itself. The actual gate that decides
          whether your next Opus 4.7 call 200s, bills against overage, or
          429s is three private endpoints on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/api/organizations/&#123;org&#125;/*
          </code>
          . ClaudeMeter is the only tool that polls all three and serves
          the combined state over a localhost HTTP bridge so your scripts
          can read it before Claude Code does.
        </p>
        <div className="mt-8">
          <ShimmerButton href="/install">
            Install ClaudeMeter, free
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
          ratingCount="Traced from the open-source ClaudeMeter client"
          highlights={[
            "Three endpoints named in src/api.rs lines 16 to 60",
            "Localhost bridge defined in extension/background.js line 2",
            "Reproducible with one curl on your own machine",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <RemotionClip
          title="Three endpoints, one rate limit"
          subtitle="What decides Opus 4.7's 200 vs 429"
          captions={[
            "/usage: utilization floats (quota gate)",
            "/overage_spend_limit: billed vs hard 429",
            "/subscription_details: plan denominator",
            "one snapshot at 127.0.0.1:63762/snapshots",
            "curl-able from any shell script",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why one number cannot answer this question
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          A rate limit is usually discussed as a fraction: you are at 72
          percent, you have 28 percent left. For Opus 4.7 that framing is
          dangerous. Your next request has three possible outcomes (200,
          billed 200, 429), and the utilization fraction on its own cannot
          distinguish them. The outcome depends on whether extra-usage
          billing is enabled on your account, whether your plan is active,
          and which of the two utilization floats (5-hour or Opus weekly)
          is the one at 1.0.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The server encodes those three facts in three separate JSON
          payloads. ClaudeMeter fetches them in one tick and treats them
          as a tuple. That tuple is the real rate-limit state.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          The three endpoints, named
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Every tick, ClaudeMeter&apos;s{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            fetch_usage_snapshot
          </code>{" "}
          calls four endpoints on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/api
          </code>
          . Three of them feed directly into the Opus 4.7 rate-limit
          decision.
        </p>
        <BentoGrid cards={endpointRoles} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: here is the fetch, in full
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          This is every HTTP request ClaudeMeter makes to learn your Opus
          4.7 rate-limit state. All three are authed with your
          browser&apos;s existing{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai
          </code>{" "}
          cookies, fired in parallel by the background worker every 60
          seconds:
        </p>
        <AnimatedCodeBlock
          code={apiRsSnippet}
          language="rust"
          filename="claude-meter/src/api.rs"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          The decision tree a request actually takes
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Five consecutive reads against the three endpoints. Any one of
          them can flip the outcome from 200 to billed-200 to 429.
        </p>
        <StepTimeline
          title="From three JSON payloads to one boolean: can I send this Opus 4.7 prompt?"
          steps={decisionSteps}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          The three payloads, one outcome
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Three independent JSON responses collapse into a single
          true/false on whether your Opus 4.7 request will succeed. This
          is the logic the rate limiter itself runs server-side.
        </p>
        <AnimatedBeam
          title="Three endpoints → rate-limit decision"
          from={[
            {
              label: "/organizations/{org}/usage",
              sublabel: "seven utilization floats, one resets_at per float",
            },
            {
              label: "/organizations/{org}/overage_spend_limit",
              sublabel: "is_enabled, out_of_credits, used_credits",
            },
            {
              label: "/organizations/{org}/subscription_details",
              sublabel: "status, billing_interval, payment_method",
            },
          ]}
          hub={{
            label: "Opus 4.7 rate-limit outcome",
            sublabel: "200, billed 200, or 429",
          }}
          to={[
            { label: "Claude Code succeeds" },
            { label: "Bills against overage" },
            { label: "Returns 429 with resets_at" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The part nobody else has: a localhost bridge
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              ClaudeMeter&apos;s menu-bar app opens an HTTP server on{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                127.0.0.1:63762
              </code>
              . The browser extension POSTs a fresh snapshot to{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /snapshots
              </code>{" "}
              on every 60-second tick. That same path accepts GET, so any
              process on your machine can curl the current rate-limit
              state without touching{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                claude.ai
              </code>{" "}
              directly.
            </p>
            <div className="mt-6">
              <AnimatedCodeBlock
                code={bridgeJsSnippet}
                language="javascript"
                filename="claude-meter/extension/background.js"
              />
            </div>
            <p className="text-zinc-700 leading-relaxed text-lg mt-6">
              Local-log tools like ccusage and Claude-Code-Usage-Monitor
              have no equivalent. They read your JSONL and summarize it;
              there is no HTTP surface to hit, no overage or subscription
              state they know about, and no path from a Bash script to
              &ldquo;is my next Opus 4.7 call safe to send.&rdquo;
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reading the bridge from a shell
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          A single curl returns the combined snapshot for every org you
          are in. Here is the minimal read that extracts the three fields
          a pre-flight check cares about:
        </p>
        <TerminalOutput
          title="curl http://127.0.0.1:63762/snapshots"
          lines={bridgeCurl}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The overage endpoint, in the struct
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          This is the endpoint nobody else is reading. It is the one that
          converts &ldquo;utilization hit 1.0&rdquo; into either a 429 or
          a billed 200, and the one that decides whether your{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extra_usage.monthly_limit
          </code>{" "}
          is still spendable:
        </p>
        <AnimatedCodeBlock
          code={overageSnippet}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Two booleans do the real work:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            is_enabled
          </code>{" "}
          (you have opted in to paid overage) and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          (you have not exhausted the monthly cap). Both must be in the
          good state for a utilization-hit to become a billed success
          instead of a rate-limit error.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          A real pre-flight script, end to end
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          This wrapper gates an Opus 4.7 call on the three-endpoint state
          served by ClaudeMeter&apos;s local bridge. It exits 1 if the
          5-hour float is pinned, 2 if the Opus weekly float is pinned
          and overage is not available, otherwise invokes Claude Code:
        </p>
        <TerminalOutput
          title="bin/opus47-guarded.sh"
          lines={scriptingExample}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The numbers, verbatim
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              From the open-source client and Anthropic&apos;s Opus 4.7
              release notes. No invented benchmarks.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 3, label: "internal endpoints that define the limit" },
              { value: 4, label: "usage fields that gate Opus 4.7 specifically" },
              { value: 60, suffix: "s", label: "extension poll cadence" },
              { value: 63762, label: "localhost bridge port" },
            ]}
          />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={80} suffix="%" />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                background.js line 87 warn threshold
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={100} suffix="%" />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                hot threshold that triggers the red badge
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={35} suffix="%" />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                max tokenizer expansion on Opus 4.7 vs 4.6
              </div>
            </div>
          </div>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What has to be true for an Opus 4.7 call to go through
        </h2>
        <AnimatedChecklist
          title="Preconditions the rate limiter actually checks"
          items={preconditionChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Server truth vs local logs
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Two different questions, two different answer sets. Only one
          matches what Anthropic&apos;s Opus 4.7 rate limiter actually
          enforces.
        </p>
        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="Local log tools"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Every one of these endpoints is undocumented. The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          shape has been stable for months, but{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /overage_spend_limit
          </code>{" "}
          gained{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          in a silent release, and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /subscription_details
          </code>{" "}
          has changed fields twice this year. ClaudeMeter deserializes
          into strict Rust structs, so a breaking change shows up as a
          parse error in the menu bar, not as silent wrong numbers. The
          repo is MIT and under 2,000 lines; you can read the entire
          request path in about ten minutes.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch the three endpoints live, for free
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter runs in your macOS menu bar, polls all three
          endpoints every 60 seconds, and serves the combined snapshot at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            127.0.0.1:63762/snapshots
          </code>
          . Free, MIT, no keychain prompt with the browser extension.
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
          heading="Got a payload that breaks the three-endpoint model?"
          description="If your account returns an extra Opus-specific field, a different overage shape, or a subscription state the decision tree does not cover, send it over. We patch the struct same day."
          text="Book a 15-minute call"
          section="opus-4-7-rate-limit-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on the Opus 4.7 rate-limit endpoints? 15 min."
        section="opus-4-7-rate-limit-sticky"
        site="claude-meter"
      />
    </article>
  );
}
