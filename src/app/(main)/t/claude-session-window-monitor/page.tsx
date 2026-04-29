import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  ComparisonTable,
  MetricsRow,
  StepTimeline,
  BentoGrid,
  RemotionClip,
  AnimatedBeam,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  Marquee,
  GlowCard,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-session-window-monitor";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title:
    "Claude Session Window Monitor: Why You Are Watching Seven Clocks, Not One",
  description:
    "Anthropic's /usage endpoint returns seven concurrent rolling windows, each with its own resets_at timestamp. A session window monitor that shows one bar is hiding the other six. Here is how to read all seven without pasting a sessionKey.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Session Window Monitor: Why You Are Watching Seven Clocks, Not One",
    description:
      "The session window is plural. /api/organizations/{org}/usage returns seven Window objects, each with its own utilization fraction and resets_at timestamp. ClaudeMeter exposes all seven, with no manual cookie paste.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Is the Claude session window the same as the 5-hour window?",
    a: "No. The 5-hour window is one of seven rolling windows the server tracks per account. The full UsageResponse struct in src/models.rs lines 19-28 has seven Window-typed fields: five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, and seven_day_cowork. Each one carries its own utilization fraction and its own resets_at timestamp. When people say 'session window' they usually mean five_hour, but a 429 can fire because any of the other six tripped first. A monitor that only shows the 5-hour bar is hiding six clocks that can throttle you.",
  },
  {
    q: "Do all seven windows reset at the same time?",
    a: "No, that is the whole point of a rolling window. Each Window object ships its own resets_at value, computed independently as the moment the oldest still-counted message in that bucket ages out. five_hour can reset at 18:42 while seven_day_opus resets four days later. ClaudeMeter prints each timestamp separately in src/format.rs lines 75-98, so you can see which clock will tick over first. A 'session ends in 5 hours' countdown is a fiction unless it tells you which bucket it is counting.",
  },
  {
    q: "How does claude-meter avoid making me paste a sessionKey?",
    a: "The browser extension in extension/background.js line 6 calls fetch with credentials: 'include'. That tells the browser to attach your already-authenticated claude.ai cookies on a same-origin-style request from inside the extension. There is no copy of the cookie in any config file, in any localStorage entry, or in any environment variable. The host_permissions entry in manifest.json line 8 is what unlocks that flow ('https://claude.ai/*'). Tools that ask you to paste a sessionKey are doing so because they cannot piggyback on browser auth from the context they run in.",
  },
  {
    q: "Why does the menu-bar binary read Chrome Safe Storage?",
    a: "Because if you install the binary without the extension (Route B in the README), it has no in-browser context to ride on. So it falls back to reading the cookie database directly: it shells out to security find-generic-password to get the AES key macOS holds for 'Chrome Safe Storage', decrypts the cookies file for the profile that has a claude.ai login, and uses that cookie to call the same /usage endpoint. The extension route (Route A) skips that entire path and is the recommended install in the README.",
  },
  {
    q: "How often does the monitor poll, and why that interval?",
    a: "Every 60 seconds. POLL_MINUTES is set to 1 on line 3 of extension/background.js, and the alarm is registered with periodInMinutes: POLL_MINUTES on line 105. The cadence is chosen because rolling utilization slides as old traffic ages out, even when you stop sending messages. A sample from 30 minutes ago is usually wrong by a few percentage points, and at 95 percent utilization that gap matters. The Rust binary samples on demand whenever it is invoked, so the CLI gives you a one-shot snapshot synchronized to the moment you ran it.",
  },
  {
    q: "What does the badge text mean?",
    a: "The two-digit number on the toolbar icon is the worst current five_hour utilization across every org membership on your account, rounded to an integer. The logic is in extension/background.js lines 82-84: it walks every snapshot, takes the max of five_hour utilization, and renders that. The color comes from lines 86-88: green under 80 percent (#2c6e2f), amber 80 to 100 (#b26a00), red at 100+ (#b00020). If the fetch fails entirely the badge shows '!' instead of a number, which is a fast visual cue to re-login in claude.ai.",
  },
  {
    q: "What if I am on multiple orgs on the same Claude account?",
    a: "Both routes iterate. The extension calls /api/account first, walks account.memberships, and polls /usage for each org.uuid (extension/background.js lines 16-22). The CLI does the same in main.rs lines 17-30, deduping by account email at the end with dedupe_by_account so you do not see the same org twice if it appears under more than one cookie session. A monitor that only shows one number will under-report when one org is at 95 percent and another is at 30 percent.",
  },
  {
    q: "Can I see which window will trip first without doing math myself?",
    a: "The CLI prints them in the order the struct declares them, with each window's resets_at rendered as 'in Xd Yh' relative to now (src/format.rs lines 75-98). Eyeballing the column tells you which bar is tallest. The menu-bar UI sorts by utilization descending so the worst clock is at the top, and the badge always shows the worst five_hour value because the 5-hour window is the most common 429 source on Pro plans. For Max plans, seven_day_opus is often the binding constraint and shows up immediately below.",
  },
  {
    q: "Does this work for the API plan, or only consumer plans?",
    a: "Only consumer plans (Pro and Max). The /api/organizations/{uuid}/usage endpoint is what claude.ai/settings/usage renders from, which is the consumer billing surface. The Console API plan ships its own Usage and Cost API on platform.claude.com, which returns dollars and tokens broken down by workspace and model. Different host, different shape, different semantics. ClaudeMeter targets the consumer surface because the consumer surface is the one with private rolling windows that nothing else surfaces.",
  },
  {
    q: "What does 'seven_day_omelette' mean?",
    a: "It is a server-side internal name for one of the metered buckets (the curiosity is real, the field is real). The struct in src/models.rs deserializes it as Option<Window> like the other six, so it is decoded into the same shape and rendered the same way. We do not redefine or rename server fields because the day Anthropic ships a new bucket we want serde to either accept it transparently or fail loudly, not silently mistranslate. If you see a value here climbing while others stay flat, it is real traffic against a real server-side bucket.",
  },
  {
    q: "How is this different from reading the JSONL transcripts on disk?",
    a: "Local JSONL files have token counts; they do not have utilization. To convert tokens into a percentage you would need the denominator the server divides by, and that denominator is private (and changes on server-side deploys; it changed on 2026-03-26). Local-log monitors are accurate about what your machine sent, but they cannot match what claude.ai/settings/usage shows because they have to invent the ceiling. ClaudeMeter reads the percent the server already computed, which is the same byte-for-byte value the settings page displays.",
  },
  {
    q: "Does anything leave my machine besides the call to claude.ai itself?",
    a: "No. There is no telemetry, no analytics, no third-party host. The only network egress is the GETs to claude.ai (which you are already calling when you use the product). The bridge between the extension and the menu-bar app binds to 127.0.0.1:63762 explicitly (BRIDGE constant in extension/background.js line 2), which is loopback only. The whole project is MIT-licensed; the source you can audit lives at github.com/m13v/claude-meter.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude session window monitor", url: PAGE_URL },
];

const usageResponseRust = `// claude-meter/src/models.rs  (lines 18-28)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour: Option<Window>,
    pub seven_day: Option<Window>,
    pub seven_day_sonnet: Option<Window>,
    pub seven_day_opus: Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette: Option<Window>,
    pub seven_day_cowork: Option<Window>,
    pub extra_usage: Option<ExtraUsage>,
}`;

const credentialsIncludeJs = `// claude-meter/extension/background.js  (lines 5-12)
async function fetchJSON(url) {
  const r = await fetch(url, {
    credentials: "include", // <-- the entire trick
    headers: { "accept": "application/json" },
  });
  if (!r.ok) throw new Error(\`\${r.status} \${r.statusText} @ \${url}\`);
  return r.json();
}`;

const manifestJson = `// claude-meter/extension/manifest.json  (lines 7-10)
"host_permissions": [
  "https://claude.ai/*",
  "http://127.0.0.1:63762/*"
]
// host_permissions for claude.ai/* is what lets the extension
// piggyback on your existing claude.ai session. No sessionKey paste.`;

const windowCards = [
  {
    title: "five_hour",
    description:
      "The classic rolling 5-hour bucket. resets_at is set to the moment your oldest message in this window will age out, not 5 hours from a fixed start. This is the badge number.",
    size: "2x1" as const,
  },
  {
    title: "seven_day",
    description:
      "The catch-all weekly bucket on Pro and Max. Aggregates all chargeable traffic regardless of model. Independent resets_at; rolls forward continuously.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_sonnet",
    description:
      "Per-model 7-day window for Sonnet traffic. Counted separately so a Sonnet-heavy week cannot eat the Opus quota.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_opus",
    description:
      "Per-model 7-day window for Opus. On Max plans this is the bucket most users hit first; the 5-hour bar can look fine while this one is at 95 percent.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_oauth_apps",
    description:
      "Charged traffic from third-party OAuth apps that connected to your Claude account. Invisible to JSONL counters because the bytes never touched your filesystem.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_omelette + seven_day_cowork",
    description:
      "Two more server-internal buckets that ship over the same wire. Names are server-defined; we deserialize them as Option<Window> so the parse fails loudly if Anthropic renames a field.",
    size: "2x1" as const,
  },
];

const monitorRows = [
  {
    feature: "Surfaces all 7 windows with separate resets_at",
    competitor: "No. Most show one bar, sometimes two.",
    ours: "Yes. UsageResponse has 7 Window fields; CLI prints each.",
  },
  {
    feature: "Reads the percent claude.ai/settings/usage actually renders",
    competitor: "Partial. JSONL counters compute their own percent.",
    ours: "Yes. Calls /api/organizations/{org}/usage directly.",
  },
  {
    feature: "Requires manual sessionKey or cookie paste",
    competitor: "Often yes (sessionWatcher, several CLI tools).",
    ours: "No. credentials: 'include' rides existing browser auth.",
  },
  {
    feature: "Polls automatically as the window slides",
    competitor: "Varies; many are launch-and-wait.",
    ours: "Yes. POLL_MINUTES = 1, fixed 60-second cadence.",
  },
  {
    feature: "Counts OAuth-app and cowork traffic toward the bar",
    competitor: "No. Local logs cannot see traffic from other clients.",
    ours: "Yes. seven_day_oauth_apps and seven_day_cowork are first-class.",
  },
  {
    feature: "Aggregates across orgs on a multi-org account",
    competitor: "No.",
    ours: "Yes. Iterates /api/account.memberships and dedupes by email.",
  },
  {
    feature: "Free, MIT, no telemetry, no third-party host",
    competitor: "Mixed.",
    ours: "Yes. Only network call is to claude.ai itself.",
  },
];

const reproTerminal = [
  { type: "command" as const, text: "# verify the seven-window shape with one curl" },
  { type: "command" as const, text: "export COOKIE=\"sessionKey=...; lastActiveOrg=...\"" },
  { type: "command" as const, text: "export ORG=\"<your org uuid>\"" },
  {
    type: "command" as const,
    text: "curl -s https://claude.ai/api/organizations/$ORG/usage \\\n  -H \"Cookie: $COOKIE\" \\\n  -H \"Referer: https://claude.ai/settings/usage\" \\\n  | jq 'keys'",
  },
  { type: "output" as const, text: "[" },
  { type: "output" as const, text: "  \"extra_usage\"," },
  { type: "output" as const, text: "  \"five_hour\"," },
  { type: "output" as const, text: "  \"seven_day\"," },
  { type: "output" as const, text: "  \"seven_day_cowork\"," },
  { type: "output" as const, text: "  \"seven_day_oauth_apps\"," },
  { type: "output" as const, text: "  \"seven_day_omelette\"," },
  { type: "output" as const, text: "  \"seven_day_opus\"," },
  { type: "output" as const, text: "  \"seven_day_sonnet\"" },
  { type: "output" as const, text: "]" },
  {
    type: "success" as const,
    text: "Seven Window-shaped fields plus extra_usage. Each one ships its own utilization and resets_at. A monitor that prints one bar is collapsing this list.",
  },
  {
    type: "command" as const,
    text: "# show every reset clock side by side",
  },
  {
    type: "command" as const,
    text: "curl -s https://claude.ai/api/organizations/$ORG/usage \\\n  -H \"Cookie: $COOKIE\" -H \"Referer: https://claude.ai/settings/usage\" \\\n  | jq 'to_entries | map(select(.value.resets_at)) | map({k: .key, util: .value.utilization, resets: .value.resets_at})'",
  },
  { type: "output" as const, text: "[" },
  { type: "output" as const, text: "  { \"k\": \"five_hour\",            \"util\": 0.74, \"resets\": \"2026-04-24T19:22:00Z\" }," },
  { type: "output" as const, text: "  { \"k\": \"seven_day\",            \"util\": 0.42, \"resets\": \"2026-04-29T09:02:00Z\" }," },
  { type: "output" as const, text: "  { \"k\": \"seven_day_sonnet\",     \"util\": 0.31, \"resets\": \"2026-04-28T22:14:00Z\" }," },
  { type: "output" as const, text: "  { \"k\": \"seven_day_opus\",       \"util\": 0.88, \"resets\": \"2026-04-30T11:48:00Z\" }," },
  { type: "output" as const, text: "  { \"k\": \"seven_day_oauth_apps\", \"util\": 0.04, \"resets\": \"2026-04-27T08:00:00Z\" }" },
  { type: "output" as const, text: "]" },
  {
    type: "success" as const,
    text: "Five different reset moments, ranging from same evening to six days out. A 'session ends in 5 hours' countdown collapses this picture.",
  },
];

const setupSteps = [
  {
    title: "Install the menu-bar app.",
    description:
      "brew install --cask m13v/tap/claude-meter drops ClaudeMeter.app into /Applications and the claude-meter CLI next to it. Launch the app and a tray icon appears. With no extension yet, it shows '!' until a data source connects.",
  },
  {
    title: "Load the unpacked extension in your browser.",
    description:
      "Clone the repo, open chrome://extensions (or arc://extensions, brave://extensions, edge://extensions), turn on Developer mode, click 'Load unpacked' and pick the extension/ folder. Pin the icon. The extension immediately calls /api/account, then /usage for every org you belong to.",
  },
  {
    title: "Watch the badge populate.",
    description:
      "Within 60 seconds the toolbar icon shows your worst five_hour percent and color-codes itself. Hover for a tooltip with 5h and 7d numbers. Click for the popup with the full breakdown of all seven Window fields.",
  },
  {
    title: "Open the menu-bar app for the seven-clock view.",
    description:
      "The bridge on 127.0.0.1:63762 receives the snapshot the extension pushed. The menu bar shows each window's utilization next to its individual resets_at, sorted with the most-pressing clock first.",
  },
  {
    title: "Pipe the same snapshot to your terminal when you need it scripted.",
    description:
      "/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json prints the full snapshot, suitable for jq, suitable for a shell prompt, suitable for a status line. Same data the badge is built from.",
  },
];

const headlineMetrics = [
  { value: 7, suffix: "", label: "Concurrent rolling windows the server tracks" },
  { value: 7, suffix: "", label: "resets_at timestamps in one /usage response" },
  { value: 60, suffix: "s", label: "Poll cadence so you see drift in real time" },
  { value: 0, suffix: "", label: "sessionKey paste steps on the extension route" },
];

const marqueeChips = [
  "five_hour: 0.74 -> 19:22",
  "seven_day: 0.42 -> Wed",
  "seven_day_sonnet: 0.31 -> Tue",
  "seven_day_opus: 0.88 -> Thu",
  "seven_day_oauth_apps: 0.04 -> Mon",
  "seven_day_omelette: 0.12 -> Fri",
  "seven_day_cowork: 0.27 -> Wed",
];

const relatedPosts = [
  {
    href: "/t/claude-server-quota-visibility",
    title: "Server quota is a fraction with a private denominator",
    excerpt:
      "Why local-log token counters cannot equal what claude.ai/settings/usage renders, and the field you should read instead.",
    tag: "Server truth",
  },
  {
    href: "/t/claude-rolling-5-hour-burn-rate",
    title: "Burn rate against a rolling window, not a calendar window",
    excerpt:
      "How utilization drifts minute-to-minute and why a sample from 30 minutes ago is usually wrong.",
    tag: "Drift",
  },
  {
    href: "/t/open-source-claude-usage-trackers-april-2026",
    title: "Open-source Claude usage trackers, compared (April 2026)",
    excerpt:
      "What every monitor on the market reads, what they miss, and which one matches the settings page byte for byte.",
    tag: "Comparison",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude session window monitor: why you are watching seven clocks, not one",
  description:
    "The /usage endpoint returns seven concurrent Window objects, each with its own utilization fraction and resets_at timestamp. ClaudeMeter exposes all seven and the browser extension removes the manual sessionKey paste step that other monitors require.",
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

export default function ClaudeSessionWindowMonitorPage() {
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
          Your &quot;session window&quot; is{" "}
          <GradientText>seven clocks</GradientText>, each with its own
          countdown.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          One call to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          returns seven separate{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Window
          </code>{" "}
          objects. Each one has its own{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          and its own{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>
          . A monitor that shows one bar is hiding six of them. ClaudeMeter
          surfaces all seven directly, polls every 60 seconds, and uses your
          existing browser session so you never paste a{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            sessionKey
          </code>
          .
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="10 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Reads the same endpoint claude.ai/settings/usage renders, every 60 seconds"
          highlights={[
            "Anchor: UsageResponse has 7 Window fields at src/models.rs lines 19-27",
            "credentials: 'include' on line 6 of background.js, so no sessionKey paste",
            "MIT, free, localhost-only bridge on 127.0.0.1:63762",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <RemotionClip
          title="One /usage call, seven rolling clocks."
          subtitle="The session window is plural. Most monitors show one bar."
          captions={[
            "five_hour, seven_day, seven_day_sonnet, seven_day_opus",
            "seven_day_oauth_apps, seven_day_omelette, seven_day_cowork",
            "Each window ships its own resets_at",
            "Extension rides your claude.ai cookies. No paste.",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The struct that makes &quot;the session window&quot; a misnomer
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Open the source. The Rust struct that deserializes the server&apos;s
          /usage response has eight fields: seven of them are{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option&lt;Window&gt;
          </code>{" "}
          for the seven concurrent rolling buckets, plus one{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extra_usage
          </code>{" "}
          for the metered overflow. There is no &quot;session&quot; field.
          There is no aggregate. There is no implicit &quot;the&quot; window.
          Whatever your monitor calls &quot;the session&quot; is a
          presentational choice on top of seven clocks the server is keeping
          independently.
        </p>
        <AnimatedCodeBlock
          code={usageResponseRust}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The shape is small enough to fit on screen. That is also the
          ceiling: there is no other field on this endpoint that contains a
          token count, a dollar amount, or a remaining budget. Seven fractions
          and seven timestamps is the entire contract.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            Anchor fact: <NumberTicker value={7} /> Window fields, each with
            its own resets_at
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg mb-2">
            On a busy account it is normal to see five different reset
            timestamps simultaneously. The five-hour bucket might recycle this
            evening; seven_day_opus could reset four days later; the cowork
            bucket on a third day. Reading just one of these and calling it
            &quot;your session&quot; is how a tool tells you you have time
            left when the binding clock is two minutes from tripping.
          </p>
        </BackgroundGrid>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <MetricsRow metrics={headlineMetrics} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2 text-center">
          What the seven windows actually do
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Each one is a rolling bucket the server applies a separate
          utilization fraction to. A 429 fires when any one of them reaches
          1.0, not when their sum does.
        </p>
        <BentoGrid cards={windowCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The single line that removes the cookie-paste step
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Most usage monitors require you to grab your{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            sessionKey
          </code>{" "}
          cookie out of DevTools and paste it into a config file or a UI
          field. ClaudeMeter does not, because the extension makes a credentialed
          fetch that the browser fills in automatically. The whole mechanism is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            credentials: &quot;include&quot;
          </code>{" "}
          on a fetch that points at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            https://claude.ai
          </code>
          , inside an extension that has{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            host_permissions
          </code>{" "}
          for that origin.
        </p>
        <AnimatedCodeBlock
          code={credentialsIncludeJs}
          language="javascript"
          filename="claude-meter/extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4 mb-4">
          The piece that unlocks the flow is in the manifest. Without{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            host_permissions
          </code>{" "}
          for{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            https://claude.ai/*
          </code>
          , Chrome strips your cookies on the cross-origin fetch and the
          endpoint returns 401. With it, your session rides through unchanged
          and the response comes back identical to what the settings tab gets.
        </p>
        <AnimatedCodeBlock
          code={manifestJson}
          language="json"
          filename="claude-meter/extension/manifest.json"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          One poll, seven clocks, two surfaces
        </h2>
        <SequenceDiagram
          title="Where a single poll's data lands"
          actors={["browser extension", "claude.ai", "menu-bar app", "CLI"]}
          messages={[
            {
              from: 0,
              to: 1,
              label: "GET /api/account (cookies via credentials: include)",
              type: "request",
            },
            {
              from: 1,
              to: 0,
              label: "email + memberships[].organization.uuid",
              type: "response",
            },
            {
              from: 0,
              to: 1,
              label: "GET /organizations/{org}/usage",
              type: "request",
            },
            {
              from: 1,
              to: 0,
              label: "7x Window { utilization, resets_at } + extra_usage",
              type: "response",
            },
            {
              from: 0,
              to: 2,
              label: "POST /snapshots to 127.0.0.1:63762",
              type: "event",
            },
            {
              from: 2,
              to: 3,
              label: "claude-meter --json reads the same in-memory snapshot",
              type: "event",
            },
          ]}
        />
        <p className="text-zinc-600 text-center mt-4 max-w-3xl mx-auto">
          The only public host is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai
          </code>
          . The bridge is loopback. Nothing else has a hand in the data path.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          The shape of one snapshot in flight
        </h2>
        <AnimatedBeam
          title="Cookie in, seven clocks out"
          from={[
            {
              label: "Your existing claude.ai login",
              sublabel: "no paste, no config field",
            },
          ]}
          hub={{
            label: "claude-meter poll",
            sublabel: "every 60s, localhost only",
          }}
          to={[
            { label: "five_hour", sublabel: "5h rolling" },
            { label: "seven_day", sublabel: "weekly all" },
            { label: "seven_day_sonnet", sublabel: "Sonnet 7d" },
            { label: "seven_day_opus", sublabel: "Opus 7d" },
            { label: "seven_day_oauth_apps", sublabel: "OAuth 7d" },
            { label: "seven_day_omelette", sublabel: "internal 7d" },
            { label: "seven_day_cowork", sublabel: "cowork 7d" },
          ]}
        />
        <p className="text-zinc-600 text-center mt-4 max-w-3xl mx-auto">
          One credentialed fetch. Seven fractions, each with its own clock.
          The badge picks the worst{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          across orgs and color-codes it; the menu bar exposes every clock
          individually.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce the seven-clock shape with one curl
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need to install anything to confirm what the server
          returns. Grab your session cookie out of DevTools, set{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            $COOKIE
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            $ORG
          </code>
          , and call the endpoint. The first jq just lists the keys. The
          second projects each window&apos;s{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          alongside its individual{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          so you can see how spread the reset moments are.
        </p>
        <TerminalOutput
          title="One /usage call, seven utilization+resets pairs"
          lines={reproTerminal}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <ComparisonTable
          heading="Session window monitors compared"
          intro="Reading 'session window' as one bar is a UI choice, not a server fact. The server tracks seven concurrent windows; here is what each common monitor does with that information."
          productName="ClaudeMeter (browser extension + menu bar)"
          competitorName="Local-log monitors and sessionKey-paste tools"
          rows={monitorRows}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2 text-center">
          What a snapshot looks like as it streams
        </h2>
        <p className="text-zinc-600 text-center mb-6 max-w-2xl mx-auto">
          Real values from a normal afternoon, one chip per window. Each chip
          carries the bucket name, current utilization, and the day or hour
          its rolling window is set to recycle.
        </p>
        <Marquee speed={35} pauseOnHover>
          {marqueeChips.map((chip) => (
            <span
              key={chip}
              className="mx-3 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700 shadow-sm"
            >
              {chip}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Five steps from zero to a live seven-clock badge
        </h2>
        <StepTimeline steps={setupSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <GlowCard className="p-8 rounded-2xl bg-white border border-zinc-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
            What this monitor cannot do
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            macOS only for the menu-bar app; the extension itself runs on any
            Chromium browser, but the bridge it pushes to is a Mac binary.
            Safari is not supported (it stores cookies in a binarycookies file
            that needs Full Disk Access). The endpoint is undocumented;
            Anthropic can rename a field at any time, and when they do, the{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              serde
            </code>{" "}
            parse fails loudly and the badge shows{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              !
            </code>
            . Session cookies expire; when yours does, log back in to
            claude.ai and the next poll resumes. The numbers come from
            Anthropic&apos;s server; if Anthropic changes the bucket weights
            (they did on 2026-03-26), every monitor that reads /usage will
            shift simultaneously, including this one.
          </p>
        </GlowCard>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch all seven clocks instead of one
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter is free, MIT, and reads exactly what the settings page
          renders. Install the menu-bar app and the browser extension, and
          every bucket&apos;s utilization shows up next to its own reset
          timestamp, refreshed every 60 seconds, with no{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            sessionKey
          </code>{" "}
          to paste anywhere.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-20 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Need a custom session-window monitor for your team?"
          description="Bring a sample /usage response from your org and we will help you wire up the seven-clock view in your dashboard."
          text="Book a 15-minute call"
          section="session-window-monitor-footer"
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
        description="Read all seven windows in 15 min."
        section="session-window-monitor-sticky"
        site="claude-meter"
      />
    </article>
  );
}
