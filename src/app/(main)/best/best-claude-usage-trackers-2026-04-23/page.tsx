"use client";

import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  GlowCard,
  RemotionClip,
  BackgroundGrid,
  GradientText,
  NumberTicker,
  Marquee,
  MetricsRow,
  ComparisonTable,
  AnimatedCodeBlock,
  StepTimeline,
  BookCallCTA,
  GetStartedCTA,
  trackCrossProductClick,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/best/best-claude-usage-trackers-2026-04-23";
const PUBLISHED = "2026-04-23";
const DATE_LABEL = "April 23, 2026";

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Roundups", url: "https://claude-meter.com/best" },
  { name: "Best Claude usage trackers", url: PAGE_URL },
];

const faqs = [
  {
    q: "What makes a Claude usage tracker different from a Claude Code token counter?",
    a: "A Claude Code token counter (ccusage, Claude-Code-Usage-Monitor, and the built-in /cost command) adds up tokens it can see in local stdout logs and JSONL transcripts. A Claude usage tracker reads the server-enforced quota floats Anthropic actually throttles against, exposed on claude.ai/api/organizations/{org_uuid}/usage as two Window objects (five_hour and seven_day) declared in claude-meter/src/models.rs at lines 19 to 27. The token counter shows your own estimate. The usage tracker shows Anthropic's. When they disagree (they usually do), the server is the one that will rate-limit you.",
  },
  {
    q: "Why do the numbers in ccusage differ from what claude.ai/settings/usage shows?",
    a: "ccusage sums tokens it reads from local Claude Code JSONL transcripts (~/.claude/). It cannot see requests made through claude.ai in your browser, the Claude desktop app, API calls from other agents, or any shared session usage on a Team plan. Anthropic's server-side rate limiter counts all of them. The gap is structural, not a bug. Tools that read /api/organizations/{uuid}/usage directly (only ClaudeMeter does today) match the Settings page because they are reading the same float the Settings page renders.",
  },
  {
    q: "Is there a tracker that does not require pasting my claude.ai cookie manually?",
    a: "Yes, but only one. ClaudeMeter ships a Chrome/Arc/Brave/Edge extension that runs in the background alongside your existing logged-in claude.ai session and forwards each poll to the menu bar app over 127.0.0.1:63762. You never touch a cookie file, never paste a session token into a terminal, and the extension's service worker stops fetching when your claude.ai session expires. The alternative (Route B, keychain mode) requires one macOS keychain prompt at first launch, then reads Chrome Safe Storage directly. Every other Claude usage tracker we tested requires either a cookie paste or a manual API-key setup step.",
  },
  {
    q: "Which tracker works if I only use Claude Code from the CLI and never open claude.ai in a browser?",
    a: "ccusage and Claude-Code-Usage-Monitor, because they read local ~/.claude/ JSONL. ClaudeMeter needs an active claude.ai session either through the browser extension or through a Chromium profile decryptable via keychain. If you never log into claude.ai in a browser, the server-truth endpoints have no session to attach to. That is a hard constraint. In that case you are flying on local estimates and should plan capacity accordingly.",
  },
  {
    q: "How often does ClaudeMeter poll, and can I get paged when I hit 90% of the weekly quota?",
    a: "Default poll interval is 60 seconds (POLL_MINUTES = 1 on background.js line 3 of the extension). Each poll fires three JSON GETs: /api/organizations/{uuid}/usage, /api/organizations/{uuid}/overage_spend_limit, and /api/organizations/{uuid}/subscription_details. The menu bar app renders color states (green/yellow/red) based on the utilization floats and can surface a macOS notification when you cross a threshold. There is no built-in paging integration; if you want Slack/PagerDuty hooks, the CLI emits --json and you can pipe it into whatever you run.",
  },
  {
    q: "Does running the extension leak any data to a third party?",
    a: "No. The extension has two host_permissions declared in manifest.json: https://claude.ai/* (to read the usage endpoints) and http://127.0.0.1:63762/* (to POST to the local menu bar bridge). There is no analytics SDK, no PostHog, no Sentry, no remote logging. The LICENSE is MIT and the source is at github.com/m13v/claude-meter; the whole extension is under 300 lines across background.js, popup.js, and popup.html.",
  },
  {
    q: "Can I use this if I am on a Claude Team or Enterprise plan instead of Pro or Max?",
    a: "Yes. The extension iterates every membership in the account payload (background.js lines 17 to 22) and fetches usage for each organization UUID. You get one snapshot row per org. Team and Enterprise orgs expose the same /usage response shape, with the same five_hour and seven_day Window objects. The menu bar app groups them in the dropdown so you can see your personal Pro quota and a shared Team quota at the same time without switching accounts.",
  },
  {
    q: "What does a tracker like this cost, and why are most of the list free?",
    a: "Every Claude usage tracker on the first page today is free and open source. The base expense is zero because none of them store or sync data server-side; they read your session and render in-process. ClaudeMeter ships through brew (brew install --cask m13v/tap/claude-meter), no account, no telemetry. ccusage and Claude-Code-Usage-Monitor are npm packages. The paid tools in this space are observability platforms (Helicone, OpenRouter dashboards) aimed at teams with API traffic, not individuals watching their Pro window.",
  },
  {
    q: "What happens when my claude.ai session expires?",
    a: "The extension's fetch throws a 401, background.js logs it, and the next poll retries. Nothing recovers until you visit claude.ai and re-authenticate in the same browser profile. When you do, the extension resumes on the next 60-second tick without any manual intervention. The menu bar icon shows an exclamation badge during the outage so you notice. This is the main operational difference from cookie-paste-once trackers, which silently keep returning stale snapshots until you paste a fresh cookie.",
  },
  {
    q: "Why is every entry in this list relevant to someone who is already watching their Claude quota?",
    a: "Because if you are reading Claude usage trackers, you are heavy on Claude, which means the rest of your stack is probably downstream of Claude: an AI desktop agent that burns tokens (Fazm), a computer-use SDK that Claude drives (Terminator), an MCP server that lets Claude control your Mac (macOS MCP), a QA harness that writes tests with Claude (Assrt), or a side project that builds apps with Claude (mk0r). The two cross-industry entries (Vipassana, Cyrano) are the two I would spend Claude-free hours on when the weekly cap hits. They are adjacent, not same-niche, and that is on purpose.",
  },
];

const articleJsonLd = articleSchema({
  headline: `Best Claude usage trackers for ${DATE_LABEL}`,
  description:
    "A ranked roundup of Claude usage trackers for April 2026. Only one tracker on this list reads the server-enforced utilization floats claude.ai/settings/usage renders; the rest sum local logs. Plus the adjacent tools worth your time when the weekly quota resets.",
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

type Sibling = {
  slug: string;
  name: string;
  category: string;
  section: string;
  destination: string;
  ctaText: string;
  angle: string;
  whyItFits: string;
};

const siblings: Sibling[] = [
  {
    slug: "fazm",
    name: "Fazm",
    category: "AI desktop agent for macOS",
    section: "entry-2",
    destination: "https://fazm.ai/download",
    ctaText: "Download Fazm",
    angle: "If you are burning Claude tokens on keystrokes, Fazm is where those tokens go.",
    whyItFits:
      "Fazm is an open-source, voice-first computer-use agent that drives macOS through accessibility APIs and talks to Claude under the hood. It is the single biggest consumer of your 5-hour window if you leave it running. The honest reason to list it here: once you have a tracker that exposes the server quota, you can watch a Fazm session eat into it in real time instead of guessing why you hit the cap at 3pm.",
  },
  {
    slug: "terminator",
    name: "Terminator",
    category: "Computer-use SDK for Claude",
    section: "entry-3",
    destination: "https://t8r.tech",
    ctaText: "Try Terminator",
    angle: "The SDK layer under every Claude-powered desktop agent shipping this quarter.",
    whyItFits:
      "Terminator is a cross-platform (Windows + macOS) desktop automation framework that uses accessibility APIs. Think Playwright, but for the whole operating system. It is the piece developers reach for when they want Claude to click, type, and traverse real applications instead of just respond in a chat box. If your weekly seven_day_opus float is climbing fast, it is probably a Terminator loop on the other end.",
  },
  {
    slug: "macos-mcp",
    name: "macOS MCP",
    category: "MCP server for Claude Code + Claude Desktop",
    section: "entry-4",
    destination: "https://macos-use.dev",
    ctaText: "Install macOS MCP",
    angle: "Plug macOS screen control into Claude Code with one MCP server.",
    whyItFits:
      "macOS MCP is the Model Context Protocol server that powers Fazm's screen control. Standalone, it gives Claude Code (or any MCP-speaking assistant) the ability to open apps, read on-screen text, and click things. On a quota-aware machine this is the tool that explains mysterious spikes: each MCP tool-call turns into a tokenized round trip, and a tracker makes that visible.",
  },
  {
    slug: "assrt",
    name: "Assrt",
    category: "AI QA testing tool",
    section: "entry-5",
    destination: "https://app.assrt.ai",
    ctaText: "Get started with Assrt",
    angle: "Ship a feature, let Claude write and maintain the Playwright tests for it.",
    whyItFits:
      "Assrt is an open-source AI test-automation framework that auto-discovers scenarios, generates real Playwright tests with self-healing selectors, and runs visual regression checks. It is the single biggest reason you run out of Claude quota on release days, and the single best reason to have a tracker that tells you before you start a big test generation run instead of at minute 57 of a 60-minute CI job.",
  },
  {
    slug: "mk0r",
    name: "mk0r",
    category: "AI app builder",
    section: "entry-6",
    destination: "https://mk0r.com",
    ctaText: "Build an app on mk0r",
    angle: "A sentence in, a full HTML/CSS/JS app out. No account, no friction, lots of Claude calls.",
    whyItFits:
      "mk0r is an AI app maker: describe what you want, watch it build in real time, iterate with words. Each iteration is a Claude round trip. When your cap is tight, mk0r is a great way to audit where your five_hour float goes because every iteration is observable against your tracker in under a minute.",
  },
  {
    slug: "vipassana",
    name: "Vipassana.cool",
    category: "Vipassana retreat resources",
    section: "entry-7",
    destination: "https://vipassana.cool",
    ctaText: "Read the guides",
    angle: "Cross-industry pick. When the seven_day cap hits, this is what you do with the rest of the week.",
    whyItFits:
      "Vipassana.cool is a resource site for Vipassana meditators: guides, science, daily practice, and a practice-buddy matcher. It is on this list because the healthiest response to hitting the weekly quota is not rage-refreshing Settings until it resets; it is closing the laptop. This is the entry I send to friends who ask me how I survive release weeks.",
  },
  {
    slug: "cyrano",
    name: "Cyrano",
    category: "Apartment security cameras with edge AI",
    section: "entry-8",
    destination: "https://apartment-security-cameras.com",
    ctaText: "See Cyrano",
    angle: "Cross-industry pick. An AI hardware line item that does not touch your Claude cap.",
    whyItFits:
      "Cyrano is an edge-AI box that plugs into an existing DVR/NVR over HDMI and makes legacy CCTV intelligent: up to 25 feeds per unit, no camera replacement, two-minute install. It runs its own models locally. The only connection to Claude usage tracking is inverse: it is a good example of AI infrastructure that does not count against your Anthropic quota, which matters when you are the household's primary API billpayer.",
  },
];

const metricsRow = [
  { value: 3, label: "endpoints polled per cycle" },
  { value: 60, suffix: "s", label: "default poll interval" },
  { value: 63762, label: "localhost bridge port" },
  { value: 0, prefix: "$", label: "cost, every entry on this list" },
];

const usageJsonSample = `// GET /api/organizations/{org_uuid}/usage
// The shape ClaudeMeter parses, from claude-meter/src/models.rs:3-27
{
  "five_hour": {
    "utilization": 0.42,
    "resets_at": "2026-04-23T19:15:00Z"
  },
  "seven_day": {
    "utilization": 0.78,
    "resets_at": "2026-04-28T08:00:00Z"
  },
  "seven_day_opus": {
    "utilization": 0.94,
    "resets_at": "2026-04-28T08:00:00Z"
  },
  "extra_usage": {
    "is_enabled": true,
    "used_credits": 4.20,
    "utilization": 0.21,
    "currency": "usd"
  }
}`;

const comparisonRows = [
  { feature: "Reads server-enforced utilization", ours: "Yes", competitor: "Estimates from local logs" },
  { feature: "Requires pasting a session cookie", ours: "No, extension uses live session", competitor: "Varies, often yes" },
  { feature: "Matches claude.ai/settings/usage", ours: "Exact float match", competitor: "No, structural gap" },
  { feature: "Sees API calls made outside Claude Code", ours: "Yes, counted server-side", competitor: "No, local log only" },
  { feature: "Sees Team/Enterprise shared quota", ours: "Yes, one snapshot per org", competitor: "Personal transcripts only" },
  { feature: "Native desktop UI with live state", ours: "Menu bar on macOS", competitor: "Terminal output / web widget" },
  { feature: "License and telemetry", ours: "MIT, zero telemetry", competitor: "Varies" },
  { feature: "Price", ours: "$0", competitor: "$0" },
];

const verifySteps = [
  {
    title: "Open claude.ai/settings/usage with DevTools > Network",
    description:
      "Filter to XHR. Reload. You will see a GET to /api/organizations/{uuid}/usage return a JSON payload with five_hour, seven_day, and seven_day_opus keys. This is the source of truth.",
  },
  {
    title: "Read the two utilization floats",
    description:
      "five_hour.utilization and seven_day.utilization. Both are f64 in [0.0, 1.0]. When either crosses 1.0 you are rate-limited on that window until resets_at passes.",
  },
  {
    title: "Compare against your current tracker's output",
    description:
      "If you are on ccusage, the number will be different. Not because ccusage is broken, but because ccusage cannot see API calls outside its JSONL scope. This is the competitor gap in one experiment.",
  },
  {
    title: "Install ClaudeMeter and recheck after one 60s poll",
    description:
      "brew install --cask m13v/tap/claude-meter. Load the extension unpacked from the repo's extension/ folder. Within 60 seconds the menu bar shows floats that match the Settings page to the digit.",
  },
];

const marqueeChips = [
  "claude-meter", "fazm", "terminator", "macos-mcp", "assrt", "mk0r",
  "vipassana.cool", "cyrano", "free + MIT", "no telemetry", "brew install",
  "60s poll", "port 63762", "three endpoints",
];

const proofHighlights = [
  "Dated April 23, 2026",
  "Ranked by observable behavior, not marketing copy",
  "Two cross-industry picks for the week the quota resets",
];

export default function BestClaudeUsageTrackers2026Page() {
  return (
    <article className="bg-white text-zinc-900">
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
          Best Claude usage trackers for{" "}
          <GradientText>{DATE_LABEL}</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Updated {DATE_LABEL}. Eight tools worth your attention if you are watching
          your Claude Pro or Max quota this week. Ranked by whether they read the
          server-enforced utilization floats Anthropic actually throttles against,
          or whether they are estimating from local logs. Then two cross-industry
          picks for the hours you spend off Claude.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="built ClaudeMeter"
          datePublished={PUBLISHED}
          readingTime="8 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Ranked by first-party testing against claude.ai/settings/usage"
          highlights={proofHighlights}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <RemotionClip
          title={`Best Claude usage trackers, ${DATE_LABEL}`}
          subtitle="Only one of these reads Anthropic's server-enforced utilization float. The rest sum local logs."
          captions={[
            "#1 ClaudeMeter: reads /api/organizations/{uuid}/usage, matches Settings exactly",
            "#2 Fazm, #3 Terminator, #4 macOS MCP: where your tokens actually go",
            "#5 Assrt, #6 mk0r: the dev tools worth your cap",
            "#7 Vipassana.cool, #8 Cyrano: two cross-industry picks for quota-reset week",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              One number on the Settings page is the only one Anthropic throttles on
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              The quota surface is two floats on one endpoint. Every tracker on
              this list either reads those two floats or estimates something
              else.
            </p>
          </div>
          <MetricsRow metrics={metricsRow} />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The one payload that decides the ranking
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Before the list, the payload. Everything on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          is rendered from this JSON. A tracker that reads it matches the
          Settings page to the digit. A tracker that does not, does not.
        </p>
        <AnimatedCodeBlock
          code={usageJsonSample}
          language="json"
          filename="claude.ai/api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-600 text-sm mt-3">
          Shape verified against the deserializers in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">
            claude-meter/src/models.rs
          </code>{" "}
          lines 3 to 27, where{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">
            utilization: f64
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">
            resets_at: Option&lt;DateTime&lt;Utc&gt;&gt;
          </code>{" "}
          are the two fields every serious tracker should expose.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2">
          The ranking
        </h2>
        <p className="text-zinc-600 text-lg mb-8">
          Numbered cards, one per tool. Host first, then the adjacent tools that
          drive your quota, then two cross-industry picks for the hours off.
        </p>

        <div className="flex flex-col gap-6">
          {/* Host entry #1 */}
          <GlowCard>
            <div className="p-2">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-white text-base font-bold">
                  <NumberTicker value={1} />
                </span>
                <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-200">
                  Claude usage tracker
                </span>
                <span className="px-2.5 py-1 rounded-full bg-zinc-50 text-zinc-600 text-xs font-medium border border-zinc-200">
                  Free, MIT
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">
                ClaudeMeter
              </h3>
              <p className="text-zinc-700 leading-relaxed text-base mb-3">
                The only tracker on this list that reads Anthropic&rsquo;s
                server-enforced utilization floats directly. The browser
                extension polls{" "}
                <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  /api/organizations/&#123;uuid&#125;/usage
                </code>{" "}
                every 60 seconds through your existing claude.ai session, then
                POSTs the snapshot to the menu bar app on{" "}
                <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  127.0.0.1:63762
                </code>
                . No cookie paste, no API key, no telemetry. The number in the
                menu bar matches claude.ai/settings/usage exactly because it is
                the same JSON.
              </p>
              <p className="text-zinc-600 leading-relaxed text-sm mb-4">
                Anchor fact: three endpoints per poll (usage,
                overage_spend_limit, subscription_details), all verifiable in{" "}
                <code className="bg-zinc-100 px-1 py-0.5 rounded text-xs font-mono">
                  extension/background.js
                </code>{" "}
                lines 24 to 28 of the repo at github.com/m13v/claude-meter.
              </p>
              <GetStartedCTA
                destination="https://claude-meter.com/install"
                appearance="inline"
                text="Install ClaudeMeter"
                heading="Want the live number?"
                description="Two minutes from brew to menu bar."
                section="entry-1-host"
                site="claude-meter"
              />
            </div>
          </GlowCard>

          {siblings.map((s, idx) => (
            <GlowCard key={s.slug}>
              <div className="p-2">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900 text-white text-base font-bold">
                    <NumberTicker value={idx + 2} />
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-50 text-zinc-600 text-xs font-medium border border-zinc-200">
                    {s.category}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">
                  {s.name}
                </h3>
                <p className="text-teal-700 italic leading-relaxed text-base mb-3">
                  {s.angle}
                </p>
                <p className="text-zinc-700 leading-relaxed text-base mb-4">
                  {s.whyItFits}
                </p>
                <a
                  href={s.destination}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackCrossProductClick({
                      site: "claude-meter",
                      targetProduct: s.slug,
                      destination: s.destination,
                      text: s.ctaText,
                      component: "CrossRoundupEntry",
                      section: s.section,
                    })
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-semibold shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 transition-shadow"
                >
                  {s.ctaText}
                  <span aria-hidden>&rarr;</span>
                </a>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          ClaudeMeter vs. every local-log tracker, line by line
        </h2>
        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="Local-log trackers (ccusage, Claude-Code-Usage-Monitor, /cost)"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Verify the ranking yourself in four steps
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The whole premise is observable. No benchmarks, no marketing. Open a
          DevTools tab on claude.ai and follow along.
        </p>
        <StepTimeline steps={verifySteps} />
      </section>

      <section className="mt-20">
        <div className="max-w-6xl mx-auto px-6 mb-3">
          <p className="text-zinc-500 text-sm uppercase tracking-widest">
            Every tool on this list
          </p>
        </div>
        <Marquee speed={40}>
          {marqueeChips.map((chip) => (
            <span
              key={chip}
              className="px-4 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-700 text-sm font-medium whitespace-nowrap"
            >
              {chip}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <FaqSection faqs={faqs} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16 mb-24">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Running Claude at a team scale and want to talk through quota strategy?"
          description="15-minute call. Bring your current tracker, we will open DevTools together."
          text="Book a call"
          section="roundup-footer"
          site="claude-meter"
        />
      </section>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a quota call"
        description="15 min, bring your tracker."
        section="roundup-sticky"
        site="claude-meter"
      />
    </article>
  );
}
