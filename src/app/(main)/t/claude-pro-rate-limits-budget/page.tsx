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

const PAGE_URL = "https://claude-meter.com/t/claude-pro-rate-limits-budget";
const PUBLISHED = "2026-05-09";

export const metadata: Metadata = {
  title:
    "Claude Pro rate limits as a budget: the free quota and the dollar cap, side by side",
  description:
    "Claude Pro now has two stacked budgets. The free one is the 5-hour rolling window plus the weekly cap. The dollar one is the metered-billing limit you set at claude.ai/settings/usage. Most rate-limit guides only cover the first. Here is how the second one works, where the number lives, and how to watch both at once.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Pro rate limits as a budget: the free quota and the dollar cap, side by side",
    description:
      "The free quota and the dollar cap are two separate budgets. Set the second one at /settings/usage; watch both live with claude-meter. Endpoints, fields, failure modes.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Pro rate limits budget", url: PAGE_URL },
];

const faqs = [
  {
    q: "Where do I set my Claude Pro budget?",
    a: "claude.ai/settings/usage, in the Extra usage section. Click Adjust limit and enter a monthly cap in dollars (the field on the wire is monthly_credit_limit, in cents). That cap is the budget for what you spend after your plan windows are spent. If you choose Set to unlimited instead, you have to prepay via Add funds, with an optional auto-reload when your balance falls below a threshold (Anthropic enforces a daily redemption limit of $2,000 on auto-reload).",
  },
  {
    q: "Is the cap the only budget, or are the rate limits a budget too?",
    a: "Both. Think of it as a stack. The bottom budget is your plan's free quota: a rolling 5-hour window and a 7-day weekly window, both measured as utilization fractions, not dollar amounts. The top budget is the metered-billing cap, denominated in dollars. You spend the free one first; once a window pins, additional usage flows onto the dollar one until the cap is reached. Either stack can throttle you. Watching only one is the failure mode.",
  },
  {
    q: "How do I see what I have spent against the cap so far?",
    a: "Settings page: claude.ai/settings/usage shows used_credits and the cap as a progress bar in the Extra usage section. Programmatic: GET /api/organizations/{org_uuid}/overage_spend_limit on claude.ai with your session cookie returns { is_enabled, monthly_credit_limit, used_credits, currency, out_of_credits, disabled_reason, disabled_until }. Both numbers ship in cents. ClaudeMeter polls that endpoint every 60 seconds and renders one line in the macOS menu bar: $X.XX / $Y.YY (Z%) plus an optional BLOCKED suffix when out_of_credits flips.",
  },
  {
    q: "What does BLOCKED mean for my budget?",
    a: "It means you spent the dollar cap. used_credits caught up to monthly_credit_limit, out_of_credits flipped to true, and Anthropic is refusing further metered-billed calls until disabled_until passes (or you raise the cap). The 5-hour and 7-day rows can still look green when this happens; the rolling windows are not why you are blocked. The signal that you are out of dollars is the BLOCKED suffix on the Extra usage line, nothing else.",
  },
  {
    q: "If I do not enable metered billing, what is my budget?",
    a: "Just the free quota. You get the rolling 5-hour and 7-day windows. When one pins at 100 percent, your next prompt returns a 429 and you wait for the window to roll. There is no dollar overflow, no surprise bill, no cap to set. The trade is rigidity: hit a wall mid-refactor and you wait. Heavy Claude Code users on Pro often turn metered billing on with a small cap like $20-$50 per month so the rolling-window walls are paid through, but the spend stays bounded. It is a budget you set rather than a wall you wait at.",
  },
  {
    q: "Can the dollar cap be lower than my plan price?",
    a: "Yes. The cap is independent of your subscription. A $20/month Pro user can set the metered cap to $10, $50, $200, or unlimited. The cap controls only the overflow billing on top of the plan; the plan price itself does not change. If you set the cap to $0 (or do not enable metered billing), you have a hard wall at the rolling-window limit. If you set it to $200, you have $200 of extra-usage room before BLOCKED. Most people on $20 Pro pick a cap close to their subscription price so the surprise budget cannot exceed the spend they would notice.",
  },
  {
    q: "How does this differ from API spend limits in the Console?",
    a: "Different surface, different number. API spend limits live on console.anthropic.com Settings > Limits and govern your organization's API key spending across tiers (Tier 1 through Tier 4, with a $200,000/month ceiling on Tier 4). Pro/Max metered billing is on claude.ai, governs the overflow on top of your subscription rate limits, and goes through the same payment method as the subscription. They do not pool. A Pro account at $40 of extra usage and an API tier at $300 of API spend are tracked, capped, and billed separately.",
  },
  {
    q: "Why can ccusage not show me this number?",
    a: "ccusage reads ~/.claude/projects/<project>/<session>.jsonl on disk and sums input + output tokens per turn against the published model price card. That is a faithful local-token estimate of what you would have paid at API rates. It is not what claude.ai charged you against the Pro/Max metered cap (claude.ai folds in peak-hour multipliers and per-model weights ccusage cannot see) and it never makes an HTTP call to claude.ai to read overage_spend_limit. Local truth versus server truth. The dollar cap is server-only.",
  },
  {
    q: "Does the budget reset every month or every billing cycle?",
    a: "Every billing cycle. The overage_spend_limit endpoint reflects the current cycle's used_credits and monthly_credit_limit; both reset on the cycle boundary, which the subscription_details endpoint reports as next_charge_date. So if your subscription renewed on the 14th, your dollar budget rolls on the 14th, not the 1st. ClaudeMeter prints the next renewal date under the Extra usage line so you can see when the rollover happens.",
  },
  {
    q: "What happens if I raise the cap mid-month after BLOCKED?",
    a: "monthly_credit_limit changes on the next 60-second poll. used_credits keeps climbing from where it was, percent recomputes against the new cap, and the BLOCKED suffix disappears within one minute on the menu-bar refresh. There is no wait for the next billing cycle to unblock. The cap is a soft governor, not a hard wall: you can raise or lower it at any point in the cycle and the running total stays accurate.",
  },
  {
    q: "Can I budget per-day instead of per-month?",
    a: "Not in Anthropic's UI, no. The cap is a single monthly_credit_limit per cycle. To approximate a daily budget, divide the monthly cap by the number of days in the cycle and watch the percent against that fraction. ClaudeMeter shows percent-of-cap and dollars-spent live, so eyeballing 'I should not be over $1.67 by midnight on day one of a $50 cap' is the practical way. There is no API field for a daily ceiling.",
  },
];

const stackedBudgetOutput = [
  { type: "command" as const, text: "$ claude-meter status" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           58.0% used    -> resets Sat May 9 17:30 (in 2h)" },
  { type: "output" as const, text: "7-day all        72.0% used    -> resets Tue May 12 09:00 (in 2d 18h)" },
  { type: "output" as const, text: "7-day Sonnet     41.0% used    -> resets Tue May 12 09:00 (in 2d 18h)" },
  { type: "output" as const, text: "7-day Opus       69.0% used    -> resets Tue May 12 09:00 (in 2d 18h)" },
  { type: "output" as const, text: "Extra usage      $12.40 / $50.00 (25%)" },
  { type: "output" as const, text: "Next charge      May 22, 2026   visa ••0936" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "fetched 2026-05-09 15:32:11 PDT   matt@example.com via Chrome   org abc123…" },
  { type: "success" as const, text: "Two budgets, one block. Top four rows are the free quota. The Extra usage row is your dollar budget." },
];

const blockedDollarOutput = [
  { type: "command" as const, text: "# A few hours later, the metered cap is hit:" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           23.0% used    -> resets Sat May 9 22:30 (in 1h)" },
  { type: "output" as const, text: "7-day all        81.0% used    -> resets Tue May 12 09:00 (in 2d 13h)" },
  { type: "output" as const, text: "Extra usage      $50.00 / $50.00 (100%)  BLOCKED until Wed May 22" },
  { type: "output" as const, text: "Next charge      May 22, 2026   visa ••0936" },
  { type: "error" as const, text: "Free quota under 25% but next prompt 429s. The dollar budget is what stopped you." },
];

const overageEndpointCode = `// GET https://claude.ai/api/organizations/{org_uuid}/overage_spend_limit
// Cookie-authenticated. Same session that loads /settings/usage.
{
  "is_enabled":           true,
  "monthly_credit_limit": 5000,                  // cents -> $50.00
  "used_credits":         1240.0,                // cents -> $12.40
  "currency":             "USD",
  "out_of_credits":       false,
  "disabled_reason":      null,
  "disabled_until":       null
}

// When the cap is hit:
{
  "is_enabled":           true,
  "monthly_credit_limit": 5000,                  // cents -> $50.00
  "used_credits":         5000.0,                // cents -> $50.00
  "currency":             "USD",
  "out_of_credits":       true,
  "disabled_reason":      "monthly_cap_reached",
  "disabled_until":       "2026-05-22T07:00:00Z"
}`;

const dualPollCode = `// claude-meter/src/api.rs lines 16-45
// Two GETs per snapshot. The first carries the rolling-window
// utilization floats; the second carries the dollar cap and the
// BLOCKED state. Both ride on the user's claude.ai session cookie.

let usage: Option<UsageResponse> = match get_json(
    &client,
    &cookie_header,
    &format!("{BASE}/organizations/{org}/usage"),
).await {
    Ok(v)  => Some(v),
    Err(e) => { errors.push(format!("usage: {e:#}")); None }
};

let overage: Option<OverageResponse> = match get_json(
    &client,
    &cookie_header,
    &format!("{BASE}/organizations/{org}/overage_spend_limit"),
).await {
    Ok(v)  => v,
    Err(e) => { errors.push(format!("overage: {e:#}")); None }
};

// Free orgs and team orgs without metered billing 404 the second
// call. The snapshot still renders the rolling-window rows; the
// Extra usage line is just absent. Absence of the line means the
// dollar budget is not configured, not that the call failed.`;

const budgetSteps = [
  {
    title: "Step 1: open claude.ai/settings/usage",
    description:
      "Sign in to your Pro or Max account, scroll to the Extra usage card. If you have never enabled metered billing, the section shows a toggle. The cap (your dollar budget) only exists once metered billing is on. If you do not see an Extra usage section at all, your account is free or your workspace is on a Team/Enterprise plan that uses a different metered-billing flow.",
  },
  {
    title: "Step 2: pick a cap that matches your tolerance",
    description:
      "Click Adjust limit and enter a monthly cap in dollars. A common starting point is roughly your subscription price: $20 for Pro, $100 for Max 5x, $200 for Max 20x. That keeps the surprise overflow capped at something you would already notice on a credit card statement. Lower the cap aggressively if you want a hard ceiling. Raise it if you keep hitting BLOCKED mid-refactor and the overflow is worth the dollars to you.",
  },
  {
    title: "Step 3: install ClaudeMeter to watch both budgets at once",
    description:
      "brew install --cask m13v/tap/claude-meter, then load the browser extension from the GitHub releases page, then visit claude.ai once to seed the session. The macOS menu bar dropdown shows the rolling-window utilization rows and the Extra usage dollar row in one block, refreshed every 60 seconds. No cookie paste, no API key, no second login.",
  },
  {
    title: "Step 4: re-budget at the start of each cycle",
    description:
      "Every billing cycle the cap rolls. used_credits goes back to zero on the next_charge_date. ClaudeMeter prints that date under the Extra usage line so the rollover is not a surprise. Look at the previous cycle's spend and decide whether the cap was too tight (you BLOCKED early) or loose (you barely touched it). Adjust accordingly. Treat the cap as a knob you move, not a one-time setting.",
  },
];

const stackedInvariants = [
  {
    text: "The free quota is two rolling windows: five_hour resets on a sliding 5-hour clock; seven_day resets on a sliding 7-day clock. Both are utilization fractions (0.0 to 1.0), not message counts, not token counts. Hit 1.0 on either and Anthropic 429s the next prompt regardless of how many dollars are left in your cap.",
  },
  {
    text: "The dollar budget is the monthly_credit_limit on overage_spend_limit. It is one integer in cents, set by you on /settings/usage. used_credits is a float in cents that climbs as Anthropic charges metered overflow against the cap. The cap rolls on next_charge_date, not on a calendar month boundary.",
  },
  {
    text: "The two budgets do not pool. Spending dollars does not buy you back rolling-window headroom. Resetting a rolling window does not refund spent dollars. They are stacked: free first, dollar second. Either one can throttle you independently.",
  },
  {
    text: "BLOCKED is a single boolean: out_of_credits = true. It only flips when the dollar cap is reached. It does not reflect rolling-window pinning. If five_hour pins, you get a 429 with no out_of_credits flip; you simply wait. If overage trips, you get a 429 plus out_of_credits = true, and you stay locked until disabled_until passes or you raise the cap.",
  },
  {
    text: "If overage_spend_limit returns 404, the dollar budget does not exist for your org (free tier, or paid plan with metered billing off). ClaudeMeter shows the rolling rows alone in that case. Absence of the Extra usage line is informative: it tells you metered billing is off, not that the tracker broke.",
  },
  {
    text: "Raising the cap mid-cycle takes effect on the next 60-second poll. used_credits keeps its value, percent recomputes against the new cap, BLOCKED clears within one minute. Lowering the cap below current used_credits flips out_of_credits to true on the next poll and you BLOCK immediately at the new ceiling.",
  },
];

const budgetByPlan = [
  {
    feature: "Free quota (rolling 5-hour window)",
    ours: "Pro: ~45 short Sonnet messages",
    competitor: "Max 5x: 5x Pro; Max 20x: 20x Pro",
  },
  {
    feature: "Free quota (rolling 7-day window)",
    ours: "Pro: 40 to 80 hours of Sonnet 4 typical",
    competitor: "Max 5x: ~280 hours typical; Max 20x: higher",
  },
  {
    feature: "Subscription price (the floor)",
    ours: "Pro: $20/month",
    competitor: "Max 5x: $100/month; Max 20x: $200/month",
  },
  {
    feature: "Metered cap field on the wire",
    ours: "monthly_credit_limit (cents)",
    competitor: "Same field, same endpoint, all paid plans",
  },
  {
    feature: "Where you set the cap",
    ours: "claude.ai/settings/usage > Extra usage > Adjust limit",
    competitor: "Same UI, same flow, all paid plans",
  },
  {
    feature: "BLOCKED state field",
    ours: "out_of_credits = true plus disabled_until timestamp",
    competitor: "Same field, same endpoint, all paid plans",
  },
  {
    feature: "Cap rolls on",
    ours: "subscription next_charge_date, not calendar month",
    competitor: "Same: next_charge_date drives both surfaces",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-extra-usage-balance",
    title: "Extra usage balance: the dollar line in detail",
    excerpt:
      "Two endpoints, three fields, one BLOCKED string. The exact 17-line Rust function that turns the JSON into the menu-bar line.",
    tag: "Reference",
  },
  {
    href: "/t/claude-pro-usage-limit",
    title: "Claude Pro usage limit: the eight buckets the server tracks",
    excerpt:
      "Pro is not one limit. Eight separate utilization buckets, two of them undocumented, any one at 100 percent throttles you.",
    tag: "Deep dive",
  },
  {
    href: "/t/claude-plan-pricing-tracker",
    title: "Plan + pricing tracker: three endpoints joined",
    excerpt:
      "Usage, overage_spend_limit, and subscription_details on the same 60-second tick. Renewal date, card on file, cap, and spend in one snapshot.",
    tag: "Architecture",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Pro rate limits as a budget: the free quota and the dollar cap, side by side",
  description:
    "Claude Pro now has two stacked budgets. The free one is the rolling 5-hour and weekly windows. The dollar one is the metered-billing cap you set at claude.ai/settings/usage. Endpoints, fields, failure modes, and a concrete budgeting playbook.",
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

export default function ClaudeProRateLimitsBudgetPage() {
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
          Claude Pro&rsquo;s rate limits are{" "}
          <GradientText>two stacked budgets</GradientText>, not one
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          You hit a wall mid-thread, googled &ldquo;claude pro rate limits
          budget&rdquo;, and landed here. The short version: Pro now has a free
          quota (rolling 5-hour and 7-day windows) and a dollar budget
          (metered-billing cap) you set yourself. Most rate-limit guides only
          cover the first. This page is about the second, where the number
          lives, how the two stacks fail differently, and how to watch them
          both without refreshing the Settings page.
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
            Direct answer (verified 2026-05-09)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            Set your Claude Pro budget at{" "}
            <a
              href="https://claude.ai/settings/usage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              claude.ai/settings/usage
            </a>
            , in the Extra usage section, by clicking{" "}
            <strong>Adjust limit</strong> and entering a monthly cap in dollars.
            That cap is your real budget for what Anthropic bills you on top of
            your $20/month subscription, after the rolling 5-hour and 7-day
            free quotas are spent. The two budgets are independent: hitting a
            rolling window throttles you with no charge; hitting the dollar cap
            blocks you with a literal{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              out_of_credits = true
            </code>{" "}
            flag. Anthropic&rsquo;s walkthrough is at{" "}
            <a
              href="https://support.claude.com/en/articles/12429409-manage-extra-usage-for-paid-claude-plans"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              support.claude.com
            </a>
            . The free open-source way to watch both budgets live in the macOS
            menu bar is{" "}
            <a
              href="https://github.com/m13v/claude-meter"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              ClaudeMeter
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The two-stack mental model
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The mistake every &ldquo;why am I rate-limited&rdquo; thread on
          Reddit makes is treating Pro as one limit. It is not. Pro is two
          budgets glued together, each with its own meter, its own reset
          schedule, and its own failure mode.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The bottom budget is the free quota you bought with your $20. It
          ships as utilization fractions on the rolling 5-hour and 7-day
          windows. You spend this first, automatically, on every prompt. There
          are no dollars involved. When a window pins at 100 percent, the next
          prompt 429s and you wait for the rolling clock to roll back below
          the line.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The top budget is the dollar one you set yourself. It only exists
          if you turned on metered billing on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /settings/usage
          </code>
          . Once you set a cap, hitting the bottom budget no longer 429s you;
          Anthropic spends from the top budget instead, at standard API rates,
          metered against your cap. When the top budget reaches the cap, the
          flag{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          flips to true and you BLOCK until the next billing cycle (or until
          you raise the cap).
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Two budgets, two failure modes, one stack. Watching only the rolling
          windows is what makes a quiet $200 metered bill arrive in May. Watching
          only the dollar line is what makes you waste 90 minutes waiting for a
          window to roll when you have $40 of cap untouched.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What both budgets look like, in real numbers
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Run the bundled CLI on a Pro account with metered billing enabled and
          you get six rows: the four rolling-window rows, the Extra usage
          dollar row, and the next-charge date the cap rolls on. The same
          block renders in the macOS menu bar dropdown, and in the browser
          toolbar popup.
        </p>
        <TerminalOutput
          title="claude-meter, both budgets healthy"
          lines={stackedBudgetOutput}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          Now look at the same block when the dollar budget trips. The free
          quota rows are barely touched. The Extra usage line is at 100 percent
          and carries the BLOCKED suffix plus the unblock date. This is the
          state every other tracker on the market cannot show in one line:
        </p>
        <TerminalOutput
          title="claude-meter, dollar budget blocked"
          lines={blockedDollarOutput}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Twenty-three percent on the 5-hour window, eighty-one percent on the
          7-day, BLOCKED on the dollar cap. The next prompt 429s and the
          rolling rows are not why. Without the Extra usage line you would
          burn ten minutes guessing.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Where the dollar budget lives on the wire
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The Settings page renders the dollar budget as a progress bar. The
          underlying source is one cookie-authenticated GET on claude.ai. No
          API key, no public token. Open DevTools on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /settings/usage
          </code>{" "}
          and you can see the same payload come back:
        </p>
        <AnimatedCodeBlock
          code={overageEndpointCode}
          language="json"
          filename="GET /api/organizations/{org_uuid}/overage_spend_limit"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Two integers (cents), one boolean, two optional fields for the
          lockout state. That is the whole budget. Divide by 100 and you have
          dollars. Watch{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          and you have the BLOCKED state. ClaudeMeter polls this endpoint every
          60 seconds alongside the rolling-window endpoint, and merges both
          into one snapshot:
        </p>
        <div className="mt-6">
          <AnimatedCodeBlock
            code={dualPollCode}
            language="rust"
            filename="src/api.rs"
          />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Six invariants the stacked-budget model relies on
        </h2>
        <AnimatedChecklist
          title="What the two-budget stack guarantees"
          items={stackedInvariants}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Budgeting playbook: four steps that work for most Pro users
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The right budget is not the most aggressive cap; it is the cap that
          matches how often you hit rolling-window walls and how much overflow
          is worth to you. Most Pro users converge on a cap close to their
          subscription price and adjust quarterly. Here is the routine:
        </p>
        <StepTimeline steps={budgetSteps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              How the budget shape varies across paid plans
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Same wire shape, different free-quota magnitudes. The dollar cap
              is yours to set on every paid tier.
            </p>
          </div>
          <ComparisonTable
            productName="Claude Pro ($20/month)"
            competitorName="Claude Max (5x or 20x)"
            rows={budgetByPlan}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why local tools cannot replace this view
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              ccusage and Claude-Code-Usage-Monitor both read{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ~/.claude/projects/&lt;project&gt;/&lt;session&gt;.jsonl
              </code>{" "}
              on disk and sum input + output tokens against the public API
              price card. That gives you a faithful local-token estimate of
              what Claude Code processed locally. It is real data; it is also
              the wrong data if your question is &ldquo;what did Anthropic
              charge me against my Pro metered cap.&rdquo;
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              Anthropic charges metered overflow against the cap using server-side
              numbers that fold in per-model weights, peak-hour multipliers,
              and bucket attribution that local logs never see. The dollar
              figure on{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /settings/usage
              </code>{" "}
              comes from the server. The only way to read it is the
              cookie-authenticated GET on{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /api/organizations/&#123;org&#125;/overage_spend_limit
              </code>
              . ClaudeMeter automates the cookie wrangling, the org enumeration,
              and the polling. It is the only open-source tracker that surfaces
              the dollar budget alongside the rolling windows in one view.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              Run both side by side and you have the whole picture: tokens
              spent locally and the dollar figure Anthropic counted those
              tokens as on the metered ledger. The two numbers do not match
              because they measure different ledgers; that gap is the budget
              math you cannot get from one tool alone.
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
            overage_spend_limit
          </code>{" "}
          endpoint is undocumented. Anthropic can rename a field on any
          claude.ai release. ClaudeMeter declares each field as Optional in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>{" "}
          so a missing field deserializes as None and the Extra usage row
          goes blank instead of crashing. That is forward-compat hedging, not
          a guarantee. If a name changes, the open-source repo gets a
          same-day patch and you pull the next brew release. The trade for
          reading server truth is that the wire is less stable than a
          published API; the upside is that the dollar budget is exactly the
          number Anthropic will bill against, not an estimate.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Picking a metered cap and want a sanity check on the math?"
          description="15 minutes. Bring your last cycle's spend and your worst rate-limited day. We can walk through the cap-vs-rolling tradeoff and what to set."
          text="Book a 15-minute call"
          section="rate-limits-budget-footer"
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
        description="Questions on the budget cap? 15 min."
        section="rate-limits-budget-sticky"
        site="claude-meter"
      />
    </article>
  );
}
