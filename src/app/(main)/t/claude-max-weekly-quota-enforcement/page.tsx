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
  AnimatedBeam,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-max-weekly-quota-enforcement";
const PUBLISHED = "2026-05-04";

export const metadata: Metadata = {
  title:
    "Claude Max Weekly Quota Enforcement: Three Gates, Two Endpoints, One BLOCKED String",
  description:
    "On Claude Max the weekly quota is not one wall. It is three gates in sequence: five_hour, seven_day, and overage_spend_limit. Each gate carries a different signal, on a different endpoint. Here is the exact data path from server state to BLOCKED string in your menu bar.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Max Weekly Quota Enforcement: Three Gates, Two Endpoints, One BLOCKED String",
    description:
      "Three sequential enforcement gates on Claude Max, two server endpoints, and the boolean that flips when you are out. The undocumented schema and how to read it live.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "How does Anthropic actually enforce the Claude Max weekly quota?",
    a: "Through three sequential server-side gates. Gate 1 is five_hour.utilization on /api/organizations/{org_uuid}/usage; once it reaches 100 percent, claude.ai rejects the next message until five_hour.resets_at. Gate 2 is seven_day.utilization on the same endpoint; same rejection rule, but the reset clock is 168 hours from your first message of the cycle. Gate 3 is the metered-billing cap on /api/organizations/{org_uuid}/overage_spend_limit, surfaced as out_of_credits: true and a disabled_until timestamp. A Max user who has metered billing enabled walks through all three. A Max user without metered billing stops at Gate 2 and waits until seven_day.resets_at. ClaudeMeter polls both endpoints every 60 seconds and renders the active gate as a row in the menu bar.",
  },
  {
    q: "Where do I see which gate is currently blocking me?",
    a: "In the menu bar dropdown, the row whose percent is at or above 100 is the active gate. If 5-hour is hot and 7-day is green, it is Gate 1; sit out until the 5-hour reset and you keep your weekly bucket. If 7-day is hot and 5-hour just reset, Gate 2 fired; you wait until seven_day.resets_at, which the popup shows in days/hours. If both windows look green and the next prompt still 429s, scroll to the Extra usage row: a BLOCKED suffix means Gate 3 fired, and you wait until disabled_until. The prose on claude.ai/settings/usage does not separate the three; the menu bar does because each gate has its own row.",
  },
  {
    q: "Why is Gate 3 a separate endpoint from Gates 1 and 2?",
    a: "Because Gate 3 is a billing state, not a usage state. /api/organizations/{org}/usage carries the rolling-window utilization fractions for the plan limits Anthropic enforces by default. /api/organizations/{org}/overage_spend_limit carries the metered-billing cap, which only matters once the plan limits are spent and the user has chosen to pay-as-you-go past them. The two responses overlap on a few fields (used_credits, monthly_credit_limit) and diverge on three (out_of_credits, disabled_reason, disabled_until). A free workspace org or a Max account without metered billing turned on returns 404 on overage_spend_limit; the rolling-window endpoint still returns the two windows. ClaudeMeter wraps the overage call in try/catch (extension/background.js line 26-27, src/api.rs lines 31-45) and falls through cleanly when the endpoint is missing.",
  },
  {
    q: "What does the request that hits the enforcement boundary look like?",
    a: "From the server's perspective the enforcement is a precondition check before message generation. When utilization on the relevant bucket is at or above 1.0 (or out_of_credits is true on the overage response), claude.ai short-circuits the request with an HTTP 429 and a JSON body explaining which limit was hit. The check runs on every prompt, so the boundary is real-time, not eventually-consistent. ClaudeMeter does not see the 429 itself (it polls usage; it does not send chat prompts), but the moment the gate flips, the next 60-second poll lights up the row. That is the practical refresh rate of the boundary from a user's point of view.",
  },
  {
    q: "Why can't ccusage or Claude-Code-Usage-Monitor show the enforcement state?",
    a: "Because they read ~/.claude/projects/<project>/<session>.jsonl on disk and sum input/output tokens against the model price card. That is local truth: the tokens you sent and received from your machine. Enforcement is server truth: which bucket Anthropic charged the request to, what fraction of the cap that landed at, whether out_of_credits flipped. The local logs do not contain bucket-state, peak-hour multipliers, or metered-billing flags. Only the cookie-authenticated calls to /api/organizations/{org}/usage and /api/organizations/{org}/overage_spend_limit carry that. ClaudeMeter is the open-source tracker that fetches both with your existing claude.ai cookies through a browser extension, so there is no manual cookie paste.",
  },
  {
    q: "What is the exact reset cadence for each gate?",
    a: "Gate 1 (five_hour) resets 5 hours after your first message of the rolling window. The endpoint returns five_hour.resets_at as an ISO 8601 timestamp; the popup formats it as a relative duration (m / h / d). Gate 2 (seven_day) resets 168 hours after your first message of the cycle, returned as seven_day.resets_at on the same response. Gate 3 (overage_spend_limit) resets on your billing cycle boundary, returned as disabled_until on the overage response when out_of_credits is true. The clocks are independent: a fresh 5-hour reset does not push the seven_day reset, and a billing-cycle rollover does not move the rolling windows.",
  },
  {
    q: "Can I see the enforcement timestamp before it fires?",
    a: "Yes. Both endpoints return the resets_at field whether or not the bucket is at the cap. So at 62 percent on five_hour you can see the eventual reset, plan around it, and decide if a heavy refactor is worth crossing the gate. ClaudeMeter formats that timestamp on every row: the popup shows 'in 4h' or 'in 3d 15h' or 'now' next to the percent bar, and the dropdown title says '7d: 81%' so you can hover the icon and read the slow-moving gate without clicking. The forward-look is the part claude.ai/settings/usage hides behind a vague 'usage will reset at' label.",
  },
  {
    q: "How fast does the menu bar pick up that a gate just flipped?",
    a: "Within 60 seconds. extension/background.js line 3 sets POLL_MINUTES = 1, and chrome.alarms.create('refresh', { periodInMinutes: 1 }) ticks at minute boundaries. The Rust side mirrors that: src/main.rs schedules the same 60-second cadence. So the worst-case latency between a gate flipping on the server and the menu bar showing it is one poll. Anthropic's own /settings/usage page also recomputes against the same cadence, so the two stay in lockstep without a busy-loop on the endpoint.",
  },
  {
    q: "Is there an HTTP signal I can read directly when a request gets enforced?",
    a: "Yes, but you have to be in the chat path to see it. Sending a prompt to /api/organizations/{org}/chat_conversations/{id}/completion when the active gate is at the cap returns HTTP 429 with a JSON error body that names the limit. That signal is observable in DevTools while you chat. The trade-off is that you only learn about enforcement when you try to send and bounce. Polling the usage and overage_spend_limit endpoints (no chat path needed, no prompt cost) is the cheaper read because you watch the gauge approach 100 percent rather than discovering it the hard way.",
  },
  {
    q: "Is the endpoint stable? Can the field names change?",
    a: "The endpoints are undocumented and Anthropic-internal. They power claude.ai/settings/usage. Field names can change in any release. ClaudeMeter deserializes into explicit Rust structs (UsageResponse, OverageResponse in src/models.rs), so a schema change surfaces as a parse error rather than silent corruption. The seven bucket names on /usage (five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork) and the seven fields on /overage_spend_limit (is_enabled, monthly_credit_limit, used_credits, currency, disabled_reason, disabled_until, out_of_credits) were stable through 2026-05-04. The repo is open-source MIT, so a same-day patch lands when the wire shifts and you pull the next brew release.",
  },
  {
    q: "Where is the canonical authoritative source for what these fields mean?",
    a: "There is none from Anthropic; the endpoints are internal. The closest thing to a canonical source is the open-source Rust struct in src/models.rs at github.com/m13v/claude-meter, which is reverse-engineered from the live JSON the Settings page renders against. Verify by opening DevTools on claude.ai/settings/usage, copying the response of /api/organizations/{org}/overage_spend_limit, and matching it against the OverageResponse struct. If the two diverge, the repo is the lagging side and lands a patch within a release cycle.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Max weekly quota enforcement", url: PAGE_URL },
];

const gate1Output = [
  { type: "command" as const, text: "$ claude-meter   # Gate 1: five_hour at the cap" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour          100.0% used    -> resets Mon May 4 18:00 (in 2h)" },
  { type: "output" as const, text: "7-day all        47.0% used    -> resets Sun May 10 09:00 (in 5d 17h)" },
  { type: "output" as const, text: "7-day Sonnet     31.0% used" },
  { type: "output" as const, text: "7-day Opus       58.0% used" },
  { type: "error" as const, text: "Next prompt 429s. Wait 2 hours, 5h resets, 7d bucket survives intact." },
];

const gate2Output = [
  { type: "command" as const, text: "$ claude-meter   # Gate 2: seven_day at the cap" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           18.0% used    -> resets Mon May 4 22:00 (in 6h)" },
  { type: "output" as const, text: "7-day all       100.0% used    -> resets Wed May 6 11:00 (in 1d 19h)" },
  { type: "output" as const, text: "7-day Sonnet     74.0% used" },
  { type: "output" as const, text: "7-day Opus       96.0% used" },
  { type: "error" as const, text: "5h is fresh and the next prompt still 429s. Weekly bucket carries the gate now. ETA Wednesday." },
];

const gate3Output = [
  { type: "command" as const, text: "$ claude-meter   # Gate 3: metered cap reached" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           37.0% used    -> resets Mon May 4 20:00 (in 4h)" },
  { type: "output" as const, text: "7-day all        62.0% used    -> resets Sun May 10 09:00 (in 5d 17h)" },
  { type: "output" as const, text: "Extra usage     $200.00 / $200.00 (100%)  BLOCKED until Sun May 14" },
  { type: "error" as const, text: "Both rolling windows look green. The cap is what blocks now. Source: out_of_credits: true on /overage_spend_limit." },
];

const overageStruct = `// claude-meter/src/models.rs lines 30-40
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverageResponse {
    pub is_enabled:           bool,
    pub monthly_credit_limit: Option<i64>,                   // cents
    pub currency:             Option<String>,
    pub used_credits:         Option<f64>,                   // cents
    pub disabled_reason:      Option<String>,                // why locked
    pub disabled_until:       Option<chrono::DateTime<Utc>>, // until when
    #[serde(default)]
    pub out_of_credits:       bool,                          // BLOCKED flag
}

// out_of_credits is the actual enforcement boolean. When the
// metered cap trips, this flips true on the next response from
// /api/organizations/{org_uuid}/overage_spend_limit and stays
// true until disabled_until passes (cycle rollover) or an admin
// raises monthly_credit_limit on the Settings page.`;

const usageStruct = `// claude-meter/src/models.rs lines 18-28
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:            Option<Window>,
    pub seven_day_sonnet:     Option<Window>,
    pub seven_day_opus:       Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,                              // 0.0-1.0 or 0-100
    pub resets_at:   Option<chrono::DateTime<chrono::Utc>>,
}

// utilization >= 1.0 (or >= 100 if the server shipped the field
// in the 0-100 scale) is the soft enforcement signal for Gates 1
// and 2. The badge code in extension/background.js normalizes
// both scales with: u <= 1 ? u * 100 : u`;

const dualFetch = `// claude-meter/src/api.rs lines 16-45
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

// Two GETs, sequential, both cookie-authenticated. The first is
// required (Gates 1 and 2 source). The second is optional (Gate 3
// source; free orgs 404). The merge happens ten lines down into a
// single UsageSnapshot so the popup, menu bar, and CLI all read
// from one struct.`;

const gateRows = [
  {
    feature: "Endpoint",
    ours: "/api/organizations/{org}/usage",
    competitor: "/api/organizations/{org}/overage_spend_limit",
  },
  {
    feature: "Required for Max plan?",
    ours: "Yes (always returned)",
    competitor: "Only if metered billing is enabled (404 otherwise)",
  },
  {
    feature: "Gate signal",
    ours: "five_hour.utilization >= 1.0  OR  seven_day.utilization >= 1.0",
    competitor: "out_of_credits == true",
  },
  {
    feature: "Reset field",
    ours: "five_hour.resets_at  /  seven_day.resets_at (ISO 8601)",
    competitor: "disabled_until (ISO 8601)",
  },
  {
    feature: "Reset cadence",
    ours: "5h rolling  /  168h rolling from first message",
    competitor: "Billing cycle boundary",
  },
  {
    feature: "Visible on /settings/usage?",
    ours: "Yes, as two progress bars",
    competitor: "Yes, as a BLOCKED banner with prose",
  },
  {
    feature: "Visible to local-log tools (ccusage)?",
    ours: "No (no HTTP call to claude.ai)",
    competitor: "No (no HTTP call to claude.ai)",
  },
  {
    feature: "Polled by ClaudeMeter",
    ours: "Every 60 seconds (POLL_MINUTES = 1)",
    competitor: "Every 60 seconds, same loop",
  },
];

const enforcementSteps = [
  {
    title: "Gate 1: the 5-hour rolling window",
    description:
      "five_hour.utilization climbs from 0 to 1.0 across the rolling 5 hours since your first message of the window. The cap is reached when the float crosses 1.0 (or 100 if the server shipped the 0-100 scale). Anthropic returns 429 on the next prompt and quotes the resets_at timestamp on /settings/usage. This gate hits Max users running tight Claude Code agentic loops first; you can ride it out without losing weekly quota.",
  },
  {
    title: "Gate 2: the 7-day weekly bucket",
    description:
      "seven_day.utilization is the cumulative spend across the rolling 168-hour window. It does not reset when 5-hour resets; the two clocks are independent. Reaching seven_day.utilization >= 1.0 is the gate most people mean when they say 'weekly limit reached.' On Max it can hit by Tuesday on a heavy refactor week. The endpoint also returns seven_day_sonnet and seven_day_opus, so you can see which model carried the spend.",
  },
  {
    title: "Gate 3: metered billing cap (only if enabled)",
    description:
      "If your Max workspace has metered billing turned on, blowing past Gate 2 hands off to a pay-as-you-go cap on /api/organizations/{org}/overage_spend_limit. used_credits ticks up against monthly_credit_limit (both in cents). When used_credits hits the cap, out_of_credits flips to true and disabled_until carries the cycle-boundary timestamp. The rolling windows can look green during this state. The boolean is the only single-field signal that the cap is enforcing right now.",
  },
];

const identifyChecklist = [
  {
    text: "Open the menu bar dropdown. Look at the percent column. The row at or above 100 percent is the active gate. If two rows are above 100, the slowest reset wins.",
  },
  {
    text: "If 5-hour is hot and 7-day is green, you are at Gate 1. Wait until five_hour.resets_at. The 7-day bucket is intact when you come back.",
  },
  {
    text: "If 7-day is hot and 5-hour is green or recently reset, you are at Gate 2. Wait until seven_day.resets_at. New work counts against the next weekly cycle.",
  },
  {
    text: "If both windows are green and the next prompt still 429s, scroll to the Extra usage row. A BLOCKED suffix and a 'until <date>' tail mean Gate 3 fired. The rolling windows are not the cause; metered billing is.",
  },
  {
    text: "If you do not see an Extra usage row at all, your org does not have metered billing turned on. The 7-day bucket is the hardest gate you can hit. Plan around seven_day.resets_at, not a dollar cap that does not exist.",
  },
  {
    text: "If two rows look near the cap at the same time and you cannot tell which one will fire next, watch the slope between two 60-second polls. The faster-climbing percent is the gate that will hit first; the slower one stays a warning.",
  },
];

const installSteps = [
  {
    title: "Install the menu bar app",
    description:
      "brew install --cask m13v/tap/claude-meter. Cask installs ClaudeMeter.app under /Applications and registers a launch agent so the menu bar icon comes back after reboot. CLI lives at /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter.",
  },
  {
    title: "Load the browser extension",
    description:
      "Clone github.com/m13v/claude-meter, open chrome://extensions (or arc://, brave://, edge://), enable Developer mode, click 'Load unpacked', pick the extension/ folder. The extension makes the cookie-authenticated GETs against claude.ai with credentials: 'include'. No manual cookie paste.",
  },
  {
    title: "Visit claude.ai once",
    description:
      "Sign in to claude.ai if you are not already. The extension reads your session cookie and starts polling /api/organizations/{org}/usage and /api/organizations/{org}/overage_spend_limit on a 60-second tick. The badge lights up within one minute.",
  },
  {
    title: "Watch which row carries the gate",
    description:
      "Three rows in the dropdown: 5-hour, 7-day, Extra usage. Whichever one tips into BLOCKED state first is the gate enforcing right now. The others are warnings.",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Max weekly quota enforcement: three gates, two endpoints, one BLOCKED string",
  description:
    "Weekly quota enforcement on Claude Max is not one wall. It is three sequential gates carried by two undocumented server endpoints. Here is the schema, the boolean, and the open-source way to read it live.",
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
    title: "Claude extra usage balance: the dollar line on /settings/usage",
    excerpt:
      "What used_credits / monthly_credit_limit and the BLOCKED suffix actually mean, line by line.",
    href: "/t/claude-extra-usage-balance",
    tag: "Reference",
  },
  {
    title: "Claude weekly limit by Tuesday: it's a 168-hour clock",
    excerpt:
      "The seven_day bucket starts at your first message and ends 168 hours later, not Sunday at midnight.",
    href: "/t/claude-weekly-limit-by-tuesday",
    tag: "Guide",
  },
  {
    title: "Claude Max weekly quota tightening: the 5-hour decay shifted",
    excerpt:
      "The change everyone calls a weekly tightening is actually a 5-hour bucket weight change. Endpoint proof.",
    href: "/t/claude-max-weekly-quota-tightening",
    tag: "Analysis",
  },
];

export default function ClaudeMaxWeeklyQuotaEnforcementPage() {
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
          Claude Max <GradientText>weekly quota enforcement</GradientText> is
          three gates, two endpoints, one BLOCKED string
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Most articles on this describe one wall. The server actually enforces
          a Max plan through three gates in sequence. Two of them live on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>
          . The third lives on a separate endpoint,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/overage_spend_limit
          </code>
          , and only fires if you turned metered billing on. This page walks
          all three with the exact field that flips at each gate.
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
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-04)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            Anthropic enforces the Claude Max weekly quota through three
            sequential server-side gates. Gate 1:{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              five_hour.utilization &gt;= 1.0
            </code>{" "}
            on the usage endpoint. Gate 2:{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day.utilization &gt;= 1.0
            </code>{" "}
            on the same endpoint. Gate 3:{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              out_of_credits == true
            </code>{" "}
            on{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /api/organizations/&#123;org&#125;/overage_spend_limit
            </code>
            , only if your workspace has metered billing turned on. Each gate
            returns a{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              resets_at
            </code>{" "}
            (or{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              disabled_until
            </code>
            ) timestamp you can read before it fires. The free open-source way
            to watch all three live is{" "}
            <a
              href="https://github.com/m13v/claude-meter"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              ClaudeMeter
            </a>
            , source verified at{" "}
            <a
              href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              src/models.rs
            </a>
            . Authoritative dashboard:{" "}
            <a
              href="https://claude.ai/settings/usage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              claude.ai/settings/usage
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The three gates, in order
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          On a Max plan with metered billing enabled, every prompt goes through
          three checks in sequence. If any one of them rejects, the prompt is
          rejected. Most online guides describe Gate 2 only, because that is
          the one users name &ldquo;the weekly limit.&rdquo; Gates 1 and 3 are
          the silent ones; Gate 1 hits earliest in a heavy session, Gate 3 is
          the one that sneaks up when both rolling windows look green.
        </p>
        <StepTimeline steps={enforcementSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Gate 1: 5-hour at the cap
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The 5-hour bucket is the fastest-moving counter. On a tight Claude
          Code agentic loop with Sonnet, you can cross{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          in a couple of hours. The endpoint returns the float; ClaudeMeter
          normalizes 0-1 vs 0-100 scale (both are shipped in the same payload)
          and renders the row.
        </p>
        <TerminalOutput
          title="claude-meter, Gate 1 active"
          lines={gate1Output}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The good news at this gate: the 7-day bucket is barely touched.
          Sit out the 2 hours,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.resets_at
          </code>{" "}
          ticks over, and you keep the rest of the weekly cycle. The bad news:
          a Max user who is paying for the plan because they want unbounded
          throughput sees this as their main day-to-day enforcement boundary.
          The menu bar shows the percent climbing on every poll, so you know
          whether you have time to start one more big task.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Gate 2: 7-day at the cap
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Cross{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day.utilization &gt;= 1.0
          </code>{" "}
          and you are out for the rest of the rolling 168 hours. The clock
          started with your first message of the cycle, not at calendar
          midnight, so &ldquo;week&rdquo; here means literally 7 times 24
          hours from message zero. The reset timestamp lives at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day.resets_at
          </code>{" "}
          on the same response.
        </p>
        <TerminalOutput
          title="claude-meter, Gate 2 active"
          lines={gate2Output}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The 5-hour row being green and the 7-day row being hot is the
          tell-tale shape of Gate 2. People misread this as a 5-hour issue
          (&ldquo;but I just reset!&rdquo;); the percent column makes it
          obvious that the weekly counter is the one carrying the gate. The
          per-model rows (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_sonnet
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>
          ) tell you which model carried the spend. Heavy Opus users with
          tight reasoning loops usually see seven_day_opus near the cap before
          the all-up row.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Gate 3: metered cap, the silent one
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          This is the gate that catches people. On Max with metered billing
          turned on, going past Gate 2 hands off to a pay-as-you-go cap. Your
          rolling windows reset on their normal cadence, but{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            used_credits
          </code>{" "}
          ticks up against{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            monthly_credit_limit
          </code>{" "}
          on a separate endpoint. When that hits 100 percent,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>{" "}
          flips to true and the next prompt 429s with both rolling windows
          looking green.
        </p>
        <TerminalOutput
          title="claude-meter, Gate 3 active"
          lines={gate3Output}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The shape is the trap: 5-hour green at 37 percent, 7-day green at 62
          percent, and you cannot send. The Extra usage row carries a{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            BLOCKED until &lt;date&gt;
          </code>{" "}
          suffix because{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            disabled_until
          </code>{" "}
          is set on the response. claude.ai/settings/usage shows a banner
          above the bars; the menu bar shows the same fact in one row, beside
          the rolling windows it does not blame.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The schema each gate sources from
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Two endpoints. Two structs. The boolean that flips at Gate 3 lives on
          the second one. The rolling-window utilizations that flip at Gates 1
          and 2 live on the first.
        </p>
        <AnimatedCodeBlock
          code={usageStruct}
          language="rust"
          filename="src/models.rs (usage endpoint)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          And the dedicated billing-state endpoint:
        </p>
        <AnimatedCodeBlock
          code={overageStruct}
          language="rust"
          filename="src/models.rs (overage endpoint)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The diff between the two is what makes Gate 3 invisible to anyone
          reading only the usage endpoint:{" "}
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
          </code>{" "}
          ship only on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /overage_spend_limit
          </code>
          . If you are building a tracker on the usage endpoint alone, you
          have no way to render the BLOCKED state.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              Two endpoints feed one snapshot
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Both calls go out per poll, both with your existing claude.ai
              cookies, and the merge happens client-side.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <AnimatedBeam
              from={[
                { label: "/usage", sublabel: "Gates 1 + 2" },
                { label: "/overage_spend_limit", sublabel: "Gate 3" },
              ]}
              hub={{ label: "UsageSnapshot" }}
              to={[
                { label: "Menu bar dropdown" },
                { label: "Browser popup" },
                { label: "claude-meter CLI" },
              ]}
              title="Two GETs, one snapshot, three surfaces"
            />
          </div>
          <p className="text-zinc-600 max-w-3xl mx-auto mt-6 text-center">
            Whichever surface you read, you read the same merged{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              UsageSnapshot
            </code>
            . The merge step is the only place all three gates appear in the
            same struct.
          </p>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The fetch loop that pulls both
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Sequential, both with cookie auth, both wrapped in match arms so a
          missing endpoint surfaces a warning instead of a panic. The order
          matters: usage is required (Gates 1 and 2), overage is optional
          (Gate 3, free orgs 404).
        </p>
        <AnimatedCodeBlock
          code={dualFetch}
          language="rust"
          filename="src/api.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The same pattern lives in the browser extension at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extension/background.js
          </code>{" "}
          line 22-30, with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            credentials: &lsquo;include&rsquo;
          </code>{" "}
          on the fetch. That is what makes the &ldquo;no manual cookie
          paste&rdquo; bit work: the extension already has the claude.ai
          cookies because the browser is already logged in. The Rust side
          re-uses them by reading the browser cookie store.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Gate 1+2 endpoint vs Gate 3 endpoint
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Same auth, same poll cadence, different fields, different reset
          clocks. The right column is the one most articles never mention.
        </p>
        <ComparisonTable
          productName="usage endpoint (Gates 1 + 2)"
          competitorName="overage_spend_limit (Gate 3)"
          rows={gateRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          How to identify which gate is enforcing right now
        </h2>
        <AnimatedChecklist
          title="A 6-step read of the menu bar dropdown"
          items={identifyChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The numbers behind the boundary
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              All readable straight from the source repo. Nothing invented.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 3, label: "sequential gates a Max user can hit" },
              { value: 2, label: "claude.ai endpoints joined per snapshot" },
              { value: 60, suffix: "s", label: "polling cadence (POLL_MINUTES = 1)" },
              { value: 7, label: "rolling buckets returned by /usage" },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why local-log tools cannot show enforcement
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              ccusage and Claude-Code-Usage-Monitor read{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ~/.claude/projects/&lt;project&gt;/&lt;session&gt;.jsonl
              </code>{" "}
              and sum input + output tokens against the public model price
              card. Useful, faithful, and entirely local-truth. None of those
              token counts carry the bucket Anthropic charged the request to,
              the peak-hour multiplier the server applied, or the
              metered-billing flag that flips at Gate 3. There is no HTTP call
              to claude.ai in either tool, so there is no way for them to read{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                out_of_credits
              </code>
              . They were not built for this; that is fine. But on a Max plan
              the enforcement boundary is server-side, and only a server-truth
              reader can show you what is currently blocking.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              Run them side by side. ccusage tells you what tokens you spent
              locally; ClaudeMeter tells you which gate the server is
              enforcing. The two ledgers are complementary; the numbers do not
              match because they measure different things.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Verify the schema yourself
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The endpoints are undocumented. The way to confirm is to open
          DevTools on{" "}
          <a
            href="https://claude.ai/settings/usage"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            claude.ai/settings/usage
          </a>
          , filter the Network tab on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            usage
          </code>
          , and read the JSON response. The two requests you care about are{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET /api/organizations/&#123;org_uuid&#125;/overage_spend_limit
          </code>
          . The first should match{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            UsageResponse
          </code>{" "}
          field-for-field. The second should match{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            OverageResponse
          </code>{" "}
          field-for-field, including the three Gate 3 fields. If the wire
          shape ever shifts, the open-source repo is the lagging side and you
          can open an issue at{" "}
          <a
            href="https://github.com/m13v/claude-meter"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            github.com/m13v/claude-meter
          </a>
          .
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Install and start watching
        </h2>
        <StepTimeline steps={installSteps} />
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Hitting an enforcement gate and want a second pair of eyes on the JSON?"
          description="Book a 15 minute call. Happy to walk through which gate is firing, the field that flipped, and what the resets_at is telling you."
          text="Book a 15-minute call"
          section="weekly-quota-enforcement-footer"
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
        description="Walk the JSON for which gate is firing. 15 min."
        section="weekly-quota-enforcement-sticky"
        site="claude-meter"
      />
    </article>
  );
}
