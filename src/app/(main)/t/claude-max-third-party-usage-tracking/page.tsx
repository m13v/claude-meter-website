import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
  ComparisonTable,
  GlowCard,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-max-third-party-usage-tracking";
const PUBLISHED = "2026-05-11";

export const metadata: Metadata = {
  title:
    "Claude Max third-party usage tracking: the two server fields you actually need after April 4, 2026",
  description:
    "Since April 4, 2026, Claude Max no longer covers third-party tools (Cline, Roo Code, aider, OpenCode, Cursor) under the plan; those calls bill at per-token API rates against extra_usage. Tracking it now means watching two fields on /api/organizations/{org}/usage at once: seven_day_oauth_apps.utilization and extra_usage.used_credits. Here are both, where they live in the JSON, and how to read them live.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Max third-party usage tracking: the two server fields you actually need",
    description:
      "After April 4 2026, third-party tools bill against extra_usage on Max. Track seven_day_oauth_apps.utilization and extra_usage.used_credits together.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  {
    name: "Claude Max third-party usage tracking",
    url: PAGE_URL,
  },
];

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Claude Max third-party usage tracking" },
];

const faqs = [
  {
    q: "What exactly changed on April 4, 2026 for Claude Max and third-party tools?",
    a: "At noon Pacific on April 4, 2026, Anthropic stopped covering third-party tool usage under the flat Max subscription. Cline, Roo Code, aider, OpenCode, OpenClaw, Cursor, and anything else that authenticates with a Claude OAuth token (or relays your session) now bills at per-token API rates against your extra_usage balance. Claude Code and claude.ai are still inside the plan. Anthropic gave Max users a one-time $200 credit with an April 17 deadline; after that, third-party tool calls draw real dollars from the pay-as-you-go pool. Source: support.claude.com/en/articles/12429409-manage-extra-usage-for-paid-claude-plans, and Anthropic's pricing page.",
  },
  {
    q: "So why is there still a seven_day_oauth_apps bucket if those calls aren't on the plan anymore?",
    a: "Because the field exists on every Max account's /api/organizations/{org}/usage response regardless of how the billing routes. seven_day_oauth_apps tracks utilization attributed to OAuth-connected app traffic against an internal weekly cap that the server still maintains for accounting and rate-shaping. The field stays at zero on accounts with no OAuth integrations and ticks up when integrations are connected. The dollars-out side of third-party tools sits in the extra_usage block in the same payload, with used_credits and monthly_limit. Watching either one alone gives a partial answer.",
  },
  {
    q: "Where do I see the dollar burn for third-party tools?",
    a: "Two places on the same private endpoint: /api/organizations/{org}/usage carries the extra_usage block ({ is_enabled, monthly_limit, used_credits, utilization, currency }) and /api/organizations/{org}/overage_spend_limit carries the canonical month-to-date used_credits and the monthly_credit_limit you set. claude.ai/settings/usage renders both. ClaudeMeter parses both into Rust structs (ExtraUsage and OverageResponse in src/models.rs) and shows them next to the seven Window buckets, so you can see plan-quota exhaustion and dollars-spent at the same moment.",
  },
  {
    q: "Can ccusage or Claude-Code-Usage-Monitor show third-party tool spend?",
    a: "No. ccusage and Claude-Code-Usage-Monitor walk ~/.claude/projects/*.jsonl on disk; that ledger only exists for Claude Code itself, which writes those JSONL transcripts locally. Cursor, Cline, Roo Code, aider, and OpenCode do not write to ~/.claude/projects, so a local-log reader literally never sees them. The only place those calls show up is on the server: as movement on seven_day_oauth_apps (when the integration uses OAuth) and as used_credits ticking on the extra_usage block. ClaudeMeter and ccusage measure different things; they coexist rather than compete.",
  },
  {
    q: "Why is 'claude max third party usage tracking' even a category?",
    a: "Because $200/month Max users were running thousands of dollars of agentic work through third-party tools under the flat fee before April 4. The change repriced that work, and the same users who built workflows around it now need a live read on two numbers they did not need to watch before: how much OAuth-app utilization they have left this week, and how many dollars they have spilled into metered billing this month. The official UI shows both but you have to keep refreshing the page; the third-party tracking category exists to put them in a sticky surface.",
  },
  {
    q: "Does Cursor count as a third-party tool for this?",
    a: "Yes, on the Max-via-OAuth path. Cursor's 'Bring your own subscription' flow authenticates against your Claude account; after April 4 the calls it makes bill against extra_usage at per-token rates rather than coming out of your flat Max allowance. You'll see them show up as dollar movement on extra_usage.used_credits. The seven_day_oauth_apps bucket may also tick depending on how Cursor's integration is structured. If you point Cursor at a separate Anthropic API key instead, those calls don't touch your Max account at all and don't appear on /api/organizations/{org}/usage.",
  },
  {
    q: "Can I curl the endpoint myself to check?",
    a: "Yes. Sign in to claude.ai, open DevTools at claude.ai/settings/usage, copy the full Cookie header on the /usage request, grab your org UUID from /api/account memberships[0].organization.uuid, and run: curl -s claude.ai/api/organizations/$ORG/usage with the Cookie header you copied and a Referer header pointing at claude.ai/settings/usage. The Referer is load-bearing; drop it and you get 403. The JSON you get back has seven Window objects (five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork) and the extra_usage block. That single curl is a faithful snapshot; the reason a poller is worth installing is that the rolling denominators slide as old traffic ages out, so the numbers drift between snapshots.",
  },
  {
    q: "Is ClaudeMeter open source and free?",
    a: "Yes. MIT-licensed Rust core for the macOS menu bar app, Manifest V3 JavaScript for the browser extension, source at github.com/m13v/claude-meter. There's anonymous telemetry is opt-out: a single HTTPS request per minute to claude.ai with your own session cookie. The extension reads the same private endpoint claude.ai/settings/usage renders from, so the numbers match the official page exactly.",
  },
  {
    q: "What about Safari, Linux, Windows?",
    a: "Today the menu bar surface is macOS 12+ only. The browser extension targets Chrome, Arc, Brave, and Edge (Manifest V3). Safari and Linux/Windows menu bar are not on the roadmap. If you're outside the macOS+Chromium combo, the practical fallback for tracking the same two fields is to keep claude.ai/settings/usage open in a tab, or run the curl above on a cron. ClaudeMeter just removes the manual refresh; it doesn't change the underlying data source.",
  },
];

const usageResponseCode = `// claude-meter/src/models.rs (lines 4-28)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtraUsage {
    pub is_enabled: bool,
    pub monthly_limit: Option<i64>,
    pub used_credits: Option<f64>,   // <-- dollars spilled this month
    pub utilization: Option<f64>,
    pub currency: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour: Option<Window>,
    pub seven_day: Option<Window>,
    pub seven_day_sonnet: Option<Window>,
    pub seven_day_opus: Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,   // <-- third-party app lane
    pub seven_day_omelette: Option<Window>,
    pub seven_day_cowork: Option<Window>,
    pub extra_usage: Option<ExtraUsage>,         // <-- metered $$ block
}`;

const sampleJsonCode = `// GET claude.ai/api/organizations/{org_uuid}/usage
// the two fields a Max user actually needs after April 4, 2026:

{
  "seven_day_oauth_apps": {
    "utilization": 0.41,                         // 41% of the OAuth-app weekly cap
    "resets_at": "2026-05-15T18:22:00Z"
  },
  "extra_usage": {
    "is_enabled": true,
    "monthly_limit": 100,                        // your dollar ceiling
    "used_credits": 17.84,                       // dollars burned this month
    "utilization": 0.1784,
    "currency": "USD"
  }
}`;

const curlSession = [
  { type: "command" as const, text: "ORG=$(curl -s claude.ai/api/account -H \"Cookie: $COOKIE\" | jq -r '.memberships[0].organization.uuid')" },
  { type: "command" as const, text: "curl -s claude.ai/api/organizations/$ORG/usage -H \"Cookie: $COOKIE\" -H \"Referer: claude.ai/settings/usage\" | jq '{ oauth_apps: .seven_day_oauth_apps, extra_usage }'" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"oauth_apps\": { \"utilization\": 0.41, \"resets_at\": \"2026-05-15T18:22:00Z\" }," },
  { type: "output" as const, text: "  \"extra_usage\": {" },
  { type: "output" as const, text: "    \"is_enabled\": true," },
  { type: "output" as const, text: "    \"monthly_limit\": 100," },
  { type: "output" as const, text: "    \"used_credits\": 17.84," },
  { type: "output" as const, text: "    \"utilization\": 0.1784," },
  { type: "output" as const, text: "    \"currency\": \"USD\"" },
  { type: "output" as const, text: "  }" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "two numbers, one payload, refreshed every minute by ClaudeMeter" },
];

const trackerComparisonRows = [
  {
    feature: "Sees Claude Code traffic",
    ours: "Yes, via server-side seven_day_oauth_apps + extra_usage",
    competitor: "Yes, via local ~/.claude/projects/*.jsonl",
  },
  {
    feature: "Sees Cursor / Cline / Roo Code / aider / OpenCode",
    ours: "Yes, they all bill against extra_usage.used_credits",
    competitor: "No, none of these write to ~/.claude/projects",
  },
  {
    feature: "Sees the dollar burn from per-token metered billing",
    ours: "Yes, extra_usage.used_credits in the same payload",
    competitor: "No, local logs do not see dollar charges",
  },
  {
    feature: "Distinguishes plan quota from metered $$",
    ours: "Yes, plan buckets and extra_usage rendered side by side",
    competitor: "Not applicable; only one side is visible",
  },
  {
    feature: "Data source",
    ours: "GET /api/organizations/{org}/usage (claude.ai session cookie)",
    competitor: "Local JSONL transcripts on disk",
  },
  {
    feature: "License",
    ours: "MIT, single HTTPS request per minute, anonymous telemetry is opt-out",
    competitor: "MIT, no network, complementary",
  },
];

const walkthroughSteps = [
  {
    title: "Open claude.ai/settings/usage signed in",
    description:
      "That single page reads three private endpoints behind the scenes: /api/organizations/{org}/usage (seven Window buckets plus extra_usage), /api/organizations/{org}/overage_spend_limit (monthly_credit_limit and used_credits), and /api/organizations/{org}/subscription_details (next charge date). Two of those payloads carry the third-party numbers you need.",
  },
  {
    title: "Find seven_day_oauth_apps",
    description:
      "This is the weekly bucket the server uses to account for OAuth-connected app traffic. After April 4, 2026, the dollar billing for third-party tools moved off the plan, but this counter still ticks for accounts with OAuth integrations connected. The utilization field is either 0..1 or 0..100 depending on the bucket; ClaudeMeter normalizes with u <= 1 ? u * 100 : u in extension/background.js.",
  },
  {
    title: "Find extra_usage.used_credits",
    description:
      "Inside the same JSON payload. It is the literal dollars burned this month by third-party tool calls (and any overage from plan exhaustion). Compare it to monthly_limit to see how close you are to the ceiling you set. Anthropic also exposes the canonical month-to-date number on /api/organizations/{org}/overage_spend_limit for cross-check.",
  },
  {
    title: "Decide whether you need both numbers at a glance",
    description:
      "If you only run Claude Code and claude.ai, plan utilization is enough. If you keep Cursor or Cline open all day, extra_usage.used_credits is the one that matters and you want it in a sticky surface, not a tab you reload. ClaudeMeter polls both once a minute, so the menu bar number stays accurate without manual refreshes.",
  },
  {
    title: "Install the menu bar app + extension",
    description:
      "brew install --cask m13v/tap/claude-meter, then load the unpacked extension/ folder from github.com/m13v/claude-meter into chrome://extensions (or arc://, brave://, edge://). Visit claude.ai once. The extension reuses your existing session cookie with credentials: 'include' against the three endpoints above; no paste, no API key.",
  },
];

const whichToolCountsRows = [
  {
    feature: "Claude Code",
    ours: "Inside the plan, draws against five_hour + seven_day + seven_day_opus / seven_day_sonnet",
    competitor: "Visible in ccusage and Claude-Code-Usage-Monitor as local token counts",
  },
  {
    feature: "claude.ai web chat",
    ours: "Inside the plan, draws against the same weekly buckets",
    competitor: "Not visible anywhere except the server endpoint",
  },
  {
    feature: "Cursor (Bring your own Claude)",
    ours: "Third-party path, bills against extra_usage.used_credits post-April 4",
    competitor: "Cursor's own dashboard shows tokens, not your Max account state",
  },
  {
    feature: "Cline",
    ours: "Third-party path, bills against extra_usage.used_credits post-April 4",
    competitor: "Cline shows local model-level token counts only",
  },
  {
    feature: "Roo Code",
    ours: "Third-party path, bills against extra_usage.used_credits post-April 4",
    competitor: "Roo Code does not surface Max plan state",
  },
  {
    feature: "aider / OpenCode / OpenClaw",
    ours: "Third-party path, bills against extra_usage.used_credits post-April 4",
    competitor: "No plan-state visibility from those tools' own UIs",
  },
  {
    feature: "Any custom script using your Anthropic API key",
    ours: "Does not touch /api/organizations/{org}/usage at all",
    competitor: "Console API dashboard at console.anthropic.com is the source of truth",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-max-usage-tracker",
    title: "Claude Max usage tracking: it is seven counters, not one",
    excerpt:
      "Full breakdown of the seven Window buckets the /api/organizations/{org}/usage endpoint returns, which one bites which workload first, and why combining them into a single bar hides the real story.",
    tag: "Reference",
  },
  {
    href: "/t/claude-extra-usage-balance",
    title: "Reading the extra_usage block: dollars, not tokens",
    excerpt:
      "Field by field walkthrough of the metered-billing block on /api/organizations/{org}/usage. is_enabled, monthly_limit, used_credits, utilization, currency, and how each one is displayed in ClaudeMeter.",
    tag: "Deep dive",
  },
  {
    href: "/t/open-source-claude-usage-trackers-april-2026",
    title: "Open source Claude usage trackers: local-log vs server-truth",
    excerpt:
      "Seven OSS trackers sorted by what they actually read. Local JSONL counters cannot see third-party tool spend; server-truth tools can. The one tracker that uses your real browser cookie via credentials: 'include'.",
    tag: "Field guide",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Max third-party usage tracking: the two server fields you actually need after April 4, 2026",
  description:
    "Since April 4, 2026, Claude Max no longer covers third-party tools (Cline, Roo Code, aider, OpenCode, Cursor) under the plan. Tracking third-party usage on Max now means watching seven_day_oauth_apps.utilization and extra_usage.used_credits on the same private endpoint.",
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

export default function ClaudeMaxThirdPartyUsageTrackingPage() {
  return (
    <article className="text-zinc-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd, faqJsonLd]),
        }}
      />

      <div className="py-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-3xl mx-auto px-6 pb-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-zinc-900">
          Tracking third-party tool usage on Claude Max is{" "}
          <GradientText>two fields, not one</GradientText>, since April 4, 2026
        </h1>
        <p className="mt-5 text-base sm:text-lg text-zinc-600 leading-relaxed">
          Anthropic moved third-party tool billing off the flat Max plan into
          metered extra-usage at noon Pacific on April 4. The Cursor, Cline,
          Roo Code, aider, and OpenCode calls that used to silently draw from
          your $200/month allowance now bill at per-token API rates against a
          separate dollar bucket. Tracking the new picture means watching two
          fields on the same private endpoint at once.
        </p>
      </header>

      <div className="pt-2 pb-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="7 min read"
        />
      </div>

      <section className="max-w-3xl mx-auto px-6 mt-8">
        <BackgroundGrid>
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
              Direct answer (verified 2026-05-11)
            </p>
            <p className="text-zinc-800 leading-relaxed text-base sm:text-lg">
              On Claude Max, watch two fields on{" "}
              <code className="bg-white px-1.5 py-0.5 rounded text-sm border border-teal-200">
                claude.ai/api/organizations/&#123;org&#125;/usage
              </code>
              :{" "}
              <strong>seven_day_oauth_apps.utilization</strong> (the
              OAuth-connected app weekly bucket) and{" "}
              <strong>extra_usage.used_credits</strong> (the dollar burn from
              third-party tool calls under the post-April-4 metered billing).
              The official Settings page shows both, but you have to refresh it
              manually. Source for the billing change:{" "}
              <a
                href="https://support.claude.com/en/articles/12429409-manage-extra-usage-for-paid-claude-plans"
                className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
              >
                Anthropic's extra-usage support article
              </a>
              .
            </p>
          </div>
        </BackgroundGrid>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          The two fields, in the actual JSON
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Both fields live on the same payload. The struct ClaudeMeter parses
          them into is in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            claude-meter/src/models.rs
          </code>{" "}
          lines 4 to 28. Two of the eight optional fields carry the
          third-party-tracking signal:
        </p>
        <AnimatedCodeBlock
          code={usageResponseCode}
          language="rust"
          filename="src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed mt-6">
          And a representative payload, trimmed to just the two fields:
        </p>
        <div className="mt-4">
          <AnimatedCodeBlock
            code={sampleJsonCode}
            language="json"
            filename="GET /api/organizations/{org}/usage"
          />
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Reading them by hand with curl
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          You don't have to install anything to confirm the picture. Grab your
          Cookie header from DevTools at{" "}
          <a
            href="https://claude.ai/settings/usage"
            className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
          >
            claude.ai/settings/usage
          </a>
          , then run the two requests below. The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            Referer
          </code>{" "}
          header is load-bearing; drop it and the endpoint returns 403.
        </p>
        <TerminalOutput
          title="curl /api/organizations/$ORG/usage"
          lines={curlSession}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Which tools land where, after April 4
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The rule is simple but easy to forget: only Claude Code and claude.ai
          itself stay inside the plan. Everything else routes to the
          extra-usage bucket and charges per token.
        </p>
        <ComparisonTable
          productName="Claude Max plan state"
          competitorName="What the tool's own UI shows"
          rows={whichToolCountsRows}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Why local-log trackers miss third-party tool spend entirely
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          ccusage and Claude-Code-Usage-Monitor are excellent for their
          purpose: they parse{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            ~/.claude/projects/*.jsonl
          </code>{" "}
          and tell you which Claude Code session burned which model and at
          what cost. But Cursor, Cline, Roo Code, aider, and OpenCode do not
          write to that directory; their traffic is invisible to anything that
          reads only local logs. After April 4, that means a Max user whose
          dollar burn is dominated by Cursor calls will see ccusage report
          near-zero local usage while extra_usage.used_credits ticks past $50,
          $100, $150. The dollar number only exists server-side.
        </p>
        <ComparisonTable
          productName="ClaudeMeter (server-truth)"
          competitorName="ccusage / Claude-Code-Usage-Monitor"
          rows={trackerComparisonRows}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          The five-step walkthrough
        </h2>
        <StepTimeline steps={walkthroughSteps} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Why seven_day_oauth_apps still ticks
        </h2>
        <GlowCard>
          <div className="p-6 sm:p-8">
            <p className="text-zinc-700 leading-relaxed">
              A common follow-up question: if the billing for third-party
              tools moved off the plan, why does the OAuth-apps weekly bucket
              still exist? Two reasons. First, the field is the server's
              accounting handle for OAuth-connected traffic regardless of how
              it routes through billing; removing it would break the
              Settings page. Second, Anthropic still rate-shapes OAuth-app
              traffic at the protocol layer to prevent runaway concurrency
              from any single integration, and the seven_day_oauth_apps
              window is the counter that throttle decision reads against.
              The plan dollars and the OAuth-apps window are separate
              mechanisms now; you need both fields to predict whether your
              next Cursor call is going to slow down (oauth_apps) or cost
              dollars (extra_usage), or both.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          FAQ
        </h2>
        <FaqSection items={faqs} heading="" />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want to read your own oauth_apps and extra_usage values together?"
          description="Fifteen minutes; we open claude.ai/settings/usage on your account, pull the JSON, and identify whether oauth_apps utilization or extra_usage dollars is the one biting your workflow first."
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <RelatedPostsGrid
          title="Related guides"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See oauth_apps and extra_usage side by side in 15 minutes."
      />
    </article>
  );
}
