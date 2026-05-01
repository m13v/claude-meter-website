import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  AnimatedChecklist,
  MetricsRow,
  StepTimeline,
  GlowCard,
  GradientText,
  BackgroundGrid,
  CodeComparison,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-extra-usage-balance";
const PUBLISHED = "2026-04-30";

export const metadata: Metadata = {
  title:
    "Claude Extra Usage Balance: What the Dollar Line on /settings/usage Actually Is",
  description:
    "The 'extra usage balance' on Claude is the dollar figure Anthropic counts against your metered billing cap once your plan windows are spent. It comes from two undocumented endpoints (overage_spend_limit and usage.extra_usage), renders as $X.XX / $Y.YY (Z%) with an optional BLOCKED suffix, and ClaudeMeter is the open-source way to watch it live in your menu bar without opening the Settings page.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Extra Usage Balance: What the Dollar Line on /settings/usage Actually Is",
    description:
      "Two endpoints, three fields, one BLOCKED state. The 'extra usage balance' line in plain English plus the exact source ClaudeMeter reads.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What does 'extra usage balance' actually mean on a Claude Pro or Max plan?",
    a: "It is the dollar amount Anthropic has counted against your metered (pay-as-you-go) cap during the current billing month. Once your rolling 5-hour window and 7-day weekly bucket are spent, Anthropic does not stop you outright; it bills further usage against a configurable monthly credit limit, in cents, and surfaces both the spend and the limit on claude.ai/settings/usage. The 'balance' is the difference between used_credits and monthly_credit_limit. ClaudeMeter mirrors that into a single line in your menu bar.",
  },
  {
    q: "Where exactly does the dollar number come from?",
    a: "Two endpoints on claude.ai. The first is GET /api/organizations/{org_uuid}/usage, which carries an extra_usage block with is_enabled, monthly_limit, used_credits, utilization, currency. The second is GET /api/organizations/{org_uuid}/overage_spend_limit, which carries is_enabled, monthly_credit_limit, used_credits, currency, plus three fields the first endpoint does not have: disabled_reason, disabled_until, out_of_credits. ClaudeMeter prefers the second endpoint when present because BLOCKED is only diagnosable from those three extra fields. Both numbers are in cents and divided by 100 to render dollars.",
  },
  {
    q: "Why are there two endpoints showing roughly the same balance?",
    a: "The usage endpoint includes the metered block as a sub-object so a single GET can reconstruct the whole rolling-window plus pay-as-you-go view. The overage_spend_limit endpoint is the dedicated billing-state endpoint that the Settings page uses to render the BLOCKED banner and the 'until <date>' message when an admin pauses metered billing or the cap is hit. They overlap on the dollars used and the cap; they diverge on the lockout state. ClaudeMeter calls both, in sequence, and merges them into one snapshot.",
  },
  {
    q: "What does 'BLOCKED' mean in the menu bar line?",
    a: "It means the JSON came back with out_of_credits = true. The user has metered billing enabled, has consumed the entire monthly_credit_limit, and Anthropic is now refusing overage-billed calls until disabled_until passes (or the user raises the cap on the Settings page). The 5-hour and 7-day bars can still look green when this happens, which is why the BLOCKED string is the harshest debugging case in the whole UI: green windows plus a BLOCKED extra-usage line means the next prompt 429s and the cause is not the rolling cap.",
  },
  {
    q: "Why are the values divided by 100 in src/format.rs?",
    a: "The fields ship in cents. used_credits and monthly_credit_limit on the overage_spend_limit response are integer cents (or for used_credits, a float of cents). format.rs line 25 does `let u = ov.used_credits.unwrap_or(0.0) / 100.0;` and line 29 does `let l = l as f64 / 100.0;`, then line 31 prints `${:.2} / ${:.2} ({:.0}%)` so the dollar sign + two-decimal format reads like a normal billing line. If you skipped the division you would see $172000.00 / $50000.00 instead of $1720.00 / $500.00 and assume the reader was hallucinating.",
  },
  {
    q: "Where do free tools like ccusage report this same balance?",
    a: "They do not. ccusage reads ~/.claude/projects/<project>/<session>.jsonl on disk and sums input + output tokens per turn against the official model price card. That is a faithful local-token estimate, but it cannot see the extra_usage block on claude.ai (claude.ai's pricing folds in peak-hour multipliers and per-model weights ccusage does not) and it cannot see the overage_spend_limit endpoint at all (it never makes an HTTP call to claude.ai). The extra-usage balance is server truth; ccusage measures local truth. Use both together if you want to compare the two ledgers.",
  },
  {
    q: "Can I curl the endpoint myself?",
    a: "Yes. Open DevTools on claude.ai/settings/usage, copy your full Cookie header, then run `curl -H 'Cookie: $YOUR_COOKIE' -H 'Referer: https://claude.ai/settings/usage' https://claude.ai/api/organizations/$ORG_UUID/overage_spend_limit`. You get back the same JSON the extension does: { is_enabled, monthly_credit_limit, used_credits, currency, out_of_credits, disabled_reason, disabled_until }. Pipe through jq and you have a one-shot view of your extra usage balance. ClaudeMeter automates the cookie wrangling, the org enumeration, and the 60-second cadence.",
  },
  {
    q: "What if overage_spend_limit returns 404?",
    a: "It does for free workspace orgs and team orgs without metered billing turned on. ClaudeMeter wraps the call in try/catch (extension/background.js line 26-27, src/api.rs lines 31-45) and falls through to the extra_usage block on the usage response if it is present, or omits the line entirely if neither endpoint hands back a balance. So if you do not see an Extra usage line in the menu bar, your org has not enabled metered billing or you are on a free tier; the absence of the line is informative, not a bug.",
  },
  {
    q: "Why does claude-meter render BLOCKED as exactly two leading spaces and uppercase?",
    a: "Because the line is laid out for monospaced terminal width: 16 characters of label, then the dollar line, then the optional status flag. format.rs line 26 hardcodes `\"  BLOCKED\"` (two spaces, all caps) so the flag is visually offset from the percent column without needing a separate column. format.rs line 39 then prints with `{:<16}` left-padded label, so 'Extra usage' aligns with '5-hour' and '7-day' above it. It is purely cosmetic, but it is the literal string you will see in the menu bar and the CLI when out_of_credits goes hot.",
  },
  {
    q: "Does the balance reset every month or every billing cycle?",
    a: "Every billing cycle. The overage_spend_limit endpoint reflects the current cycle's used_credits and monthly_credit_limit; both reset on the cycle boundary the subscription_details endpoint reports as next_charge_date. ClaudeMeter does not interpolate the reset (the Settings page does not render a countdown for the metered cap), but you can see the renewal date by checking the subscription line printed under the Extra usage line in the CLI or the menu bar dropdown.",
  },
  {
    q: "What happens if I raise the cap mid-month? Does the balance number change?",
    a: "monthly_credit_limit changes on the very next poll. used_credits keeps climbing from where it was. Percent recomputes from the new cap, so a balance that was at 100 percent BLOCKED can drop back to (for example) 60 percent when you double the cap, and the BLOCKED suffix disappears within one minute on the menu-bar refresh. ClaudeMeter does not cache the cap; every 60-second poll re-reads it from the server.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude extra usage balance", url: PAGE_URL },
];

const menuBarOutput = [
  { type: "command" as const, text: "$ /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           62.0% used    -> resets Wed Apr 30 18:00 (in 4h)" },
  { type: "output" as const, text: "7-day all        81.0% used    -> resets Sun May 4 09:00 (in 3d 15h)" },
  { type: "output" as const, text: "7-day Sonnet     44.0% used    -> resets Sun May 4 09:00 (in 3d 15h)" },
  { type: "output" as const, text: "7-day Opus       73.0% used    -> resets Sun May 4 09:00 (in 3d 15h)" },
  { type: "output" as const, text: "Extra usage      $17.20 / $50.00 (34%)" },
  { type: "output" as const, text: "Next charge      May 14, 2026   visa ••0936" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "fetched 2026-04-30 14:02:11 PDT   matt@example.com via Chrome   org abc123…" },
  { type: "success" as const, text: "Look at the 'Extra usage' row. That is your extra usage balance." },
];

const blockedOutput = [
  { type: "command" as const, text: "# Same command, this time the cap was hit:" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           41.0% used    -> resets Wed Apr 30 18:00 (in 4h)" },
  { type: "output" as const, text: "7-day all        67.0% used    -> resets Sun May 4 09:00 (in 3d 15h)" },
  { type: "output" as const, text: "Extra usage      $50.00 / $50.00 (100%)  BLOCKED until Thu May 1" },
  { type: "output" as const, text: "Next charge      May 14, 2026   visa ••0936" },
  { type: "error" as const, text: "Green windows, BLOCKED metered cap. Next prompt 429s and the rolling bars are not why." },
];

const formatRsCode = `// claude-meter/src/format.rs lines 24-40
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

// 17 lines. Two divisions by 100 to convert cents to dollars.
// One match arm for the no-cap case. One conditional suffix for
// the lockout date. Everything you see in the menu bar comes
// out of these 17 lines.`;

const overageStructCode = `// claude-meter/src/models.rs lines 9-40
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtraUsage {
    pub is_enabled:    bool,
    pub monthly_limit: Option<i64>,    // cents
    pub used_credits:  Option<f64>,    // cents
    pub utilization:   Option<f64>,    // 0.0 to 1.0 typically
    pub currency:      Option<String>, // usually "USD"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverageResponse {
    pub is_enabled:           bool,
    pub monthly_credit_limit: Option<i64>,                     // cents
    pub currency:             Option<String>,
    pub used_credits:         Option<f64>,                     // cents
    pub disabled_reason:      Option<String>,                  // why locked
    pub disabled_until:       Option<chrono::DateTime<Utc>>,   // until when
    #[serde(default)]
    pub out_of_credits:       bool,                            // BLOCKED flag
}

// Two structs because two endpoints. ExtraUsage carries the rolling
// utilization fraction (so it lines up next to five_hour and seven_day
// in the same JSON object). OverageResponse carries the lockout state
// the Settings page actually surfaces when metered billing trips.`;

const dualFetchCode = `// claude-meter/src/api.rs lines 16-45
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

// Two GETs, sequential. The order is important: usage is required
// (its 5-hour and 7-day floats drive the badge), overage is optional
// (free orgs 404 it, and the menu bar still renders the rolling
// windows above). The merge into UsageSnapshot happens ten lines down.`;

const balanceVsSettings = [
  {
    feature: "The dollar figure",
    ours: "Extra usage    $17.20 / $50.00 (34%)",
    competitor: "Same number, on a Settings page bar with the 'Extra usage' label",
  },
  {
    feature: "BLOCKED state surfaced",
    ours: "Literal '  BLOCKED' suffix on the dollar line",
    competitor: "A separate banner above the bar; not in any one-line summary",
  },
  {
    feature: "Lockout date",
    ours: "' until Thu May 1' appended on the same line",
    competitor: "In the BLOCKED banner text, requires reading prose",
  },
  {
    feature: "Refresh cadence",
    ours: "Once per 60 seconds in the background",
    competitor: "On full page reload",
  },
  {
    feature: "Where you read it",
    ours: "macOS menu bar dropdown, browser toolbar popup, CLI",
    competitor: "claude.ai/settings/usage page",
  },
  {
    feature: "Multi-account",
    ours: "Iterates account.memberships, prints one Extra usage line per org with metered billing on",
    competitor: "One organization per visible page",
  },
  {
    feature: "Cost",
    ours: "Free, MIT licensed Rust + JavaScript",
    competitor: "Bundled with the plan",
  },
];

const balanceInvariants = [
  {
    text: "The dollar number is used_credits / 100 (the field ships in cents). monthly_credit_limit is the cap, also divided by 100. The percent is u / l * 100, computed locally, never read from the server. format.rs lines 25-30 do this in five lines.",
  },
  {
    text: "The BLOCKED suffix is exactly two leading spaces and uppercase, hardcoded in format.rs line 26. It only appends when out_of_credits = true on the overage_spend_limit response. The flag is the single source of truth for 'metered billing is locked right now'.",
  },
  {
    text: "If monthly_credit_limit is None the format switches to '$X.XX used (no cap)'. That happens when the user enabled metered billing without setting a cap. The percent is omitted because there is nothing to divide against.",
  },
  {
    text: "If disabled_until is set the format appends ' until <Day Mon D>' using a Local timezone format. The date is the Anthropic-side timestamp at which metered billing un-blocks (cap rollover or admin re-enable). format.rs lines 35-37 do the conversion.",
  },
  {
    text: "If overage_spend_limit returns 404 (free org, no metered billing) the entire Extra usage line is skipped. The 5-hour and 7-day rows above still render. Errors are pushed to a `errors` Vec on the snapshot, surfaced in the dropdown footer, but they do not break the rendering of the rest.",
  },
  {
    text: "On the browser side, extension/background.js line 26 mirrors the same dual-endpoint pattern with credentials: 'include', and the popup reads the merged snapshot from chrome.storage.local. Same data, same shape, no additional auth.",
  },
];

const installSteps = [
  {
    title: "Step 1: brew install the menu bar app",
    description:
      "brew install --cask m13v/tap/claude-meter. The cask installs ClaudeMeter.app under /Applications and registers a launch agent so the menu bar icon comes back after reboot. The CLI is at /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter for tmux or Starship status lines.",
  },
  {
    title: "Step 2: load the unpacked extension",
    description:
      "Clone github.com/m13v/claude-meter, open chrome://extensions (or arc://extensions, brave://extensions, edge://extensions), enable Developer mode, click 'Load unpacked', select the extension/ folder. The browser pins the icon next to the URL bar. The extension is what reaches claude.ai with your existing session cookies, so no manual cookie paste.",
  },
  {
    title: "Step 3: visit claude.ai once",
    description:
      "If you are not already logged in, visit claude.ai and sign in. The extension reads your existing session cookie via fetch with credentials: 'include' and starts polling /api/organizations/{org}/usage and /api/organizations/{org}/overage_spend_limit on a 60-second tick. Within one minute the badge lights up.",
  },
  {
    title: "Step 4: open the menu bar dropdown",
    description:
      "Click the ClaudeMeter icon in the macOS menu bar. The Extra usage line shows your dollar balance, percent, and any BLOCKED suffix. If you do not see it, your org has not enabled metered billing on claude.ai/settings/usage; the absence of the line means absence of the feature, not a bug.",
  },
];

const settingsPageVsCli = `# claude.ai/settings/usage prose paraphrase:
"You have used $17.20 of your $50.00 monthly extra usage cap.
 Metered billing is enabled. Your billing cycle ends May 14, 2026.
 If you reach your cap, additional usage will be blocked until
 your next billing cycle or until you raise the cap."

# claude-meter --json output (excerpt):
{
  "overage": {
    "is_enabled":           true,
    "monthly_credit_limit": 5000,    // cents
    "used_credits":         1720.0,  // cents
    "out_of_credits":       false,
    "disabled_reason":      null,
    "disabled_until":       null,
    "currency":             "USD"
  }
}`;

const cliOneLiner = `# claude.ai/settings/usage prose paraphrase (BLOCKED):
"Your monthly extra usage cap has been reached. New usage that
 would be billed against the cap is blocked until your next
 billing cycle starts on May 1, 2026."

# claude-meter --json output (excerpt):
{
  "overage": {
    "is_enabled":           true,
    "monthly_credit_limit": 5000,                       // cents
    "used_credits":         5000.0,                     // cents
    "out_of_credits":       true,
    "disabled_reason":      "monthly_cap_reached",
    "disabled_until":       "2026-05-01T07:00:00Z",
    "currency":             "USD"
  }
}

# claude-meter --pretty (default) renders that JSON as:
# Extra usage      $50.00 / $50.00 (100%)  BLOCKED until Thu May 1`;

const relatedPosts = [
  {
    href: "/t/claude-plan-pricing-tracker",
    title: "Plan + pricing tracker: how the three claude.ai endpoints stitch together",
    excerpt:
      "Usage, overage_spend_limit, and subscription_details on the same 60-second tick, joined into one menu-bar surface so renewal date, card, and cap are all readable at once.",
    tag: "Architecture",
  },
  {
    href: "/t/claude-rate-limit-dashboard",
    title: "Rate limit dashboard: the eight floats and one BLOCKED string the JSON ships",
    excerpt:
      "Every utilization float in the /usage response, why some come back 0-1 and others 0-100, and how the dashboard renders the green-bars-but-still-rate-limited case.",
    tag: "Reference",
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
    "Claude extra usage balance: what the dollar line on /settings/usage actually is",
  description:
    "The 'extra usage balance' is the dollar figure Anthropic counts against your metered billing cap. Two undocumented endpoints, three fields, one BLOCKED state. Here is the schema, the rendering, and the open-source way to watch it live in your menu bar.",
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

export default function ClaudeExtraUsageBalancePage() {
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
          <GradientText>extra usage balance</GradientText> is two endpoints, three fields, and one BLOCKED string
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          When Anthropic enabled metered billing on Pro and Max in April 2026,
          a new line appeared on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>
          : a dollar figure ticking up against a monthly cap. People started
          calling it &ldquo;extra usage balance&rdquo; on Reddit and in
          comments. Behind that one line are two undocumented endpoints, a
          handful of fields shipped in cents, and one boolean that flips when
          you get locked out. This page walks every part of it, and shows the
          exact 17-line Rust function that turns the JSON into the line you
          see in the menu bar.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="10 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-04-30)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            Your &ldquo;extra usage balance&rdquo; is the dollar amount
            Anthropic has counted against your metered billing cap during the
            current billing cycle. The number lives at{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              GET /api/organizations/&#123;org&#125;/overage_spend_limit
            </code>{" "}
            on claude.ai (cookie-authenticated, undocumented), as{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              used_credits
            </code>{" "}
            and{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              monthly_credit_limit
            </code>
            , both in cents. A second flag,{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              out_of_credits
            </code>
            , flips to true when the cap is reached. The free open-source way
            to watch all three live is{" "}
            <a
              href="https://github.com/m13v/claude-meter"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              ClaudeMeter
            </a>
            , verified at{" "}
            <a
              href="https://github.com/m13v/claude-meter/blob/main/src/format.rs"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              src/format.rs
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the line actually looks like
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Run the bundled CLI and you get the same five-row block the menu bar
          dropdown renders. The fifth row is your extra usage balance. The
          dollars-used number is on the left, the cap is in the middle, the
          percent is in parentheses.
        </p>
        <TerminalOutput title="claude-meter, metered billing healthy" lines={menuBarOutput} />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          When the cap trips,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          flips and the line gains a literal{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            BLOCKED
          </code>{" "}
          suffix plus a date. This is the case nothing else surfaces in a
          single line:
        </p>
        <TerminalOutput title="claude-meter, metered cap reached" lines={blockedOutput} />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Notice the rolling windows above: 41 percent and 67 percent. Both
          green by the usual color-coding. The next prompt still 429s because
          the metered cap is what blocks now, and the menu-bar line is the
          only thing telling you that.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The two endpoints behind the line
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The dollar number ships from two different places on claude.ai. They
          overlap on the cents-used and the cap; they differ on the lockout
          state. ClaudeMeter calls both, in sequence, and merges them into one
          snapshot:
        </p>
        <AnimatedCodeBlock
          code={dualFetchCode}
          language="rust"
          filename="src/api.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The order matters. The usage call is required because its{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>{" "}
          floats drive the toolbar badge. The overage call is optional:
          free workspace orgs and team orgs without metered billing 404 here,
          and the menu bar still renders the rows above the Extra usage line
          when that happens. The same pattern lives in the browser extension
          at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extension/background.js
          </code>{" "}
          line 26, with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            credentials: &lsquo;include&rsquo;
          </code>
          .
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Two structs, because two endpoints carry slightly different fields
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The Rust schema declares both shapes side by side. The first lines up
          with the rolling-window response on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>
          ; the second covers the dedicated billing-state response on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /overage_spend_limit
          </code>
          . The diff is three fields:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            disabled_reason
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            disabled_until
          </code>
          , and the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          boolean.
        </p>
        <AnimatedCodeBlock
          code={overageStructCode}
          language="rust"
          filename="src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The fields ship in cents on the wire. That is one of the small things
          you have to know cold, because rendering them as dollars is a divide
          by 100 in the format function, and a missed division gives you{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            $1720.00 / $5000.00
          </code>{" "}
          where Anthropic shows{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            $17.20 / $50.00
          </code>
          . Pure unit-of-measure trap.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 17-line function that builds the line
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Everything you read in the menu bar comes out of this block. Two
          divisions by 100 to convert cents to dollars. One match arm for the
          no-cap case. One conditional suffix for the lockout date. One
          hardcoded uppercase{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            BLOCKED
          </code>{" "}
          string. Then a left-padded label so the column lines up with the
          rolling-window rows above:
        </p>
        <AnimatedCodeBlock
          code={formatRsCode}
          language="rust"
          filename="src/format.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The reason{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            &quot;  BLOCKED&quot;
          </code>{" "}
          is two leading spaces and uppercase: it is a visual offset for a
          monospaced terminal column, not a CSS state. format.rs line 26
          hardcodes the literal so the flag floats off the percent, and line 39
          uses{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            {`{:<16}`}
          </code>{" "}
          to left-pad &ldquo;Extra usage&rdquo; to match the 16-character
          labels above.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The Settings page in prose vs the JSON the tracker reads
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The Anthropic Settings page renders the balance as a paragraph and a
          progress bar. The tracker reads the underlying JSON. Both see the
          same numbers; only the JSON gives you the BLOCKED flag in a form you
          can pipe into a status line.
        </p>
        <CodeComparison
          leftCode={settingsPageVsCli}
          rightCode={cliOneLiner}
          leftLines={settingsPageVsCli.split("\n").length}
          rightLines={cliOneLiner.split("\n").length}
          leftLabel="Healthy: under cap"
          rightLabel="Blocked: at cap"
          title="Same field, two states, two renderings"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          On the BLOCKED side, three fields move at once:{" "}
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
          flips to true,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            disabled_until
          </code>{" "}
          carries the next-cycle timestamp. format.rs glues all three into one
          line; nothing else does.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          The balance row, tracker vs Settings page
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Both read the same backing fields. The diff is what they render at a
          glance and how often.
        </p>
        <ComparisonTable
          productName="ClaudeMeter (menu bar + browser)"
          competitorName="claude.ai/settings/usage"
          rows={balanceVsSettings}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Six invariants the Extra usage line holds
        </h2>
        <AnimatedChecklist
          title="What an extra usage balance line has to get right"
          items={balanceInvariants}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The numbers behind the line
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              All readable straight out of the source. None invented.
            </p>
          </div>
          <MetricsRow
            metrics={[
              {
                value: 2,
                label: "claude.ai endpoints joined per snapshot",
              },
              {
                value: 17,
                label: "lines in src/format.rs that build the line",
              },
              {
                value: 60,
                suffix: "s",
                label: "polling cadence (POLL_MINUTES = 1)",
              },
              {
                value: 0,
                label: "API keys or pasted cookies required",
              },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Install in four steps
        </h2>
        <StepTimeline steps={installSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why this line is the one to watch
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              Before April 2026, hitting a Claude rate limit meant you waited
              for the rolling window to reset. After April 2026, with metered
              billing flipped on, the rolling windows hand off to the cap, and
              the cap silently spends real dollars. The dollar line is the
              first place you see the cost. Without it, your first signal that
              metered billing got expensive is the next invoice.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              Local-token tools cannot help here. ccusage,
              Claude-Code-Usage-Monitor, and similar utilities read{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ~/.claude/projects/&lt;project&gt;/&lt;session&gt;.jsonl
              </code>{" "}
              on disk. That ledger is real, but it is local-truth, and it does
              not see metered-billing state at all (no HTTP call to claude.ai,
              no cookies, no overage_spend_limit endpoint). The extra usage
              balance is server-truth; the only way to read it is the
              cookie-authenticated GET on claude.ai. ClaudeMeter automates
              that GET, the cookie wrangling, and the 60-second loop.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              Run the local-token tool and the server-truth tool side by side
              and you have the whole picture: tokens spent locally and the
              dollar figure Anthropic counted those tokens as. The two numbers
              do not match because they measure different things; that is the
              feature, not a bug.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint is undocumented. The field names can change in any
          claude.ai release. The Rust struct in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>{" "}
          declares each field as Optional so a missing one deserializes as
          None and the row goes blank instead of crashing. That is a
          forward-compat hedge, not a guarantee. If a field gets renamed, the
          open-source repo gets a same-day patch and you pull the next brew
          release. That is the tradeoff for reading server truth instead of a
          published API: the surface is closer to reality, the wire is less
          stable. Worth it for the BLOCKED line; the alternative is finding
          out from the next invoice.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Building a metered-billing tracker and want to compare endpoint shapes?"
          description="Send a 15 minute call. Happy to swap notes on the cents-vs-dollars trap, the BLOCKED state, and the moments the JSON shifts shape."
          text="Book a 15-minute call"
          section="extra-usage-balance-footer"
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
        description="Questions on the Extra usage line? 15 min."
        section="extra-usage-balance-sticky"
        site="claude-meter"
      />
    </article>
  );
}
