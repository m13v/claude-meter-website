import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  AnimatedChecklist,
  StepTimeline,
  GlowCard,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-weekly-limit-extra-usage";
const PUBLISHED = "2026-05-01";

export const metadata: Metadata = {
  title:
    "Claude Weekly Limit and Extra Usage: The Fall-Through Chain, Field by Field",
  description:
    "When the Claude weekly bar hits 100%, what happens next is decided by three values across two undocumented endpoints: extra_usage.is_enabled, used_credits vs monthly_credit_limit, and out_of_credits. Here is the full decision tree, the JSON at every state, and the boolean that tells you whether you are blocked or still spending.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Weekly Limit and Extra Usage: The Fall-Through Chain, Field by Field",
    description:
      "Hitting the Claude weekly limit does not mean stop. It means a fall-through into a metered cap, and a single boolean (out_of_credits) decides whether that cap is open or closed. Here is what to read.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "If I hit my Claude weekly limit, does extra usage automatically kick in?",
    a: "Only if you opted in. The /api/organizations/{org}/usage response carries an extra_usage block with an is_enabled boolean. If is_enabled is false (the default for fresh accounts) the weekly cap is a hard stop and you wait for the resets_at timestamp. If is_enabled is true, your next prompt is billed against your metered cap at standard API rates and the dollar figure on /settings/usage starts ticking. There is no automatic fall-through; you have to flip the toggle on Settings > Usage > Extra usage > Enable first.",
  },
  {
    q: "Where exactly is the boolean that controls fall-through?",
    a: "Two places. The first is the extra_usage.is_enabled flag on /api/organizations/{org}/usage (typed as ExtraUsage in src/models.rs lines 9 to 16 of the open-source ClaudeMeter source). The second is the is_enabled flag on the dedicated /api/organizations/{org}/overage_spend_limit endpoint (typed as OverageResponse in src/models.rs lines 30 to 40). Both should agree; if they disagree, the overage endpoint is authoritative because that is what the Settings page reads when it draws the BLOCKED banner.",
  },
  {
    q: "I enabled extra usage and I am still getting rate-limited after the weekly bar hit. Why?",
    a: "Three possibilities. First, your monthly credit limit is set to zero or near zero, so any spend trips it instantly. Read monthly_credit_limit on /overage_spend_limit (it ships in cents, divide by 100 for dollars). Second, used_credits already equals monthly_credit_limit because earlier sessions in this billing cycle ate the cap. Third, out_of_credits is true and disabled_until is in the future because Anthropic itself paused metered billing for your org (rare, but possible during incident windows). The literal BLOCKED string in the menu bar surfaces case three; cases one and two show as 100 percent on the dollar line without a BLOCKED suffix.",
  },
  {
    q: "Can I just keep coding through the weekly limit if I have a credit card on file?",
    a: "Not on its own. A card on file enables the metered billing capability; you still have to flip the Extra usage toggle. Once flipped, your card on file is what the cap is billed against at the end of the cycle. There is no usage gate for credits you have not pre-authorized: Anthropic does not charge per-prompt at the moment of overage, it accumulates the dollar count against monthly_credit_limit and bills the card on the next billing cycle (the next_charge_date field on /api/organizations/{org}/subscription_details).",
  },
  {
    q: "How do I tell, from the JSON, whether I am about to be blocked?",
    a: "Read three fields in this order. First, the worst utilization across five_hour and seven_day on /usage; if either is at or near 100 you are about to fall through. Second, extra_usage.is_enabled on /usage; if false, you will be blocked at the wall. Third, out_of_credits on /overage_spend_limit; if true, you are blocked even with extra usage enabled because the metered cap is hit. ClaudeMeter prints all three on consecutive rows so you read them top to bottom: 5-hour percent, 7-day percent, Extra usage dollars with the optional BLOCKED suffix.",
  },
  {
    q: "What is the difference between a 100 percent weekly bar and the BLOCKED extra usage line?",
    a: "Different fields, different states, different remedies. A 100 percent weekly bar means seven_day.utilization >= 1.0 on /usage, and the only remedy is waiting for seven_day.resets_at to pass. A BLOCKED extra usage line means out_of_credits = true on /overage_spend_limit, and the remedy is either raising monthly_credit_limit on Settings > Usage > Adjust limit, or waiting for the billing cycle to roll on next_charge_date. They can both be lit at the same time: weekly bar pegged, extra usage disabled or capped, you wait for whichever resets first.",
  },
  {
    q: "If extra_usage.is_enabled is true, does the weekly bar still tick on /usage?",
    a: "Yes, in our reading. seven_day.utilization keeps climbing past 1.0 (so you can see 1.04 or 1.12 in the JSON when you have spilled into metered) but the included usage is already exhausted. The bar in the popup clamps to 100 visually because the width style uses Math.min(100, v ?? 0) on extension/popup.js line 37; the underlying float is uncapped. The dollar figure on overage_spend_limit is the more useful number once you are in fall-through.",
  },
  {
    q: "Is metered extra usage cheaper or more expensive than just upgrading to Max?",
    a: "Depends on your cycle. Anthropic bills extra usage at standard API rates (no plan discount), so a heavy week of metered spend can match or exceed the price gap between Pro and Max 5x. The honest comparison is: read used_credits at the end of a typical cycle and compare to (Max plan price - Pro plan price). If the dollar count is consistently higher than the price differential, the upgrade pays back. ClaudeMeter shows the running used_credits live so you can build that comparison from your own real numbers, not Anthropic's example invoices.",
  },
  {
    q: "Where does ccusage fit into this question?",
    a: "ccusage reads ~/.claude/projects/<project>/<session>.jsonl and sums input plus output tokens per turn, then multiplies by the public model price card. That is a faithful local-token estimate for Claude Code traffic only, and it cannot see either of the endpoints this page is about. ccusage at $4 of estimated spend next to ClaudeMeter at $17 of metered used_credits is normal: ccusage measures local token cost, the server measures actual billing with peak-hour multipliers and per-model weights folded in. Run both for the full picture.",
  },
  {
    q: "Does the rolling 5-hour limit fall through to extra usage too?",
    a: "Yes, if extra usage is enabled. The fall-through is keyed on the per-prompt rate-limit decision, not on which window tripped, so a 5-hour overrun and a 7-day overrun both spill dollars into used_credits when is_enabled is true. The 5-hour case is much shorter-lived (the window resets in minutes to a few hours) so most users feel the dollar tick on the 7-day overrun. Practically: a 5-hour overrun on metered billing is rare unless you are in a runaway agentic loop; a 7-day overrun on metered billing is the common case Anthropic introduced extra usage to handle.",
  },
  {
    q: "Can my org admin disable extra usage on me even if I want it?",
    a: "On a personal Pro or Max account you control your own toggle. On a Team or Enterprise org, the admin owns the org-level extra usage cap and can disable it for the seat, in which case is_enabled returns false on /overage_spend_limit no matter what your personal preference is. The disabled_reason field on /overage_spend_limit names the cause when this happens (admin_disabled is the typical string). ClaudeMeter does not separately distinguish personal vs admin disablement; it surfaces the field as-is.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude weekly limit and extra usage", url: PAGE_URL },
];

const fallthroughHealthy = [
  { type: "command" as const, text: "$ /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           58.0% used    -> resets Sat May 2 02:00 (in 4h)" },
  { type: "output" as const, text: "7-day all       100.0% used    -> resets Mon May 4 09:00 (in 3d)" },
  { type: "output" as const, text: "7-day Sonnet     94.0% used    -> resets Mon May 4 09:00 (in 3d)" },
  { type: "output" as const, text: "7-day Opus      100.0% used    -> resets Mon May 4 09:00 (in 3d)" },
  { type: "output" as const, text: "Extra usage      $4.80 / $50.00 (10%)" },
  { type: "output" as const, text: "Next charge      May 14, 2026   visa ••0936" },
  { type: "success" as const, text: "Weekly bar pegged. Extra usage running. Next prompt bills, does not 429." },
];

const fallthroughNotEnabled = [
  { type: "command" as const, text: "# Same week, extra usage was never enabled" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           58.0% used    -> resets Sat May 2 02:00 (in 4h)" },
  { type: "output" as const, text: "7-day all       100.0% used    -> resets Mon May 4 09:00 (in 3d)" },
  { type: "output" as const, text: "(no Extra usage row: is_enabled=false on /overage_spend_limit)" },
  { type: "output" as const, text: "Next charge      May 14, 2026   visa ••0936" },
  { type: "error" as const, text: "Hard stop. Wait for 7-day resets_at on Mon May 4 09:00." },
];

const fallthroughBlocked = [
  { type: "command" as const, text: "# Extra usage was enabled, then the cap got hit" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           58.0% used    -> resets Sat May 2 02:00 (in 4h)" },
  { type: "output" as const, text: "7-day all       100.0% used    -> resets Mon May 4 09:00 (in 3d)" },
  { type: "output" as const, text: "Extra usage      $50.00 / $50.00 (100%)  BLOCKED until Wed May 14" },
  { type: "output" as const, text: "Next charge      May 14, 2026   visa ••0936" },
  { type: "error" as const, text: "Both gates closed. Raise monthly_credit_limit or wait for next_charge_date." },
];

const usageJsonExample = `// GET /api/organizations/{org_uuid}/usage
//
// The 'extra_usage' block sits next to the rolling-window
// fields. is_enabled is the gate that decides whether 7-day
// hitting 100 means 'wait' or 'spill into metered'.
{
  "five_hour":        { "utilization": 0.58,  "resets_at": "2026-05-02T02:00:00Z" },
  "seven_day":        { "utilization": 1.00,  "resets_at": "2026-05-04T09:00:00Z" },
  "seven_day_sonnet": { "utilization": 0.94,  "resets_at": "2026-05-04T09:00:00Z" },
  "seven_day_opus":   { "utilization": 1.00,  "resets_at": "2026-05-04T09:00:00Z" },
  "extra_usage": {
    "is_enabled":    true,
    "monthly_limit": 5000,        // cents -> $50.00
    "used_credits":  480.0,       // cents -> $4.80
    "utilization":   0.096,       // 0.0 to 1.0
    "currency":      "USD"
  }
}`;

const overageJsonHealthy = `// GET /api/organizations/{org_uuid}/overage_spend_limit
//
// Same money fields, plus the three extras the Settings page
// uses to render the BLOCKED banner.
{
  "is_enabled":           true,
  "monthly_credit_limit": 5000,    // cents -> $50.00 cap
  "used_credits":         480.0,   // cents -> $4.80 spent
  "currency":             "USD",
  "disabled_reason":      null,
  "disabled_until":       null,
  "out_of_credits":       false    // <- the gate
}`;

const overageJsonBlocked = `// Same endpoint, after the cap was hit.
//
// out_of_credits flipped to true. disabled_until carries the
// timestamp at which the metered window re-opens (almost always
// the start of the next billing cycle).
{
  "is_enabled":           true,
  "monthly_credit_limit": 5000,
  "used_credits":         5000.0,
  "currency":             "USD",
  "disabled_reason":      "monthly_cap_reached",
  "disabled_until":       "2026-05-14T07:00:00Z",
  "out_of_credits":       true     // <- BLOCKED in the menu bar
}`;

const formatRsExcerpt = `// claude-meter/src/format.rs lines 24-40
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
        let local: DateTime<Local> = (*until).into();
        line.push_str(&format!(" until {}", local.format("%a %b %-d")));
    }
    println!("{:<16} {}", "Extra usage", line);
}

// Read line 26 carefully. The literal "  BLOCKED" string is
// hardcoded with two leading spaces, only emitted when
// out_of_credits == true. That is the entire gate logic in 17 lines.`;

const stateTableRows = [
  {
    feature: "weekly < 100, extra_usage.is_enabled = false",
    competitor: "Plain weekly tracking; no Extra usage row visible.",
    ours: "Five rolling-window rows render, no Extra usage row, no BLOCKED string. Normal coding state.",
  },
  {
    feature: "weekly < 100, is_enabled = true, used < cap",
    competitor: "Settings page shows the bar plus a small dollar figure.",
    ours: "Extra usage row prints '$X.XX / $Y.YY (Z%)' with no suffix. Dollar count > 0 if any prior fall-through happened this cycle.",
  },
  {
    feature: "weekly = 100, is_enabled = false",
    competitor: "Hard stop, no message about how to keep going.",
    ours: "7-day row at 100%, no Extra usage row, error log notes is_enabled=false. Wait for resets_at.",
  },
  {
    feature: "weekly = 100, is_enabled = true, used < cap",
    competitor: "Bar pegged but the chat keeps working; dollar figure ticks up silently.",
    ours: "7-day row at 100%, Extra usage row prints '$X.XX / $Y.YY (Z%)' and Z% ticks every minute. The fall-through is live.",
  },
  {
    feature: "weekly = 100, is_enabled = true, used = cap",
    competitor: "BLOCKED banner appears on /settings/usage; chat 429s with no inline summary.",
    ours: "Extra usage row prints '$Y.YY / $Y.YY (100%)  BLOCKED until <date>'. Both gates closed; the date is disabled_until.",
  },
  {
    feature: "out_of_credits = true even though used < cap",
    competitor: "BLOCKED banner appears with a paragraph naming an admin or incident reason.",
    ours: "Extra usage row prints percent < 100 plus '  BLOCKED' suffix. disabled_reason names the cause (admin_disabled, incident_pause, etc.).",
  },
];

const fallthroughInvariants = [
  {
    text: "The fall-through is gated by extra_usage.is_enabled. Default for new accounts is false. The flip happens at Settings > Usage > Extra usage > Enable; nothing in the API turns it on automatically when a weekly bar hits 100.",
  },
  {
    text: "Once enabled, monthly_credit_limit is the dollar ceiling. used_credits keeps climbing until it reaches monthly_credit_limit. Both ship in cents on the wire; divide by 100 to render dollars (src/format.rs lines 25 and 29).",
  },
  {
    text: "out_of_credits = true is the BLOCKED signal. It flips when used_credits >= monthly_credit_limit OR when disabled_reason names an external cause (admin_disabled, incident_pause). The literal '  BLOCKED' string is two leading spaces and uppercase, hardcoded at src/format.rs line 26.",
  },
  {
    text: "disabled_until carries the timestamp the metered cap re-opens. It is almost always next_charge_date on /api/organizations/{org}/subscription_details. ClaudeMeter formats it as ' until <Day Mon D>' and appends to the same line.",
  },
  {
    text: "If /overage_spend_limit returns 404 (free workspace org, team org with metered billing off), no Extra usage row prints at all. Absence of the row is informative: it means absence of the feature, not a UI bug.",
  },
  {
    text: "Even with extra usage enabled, the rolling 5-hour window can still spill into metered. The fall-through is keyed on the per-prompt rate decision, not on which window tripped. In practice the 7-day case is the one most users feel because the 5-hour resets in minutes to hours.",
  },
];

const decisionSteps = [
  {
    title: "Step 1: read seven_day.utilization on /usage",
    description:
      "Pull /api/organizations/{org}/usage with your existing claude.ai cookies. The seven_day field is a Window with a utilization float and a resets_at ISO timestamp. If utilization is well under 1.0 you are in the included usage; nothing in this page applies yet.",
  },
  {
    title: "Step 2: if seven_day at 1.0 or above, read extra_usage.is_enabled",
    description:
      "Same response, the extra_usage block. is_enabled = false means hard stop. Wait for seven_day.resets_at to pass and the bucket clears. is_enabled = true means a fall-through is possible; proceed to step 3.",
  },
  {
    title: "Step 3: read out_of_credits on /overage_spend_limit",
    description:
      "Different endpoint, GET /api/organizations/{org}/overage_spend_limit. The same cookies work. out_of_credits = false and used_credits < monthly_credit_limit means you are still spending and the next prompt will bill against the cap. out_of_credits = true means BLOCKED; read disabled_reason and disabled_until to know why and when it lifts.",
  },
  {
    title: "Step 4: take the right action",
    description:
      "Hard stop on weekly with no extra usage: wait. Spending against cap: keep going (the dollars are real). BLOCKED on extra usage: raise monthly_credit_limit on Settings > Usage > Adjust limit, or wait for next_charge_date on subscription_details. ClaudeMeter renders all three signals in one menu bar dropdown so you do not have to walk this tree manually.",
  },
];

const installSteps = [
  {
    title: "brew install the menu bar app",
    description:
      "brew install --cask m13v/tap/claude-meter. The cask installs ClaudeMeter.app under /Applications and registers a launch agent so the menu bar icon comes back after reboot.",
  },
  {
    title: "Load the unpacked browser extension",
    description:
      "Clone github.com/m13v/claude-meter, open chrome://extensions (or arc://extensions, brave://extensions, edge://extensions), enable Developer mode, click Load unpacked, select the extension/ folder. The extension fetches /usage and /overage_spend_limit with your existing cookies and pushes snapshots to the menu bar over localhost:63762. No cookie paste, no second login.",
  },
  {
    title: "Open the menu bar dropdown when the weekly bar hits",
    description:
      "Click the ClaudeMeter icon. The 7-day row tells you the included usage is spent. The Extra usage row, if present, tells you whether you are spending or BLOCKED. If the row is absent your org has not enabled metered billing on /settings/usage.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-extra-usage-balance",
    title: "Claude extra usage balance: the dollar line, two endpoints, three fields",
    excerpt:
      "Deep dive on the dollar figure itself: where the cents come from, why monthly_credit_limit lives on a different endpoint, and the 17 Rust lines that turn the JSON into the menu-bar row.",
    tag: "Reference",
  },
  {
    href: "/t/claude-weekly-limit-by-tuesday",
    title: "Claude weekly limit by Tuesday: it is a 168-hour clock, not a calendar week",
    excerpt:
      "The reason your weekly bar hits before midweek is not that the limit shrunk. The seven-day bucket is keyed off your first message, and the resets_at field carries the exact cliff to the second.",
    tag: "Diagnosis",
  },
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "Local counter vs server quota: why ccusage and claude.ai disagree",
    excerpt:
      "ccusage at 8 percent and claude.ai at 71 percent are both correct. Two ledgers, two sources, neither replaces the other; the extra usage balance is squarely on the server side.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude weekly limit and extra usage: the fall-through chain, field by field",
  description:
    "When the weekly bar hits 100 on Claude Pro or Max, what happens next is decided by three values across two undocumented endpoints. Here is the decision tree, the JSON at every state, and the boolean that decides blocked vs still spending.",
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

export default function ClaudeWeeklyLimitExtraUsagePage() {
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
          Your Claude{" "}
          <GradientText>weekly limit</GradientText> and extra usage are linked by one boolean
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          When the 7-day bar pegs at 100%, three things can happen, and which
          one you get is decided by three values across two undocumented
          endpoints on claude.ai. The chain is short. Get it right and you know
          whether the next prompt waits, bills, or 429s. Get it wrong and you
          either burn metered dollars you did not plan for or wait for a window
          that already opened. This page walks the chain, shows the JSON at
          every state, and points at the open-source code that prints all
          three signals in one menu bar row.
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

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-01)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            When your Claude weekly limit hits 100%, extra usage takes over
            only if you opted in. Specifically:{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              extra_usage.is_enabled
            </code>{" "}
            must be true on{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              GET /api/organizations/&#123;org&#125;/usage
            </code>
            , and{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              out_of_credits
            </code>{" "}
            must be false on{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              GET /api/organizations/&#123;org&#125;/overage_spend_limit
            </code>
            . If both are met, the next prompt bills at standard API rates
            against your{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              monthly_credit_limit
            </code>
            . If either fails, you wait for the relevant{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              resets_at
            </code>{" "}
            timestamp. Anthropic confirms the opt-in mechanic on{" "}
            <a
              href="https://support.claude.com/en/articles/12429409-manage-extra-usage-for-paid-claude-plans"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              Manage extra usage for paid Claude plans
            </a>
            ; the field names and the BLOCKED state are in the open-source{" "}
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

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Three states, three menu bar outputs
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The weekly bar at 100% is a single condition with three different
          downstream outcomes. Run the bundled CLI in each state and you get
          three different prints. Read them carefully, because the difference
          between &ldquo;wait three days&rdquo; and &ldquo;keep coding, dollars
          ticking&rdquo; is one row.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          State A: weekly pegged, extra usage enabled, plenty of cap left. The
          fall-through is live; the dollar count is small; the next prompt
          bills, does not 429.
        </p>
        <TerminalOutput
          title="State A: fall-through live, cap healthy"
          lines={fallthroughHealthy}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          State B: weekly pegged, extra usage was never enabled. There is no
          Extra usage row at all. The 7-day at 100% is the wall. The only
          remedy is the 7-day{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>
          .
        </p>
        <TerminalOutput
          title="State B: hard stop on the weekly wall"
          lines={fallthroughNotEnabled}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          State C: weekly pegged, extra usage enabled, cap exhausted. The
          dollar row is at 100% and carries a literal{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            BLOCKED
          </code>{" "}
          suffix plus a date. Both gates are closed; the next prompt 429s.
        </p>
        <TerminalOutput
          title="State C: both gates closed, BLOCKED until next cycle"
          lines={fallthroughBlocked}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The /usage payload, with the extra_usage block
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          One endpoint carries every rolling-window field plus the metered
          billing summary. Note the cents-on-the-wire convention; that one
          detail is the source of half the off-by-100 reports in scrapers
          built from scratch.
        </p>
        <AnimatedCodeBlock
          code={usageJsonExample}
          language="json"
          filename="GET /api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extra_usage
          </code>{" "}
          block is the cheaper read for &ldquo;am I in fall-through right
          now&rdquo; because it ships in the same response as the weekly bar.
          The dedicated{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /overage_spend_limit
          </code>{" "}
          endpoint adds the BLOCKED diagnostics that this block does not have:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            disabled_reason
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            disabled_until
          </code>
          , and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>
          .
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The /overage_spend_limit payload, healthy and blocked
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The healthy response. Cap is $50, $4.80 spent so far, no lockout,
          no reason. This is what State A reads.
        </p>
        <AnimatedCodeBlock
          code={overageJsonHealthy}
          language="json"
          filename="GET /api/organizations/{org}/overage_spend_limit (healthy)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          The blocked response. Three fields move at once:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            used_credits
          </code>{" "}
          equals{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            monthly_credit_limit
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          flips, and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            disabled_until
          </code>{" "}
          carries the cap re-open timestamp. This is what State C reads.
        </p>
        <AnimatedCodeBlock
          code={overageJsonBlocked}
          language="json"
          filename="GET /api/organizations/{org}/overage_spend_limit (blocked)"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 17 lines that turn the JSON into the BLOCKED row
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The fall-through state machine on the rendering side is short. Two
          divisions by 100 to convert cents to dollars. One match arm for the
          no-cap case. One conditional suffix for the lockout date. One
          hardcoded uppercase string when{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          flips. That is the entire renderer for the row that distinguishes
          State A from State C:
        </p>
        <AnimatedCodeBlock
          code={formatRsExcerpt}
          language="rust"
          filename="src/format.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Line 26 is the gate. The literal{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            &quot;  BLOCKED&quot;
          </code>{" "}
          string (two leading spaces, all caps) is the only place in the
          codebase where the fall-through outcome is named in plain text. If
          you read it in the menu bar you are in State C; if you do not, you
          are in State A or State B depending on whether the row exists at
          all.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The decision tree, four reads
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          If you are wiring your own dashboard or just curling the endpoints
          by hand, here is the order to read fields in. ClaudeMeter does this
          on a 60 second tick; you can do it once when the next 429 lands.
        </p>
        <StepTimeline steps={decisionSteps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Six possible states, side by side
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          What the Settings page shows you vs what ClaudeMeter prints in the
          menu bar dropdown for each combination of weekly utilization and
          extra usage state.
        </p>
        <ComparisonTable
          productName="ClaudeMeter (menu bar dropdown)"
          competitorName="claude.ai/settings/usage"
          rows={stateTableRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Six invariants the fall-through chain holds
        </h2>
        <AnimatedChecklist
          title="What you can rely on at every state"
          items={fallthroughInvariants}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="py-2 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              Why a menu bar row beats opening Settings
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto mb-6">
              Three signals on three lines, refreshed every minute, no tab
              switch. The point of the row is that you read the answer
              without leaving your editor.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
                  Read 1
                </p>
                <p className="text-zinc-800 text-sm leading-relaxed">
                  <code className="bg-zinc-100 px-1 rounded font-mono text-xs">
                    seven_day.utilization
                  </code>{" "}
                  on /usage. Tells you whether the wall is in front of you.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
                  Read 2
                </p>
                <p className="text-zinc-800 text-sm leading-relaxed">
                  <code className="bg-zinc-100 px-1 rounded font-mono text-xs">
                    extra_usage.is_enabled
                  </code>{" "}
                  on /usage. Tells you whether the wall has a door.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
                  Read 3
                </p>
                <p className="text-zinc-800 text-sm leading-relaxed">
                  <code className="bg-zinc-100 px-1 rounded font-mono text-xs">
                    out_of_credits
                  </code>{" "}
                  on /overage_spend_limit. Tells you whether the door is
                  locked.
                </p>
              </div>
            </div>
          </div>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Common gotchas when the weekly bar hits
        </h2>
        <GlowCard>
          <div className="p-2 space-y-4">
            <p className="text-zinc-700 leading-relaxed text-lg">
              The most common surprise is that nothing happens automatically.
              Anthropic does not flip extra usage on for you when the weekly
              bar pegs; you opt in once on Settings &gt; Usage &gt; Extra usage
              &gt; Enable, and from then on every weekly overrun spills into
              metered until you hit the cap or disable the toggle. People who
              think extra usage is the default and then sit blocked for three
              days are reading the help center wrong.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              The second surprise is that the dollar count keeps climbing
              silently. The Settings page renders it but you do not see the
              page during a normal coding session. Without a menu bar row you
              find out from the next invoice. The cheapest way to avoid that
              is a tracker that polls{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /overage_spend_limit
              </code>{" "}
              once a minute and prints{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                used_credits
              </code>{" "}
              live.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              The third surprise is that the rolling 5-hour limit also falls
              through. If you are deep in an agentic Claude Code loop and
              spike the 5-hour bucket, your next prompt with extra usage
              enabled bills against the cap just like a 7-day overrun would.
              The fall-through is keyed on the per-prompt rate decision, not
              the window that tripped. Most users feel the dollar tick on the
              7-day case because it lasts much longer than a 5-hour reset.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Install ClaudeMeter and watch all three signals at once
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The product is free, MIT licensed, and reads the same endpoints the
          Settings page renders from. No API key, no cookie paste, no second
          login. Three steps from zero to a live menu bar row.
        </p>
        <StepTimeline steps={installSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Both endpoints are undocumented. Anthropic can rename a field in any
          claude.ai release and the renderer will fall back to None on that
          field. The Rust struct in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>{" "}
          declares everything but{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            is_enabled
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          as Optional, and ships{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            #[serde(default)]
          </code>{" "}
          on the boolean so a missing field deserializes as false. That is a
          forward-compat hedge, not a guarantee. If a field gets renamed, the
          open-source repo gets a same-day patch and you pull the next brew
          release. Worth it for the live BLOCKED line; the alternative is
          finding out from the next invoice.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Building a tracker that walks the weekly to extra-usage chain?"
          description="Send a 15 minute call. Happy to compare endpoint shapes, the BLOCKED diagnostic, and the moments the JSON shifts under us."
          text="Book a 15-minute call"
          section="weekly-extra-usage-footer"
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
        description="Questions on weekly + extra usage? 15 min."
        section="weekly-extra-usage-sticky"
        site="claude-meter"
      />
    </article>
  );
}
