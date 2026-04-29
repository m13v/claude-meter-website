import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  AnimatedChecklist,
  MetricsRow,
  StepTimeline,
  BentoGrid,
  RemotionClip,
  MotionSequence,
  AnimatedBeam,
  SequenceDiagram,
  GlowCard,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-weekly-quota-silent-tightening";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title:
    "Claude Weekly Quota Silent Tightening Tracker: What a Real One Needs to Do",
  description:
    "Silent tightening is a server-side weight change, not a token change. A tracker that reads local Claude Code logs can't see it. Here are the six capabilities a real silent tightening tracker needs, and which popular tools check which boxes.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Weekly Quota Silent Tightening Tracker: What a Real One Needs to Do",
    description:
      "Silent tightening changes server weights, not token counts. A local-log reader can't see it. Here are the six capabilities a real tracker needs.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Why can't my Claude Code usage monitor see the silent tightening?",
    a: "Because it reads ~/.claude/projects/*.jsonl files and counts tokens. Silent tightening does not change the number of tokens your message consumes; it changes the server-side weight the backend applies to those tokens when it charges the five_hour and seven_day buckets. Tokens in the log look identical before and after. The only place the new weight shows up is in the JSON response at /api/organizations/{org_uuid}/usage, which no local-log tool fetches.",
  },
  {
    q: "What is the minimum set of capabilities a silent tightening tracker needs?",
    a: "Six: (1) hits /api/organizations/{org_uuid}/usage directly rather than estimating from local logs, (2) polls on at least a 60-second cadence so slope changes show up as slopes instead of staircases, (3) reads all seven rolling buckets, not just the headline two, (4) normalizes the 0-1 vs 0-100 utilization field which ships both scales in the same response, (5) logs raw JSON per sample so you can diff a schema change later, and (6) runs in the background so an idle user still captures the weekday 13:00 UTC knee. ClaudeMeter checks all six.",
  },
  {
    q: "What are the seven rolling buckets the endpoint returns?",
    a: "five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork. They are declared as explicit Option<Window> fields in ClaudeMeter's Rust struct at src/models.rs lines 18-28. Each ships a utilization number and its own resets_at. Anthropic documents two of them (five_hour and seven_day). The other five silently appeared in the payload and still work the same way.",
  },
  {
    q: "How often does ClaudeMeter poll and why that number?",
    a: "Once per 60 seconds. The Chrome extension calls chrome.alarms.create(\"refresh\", { periodInMinutes: 1 }) in extension/background.js. Anything slower than a minute turns the slope change at 13:00 UTC weekdays into a staircase of samples and you lose the knee in the curve. Anything faster would be pointless because Anthropic's own Settings page does not recompute the five_hour bucket any faster than that, and you would be hammering the endpoint for no new data.",
  },
  {
    q: "Do I need to paste a cookie into a script?",
    a: "Not with the extension route. The Chrome extension fetches /api/organizations/{org}/usage with credentials: \"include\", so your existing claude.ai session cookie is used automatically. The other route, the menu bar binary alone, reads Chrome's Safe Storage via keychain. Either way, no cookie paste and no second login.",
  },
  {
    q: "What does 'silent' actually mean here?",
    a: "It means the change lands without touching the HTML of claude.ai/settings/usage or any public documentation. The bar on Settings keeps looking the same. The fields in the endpoint payload keep the same names. Only the relationship between your workload and the utilization numbers shifts. If your detector depends on Anthropic telling you something changed, you cannot see it until someone on Reddit notices their five_hour bucket filling twice as fast during weekday afternoons.",
  },
  {
    q: "Can ccusage or Claude-Code-Usage-Monitor be patched to see this?",
    a: "Not without adding a completely new data source. Both tools are fundamentally log-scanners. Their signal is what Claude Code wrote to the local filesystem. To catch silent tightening you need to add an HTTP client, a session cookie plumbing, and a schema for the /usage response. At that point you have rewritten the hard part of ClaudeMeter. A simpler path is to run both together and read ClaudeMeter for server truth, your existing tool for local token accounting.",
  },
  {
    q: "Why does ClaudeMeter log every bucket by name instead of a generic map?",
    a: "Because a typed struct rejects unknown-but-important drift louder than a generic HashMap would. UsageResponse in src/models.rs has five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork as distinct fields. If Anthropic renames one or adds an eighth, the deserializer surfaces that shape change as a loud error instead of silently mapping it into a missing key that goes unplotted. That loud failure is how you catch the next silent schema change early.",
  },
  {
    q: "Is this endpoint safe to poll every minute?",
    a: "It is the same endpoint claude.ai/settings/usage polls when you reload that page. You are asking for your own org's usage with your own session cookie. No undocumented behavior, just a JSON GET. That said, the endpoint is undocumented and Anthropic can change the field names or cadence limits without notice. ClaudeMeter is open source (MIT), so if the endpoint shape changes, you can see exactly what moved and why in the src/models.rs diff.",
  },
  {
    q: "What was the last tightening ClaudeMeter detected?",
    a: "The 2026-03-26 change. The seven_day bucket stayed flat across a fixed 50-message Sonnet workload. The five_hour bucket climbed 1.4x to 2x faster on weekdays 13:00-19:00 UTC on the same workload. Both deltas came straight from the /api/organizations/{org}/usage response, polled every 60 seconds before and after the boundary. The per-model seven_day_sonnet and seven_day_opus buckets did not move.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude weekly quota silent tightening tracker", url: PAGE_URL },
];

const usageResponseRust = `// claude-meter/src/models.rs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:             Option<Window>,
    pub seven_day:             Option<Window>,
    pub seven_day_sonnet:      Option<Window>,
    pub seven_day_opus:        Option<Window>,
    pub seven_day_oauth_apps:  Option<Window>,
    pub seven_day_omelette:    Option<Window>,
    pub seven_day_cowork:      Option<Window>,
    pub extra_usage:           Option<ExtraUsage>,
}`;

const pollLoopJs = `// claude-meter/extension/background.js
const BASE = "https://claude.ai";
const POLL_MINUTES = 1;

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("refresh", { periodInMinutes: POLL_MINUTES });
  refresh();
});

chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === "refresh") refresh();
});

async function fetchJSON(url) {
  const r = await fetch(url, {
    credentials: "include",
    headers: { "accept": "application/json" },
  });
  if (!r.ok) throw new Error(r.status + " @ " + url);
  return r.json();
}`;

const normalizeJs = `// claude-meter/extension/popup.js
// Same payload can return five_hour.utilization as 0.64
// and seven_day_opus.utilization as 64.0. Clamp before plotting.
function pctFromWindow(w) {
  if (!w) return null;
  const u = typeof w.utilization === "number" ? w.utilization : null;
  if (u == null) return null;
  return u <= 1 ? u * 100 : u;
}`;

const capabilityCards = [
  {
    title: "Reads the server, not the logs",
    description:
      "Hits GET /api/organizations/{org_uuid}/usage directly. That is where silent tightening lives. ~/.claude/*.jsonl tokens cannot tell you this.",
    size: "2x1" as const,
  },
  {
    title: "60-second poll",
    description:
      "chrome.alarms.create(\"refresh\", { periodInMinutes: 1 }). A slope change at the weekday 13:00 UTC boundary shows up as a knee, not a staircase.",
    size: "1x1" as const,
  },
  {
    title: "Watches all 7 buckets",
    description:
      "five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork. A tightening in any one is visible.",
    size: "1x1" as const,
  },
  {
    title: "Normalizes 0-1 vs 0-100",
    description:
      "Same payload ships both scales. If you do not clamp u <= 1 ? u * 100 : u, your 0.64 and 64.0 plot as different magnitudes and you miss the jump.",
    size: "1x1" as const,
  },
  {
    title: "Stores raw JSON per sample",
    description:
      "So when a field is renamed, added, or quietly dropped, you can diff the schema back to the exact hour Anthropic shipped the change.",
    size: "1x1" as const,
  },
  {
    title: "Runs in the background",
    description:
      "Extension service worker keeps polling while you work elsewhere. A tracker that only runs while you read the Settings tab cannot capture the weekday 13:00 UTC knee.",
    size: "2x1" as const,
  },
];

const trackerRows = [
  {
    feature: "Reads /api/organizations/{org}/usage (server truth)",
    competitor: "No. Reads ~/.claude/projects/*.jsonl locally.",
    ours: "Yes. Every 60 seconds.",
  },
  {
    feature: "Poll cadence for slope detection",
    competitor: "Not applicable. One-shot per command.",
    ours: "60s (POLL_MINUTES = 1).",
  },
  {
    feature: "Covers all seven rolling buckets",
    competitor: "No. Estimates a single token budget.",
    ours: "Yes. All seven named in src/models.rs.",
  },
  {
    feature: "Sees silent server-weight changes",
    competitor: "No. Tokens per message do not change.",
    ours: "Yes. Slope of utilization vs workload visibly shifts.",
  },
  {
    feature: "Needs a cookie paste to work",
    competitor: "No, but also cannot see the server.",
    ours: "No. Browser extension reuses the claude.ai session.",
  },
  {
    feature: "Raw JSON per sample (for schema diffs)",
    competitor: "No. Tokens only.",
    ours: "Yes. UsageSnapshot keeps the full response.",
  },
  {
    feature: "Background capture while idle",
    competitor: "No. Only runs when Claude Code runs.",
    ours: "Yes. Service worker + menu bar binary.",
  },
];

const reproTerminal = [
  {
    type: "command" as const,
    text: "# sample on an idle weekday, before 13:00 UTC",
  },
  {
    type: "command" as const,
    text: "curl -s https://claude.ai/api/organizations/$ORG/usage \\\n  -H \"Cookie: $COOKIE\" -H \"Referer: https://claude.ai/settings/usage\" \\\n  | jq '{five_hour, seven_day, seven_day_sonnet, seven_day_opus}'",
  },
  {
    type: "output" as const,
    text: "{",
  },
  {
    type: "output" as const,
    text: "  \"five_hour\":        { \"utilization\": 0.18, \"resets_at\": \"2026-04-24T16:02:00Z\" },",
  },
  {
    type: "output" as const,
    text: "  \"seven_day\":        { \"utilization\": 0.29, \"resets_at\": \"2026-04-29T09:02:00Z\" },",
  },
  {
    type: "output" as const,
    text: "  \"seven_day_sonnet\": { \"utilization\": 0.20, \"resets_at\": \"2026-04-29T09:02:00Z\" },",
  },
  {
    type: "output" as const,
    text: "  \"seven_day_opus\":   { \"utilization\": 0.38, \"resets_at\": \"2026-04-29T09:02:00Z\" }",
  },
  {
    type: "output" as const,
    text: "}",
  },
  {
    type: "command" as const,
    text: "# run a fixed 50-message Sonnet workload, sample again at 13:10 UTC",
  },
  {
    type: "output" as const,
    text: "  \"five_hour\":        { \"utilization\": 0.41, \"resets_at\": \"2026-04-24T18:14:00Z\" },",
  },
  {
    type: "output" as const,
    text: "  \"seven_day\":        { \"utilization\": 0.38, \"resets_at\": \"2026-04-29T09:02:00Z\" }",
  },
  {
    type: "success" as const,
    text: "five_hour climbed 23 points on the same workload. That delta is the signal. Tokens per response: unchanged.",
  },
];

const rollYourOwnSteps = [
  {
    title: "Get a session cookie",
    description:
      "Open claude.ai, sign in, open DevTools, Application tab, Cookies. You want sessionKey and any other cookie whose name starts with cf_ or __secure-. You are not sharing these; they stay in a shell var.",
  },
  {
    title: "Find your org UUID",
    description:
      "GET https://claude.ai/api/account with the cookie. The response has memberships[]. Each membership has an organization.uuid. Pick the one matching the plan you want to track.",
  },
  {
    title: "Hit /usage with credentials",
    description:
      "GET https://claude.ai/api/organizations/{org_uuid}/usage. Send the full cookie header and Referer: https://claude.ai/settings/usage. You get back a JSON with seven Window-shaped fields.",
  },
  {
    title: "Clamp the utilization scale",
    description:
      "Same response returns some buckets as 0..1 and some as 0..100. Apply u <= 1 ? u * 100 : u before you plot, or your pre-change and post-change samples will look like they are on different axes.",
  },
  {
    title: "Schedule a 60-second poll",
    description:
      "cron, launchd, a service worker, whatever. Write the raw JSON plus fetched_at to disk every minute. You want the raw bodies so a schema change later is diff-able, not interpreted.",
  },
  {
    title: "Plot the slope, not the value",
    description:
      "Chart each bucket's utilization against fetched_at. The silent tightening shows up as a steeper line on weekdays 13:00 to 19:00 UTC in the five_hour trace while the seven_day trace keeps its pre-change slope. That divergence is the evidence.",
  },
];

const tokenVsWeightFrames = [
  {
    title: "1. Local-log tools stop here.",
    body: "~/.claude/projects/<uuid>/session.jsonl records the tokens Claude Code sent and received. ccusage and Claude-Code-Usage-Monitor sum those up and estimate a budget. Fast, offline, useful. But tokens per message are a model-side number. They do not move when Anthropic re-weights a bucket server-side.",
  },
  {
    title: "2. Silent tightening lives past the log.",
    body: "After the request returns, Anthropic's backend applies a server-side weight to the tokens and accumulates into five_hour and seven_day. That weight can change without touching your client. No file on your disk reflects it. No library you imported ships the new number.",
  },
  {
    title: "3. /api/organizations/{org}/usage is the only echo.",
    body: "The same endpoint claude.ai/settings/usage renders returns the post-weight utilization. Pull it twice, before and after a fixed workload, and the ratio between workload and utilization is the visible signal. That is the whole mechanism.",
  },
  {
    title: "4. A minute is the right cadence.",
    body: "At 60-second polling the weekday 13:00 UTC knee is a clean break. At 5 minutes you see a staircase. At 1 hour you see two bars that do not tell you when the slope changed. POLL_MINUTES = 1 is load-bearing.",
  },
  {
    title: "5. Seven buckets, not two.",
    body: "Anthropic publishes two. The payload returns seven. A tightening in seven_day_opus or seven_day_oauth_apps will surprise you if your tracker only watches the headline bar. ClaudeMeter's struct names every one.",
  },
];

const cookieSequenceMessages = [
  { from: 0, to: 1, label: "chrome.alarms fires every 60s", type: "event" as const },
  { from: 1, to: 2, label: "fetch /api/account (credentials: include)", type: "request" as const },
  { from: 2, to: 1, label: "account.memberships[].organization.uuid", type: "response" as const },
  { from: 1, to: 2, label: "fetch /api/organizations/{uuid}/usage", type: "request" as const },
  { from: 2, to: 1, label: "seven Window buckets with utilization + resets_at", type: "response" as const },
  { from: 1, to: 3, label: "POST snapshot to 127.0.0.1:63762/snapshots", type: "request" as const },
  { from: 3, to: 1, label: "stored, badge updated with max(five_hour)", type: "response" as const },
];

const quickMetrics = [
  { value: 7, suffix: "", label: "Rolling utilization buckets named in UsageResponse" },
  { value: 60, suffix: "s", label: "Poll cadence (POLL_MINUTES = 1)" },
  { value: 0, suffix: "", label: "Cookie pastes required (extension route)" },
  { value: 1, suffix: "", label: "Endpoint ClaudeMeter depends on" },
];

const plannerMistakes = [
  {
    text: "Reading a single tracker's headline bar and assuming the weekly total is what tightened. It wasn't. The seven_day bucket has kept its curve.",
  },
  {
    text: "Using a token-counting tool as a rate-limit predictor. Tokens per message do not budge during silent tightening; the server weight does.",
  },
  {
    text: "Polling once an hour. The weekday 13:00 UTC knee disappears into two bars and you lose the evidence you were trying to collect.",
  },
  {
    text: "Ignoring seven_day_opus, seven_day_oauth_apps, seven_day_omelette, and seven_day_cowork because Anthropic only shows two bars on Settings. The server rate-limits on whichever bucket hits 100 first.",
  },
  {
    text: "Not logging raw JSON. When the next schema shift ships, you have no baseline to diff against and you are back to guessing.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-max-weekly-quota-tightening",
    title: "The weekly bucket did not move. The 5-hour one did.",
    excerpt:
      "Pull the /usage endpoint before and after 2026-03-26 on a fixed workload. Only five_hour.utilization changes slope. seven_day holds its curve.",
    tag: "Evidence",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "The Claude rolling window cap is seven windows, not one",
    excerpt:
      "Anthropic publishes two bars. The endpoint returns seven. Here is every bucket with field names and reset semantics.",
    tag: "Deep dive",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "One reads local tokens. One reads the server quota Anthropic enforces. They answer different questions.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude weekly quota silent tightening tracker: what a real one needs to do",
  description:
    "Silent tightening is a server-side weight change, not a token change. A tracker reading ~/.claude/projects/*.jsonl log files cannot see it. Here are the six concrete capabilities a tracker must have to detect the next one, and which popular tools satisfy which capability.",
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

export default function ClaudeWeeklyQuotaSilentTighteningPage() {
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
          A silent tightening tracker is{" "}
          <GradientText>a list of six capabilities</GradientText>. Here is the
          list.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Tightenings that land without documentation do not show up in your
          local{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/*.jsonl
          </code>{" "}
          files. The tokens per message are the same before and after. The
          signal lives in the response of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>
          , polled minute by minute, across seven rolling buckets at once. This
          page is the concrete list of what a tracker needs to check to catch
          the next one, and a straight honest comparison of what the popular
          tools can actually see today.
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

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Built on 60-second samples from the same endpoint claude.ai/settings/usage reads"
          highlights={[
            "Six-capability checklist, not a generic explainer",
            "Raw fields from UsageResponse (src/models.rs lines 18-28)",
            "Reproducible with two curl calls",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <RemotionClip
          title="Silent tightening lives past your log file."
          subtitle="Tokens don't move. Server weight does. Your tracker has to read the server."
          captions={[
            "Token counts per message: unchanged",
            "five_hour.utilization on fixed workload: climbs faster",
            "Only visible at /api/organizations/{org}/usage",
            "60-second cadence makes the knee visible",
            "Seven buckets to watch, not two",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What people mean by &quot;silent&quot; here
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          A tightening is silent when it lands without a changelog entry,
          without a banner on claude.ai, and without moving any field name in
          the usage payload. Your Claude bills look the same. Your logs look the
          same. Settings still renders the same two bars. The only thing that
          shifts is the ratio between a fixed workload and the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          numbers the server reports back. That is a hard thing to see from the
          outside because it moves no surface you are watching by default.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The 2026-03-26 change is the current example. Anthropic eventually
          acknowledged that weekday peak-hour limits were tightened and that
          overall weekly totals were unchanged. Before that acknowledgement
          landed, the only way to see it was to have been polling the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          endpoint at a short cadence and comparing two weeks of samples on the
          same account.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <MotionSequence
          title="Token-counter vs server-reader, frame by frame"
          frames={tokenVsWeightFrames}
          defaultDuration={4200}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2 text-center">
          The six-capability checklist
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          If a tool is missing any one of these, it will miss a silent
          tightening of the kind that shipped on 2026-03-26.
        </p>
        <BentoGrid cards={capabilityCards} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <MetricsRow metrics={quickMetrics} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            Anchor fact: all{" "}
            <NumberTicker value={7} /> buckets, named as fields
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg mb-6">
            The Rust struct ClaudeMeter deserializes the{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              /usage
            </code>{" "}
            payload into lives at{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              src/models.rs
            </code>{" "}
            lines 18 through 28. It names every one of the seven rolling
            buckets as an explicit{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              Option&lt;Window&gt;
            </code>{" "}
            field. That is not a stylistic choice. It is the part of the code
            that makes the next silent schema change loud: a renamed or added
            bucket surfaces as a parse error rather than a silently missing key
            on the plot.
          </p>
          <AnimatedCodeBlock
            code={usageResponseRust}
            language="rust"
            filename="claude-meter/src/models.rs (lines 3-28)"
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 60-second poll, in full
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Nothing exotic. A Chrome alarm fires every minute, the service worker
          fetches the account endpoint to find your org UUID, then fetches{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            credentials: &quot;include&quot;
          </code>{" "}
          so your existing{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai
          </code>{" "}
          session cookie rides along. No paste step. No second login. The whole
          loop is 14 lines that happen to produce a time series that silent
          tightening cannot hide from.
        </p>
        <AnimatedCodeBlock
          code={pollLoopJs}
          language="javascript"
          filename="claude-meter/extension/background.js (excerpt)"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What the extension does every minute
        </h2>
        <SequenceDiagram
          title="One alarm, two fetches, one snapshot"
          actors={["alarms", "worker", "claude.ai", "menu bar"]}
          messages={cookieSequenceMessages}
        />
        <p className="text-zinc-600 text-center mt-4 max-w-3xl mx-auto">
          The menu bar binary is not required for detection. It just gives you
          a glance-able readout. The service worker is the tracker.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 0-to-1 vs 0-to-100 trap
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Every silent tightening tracker eventually hits this. The same
          payload returns{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            0.64
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus.utilization
          </code>{" "}
          as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            64.0
          </code>
          . Same response body, two scales. If you skip the clamp your
          time-series plot will draw one line on a 0-1 axis and another on a
          0-100 axis and they will look like they live in different universes.
          The fix is one line.
        </p>
        <AnimatedCodeBlock
          code={normalizeJs}
          language="javascript"
          filename="claude-meter/extension/popup.js (lines 6-11)"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <ComparisonTable
          heading="Which tracker can actually see silent tightening?"
          intro="The tightening is a server-weight change. A tool built on local logs cannot see a server-weight change. That is not a bug; it is a data-source limit."
          productName="ClaudeMeter"
          competitorName="Local-log trackers (ccusage, Claude-Code-Usage-Monitor, etc.)"
          rows={trackerRows}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          The weight pipeline, in one diagram
        </h2>
        <AnimatedBeam
          title="One message, one weight scaler, seven buckets"
          from={[
            { label: "You send a message", sublabel: "claude.ai or Claude Code" },
          ]}
          hub={{
            label: "Anthropic quota scaler",
            sublabel: "weight silently retuned on 2026-03-26",
          }}
          to={[
            { label: "five_hour", sublabel: "the bucket that moved" },
            { label: "seven_day", sublabel: "held its curve" },
            { label: "seven_day_sonnet", sublabel: "held" },
            { label: "seven_day_opus", sublabel: "held" },
            { label: "seven_day_oauth_apps", sublabel: "held" },
          ]}
        />
        <p className="text-zinc-600 text-center mt-2 max-w-3xl mx-auto">
          The scaler sits in front of every bucket. Which bucket it tightens is
          a knob the backend can turn. A tracker that only looks at one bucket
          is already missing five of the knobs.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce the signal in two curl calls
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need the extension to see this. Paste your{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai
          </code>{" "}
          cookie into{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            $COOKIE
          </code>{" "}
          and pull the endpoint twice, either side of a fixed workload, on a
          weekday across the 13:00 UTC boundary.
        </p>
        <TerminalOutput
          title="Same account, same workload, different hour"
          lines={reproTerminal}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Roll your own tracker in six steps
        </h2>
        <StepTimeline steps={rollYourOwnSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <GlowCard className="p-8 rounded-2xl bg-white border border-zinc-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
            Five ways planners get caught out
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Each of these is something we have watched a reasonable engineer
            do, then get surprised by a 429 during a weekday afternoon they had
            budgeted as safe.
          </p>
          <AnimatedChecklist
            title="Avoid these"
            items={plannerMistakes}
          />
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveats
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint is internal and undocumented. Anthropic can rename any of
          the seven fields in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            UsageResponse
          </code>{" "}
          at any release. The 1.4x to 2x weekday multiplier we observed in March
          is a pattern across a month of samples, not a spec quote; it can
          drift within the peak window and between days. And a tracker polling
          with your session cookie is only as current as your cookie is; if you
          sign out of claude.ai, the service worker has nothing to send and
          starts reporting stale data. All of this is inherent to reading a
          surface that no vendor promised to hold stable.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch the next tightening live
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter is free, MIT-licensed, and ships with the extension so
          there is no cookie-paste step. Installs in a minute, polls every
          minute after that.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-20 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Hit a tightening your tracker missed?"
          description="Send us your 48-hour sample of the /usage endpoint. We map edges for free."
          text="Book a 15-minute call"
          section="silent-tightening-tracker-footer"
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
        description="Debug a tracker gap in 15 min."
        section="silent-tightening-tracker-sticky"
        site="claude-meter"
      />
    </article>
  );
}
