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
  AnimatedBeam,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-rate-limit-dashboard";
const PUBLISHED = "2026-04-29";

export const metadata: Metadata = {
  title:
    "Claude Rate Limit Dashboard for Pro and Max: What It Has To Render, Field by Field",
  description:
    "Anthropic does not ship a rate-limit dashboard to individual Pro and Max subscribers. The Console analytics surface is Team and Enterprise only. So a real Pro/Max rate-limit dashboard has to be assembled from claude.ai/settings/usage. Walking the eight floats, the color thresholds (RGB 219,118,32 at 90 percent and RGB 215,58,73 at 100 percent), the multi-account tile composition, and the localhost bridge on 127.0.0.1:63762 that wires a browser extension into a native menu bar.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Rate Limit Dashboard for Pro and Max: What It Has To Render, Field by Field",
    description:
      "No first-party Claude rate-limit dashboard exists for Pro/Max. Walking what one has to render: the eight utilization floats, the RGB color thresholds at 90 and 100 percent, the multi-account tile composition, and the localhost bridge to wire it together. Source code with line numbers from menubar.rs and popup.js.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com/" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "Claude rate limit dashboard",
    url: PAGE_URL,
  },
];

const faqs = [
  {
    q: "Does Anthropic ship a rate-limit dashboard for Pro and Max users?",
    a: "No. The Claude Console analytics surface (activity, suggestion accept rate, lines-of-code accepted, spend) is documented as available to Team and Enterprise seats only. Individual Pro and Max subscribers see claude.ai/settings/usage, which renders four bars (5-hour, 7-day, 7-day Sonnet, 7-day Opus) but no analytics view, no per-prompt history, no projection. The endpoint that backs that page (GET /api/organizations/{org_uuid}/usage) returns eight utilization floats, so a third-party dashboard that re-renders the same payload locally has more to work with than the Settings page does.",
  },
  {
    q: "What does a Claude rate-limit dashboard for Pro/Max actually have to render?",
    a: "Per account: the four utilization bars Anthropic also renders (5-hour, 7-day, 7-day Sonnet, 7-day Opus), each paired with its own resets_at countdown. Plus the extra_usage block (utilization, used credits in dollars, monthly limit if set, and a BLOCKED flag when out_of_credits is true). Plus the subscription block (status, next_charge_date, payment method last4 if you want to surface a billing-failure case). The dashboard then needs a top-line summary chip you can read at a glance from a menu bar or browser toolbar without expanding anything; that chip has to compress two numbers (5-hour percent, 7-day percent) into a six-character format and color-code them when they cross thresholds.",
  },
  {
    q: "What color thresholds should the dashboard use?",
    a: "ClaudeMeter's bg_for() function at src/bin/menubar.rs lines 942-950 picks three states: utilization >= 100.0 paints RGB (215, 58, 73), a saturated red. Utilization >= 90.0 paints RGB (219, 118, 32), an orange. Below 90 paints no background (the chip stays plain text). The popup uses a related rule with a different threshold: extension/popup.css declares .bar.warn { background: #b26a00 } at >= 80 percent and .bar.hot { background: #b00020 } at >= 100 percent. The 80 percent threshold catches you a tier earlier on the bar view because the bar is a compositional unit, not a glance unit; the menu-bar chip waits until 90 because a chip in the corner of your screen flashing orange at 80 percent is noise.",
  },
  {
    q: "Why does the Pro/Max rate-limit dashboard need a localhost bridge?",
    a: "Because the data lives in two places. The browser extension can call /api/organizations/{org_uuid}/usage with credentials: 'include' (the user's already-logged-in claude.ai cookies are attached automatically), but a native menu-bar app cannot. A native app sees the macOS keychain and the system network stack but has no way to ride the browser's session. ClaudeMeter solves that by running a tiny tiny_http server on 127.0.0.1:63762 (BRIDGE_PORT in src/bin/menubar.rs line 349) that accepts POST /snapshots from the extension. The extension polls the API, posts the parsed snapshot to the bridge, and the menu bar redraws. No cookie ever leaves your machine; the bridge only listens on the loopback interface.",
  },
  {
    q: "How does the dashboard handle multiple Claude accounts?",
    a: "Each snapshot keys on (browser, account email). The merge logic at src/bin/menubar.rs lines 840-895 walks each new snapshot, finds the matching persisted entry by that key, and prefers the fresher one (or the live one over a stale one). The menu bar then renders one Submenu per surviving snapshot, with the email or org_uuid as the submenu label. The top-line title chip switches format: a single-account user sees '5h 92% · 7d 45%', a multi-account user sees 'M: 5h 92% · 7d 45%     P: 5h 30% · 7d 12%', where 'M' and 'P' are the first letter of each account email (account_tag at lines 952-958).",
  },
  {
    q: "Where does the data on the dashboard come from?",
    a: "Three endpoints on claude.ai, fetched per account: GET /api/organizations/{org_uuid}/usage returns the eight utilization floats and their resets_at timestamps. GET /api/organizations/{org_uuid}/usage/overage returns the extra_usage block (out_of_credits, used_credits, monthly_credit_limit, disabled_until). GET /api/organizations/{org_uuid}/subscription returns subscription status and next charge date. ClaudeMeter parses the three responses into a single UsageSnapshot struct (src/models.rs lines 60-73) and the dashboard renders all three side by side. A 429 can fire because of any of the three: a saturated 5-hour float, a tripped weekly opus float, or extra_usage.utilization at 1.0 with overage enabled.",
  },
  {
    q: "Why does claude.ai/settings/usage show four bars when the payload has eight floats?",
    a: "Because the Settings page is a plan-summary view, not a debugging view. It picks the four floats most users care about (five_hour, seven_day, seven_day_sonnet, seven_day_opus) and skips three weekly buckets that are rarely the gating limit (seven_day_oauth_apps, seven_day_omelette, seven_day_cowork) plus the extra_usage utilization float. The full eight-float payload is still in the response body if you open DevTools on that page; the page just does not render the back four. A self-hosted dashboard can render whatever subset its surface can hold.",
  },
  {
    q: "Can I read the Claude rate-limit dashboard data from the command line?",
    a: "Yes. /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json prints the parsed UsageSnapshot to stdout in JSON. /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter (no flag) prints a human-formatted block via the format_window() function at src/format.rs lines 75-98, which renders each window as 'X.X% used    -> resets <local clock> (in Nh)'. The same data is reachable over the bridge: curl http://127.0.0.1:63762/snapshots returns the live snapshot the menu bar is currently drawing.",
  },
  {
    q: "How often does the dashboard refresh?",
    a: "The browser extension's chrome.alarms tick is set to POLL_MINUTES = 1 (extension/background.js). One full poll per minute, every minute, while the browser is awake. The native menu bar refreshes whenever the bridge accepts a new snapshot, plus an internal poll loop at the same one-minute cadence as a fallback. There is no exponential backoff, no on-focus poll, no jitter; the cadence is fixed because the rolling window is a sliding boundary and you want the countdown to re-derive at a predictable interval.",
  },
  {
    q: "What does the 'BLOCKED' state on the extra-usage line mean?",
    a: "It means out_of_credits in the OverageResponse came back true. ClaudeMeter renders that as the literal string '  BLOCKED' appended to the dollar line (src/format.rs lines 26 and 30, src/bin/menubar.rs line 710). It is the case where the user has enabled metered billing, has consumed the entire monthly_credit_limit, and Anthropic is now refusing overage-billed calls until disabled_until passes (or the user raises the limit). The 5-hour and 7-day bars can still look green in this state; the dashboard surfaces it specifically because a green bar plus a BLOCKED line is the harshest debugging case in the whole UI.",
  },
];

const dashboardTiles = [
  {
    title: "Tile body: four utilization rows",
    description:
      "build_menu in src/bin/menubar.rs lines 661-749 walks each snapshot and appends one disabled menu line per non-null Window: 5-hour, 7-day, 7-day Sonnet, 7-day Opus. Each line is '<bucket name>  <pct>%<reset suffix>'. Missing fields are skipped, never rendered as zero, because seven_day_sonnet on a fresh account that has never used Sonnet returns null and a zero bar would be misleading.",
  },
  {
    title: "Tile body: extra-usage dollar line",
    description:
      "Lines 708-723. The overage block becomes 'Extra        $X.XX / $Y.YY (Z%)' if monthly_credit_limit is set, or 'Extra        $X.XX used (no cap)' if it is not. If out_of_credits is true, '  BLOCKED' is appended. If disabled_until is set, ' until <Mon Day>' is added. This is the line that catches the green-bars-but-still-rate-limited case the user actually walks into mid-refactor.",
  },
  {
    title: "Tile footer: errors block",
    description:
      "Lines 725-731. Any backend error string captured during fetch is appended after a separator, truncated to 80 characters. This is intentional dashboard noise: it is louder to render the parse error than to drop the field silently, because a silent field at 0 percent reads as 'plenty of headroom' when the truth is 'we did not check'.",
  },
  {
    title: "Tile footer: jump-to-Settings link",
    description:
      "Lines 733-739. Every tile ends with a 'Open claude.ai/settings/usage' menu item that opens the URL in the default browser. The dashboard is not trying to replace the Settings page; it is trying to be the surface you watch all day. When you need the official page (history, billing portal, plan management), one click from the tile takes you there.",
  },
  {
    title: "Tile footer: forget-this-account button",
    description:
      "Lines 741-744. If the snapshot is stale (no fresh data for two minutes), the tile renders a 'Forget this account' option. That removes it from the persisted snapshots.json so a one-off account you logged into once does not haunt your menu bar forever. Stale tiles do not count toward the title chip; only live snapshots do (title_segments line 965).",
  },
];

const colorThresholdCode = `// src/bin/menubar.rs lines 942-950
fn bg_for(util: f64) -> Option<(u8, u8, u8)> {
    if util >= 100.0 {
        Some((215, 58, 73))      // saturated red, "you are 429ing"
    } else if util >= 90.0 {
        Some((219, 118, 32))     // orange, "you are within one big prompt"
    } else {
        None                     // no background, "you are fine"
    }
}

// extension/popup.css lines 67-69 (the bar view, slightly different bands)
// .bar.warn > span { background: #b26a00; }   /* >= 80% */
// .bar.hot  > span { background: #b00020; }   /* >= 100% */`;

const tileBuildCode = `// src/bin/menubar.rs lines 671-749 (abridged)
for (i, s) in snaps.iter().enumerate() {
    let label = account_label(s);
    let sub = Submenu::new(label, true);

    if let Some(u) = s.usage.as_ref() {
        if let Some(w) = u.five_hour.as_ref() {
            sub.append(&disabled(&format!(
                "5-hour       {:>5.1}%{}",
                w.utilization,
                reset_suffix(w.resets_at)
            ))).ok();
        }
        if let Some(w) = u.seven_day.as_ref()       { /* "7-day all   ..." */ }
        if let Some(w) = u.seven_day_sonnet.as_ref(){ /* "7-day Sonnet ..." */ }
        if let Some(w) = u.seven_day_opus.as_ref()  { /* "7-day Opus  ..." */ }
    }

    if let Some(ov) = s.overage.as_ref() {
        let used = ov.used_credits.unwrap_or(0.0) / 100.0;
        let blocked = if ov.out_of_credits { "  BLOCKED" } else { "" };
        // "Extra        $X.XX / $Y.YY (Z%)<blocked>"
        sub.append(&disabled(&line)).ok();
    }

    sub.append(&PredefinedMenuItem::separator()).ok();
    let open = MenuItem::new("Open claude.ai/settings/usage", true, None);
    sub.append(&open).ok();

    menu.append(&sub).ok();
}`;

const titleBarCode = `// src/bin/menubar.rs lines 991-1010 (single-account branch)
if live.len() == 1 {
    let s = live[0];
    let five  = util_five(s);
    let seven = util_seven(s);
    match fmt {
        TitleFormat::Long   => segs.push(TitleSeg { text: "Claude  5h ".into(), bg: None }),
        TitleFormat::Medium => segs.push(TitleSeg { text: "5h ".into(),         bg: None }),
        TitleFormat::Compact => {} // bare percent
    }
    segs.push(TitleSeg { text: format!("{:.0}%", five),  bg: bg_for(five) });
    segs.push(TitleSeg { text: " · ".into(),             bg: None });
    if matches!(fmt, TitleFormat::Long | TitleFormat::Medium) {
        segs.push(TitleSeg { text: "7d ".into(),         bg: None });
    }
    segs.push(TitleSeg { text: format!("{:.0}%", seven), bg: bg_for(seven) });
}
// Result on a healthy day:    "5h 42% · 7d 31%"
// Result mid-refactor:         "5h 92% · 7d 61%"  (5h chip painted orange)
// Result at the wall:          "5h 100% · 7d 84%" (5h chip painted red)`;

const bridgeRouteCode = `// src/bin/menubar.rs lines 349-432 (abridged)
const BRIDGE_PORT: u16 = 63762;
const BRIDGE_FRESHNESS: Duration = Duration::from_secs(120);

fn bridge_loop(
    proxy: EventLoopProxy<AppEvent>,
    last_bridge: Arc<Mutex<Option<Instant>>>,
) {
    let server = Server::http(format!("127.0.0.1:{BRIDGE_PORT}"))?;

    for mut req in server.incoming_requests() {
        if req.method() == &Method::Options { /* CORS preflight */ continue; }
        if req.method() != &Method::Post || req.url() != "/snapshots" {
            // 404 anything that is not POST /snapshots
            continue;
        }

        // Identify which browser sent this by looking up the peer port owner via lsof.
        let detected_browser = req
            .remote_addr()
            .and_then(peer_browser_by_port)
            .or_else(|| detect_browser_from_headers(req.headers()));

        // Body is a JSON array of UsageSnapshot. Re-stamp each snapshot with the
        // detected browser, then push to the menu-bar event loop for re-render.
        match serde_json::from_str::<Vec<UsageSnapshot>>(&body) {
            Ok(mut snaps) => {
                if let Some(name) = detected_browser.as_deref() {
                    for s in &mut snaps { s.browser = name.to_string(); }
                }
                proxy.send_event(AppEvent::Snapshots(Ok(snaps)))?;
            }
            Err(e) => { /* return 400 */ }
        }
    }
}`;

const cliSession = [
  {
    type: "command" as const,
    text: "/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter",
  },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  {
    type: "output" as const,
    text: "5-hour            92.0% used    -> resets Mon Apr 29 19:36 (in 22m)",
  },
  {
    type: "output" as const,
    text: "7-day all         61.0% used    -> resets Sat May 4 02:11 (in 4d 7h)",
  },
  {
    type: "output" as const,
    text: "7-day Sonnet      48.0% used    -> resets Fri May 3 18:02 (in 3d 23h)",
  },
  {
    type: "output" as const,
    text: "7-day Opus        78.0% used    -> resets Sat May 4 08:14 (in 4d 13h)",
  },
  {
    type: "output" as const,
    text: "Extra usage      $4.20 / $20.00 (21%)",
  },
  {
    type: "output" as const,
    text: "Next charge       2026-05-22   visa **0042",
  },
  { type: "output" as const, text: "" },
  {
    type: "output" as const,
    text: "fetched 2026-04-29 14:14:02 PDT   matt@example.com via Chrome   org 8b2e...",
  },
  {
    type: "success" as const,
    text: "Same data as the menu bar tile, scriptable. Pipe it to Slack, Starship, tmux.",
  },
];

const consoleVsLocal = [
  {
    feature: "Available to Pro/Max individual subscribers",
    ours: "Yes (third-party, MIT-licensed)",
    competitor: "No (Team/Enterprise only)",
  },
  {
    feature: "Where the dashboard lives",
    ours: "macOS menu bar, browser toolbar, CLI",
    competitor: "Web app behind console.anthropic.com login",
  },
  {
    feature: "Refresh cadence",
    ours: "60 seconds, fixed",
    competitor: "Page reload",
  },
  {
    feature: "Multi-account view",
    ours: "One tile per (browser, account) pair",
    competitor: "One org per signed-in seat",
  },
  {
    feature: "Renders the 5-hour rolling window",
    ours: "Yes, with countdown to resets_at",
    competitor: "No, only weekly aggregates and spend",
  },
  {
    feature: "Renders the extra_usage BLOCKED state",
    ours: "Yes, painted into the tile and the title chip",
    competitor: "Spend overage shows on billing page, not the analytics view",
  },
  {
    feature: "Data source",
    ours: "Same JSON the Settings page calls",
    competitor: "Anthropic's analytics aggregations",
  },
  {
    feature: "Cost",
    ours: "Free (MIT licensed)",
    competitor: "Bundled into Team/Enterprise plan price",
  },
];

const dataFlowFrom = [
  { label: "claude.ai", sublabel: "/api/organizations/{org}/usage" },
  { label: "claude.ai", sublabel: "/api/organizations/{org}/usage/overage" },
  { label: "claude.ai", sublabel: "/api/organizations/{org}/subscription" },
];

const dataFlowHub = {
  label: "Browser extension",
  sublabel: "credentials: 'include'",
};

const dataFlowTo = [
  { label: "Popup view", sublabel: "extension/popup.js" },
  { label: "Menu bar tile", sublabel: "127.0.0.1:63762/snapshots" },
  { label: "CLI / scripts", sublabel: "claude-meter --json" },
];

const relatedPosts = [
  {
    href: "/t/claude-code-4-7-rate-limit",
    title: "Claude Code 4.7 rate limit: eight floats, four hidden",
    excerpt:
      "The /usage payload returns eight utilization floats. The Settings page renders only four of them. Field names, file paths, why a 4.7 session 429s while bars look green.",
    tag: "Mechanics",
  },
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "Local counter vs server quota: why ccusage and claude.ai disagree",
    excerpt:
      "Why ccusage at 5 percent and claude.ai at rate-limited are both correct. They are reading two different sources.",
    tag: "Compare",
  },
  {
    href: "/t/claude-pro-5-hour-window-tracker",
    title: "A 5-hour window tracker is mostly a countdown problem",
    excerpt:
      "The percent on its own is half information. Walking the resets_at humanization math, line by line.",
    tag: "Walkthrough",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude rate limit dashboard for Pro and Max: what it has to render, field by field",
  description:
    "No first-party rate-limit dashboard exists for individual Claude Pro and Max subscribers. What a real one has to render: eight utilization floats, RGB color thresholds at 90 and 100 percent, multi-account tile composition, localhost bridge.",
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

export default function ClaudeRateLimitDashboardPage() {
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
          The Claude rate limit dashboard for Pro and Max{" "}
          <GradientText>does not exist</GradientText>. Here is what a real one
          has to render.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Anthropic ships a rate-limit and usage analytics surface in the
          Console, but the Console analytics features are documented as Team
          and Enterprise only. Individual Pro and Max subscribers get
          claude.ai/settings/usage, which renders four bars from a payload that
          contains eight utilization floats. So &ldquo;a Claude rate limit
          dashboard&rdquo; for a Pro/Max user is something you assemble locally
          from the same JSON the Settings page calls. This page walks through
          what that dashboard has to render, field by field, with the exact
          rendering code from ClaudeMeter&rsquo;s menu bar app and browser
          extension.
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

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <GlowCard>
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold">
              Direct answer (verified 2026-04-29)
            </p>
            <p className="mt-3 text-zinc-900 text-lg leading-relaxed">
              No first-party rate-limit dashboard exists for individual Claude
              Pro and Max subscribers. The Console analytics surface (activity,
              acceptance rate, lines accepted, spend) is documented as Team and
              Enterprise only. The closest thing Pro/Max get is{" "}
              <a
                className="text-teal-700 underline"
                href="https://claude.ai/settings/usage"
              >
                claude.ai/settings/usage
              </a>
              , a four-bar settings page. The endpoint that backs it (
              <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-sm">
                GET /api/organizations/&#123;org_uuid&#125;/usage
              </code>
              ) returns eight utilization floats, so a third-party dashboard
              that reads the same payload locally has more to work with than
              the Settings page does. Documentation on rate-limit shape lives
              at{" "}
              <a
                className="text-teal-700 underline"
                href="https://platform.claude.com/docs/en/api/rate-limits"
              >
                platform.claude.com/docs/en/api/rate-limits
              </a>
              .
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Where the data has to come from
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Three endpoints on claude.ai, fetched per account, with the existing
          logged-in cookies. The browser extension is the only piece that can
          easily attach those cookies (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            credentials: &apos;include&apos;
          </code>{" "}
          on a same-origin request from inside the extension). A native menu
          bar app cannot ride that session directly, which is why a real
          dashboard has to bridge the two.
        </p>
      </section>

      <BackgroundGrid pattern="dots">
        <section className="max-w-5xl mx-auto px-6 py-12">
          <AnimatedBeam
            title="One poll, three endpoints, three render surfaces"
            from={dataFlowFrom}
            hub={dataFlowHub}
            to={dataFlowTo}
          />
        </section>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The eight floats the dashboard works with
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">UsageResponse</code>{" "}
          struct in src/models.rs lines 19-28 lists every utilization float
          Anthropic returns:
        </p>
        <AnimatedCodeBlock
          code={`// src/models.rs lines 19-28
pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:            Option<Window>,
    pub seven_day_sonnet:     Option<Window>,
    pub seven_day_opus:       Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,
}`}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Seven Window-typed fields plus an ExtraUsage block whose own
          utilization float is the eighth. The Settings page renders the
          first four. The back four (
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day_omelette
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            seven_day_cowork
          </code>
          , and{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            extra_usage.utilization
          </code>
          ) are present in the JSON but not in the UI. A self-hosted dashboard
          can render any subset its surface holds.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What goes in a single tile
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          A &ldquo;tile&rdquo; is one account. In the menu-bar dashboard, each
          tile is a native NSMenu submenu; in the popup, each tile is a div
          with an email header. The tile body is the same in both: four
          utilization rows, an extra-usage line, an errors block, and a footer.
        </p>
        <StepTimeline steps={dashboardTiles} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The exact code that renders one tile
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter does it like this:
        </p>
        <AnimatedCodeBlock
          code={tileBuildCode}
          language="rust"
          filename="claude-meter/src/bin/menubar.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          One{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            Submenu::new
          </code>{" "}
          per snapshot, one{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            disabled
          </code>{" "}
          line per non-null Window. Disabled means the line renders as a label,
          not a clickable item; the tile is for reading, not for picking. The
          per-row format string{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            {`{:>5.1}%`}
          </code>{" "}
          right-aligns the percent in five characters, so &ldquo;5.0%&rdquo;
          and &ldquo;100.0%&rdquo; line up vertically across rows. That
          alignment is the difference between a tile you read and a tile you
          squint at.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Color thresholds: the anchor of the whole dashboard
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The single most important rendering decision is when the menu-bar
          chip changes color. ClaudeMeter picks two thresholds, three states.
          The exact RGB triples are not arbitrary; they are the same red and
          orange most macOS system widgets use for warning and error states,
          tuned so the chip reads against both light and dark menu-bar
          backgrounds:
        </p>
        <AnimatedCodeBlock
          code={colorThresholdCode}
          language="rust"
          filename="claude-meter/src/bin/menubar.rs (line 942)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The 90-percent threshold for the title chip is set higher than the
          80-percent bar threshold on purpose. The chip lives in the corner of
          your screen all day; flashing orange at 80 percent burns attention
          you cannot get back. The bar lives inside the popup, which you only
          look at when you have already opened it; an earlier orange there is a
          legitimate hint, not a distraction. Two surfaces, two thresholds, one
          rule: warn at the moment a course-correction is still cheap.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The title chip: compressing two numbers and a state into six characters
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The popup is a panel; the title chip is what you see without opening
          anything. It has to fit two utilization percents and a color state
          into a few characters of menu-bar real estate. ClaudeMeter offers
          three formats (Compact, Medium, Long); the single-account branch
          renders like this:
        </p>
        <AnimatedCodeBlock
          code={titleBarCode}
          language="rust"
          filename="claude-meter/src/bin/menubar.rs (line 991)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Two segments per number: the &ldquo;5h &rdquo; / &ldquo;7d &rdquo;
          label (no color) and the percent (colored by{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            bg_for
          </code>
          ). Multi-account users get the same shape repeated, prefixed by the
          first letter of each account email. The chip never tries to surface
          extra_usage or weekly Opus by default; both are too situational for a
          glance surface. They live in the tile, one click away.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The localhost bridge: how the extension feeds the menu bar
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The browser extension can call /usage with the user&rsquo;s logged-in
          claude.ai cookies attached. The native menu-bar app cannot. So the
          two pieces talk over loopback. The bridge runs a tiny HTTP server on
          127.0.0.1:63762 that accepts POST /snapshots from the extension:
        </p>
        <AnimatedCodeBlock
          code={bridgeRouteCode}
          language="rust"
          filename="claude-meter/src/bin/menubar.rs (line 349)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Three details worth pulling out. First, the bridge only listens on{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            127.0.0.1
          </code>
          ; nothing off your machine can reach it. Second, it accepts only
          POST /snapshots; everything else 404s, which keeps the surface
          minimal. Third, it identifies the sending browser by looking up
          which local process owns the peer TCP port via{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            lsof
          </code>{" "}
          (
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            peer_browser_by_port
          </code>{" "}
          at lines 437-462). That means the menu bar always knows which browser
          a snapshot came from, even if the extension lies about its
          User-Agent. The browser provenance gets stamped into every tile.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The CLI dashboard: same data, scriptable
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The same UsageSnapshot the menu bar renders is also what the CLI
          binary prints. Same struct, two render targets. This is how you wire
          the rate-limit dashboard into a tmux pane, a Starship prompt, or a
          Slack reminder cron:
        </p>
        <TerminalOutput lines={cliSession} title="claude-meter (CLI)" />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The render comes from{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            print_pretty
          </code>{" "}
          in src/format.rs lines 4-73. Each window is formatted by{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            format_window
          </code>{" "}
          (lines 75-98), which is where the &ldquo;in 22m&rdquo; / &ldquo;in 4d
          7h&rdquo; humanization happens. The CLI is what tells you the menu
          bar number is real: same numbers, same payload, just different
          surfaces.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <ComparisonTable
          heading="Pro/Max self-hosted dashboard vs Anthropic Console"
          intro="The Console analytics surface and a Pro/Max self-hosted dashboard solve overlapping problems with different audiences. Both read live data. The Console renders aggregations; the self-hosted view renders the rolling-window detail Pro/Max users actually trip on."
          productName="ClaudeMeter (self-hosted)"
          competitorName="Anthropic Console"
          rows={consoleVsLocal}
          caveat="The Console is the right surface for plan administration and team-wide spend. ClaudeMeter is the right surface for the rolling-window decisions a single Pro/Max user makes mid-refactor."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What this dashboard deliberately does not do
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          A few things a rate-limit dashboard can do that ClaudeMeter chose
          not to, and the reasoning:
        </p>
        <ul className="list-disc pl-6 text-zinc-700 leading-relaxed text-lg space-y-3">
          <li>
            <strong className="text-zinc-900">No projection.</strong> The
            dashboard does not predict &ldquo;you will hit the wall in 38
            minutes at this burn rate.&rdquo; The rolling window slides on
            every prompt, weighted by model class and tool calls. Any
            projection beyond the next minute is fiction. The countdown to
            resets_at is the only honest forward-looking number.
          </li>
          <li>
            <strong className="text-zinc-900">No history.</strong> No
            day-over-day chart, no week-over-week percent, no per-prompt log.
            The &ldquo;rolling window&rdquo; the data describes is server-side
            and ephemeral; the dashboard keeps only the last fetched snapshot
            on disk (snapshots.json) so the menu bar can repaint immediately on
            wake.
          </li>
          <li>
            <strong className="text-zinc-900">No notifications.</strong> No
            push at 90 percent, no toast at 100. The chip painting orange is
            the notification. A second notification stream would compete for
            the same attention and lose.
          </li>
          <li>
            <strong className="text-zinc-900">No sign-in.</strong> No account,
            no auth, anonymous telemetry is opt-out endpoint. The dashboard has nothing to log in
            to because there is no remote service. The only network call is
            the browser extension polling claude.ai with the cookies the
            browser already has.
          </li>
        </ul>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        heading="Hitting the wall mid-refactor and want a second pair of eyes?"
        description="Fifteen minutes to walk through what your dashboard is showing, where the gating bucket actually sits, and whether overage or a model swap is the cheaper unblock."
      />

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="More on the data behind the dashboard."
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Walk through your rate-limit dashboard in fifteen minutes."
      />
    </article>
  );
}
