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

const PAGE_URL = "https://claude-meter.com/t/claude-weekly-limit-by-tuesday";
const PUBLISHED = "2026-04-26";

export const metadata: Metadata = {
  title:
    "Claude Weekly Limit by Tuesday: It's a 168-Hour Clock, Not a Calendar Week",
  description:
    "If your Claude weekly limit hits by Tuesday, you are not low on quota; you are deep into a rolling 168-hour window that started the moment you sent your first message of the cycle. The exact reset timestamp is in the JSON the server returns. Here is how to read it and how to plan around it.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Weekly Limit by Tuesday: It's a 168-Hour Clock, Not a Calendar Week",
    description:
      "Your seven-day bucket starts at your first message and ends 168 hours later. The server returns the exact resets_at timestamp. Most articles on this never mention it.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Why does my Claude weekly limit hit by Tuesday when the week just started?",
    a: "Because the seven-day bucket is not aligned to a calendar week. It is a rolling 168-hour window keyed off the first message you sent in this cycle. If you started a heavy session on Sunday afternoon, your seven_day window resets the following Sunday afternoon, not Sunday midnight. By Tuesday you are roughly 40 hours into a 168-hour window, and you have probably already burned 60 to 90 percent of the bucket. The cliff is on Tuesday because the clock started Sunday, not because the limit shrunk.",
  },
  {
    q: "How do I find the exact timestamp my weekly window resets?",
    a: "Pull GET /api/organizations/{org_uuid}/usage with your claude.ai cookies. The response is a JSON with a seven_day field; that field has a resets_at value that is an ISO-8601 UTC timestamp. That is your cliff to the second. ClaudeMeter's popup converts it for you and renders the row label as something like 7-day · 4d so you see your countdown at a glance. Local-log tools like ccusage and Claude-Code-Usage-Monitor cannot show you this because resets_at lives only in the JSON the server returns, never in ~/.claude/projects/*.jsonl.",
  },
  {
    q: "Where in ClaudeMeter's source is the reset countdown actually computed?",
    a: "Two files. The Rust struct that types the field is in src/models.rs lines 3 through 7: pub struct Window { utilization: f64, resets_at: Option<chrono::DateTime<chrono::Utc>> }. The countdown formatter is in extension/popup.js lines 17 through 27, the fmtResets function, which converts the ISO timestamp into 12m, 23h, or 5d depending on how far away it is. The popup row label is built in lines 29 through 40 and renders as `${label} · ${resets}`. So when the field is missing the row falls back to just the label; when it is present you see the countdown.",
  },
  {
    q: "Does the seven-day window reset all at once or is it actually rolling?",
    a: "It rolls. Each bucket has its own resets_at. As old usage falls out of the trailing 168 hours, the utilization number ticks down in real time, and resets_at points at the moment the oldest still-counted message will fall off. This means the cliff date moves as you keep using the product. ClaudeMeter polls every 60 seconds, so resets_at is current to the minute.",
  },
  {
    q: "Why don't ccusage or Claude-Code-Usage-Monitor show resets_at?",
    a: "Because they read ~/.claude/projects/*.jsonl files locally and count tokens. Those files have your sent and received messages but no field for the server's view of the rolling window. resets_at is computed by Anthropic's backend. The only place it surfaces on the client is the JSON response from /api/organizations/{org}/usage, which neither tool fetches. To make them show resets_at you would need to add a session cookie path, an HTTP client, and a parser for the /usage payload.",
  },
  {
    q: "Can I see resets_at without installing ClaudeMeter?",
    a: "Yes. Open claude.ai, log in, open DevTools, go to Application then Cookies, copy your sessionKey and any cookie whose name starts with cf_ or __secure-. Hit GET https://claude.ai/api/organizations/{your_org_uuid}/usage with those cookies and a Referer of https://claude.ai/settings/usage. The response has seven Window-shaped fields. Each one has a resets_at. Pipe through jq '.seven_day.resets_at' to print yours.",
  },
  {
    q: "How does ClaudeMeter convert the ISO timestamp into 4d or 23h?",
    a: "fmtResets in extension/popup.js does the math. It subtracts now from the parsed timestamp, then picks the unit: under one hour it shows minutes, under 48 hours it shows hours, otherwise days. The thresholds are deliberate. Hours up to 47 keeps the resolution useful when you are close to the cliff; days for anything further so you do not see a noisy 73h that just means three days. The function lives at lines 17 through 27 and is 11 lines.",
  },
  {
    q: "Why does the seven-day window start at first message, not at billing day?",
    a: "Because Anthropic implements quotas as rate-limit windows, not as calendar buckets. A 168-hour window is the standard rolling implementation. Every message ages out 168 hours after it was sent. There is no aggregation at midnight Sunday. The billing cycle is a separate concept from the rate-limit window; your invoice may reset on day-of-month, but the seven-day quota window resets per message. This is also why heavy sessions early in your cycle hit the wall earlier in the next cycle.",
  },
  {
    q: "What does ClaudeMeter show besides the seven-day countdown?",
    a: "The popup renders a row per bucket. five-hour, 7-day, 7d Sonnet, 7d Opus. Each row has the label plus countdown, a horizontal bar showing utilization, and the percent. Rows turn amber at 80 percent and red at 100. The icon badge in your browser toolbar shows the worst five_hour percentage so you do not need to open the popup to see if you are about to hit a cliff. The Rust menu-bar app (Route B) prints the same data in the macOS menu bar.",
  },
  {
    q: "Does upgrading to Max 20x change when my Tuesday cliff lands?",
    a: "It changes how much you can do before you hit the cliff, not when the cliff is. A bigger seven-day allowance means you can sustain more weekly work, but the rolling 168-hour clock still starts at your first message of the cycle. If your usage pattern is the same, your reset timestamp moves in lockstep. Same Tuesday afternoon cliff, just at a higher absolute total. If your goal is to push the cliff later in the week, you have to push the start of the cycle later in the week, not just buy more capacity.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude weekly limit by Tuesday", url: PAGE_URL },
];

const windowStructRust = `// claude-meter/src/models.rs (lines 3-7)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}`;

const fmtResetsJs = `// claude-meter/extension/popup.js (lines 17-27)
function fmtResets(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = Date.now();
  const diff = d - now;
  if (diff <= 0) return "now";
  const h = diff / 3_600_000;
  if (h < 1) return \`\${Math.round(diff / 60_000)}m\`;
  if (h < 48) return \`\${Math.round(h)}h\`;
  return \`\${Math.round(h / 24)}d\`;
}`;

const rowLabelJs = `// claude-meter/extension/popup.js (lines 29-40)
function row(label, win) {
  const v = pctFromWindow(win);
  const cls = v == null ? "" : v >= 100 ? "hot" : v >= 80 ? "warn" : "";
  const resets = fmtResets(win?.resets_at);
  const lab = resets ? \`\${label} · \${resets}\` : label;
  return \`
    <div class="row">
      <span class="label">\${lab}</span>
      <span class="bar \${cls}"><span style="width:\${Math.min(100, v ?? 0)}%"></span></span>
      <span class="pct">\${fmtPct(v)}</span>
    </div>\`;
}`;

const tuesdayCliffMetrics = [
  { value: 168, suffix: "h", label: "Length of the rolling window" },
  { value: 60, suffix: "s", label: "ClaudeMeter poll cadence" },
  { value: 7, suffix: "", label: "Buckets, each with its own resets_at" },
  { value: 0, suffix: "", label: "Local log files that contain resets_at" },
];

const capabilityCards = [
  {
    title: "Reads server-side resets_at",
    description:
      "GET /api/organizations/{org_uuid}/usage with your existing session cookie. Each Window in the response has resets_at. That field is the cliff timestamp.",
    size: "2x1" as const,
  },
  {
    title: "Live countdown, not a snapshot",
    description:
      "fmtResets converts the ISO string into 12m, 23h, or 5d. Polled every 60 seconds. The countdown drifts as the rolling window rolls.",
    size: "1x1" as const,
  },
  {
    title: "All seven buckets countdown separately",
    description:
      "five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork. Each renders as label · countdown.",
    size: "1x1" as const,
  },
  {
    title: "Badge shows the worst slice",
    description:
      "The toolbar icon badge displays the highest five_hour percent across all logged-in orgs. You see the cliff coming without opening the popup.",
    size: "1x1" as const,
  },
  {
    title: "Works while you are away from claude.ai",
    description:
      "chrome.alarms.create('refresh', { periodInMinutes: 1 }) keeps the service worker polling whether or not the Settings page is open. The countdown stays current.",
    size: "1x1" as const,
  },
  {
    title: "No cookie paste",
    description:
      "credentials: 'include' on the fetch reuses your existing claude.ai session. The Rust menu bar app (Route B) reads Chrome Safe Storage if you prefer no extension.",
    size: "2x1" as const,
  },
];

const stepsToFindReset = [
  {
    title: "Open DevTools on claude.ai/settings/usage",
    description:
      "Sign in to claude.ai. Open the Settings then Usage page. Open DevTools, switch to the Network tab, filter for usage. The page fires a request to /api/organizations/{org_uuid}/usage when it loads.",
  },
  {
    title: "Inspect the response JSON",
    description:
      "Click the request, switch to the Response tab. You will see seven fields shaped like { utilization, resets_at }. The seven_day field is your weekly bucket.",
  },
  {
    title: "Copy seven_day.resets_at",
    description:
      "It is an ISO-8601 string in UTC, for example 2026-04-30T14:22:00Z. That is the moment the oldest still-counted message will age out, and your weekly utilization will tick down accordingly.",
  },
  {
    title: "Subtract now from resets_at",
    description:
      "If resets_at is more than 48 hours away, you are early in the cycle. If it is less than 24 hours and your utilization is above 80 percent, the Tuesday cliff is real and arriving. The math is exactly what fmtResets does in 11 lines.",
  },
  {
    title: "Or skip the manual step",
    description:
      "Install the ClaudeMeter extension. The popup row labels render as 7-day · 4d automatically. No copy-paste, no reload-the-Settings-page-every-hour habit.",
  },
];

const reproTerminal = [
  {
    type: "command" as const,
    text: "# from your logged-in claude.ai session, get your org uuid",
  },
  {
    type: "command" as const,
    text: "curl -s https://claude.ai/api/account -H \"Cookie: $COOKIE\" \\\n  | jq -r '.memberships[0].organization.uuid'",
  },
  {
    type: "output" as const,
    text: "9d2f4c7a-6b3e-4c8f-a4d1-5e7f9c0a1b2c",
  },
  {
    type: "command" as const,
    text: "# now read your seven-day cliff timestamp",
  },
  {
    type: "command" as const,
    text: "curl -s https://claude.ai/api/organizations/$ORG/usage \\\n  -H \"Cookie: $COOKIE\" -H \"Referer: https://claude.ai/settings/usage\" \\\n  | jq '{utilization: .seven_day.utilization, resets_at: .seven_day.resets_at}'",
  },
  {
    type: "output" as const,
    text: "{",
  },
  {
    type: "output" as const,
    text: "  \"utilization\": 0.78,",
  },
  {
    type: "output" as const,
    text: "  \"resets_at\":   \"2026-04-30T14:22:00Z\"",
  },
  {
    type: "output" as const,
    text: "}",
  },
  {
    type: "success" as const,
    text: "Today is Tuesday afternoon UTC. resets_at is Thursday 14:22 UTC. You are 78% used with 50 hours left. The cliff is real and 48 hours out.",
  },
];

const trackerRows = [
  {
    feature: "Shows resets_at as a countdown",
    competitor: "No. Local logs do not contain this field.",
    ours: "Yes. fmtResets renders 12m / 23h / 5d.",
  },
  {
    feature: "Knows your window started at first message",
    competitor: "Assumes a fixed weekly boundary or the time of the last command.",
    ours: "Yes. resets_at reflects the rolling 168-hour clock.",
  },
  {
    feature: "Updates the countdown live",
    competitor: "No. Recomputes only when you run a Claude Code command.",
    ours: "Yes. 60-second poll keeps the countdown current.",
  },
  {
    feature: "Renders 7d Sonnet and 7d Opus separately",
    competitor: "No. Single global token estimate.",
    ours: "Yes. Each per-model bucket has its own resets_at.",
  },
  {
    feature: "Shows the cliff in the browser toolbar",
    competitor: "No. CLI only.",
    ours: "Yes. Badge text plus popup.",
  },
  {
    feature: "Open source",
    competitor: "Most are. ClaudeMeter is too.",
    ours: "Yes. MIT.",
  },
];

const dontDoThis = [
  {
    text: "Assuming the weekly cycle starts Sunday midnight or your billing day. It starts at your first message of the cycle.",
  },
  {
    text: "Watching only the percent bar on Settings. Without resets_at the bar tells you nothing about when you can keep going.",
  },
  {
    text: "Treating ccusage's 'weekly tokens' total as a quota predictor. Tokens are not what gets rate-limited; the server's per-bucket utilization is, and that bucket has a clock.",
  },
  {
    text: "Reloading claude.ai/settings/usage every hour to read the timestamp by hand. The endpoint serves the same data; poll it instead.",
  },
  {
    text: "Buying Max 20x to push the cliff later. More capacity does not move the clock; only restarting your cycle later in the week does.",
  },
];

const cliffSequenceMessages = [
  { from: 0, to: 1, label: "alarm fires every 60s", type: "event" as const },
  { from: 1, to: 2, label: "fetch /api/account", type: "request" as const },
  { from: 2, to: 1, label: "memberships[].organization.uuid", type: "response" as const },
  { from: 1, to: 2, label: "fetch /api/organizations/{uuid}/usage", type: "request" as const },
  { from: 2, to: 1, label: "seven_day { utilization, resets_at }", type: "response" as const },
  { from: 1, to: 1, label: "fmtResets(resets_at) -> '4d'", type: "event" as const },
  { from: 1, to: 3, label: "render row '7-day · 4d'", type: "request" as const },
  { from: 3, to: 1, label: "popup updates, badge updates", type: "response" as const },
];

const relatedPosts = [
  {
    href: "/t/claude-weekly-quota-silent-tightening",
    title: "What a silent-tightening tracker actually needs",
    excerpt:
      "Six concrete capabilities. Reads the server endpoint, polls every 60 seconds, watches all seven buckets, normalizes the 0-1 vs 0-100 scale, logs raw JSON, runs in the background.",
    tag: "Deep dive",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "The rolling cap is seven windows, not one",
    excerpt:
      "Anthropic publishes two bars on the Settings page. The endpoint returns seven. Here is every bucket with its field name and reset semantics.",
    tag: "Reference",
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
    "Claude weekly limit by Tuesday: it's a 168-hour clock, not a calendar week",
  description:
    "If your Claude weekly limit hits by Tuesday, the cause is the rolling 168-hour window starting at your first message of the cycle, not a quota change. The exact reset timestamp is a field in the JSON the server returns. ClaudeMeter surfaces it as a live countdown.",
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

export default function ClaudeWeeklyLimitByTuesdayPage() {
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
          Hitting your Claude weekly limit by Tuesday is{" "}
          <GradientText>a 168-hour clock</GradientText>, not a calendar week.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          The seven-day bucket starts the moment you send your first message of
          the cycle and ends exactly{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            168
          </code>{" "}
          hours later. There is no Sunday-midnight reset. The exact timestamp
          is a field called{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          in the JSON the server returns. Most articles on this leave it at
          &quot;it&apos;s a rolling window, space your usage.&quot; This page
          shows you the field, the file, the formatter, and the exact two-curl
          path to read your own cliff timestamp.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="8 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Built on the same /api/organizations/{org}/usage endpoint claude.ai/settings/usage reads"
          highlights={[
            "Field name, file path, line numbers",
            "Two curl calls reproduce the cliff timestamp",
            "Live countdown updates every 60 seconds",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <RemotionClip
          title="Tuesday is the cliff because Sunday started the clock."
          subtitle="The seven-day window is rolling, not weekly. resets_at tells you the exact moment."
          captions={[
            "First message at Sunday 14:22 UTC",
            "Window ends Sunday 14:22 + 168 hours",
            "By Tuesday afternoon you are 48 hours in",
            "resets_at is a server field, not a guess",
            "ClaudeMeter renders it as a live countdown",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why Tuesday, specifically
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The pattern people describe is the same one. They sit down Sunday
          afternoon or Monday morning to clear backlog. Most of their week of
          Claude work happens in the first 48 hours of the cycle. By Tuesday
          afternoon, they are 60 to 90 percent into the seven-day bucket and
          their cliff lands later that day or Wednesday morning. The natural
          reaction is to assume the weekly allowance shrunk. It did not. The
          allowance is the same; the clock just started Sunday and is now 48
          hours deep into a 168-hour window.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The cliff is not aligned to a calendar boundary. It is aligned to the
          message that started your cycle. Two engineers with identical Max
          plans, identical workloads, but different cycle starts will hit the
          wall on different days. The only way to know your specific cliff is
          to read{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day.resets_at
          </code>{" "}
          from the server.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <MetricsRow metrics={tuesdayCliffMetrics} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          One message, one 168-hour clock, one reset timestamp
        </h2>
        <AnimatedBeam
          title="Where resets_at comes from"
          from={[
            {
              label: "First message of cycle",
              sublabel: "you send it Sunday 14:22 UTC",
            },
          ]}
          hub={{
            label: "Anthropic backend",
            sublabel: "starts a 168-hour rolling window per bucket",
          }}
          to={[
            { label: "five_hour.resets_at", sublabel: "5h after sample" },
            { label: "seven_day.resets_at", sublabel: "168h after first msg" },
            { label: "seven_day_sonnet.resets_at", sublabel: "per-model" },
            { label: "seven_day_opus.resets_at", sublabel: "per-model" },
            { label: "seven_day_oauth_apps.resets_at", sublabel: "per-channel" },
          ]}
        />
        <p className="text-zinc-600 text-center mt-2 max-w-3xl mx-auto">
          Each bucket carries its own resets_at. The seven-day bucket is the
          one that lands you on Tuesday. The five-hour bucket is the one that
          can take you out within an afternoon if you are in a heavy stretch.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            Anchor fact: every bucket has{" "}
            <NumberTicker value={1} /> resets_at field
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg mb-6">
            The Rust struct ClaudeMeter deserializes the{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              /usage
            </code>{" "}
            response into is short. Two fields per bucket. One is the
            utilization. The other is the cliff timestamp. The whole concept of
            a Claude weekly limit lives in those two fields, repeated seven
            times.
          </p>
          <AnimatedCodeBlock
            code={windowStructRust}
            language="rust"
            filename="claude-meter/src/models.rs"
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 11-line countdown
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The popup converts the ISO timestamp into a human-readable countdown
          with one function. Subtract now, pick the unit. Under one hour shows
          minutes. Under 48 hours shows hours. Otherwise days. The thresholds
          are the load-bearing part: hours up to 47 keeps the resolution useful
          when you are close to the cliff, days for anything further so a
          three-day countdown does not show as a noisy{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            73h
          </code>
          .
        </p>
        <AnimatedCodeBlock
          code={fmtResetsJs}
          language="javascript"
          filename="claude-meter/extension/popup.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          That string is then concatenated into the row label. The popup row is
          built one bucket at a time, and the label always reads as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            {"${label} · ${resets}"}
          </code>{" "}
          when resets_at is present. So the seven-day row literally reads{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            7-day · 4d
          </code>{" "}
          when you are four days from your cliff.
        </p>
        <AnimatedCodeBlock
          code={rowLabelJs}
          language="javascript"
          filename="claude-meter/extension/popup.js"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2 text-center">
          What ClaudeMeter does with the field
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Six concrete behaviors that all hang off the same{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          field.
        </p>
        <BentoGrid cards={capabilityCards} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What the popup does every minute
        </h2>
        <SequenceDiagram
          title="alarm to render, in eight steps"
          actors={["alarms", "worker", "claude.ai", "popup"]}
          messages={cliffSequenceMessages}
        />
        <p className="text-zinc-600 text-center mt-4 max-w-3xl mx-auto">
          fmtResets is the only piece of UI logic between the JSON and the row
          label. Everything else is fetch and render.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce your own cliff in two curl calls
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Paste your{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai
          </code>{" "}
          cookie into{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            $COOKIE
          </code>
          . Hit account, then hit usage. The second response has{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day.resets_at
          </code>
          . That is your cliff. No installation, no extension, no menu bar.
        </p>
        <TerminalOutput
          title="What the server returns"
          lines={reproTerminal}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Read your reset timestamp in five steps
        </h2>
        <StepTimeline steps={stepsToFindReset} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <ComparisonTable
          heading="Which tools surface resets_at?"
          intro="The cliff timestamp is a server-side field. A tool that reads only local logs cannot show it without adding a session-cookie path and an HTTP client to the /usage endpoint."
          productName="ClaudeMeter"
          competitorName="Local-log trackers (ccusage, Claude-Code-Usage-Monitor)"
          rows={trackerRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <GlowCard className="p-8 rounded-2xl bg-white border border-zinc-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
            Five wrong moves when the Tuesday cliff lands
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Each is something a reasonable engineer does and then loses an
            afternoon to. None of them require any new product, only reading
            the timestamp the server already gives you.
          </p>
          <AnimatedChecklist
            title="Avoid these"
            items={dontDoThis}
          />
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Honest caveats
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint is undocumented. Anthropic can rename or drop{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          without notice. ClaudeMeter types it as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option&lt;DateTime&lt;Utc&gt;&gt;
          </code>{" "}
          so a missing or renamed field surfaces as a parse error rather than a
          silently empty countdown. The 168-hour interval is what we have
          observed across months of polling; it can change on any release.
          And{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          drifts in real time as the rolling window rolls. If you snapshot it
          and then check back six hours later, the value will not be six hours
          smaller; it is the moment the next-oldest still-counted message will
          age out, which itself moves with usage.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          See your countdown live
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter is free, MIT-licensed, and uses your existing claude.ai
          session through a browser extension. Your popup row reads{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            7-day · 4d
          </code>{" "}
          within a minute of install.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-20 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Want help mapping your cycle?"
          description="Send us 48 hours of /usage samples. We will mark your real cliff on a chart in 15 minutes."
          text="Book a 15-minute call"
          section="weekly-limit-by-tuesday-footer"
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
        description="Map your real Tuesday cliff in 15 min."
        section="weekly-limit-by-tuesday-sticky"
        site="claude-meter"
      />
    </article>
  );
}
