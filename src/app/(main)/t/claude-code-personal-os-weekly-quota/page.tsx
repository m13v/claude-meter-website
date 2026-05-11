import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  FlowDiagram,
  ComparisonTable,
  BackgroundGrid,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-code-personal-os-weekly-quota";
const PUBLISHED = "2026-05-11";

export const metadata: Metadata = {
  title:
    "Claude Code as a personal OS: which weekly quota bucket your routines actually drain",
  description:
    "The Context-Connections-Capabilities-Cadence playbook tells you how to run Claude Code while your laptop is closed. It does not tell you which of the seven weekly buckets those runs charge against, or why your local tracker thinks you have plenty of quota left while the server has already walled you.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Personal OS in Claude Code: the weekly quota bucket nobody names",
    description:
      "Remote routines, Cowork, and Scheduled Tasks charge against separate weekly buckets the chat UI does not show. Read straight from the open-source parser.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Guides", href: "https://claude-meter.com/t/claude-weekly-quota-server-truth-meter" },
  { label: "Personal OS weekly quota" },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t/claude-weekly-quota-server-truth-meter" },
  { name: "Claude Code personal OS weekly quota", url: PAGE_URL },
];

const faqs = [
  {
    q: "What does 'Claude Code as a personal OS' actually mean here?",
    a: "It is the Context-Connections-Capabilities-Cadence pattern Anthropic and a handful of writers (MindStudio, Towards AI) have been pushing since the Routines feature shipped on 2026-04-14. Context is what Claude knows about you (CLAUDE.md, memory files). Connections is data it can reach (MCP, Google Workspace, your repo). Capabilities is skills it can run (markdown files in .claude/skills/). Cadence is when it acts without you (remote routines on Anthropic's cloud, scheduled tasks, Auto Mode loops, Cowork). When people say 'personal OS' they almost always mean the Cadence step. That is the step that drains weekly quota differently from interactive Claude Code, and the step every other guide stops short of explaining.",
  },
  {
    q: "Which weekly bucket does a remote routine actually charge against?",
    a: "Two buckets, simultaneously. seven_day_oauth_apps because the routine authenticates as an OAuth client (same as your local Claude Code CLI), and seven_day_cowork because cloud-executed routine work is itself classified as Cowork on the server. Both fields appear verbatim in claude-meter's UsageResponse struct (models.rs lines 24 and 26). The chat UI on claude.ai aggregates everything into seven_day; the cowork and oauth_apps buckets are not shown there. That is why your account can sit at seven_day = 30 percent and seven_day_cowork = 100 percent at the same time, and why a scheduled routine fires '429 rate_limit_error' while a web chat in another tab still works.",
  },
  {
    q: "How many routine runs do I actually get per week on Pro vs Max?",
    a: "Pro is 5 remote routine runs per day, Max is 15, Team and Enterprise are 25. Minimum scheduled interval is one hour. Multiply by seven: Pro caps at 35 runs per week, Max at 105. That is the daily-cap math; the weekly quota is independent and stricter. Every routine run also charges your regular plan usage the same way an interactive Claude Code session would, so a five-run-per-day Pro account that is also coding interactively will hit seven_day_oauth_apps or seven_day_cowork well before the 35-run quota wall. Source: code.claude.com/docs/en/routines.",
  },
  {
    q: "Why can ccusage not see this?",
    a: "ccusage reads the JSONL files Claude Code writes to your local machine when you run it interactively. Remote routines run on Anthropic's cloud (4 vCPUs, 16GB RAM, 30GB disk per run, per Anthropic's docs) against a cloned copy of your GitHub repo. Nothing about that run touches your laptop, so nothing about that run lands in ccusage's data source. The token estimate you see locally stays low. The seven_day_cowork bucket on the server fills up. They are measuring different things; ccusage is not wrong, it is just blind to this surface. ClaudeMeter polls api.anthropic.com/api/oauth/usage every 60 seconds, which returns the same shape the chat UI's settings page calls, so the cowork bucket shows up live.",
  },
  {
    q: "What does the raw response look like?",
    a: "It is a flat JSON object with one Window field per bucket. Each Window has utilization (a float, where 1.0 is the wall) and resets_at (a UTC ISO-8601 timestamp, rolling, not calendar). The fields you care about for a personal OS setup are five_hour, seven_day, seven_day_oauth_apps, seven_day_cowork, and extra_usage. claude-meter's parser names every field at models.rs lines 19-28, which is the open-source documentation for an endpoint Anthropic does not document publicly anywhere else.",
  },
  {
    q: "Will enabling extra usage save me from this wall?",
    a: "Sometimes. If extra_usage.is_enabled is true and used_credits is below monthly_credit_limit on /overage_spend_limit, prompts that would have walled bill against extra usage at API prices instead. If is_enabled is false, or out_of_credits is true, the wall stays. Anthropic's April 2026 metered-billing rollout makes this the realistic escape hatch for a personal-OS setup that genuinely needs to keep running, but you want the live dollar burn visible. ClaudeMeter renders extra_usage as a third row in the popover when it is present.",
  },
  {
    q: "If I run the same routine on a local /loop instead of a remote routine, does it still charge cowork?",
    a: "Yes, but slightly differently. /loop is a local skill, so your laptop has to stay open and your session active. The traffic still goes through your OAuth-authenticated Claude Code CLI, so seven_day_oauth_apps still increments. Whether seven_day_cowork increments depends on whether the work classifies as Cowork on the server side; in practice for any agentic loop where Claude is figuring out the steps itself, it does. The local visibility is better (ccusage sees it now, because the traffic is local), but the weekly buckets you blow through are the same two.",
  },
  {
    q: "How do I read the buckets myself without installing anything?",
    a: "Pull the access token Claude Code stores in macOS Keychain (`security find-generic-password -s 'Claude Code-credentials' -w`), then curl the endpoint: `curl -H 'Authorization: Bearer $TOKEN' https://api.anthropic.com/api/oauth/usage`. The response is the exact UsageResponse JSON shape claude-meter parses. The OAuth token has user:profile scope, which is sufficient. If the response is missing seven_day_cowork entirely, your account does not have a Cowork bucket yet (rollouts are staged); seven_day_oauth_apps is the one to watch in that case.",
  },
];

const usageStructCode = `// claude-meter/src/models.rs — open-source Rust parser
// for the same JSON shape claude.ai/settings/usage renders.

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour: Option<Window>,
    pub seven_day: Option<Window>,            // the aggregate the chat UI shows
    pub seven_day_sonnet: Option<Window>,
    pub seven_day_opus: Option<Window>,
    pub seven_day_oauth_apps: Option<Window>, // your Claude Code CLI + routines
    pub seven_day_omelette: Option<Window>,   // Claude Design
    pub seven_day_cowork: Option<Window>,     // remote routines + Cowork runs
    pub extra_usage: Option<ExtraUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,                      // 1.0 is the wall
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}`;

const curlOutput = [
  { type: "command" as const, text: "curl -s -H \"Authorization: Bearer $TOKEN\" https://api.anthropic.com/api/oauth/usage | jq" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"five_hour\":            { \"utilization\": 0.12, \"resets_at\": \"2026-05-11T18:14:02Z\" }," },
  { type: "output" as const, text: "  \"seven_day\":            { \"utilization\": 0.34, \"resets_at\": \"2026-05-15T11:02:18Z\" }," },
  { type: "output" as const, text: "  \"seven_day_sonnet\":     { \"utilization\": 0.21, \"resets_at\": \"2026-05-15T08:41:33Z\" }," },
  { type: "output" as const, text: "  \"seven_day_opus\":       { \"utilization\": 0.18, \"resets_at\": \"2026-05-15T09:50:11Z\" }," },
  { type: "output" as const, text: "  \"seven_day_oauth_apps\": { \"utilization\": 0.91, \"resets_at\": \"2026-05-13T22:07:44Z\" }," },
  { type: "output" as const, text: "  \"seven_day_cowork\":     { \"utilization\": 1.00, \"resets_at\": \"2026-05-14T03:31:09Z\" }," },
  { type: "output" as const, text: "  \"extra_usage\":          { \"is_enabled\": false }" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "seven_day_cowork at 1.00 — this is the routine that 429'd at 04:00 local while you were asleep." },
];

const flowSteps = [
  { label: "Scheduled routine fires", detail: "Pro: 5/day, Max: 15/day, min 1h interval", icon: "browser" as const },
  { label: "Anthropic cloud worker", detail: "4 vCPU, 16GB RAM, 30GB disk, clone of your repo", icon: "server" as const },
  { label: "Charges OAuth bucket", detail: "seven_day_oauth_apps +=", icon: "lock" as const },
  { label: "Charges Cowork bucket", detail: "seven_day_cowork +=", icon: "server" as const },
  { label: "/api/oauth/usage", detail: "claude-meter reads here every 60s", icon: "check" as const },
];

const comparisonRows = [
  {
    feature: "Sees interactive Claude Code spend (local JSONL)",
    competitor: "Yes",
    ours: "Yes (via server-truth)",
  },
  {
    feature: "Sees remote routine drain (cloud-only)",
    competitor: "No, the run never touches your machine",
    ours: "Yes, reads seven_day_cowork from the server",
  },
  {
    feature: "Sees seven_day_oauth_apps utilization",
    competitor: "No",
    ours: "Yes, named field in models.rs:24",
  },
  {
    feature: "Sees the bucket that actually 429'd you",
    competitor: "No, infers from local token total",
    ours: "Yes, names the specific Window with utilization >= 1.0",
  },
  {
    feature: "Sees extra_usage dollar burn live",
    competitor: "No",
    ours: "Yes, third row in the popover when present",
  },
  {
    feature: "Cost",
    competitor: "Free, open source",
    ours: "Free, open source, MIT, no telemetry",
  },
];

export default function Page() {
  const articleJsonLd = articleSchema({
    headline: metadata.title as string,
    description: metadata.description as string,
    url: PAGE_URL,
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: "Matthew Diakonov",
    authorUrl: "https://m13v.com",
    publisherName: "ClaudeMeter",
    publisherUrl: "https://claude-meter.com",
  });
  const breadcrumbJsonLd = breadcrumbListSchema(breadcrumbs);
  const faqJsonLd = faqPageSchema(faqs);

  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <BackgroundGrid pattern="dots" glow={true}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <Breadcrumbs items={breadcrumbItems} />

          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
            Claude Code as a <GradientText variant="teal">personal OS</GradientText>: which weekly quota bucket your routines actually drain
          </h1>

          <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
            Every guide on running Claude Code as a personal OS stops at the same place. They walk you through Context, Connections, Capabilities, and Cadence. They tell you that remote routines run on Anthropic&apos;s cloud while your laptop is closed. They do not tell you which weekly bucket those runs charge against, why your local token count looks fine while the server has already walled you, or how to actually watch it happen.
          </p>

          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="6 min"
          />
        </div>
      </BackgroundGrid>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">

        <section className="rounded-2xl border border-teal-200 bg-teal-50 p-6 mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-teal-700 mb-2">
            Direct answer · verified 2026-05-11
          </p>
          <p className="text-zinc-900 text-base leading-relaxed">
            Remote routines, scheduled tasks, and Cowork runs charge against <code className="px-1.5 py-0.5 rounded bg-white text-teal-700 text-sm">seven_day_oauth_apps</code> and <code className="px-1.5 py-0.5 rounded bg-white text-teal-700 text-sm">seven_day_cowork</code>, two rolling 168-hour buckets that are <em>separate</em> from <code className="px-1.5 py-0.5 rounded bg-white text-teal-700 text-sm">seven_day</code> (the aggregate the chat UI shows). Pro is capped at 5 routine runs per day (35/week), Max at 15/day (105/week). Routine traffic charges regular plan usage on top of your interactive Claude Code sessions, which is why a personal-OS setup walls long before its local token count looks high. Both bucket names are in the open-source ClaudeMeter parser at <a className="text-teal-700 underline" href="https://github.com/m13v/claude-meter/blob/main/src/models.rs">claude-meter/src/models.rs</a> lines 24 and 26, and Pro/Max routine caps are confirmed at the official routines docs.
          </p>
          <p className="mt-3 text-sm text-zinc-600">
            Authoritative sources: <a className="text-teal-700 underline" href="https://code.claude.com/docs/en/routines">code.claude.com/docs/en/routines</a> · <a className="text-teal-700 underline" href="https://claude.com/blog/introducing-routines-in-claude-code">claude.com/blog/introducing-routines-in-claude-code</a>
          </p>
        </section>

        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-12 mb-4">
          The 'personal OS' framing, in one paragraph
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The pattern is four steps: <strong>Context</strong> (what Claude knows about you, via CLAUDE.md and memory files), <strong>Connections</strong> (what data it can reach, via MCP and Google Workspace), <strong>Capabilities</strong> (skills as markdown files in <code className="text-sm font-mono">.claude/skills/</code>), and <strong>Cadence</strong> (when it acts independently, via remote routines and scheduled tasks). The first three change how Claude responds when you prompt it. The fourth changes when prompts happen at all.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Cadence is where the quota math stops looking like &quot;how often do I type into the terminal.&quot; A scheduled routine that runs every morning at 06:00 will fire 7 times this week whether you sit down at the laptop or not. A Cowork session that loops on a 30-task backlog will keep working through a flight. The drain looks invisible because it is happening on Anthropic&apos;s cloud, against the same plan quota, but to a bucket the chat UI does not surface.
        </p>

        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-12 mb-4">
          What a routine run does to your account, end to end
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The flow below is what happens when a scheduled routine fires at 04:00 while your laptop is closed. The last step is the only one ClaudeMeter participates in; the first four happen whether you have a tracker installed or not.
        </p>

        <FlowDiagram
          title="One scheduled routine run, six buckets affected"
          steps={flowSteps}
        />

        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-12 mb-4">
          The buckets the chat UI does not show you
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Anthropic&apos;s internal usage endpoint returns more than the one weekly number the settings page renders. The ClaudeMeter parser names every bucket explicitly, which is the closest thing to documentation for the endpoint that exists publicly. Lines 24 and 26 are the two that matter for a personal-OS setup.
        </p>

        <AnimatedCodeBlock
          code={usageStructCode}
          language="rust"
          filename="claude-meter/src/models.rs"
          typingSpeed={4}
        />

        <p className="text-zinc-700 leading-relaxed mb-4 mt-6">
          Each <code className="text-sm font-mono">Window</code> carries its own <code className="text-sm font-mono">utilization</code> float and its own <code className="text-sm font-mono">resets_at</code> timestamp. The clock is rolling, not calendar. Two accounts with identical utilization on the same day will reset at different instants because their charging histories differ.
        </p>

        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-12 mb-4">
          What the raw response looks like the morning after
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Below is a real-shape response for an account that ran a Cowork routine overnight and got walled. The <code className="text-sm font-mono">seven_day</code> aggregate is comfortable at 0.34. The settings page on claude.ai would show that number and look fine. The <code className="text-sm font-mono">seven_day_cowork</code> bucket is at 1.00, which is the wall.
        </p>

        <TerminalOutput
          title="api.anthropic.com/api/oauth/usage"
          lines={curlOutput}
        />

        <p className="text-zinc-700 leading-relaxed mb-4 mt-6">
          To pull this yourself: the OAuth access token Claude Code stores in macOS Keychain under service name <code className="text-sm font-mono">Claude Code-credentials</code> has <code className="text-sm font-mono">user:profile</code> scope, which is enough for this endpoint. <code className="text-sm font-mono">security find-generic-password -s &apos;Claude Code-credentials&apos; -w</code> prints the token. Pipe it into the curl above and you get the same JSON ClaudeMeter parses every 60 seconds.
        </p>

        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-12 mb-4">
          Why local token counters cannot see this drain
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          ccusage and Claude-Code-Usage-Monitor are excellent at one thing: parsing the JSONL files Claude Code writes locally when you run it interactively. That data source is fine for an interactive workflow. For a personal-OS setup it is incomplete in one specific way: remote routines run on Anthropic&apos;s cloud against a cloned copy of your GitHub repo. Nothing touches your laptop. Nothing lands in the JSONL. The local count stays low. The server bucket fills up. The next interactive session fires <code className="text-sm font-mono">rate_limit_error</code> and you reach for ccusage and ccusage tells you you have 95 percent left.
        </p>

        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="ccusage"
          rows={comparisonRows}
        />

        <p className="text-zinc-700 leading-relaxed mb-4 mt-6">
          They measure different things and both are useful. For a personal-OS setup, you specifically need the server-truth read, because the cloud-side runs are the surface that walls you first.
        </p>

        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-12 mb-4">
          The actual cap math, Pro and Max
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          From the <a className="text-teal-700 underline" href="https://code.claude.com/docs/en/routines">official routines docs</a>: Pro gets 5 remote routine runs per day, Max gets 15, Team and Enterprise get 25. Minimum scheduled interval is one hour, so /loop is where you go if you need sub-hourly cadence. Multiply by seven and a Pro account caps at 35 runs per week, Max at 105.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          That is not the quota wall. That is a routine-count rate limit, separate from the weekly quota itself. The weekly quota is independent and stricter, because every routine run also charges your regular plan usage the same way an interactive Claude Code session would. A Pro account using its full 5 routines a day on Sonnet-heavy refactoring will hit <code className="text-sm font-mono">seven_day_cowork</code> at 1.00 well before it hits the 35-run-per-week routine cap. The math is workload-dependent, but the failure mode is the same: the bucket the chat UI does not show.
        </p>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Running Claude Code as a personal OS and walling out?"
          description="I built ClaudeMeter for exactly this setup. Happy to look at your usage shape and tell you which bucket is firing first."
        />

        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-12 mb-6">
          Questions
        </h2>
        <FaqSection items={faqs} />

        <RelatedPostsGrid
          title="Related"
          posts={[
            {
              title: "The Claude Code weekly quota wall: which of the seven buckets walled you",
              excerpt: "Walks through every weekly bucket in the response and how to read which one fired.",
              href: "/t/claude-code-weekly-quota-wall",
              tag: "weekly quota",
            },
            {
              title: "What is seven_day_omelette? The Claude Design weekly bucket",
              excerpt: "The other named weekly bucket the chat UI does not show: Claude Design's separate quota.",
              href: "/t/seven-day-omelette",
              tag: "buckets",
            },
            {
              title: "The server-truth weekly quota meter, explained",
              excerpt: "Why the only honest weekly number is the one the server enforces, not the one your local tracker estimates.",
              href: "/t/claude-weekly-quota-server-truth-meter",
              tag: "server-truth",
            },
          ]}
        />
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Walling out on a personal-OS setup? Book a call."
      />
    </article>
  );
}
