import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  AnimatedBeam,
  ComparisonTable,
  StepTimeline,
  MetricsRow,
  BackgroundGrid,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-plan-pricing-tracker";
const PUBLISHED = "2026-04-28";

export const metadata: Metadata = {
  title:
    "Claude plan pricing tracker: the three endpoints you have to join (usage + overage + subscription)",
  description:
    "A real plan + pricing tracker for Claude Pro and Max needs more than rolling-window utilization. It needs your tier, renewal date, card on file, overage cap, and overage spend, joined to the same minute. Here are the three undocumented claude.ai endpoints, the exact JSON shapes, and how ClaudeMeter merges them on a 60-second cadence.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude plan pricing tracker: the three endpoints you have to join",
    description:
      "Why a token counter cannot be a Claude pricing tracker. The three internal claude.ai endpoints, the exact field names, and how ClaudeMeter joins them in the menu bar every 60 seconds.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude plan pricing tracker", url: PAGE_URL },
];

const usagePayload = `// GET https://claude.ai/api/organizations/{org_uuid}/usage
{
  "five_hour":          { "utilization": 0.62, "resets_at": "2026-04-28T19:14:00Z" },
  "seven_day":          { "utilization": 0.41, "resets_at": "2026-05-03T09:02:00Z" },
  "seven_day_sonnet":   { "utilization": 0.27, "resets_at": "2026-05-03T09:02:00Z" },
  "seven_day_opus":     { "utilization": 0.78, "resets_at": "2026-05-03T09:02:00Z" },
  "seven_day_oauth_apps": { "utilization": 0.05, "resets_at": "2026-05-03T09:02:00Z" },
  "extra_usage": {
    "is_enabled":     true,
    "monthly_limit":  50,
    "used_credits":   8.42,
    "utilization":    0.168,
    "currency":       "USD"
  }
}`;

const overagePayload = `// GET https://claude.ai/api/organizations/{org_uuid}/overage_spend_limit
{
  "is_enabled":            true,
  "monthly_credit_limit":  50,
  "currency":              "USD",
  "used_credits":          8.42,
  "disabled_reason":       null,
  "disabled_until":        null,
  "out_of_credits":        false
}`;

const subscriptionPayload = `// GET https://claude.ai/api/organizations/{org_uuid}/subscription_details
{
  "status":            "active",
  "next_charge_date":  "2026-05-12",
  "billing_interval":  "monthly",
  "currency":          "USD",
  "payment_method": {
    "brand":   "mastercard",
    "country": "US",
    "last4":   "4242",
    "type":    "card"
  }
}`;

const accountPayload = `// GET https://claude.ai/api/account
{
  "email_address": "you@example.com",
  "memberships": [
    { "organization": { "uuid": "1f7d...c4a2" }, "role": "primary_owner" },
    { "organization": { "uuid": "9a31...0b88" }, "role": "member" }
  ]
}`;

const pollLoop = `// claude-meter/extension/background.js, lines 14-44
async function fetchSnapshots() {
  const account = await fetchJSON(\`\${BASE}/api/account\`);
  const memberships = account.memberships || [];
  const results = [];
  for (const m of memberships) {
    const org = m.organization?.uuid || m.uuid;
    if (!org) continue;
    let usage = null, overage = null, subscription = null;
    try { usage        = await fetchJSON(\`\${BASE}/api/organizations/\${org}/usage\`); }                catch (e) { /* fail soft */ }
    try { overage      = await fetchJSON(\`\${BASE}/api/organizations/\${org}/overage_spend_limit\`); }  catch (e) { /* may not exist */ }
    try { subscription = await fetchJSON(\`\${BASE}/api/organizations/\${org}/subscription_details\`); } catch (e) { /* may not exist */ }
    if (!usage) continue;
    results.push({ org_uuid: org, fetched_at: new Date().toISOString(), usage, overage, subscription });
  }
  return results;
}
// Cadence: chrome.alarms.create("refresh", { periodInMinutes: 1 })`;

const faqs = [
  {
    q: "Why does a real plan pricing tracker need three endpoints, not one?",
    a: "Because each endpoint answers a different question. /api/organizations/{org}/usage answers 'how full are my rolling windows right now', and that is what every other tracker focuses on. /api/organizations/{org}/overage_spend_limit answers 'what is my pay-as-you-go cap and how much of it have I burned this month'. /api/organizations/{org}/subscription_details answers 'what tier am I on, when does it renew, and which card is going to get charged'. A bar that shows 62 percent utilization without showing tier, renewal date, and overage spend is not a pricing tracker, it is a usage tracker.",
  },
  {
    q: "Where exactly is the join code?",
    a: "claude-meter/extension/background.js, function fetchSnapshots, lines 14-44. The function calls /api/account first to enumerate memberships, then for each org_uuid it fetches /usage, /overage_spend_limit, and /subscription_details in sequence with credentials: 'include'. The four results are stitched into a single snapshot object and POSTed to the menu-bar app at http://127.0.0.1:63762/snapshots. The Rust side has the same join in src/api.rs, function fetch_usage_snapshot, lines 10-75, which deserializes each response into UsageResponse, OverageResponse, SubscriptionResponse from src/models.rs.",
  },
  {
    q: "What is in subscription_details that no token counter can ever see?",
    a: "Four fields that determine your actual pricing posture: status (active, past_due, canceled), next_charge_date (ISO date the next plan charge fires), billing_interval (monthly or annual, which changes the dollar amount), and payment_method (brand, country, last4, type). None of those live on disk. None of those are derivable from JSONL logs. They are returned by an internal endpoint behind your claude.ai cookie, and ClaudeMeter is the only menu-bar tool that surfaces them.",
  },
  {
    q: "What is the difference between extra_usage in the usage payload and the overage_spend_limit endpoint?",
    a: "They overlap but are not identical. usage.extra_usage carries is_enabled, monthly_limit, used_credits, utilization, and currency, scoped to the rolling-window response. overage_spend_limit carries is_enabled, monthly_credit_limit, currency, used_credits, plus disabled_reason, disabled_until, and out_of_credits, which the usage payload does not include. ClaudeMeter prefers overage_spend_limit when present because out_of_credits and disabled_reason are how you find out the cap was hit (or the org admin paused metered billing) without waiting for a 429.",
  },
  {
    q: "How is the cadence kept in sync across the three endpoints?",
    a: "One alarm. chrome.alarms.create('refresh', { periodInMinutes: 1 }) at extension/background.js line 105. Every 60 seconds the same fetchSnapshots run hits all three endpoints, top to bottom, per org. There is no separate timer for the subscription endpoint or the overage endpoint, so the rolling-window number, the overage spend, and the renewal date in the menu bar were all read at the same moment. That matters when you are watching utilization tick toward 100 percent and trying to decide whether to let it spill into metered billing.",
  },
  {
    q: "What if subscription_details or overage_spend_limit returns 404?",
    a: "Both calls are wrapped in try/catch and fail soft. extension/background.js line 27 swallows overage failures with a comment that overage may not exist for all orgs. Line 29 does the same for subscription_details. The snapshot still pushes if usage is non-null. The menu bar then renders the fields it does have and leaves the missing rows blank, so a free workspace org or a team without metered billing does not break the tracker. Anthropic enabling metered billing on April 16, 2026 made overage_spend_limit start appearing for every Pro and Max account, but free orgs still 404.",
  },
  {
    q: "Why does the join enumerate memberships from /api/account first?",
    a: "Because /api/organizations/{org}/usage requires an org_uuid in the path, and most accounts belong to more than one org (your personal Pro org, plus any team you have been invited to). /api/account returns the email plus a memberships array; ClaudeMeter loops over every membership and produces one snapshot per org. The menu-bar dropdown then shows tier and overage spend per org rather than averaging them, which is the only honest way to display data when one org has metered billing enabled and the other does not.",
  },
  {
    q: "Can I run the same join myself without installing ClaudeMeter?",
    a: "Yes. Open DevTools on claude.ai/settings/usage, copy your full Cookie header, then run three curls: one to /api/organizations/{org}/usage, one to /api/organizations/{org}/overage_spend_limit, one to /api/organizations/{org}/subscription_details, all with -H \"Cookie: $YOUR_COOKIE\" -H \"Referer: https://claude.ai/settings/usage\". You get the same JSON the extension does. Pipe through jq and you have a one-shot tracker. ClaudeMeter automates the cookie wrangling, the org enumeration, the 60-second cadence, and the merging into one menu-bar surface, but the data path is the same.",
  },
];

const beamFrom = [
  { label: "/api/organizations/{org}/usage", sublabel: "five_hour, seven_day, seven_day_opus, extra_usage" },
  { label: "/api/organizations/{org}/overage_spend_limit", sublabel: "monthly_credit_limit, used_credits, out_of_credits" },
  { label: "/api/organizations/{org}/subscription_details", sublabel: "status, next_charge_date, billing_interval, last4" },
];

const beamHub = {
  label: "fetchSnapshots()",
  sublabel: "extension/background.js, every 60s",
};

const beamTo = [
  { label: "Menu bar badge", sublabel: "% of worst window" },
  { label: "Dropdown rows", sublabel: "tier, renewal, overage" },
  { label: "claude-meter --json", sublabel: "CLI, one-shot" },
];

const comparisonRows = [
  { feature: "Tier (Pro vs Max)", ours: "subscription_details.status + billing_interval", competitor: "not exposed" },
  { feature: "Next charge date", ours: "subscription_details.next_charge_date", competitor: "not exposed" },
  { feature: "Card on file (brand + last4)", ours: "subscription_details.payment_method", competitor: "not exposed" },
  { feature: "Overage cap (in dollars)", ours: "overage_spend_limit.monthly_credit_limit", competitor: "not exposed" },
  { feature: "Overage spend so far", ours: "overage_spend_limit.used_credits", competitor: "not exposed" },
  { feature: "Out-of-credits flag", ours: "overage_spend_limit.out_of_credits", competitor: "not exposed" },
  { feature: "Rolling 5-hour utilization", ours: "usage.five_hour.utilization", competitor: "estimated from JSONL token sums" },
  { feature: "Weekly Opus quota", ours: "usage.seven_day_opus.utilization", competitor: "rolled into one bar, if shown" },
  { feature: "Refresh cadence", ours: "60s, all three endpoints together", competitor: "tail of ~/.claude/projects/**/*.jsonl writes" },
  { feature: "Per-org breakdown", ours: "one snapshot per membership", competitor: "single global counter" },
];

const mergeSteps = [
  {
    title: "Enumerate orgs",
    description:
      "GET /api/account returns email_address plus a memberships array. The extension iterates every membership and treats each org_uuid as its own snapshot target. This is the loop body in extension/background.js lines 19-43.",
  },
  {
    title: "Fetch usage",
    description:
      "GET /api/organizations/{org}/usage returns the rolling-window object: five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, plus an extra_usage block. If this fails, the snapshot is dropped (continue at line 31), because there is nothing to display without window data.",
  },
  {
    title: "Fetch overage",
    description:
      "GET /api/organizations/{org}/overage_spend_limit returns the metered-billing posture: monthly_credit_limit, used_credits, out_of_credits, disabled_reason. Wrapped in try/catch because free orgs and Workspaces without metered billing 404 here.",
  },
  {
    title: "Fetch subscription",
    description:
      "GET /api/organizations/{org}/subscription_details returns status, next_charge_date, billing_interval, currency, and payment_method (brand, country, last4, type). Same try/catch wrapper. This is the only endpoint that exposes pricing context.",
  },
  {
    title: "Stitch and POST",
    description:
      "All four responses (account email, usage, overage, subscription) collapse into one snapshot object keyed by org_uuid, stamped with fetched_at. POSTed to http://127.0.0.1:63762/snapshots so the menu-bar app reads from the bridge instead of double-fetching.",
  },
  {
    title: "Render in the menu bar",
    description:
      "The badge shows the worst utilization across five_hour and seven_day. The dropdown lists per-org tier, next charge date, last4, overage cap and overage burn. Numbers across all four sections were read in the same 60-second tick, so the user sees a consistent pricing snapshot.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "ccusage says 5 percent, claude.ai says rate limited",
    excerpt:
      "Why local token counters and the server quota disagree, and the exact field the rate limiter actually checks.",
    tag: "Mental model",
  },
  {
    href: "/t/claude-usage-server-truth",
    title: "Verifying a Claude tracker actually reads server truth",
    excerpt:
      "The three-step protocol: DevTools intercept, localhost bridge curl, staleness flip. Verifies the data path in under a minute.",
    tag: "Verification",
  },
  {
    href: "/t/claude-rolling-5-hour-burn-rate",
    title: "Rolling 5-hour burn rate is Δu/Δt, not tokens per minute",
    excerpt:
      "Why a quota burn rate cannot be derived from local logs, and the small math that turns two snapshots into a 429 ETA.",
    tag: "Math",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude plan pricing tracker: the three endpoints you have to join",
  description:
    "A real plan + pricing tracker for Claude Pro and Max joins three undocumented claude.ai endpoints (usage, overage_spend_limit, subscription_details) on the same 60-second tick. Here is the schema, the join, and what shows up in the menu bar that no token counter can match.",
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

export default function ClaudePlanPricingTrackerPage() {
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
          A Claude plan pricing tracker is a{" "}
          <GradientText>three-endpoint join</GradientText>, not a token counter
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Most tools that call themselves Claude trackers read one
          thing: a rolling-window number. That tells you how full your
          5-hour or weekly bucket is. It does not tell you which plan
          you are on, when the next charge fires, what card is on file,
          how much of your overage cap you have already burned, or
          whether your org just hit out-of-credits. Pricing context
          lives in two other claude.ai endpoints, and the only way to
          watch it live is to poll all three on the same tick.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="11 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What &ldquo;tracker&rdquo; usually means, and the gap
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Open the browser tab that does what most popular trackers do
          and you find a single bar: 62 percent of a 5-hour window, or
          some estimated weekly value computed from local Claude Code
          token logs. Useful, but it is missing the entire pricing
          half. If your org is on Claude Max at $200 a month with
          metered billing enabled, the things you actually want to
          watch are: the rolling-window utilization, the dollar amount
          you have spilled into extra usage this cycle, the cap you set
          on extra usage so you do not get surprise-billed, and the
          renewal date so you can compare last month to this month.
          That information lives across three separate undocumented
          endpoints behind your claude.ai cookie. They look stable,
          they have not been documented anywhere, and the only way to
          assemble them is to call all three and stitch the JSON
          yourself.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Endpoint zero: enumerate the orgs
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Before any of the three real endpoints are reachable, you
          need an org_uuid for the URL path. That comes from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/account
          </code>
          . The response carries your email and a list of memberships.
          Most Pro users have one. Anyone in a team has at least two.
          Each membership produces an independent snapshot.
        </p>
        <AnimatedCodeBlock
          code={accountPayload}
          language="json"
          filename="claude.ai/api/account"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The shape is small but load-bearing. ClaudeMeter iterates
          every membership and treats each org as its own row in the
          dropdown. Tier and overage cap differ per org, which is why
          averaging them would lie.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Endpoint one: the rolling-window utilization
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          This is the endpoint everyone already knows about.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          returns the bars you see on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>
          . What is less well known: it returns more than one window.
          On Claude Pro and Max you get five_hour, seven_day, plus
          per-model breakdowns (seven_day_sonnet, seven_day_opus), and
          an extra_usage block that mirrors part of the overage
          endpoint.
        </p>
        <AnimatedCodeBlock
          code={usagePayload}
          language="json"
          filename="claude.ai/api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The schema is fixed in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>{" "}
          as the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            UsageResponse
          </code>{" "}
          struct, lines 18-28. If a field is renamed upstream, the
          serde deserializer fails fast and the menu bar surfaces a
          parse error rather than a silently wrong number.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Endpoint two: overage spend limit
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The endpoint that turns a usage tracker into a pricing
          tracker.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/overage_spend_limit
          </code>{" "}
          returns the metered-billing posture for the org: the cap you
          set, how many dollars of extra usage you have already
          consumed this cycle, whether you are out of credits, and
          whether an admin has paused the spend.
        </p>
        <AnimatedCodeBlock
          code={overagePayload}
          language="json"
          filename="claude.ai/api/organizations/{org_uuid}/overage_spend_limit"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Three fields here that exist nowhere else.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            disabled_reason
          </code>{" "}
          tells you why an admin paused metered spend (for example,
          billing failed).{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            disabled_until
          </code>{" "}
          tells you the timestamp the pause auto-clears.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          flips to true the moment your{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            used_credits
          </code>{" "}
          equals{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            monthly_credit_limit
          </code>
          , which is the live signal that further prompts will start
          to fail rather than spill. You will not see any of these in
          a token-counting tracker, because they are pricing-state
          flags, not usage measurements.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Endpoint three: subscription details
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The other half of the pricing picture.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/subscription_details
          </code>{" "}
          returns your tier and renewal posture: status (active,
          past_due, canceled), next_charge_date, billing_interval, and
          payment_method (brand, country, last4, type).
        </p>
        <AnimatedCodeBlock
          code={subscriptionPayload}
          language="json"
          filename="claude.ai/api/organizations/{org_uuid}/subscription_details"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          A small but useful detail:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            billing_interval
          </code>{" "}
          decides which plan dollar amount to show next to your tier
          in the dropdown. monthly + Pro means $20 (or local
          currency); monthly + Max means $100 or $200 depending on the
          tier you picked; annual flips both to a different yearly
          line. Without that field, a tracker has to guess. With it,
          the dropdown shows a per-org renewal preview that lines up
          with what the billing email is going to look like.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The actual join
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          One alarm, one loop, four awaits per org. Below is the exact
          shape of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            fetchSnapshots
          </code>{" "}
          from the open-source extension. Note the try/catch around
          overage and subscription: those endpoints can 404 on free
          orgs without breaking the tick.
        </p>
        <AnimatedCodeBlock
          code={pollLoop}
          language="javascript"
          filename="claude-meter/extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The loop is sequential rather than parallel by design.
          claude.ai applies Cloudflare-style request shaping; firing
          three calls back to back at minute boundaries looks
          identical to what a real settings-page reload does. Polling
          all three in parallel is faster but trips bot heuristics
          more often.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          How the four sources collapse into one menu-bar snapshot
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Three pricing-aware endpoints feed one fetchSnapshots call.
          The output goes three places: badge, dropdown, CLI.
        </p>
        <AnimatedBeam
          title="Three endpoints, one tick, three surfaces"
          from={beamFrom}
          hub={beamHub}
          to={beamTo}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Step by step: what one tick produces
        </h2>
        <StepTimeline steps={mergeSteps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          What only a three-endpoint tracker shows
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Token counters cover one column on the right. Pricing-aware
          fields all live in the left column.
        </p>
        <ComparisonTable
          productName="ClaudeMeter (server, three-endpoint join)"
          competitorName="Local token counter (JSONL only)"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              Numbers that come out of the join
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              All four are read from the live response, not estimated.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 3, label: "endpoints joined per tick" },
              { value: 60, suffix: "s", label: "cadence across all three" },
              { value: 7, label: "rolling-window fields per usage call" },
              { value: 0, label: "tokens summed locally" },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What this lets you do that a usage-only tracker cannot
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Three concrete examples. First, when{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          crosses 100, you can read{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            overage_spend_limit.is_enabled
          </code>{" "}
          on the same tick to know whether the next prompt will spill
          into metered billing or 429. Second, when watching a long
          Claude Code agent loop you can pair{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            used_credits
          </code>{" "}
          deltas with rolling-window deltas to derive a real
          dollars-per-prompt rate, not a token-derived guess. Third,
          on the day{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            next_charge_date
          </code>{" "}
          fires you can compare this cycle&apos;s overage burn against
          last cycle&apos;s before the actual charge lands, because
          the renewal timestamp is in the same payload as the spend.
          None of those are possible with one endpoint.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          All three endpoints are internal and undocumented. The field
          names in this guide map to the Rust structs at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>{" "}
          (UsageResponse, OverageResponse, SubscriptionResponse) and
          have been stable for many months, but Anthropic can rename
          or restructure any of them in any release. ClaudeMeter
          deserializes strictly: a missing field surfaces as a parse
          error, not as a wrong number, so you find out immediately
          rather than days later when the dropdown is silently lying.
          The README documents the risk and the menu bar shows a{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            !
          </code>{" "}
          state when any one of the three breaks.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Need a tracker that joins all three?"
          description="If you are running Claude Pro or Max with metered billing on, 15 minutes is enough to wire up the three-endpoint join in your own tooling or to swap in ClaudeMeter and skip the integration."
          text="Book a 15-minute call"
          section="plan-pricing-tracker-footer"
        />
      </div>

      <FaqSection items={faqs} />

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid title="Related guides" posts={relatedPosts} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        text="Book a call"
        description="Questions on joining usage, overage, and subscription? 15 min."
        section="plan-pricing-tracker-sticky"
      />
    </article>
  );
}
