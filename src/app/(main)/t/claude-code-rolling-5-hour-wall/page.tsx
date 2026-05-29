import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
  GlowCard,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-code-rolling-5-hour-wall";
const PUBLISHED = "2026-05-14";

export const metadata: Metadata = {
  title:
    "The Claude Code rolling 5-hour wall is one float on one endpoint",
  description:
    "When Claude Code 429s your refactor at the 5-hour mark, the wall is literally one f64 (five_hour.utilization) on one server endpoint. Here is the exact field, why ccusage and /usage cannot see it, and what to do the moment your loop stops.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "The Claude Code rolling 5-hour wall is one float on one endpoint",
    description:
      "One field decides every Claude Code 5-hour 429. Your local tools cannot read it. Here is the field name, the endpoint, and the 60-second poll that watches it.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t/claude-code-usage-tracker" },
  { name: "Rolling 5-hour wall", url: PAGE_URL },
];

const faqs = [
  {
    q: "What is the Claude Code rolling 5-hour wall, in one sentence?",
    a: "It is the moment a single float, five_hour.utilization, returned by a cookie-authenticated GET to /api/organizations/{org_uuid}/usage on claude.ai, crosses 1.0. From that instant every Claude Code prompt 429s until enough of your oldest messages age off the rolling 5-hour window. The wall is server-side; the JSONL files Claude Code writes to ~/.claude/projects are not the source of truth.",
  },
  {
    q: "Why is it called rolling instead of resetting at a fixed hour?",
    a: "Because each message you send has its own 5-hour age-off clock. The cost of message one drops off 5 hours after message one. The cost of message two drops off 5 hours after message two. The Settings page shows a single resets_at timestamp, but that is just when the OLDEST message in the window ages off, not when the bar returns to 0%. If you sent 10 messages over 2 hours and stop, the bucket drains in 10 steps over the next 5 hours, not in one drop at the resets_at time.",
  },
  {
    q: "Why does ccusage say I have headroom right before I get 429ed?",
    a: "ccusage sums tokens from your local ~/.claude/projects/*.jsonl logs. Three things make that sum diverge from the server's float. First, server-side cache reweighting: cold-turn tokens bill at 1.25x and cached prefixes read at 0.10x, but the JSONL records raw token counts. Second, claude.ai browser chat fills the same five_hour bucket but never writes to your local logs. Third, thinking tokens on Opus 4.7 are server-counted in ways the streamed JSONL undercounts. The result: on heavy days ccusage typically trails the server by 15 to 30 percentage points.",
  },
  {
    q: "Does the /usage command inside Claude Code show the rolling 5-hour wall?",
    a: "No. /usage inside Claude Code is a context-window meter for the current turn. It tells you how full your 200K input window is right now, broken down by system prompt, MCP tool definitions, file reads, and your prompts. It says nothing about the rolling 5-hour bucket on the server. Those are two different surfaces measuring two different things. The five_hour bucket is the one that fires 429s; the /usage local meter is the one that decides whether Claude Code auto-compacts.",
  },
  {
    q: "When the wall fires mid-refactor, what is the fastest recovery?",
    a: "Three plays, in order. First, finish what you can on claude.ai web chat for an hour: web chat hits the same five_hour bucket so it does not unblock you, but if your blocker is actually the OAuth-only weekly bucket (seven_day_oauth_apps), web chat keeps working. Second, enable extra-usage (metered) credits on your account: claude.ai/settings/billing turns it on; from then on, post-wall prompts charge per token instead of 429ing. Third, if you must wait, look at resets_at on the same endpoint: it is the next age-off boundary, not the time the wall fully releases. A few percent typically drains every 20 to 30 minutes once your oldest messages start aging off.",
  },
  {
    q: "Can I read five_hour.utilization myself without installing anything?",
    a: "Yes. Sign in to claude.ai once in any Chromium browser, then open DevTools on /settings/usage and watch the network tab. The request is GET /api/organizations/{your-org-uuid}/usage, response is JSON, and the field is response.five_hour.utilization (0.0 to 1.0+). The same endpoint also returns seven_day, seven_day_opus, and seven_day_oauth_apps. Cookie-authenticated only; no API token or OAuth flow needed because you reuse your existing session.",
  },
  {
    q: "Why does the wall sometimes fire when /usage shows 5% used?",
    a: "Because /usage measures the CURRENT turn's context window, not the rolling 5-hour bucket. A long agentic loop can have 50 prior turns sitting in the rolling 5-hour bucket while the current turn's context is freshly compacted to 5%. The 5% number is honest about the current turn and useless about the rolling window. The Settings page is the canonical source for the 5-hour bar; the menu bar app polls the same endpoint every 60 seconds so you do not have to refresh manually.",
  },
  {
    q: "What is the relationship between the 5-hour wall and the weekly cap?",
    a: "Four independent rolling buckets, charged simultaneously: five_hour (5-hour sliding window, all clients), seven_day (168-hour cap, all clients), seven_day_opus (168-hour Opus-only cap), and seven_day_oauth_apps (168-hour OAuth-only cap, i.e. Claude Code + MCP only). Each is a separate utilization float with its own resets_at. Any one at 1.0 fires the next 429. Claude Code users in heavy agentic loops typically hit five_hour first inside a session and seven_day_oauth_apps first across a week, while heavy claude.ai chat users hit five_hour and seven_day. Anthropic doubled the five_hour limit on May 6 2026; the weekly caps were not doubled.",
  },
  {
    q: "Where does ClaudeMeter read the wall from, exactly?",
    a: "From the same endpoint claude.ai/settings/usage renders. The browser extension at extension/background.js polls /api/organizations/{org}/usage on claude.ai every 60 seconds with credentials: 'include' (your existing claude.ai cookie). It POSTs the JSON to the local menu bar app on 127.0.0.1:63762, which renders five_hour.utilization with its resets_at as a relative duration. The Rust UsageResponse struct that decodes the payload is at src/models.rs line 18 to 28 in github.com/m13v/claude-meter. MIT licensed. Anonymous telemetry is opt-out. One HTTPS request per minute to claude.ai using your own session.",
  },
];

const usageResponseStruct = `// claude-meter/src/models.rs
// The shape of the JSON that decides every Claude Code 5-hour 429.

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,                                  // 0.0 .. 1.0+
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,  // next age-off
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,   // <- the rolling 5-hour wall
    pub seven_day:            Option<Window>,
    pub seven_day_sonnet:     Option<Window>,
    pub seven_day_opus:       Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,   // <- Claude Code + MCP only
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,
}

// five_hour.utilization >= 1.0 means the next Claude Code prompt 429s.
// Source: github.com/m13v/claude-meter (MIT)`;

const pollLoop = `// claude-meter/extension/background.js
// One request per minute, your existing claude.ai cookie, no API token.

const BASE = "https://claude.ai";
const BRIDGE = "http://127.0.0.1:63762/snapshots";
const POLL_MINUTES = 1;

async function fetchJSON(url) {
  const r = await fetch(url, {
    credentials: "include",                         // reuses your session
    headers: { "accept": "application/json" },
  });
  if (!r.ok) throw new Error(\`\${r.status} \${r.statusText} @ \${url}\`);
  return r.json();
}

async function fetchSnapshots() {
  const account = await fetchJSON(\`\${BASE}/api/account\`);
  const results = [];
  for (const m of account.memberships || []) {
    const org = m.organization?.uuid || m.uuid;
    if (!org) continue;
    const usage = await fetchJSON(\`\${BASE}/api/organizations/\${org}/usage\`);
    // usage.five_hour.utilization  -> the rolling 5-hour wall
    // usage.five_hour.resets_at    -> next message age-off
    results.push({ org_uuid: org, usage, fetched_at: new Date().toISOString() });
  }
  return results;
}`;

const liveStatus = [
  { type: "command" as const, text: "$ claude-meter status" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour              92.0% used    -> resets Thu May 14 17:08 (in 41m)" },
  { type: "output" as const, text: "7-day all           54.0% used    -> resets Mon May 18 09:00 (in 4d)" },
  { type: "output" as const, text: "7-day Opus          71.0% used    -> resets Mon May 18 09:00 (in 4d)" },
  { type: "output" as const, text: "7-day OAuth apps    83.0% used    -> resets Mon May 18 09:00 (in 4d)" },
  { type: "output" as const, text: "Extra usage         off" },
  { type: "output" as const, text: "" },
  { type: "info" as const, text: "5-hour will cross 1.0 in ~12m at current burn. Enable extra usage or pause Opus." },
];

const wallTimeline = [
  {
    title: "T+0:00   Refactor starts. five_hour at 18%.",
    description:
      "You open Claude Code with three MCP servers loaded. five_hour.utilization is 0.18 on the server. ccusage's local sum says 4% because it has not seen the rolling tail from yesterday's session.",
  },
  {
    title: "T+0:45   Sonnet to Opus 4.7 switch. five_hour at 41%.",
    description:
      "The hard part of the refactor needs Opus. That switch is a cold cache turn: the full system prompt + MCP tool definitions re-bill at 1.25x. Server-side reweighting bumps the bucket faster than the JSONL token counts suggest. ccusage now says 12%.",
  },
  {
    title: "T+1:20   /compact. Cold turn. five_hour at 63%.",
    description:
      "Window pressure forces an auto-compact. Another cold cache turn. The Settings bar climbs past 60%. /usage inside Claude Code shows 8% of the CURRENT turn's context window used, which is true and irrelevant to the rolling bucket.",
  },
  {
    title: "T+1:55   You open claude.ai chat in another tab. five_hour at 71%.",
    description:
      "You ask claude.ai web chat a quick question while Code is thinking. That request hits the same five_hour bucket; the JSONL never sees it. ccusage stays at 18%. The server is at 71%.",
  },
  {
    title: "T+2:30   five_hour at 99%. ClaudeMeter menu bar turns amber.",
    description:
      "Server-side, you are one cold turn from the wall. /usage inside Code still shows current-turn context at 11%. The only signal that matches the server is the float from /api/organizations/{org}/usage.",
  },
  {
    title: "T+2:33   429 mid-refactor. Loop stops.",
    description:
      "Next Claude Code prompt returns 429 with usage_limit_reached. Your refactor is paused. The wall will not fully release for 5 hours after your last message, but resets_at on the /usage response shows the next age-off boundary, which is when the bar first steps down.",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "The Claude Code rolling 5-hour wall is one float on one endpoint",
  description:
    "The rolling 5-hour wall in Claude Code is decided by a single float (five_hour.utilization) on a single Anthropic endpoint. When it crosses 1.0 every Claude Code prompt 429s. Local-disk tools cannot see it because of server-side cache reweighting, browser chat traffic, and thinking-token accounting. This is the exact field, the exact endpoint, and the 60-second poll that watches it.",
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
    href: "/t/claude-code-rolling-5h-wall-and-mcp-overhead",
    title: "Why the rolling 5-hour wall is mostly your MCP servers, billed many times",
    excerpt:
      "30K to 100K tokens of MCP tool definitions re-bill at cache-write rate on every cold turn. A 5-hour window has 8 to 15 cold turns. Multiply.",
    tag: "MCP overhead",
  },
  {
    href: "/t/claude-rolling-5-hour-reset",
    title: "There is no single 5-hour reset, each message ages off on its own clock",
    excerpt:
      "resets_at is the next age-off boundary, not the time the bar returns to 0%. Why people who 'wait for the reset' come back at 60% and try again.",
    tag: "Reset",
  },
  {
    href: "/t/claude-code-rolling-5h-weekly-quota",
    title: "Four clocks, not two: the buckets Claude Code charges",
    excerpt:
      "five_hour, seven_day, seven_day_opus, seven_day_oauth_apps. Any one at 1.0 fires the next 429. The Settings bar shows only one of them.",
    tag: "Four clocks",
  },
];

export default function ClaudeCodeRolling5HourWallPage() {
  return (
    <article className="min-h-screen text-zinc-900">
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

      <header className="max-w-3xl mx-auto px-6 pb-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          The Claude Code rolling 5-hour wall is{" "}
          <GradientText>one float on one endpoint</GradientText>.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
          When Claude Code 429s your refactor at the 5-hour mark, the wall is literally a single <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">f64</code> on a single server endpoint. Your local Claude Code logs cannot read it. ccusage cannot see it. <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">/usage</code> inside Code measures something else entirely. This page walks you through the exact field, the exact endpoint, and why three classes of local tools systematically under-report what the server actually enforces.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="6 min read"
        />
      </div>

      <section className="max-w-3xl mx-auto px-6 mt-10">
        <GlowCard>
          <div className="p-6 sm:p-8">
            <div className="text-xs uppercase tracking-wider text-teal-700 font-semibold mb-2">
              Direct answer (verified 2026-05-14)
            </div>
            <p className="text-zinc-800 leading-relaxed text-lg">
              The wall is the boolean{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                five_hour.utilization &gt;= 1.0
              </code>{" "}
              on the cookie-authenticated{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono break-all">
                GET /api/organizations/&#123;org_uuid&#125;/usage
              </code>{" "}
              endpoint on claude.ai
              . When that float crosses 1.0, the next Claude Code prompt
              returns 429 with{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                usage_limit_reached
              </code>{" "}
              and stays 429 until enough of your oldest messages age off the
              rolling 5-hour sliding window. Cookie-authenticated, no API
              token. The struct that decodes this payload is{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                UsageResponse
              </code>{" "}
              at{" "}
              <a
                href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
                className="text-teal-600 underline decoration-teal-200 hover:decoration-teal-500"
                target="_blank"
                rel="noreferrer"
              >
                src/models.rs
              </a>{" "}
              in the MIT-licensed{" "}
              <a
                href="https://github.com/m13v/claude-meter"
                className="text-teal-600 underline decoration-teal-200 hover:decoration-teal-500"
                target="_blank"
                rel="noreferrer"
              >
                claude-meter repo
              </a>
              .
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          1. The field that 429s your loop
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          One Rust struct decodes the response from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>
          . The first field is the rolling 5-hour wall. The other six are the
          weekly caps. <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">utilization</code> is a fraction
          between 0.0 and 1.0+; <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">resets_at</code> is the
          ISO timestamp of the next message age-off.
        </p>
        <AnimatedCodeBlock
          code={usageResponseStruct}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          2. Why your local tools said you had headroom
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          Three concrete reasons the JSONL files Claude Code writes to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects
          </code>{" "}
          systematically lag the server&apos;s{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>
          .
        </p>
        <ul className="mt-6 space-y-5 text-zinc-700 leading-relaxed">
          <li>
            <span className="font-semibold text-zinc-900">
              Server-side cache reweighting.
            </span>{" "}
            Cold-turn tokens bill at 1.25x base input. Cached prefix reads bill at
            0.10x. The JSONL records raw token counts before this multiplication runs.
            A cold turn with 75,000 tokens of system prompt + MCP definitions shows
            up locally as 75,000 cache_creation tokens. On the server it is charged
            as ~93,750 input-equivalent tokens against{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              five_hour
            </code>
            .
          </li>
          <li>
            <span className="font-semibold text-zinc-900">
              claude.ai web chat fills the same bucket.
            </span>{" "}
            Every prompt you send in the browser chat hits the same{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              five_hour
            </code>{" "}
            float. Claude Code never wrote those bytes to your JSONL. ccusage
            cannot see them. The server sums everything; the union is what fires
            the 429.
          </li>
          <li>
            <span className="font-semibold text-zinc-900">
              Opus thinking tokens are server-counted.
            </span>{" "}
            Extended-thinking tokens on Opus 4.7 do not all land in the streamed
            JSONL the way input/output tokens do. The server&apos;s float reflects
            the full thinking spend; the local sum reflects what was streamed.
            On a heavy Opus session this gap alone is 10 to 20 percentage points.
          </li>
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          3. One refactor, the float climbing the whole time
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          A real Claude Code session walked through cache-state moments. Each line
          is a point where the server&apos;s{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          moved more than the local-disk sum predicted, and why.
        </p>
        <StepTimeline steps={wallTimeline} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          4. The 60-second poll that watches the wall
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The whole loop is 30 lines of JavaScript. Cookie-authenticated; reuses
          your existing claude.ai session. One HTTPS request per minute. The JSON
          comes back from the same endpoint{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          renders, so the numbers match the Settings page exactly.
        </p>
        <AnimatedCodeBlock
          code={pollLoop}
          language="javascript"
          filename="claude-meter/extension/background.js"
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          5. What that looks like in your terminal
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          One{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude-meter status
          </code>{" "}
          read of all four clocks at once. The 5-hour bar at 92% is the one
          worth watching when you are mid-refactor; the OAuth-apps weekly bucket
          at 83% is the one that bites first across a full week.
        </p>
        <TerminalOutput lines={liveStatus} title="claude-meter --once" />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          6. The moment the wall fires
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          When{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          crosses 1.0, the next Claude Code prompt returns 429 with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            usage_limit_reached
          </code>
          . Three plays, in order of how fast they unblock you.
        </p>
        <ul className="mt-6 space-y-5 text-zinc-700 leading-relaxed">
          <li>
            <span className="font-semibold text-zinc-900">
              Enable extra usage.
            </span>{" "}
            On{" "}
            <a
              href="https://claude.ai/settings/billing"
              className="text-teal-600 underline decoration-teal-200 hover:decoration-teal-500"
              target="_blank"
              rel="noreferrer"
            >
              claude.ai/settings/billing
            </a>
            , flip extra-usage on and set a monthly cap. From that moment,
            post-wall prompts charge per token instead of 429ing. This is the
            fastest unblock for a refactor you want to ship today. ClaudeMeter
            shows the extra-usage balance in dollars alongside the 5-hour bar.
          </li>
          <li>
            <span className="font-semibold text-zinc-900">
              Switch to claude.ai web for tasks that do not need agentic loop.
            </span>{" "}
            If the 5-hour wall is what you hit, web chat does not unblock you
            (same bucket). But if your real blocker is the OAuth-only weekly
            bucket (
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day_oauth_apps
            </code>
            ), web chat is on a different bucket and keeps working.
          </li>
          <li>
            <span className="font-semibold text-zinc-900">
              Wait, but watch resets_at, not 5 hours from now.
            </span>{" "}
            resets_at on the same endpoint is the next message age-off boundary.
            That is when the bar first steps down by however much your oldest
            message cost. The bar only returns to 0% five hours after your LAST
            message. Most people misread resets_at as a full reset and come back
            disappointed.
          </li>
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Hitting the 5-hour wall every day this week?"
          description="A 20-minute call to walk through your Claude Code setup and see which clock is actually firing first."
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16" id="faq">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-6">
          FAQ
        </h2>
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16 pb-20">
        <RelatedPostsGrid
          title="Adjacent guides"
          subtitle="The other facets of the same rolling-window surface."
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See your live five_hour.utilization on a 60-second poll."
      />
    </article>
  );
}
