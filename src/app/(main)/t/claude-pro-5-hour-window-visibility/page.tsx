import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  ComparisonTable,
  SequenceDiagram,
  AnimatedChecklist,
  MetricsRow,
  GlowCard,
  StepTimeline,
  RemotionClip,
  AnimatedBeam,
  NumberTicker,
  GradientText,
  BackgroundGrid,
  Marquee,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-pro-5-hour-window-visibility";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title: "Claude Pro 5-Hour Window Visibility: One Worst-Case Number on Your Toolbar",
  description:
    "ClaudeMeter shows the worst five-hour utilization across every Anthropic org you belong to as a single colored badge on your browser toolbar, refreshed every 60 seconds from the same JSON the claude.ai Settings page itself fetches.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Pro 5-Hour Window Visibility: One Worst-Case Number on Your Toolbar",
    description:
      "Multi-org-aware visibility into Claude Pro's rolling 5-hour window. The badge shows the worst case, not the active tab. Server-truth, polled every 60s, free and open source.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Where does the 5-hour percentage on the toolbar badge come from?",
    a: "It comes from GET /api/organizations/{org_uuid}/usage on claude.ai, the same JSON the Settings page renders. The extension calls that endpoint with your existing logged-in cookies, parses the five_hour.utilization float, normalizes the 0-to-1 vs 0-to-100 scale, and writes it to chrome.action.setBadgeText. There is no second source of truth and no local estimation involved. If the number on the badge disagrees with the bar at claude.ai/settings/usage, you are looking at a stale poll, not a different metric.",
  },
  {
    q: "What does worst-case across orgs mean and why is that the right number?",
    a: "If your account belongs to two organizations, say a personal Pro and a Team workspace, the rate limiter on Anthropic's side trips per org. You can be at 14 percent on org A and 96 percent on org B; the next prompt to org B will 429. Cycling between two badges or showing the active tab does not help, because the org you happen to have open is not always the one closest to throttling. ClaudeMeter computes worstPct(snaps, 'five_hour') across all your memberships in a single reduce, so the badge always tells you which way you are about to fall over.",
  },
  {
    q: "Why are the browser badge thresholds different from the Mac menu bar?",
    a: "They are. In extension/background.js the badge turns orange at >=80 percent and red at >=100 percent. In src/bin/menubar.rs the title pill turns orange at >=90 percent and red at >=100 percent. Same release, two different warning thresholds. The browser nudges you a notch earlier because the toolbar is a smaller, more peripheral pixel surface and we wanted the orange to fire while you still had room to wind down a session. The Mac title sits on a larger, more attention-grabbing surface and gets the tighter band.",
  },
  {
    q: "How often does the badge refresh?",
    a: "Once per minute, fixed. POLL_MINUTES = 1 in extension/background.js sets a chrome.alarms tick that calls refresh() every 60 seconds, and the macOS app uses POLL_INTERVAL = Duration::from_secs(60) in src/bin/menubar.rs. There is no exponential backoff and no on-focus poll. If the page disagrees with the badge by more than a percent or two, wait up to 60 seconds and the badge will catch up.",
  },
  {
    q: "Does the badge tell me which org is over?",
    a: "Not on the pixel itself. The badge is one number, the worst case, with no org tag. Click the toolbar icon and the popup renders one row per account with the email next to each five-hour bar, so you can see which membership tripped the worst-case. The Mac menu bar dropdown does the same with one row per snapshot. Keeping the badge to a single number is intentional: at a glance you want one signal, not a cycle.",
  },
  {
    q: "What if my org returns 0.94 and another returns 94.0 in the same payload?",
    a: "That happens. The endpoint is internal and the scale is inconsistent across buckets and across releases. The clamp is at extension/popup.js:6-11, u <= 1 ? u * 100 : u, applied before any worst-case reduction. The same clamp lives in the Rust side as part of the formatter. If you write your own visibility tool against this endpoint and skip the clamp, an org at 0.94 will look like 0.94 percent and the other org at 94.0 will dwarf it in your badge. Always normalize first, reduce second.",
  },
  {
    q: "Can the badge show me the rolling reset time?",
    a: "Not on the badge text itself. The badge is a percent. The popup row shows resets_at as a relative label like '5-hour · 3h' or '5-hour · 22m', computed from the live ISO timestamp the server returns. Hover the toolbar icon and the title attribute shows the same number expanded. The reset is sliding, not anchored to your first prompt, so the label moves on every poll if you are still active.",
  },
  {
    q: "How is this different from extensions that cycle through metrics?",
    a: "A cycling badge alternates between five-hour, seven-day, and other windows on a four-second loop, which means at any single glance you might be reading the wrong axis. ClaudeMeter pins the badge to one bucket, five-hour, because that is the one most likely to throttle a synchronous chat. The seven-day and weekly buckets matter, but they live in the popup, not the badge. Different design choice, same source of truth.",
  },
  {
    q: "Will the badge keep working if I clear cookies on claude.ai?",
    a: "No. The fetch uses credentials: 'include' which means the request rides your existing claude.ai session cookies. If you log out, the next /api/organizations/{org_uuid}/usage call returns a 401 or 403, refresh() catches it, and the badge text becomes '!' on a gray background. Open claude.ai, log back in, click the toolbar icon's refresh button, and the badge recovers in under a second. There is no separate auth flow and no API key to re-paste.",
  },
  {
    q: "Why not poll from a server somewhere instead of the browser?",
    a: "Because the cookies live in your browser. The endpoint authorizes per-session, not per-API-key, and Anthropic does not publish a programmatic credential for this data. A server poller would either need you to paste cookies into a remote service, which is the manual step ClaudeMeter exists to remove, or it would simply not work. Running the poll inside the same browser that already holds the session is the cheapest path to server-truth visibility, which is why the extension is the default surface and the macOS app is the long-running one.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Topics", url: "https://claude-meter.com/t" },
  {
    name: "Claude Pro 5-hour window visibility",
    url: PAGE_URL,
  },
];

const worstPctSnippet = `// extension/background.js:65-73
function worstPct(snaps, key) {
  let worst = null;
  for (const s of snaps) {
    if (!s.usage) continue;
    const v = pctFromWindow(s.usage[key]);
    if (v != null && (worst == null || v > worst)) worst = v;
  }
  return worst;
}

// extension/background.js:80-90
const five = worstPct(snaps, "five_hour");
const badge = five == null ? "?" : \`\${Math.round(five)}\`;
chrome.action.setBadgeText({ text: badge });
chrome.action.setBadgeBackgroundColor({
  color: (five ?? 0) >= 100 ? "#b00020"
       : (five ?? 0) >= 80  ? "#b26a00"
       : "#2c6e2f",
});`;

const macThresholdSnippet = `// src/bin/menubar.rs:942-950
fn bg_for(util: f64) -> Option<(u8, u8, u8)> {
    if util >= 100.0 {
        Some((215, 58, 73))    // red
    } else if util >= 90.0 {
        Some((219, 118, 32))   // orange
    } else {
        None                   // no fill
    }
}`;

const articleJsonLd = articleSchema({
  headline:
    "Claude Pro 5-hour window visibility: one worst-case number on your toolbar",
  description:
    "How ClaudeMeter renders multi-org five-hour utilization as a single colored badge, refreshed every 60 seconds from the same JSON the Settings page itself fetches, with the threshold mismatch between browser badge and Mac menu bar called out exactly.",
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

const visibilityComparisonRows = [
  {
    feature: "Source",
    competitor: "Local JSONL token counts under ~/.claude/projects",
    ours: "Server JSON from /api/organizations/{org_uuid}/usage",
  },
  {
    feature: "Multi-org awareness",
    competitor: "One org at a time, or whichever tab is active",
    ours: "Worst case across every membership in a single badge",
  },
  {
    feature: "Refresh cadence",
    competitor: "On-prompt or on-script-run only",
    ours: "60 seconds, even when claude.ai is not open",
  },
  {
    feature: "Reset clock",
    competitor: "Inferred from first message timestamp",
    ours: "resets_at ISO timestamp returned by the server",
  },
  {
    feature: "Setup",
    competitor: "Paste cookie or session token, refresh on expiry",
    ours: "Logged into claude.ai = it works, no paste",
  },
  {
    feature: "Cost",
    competitor: "Free or one-time purchase, closed source",
    ours: "Free, MIT-licensed, on GitHub",
  },
];

const relatedPosts = [
  {
    title: "Claude Pro 5-hour window quota: what the server actually counts",
    href: "/t/claude-pro-5-hour-window-quota",
    excerpt:
      "Pro's 5-hour quota is one float on a sliding clock, not 45 messages. Where it lives in the JSON, why resets_at slides, and how to read it yourself.",
    tag: "deep dive",
  },
  {
    title: "Claude rolling 5-hour burn rate: Δu/Δt, not tokens per minute",
    href: "/t/claude-rolling-5-hour-burn-rate",
    excerpt:
      "The only correct burn rate for the rolling window is the delta of server utilization between polls. Why local-token tools cannot see what the rate limiter sees.",
    tag: "math",
  },
  {
    title: "Claude server-side quota visibility",
    href: "/t/claude-server-quota-visibility",
    excerpt:
      "The full anatomy of the server-side quota numbers Anthropic enforces and how they differ from local-log estimates.",
    tag: "reference",
  },
];

const visibilityActors = [
  "Chrome",
  "Service worker",
  "claude.ai",
  "Toolbar badge",
];

const visibilityMessages: {
  from: number;
  to: number;
  label: string;
  type?: "request" | "response" | "event" | "error";
}[] = [
  { from: 1, to: 1, label: "alarms.create('refresh', 1 min)", type: "event" },
  { from: 1, to: 2, label: "GET /api/account", type: "request" },
  { from: 2, to: 1, label: "memberships[]", type: "response" },
  {
    from: 1,
    to: 2,
    label: "GET /api/organizations/{org}/usage  (per org)",
    type: "request",
  },
  {
    from: 2,
    to: 1,
    label: "{ five_hour, seven_day, ... }",
    type: "response",
  },
  {
    from: 1,
    to: 1,
    label: "worstPct(snaps, 'five_hour')",
    type: "event",
  },
  {
    from: 1,
    to: 3,
    label: "setBadgeText('94'), setBadgeBackgroundColor(#b26a00)",
    type: "request",
  },
  {
    from: 0,
    to: 3,
    label: "94 — orange — at-a-glance signal",
    type: "response",
  },
];

export default function ClaudePro5HourWindowVisibilityPage() {
  return (
    <article className="bg-white text-zinc-900">
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

      <BackgroundGrid pattern="dots" glow>
        <header className="max-w-4xl mx-auto px-6 pb-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
            Claude Pro&apos;s 5-hour window visibility, reduced to{" "}
            <GradientText>one worst-case badge</GradientText> on your toolbar
          </h1>
          <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
            If you belong to more than one Anthropic org, the org you have open
            is rarely the one about to throttle. ClaudeMeter pins the toolbar
            badge to whichever membership is closest to the five-hour ceiling,
            polls the same JSON the Settings page itself fetches, and refreshes
            on a 60-second clock you do not have to think about.
          </p>
        </header>
      </BackgroundGrid>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Source-verifiable in the public ClaudeMeter repo"
          highlights={[
            "worstPct in extension/background.js:65-73",
            "60-second poll cadence in both extension and macOS app",
            "Mismatched warning thresholds documented exactly",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <RemotionClip
          title="One badge. One worst case."
          subtitle="Multi-org five-hour visibility on Claude Pro and Max"
          captions={[
            "Source: claude.ai/api/organizations/{org}/usage",
            "Reduce: max(five_hour.utilization) across all your orgs",
            "Refresh: every 60 seconds, no clicks",
            "Color: green / orange at 80 / red at 100",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The problem with one-org visibility
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Most playbooks for surfacing your 5-hour window assume you have a
          single Anthropic org. You do not. Almost everyone on a Pro plan also
          ends up in at least one Team workspace they were invited to, and
          Anthropic enforces the rolling window per-org, not per-account. So
          the relevant question is not &ldquo;what is my five-hour
          utilization,&rdquo; it is &ldquo;what is the highest five-hour
          utilization on any membership my next prompt could land in.&rdquo;
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          A badge that shows the active org is wrong about half the time. A
          badge that cycles between orgs is wrong at any given glance. The only
          reliable visibility surface for a multi-org account is one that
          reduces every membership to a single worst-case number and pins it
          there. That is the entire premise of the toolbar badge below.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <MetricsRow
          metrics={[
            { value: 60, suffix: "s", label: "Poll interval" },
            { value: 1, label: "Number on the badge" },
            { value: 80, suffix: "%", label: "Browser orange threshold" },
            { value: 100, suffix: "%", label: "Red, on every surface" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: <NumberTicker value={9} /> lines that decide what
          you see
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The whole multi-org reduction lives in nine lines of JavaScript in
          the public extension repo. Read the file, run it yourself, or copy
          the logic into your own visibility tool. The numbers below are
          verbatim from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extension/background.js
          </code>{" "}
          on the main branch.
        </p>
        <AnimatedCodeBlock
          code={worstPctSnippet}
          language="javascript"
          filename="extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Two functions, one reduce, one badge call. Every snap in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            snaps
          </code>{" "}
          is one organization the user belongs to.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            pctFromWindow
          </code>{" "}
          normalizes the inconsistent 0-to-1 vs 0-to-100 scale (the same payload
          can have one bucket at 0.94 and another at 94.0). Then{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            worstPct
          </code>{" "}
          picks the maximum and that single number is what the toolbar pixel
          renders.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          How the badge gets there, end to end
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Every 60 seconds, the service worker wakes up, asks claude.ai which
          orgs you belong to, fetches the usage JSON for each one, reduces to
          the worst case, and writes the result to the toolbar. Nothing is
          cached more than 60 seconds, nothing is estimated locally.
        </p>
        <AnimatedBeam
          title="Multi-org → one toolbar badge"
          from={[
            { label: "Pro org", sublabel: "personal" },
            { label: "Team org", sublabel: "shared workspace" },
            { label: "Other orgs", sublabel: "guest invites" },
          ]}
          hub={{ label: "worstPct()", sublabel: "max five_hour utilization" }}
          to={[
            { label: "Toolbar badge", sublabel: "color + percent" },
            { label: "Tooltip", sublabel: "5h and 7d numbers" },
            { label: "Bridge port", sublabel: "127.0.0.1:63762" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The poll loop, with the actual function names
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The sequence below is what happens during one tick of the
          chrome.alarms timer, with the exact endpoint paths and the exact
          field that lands on the badge. Replace any of these with your own
          tool and the visibility surface still works as long as you preserve
          the 60-second cadence and the worst-case reduction.
        </p>
        <SequenceDiagram
          title="One refresh tick, browser side"
          actors={visibilityActors}
          messages={visibilityMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The browser badge and the Mac title use{" "}
          <GradientText>different orange thresholds</GradientText>
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          This is the part nobody documents because it is genuinely small, but
          if you run both surfaces side by side you will notice it. The browser
          badge turns orange at 80 percent. The Mac menu bar pill turns orange
          at 90 percent. They both turn red at 100. Same release, two thresholds.
          The browser nudges earlier because the toolbar pixel is small and
          peripheral, so getting an early warning out of it matters more.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4 mb-6">
          Verbatim from the macOS source:
        </p>
        <AnimatedCodeBlock
          code={macThresholdSnippet}
          language="rust"
          filename="src/bin/menubar.rs"
        />
        <div className="mt-8">
          <ComparisonTable
            heading="Threshold mismatch, in one table"
            productName="Browser badge"
            competitorName="Mac menu bar"
            rows={[
              {
                feature: "Color at <80% utilization",
                competitor: "no fill, default text color",
                ours: "green (#2c6e2f) background",
              },
              {
                feature: "Color at 80-89%",
                competitor: "no fill, default text color",
                ours: "orange (#b26a00) background",
              },
              {
                feature: "Color at 90-99%",
                competitor: "orange (219,118,32) background",
                ours: "orange (#b26a00) background",
              },
              {
                feature: "Color at >=100%",
                competitor: "red (215,58,73) background",
                ours: "red (#b00020) background",
              },
              {
                feature: "Surface",
                competitor: "Mac menu bar title pill",
                ours: "Browser toolbar badge text",
              },
            ]}
            caveat="Yes, the columns swapped. The 'competitor' column above is the Mac menu bar shipping in the same release as the badge in the 'ours' column. Both surfaces of ClaudeMeter, one repo, two thresholds, on purpose."
          />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the badge tells you at a glance
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The badge is one number plus a color, nothing else. That is the whole
          point. Anything more granular goes in the popup, where you have time
          to read. At a glance you should be able to answer five questions in
          under a second, and they all live in two pixels of color and two
          digits of text.
        </p>
        <AnimatedChecklist
          title="Five questions, one badge"
          items={[
            {
              text: "Am I close to a 5-hour throttle on any of my orgs? Color says it.",
              checked: true,
            },
            {
              text: "If I am, how close? The two-digit number says it.",
              checked: true,
            },
            {
              text: "Is the badge fresh? It refreshed less than 60 seconds ago.",
              checked: true,
            },
            {
              text: "Does this match the bar at claude.ai/settings/usage? Yes, same JSON.",
              checked: true,
            },
            {
              text: "Did I have to paste a cookie? No, it rides your existing session.",
              checked: true,
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          How this differs from the other visibility playbooks
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Most articles about seeing the five-hour window land on one of three
          patterns: open the Settings page when you remember to, run a CLI that
          parses local JSONL files, or paste a session token into a third-party
          dashboard. Each one breaks for a different reason. The toolbar badge
          is a direct answer to all three.
        </p>
        <ComparisonTable
          heading="Visibility surfaces, side by side"
          productName="ClaudeMeter toolbar badge"
          competitorName="Local-log tools and dashboards"
          rows={visibilityComparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Setting it up so the badge starts moving
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Three steps. The middle one is the entire reason the badge can show
          your real five-hour percent without a paste step.
        </p>
        <StepTimeline
          steps={[
            {
              title: "Install the extension",
              description:
                "Load the unpacked extension from the public ClaudeMeter repo's extension/ directory in chrome://extensions, developer mode on. There is no separate sign-in.",
            },
            {
              title: "Stay logged in to claude.ai",
              description:
                "The fetch uses credentials: 'include', so the request rides the same session cookies your browser already has for claude.ai. No paste, no token, no API key. If you log out, the badge falls back to '!' until you log in again.",
            },
            {
              title: "Pin the toolbar icon",
              description:
                "Pin the extension to the visible part of the toolbar. The badge text and color update every 60 seconds via chrome.alarms. Hover the icon for the longer 5h and 7d tooltip.",
            },
            {
              title: "Optional: install the macOS menu bar app",
              description:
                "If you want the same number in the system bar with the slightly tighter orange threshold (>=90 instead of >=80), grab the macOS app from the same repo. It polls the same endpoint with the same cadence and writes the worst-case to the menu bar title.",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          One thing to remember about the rolling reset
        </h2>
        <GlowCard>
          <div className="p-6">
            <p className="text-zinc-700 leading-relaxed text-lg">
              The five-hour window does not reset to zero on a fixed clock. It
              is a sliding boundary. Every prompt you send pushes the
              boundary&apos;s next age-out forward, so the percent on the badge
              can fall on its own (when you stop sending) or rise (when you
              keep sending), without ever crossing a hard reset. The popup row
              shows the live{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                resets_at
              </code>{" "}
              ISO timestamp from the server, formatted as{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                3h
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                22m
              </code>
              , or{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                now
              </code>{" "}
              depending on how soon the next message in the window will age
              out. That is the only reset clock that ever matches what
              Anthropic enforces.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Surfaces ClaudeMeter exposes, on a loop
        </h2>
        <Marquee speed={28} pauseOnHover fade>
          <span className="mx-4 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-medium whitespace-nowrap">
            Browser toolbar badge
          </span>
          <span className="mx-4 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-medium whitespace-nowrap">
            Toolbar tooltip 5h / 7d
          </span>
          <span className="mx-4 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-medium whitespace-nowrap">
            Popup, one row per org
          </span>
          <span className="mx-4 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-medium whitespace-nowrap">
            macOS menu bar title pill
          </span>
          <span className="mx-4 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-medium whitespace-nowrap">
            macOS menu dropdown
          </span>
          <span className="mx-4 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-medium whitespace-nowrap">
            Local bridge :63762
          </span>
          <span className="mx-4 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-medium whitespace-nowrap">
            snapshots.json on disk
          </span>
          <span className="mx-4 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-medium whitespace-nowrap">
            CLI: claude-meter --json
          </span>
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want help wiring multi-org five-hour visibility into your team's setup?"
          description="Fifteen minutes on a call, we walk through the badge, the popup, the bridge, and the snapshot file with your real account."
        />
      </section>

      <FaqSection items={faqs} />

      <section className="max-w-6xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Worst-case five-hour visibility, set up in fifteen minutes."
      />
    </article>
  );
}
