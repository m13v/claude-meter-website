import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  GlowCard,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/alternative/claude-max-plan-bar-vs-extra-usage";
const PUBLISHED = "2026-05-10";

export const metadata: Metadata = {
  title:
    "Claude Max plan bar vs extra usage: two parallel meters, not before and after",
  description:
    "The Max plan bar is a percentage on /api/organizations/{org}/usage. The extra usage line is dollars on /api/organizations/{org}/overage_spend_limit. They run side by side, on different endpoints with different units. The bar can be at 100% while extra usage is at $0; extra usage can be spending while the bar shows green. ClaudeMeter renders them as sibling rows because that is what they are.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Max plan bar vs extra usage: two parallel meters, not before and after",
    description:
      "The bar uses utilization. Extra usage uses dollars. Two endpoints, two clocks, two gates. Here is the field-by-field comparison and the menu bar code that prints them.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Alternatives", url: "https://claude-meter.com/alternative" },
  {
    name: "Plan bar vs extra usage",
    url: PAGE_URL,
  },
];

const faqs = [
  {
    q: "Is the extra usage line just the plan bar after it hits 100%?",
    a: "No. They live on two different endpoints and they spend different units. The plan bar reads /api/organizations/{org_uuid}/usage and renders a utilization float (0.0 to 1.0+, displayed as a 0 to 100 percent meter). The extra usage line reads /api/organizations/{org_uuid}/overage_spend_limit and renders a dollar amount in cents-divided-by-100 form. The bar keeps ticking after 100 percent (we have seen 1.04, 1.12 in the JSON) for cosmetic and historical reasons; the actual gate moves to a different field on a different endpoint. Two parallel systems, not two phases of one.",
  },
  {
    q: "Why does ClaudeMeter print the extra usage row with dollars and the plan rows with percent?",
    a: "Because the underlying fields are different. format.rs line 112 prints '{:>5.1}% used' for any window where utilization is the meaningful number. format.rs line 31 prints '${:.2} / ${:.2} ({:.0}%)' for the overage line because used_credits and monthly_credit_limit ship as integer cents and the relevant question is dollars over the cap. The percent in parentheses on the extra usage row is a courtesy, not the primary number. Mixing them into a single percentage would hide the dollar amount you actually want at month end.",
  },
  {
    q: "Can the plan bar be at 100% while the extra usage is still at zero?",
    a: "Yes, and it is the most common state on a Max account. If extra_usage.is_enabled is false on the usage endpoint, your prompts hard-429 the moment seven_day.utilization crosses 1.0; used_credits stays at 0 because no metered traffic ever runs. If is_enabled is true but you have not yet exhausted the rolling 5-hour or 7-day buckets, all your prompts bill against the plan and used_credits also stays at 0. The metered ledger only spends when the per-prompt rate decision says the plan window would have 429d.",
  },
  {
    q: "Can the extra usage line be spending while the plan bar shows green?",
    a: "Yes, and this is the surprising one. After the rolling 5-hour bucket pegs and metered overage takes over, the popup clamps the visible bar with Math.min(100, v) for cosmetic reasons (extension/popup.js line 37), so the bar reads 100 percent on the 5-hour but the seven_day bar can still look green if you are not heavy on the weekly budget yet. Meanwhile, every new prompt is incrementing used_credits by some integer cents on the next poll. The bar keeps you safe from the rolling 5-hour wall, the extra usage line keeps you safe from the surprise bill at month end. They guard different things.",
  },
  {
    q: "Do the two rows reset on the same clock?",
    a: "No, they live on different clocks and that matters. The plan bar resets on rolling-window timestamps (resets_at on each Window struct in models.rs lines 3-7); the 5-hour resets_at slides every time an old prompt ages past the 5-hour mark, the 7-day slides similarly across a 7-day band. The extra usage clock is the monthly billing cycle: used_credits accumulates across the cycle and zeroes when Anthropic invoices, with disabled_until carrying any admin-imposed pause window. So even on a quiet Sunday, the 5-hour bar can fall while the extra usage stays exactly where it ended Friday.",
  },
  {
    q: "What is the BLOCKED suffix and when do I see it?",
    a: "BLOCKED appears on the extra usage row only, never on the plan bar rows. It is hardcoded as exactly '  BLOCKED' (two leading spaces, all caps) in format.rs line 26 and menubar.rs line 960. It prints when out_of_credits comes back true on the overage_spend_limit endpoint, which means metered billing is on, you have spent the whole monthly_credit_limit, and Anthropic is now refusing further overage-billed calls until disabled_until passes. The 5-hour and 7-day bars can still look green when this happens, which makes BLOCKED the diagnostic for one specific 'green windows but my prompt 429d' state.",
  },
  {
    q: "Why does claude.ai/settings/usage make this distinction harder to see?",
    a: "Because the page splits the two surfaces vertically. You see the rolling and weekly bars in a top section, and the extra usage block lives below as a separate card with its own Enable toggle and balance meter. On a phone or short laptop screen the extra usage block is below the fold, and you can read the page top to bottom believing the bar is the whole story. ClaudeMeter sits at the menu bar level: the 5-hour, 7-day, 7-day Sonnet, 7-day Opus, and Extra rows are all peers in the same dropdown, so the dollar string sits two lines below the percent string. You cannot read one without seeing the other.",
  },
  {
    q: "If I am on Max and never enabled extra usage, do I have nothing to compare?",
    a: "Correct. With extra_usage.is_enabled = false, the overage_spend_limit endpoint returns 404 for most orgs (free workspace orgs, team orgs without metered billing, fresh paid accounts that never opted in). ClaudeMeter wraps the call in a try/catch (extension/background.js line 26-27, src/api.rs lines 31-45) and just omits the Extra row entirely. So if you do not see an Extra row in the menu bar, your org has not opted in to metered. The bar is your only meter; once seven_day.utilization hits 1.0 you hard-429 until reset.",
  },
  {
    q: "Does the bar count traffic that the extra usage paid for?",
    a: "Yes, and this is the field that surprises people. seven_day.utilization keeps climbing past 1.0 after metered traffic kicks in (we have observed 1.04 and 1.12 in real JSON). The plan bar is, in a sense, just a counter once you cross 100 percent; the gate moved elsewhere. ClaudeMeter still renders it because the trajectory tells you whether the next billing cycle is shaping up to be heavier than this one, even though the first 100 percent is now meaningless from a 429 perspective.",
  },
  {
    q: "Can I see both numbers without ClaudeMeter or settings/usage?",
    a: "Yes, with two curls. Open DevTools on claude.ai/settings/usage, copy the Cookie header, then run curl with -H 'Cookie: $YOUR_COOKIE' -H 'Referer: https://claude.ai/settings/usage' against https://claude.ai/api/organizations/$ORG_UUID/usage for the bar JSON, and the same against /overage_spend_limit for the dollar JSON. Pipe both through jq. ClaudeMeter just automates the cookie wrangling, the org enumeration, and the 60-second poll cadence so you do not retype the curl every minute.",
  },
];

const comparisonRows = [
  {
    feature: "Endpoint",
    competitor:
      "/api/organizations/{org_uuid}/usage. Same JSON claude.ai/settings/usage renders for the rolling and weekly bars.",
    ours: "/api/organizations/{org_uuid}/overage_spend_limit. Dedicated billing-state endpoint the Settings page reads to draw the BLOCKED banner.",
  },
  {
    feature: "Unit on the wire",
    competitor:
      "utilization: f64 (a fraction; 0.0 to 1.0+, displayed 0 to 100 percent). Field on the Window struct, models.rs lines 3-7.",
    ours: "monthly_credit_limit: Option<i64> and used_credits: Option<f64>, both in integer cents. Field on OverageResponse, models.rs lines 30-40.",
  },
  {
    feature: "Format string ClaudeMeter uses",
    competitor:
      "\"{:>5.1}% used    -> resets {} ({})\" via format_window in format.rs lines 90-113.",
    ours: "\"Extra        ${:.2} / ${:.2} ({:.0}%){}\" via the print_pretty branch in format.rs lines 24-39 and menubar.rs lines 958-972.",
  },
  {
    feature: "Clock",
    competitor:
      "Rolling. Each Window carries its own resets_at; the 5-hour slides every time a prompt ages out, the 7-day slides over a 7-day band.",
    ours: "Monthly billing cycle. used_credits accumulates across the cycle and zeroes when Anthropic invoices. disabled_until is the per-incident pause clock.",
  },
  {
    feature: "What 100% means",
    competitor:
      "On the 7-day bar, it means the plan bucket is exhausted. Without metered, the next prompt 429s. With metered, prompts keep going and the bar can climb past 100 (we have seen 1.04 in the JSON).",
    ours: "When used_credits reaches monthly_credit_limit and out_of_credits flips true, Anthropic refuses further metered calls. The literal string appended is '  BLOCKED' (format.rs line 26).",
  },
  {
    feature: "Opt-in state",
    competitor: "Always on. The bar starts ticking the day you sign up.",
    ours: "Off by default on new paid accounts. You have to enable extra usage once on Settings > Usage > Extra usage > Enable.",
  },
  {
    feature: "What kills your loop",
    competitor:
      "Hard 429 on the plan bar at 100 percent, only when extra_usage.is_enabled = false. Otherwise the gate moves to the other meter.",
    ours: "Hard 429 from the overage endpoint when out_of_credits = true. The plan bar can look fine when this fires; that is the harshest debugging state.",
  },
  {
    feature: "Refresh cadence in ClaudeMeter",
    competitor:
      "60 seconds (POLL_INTERVAL at src/bin/menubar.rs line 18). Same poll fires both endpoints in sequence.",
    ours: "60 seconds, same poll. The two responses get merged into one UsageSnapshot (models.rs lines 60-73) and printed as adjacent rows.",
  },
];

const renderCode = `// claude-meter/src/bin/menubar.rs (lines 958-973)
// The Extra row is appended as a sibling to the 5-hour and 7-day
// rows, not as a successor. Different format string because the
// underlying field is dollars, not utilization.

if let Some(ov) = s.overage.as_ref() {
    let used = ov.used_credits.unwrap_or(0.0) / 100.0;
    let blocked = if ov.out_of_credits { "  BLOCKED" } else { "" };
    let line = match ov.monthly_credit_limit {
        Some(l) => {
            let limit = l as f64 / 100.0;
            let pct = if limit > 0.0 { used / limit * 100.0 } else { 0.0 };
            format!(
                "Extra        \${:.2} / \${:.2} ({:.0}%){}",
                used, limit, pct, blocked
            )
        }
        None => format!("Extra        \${:.2} used (no cap){}", used, blocked),
    };
    sub.append(&disabled(&line)).ok();
}`;

const modelsCode = `// claude-meter/src/models.rs
// Two structs, zero shared fields. Window is the plan bar.
// OverageResponse is the extra usage line.

pub struct Window {
    pub utilization: f64,
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}

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

const meterSession = [
  { type: "command" as const, text: "$ claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour            98.0% used    -> resets Sun May 10 22:14 (in 1h)" },
  { type: "output" as const, text: "7-day all         62.0% used    -> resets Tue May 12 09:02 (in 2d)" },
  { type: "output" as const, text: "7-day Sonnet      41.0% used    -> resets Tue May 12 09:02 (in 2d)" },
  { type: "output" as const, text: "7-day Opus        78.0% used    -> resets Tue May 12 09:02 (in 2d)" },
  { type: "output" as const, text: "Extra usage       $4.20 / $50.00 (8%)" },
  { type: "output" as const, text: "" },
  { type: "success" as const, text: "Same screen: percent meter on top, dollar meter on the bottom row." },
];

const blockedSession = [
  { type: "command" as const, text: "$ claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           100.0% used    -> resets soon" },
  { type: "output" as const, text: "7-day all        104.0% used    -> resets Tue May 12 09:02 (in 2d)" },
  { type: "output" as const, text: "7-day Opus        92.0% used    -> resets Tue May 12 09:02 (in 2d)" },
  { type: "error" as const, text: "Extra usage       $200.00 / $200.00 (100%)  BLOCKED until Sun May 10" },
  { type: "output" as const, text: "" },
  { type: "error" as const, text: "Plan bar past 100, dollar meter at 100, BLOCKED suffix on the dollar row." },
];

const relatedPosts = [
  {
    href: "/t/rolling-window-metered-billing",
    title: "Rolling window vs metered billing on Claude",
    excerpt:
      "Two parallel systems on two different endpoints, with different units, different clocks, and different opt-in states. The field-by-field comparison and the JSON behind both.",
    tag: "Reference",
  },
  {
    href: "/t/claude-extra-usage-balance",
    title: "Claude extra usage balance: what the dollar line actually is",
    excerpt:
      "The 'extra usage' figure is the dollar amount Anthropic counts against your metered cap during the current billing month. Comes from two undocumented endpoints.",
    tag: "Reference",
  },
  {
    href: "/t/claude-max-plan-still-hitting-limits",
    title: "Max plan still hitting limits? It is eight buckets, not one",
    excerpt:
      "Max raises the caps, it does not collapse the gates into one bucket. Eight independent server-side gates can each block a Max user. Here is the 60-second triage.",
    tag: "Diagnosis",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Max plan bar vs extra usage: two parallel meters, not before and after",
  description:
    "The Max plan bar reads utilization on /api/organizations/{org}/usage. The extra usage line reads dollars on /api/organizations/{org}/overage_spend_limit. Two endpoints, two units, two clocks, two gates. ClaudeMeter renders them as sibling rows because they actually run in parallel.",
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

export default function PlanBarVsExtraUsagePage() {
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
          Claude Max plan bar <GradientText>vs extra usage</GradientText>:
          two parallel meters, not before and after
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          People keep asking on Twitter whether the extra usage line is the
          plan bar &ldquo;after it tips over.&rdquo; It is not. They live on
          two different endpoints, ship different units (a percentage vs
          dollars), reset on different clocks, and gate different things. The
          plan bar can sit at 100 percent while extra usage is still at $0;
          extra usage can be spending while the bar shows green. ClaudeMeter
          prints them as sibling rows in the menu bar dropdown because that
          is what they are at the data level.
        </p>
      </header>

      <div className="max-w-4xl mx-auto px-6 pb-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="7 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-10)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            <strong>Two parallel meters, not stages of one.</strong> The Max
            plan bar is a utilization percentage on{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /api/organizations/&#123;org&#125;/usage
            </code>{" "}
            (5-hour, 7-day, plus per-model sub-buckets). The extra usage line
            is dollars on{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /api/organizations/&#123;org&#125;/overage_spend_limit
            </code>
            . They never replace each other: the bar can be at 100 percent
            while extra usage is at $0 (if you never opted in), and extra
            usage can be spending while the rolling 5-hour bar shows green
            (because the popup clamps the visual at 100). Anthropic&apos;s
            own help center confirms the same shape:{" "}
            <a
              href="https://support.claude.com/en/articles/12429409-manage-extra-usage-for-paid-claude-plans"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              support.claude.com/en/articles/12429409
            </a>
            . ClaudeMeter renders them as adjacent rows so you stop confusing
            them.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Field by field
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Same Max plan, two different rows in the menu bar. Each line below
          is a dimension where the bar and extra usage diverge at the data
          level, not the UI level.
        </p>
        <ComparisonTable
          productName="Plan bar (5-hour, 7-day, per model)"
          competitorName="Extra usage line"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Two structs, zero shared fields
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The cleanest proof that the bar and extra usage are not stages of
          one model is the Rust source. Window (the plan bar) and
          OverageResponse (the extra usage row) share zero fields. They could
          not be more separate at the type level.
        </p>
        <AnimatedCodeBlock
          code={modelsCode}
          language="rust"
          filename="src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Window has utilization plus a reset timestamp. OverageResponse has
          a dollar limit, a dollar spend, an opt-in flag, an admin-imposed
          pause window, and an out-of-credits boolean that is the actual
          gate when metered billing is on. They live in the same UsageSnapshot
          (models.rs lines 60-73) only because the menu bar rendering code
          wants to print both rows on one screen. At the JSON layer, they
          come back from two separate HTTPS responses on every poll.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What it looks like in the menu bar
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The first capture below is a normal Sunday afternoon on a Max
          account that has metered billing on. 5-hour is hot at 98 percent,
          extra usage has spent $4.20 of a $50 cap. Two rows, two formats,
          one screen. The second capture is the worst-case state: rolling
          past 100 percent, weekly bar already past 100 (1.04 in the JSON
          translates to 104 percent in the print), and extra usage maxed out
          with the BLOCKED suffix. That suffix only appears on the extra
          usage row because it is the only row whose underlying field can
          go BLOCKED.
        </p>
        <div className="mt-4 grid md:grid-cols-2 gap-6">
          <TerminalOutput
            title="Healthy state: bar warm, dollars cool"
            lines={meterSession}
          />
          <TerminalOutput
            title="Worst state: dollars BLOCKED while bars are past 100"
            lines={blockedSession}
          />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the format strings are different
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The rendering branch in menubar.rs lines 958-973 is the spine of
          the whole comparison. The Extra row is appended to the same
          submenu as the 5-hour and 7-day rows, but with a different printf
          template, a different unit, and a different conditional suffix.
        </p>
        <AnimatedCodeBlock
          code={renderCode}
          language="rust"
          filename="src/bin/menubar.rs (lines 958-973)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Three things to notice. First, the divide-by-100 on lines 959 and
          963: the JSON ships cents, you divide twice to get human dollars.
          Skip the division and the row prints $172000.00 instead of $1720.00.
          Second, the percent in parentheses is computed locally, not pulled
          from the JSON, because it is a courtesy field the user wants to
          glance at next to the dollars. Third, the BLOCKED suffix is a
          literal string, two leading spaces, hardcoded uppercase, only
          appended when out_of_credits is true. None of the plan bar rows
          can produce that string because the Window struct does not have an
          out_of_credits field.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The four states a Max user actually lives in
        </h2>
        <GlowCard>
          <div className="p-2 space-y-4">
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>State 1: bar cool, no extra usage row.</strong>{" "}
              extra_usage.is_enabled is false on your org, the
              overage_spend_limit endpoint 404s, ClaudeMeter omits the row
              entirely. You have one meter, the plan bar, and once it pegs
              you hard-429 until reset. Most fresh Max accounts start here.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>State 2: bar cool, extra usage at $0.</strong> Metered
              billing is on, but you have not exhausted the 5-hour or 7-day
              buckets, so used_credits stays at 0. Two meters visible, only
              the plan one is moving. This is the state extra usage is
              designed to help with: silently waiting until the plan bar
              would have 429d.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>State 3: bar at or past 100, extra usage spending.</strong>{" "}
              Rolling 5-hour pegged at 100 percent, agentic loop kept going
              because metered overage took over, used_credits is climbing
              by some integer cents per poll. The plan bar is now a counter,
              not a gate. The extra usage line is the surface that decides
              whether your next prompt goes through.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>State 4: bar past 100, extra usage BLOCKED.</strong>{" "}
              Both meters are at or past their limit. used_credits hit
              monthly_credit_limit, out_of_credits flipped true, BLOCKED is
              suffixed on the row. Until disabled_until passes (or you raise
              the cap on the Settings page), every prompt 429s with no
              fall-through. This is the only state where green plan bars
              and a 429 are both correct at the same time.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why ClaudeMeter beats the official settings page for this
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          claude.ai/settings/usage renders the same JSON ClaudeMeter polls,
          but the page splits the two surfaces vertically. The rolling and
          weekly bars sit in a top section. Extra usage is its own card
          below, with its own Enable toggle and balance meter. On a phone
          or short laptop screen the extra usage block is below the fold
          entirely. You can read the page top to bottom believing the bar
          is the whole story.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter sits at the menu bar level instead. The 5-hour, 7-day,
          7-day Sonnet, 7-day Opus, and Extra rows are all peers in the same
          dropdown, on adjacent lines, in monospaced columns. The dollar
          string sits two lines below the percent string. There is no scroll,
          no toggle, no second card to discover. You glance once and you see
          both meters or you see why one of them is missing.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          And because the menu bar app is open source (
          <a
            href="https://github.com/m13v/claude-meter"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            github.com/m13v/claude-meter
          </a>
          , MIT licensed), the format strings and the endpoint calls are
          inspectable. The two-sentence claim &ldquo;the plan bar is
          percent, the extra usage is dollars, they live on different
          endpoints&rdquo; is verifiable in 30 seconds of reading
          format.rs and api.rs.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveats
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Both endpoints are undocumented. Anthropic could rename or
          restructure them at any time; ClaudeMeter declares every nullable
          field as Option in Rust, so when the server adds, removes, or
          renames a sub-bucket the next brew release patches it.
          Anthropic&apos;s help center on extra usage at{" "}
          <a
            href="https://support.claude.com/en/articles/12429409-manage-extra-usage-for-paid-claude-plans"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            support.claude.com/en/articles/12429409
          </a>{" "}
          documents the user-facing concept (enable, set a cap, get billed
          for the overage) but does not name the JSON shape. macOS only
          today, Claude Pro or Max only (free accounts have nothing to
          meter); the browser extension covers Chrome, Arc, Brave, and Edge.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Confused about which meter is gating your next prompt?"
          description="15 minutes. Walk me through your Max account state and we will figure out which row is moving and why."
          text="Book a 15-minute call"
          section="plan-bar-vs-extra-usage-footer"
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
        description="Plan bar vs extra usage on Max? 15 min."
        section="plan-bar-vs-extra-usage-sticky"
        site="claude-meter"
      />
    </article>
  );
}
