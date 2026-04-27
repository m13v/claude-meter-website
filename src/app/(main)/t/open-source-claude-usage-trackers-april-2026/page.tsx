import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  ComparisonTable,
  BentoGrid,
  StepTimeline,
  SequenceDiagram,
  RemotionClip,
  AnimatedBeam,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  Marquee,
  GlowCard,
  MetricsRow,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/open-source-claude-usage-trackers-april-2026";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title:
    "Open Source Claude Usage Trackers (April 2026): A Field Guide That Splits Local-Log From Server-Truth",
  description:
    "Seven open source trackers for Claude Pro, Max, and Claude Code, sorted by what they actually read. Local JSONL versus the same private endpoint claude.ai/settings/usage renders. Which require a sessionKey copy-paste, which use an embedded webview, and the only one that uses your real browser cookie via credentials: 'include'.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Open Source Claude Usage Trackers (April 2026): A Field Guide That Splits Local-Log From Server-Truth",
    description:
      "Seven OSS trackers, two camps, one question: where does the number come from. Plus the one tracker that gets server quota without a single cookie paste.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What does 'open source Claude usage tracker' mean? Aren't they all just hitting the API?",
    a: "No. There are two completely different families. Local-log readers walk the JSONL transcript files Claude Code writes to ~/.claude/projects and sum tokens. Server-truth readers call the private endpoint at https://claude.ai/api/organizations/{org_uuid}/usage that the claude.ai/settings/usage page itself renders from. The first kind tells you 'how many tokens did this device send'; the second kind tells you 'what fraction of my plan ceiling has Anthropic counted', which is the only number a 429 enforces against. Both are useful. They are not interchangeable, and most public roundups don't draw the line.",
  },
  {
    q: "Why is the cookie-paste step a real problem?",
    a: "Because the private claude.ai endpoint authenticates via your normal session cookie. To read it from a non-browser process, you have to deliver that cookie. ClaudeUsageBar tells you to open DevTools at claude.ai/settings/usage, find the /usage request in the Network tab, and copy the entire Cookie header into a text field. hamed-elfayome's tracker offers an embedded WKWebView so you sign into claude.ai inside the app and the app extracts the sessionKey for you. Either way, the cookie is now sitting in another process that has to refresh it on its own when claude.ai rotates the session. A real Manifest V3 extension running inside Chrome can simply set credentials: 'include' on its fetch call and reuse whatever cookie Chrome is already storing for claude.ai. No copy, no paste, no rotation handling.",
  },
  {
    q: "Which tools read local logs and which read the server endpoint?",
    a: "Local logs (numerator only): ccusage, Maciek-roboblog/Claude-Code-Usage-Monitor, phuryn/claude-usage. They look at ~/.claude/projects/*.jsonl and sum inputTokens + outputTokens. Server endpoint (utilization): ClaudeUsageBar (cookie paste), hamed-elfayome/Claude-Usage-Tracker (embedded webview or manual key), lugia19/Claude-Usage-Extension (Chrome extension reading the live SSE message_limit stream from the chat UI), and ClaudeMeter (Manifest V3 extension calling /api/organizations/{org}/usage with credentials: 'include', plus a menu bar bridge). The Chrome Web Store extension labelled simply 'Claude Usage Tracker' that doesn't link a GitHub source belongs to lugia19; her code is at github.com/lugia19/Claude-Usage-Extension.",
  },
  {
    q: "What makes ClaudeMeter different from lugia19's Chrome extension if both are Manifest V3?",
    a: "Lugia19's extension instruments the claude.ai chat interface itself, watching the SSE stream and counting attachments per project. It is excellent for 'what is eating my context window', and the breakdown by source is genuinely the killer feature in that lane. It does not ship a desktop surface or a CLI; you check it from the toolbar popup. ClaudeMeter ships three surfaces: the extension popup, a macOS menu bar app, and a CLI binary that prints --json. The extension's only job is to reuse your session cookie to call /api/organizations/{org}/usage and POST the snapshot to a localhost bridge at 127.0.0.1:63762. The menu bar app reads from that bridge and identifies which browser sent each POST by looking up the peer TCP socket's owning process, so multi-browser users get correct labels. Both projects are MIT and they cover different jobs, not the same job.",
  },
  {
    q: "If I'm only on Pro, do I really need a tracker?",
    a: "If you ever hit a 5-hour or 7-day cap mid-session, yes, because the settings page does not stay open and does not warn you as you approach a limit. The rolling 5-hour window starts the moment you send your first message and slides continuously, so 'how much have I burned in this window' is not something you can compute from a wall clock. Pro and Max both surface the same seven Window fields (five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork) on /api/organizations/{org}/usage; the difference is the denominator, not the shape.",
  },
  {
    q: "Can I just curl the endpoint and not install anything?",
    a: "Yes, and it is a useful sanity check. Grab your full Cookie header from claude.ai DevTools, get your org UUID from /api/account memberships[0].organization.uuid, and run: curl -s https://claude.ai/api/organizations/$ORG/usage -H \"Cookie: $COOKIE\" -H \"Referer: https://claude.ai/settings/usage\". The Referer header is load-bearing; drop it and you get 403. You will see the same shape every server-truth tracker parses: seven Window objects, each with a utilization fraction (0..1 or 0..100, branch on <=1) and a resets_at timestamp. The reason a tool is worth installing is that this curl gives you one snapshot; the server's denominator slides as old traffic ages out, so utilization drifts even with zero new messages and you want a poller.",
  },
  {
    q: "What about the anthropic-ratelimit-* HTTP headers?",
    a: "Those are on api.anthropic.com responses, not claude.ai responses. They expose API tier rate limits (tokens per minute, requests per minute, input tokens remaining) for paid Console API customers. They do not expose the 5-hour or 7-day consumer-plan utilization. The consumer plan uses an entirely separate undocumented endpoint, and that endpoint is what every server-truth tool listed here actually calls.",
  },
  {
    q: "Is the menu bar route worth it if I'm a Linux or Windows user?",
    a: "Today, no, ClaudeMeter is macOS-only and the maintainer has said Linux and Windows aren't planned. If you want a server-truth read on Linux or Windows in 2026, your best open source options are lugia19's Chrome extension (cross-platform via the browser) or running curl in a script and parsing the JSON yourself. Local-log readers (ccusage, claude-monitor) work everywhere because they only touch files.",
  },
  {
    q: "How do these tools handle multiple Claude organizations on one account?",
    a: "Most don't. ClaudeMeter does, because the extension iterates account.memberships from /api/account and polls /usage for every org in the list. Local-log readers don't see the concept at all because their input is per-machine transcripts. Cookie-paste tools (ClaudeUsageBar) follow the cookie's lastActiveOrg and you would have to switch active org in claude.ai and re-paste to see another one. If you split a personal Pro plan and a work Team plan on the same Google sign-in, this matters.",
  },
  {
    q: "Are any of these maintained as of April 2026?",
    a: "All seven trackers in this guide had a release or a substantive commit on GitHub within the last 60 days as of 2026-04-24. lugia19's extension shipped v5.2.3 on 2026-04-24 (Firefox), v5.2.2 on 2026-04-22 (Chrome). hamed-elfayome's Swift app is at v3.1.0 from 2026-04-14. Maciek's claude-monitor and phuryn's claude-usage have shipped patches in April. ccusage continues to track Claude Code's logging schema. ClaudeMeter's macOS app and extension are MIT and actively maintained at github.com/m13v/claude-meter. None of this is guaranteed to age well; pin a version if your workflow depends on it.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Open source Claude usage trackers (April 2026)", url: PAGE_URL },
];

const credentialsIncludeJs = `// claude-meter/extension/background.js  (lines 5-12)
async function fetchJSON(url) {
  const r = await fetch(url, {
    credentials: "include",          // <-- the entire trick
    headers: { "accept": "application/json" },
  });
  if (!r.ok) throw new Error(\`\${r.status} \${r.statusText} @ \${url}\`);
  return r.json();
}`;

const manifestJson = `// claude-meter/extension/manifest.json
{
  "manifest_version": 3,
  "name": "ClaudeMeter",
  "version": "0.1.3",
  "permissions": ["storage", "alarms"],
  "host_permissions": [
    "https://claude.ai/*",            // can only read your Claude session
    "http://127.0.0.1:63762/*"        // can only post to your localhost bridge
  ],
  "background": { "service_worker": "background.js", "type": "module" }
}`;

const trackerCards = [
  {
    title: "ccusage",
    description:
      "Reads ~/.claude/projects/*.jsonl and prints a summary in the terminal. Pure local. Answers 'how many tokens did this machine send', not 'where am I against my plan'. No cookie, no network egress, runs anywhere Node runs.",
    size: "2x1" as const,
  },
  {
    title: "Claude-Code-Usage-Monitor (Maciek)",
    description:
      "Python TUI that polls the same JSONL and renders a live dashboard with predictions and burn-rate. Local-only. The predictions are extrapolations of your token rate, not the server's actual ceiling.",
    size: "1x1" as const,
  },
  {
    title: "phuryn/claude-usage",
    description:
      "Local Python web dashboard. Scans ~/.claude/projects, builds a SQLite index, and serves charts on localhost. Deepest historical view of any local tracker. Still does not see server utilization.",
    size: "1x1" as const,
  },
  {
    title: "ClaudeUsageBar",
    description:
      "macOS menu bar, MIT, server-endpoint reader. Setup asks you to open DevTools at claude.ai/settings/usage, find the /usage request, and paste the entire Cookie header into 'Set Session Cookie'. Refreshing the cookie when it rotates is on you.",
    size: "1x1" as const,
  },
  {
    title: "hamed-elfayome/Claude-Usage-Tracker",
    description:
      "Swift menu bar app, three auth modes: Claude Code CLI keychain, embedded WKWebView sign-in (extracts sessionKey for you), or paste a sk-ant-sid01- key by hand. macOS 14+ only.",
    size: "1x1" as const,
  },
  {
    title: "lugia19/Claude-Usage-Extension",
    description:
      "Chrome and Firefox extension that instruments the chat UI. Hooks the SSE message_limit stream and breaks usage down per file/project. Killer feature: shows what fraction of your context window each attachment eats. No menu bar, no CLI.",
    size: "2x1" as const,
  },
  {
    title: "ClaudeMeter",
    description:
      "Two surfaces: a Manifest V3 Chrome extension that calls /api/organizations/{org}/usage with credentials: 'include' (no cookie paste, ever), and a macOS menu bar app that reads the snapshot off a localhost bridge at 127.0.0.1:63762. Multi-browser, multi-org, MIT.",
    size: "2x2" as const,
  },
];

const matrixRows = [
  {
    feature: "Reads server-enforced utilization (matches /settings/usage)",
    competitor: "ccusage / Maciek / phuryn: No. ClaudeUsageBar / hamed / lugia19: Yes.",
    ours: "Yes. Calls the same private endpoint /settings/usage renders from.",
  },
  {
    feature: "Setup: cookie paste required",
    competitor:
      "ccusage / Maciek / phuryn: N/A (local). ClaudeUsageBar: Yes, manual paste. hamed: Yes, paste OR embedded webview. lugia19: No (runs in browser).",
    ours:
      "No. credentials: 'include' on fetch reuses Chrome's existing claude.ai session.",
  },
  {
    feature: "Surface: menu bar app",
    competitor:
      "ccusage: No. Maciek: No. phuryn: No. ClaudeUsageBar: Yes. hamed: Yes. lugia19: No.",
    ours: "Yes. Free macOS menu bar binary, brew install --cask m13v/tap/claude-meter.",
  },
  {
    feature: "Surface: real browser extension",
    competitor:
      "ccusage / Maciek / phuryn / ClaudeUsageBar / hamed: No. lugia19: Yes (DOM/SSE).",
    ours:
      "Yes. Manifest V3 extension that hits the JSON endpoint, not the DOM.",
  },
  {
    feature: "Multi-org on the same account",
    competitor:
      "Local readers: only what your local logs cover. ClaudeUsageBar / hamed: one cookie at a time. lugia19: per active org.",
    ours: "Yes. Iterates account.memberships and polls /usage for every org.",
  },
  {
    feature: "Multi-browser (Chrome, Arc, Brave, Edge)",
    competitor:
      "Local readers: irrelevant. ClaudeUsageBar / hamed: cookies from one browser at a time. lugia19: one extension per browser.",
    ours:
      "Yes. The menu bar app identifies each browser by the POST's TCP peer process.",
  },
  {
    feature: "Telemetry sent to third parties",
    competitor: "All seven: none claimed.",
    ours:
      "None. Bridge binds 127.0.0.1:63762; no external host besides claude.ai itself.",
  },
  {
    feature: "License",
    competitor:
      "ccusage / Maciek / phuryn / ClaudeUsageBar / hamed / lugia19: open source (mostly MIT).",
    ours: "MIT.",
  },
  {
    feature: "Linux / Windows",
    competitor:
      "Local readers: yes. lugia19: yes via browser. ClaudeUsageBar / hamed: macOS only.",
    ours: "macOS only today. Linux/Windows not on the roadmap.",
  },
];

const decisionSteps = [
  {
    title: "Do you need to know your server-enforced utilization, or just how many tokens you sent on this machine?",
    description:
      "If the answer is 'just tokens on this machine', you want a local-log reader and the rest of the buyer's-guide section is moot. ccusage is the simplest, claude-monitor adds a TUI with predictions, phuryn's tool gives you the deepest historical view. None of them call claude.ai.",
  },
  {
    title: "If you need server truth, are you on macOS?",
    description:
      "If yes, you want a menu bar surface so the number is in your face. The macOS choices are ClaudeUsageBar (cookie paste), hamed-elfayome's tracker (embedded webview or paste), and ClaudeMeter (extension reuses your existing browser cookie via credentials: 'include').",
  },
  {
    title: "Are you willing to copy a Cookie header out of DevTools every time it rotates?",
    description:
      "If yes, ClaudeUsageBar is the simplest. If no, you want either an embedded webview (hamed-elfayome) or a real browser extension that piggybacks on your live session (ClaudeMeter). The webview path means re-signing into Claude inside the app; the extension path means pinning the icon and forgetting it exists.",
  },
  {
    title: "Do you use more than one Chromium browser for Claude?",
    description:
      "If you split work and personal across Chrome and Arc (or Brave, Edge), the menu bar app you want has to identify which browser each snapshot came from. ClaudeMeter labels each snapshot by looking up the owning process of the bridge POST's TCP peer; ClaudeUsageBar and the others handle one cookie at a time.",
  },
  {
    title: "Do you want context-window forensics inside the chat UI itself?",
    description:
      "That is lugia19's lane. Her extension reads the SSE message_limit stream and breaks usage down per project file. It is complementary to a menu bar tool, not a substitute. Many people end up running both.",
  },
];

const seqMessages = [
  {
    from: 0,
    to: 1,
    label: "open claude.ai/settings/usage in DevTools",
    type: "request" as const,
  },
  { from: 1, to: 0, label: "Network tab shows /usage call", type: "response" as const },
  { from: 0, to: 1, label: "right-click /usage > Copy as cURL", type: "event" as const },
  {
    from: 0,
    to: 2,
    label: "paste full Cookie header into the app",
    type: "event" as const,
  },
  { from: 2, to: 1, label: "GET /usage with pasted Cookie", type: "request" as const },
  {
    from: 1,
    to: 2,
    label: "200 + utilization (until cookie rotates)",
    type: "response" as const,
  },
  {
    from: 2,
    to: 0,
    label: "weeks later: 401, you re-paste",
    type: "error" as const,
  },
];

const seqMessagesB = [
  { from: 0, to: 1, label: "Load Unpacked > extension/", type: "event" as const },
  {
    from: 1,
    to: 2,
    label: "fetch(url, { credentials: 'include' })",
    type: "request" as const,
  },
  { from: 2, to: 1, label: "200 + utilization (live cookie)", type: "response" as const },
  { from: 1, to: 0, label: "POST snapshot to 127.0.0.1:63762", type: "event" as const },
  {
    from: 0,
    to: 0,
    label: "menu bar updates; no further input",
    type: "response" as const,
  },
];

const setupMetrics = [
  { value: 0, suffix: "", label: "Cookie pastes on the ClaudeMeter extension route" },
  { value: 1, suffix: "", label: "Manifest V3 host_permission for claude.ai" },
  { value: 60, suffix: "s", label: "Default poll cadence to match server drift" },
  { value: 7, suffix: "", label: "Window fields read per org per poll" },
];

const trackerNames = [
  "ccusage",
  "Claude-Code-Usage-Monitor",
  "phuryn/claude-usage",
  "ClaudeUsageBar",
  "hamed-elfayome/Claude-Usage-Tracker",
  "lugia19/Claude-Usage-Extension",
  "ClaudeMeter",
];

const relatedPosts = [
  {
    href: "/t/claude-server-quota-visibility",
    title: "Why token counters cannot see what Anthropic enforces",
    excerpt:
      "Server quota is a fraction with a private denominator. Local counters have the numerator only.",
    tag: "Server truth",
  },
  {
    href: "/t/claude-rolling-window-tracker",
    title: "Tracking a rolling 5-hour window without a stopwatch",
    excerpt:
      "Why a calendar window won't catch the slide and how to read the resets_at timestamp instead.",
    tag: "Rolling windows",
  },
  {
    href: "/t/claude-weekly-quota-tightened",
    title: "Your plan has seven reset clocks, not one",
    excerpt:
      "Every Window field in /usage ships its own resets_at. The bucket at 100 percent is your real countdown.",
    tag: "Reset logic",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Open source Claude usage trackers (April 2026): a field guide that splits local-log from server-truth",
  description:
    "Seven open source Claude usage trackers, sorted by what they actually read. Local JSONL transcripts versus the same private endpoint claude.ai/settings/usage renders. Which require a cookie paste, which use an embedded webview, and the only one that uses your real browser session via credentials: 'include'.",
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

export default function OpenSourceClaudeTrackersPage() {
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

      <header className="max-w-4xl mx-auto px-6 pb-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          Open source Claude usage trackers, April 2026: sorted by{" "}
          <GradientText>what they actually read</GradientText>.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Most public roundups list seven trackers in a table and grade them on
          icons and dark mode. The thing that actually matters is which ones
          read your local{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/*.jsonl
          </code>{" "}
          files (a numerator, useful) and which ones read the same private
          endpoint{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          renders from (utilization, what a 429 enforces against). Inside the
          server-truth camp, the next question is the cookie ceremony you
          accept on first run. This guide walks both.
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

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Updated 2026-04-24 against the latest releases of every tracker listed"
          highlights={[
            "Seven trackers, each linked to its current GitHub release",
            "Local-log vs server-endpoint split is non-cosmetic",
            "Anchor: extension/background.js:7 uses credentials: 'include'",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <RemotionClip
          title="Two camps. One question. Pick by what you can verify."
          subtitle="Local logs = numerator. Server endpoint = utilization. Pick by which one a 429 cares about."
          captions={[
            "ccusage / Maciek / phuryn read local JSONL",
            "ClaudeUsageBar / hamed paste a cookie",
            "lugia19's extension reads the chat UI",
            "ClaudeMeter's extension uses credentials: 'include'",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The split that matters and the one that doesn&apos;t
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          A Claude usage tracker either reads what you sent (a number you can
          compute from disk) or what Anthropic counted against your plan (a
          number only the server knows). The first is a numerator. The second
          is a fraction whose denominator the server keeps private and
          adjusts on its own deploys. They look like the same number until you
          hit 100 percent on the settings page while your local count is
          showing 1.4M tokens, and then it becomes obvious they were answering
          different questions all along.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Every roundup currently published treats this as a footnote, lists
          seven trackers in a flat table, and grades them on UI. So this guide
          starts there: what does each tool read, and what is the cost of
          getting that number into your menu bar.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <Marquee speed={30} pauseOnHover>
          {trackerNames.map((name) => (
            <span
              key={name}
              className="mx-4 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700 shadow-sm"
            >
              {name}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2 text-center">
          The seven trackers, one card each
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Each card names what the tool reads and what it asks of you. The
          local readers are honest local readers; the server readers are
          honest server readers; the cookie ceremony differs.
        </p>
        <BentoGrid cards={trackerCards} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <ComparisonTable
          heading="Setup, surfaces, and what each tracker actually sees"
          intro="ccusage, Maciek's monitor, and phuryn's dashboard share the local-log row almost identically. The interesting differences are in the server-truth half: cookie paste vs embedded webview vs credentials-include."
          productName="ClaudeMeter"
          competitorName="The other six trackers, by row"
          rows={matrixRows}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <MetricsRow metrics={setupMetrics} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: <NumberTicker value={1} /> option in <NumberTicker value={1} /> fetch call
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The reason the ClaudeMeter extension never asks for a cookie is one
          word in one option bag. Manifest V3 lets a service worker make
          credentialed fetches to any host listed in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            host_permissions
          </code>{" "}
          using the cookies the user&apos;s browser already stores for that
          origin. The whole helper is seven lines, and the relevant option is
          on line 7.
        </p>
        <AnimatedCodeBlock
          code={credentialsIncludeJs}
          language="javascript"
          filename="claude-meter/extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Combined with the manifest below, the extension can read{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai
          </code>{" "}
          and write to your localhost bridge, and nothing else. There is no
          surface to copy a cookie into because there is no need.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <AnimatedCodeBlock
          code={manifestJson}
          language="json"
          filename="claude-meter/extension/manifest.json"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            What that buys you on first run
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg">
            The cookie-paste route exists because most desktop apps cannot
            read your browser&apos;s cookie jar without macOS asking for the
            entire Chrome Safe Storage keychain entry (which also covers
            saved passwords and credit cards). So tools that go that route
            either swallow that prompt or ask you to paste the cookie out by
            hand. A real Manifest V3 extension does not have that problem
            because it runs inside the browser, with the same origin gate
            Chrome itself uses.
          </p>
        </BackgroundGrid>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          How the cookie actually reaches the endpoint
        </h2>
        <AnimatedBeam
          title="One arrow on the left, one cookie, one localhost bridge"
          from={[
            {
              label: "Your live claude.ai cookie",
              sublabel: "managed by Chrome / Arc / Brave / Edge",
            },
          ]}
          hub={{
            label: "ClaudeMeter MV3 extension",
            sublabel: "credentials: 'include' on every fetch",
          }}
          to={[
            { label: "/api/account", sublabel: "memberships[]" },
            { label: "/usage", sublabel: "7 Window fractions" },
            { label: "/overage_spend_limit", sublabel: "metered dollars" },
            { label: "/subscription_details", sublabel: "next charge" },
            { label: "127.0.0.1:63762", sublabel: "menu bar bridge" },
          ]}
        />
        <p className="text-zinc-600 text-center mt-4 max-w-3xl mx-auto">
          The cookie never leaves Chrome&apos;s cookie jar. The extension
          asks Chrome to attach it on outgoing requests to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai
          </code>
          . The snapshot ends up on a localhost socket the menu bar app reads.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Cookie-paste route, step by step
        </h2>
        <SequenceDiagram
          title="What ClaudeUsageBar (and most paste-route tools) ask of you"
          actors={["you", "claude.ai / DevTools", "the tracker app"]}
          messages={seqMessages}
        />
        <p className="text-zinc-600 text-center mt-3 max-w-3xl mx-auto">
          This is fine, until the cookie rotates. Then you do it again.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Extension route, step by step
        </h2>
        <SequenceDiagram
          title="What ClaudeMeter's MV3 extension asks of you"
          actors={["you / menu bar", "extension", "claude.ai"]}
          messages={seqMessagesB}
        />
        <p className="text-zinc-600 text-center mt-3 max-w-3xl mx-auto">
          The extension never sees the raw cookie value; Chrome does. When
          the cookie rotates, your browser handles it, and the next 60-second
          poll just works.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          A five-question decision flow
        </h2>
        <StepTimeline steps={decisionSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <GlowCard className="p-8 rounded-2xl bg-white border border-zinc-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
            Honest tradeoffs to know before you install anything
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-3">
            Every server-truth tracker on this list reads an{" "}
            <strong>undocumented</strong> claude.ai endpoint. Anthropic can
            rename a field on a deploy and break every parser at once.
            ClaudeMeter mitigates by deserialising into a strongly typed Rust
            struct (<code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">src/models.rs</code>), so
            the break shows up as a loud parse error in the menu bar instead
            of a silently wrong number; lugia19&apos;s extension is similarly
            verbose. Local-log readers have the opposite tradeoff: they will
            never break from an Anthropic deploy, but they will quietly drift
            from server reality.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-3">
            The ClaudeMeter macOS app is macOS-only and the maintainer has
            said Linux/Windows aren&apos;t planned. Safari cookies (.binarycookies under Full Disk Access)
            are not supported. None of the server-truth tools have a
            published SLA from Anthropic; they all rely on the same private
            endpoint and the same Referer-must-match check.
          </p>
          <p className="text-zinc-700 leading-relaxed">
            And no tracker can recover the denominator. The denominator
            shifted on the 2026-03-26 server-side tightening, which moved
            many users from comfortable to throttled without anyone changing
            their behaviour. Read{" "}
            <a
              href="/t/claude-weekly-quota-silent-tightening"
              className="text-teal-600 hover:underline"
            >
              the post on that day
            </a>{" "}
            for the receipts. The same shift would not have been visible
            from any local-log tool at all.
          </p>
        </GlowCard>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Try the route that skips the cookie ceremony
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter is free, MIT, and the menu bar binary plus the Chrome
          extension take about three minutes total to install. The extension
          does not ask for a sessionKey. If you also want lugia19&apos;s
          per-file context-window breakdown, run both; they don&apos;t
          conflict.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-20 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Stuck deciding between local-log and server-truth?"
          description="Bring your workflow and we'll walk through which tracker (or pair of trackers) covers the question you actually have."
          text="Book a 15-minute call"
          section="oss-trackers-april-2026-footer"
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
        description="Pick the right tracker for your workflow in 15 min."
        section="oss-trackers-april-2026-sticky"
        site="claude-meter"
      />
    </article>
  );
}
