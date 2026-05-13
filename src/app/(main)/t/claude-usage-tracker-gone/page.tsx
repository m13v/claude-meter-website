import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  FlowDiagram,
  ComparisonTable,
  AnimatedChecklist,
  GlowCard,
  GradientText,
  ShimmerButton,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-usage-tracker-gone";
const PUBLISHED = "2026-05-12";

export const metadata: Metadata = {
  title:
    "Claude usage tracker gone: the three failure modes and what is actually broken",
  description:
    "When 'claude usage tracker gone' shows up in a search, it is usually one of three breaks: claude.ai/settings/usage hides the Plan Usage section after refresh, the page returns a 'Missing permissions' red banner, or /usage in Claude Code fails to populate. All three are UI-layer breaks on top of the same three live JSON endpoints under claude.ai/api/organizations/{org}/. The data is still there.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude usage tracker gone: the three failure modes and what is actually broken",
    description:
      "Why the Plan Usage section keeps disappearing, which endpoints still work when the page is broken, and how an external tracker bypasses the failure entirely.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude usage tracker gone", url: PAGE_URL },
];

const faqs = [
  {
    q: "Is the underlying API actually still live when the Plan Usage section disappears?",
    a: "In most reported cases, yes. The Settings page is a React shell that fetches /api/organizations/{org_uuid}/usage, /api/organizations/{org_uuid}/overage_spend_limit, and /api/organizations/{org_uuid}/subscription_details. When the Plan Usage card vanishes after refresh (the symptom in issue #30141) the network tab usually still shows the /usage endpoint returning 200 with the same JSON the card used to render. The component failed to consume the payload, not the server failed to ship it. The 'Missing permissions' variant in issue #11102 is different and the endpoint itself can return an error there; in that case the second symptom (a red banner instead of the card) is the visible tell.",
  },
  {
    q: "What does the 'Missing permissions' banner mean if I am clearly a paid Pro account?",
    a: "It is a Pro-account-specific permissions check on the Plan Usage section that started misfiring on November 6, 2025 (issue #11102 in anthropics/claude-code). The reporter was on a paid Pro plan, in good standing, on Claude Code 2.0.34, and the same banner came back across browsers and across an account that was clearly entitled to read its own usage. The fix has to come from Anthropic; client-side workarounds do not exist because the check happens before the page is allowed to render anything below it. The data the page would have rendered is what claude-meter and other external readers hit directly via the JSON endpoint.",
  },
  {
    q: "Why does the /usage slash command in Claude Code also sometimes show nothing?",
    a: "/usage, /cost, and /stats are aliases for the same canonical usage panel inside Claude Code, and the panel reads from the same underlying account endpoint as the web Settings page. When the web Settings page is in one of these broken states, /usage often goes blank or 'Unable to load' at the same time. The April 30, 2026 outage that took claude.ai/settings/usage offline for ~30 minutes also broke /usage for the same window. If both the web page and the slash command are dark at the same moment, that is the shape of an Anthropic-side incident.",
  },
  {
    q: "What endpoint does the page actually call, and is it documented?",
    a: "Three internal endpoints under https://claude.ai/api/organizations/{org_uuid}/ provide the data the Plan Usage section renders: /usage (the 5-hour, weekly all-models, and weekly Opus percents), /overage_spend_limit (your extra-usage cap and current spend in dollars), and /subscription_details (your plan and next charge). None of them are documented in Anthropic's public API reference. The org_uuid lives in the lastActiveOrg cookie on claude.ai. claude-meter hardcodes those three paths in src/api.rs (lines 19, 34, and 49 in the open Rust source on github.com/m13v/claude-meter).",
  },
  {
    q: "Will an Anthropic API key let me read this when the Settings page is down?",
    a: "No. The Anthropic API key authenticates against api.anthropic.com and gives you console spend data: how many tokens you have burned against api.anthropic.com, on which model, at which prices. That is a completely different surface from a Pro or Max plan subscription, which is metered on claude.ai under the org_uuid in your session cookies. There is no plan-quota endpoint on api.anthropic.com that an API key can read. Tools advertised as 'Claude usage trackers' that only ask for an API key cannot show you the Plan Usage percents that disappeared from the Settings page; they were already measuring a different thing.",
  },
  {
    q: "Does ccusage or Claude-Code-Usage-Monitor help when the Settings page is broken?",
    a: "They keep working, but they are not measuring the same number. ccusage and Claude-Code-Usage-Monitor read the JSONL files Claude Code writes locally under ~/.claude/projects and estimate tokens from those logs. That estimate is per-machine and per-project and does not include any usage that happened on claude.ai itself, on Claude Code on another machine, or on the same machine before the JSONL window. It is useful as a local audit. It is not the percent the rate limiter is comparing against when it 429s you. The Settings page percent is the server-truth number; the JSONL estimate is a local proxy. They diverge in ways that have caused real 'I am only 5% used but I just got rate limited' threads.",
  },
  {
    q: "Is the data ClaudeMeter shows actually the same number the Settings page shows?",
    a: "Yes, by construction. ClaudeMeter polls the same three endpoints (/usage, /overage_spend_limit, /subscription_details) on the same org_uuid using the same session cookies your browser is using. The Rust HTTP client emulates Chrome 131 (rquest with Emulation::Chrome131) so the TLS fingerprint and header set match what Cloudflare expects from a real claude.ai page request. The Referer header is even set to https://claude.ai/settings/usage. The response is byte-for-byte the same JSON the Settings page would have parsed, which is why the percents match exactly when both are working and why ClaudeMeter still has a number when the Settings page draws an empty card.",
  },
  {
    q: "If I install ClaudeMeter, do I need to paste a cookie?",
    a: "No. Two paths read the cookie automatically. The cookie-decrypt path (Chromium browsers on macOS) shells out to /usr/bin/security to fetch each browser's Safe Storage password, derives the AES key with PBKDF2-saltysalt-1003, decrypts your claude.ai cookies in place from the browser's Cookies SQLite file, and uses them to call the API. The extension path runs in your already-logged-in browser, calls the same endpoints with credentials: 'include', and POSTs the response to a localhost bridge on port 63762 that the menu bar listens on. You never copy a Cookie header from DevTools. If one path fails, the other carries.",
  },
];

const sourceCode = `// claude-meter/src/api.rs (lines 8-49)
const BASE: &str = "https://claude.ai/api";

pub async fn fetch_usage_snapshot(cookies: &ClaudeCookies) -> Result<UsageSnapshot> {
    let org = &cookies.last_active_org;

    let usage: Option<UsageResponse> = get_json(
        &client, &cookie_header,
        &format!("{BASE}/organizations/{org}/usage"),
    ).await.ok();

    let overage: Option<OverageResponse> = get_json(
        &client, &cookie_header,
        &format!("{BASE}/organizations/{org}/overage_spend_limit"),
    ).await.ok();

    let subscription: Option<SubscriptionResponse> = get_json(
        &client, &cookie_header,
        &format!("{BASE}/organizations/{org}/subscription_details"),
    ).await.ok();
    // ...
}`;

const reproTerminal = [
  {
    type: "command" as const,
    text: "# 1) Find your org_uuid in DevTools while logged into claude.ai",
  },
  {
    type: "command" as const,
    text: "#    Application -> Cookies -> claude.ai -> lastActiveOrg",
  },
  { type: "output" as const, text: "lastActiveOrg = 8a7f9e3c-...-...." },
  {
    type: "command" as const,
    text: "# 2) Curl the same endpoint the (broken) Settings page calls",
  },
  {
    type: "command" as const,
    text: "curl -s \"https://claude.ai/api/organizations/<ORG_UUID>/usage\" \\",
  },
  {
    type: "command" as const,
    text: "  -H \"Cookie: $(pbpaste)\" -H 'Referer: https://claude.ai/settings/usage' | jq",
  },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"five_hour\": { \"utilization\": 0.42, \"resets_at\": \"...\" }," },
  { type: "output" as const, text: "  \"seven_day\": { \"utilization\": 0.78, \"resets_at\": \"...\" }," },
  { type: "output" as const, text: "  \"seven_day_opus\": { \"utilization\": 0.91, \"resets_at\": \"...\" }" },
  { type: "output" as const, text: "}" },
  {
    type: "success" as const,
    text: "200 with the same payload the (broken) Plan Usage card would have rendered.",
  },
];

const failureFlow = [
  {
    label: "Plan Usage card vanishes after refresh",
    detail:
      "First load shows the card. F5 once and only Extra Usage remains. The /usage endpoint usually returns 200 in the network tab; the React component just stops mounting the section. Reported as issue #30141.",
  },
  {
    label: "Red 'Missing permissions' banner",
    detail:
      "Paid Pro account, in good standing, suddenly told it cannot read its own usage. Reproduces across browsers, persists across refreshes. Reported as issue #11102 on Nov 6, 2025.",
  },
  {
    label: "'Unable to load usage limits. Please try again later.'",
    detail:
      "Generic load failure on /settings/usage. Header renders, the card body comes up red. Documented in the April 30, 2026 outage write-up.",
  },
  {
    label: "/usage in Claude Code goes blank",
    detail:
      "The terminal panel that /usage, /cost, and /stats all open shows nothing or a 'Unable to load' line. Usually correlates with the web page being broken at the same time.",
  },
];

const checklistItems = [
  {
    text: "The Settings page is a React shell. The data behind the card lives at three JSON endpoints under /api/organizations/{org_uuid}/.",
  },
  {
    text: "When the card disappears, the most common cause is a client-side render failure with a still-200 endpoint behind it.",
  },
  {
    text: "When the red banner shows, the endpoint itself may be returning 403 'Missing permissions' (the Nov 2025 incident shape).",
  },
  {
    text: "/usage in Claude Code reads through the same account surface, so it tends to go dark in the same windows.",
  },
  {
    text: "Anthropic API key tools cannot rescue you here. They read api.anthropic.com console spend, not the plan-quota surface that owns the broken page.",
  },
  {
    text: "Local token estimators (ccusage, Claude-Code-Usage-Monitor) keep working, but they estimate tokens from local JSONL logs and do not see the server quota the rate limiter actually enforces.",
  },
  {
    text: "The endpoint is undocumented. Field names have been stable for months but Anthropic could rename or remove fields in any release.",
  },
];

const replacements = [
  {
    feature: "Visible when /settings/usage card is broken",
    ours:
      "Yes, polls the underlying /api/organizations/{org}/usage endpoint directly every 60s",
    competitor:
      "No (browser UI tools that scrape the rendered page break with the page)",
  },
  {
    feature: "Shows the same 5-hour, weekly, weekly-Opus percents as the Settings page",
    ours: "Yes (same endpoint, same JSON, same fields)",
    competitor:
      "Anthropic API key tools cannot see plan quota; local-log tools (ccusage, lugia19) measure a different number",
  },
  {
    feature: "Works without re-pasting a cookie when the session rotates",
    ours: "Yes, decrypts the current cookie from your browser profile on each refresh",
    competitor: "Most paste-based tools require a manual refresh every few weeks",
  },
  {
    feature: "Fallback path if cookie-decrypt breaks (e.g. next Chromium scheme change)",
    ours: "Browser extension calls the same endpoint with credentials: 'include' and POSTs to a localhost bridge",
    competitor: "Single path, breaks until the developer ships a fix",
  },
  {
    feature: "Visibility into Extra Usage dollars (Anthropic April 2026 metered billing)",
    ours: "Yes, reads /overage_spend_limit on the same interval",
    competitor: "Some show it; many do not because they only watch /usage",
  },
  {
    feature: "Open source, audit the request path yourself",
    ours: "MIT, Rust + SwiftUI, all three endpoint URLs visible in src/api.rs",
    competitor: "Mixed; cookie pipeline rarely documented",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-usage-server-truth",
    title: "The server-truth quota the local-log tools cannot see",
    excerpt:
      "Why ccusage and Claude-Code-Usage-Monitor measure something different from claude.ai/settings/usage, and which one matches the 429.",
    tag: "Mental model",
  },
  {
    href: "/t/claude-usage-monitoring-app-for-mac",
    title: "The Mac cookie pipeline most monitors skip explaining",
    excerpt:
      "PBKDF2-saltysalt-1003, AES-128-CBC, and the localhost bridge fallback. Exactly how an external monitor reads your live claude.ai session on macOS.",
    tag: "Deep dive",
  },
  {
    href: "/t/claude-rate-limit-dashboard",
    title: "Build a Claude rate-limit dashboard you can trust",
    excerpt:
      "What 'rate limit' actually means on Pro and Max, which signal matches the 429, and which trackers reflect each.",
    tag: "Guide",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude usage tracker gone: the three failure modes and what is actually broken",
  description:
    "When the Plan Usage section disappears from claude.ai/settings/usage, the page returns 'Missing permissions', or /usage in Claude Code goes blank, the underlying JSON endpoints are usually still live. Here are the exact endpoints, the three failure shapes, and how an external monitor bypasses the broken UI.",
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "ClaudeMeter",
  publisherUrl: "https://claude-meter.com",
  articleType: "TechArticle",
});

const breadcrumbJsonLd = breadcrumbListSchema(
  breadcrumbs.map((b) => ({ name: b.name, url: b.url })),
);

const faqJsonLd = faqPageSchema(faqs);

export default function ClaudeUsageTrackerGonePage() {
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
          Your Claude usage tracker is gone.{" "}
          <GradientText>The data is not.</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          The Plan Usage section keeps disappearing from
          claude.ai/settings/usage. Sometimes only the Extra Usage card
          renders. Sometimes the page comes back with a red &ldquo;Missing
          permissions&rdquo; banner. Sometimes /usage in Claude Code is
          dark too. In almost every case the data is still flowing out
          of the same three internal endpoints. What broke is the page
          on top of them. This is the map.
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
        <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">
            Direct answer (verified 2026-05-12)
          </div>
          <p className="text-zinc-900 leading-relaxed text-lg">
            Searches for &ldquo;claude usage tracker gone&rdquo; map to
            one of three live breaks: (1) the Plan Usage card on
            claude.ai/settings/usage vanishes after refresh and only
            Extra Usage remains (GitHub issue{" "}
            <a
              href="https://github.com/anthropics/claude-code/issues/30141"
              className="text-teal-700 underline"
            >
              #30141
            </a>
            ), (2) a red &ldquo;Missing permissions&rdquo; banner replaces
            the card on otherwise healthy paid Pro accounts (issue{" "}
            <a
              href="https://github.com/anthropics/claude-code/issues/11102"
              className="text-teal-700 underline"
            >
              #11102
            </a>
            , filed Nov 6, 2025), (3) /usage, /cost, and /stats inside
            Claude Code show nothing or &ldquo;Unable to load&rdquo;.
            All three are UI-layer breaks on top of the same three live
            JSON endpoints under{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              claude.ai/api/organizations/&#123;org_uuid&#125;/
            </code>
            . The percents you cannot see in the browser are still being
            returned by the server.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What &ldquo;gone&rdquo; actually looks like, in four shapes
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The phrase covers more than one symptom. Knowing which one you
          have decides what to do next.
        </p>
        <FlowDiagram
          title="The four failure shapes behind 'tracker gone'"
          steps={failureFlow}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The three endpoints behind the broken card
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The Plan Usage section on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          is a React component. It calls three internal endpoints under{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/api/organizations/&#123;org_uuid&#125;/
          </code>
          , parses the JSON, and renders the percents. None of these are
          documented in Anthropic&rsquo;s public API reference. All three
          are visible in claude-meter&rsquo;s open Rust source, where
          they are the only three URLs the menu bar app polls:
        </p>
        <AnimatedCodeBlock
          code={sourceCode}
          language="rust"
          filename="claude-meter/src/api.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          path returns the 5-hour-window percent, the weekly all-models
          percent, the weekly Opus-only percent, and a reset timestamp on
          each.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /overage_spend_limit
          </code>{" "}
          returns your Extra Usage cap in dollars and your current spend
          against it (the new metered-billing surface Anthropic shipped
          in April 2026).{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /subscription_details
          </code>{" "}
          returns your plan name and the next-charge date. The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            org_uuid
          </code>{" "}
          comes from the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            lastActiveOrg
          </code>{" "}
          cookie your browser already has on claude.ai.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          You can confirm the API is up in three commands
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not have to take this on faith. Open DevTools on a
          tab where you are logged into claude.ai, copy the full Cookie
          header to your clipboard, then run:
        </p>
        <TerminalOutput
          title="curl the (broken) Settings page's data source"
          lines={reproTerminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          If that returns 200 with a payload, your data is intact and
          the failure is a UI bug on top of a healthy backend. If it
          returns 403 &ldquo;Missing permissions&rdquo;, you are in the
          shape of issue #11102 and the backend is the thing returning
          the error; the page is just relaying it. Either way you now
          know which bucket you are in.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why none of the obvious workarounds actually work
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The advice on the open Web for &ldquo;Claude usage tracker
          gone&rdquo; tends to land on one of three things. None of them
          rescues you cleanly, and they fail in different ways.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          <strong>Run /usage in Claude Code.</strong> /usage, /cost, and
          /stats are aliases for the same canonical panel and they read
          through the same account surface as the web Settings page. When
          the web page is broken, /usage frequently goes blank in the
          same window. It is the right workaround when the failure is
          local to claude.ai in your browser, but not when it is a
          backend incident.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          <strong>Try an Anthropic API key tracker.</strong> Multiple
          third-party tools advertise themselves as &ldquo;Claude usage
          trackers&rdquo; that ask you for an API key. Those tools talk
          to api.anthropic.com and show you console spend (tokens you
          paid for in dollars on the API). They have nothing to say
          about your Pro or Max plan quota, because the plan-quota
          surface lives behind your claude.ai session cookies on a
          different host. The fact that the API-key tool is still
          rendering does not mean it is showing you the percent that is
          missing.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          <strong>Use ccusage or Claude-Code-Usage-Monitor.</strong>{" "}
          These read{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects
          </code>{" "}
          JSONL files Claude Code writes locally and estimate tokens
          from those logs. They are not the same number. They cannot
          see usage that happened on claude.ai itself, on another
          machine, or before the current JSONL window. As an audit they
          are useful. As a substitute for the missing Plan Usage card,
          they are measuring the wrong thing.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The seven things actually true about the broken page
        </h2>
        <AnimatedChecklist
          title="What is and is not happening"
          items={checklistItems}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          What survives the failure
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          A short audit of who is still rendering a percent when the
          Settings page is dark, and what number that percent actually
          comes from.
        </p>
        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="Other trackers"
          rows={replacements}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          How an external reader bypasses the broken page
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Once you know the three endpoint paths, the rest is just a
          well-behaved HTTP client with the right session cookies. That
          is the entirety of what claude-meter does. On a 60-second
          interval, the menu bar app builds a Cookie header from your
          existing browser session, sets the Referer to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            https://claude.ai/settings/usage
          </code>{" "}
          (the same Referer your browser would send), and calls the
          three paths in parallel. The Rust HTTP client uses{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            rquest
          </code>{" "}
          with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Emulation::Chrome131
          </code>{" "}
          so the TLS fingerprint and header set match a real Chrome page
          request, which is what Cloudflare in front of claude.ai is
          checking.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The response is the JSON the Settings page would have parsed.
          The percents that go into the menu bar are the percents that
          would have gone into the card. When the card is empty in your
          browser, the menu bar is still showing a number, because the
          data was never the thing that broke.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What this does not fix
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          If your specific failure is the &ldquo;Missing permissions&rdquo;
          banner from issue #11102, the curl from the section above will
          return 403 too. The endpoint itself is the thing returning the
          error. No external tracker can read what the server refuses to
          ship. The remedy in that bucket is reporting to Anthropic
          support; in the meantime an external tracker still shows the
          last known value with a stale-since timestamp instead of going
          blank.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          If you are on Safari, the cookie-decrypt path does not apply
          (Safari stores cookies in a Binary Property List, not the
          Chromium-style SQLite with v10 encryption). Open claude.ai in
          a Chromium browser to give an external tracker a session to
          read from. If you are on Windows or Linux, the macOS menu bar
          surface does not run; the browser extension and the CLI both
          do.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The one-line version
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              The page is gone. The numbers are not. The Plan Usage card
              on claude.ai/settings/usage is a React component that
              fetches three JSON endpoints; when the component fails,
              the endpoints almost always do not. An external reader
              that hits those endpoints directly with your existing
              session cookies keeps rendering the percent the
              rate limiter is comparing against, with or without the
              Settings page being up.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Put the percent back in your menu bar
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          One brew cask. Reads the same JSON the Settings page reads.
          No cookie paste. macOS 12+ on Chrome, Arc, Brave, or Edge.
          The number is back even when the Settings page is dark.
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
          heading="On a failure shape we have not seen?"
          description="If your tracker went dark in a new way, send the exact symptom (banner text, network tab response, browser version). We add it to the map."
          text="Book a 15-minute call"
          section="tracker-gone-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Tracker still gone after this? 15 min."
        section="tracker-gone-sticky"
        site="claude-meter"
      />
    </article>
  );
}
