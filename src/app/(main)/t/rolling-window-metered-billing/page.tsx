import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  BeforeAfter,
  GlowCard,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/rolling-window-metered-billing";
const PUBLISHED = "2026-05-05";

export const metadata: Metadata = {
  title:
    "Rolling Window vs Metered Billing on Claude: Two Parallel Systems, Not Two Stages",
  description:
    "Claude's rolling window and metered billing are not stages of one billing model. They are two parallel systems on two different endpoints, with different units (utilization floats vs cents), different clocks (5h/7d vs monthly cycle), and different opt-in states. Here is the line-by-line comparison and the JSON behind both.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Rolling Window vs Metered Billing on Claude: Two Parallel Systems, Not Two Stages",
    description:
      "Two endpoints, two units, two clocks, two opt-in states. The rolling window keeps ticking even when metered billing is actively spending. Here is the field-by-field comparison.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "If I enable extra usage, does the rolling window stop tracking me?",
    a: "No. The rolling 5-hour and 7-day buckets keep ticking on /api/organizations/{org}/usage no matter what. seven_day.utilization will climb past 1.0 once you spill into metered (we have seen 1.04 and 1.12 in the JSON) but the included usage is already gone, so what you are watching is just a counter, not a gate. The actual gate moved to a different field on a different endpoint: out_of_credits on /api/organizations/{org}/overage_spend_limit. Two parallel systems, both running. The popup clamps the visual bar with Math.min(100, v) for cosmetic reasons.",
  },
  {
    q: "Are rolling window and metered billing the same thing with different names?",
    a: "No. They share zero fields. The rolling window is utilization floats keyed by time bucket (five_hour, seven_day, plus per-model and per-app sub-buckets) with an ISO resets_at on each one. Metered billing is dollar amounts keyed by billing cycle (monthly_credit_limit, used_credits, both in cents on the wire) with disabled_until and out_of_credits as the gate. In claude-meter's source, they are even different Rust struct types: Window in src/models.rs lines 3-7 and OverageResponse at lines 30-40. They could not be more separate.",
  },
  {
    q: "If the rolling window hits 100% and I have not enabled extra usage, what happens?",
    a: "Hard 429. seven_day.utilization >= 1.0 with extra_usage.is_enabled = false means the only remedy is waiting for seven_day.resets_at to pass. There is no silent fall-through into metered. Anthropic does not flip the toggle for you. New paid accounts default to is_enabled = false, and you have to opt in once on Settings > Usage > Extra usage > Enable for the second system to be wired up at all.",
  },
  {
    q: "If extra usage is enabled and I have not hit the rolling window yet, am I being billed metered?",
    a: "No. Metered billing only spends when included usage is exhausted on the per-prompt rate decision. While five_hour and seven_day utilization are both well under 1.0, your prompts are billed against the plan and used_credits stays at 0.0. The two systems coexist in the JSON; only one of them is active for any given prompt at any moment.",
  },
  {
    q: "How does claude.ai decide which ledger gets a given prompt?",
    a: "By the per-prompt rate-limit decision, not by the window that tripped. If a prompt would have 429'd on either the 5-hour or the 7-day rolling window, and extra_usage.is_enabled is true and out_of_credits is false on /overage_spend_limit, the prompt bills metered. Otherwise it bills against the plan. We do not have an endpoint that says 'this prompt was metered'; the diagnostic you have is used_credits ticking up by some integer cents on the next poll.",
  },
  {
    q: "Why are the metered numbers in cents?",
    a: "It is the API convention. monthly_credit_limit is i64 cents, used_credits is f64 cents (Anthropic's own folded peak-hour multipliers and per-model weights produce fractional cents). claude-meter divides by 100.0 before printing dollars (src/format.rs lines 25 and 29). If you scrape the endpoint yourself and skip the division, you will see $50000.00 instead of $500.00 and assume the cap is sky-high.",
  },
  {
    q: "Where exactly does the BLOCKED state live?",
    a: "On the metered side only. out_of_credits = true on /overage_spend_limit is the BLOCKED signal. The rolling window has no equivalent boolean; you infer 'blocked' from utilization >= 1.0 and the resets_at timestamp not yet passed. So a 100% weekly bar is not the same kind of state as a BLOCKED extra usage line. One auto-resets in hours or days; the other is hardcoded in src/format.rs line 26 to render the literal string '  BLOCKED' until you raise the cap or wait for next_charge_date.",
  },
  {
    q: "Does ccusage track either of these?",
    a: "Neither. ccusage reads ~/.claude/projects/<project>/<session>.jsonl on disk and sums Claude Code tokens against the public model price card. That is a faithful local-token estimate but it never makes an HTTP call to claude.ai, so it cannot see /usage (rolling window) or /overage_spend_limit (metered billing). You can run ccusage at $4 of estimated spend while claude-meter shows $17 of metered used_credits and 92% on the 7-day rolling window; all three numbers are correct because they measure three different things.",
  },
  {
    q: "Will Anthropic eventually merge them into one billing model?",
    a: "No public roadmap. The April 2026 metered billing rollout (extra usage on Pro and Max 5x and Max 20x) added the second system on top of the first; it did not replace the rolling window. We watch /api/organizations/{org}/usage and /overage_spend_limit on every release for field renames; the structure has stayed parallel since the rollout. claude-meter's Rust models are the running record of what each endpoint looks like.",
  },
  {
    q: "If I am on a workspace or team org with no metered billing, is there still a rolling window?",
    a: "Yes. The rolling window is plan-side and ships in /usage for every paid org. The metered billing endpoint /overage_spend_limit returns 404 in that case and claude-meter's api.rs handles it (lines 31-45) by storing None in the snapshot and skipping the Extra usage row in the menu bar. So absence of the metered row is informative: it means the second system is not wired up for your org, not that you are healthy on it.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Rolling window vs metered billing", url: PAGE_URL },
];

const comparisonRows = [
  {
    feature: "Unit on the wire",
    competitor: "Dollar amounts in integer cents (i64) and fractional cents (f64). monthly_credit_limit and used_credits divided by 100 in src/format.rs to render dollars.",
    ours: "Utilization floats from 0.0 to 1.0 (sometimes also 0 to 100 inconsistently). Plus an ISO 8601 resets_at timestamp per bucket.",
  },
  {
    feature: "Endpoint",
    competitor: "GET /api/organizations/{org_uuid}/overage_spend_limit. 404 for free or workspace orgs without metered billing enabled.",
    ours: "GET /api/organizations/{org_uuid}/usage. Returns for every paid org; the rolling window is plan-side, not opt-in.",
  },
  {
    feature: "Reset clock",
    competitor: "Monthly billing cycle. used_credits zeros out on next_charge_date from /subscription_details. No interpolated countdown in the JSON.",
    ours: "Continuous rolling. 5-hour bucket resets in roughly 5 hours from your first message in the window; 7-day buckets reset 168 hours from a per-account start. resets_at is exact to the second.",
  },
  {
    feature: "Opt-in mechanic",
    competitor: "Required. Settings > Usage > Extra usage > Enable. Default for new paid accounts is is_enabled = false. Anthropic does not flip it for you.",
    ours: "Automatic on every paid plan. No setting, no toggle. The /usage endpoint just returns the buckets your account has.",
  },
  {
    feature: "Failure mode",
    competitor: "BLOCKED. out_of_credits = true on /overage_spend_limit when used_credits hits monthly_credit_limit, or when disabled_reason names an external pause (admin_disabled, incident_pause). Hardcoded literal '  BLOCKED' string in src/format.rs line 26.",
    ours: "429. utilization >= 1.0 on a bucket means rate-limited until that bucket's resets_at. No boolean; you infer the gate from the float.",
  },
  {
    feature: "Number of distinct sub-fields",
    competitor: "Six on /overage_spend_limit (is_enabled, monthly_credit_limit, currency, used_credits, disabled_reason, disabled_until, out_of_credits) plus a sub-block on /usage that mirrors four of them.",
    ours: "Seven Window structs: five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork. Each carries its own utilization and resets_at independently.",
  },
  {
    feature: "Behavior when the OTHER system trips",
    competitor: "Only spends when a prompt would have 429'd on the rolling window AND is_enabled is true AND out_of_credits is false. Otherwise the dollar count stays at 0.0 even with extra usage enabled.",
    ours: "Keeps ticking past 1.0 in the underlying float even when metered billing is the active ledger. The popup clamps to 100 visually with Math.min(100, v) but the JSON is uncapped.",
  },
];

const usageJsonExample = `// GET /api/organizations/{org_uuid}/usage
//
// Rolling window: utilization floats and resets_at timestamps.
// Note seven_day at 1.04 - the float keeps climbing past 1.0
// while metered billing is the active ledger downstream.
{
  "five_hour":        { "utilization": 0.42, "resets_at": "2026-05-05T18:00:00Z" },
  "seven_day":        { "utilization": 1.04, "resets_at": "2026-05-09T09:00:00Z" },
  "seven_day_sonnet": { "utilization": 0.94, "resets_at": "2026-05-09T09:00:00Z" },
  "seven_day_opus":   { "utilization": 1.04, "resets_at": "2026-05-09T09:00:00Z" },
  "extra_usage": {
    "is_enabled":    true,
    "monthly_limit": 5000,
    "used_credits":  1720.0,
    "utilization":   0.344,
    "currency":      "USD"
  }
}`;

const overageJsonExample = `// GET /api/organizations/{org_uuid}/overage_spend_limit
//
// Metered billing: dollar amounts in cents, BLOCKED gate.
// Same prompt cycle as above, this is the second ledger.
{
  "is_enabled":           true,
  "monthly_credit_limit": 5000,    // cents -> $50.00
  "used_credits":         1720.0,  // cents -> $17.20
  "currency":             "USD",
  "disabled_reason":      null,
  "disabled_until":       null,
  "out_of_credits":       false    // <- gate. true => BLOCKED
}`;

const modelsRsExcerpt = `// claude-meter/src/models.rs
//
// Two struct types, one per system. They share zero fields.
// The rolling window does not know about cents; the overage
// response does not know about resets_at on a per-bucket clock.

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {                         // <- rolling window
    pub utilization: f64,                   //    0.0 to 1.0+
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverageResponse {                // <- metered billing
    pub is_enabled: bool,
    pub monthly_credit_limit: Option<i64>,  //    cents
    pub currency: Option<String>,
    pub used_credits: Option<f64>,          //    cents (fractional)
    pub disabled_reason: Option<String>,
    pub disabled_until: Option<chrono::DateTime<chrono::Utc>>,
    #[serde(default)]
    pub out_of_credits: bool,               //    BLOCKED gate
}`;

const apiRsExcerpt = `// claude-meter/src/api.rs lines 16 to 45
//
// The two endpoints are called sequentially, with separate
// error handling. Neither is a fallback for the other; the
// snapshot stores both Option<...> fields and the renderer
// decides which row to print based on which one came back.

let usage: Option<UsageResponse> = match get_json(
    &client, &cookie_header,
    &format!("{BASE}/organizations/{org}/usage"),
).await { /* ... */ };

let overage: Option<OverageResponse> = match get_json(
    &client, &cookie_header,
    &format!("{BASE}/organizations/{org}/overage_spend_limit"),
).await {
    Ok(v) => v,
    Err(e) => {
        // 404 here is normal: free workspace orgs and team
        // orgs without metered billing return 404 on this URL.
        // The rolling window endpoint above does not.
        let msg = format!("overage: {e:#}");
        eprintln!("warn: {msg}");
        errors.push(msg);
        None
    }
};`;

const menuBarBoth = [
  { type: "command" as const, text: "$ claude-meter status" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           42.0% used    -> resets Tue May 5 18:00 (in 4h)" },
  { type: "output" as const, text: "7-day all       100.0% used    -> resets Sat May 9 09:00 (in 3d)" },
  { type: "output" as const, text: "7-day Sonnet     94.0% used    -> resets Sat May 9 09:00 (in 3d)" },
  { type: "output" as const, text: "7-day Opus      100.0% used    -> resets Sat May 9 09:00 (in 3d)" },
  { type: "output" as const, text: "Extra usage      $17.20 / $50.00 (34%)" },
  { type: "output" as const, text: "Next charge      May 14, 2026   visa ••0936" },
  { type: "success" as const, text: "Both systems live: rolling window pegged at 100, metered ledger spending under cap." },
];

const decisionSteps = [
  {
    title: "Read the rolling window first",
    description:
      "Pull /api/organizations/{org}/usage with your existing claude.ai cookies. The five_hour and seven_day fields each carry a utilization float and a resets_at timestamp. Under 1.0 on both means you are still in included usage and metered billing is irrelevant. This is the only system that exists for free workspace orgs and orgs without metered billing turned on.",
  },
  {
    title: "If a bucket pegs, check extra_usage.is_enabled in the same response",
    description:
      "The extra_usage sub-block on /usage is the cheapest read for 'is the second system wired up?'. is_enabled = false means hard 429 at the wall, wait for resets_at. is_enabled = true means metered billing is configured and a fall-through is possible on the next prompt.",
  },
  {
    title: "Read the dedicated metered endpoint for the BLOCKED gate",
    description:
      "GET /api/organizations/{org}/overage_spend_limit, same cookies. out_of_credits = false plus used_credits < monthly_credit_limit means the next prompt bills metered. out_of_credits = true is the BLOCKED state; raise monthly_credit_limit on Settings > Usage > Adjust limit, or wait for next_charge_date on /subscription_details.",
  },
  {
    title: "Render both rows, not just one",
    description:
      "Both systems are running simultaneously. claude-meter prints the rolling window rows AND the Extra usage row in one menu bar dropdown so the parallel state is legible at a glance. If you build your own tracker, do not flatten the two into a single percent; readers need to see which clock each line is on.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-weekly-limit-extra-usage",
    title: "Claude weekly limit and extra usage: the fall-through chain, field by field",
    excerpt:
      "Once you understand the two parallel systems, the next question is what happens when both are lit at once. The decision tree across both endpoints, with the JSON at every state.",
    tag: "Diagnosis",
  },
  {
    href: "/t/claude-extra-usage-balance",
    title: "Claude extra usage balance: what the dollar line on /settings/usage actually is",
    excerpt:
      "Deep dive on the metered billing side: where the cents come from, why monthly_credit_limit lives on its own endpoint, and the 17 Rust lines that turn the JSON into the BLOCKED row.",
    tag: "Reference",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "The Claude rolling window cap is seven windows, not one",
    excerpt:
      "Deep dive on the rolling window side: the seven sub-buckets the /usage endpoint actually returns, why Settings shows two of them, and how a per-model bucket can cap you with the aggregate looking healthy.",
    tag: "Reference",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Rolling window vs metered billing on Claude: two parallel systems, not two stages",
  description:
    "Claude's rolling window and metered billing run on different endpoints with different units, different reset clocks, and different opt-in states. Field-by-field comparison plus the JSON behind both, with the open-source Rust types as the running record.",
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

export default function RollingWindowMeteredBillingPage() {
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
          Rolling window vs{" "}
          <GradientText>metered billing</GradientText> on Claude: two parallel systems, not two stages
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Half the threads on this confuse one for the other. They are not
          stages of one model. They are two different endpoints, two different
          units, two different reset clocks, two different opt-in states, and
          they run at the same time. The rolling window does not stop ticking
          when metered billing kicks in. Metered billing does not exist on
          your account until you flip a toggle. Here is what is actually
          happening in the JSON, the open-source Rust types both endpoints
          deserialize into, and the line-by-line difference.
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

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-05)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            Two parallel systems, not two stages. The plan quota (a.k.a.
            the rolling window) is the time-based usage your subscription
            includes; metered usage (a.k.a. extra usage, overage, or
            pay-as-you-go) is the opt-in dollar ledger that kicks in on top.
            Concretely: utilization floats on{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              GET /api/organizations/&#123;org&#125;/usage
            </code>{" "}
            with auto-reset clocks (5 hour and 7 day). It is automatic on every
            paid plan. Metered billing is an opt-in dollar cap on a separate
            endpoint{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              GET /api/organizations/&#123;org&#125;/overage_spend_limit
            </code>{" "}
            with cents on the wire and a{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              out_of_credits
            </code>{" "}
            boolean as the gate. Hitting the rolling window does not turn
            metered billing on; you must enable it once at Settings &gt; Usage
            &gt; Extra usage &gt; Enable. After that, both run simultaneously.
            Anthropic confirms the opt-in mechanic on{" "}
            <a
              href="https://support.claude.com/en/articles/12429409-manage-extra-usage-for-paid-claude-plans"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              Manage extra usage for paid Claude plans
            </a>
            ; the field shapes are in the open-source{" "}
            <a
              href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              src/models.rs
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Rolling window vs metered billing, field by field
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The two systems share zero fields on the wire. Here is what each
          dimension actually looks like, sourced from the live JSON and the
          Rust types claude-meter deserializes them into.
        </p>
        <ComparisonTable
          productName="Rolling window"
          competitorName="Metered billing"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The /usage payload: rolling window plus a metered summary
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          One endpoint carries every rolling-window utilization float plus a
          small extra_usage block that mirrors a few metered fields. The
          rolling window data is the primary product of this response. Watch
          seven_day in this snapshot: it is at 1.04, not capped at 1.0. The
          underlying counter does not stop just because the included usage
          ran out.
        </p>
        <AnimatedCodeBlock
          code={usageJsonExample}
          language="json"
          filename="GET /api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The extension popup runs the float through{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Math.min(100, v ?? 0)
          </code>{" "}
          on extension/popup.js line 37 to clamp the visual bar at 100% width.
          That is purely cosmetic. The JSON is uncapped, and so is the menu
          bar percent string when you read it from the CLI.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The /overage_spend_limit payload: metered billing only
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Different endpoint, different shape, different units. Same cookies.
          Cents on the wire,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          as the gate, no resets_at because the only relevant clock is the
          monthly billing cycle on /subscription_details. This is the second
          ledger; it is stored independently in claude-meter&apos;s snapshot
          struct and rendered as a separate row.
        </p>
        <AnimatedCodeBlock
          code={overageJsonExample}
          language="json"
          filename="GET /api/organizations/{org}/overage_spend_limit"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          On free workspace orgs and team orgs without metered billing
          enabled, this endpoint returns 404. The /usage endpoint above keeps
          working. That asymmetry is the cleanest proof these are not two
          stages of one billing model: one of the two systems can be entirely
          absent on an account that still has the other.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Two struct types in the open-source source
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          claude-meter is MIT licensed Rust, and the cleanest way to see how
          parallel these systems are is to look at the types it deserializes
          the responses into. Window and OverageResponse share zero fields.
          The Window type carries time-bucket utilization; the OverageResponse
          carries dollars and a BLOCKED flag.
        </p>
        <AnimatedCodeBlock
          code={modelsRsExcerpt}
          language="rust"
          filename="src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          And the API client itself calls both endpoints in sequence, with
          separate error handling, in src/api.rs. Neither is a fallback for
          the other.
        </p>
        <AnimatedCodeBlock
          code={apiRsExcerpt}
          language="rust"
          filename="src/api.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Both running at the same time, in one menu bar dropdown
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The most concrete proof these are parallel systems is what the
          dropdown looks like when both are lit. Rolling window pegged at 100%
          on the 7-day, metered ledger spending dollars under the cap. The
          rolling window did not stop ticking; it climbed past 1.0 in the
          float (clamped at 100% in the print). The metered ledger started at
          0 and walked up to $17.20.
        </p>
        <TerminalOutput
          title="claude-meter status, both systems lit"
          lines={menuBarBoth}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Common confusions, side by side
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The two views people walk in with, and the actual mechanic. Toggle
          to flip between them.
        </p>
        <BeforeAfter
          before={{
            label: "Common belief",
            content:
              "The rolling window is the free included usage on a Pro or Max plan. When you blow through it, metered billing takes over and the rolling window stops tracking you. They are two stages of the same billing model: included first, metered after.",
            highlights: [
              "Rolling window stops once metered kicks in",
              "Metered is the next stage, not a separate system",
              "Hitting 100 percent on the weekly bar opens metered automatically",
              "One endpoint, one billing surface, two phases",
            ],
          }}
          after={{
            label: "What is actually happening",
            content:
              "Two endpoints, two data shapes, two clocks. The rolling window keeps ticking past 1.0 in the JSON even when metered is the active ledger. Metered billing is opt-in only: a fresh paid account has is_enabled = false until you flip the Settings toggle. After opt-in, both run simultaneously, and the per-prompt rate decision (not the window that tripped) routes a given prompt to one ledger or the other.",
            highlights: [
              "Rolling window keeps ticking past 1.0 (uncapped float)",
              "Metered billing opt-in is required, never automatic",
              "Two endpoints (/usage and /overage_spend_limit) called separately",
              "Per-prompt routing, not stage-based fall-through",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Reading both systems by hand
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          If you are wiring a tracker yourself, here is the read order. Both
          endpoints take the same browser session cookies. claude-meter does
          this on a 60 second tick; you can do it once when the next 429
          lands.
        </p>
        <StepTimeline steps={decisionSteps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="py-2 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The shortest mental model
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto mb-6">
              Two systems. Different units. Different clocks. Different
              opt-ins. Both running.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
                  Rolling window
                </p>
                <p className="text-zinc-800 text-sm leading-relaxed">
                  Time-bucket utilization floats on{" "}
                  <code className="bg-zinc-100 px-1 rounded font-mono text-xs">
                    /usage
                  </code>
                  . Auto-resets every 5 hours and 7 days. Plan-side, no opt-in.
                  Failure mode is a 429 until the bucket&apos;s resets_at passes.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
                  Metered billing
                </p>
                <p className="text-zinc-800 text-sm leading-relaxed">
                  Dollar cap (in cents) on{" "}
                  <code className="bg-zinc-100 px-1 rounded font-mono text-xs">
                    /overage_spend_limit
                  </code>
                  . Resets on monthly billing cycle. Opt-in only. Failure mode
                  is{" "}
                  <code className="bg-zinc-100 px-1 rounded font-mono text-xs">
                    out_of_credits = true
                  </code>{" "}
                  until next_charge_date or the cap is raised.
                </p>
              </div>
            </div>
          </div>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Where this gets people in trouble
        </h2>
        <GlowCard>
          <div className="p-2 space-y-4">
            <p className="text-zinc-700 leading-relaxed text-lg">
              The most common surprise: assuming metered billing is the
              default. People hit the weekly wall, expect their card to pick
              up the slack, and sit blocked for three days because{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                extra_usage.is_enabled
              </code>{" "}
              is still false. Anthropic does not flip it for you. You opt in
              once at Settings &gt; Usage &gt; Extra usage &gt; Enable; from
              then on overruns spill into metered until you hit the cap or
              disable the toggle.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              The second surprise: assuming the rolling window stops once
              metered is the active ledger. It does not. The 7-day float keeps
              climbing, just clamped at 100% width in the popup so the bar
              looks pegged. The actual gate moved to{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                out_of_credits
              </code>{" "}
              on the other endpoint. If you only watch the rolling-window bar,
              you cannot tell whether your next prompt 429s or bills.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              The third surprise: assuming used_credits and ccusage&apos;s
              estimate should match. They never will. ccusage measures local
              token cost (Claude Code on disk against the public price card).
              used_credits is server-side metered spend with peak-hour
              multipliers and per-model weights folded in. ccusage at $4 next
              to claude-meter at $17 of metered used_credits is normal because
              they are measuring different ledgers, on different sides of the
              network.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Both endpoints are undocumented. Anthropic can rename a field in any
          claude.ai release; the open-source models declare every nullable
          field as Option and the boolean as #[serde(default)] so a missing
          field deserializes as false. That is a forward-compat hedge, not a
          guarantee. If a field is renamed, the repo gets a same-day patch and
          the next brew release picks it up. Worth it for the live BLOCKED
          line and the live 7-day percent in one menu bar dropdown; the
          alternative is opening Settings every 30 minutes and inferring the
          rest from invoices.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Building a tracker that watches both systems at once?"
          description="Send a 15 minute call. Happy to compare endpoint shapes, talk through the BLOCKED diagnostic, and the moments the JSON shifts under us."
          text="Book a 15-minute call"
          section="rolling-window-metered-billing-footer"
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
        description="Questions on rolling window or metered billing? 15 min."
        section="rolling-window-metered-billing-sticky"
        site="claude-meter"
      />
    </article>
  );
}
