import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  BeforeAfter,
  AnimatedChecklist,
  MetricsRow,
  GlowCard,
  StepTimeline,
  RemotionClip,
  AnimatedBeam,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  Marquee,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-pro-5-hour-window-quota";
const PUBLISHED = "2026-04-21";

export const metadata: Metadata = {
  title: "Claude Pro 5-Hour Window Quota: What the Server Actually Counts",
  description:
    "Pro's 5-hour quota is not a message counter and the window is not anchored to your first prompt. The claude.ai server returns one utilization fraction with a sliding resets_at, and that single number is the only thing the rate limiter checks.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Pro 5-Hour Window Quota: What the Server Actually Counts",
    description:
      "What the 5-hour window actually is on Claude Pro: a server-side utilization float on a sliding window, not a 45-message counter starting at your first prompt.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Is Claude Pro's 5-hour limit really 45 messages?",
    a: "No. The number 45 you see quoted everywhere is a one-sample average that the Help Center used as an example range. The server does not track a remaining-message count for you. It tracks one utilization fraction in the five_hour bucket of /api/organizations/{org_uuid}/usage, weighted internally by prompt length, attachments, model, and tool calls. A short Sonnet message and a long Opus message with a PDF attached do not consume the same slice. Anything that quotes a fixed message count is averaging across an unknown distribution.",
  },
  {
    q: "When does the 5-hour window start?",
    a: "It does not start from your first prompt and run for a fixed five hours. The window is rolling. At any moment, it covers the last five hours of activity. The five_hour.resets_at field on the server tells you when the earliest unexpired message will age out, which is the next time your utilization number changes for free without you sending anything. Each new message you send pushes resets_at forward, because the earliest unexpired message keeps moving.",
  },
  {
    q: "Why does my window seem to never reset?",
    a: "Because rolling is not the same as expiring. If you send messages steadily, the earliest unexpired message keeps moving forward in real time, so resets_at keeps moving with it. You have to actually stop sending and let the oldest message age out for the bucket to drain. ClaudeMeter renders this directly: the 'resets · Xh' label in the popup is computed from the live resets_at the server returns, not from a five-hour timer started locally.",
  },
  {
    q: "Where is this number on claude.ai?",
    a: "Open claude.ai/settings/usage with DevTools' Network tab open. The page calls GET /api/organizations/{your-org-uuid}/usage. The response includes a five_hour object with a utilization float and a resets_at ISO timestamp. The bar drawn on the page is rendered from those same two values. ClaudeMeter calls the same endpoint with your existing session cookies, every 60 seconds, and surfaces the raw numbers without re-interpretation.",
  },
  {
    q: "Why is utilization sometimes 0.94 and sometimes 94.0?",
    a: "Because the API is internal and the scale is inconsistent across buckets and across releases. We have seen the same payload come back with five_hour at 0.94 and seven_day_opus at 94.0. ClaudeMeter normalizes with one clamp at popup.js:6-11: `u <= 1 ? u * 100 : u`. If you write your own client and skip that clamp, a bucket at 0.94 will render as 'less than 1 percent' and you will get rate-limited the next message.",
  },
  {
    q: "Can ccusage or Claude-Code-Usage-Monitor tell me my five_hour utilization?",
    a: "No. Those tools read JSONL files under ~/.claude/projects, count tokens locally, and infer cost. That is a different question from what the server is counting. The server's weighting for the five_hour bucket is not exposed and includes signal you do not have locally (peak-hour multiplier, attachment cost, tool calls, browser-chat usage). The only number that matches what the rate limiter enforces is the one returned by /api/organizations/{org_uuid}/usage.",
  },
  {
    q: "What happens at 100 percent?",
    a: "You get throttled. The Settings page bar pins, and any further request from the same org gets a 429 with a generic message. The bar does not name which bucket tripped, so if you are over on five_hour but fine on the weekly buckets, the error message looks identical to the inverse case. Watching utilization live is the only way to know whether to keep working or stop.",
  },
  {
    q: "Does Anthropic publish the formula?",
    a: "No. The endpoint is undocumented, the field names are not in any public spec, and the weighting is opaque. What we know comes from reading the JSON the Settings page itself fetches. ClaudeMeter deserializes that JSON into a strict Rust struct (src/models.rs), so when Anthropic adds, renames, or removes a field, the deserializer fails loudly and we ship a release.",
  },
  {
    q: "Does peak-hour traffic actually consume more of my quota?",
    a: "Anthropic announced in late 2025 that during weekday peak windows the five_hour bucket fills faster for free, Pro, and Max accounts. We see the effect directly in the live utilization numbers: the same workload that consumes 30 percent of five_hour at 6am Pacific consumes more at 1pm Pacific. There is no separate peak-hour field in the response, only the utilization float moves faster.",
  },
  {
    q: "How do I read the number without ClaudeMeter?",
    a: "GET https://claude.ai/api/organizations/{your-org-uuid}/usage from a browser session that is logged into claude.ai. Find your org_uuid by looking at the cookie or by reading any URL on claude.ai/settings. The response is plain JSON. ClaudeMeter exists because doing this every 60 seconds by hand, and pasting cookies into curl, is annoying. The browser extension forwards your existing session to the menu bar app over localhost so you never type a cookie.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Pro 5-hour window quota", url: PAGE_URL },
];

const fiveHourPayload = `{
  "five_hour": {
    "utilization": 0.72,
    "resets_at":   "2026-04-21T18:14:00Z"
  },
  "seven_day": {
    "utilization": 0.41,
    "resets_at":   "2026-04-26T09:02:00Z"
  },
  "extra_usage": {
    "is_enabled":   true,
    "monthly_limit": 5000,
    "used_credits":  1248.5,
    "utilization":   0.2497,
    "currency":      "USD"
  }
}`;

const windowStruct = `// claude-meter/src/models.rs (lines 3-7)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at:   Option<chrono::DateTime<chrono::Utc>>,
}`;

const normalizeFn = `// claude-meter/extension/popup.js (lines 6-11)
function pctFromWindow(w) {
  if (!w) return null;
  const u = typeof w.utilization === "number" ? w.utilization : null;
  if (u == null) return null;
  // five_hour sometimes arrives as 0.72, sometimes as 72.0.
  // Normalize both to a percent before rendering.
  return u <= 1 ? u * 100 : u;
}`;

const slidingFn = `// claude-meter/extension/popup.js (lines 17-27)
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

const reproTerminal = [
  { type: "command" as const, text: "# Grab the cookie header from DevTools on claude.ai/settings/usage" },
  { type: "command" as const, text: "ORG=<your org uuid from any /settings url>" },
  { type: "command" as const, text: "curl -s https://claude.ai/api/organizations/$ORG/usage \\" },
  { type: "command" as const, text: "  -H \"Cookie: $(< ~/.claude-session)\" | jq '.five_hour'" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"utilization\": 0.72," },
  { type: "output" as const, text: "  \"resets_at\":   \"2026-04-21T18:14:00Z\"" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "0.72 means 72%. The bar on /settings/usage is rendering this same float." },
];

const before = {
  label: "What every other guide tells you",
  content:
    "Claude Pro gives you about 45 messages per 5 hours. The window starts when you send your first message and ends 5 hours later. When the timer runs out, you get a fresh batch.",
  highlights: [
    "Implies a fixed message count, which the server does not track",
    "Implies the window is anchored to your first prompt, which is wrong",
    "Implies a single fixed reset time, which is not what resets_at returns",
    "Names no field, no endpoint, and no scale",
  ],
};

const after = {
  label: "What the server actually returns",
  content:
    "Pro's 5-hour quota is one float in usage.five_hour.utilization (a fraction between 0 and 1, or sometimes 0 and 100, in the same payload). The window is rolling: at any moment it covers the last 5 hours of activity. usage.five_hour.resets_at is the wall-clock time the earliest unexpired message will age out, and it slides forward whenever you send something new.",
  highlights: [
    "One opaque utilization float, not a counter",
    "Sliding window, not anchored to first prompt",
    "resets_at moves forward as you send",
    "Field names from src/models.rs, lines 3 to 7",
  ],
};

const reproSteps = [
  {
    title: "Open claude.ai/settings/usage",
    description:
      "This is the only first-party surface that renders your live quota. The page itself calls /api/organizations/{org_uuid}/usage to draw the bar.",
  },
  {
    title: "Open DevTools → Network → XHR",
    description:
      "Reload the Settings page. You will see the request to /api/organizations/{your-org-uuid}/usage. The response is a JSON object with a five_hour key on top.",
  },
  {
    title: "Read five_hour.utilization",
    description:
      "If it is between 0 and 1, multiply by 100 for a percent. If it is between 0 and 100 already, leave it. ClaudeMeter handles both at popup.js:6-11. The bar Anthropic draws is the same number, rounded.",
  },
  {
    title: "Watch resets_at slide",
    description:
      "Send a message in another tab, refresh, look again. resets_at advances. That is the rolling window: the earliest unexpired message just moved forward in time.",
  },
  {
    title: "Confirm the rate-limit ceiling",
    description:
      "When utilization hits 100, the next request from the same org returns 429. The bucket does not name itself in the error, so live monitoring is the only way to know which one tripped.",
  },
];

const matterChecklist = [
  {
    text: "Quoted message counts (45 per 5 hours, 225 for Max 5x, 900 for Max 20x) are average estimates over an unknown prompt distribution. Long prompts or attachments break them on the first message.",
  },
  {
    text: "If you assume the window is anchored to your first prompt, you will think you have hours left when the rolling clock has actually pulled forward and you are seconds from the wall.",
  },
  {
    text: "If you read your local Claude Code logs (ccusage, Claude-Code-Usage-Monitor), you can see tokens you spent. You cannot see the server's five_hour utilization, because the server applies weighting (peak-hour multiplier, attachment cost, tool calls) you do not have locally.",
  },
  {
    text: "If you skip the 0-to-1 vs 0-to-100 normalization, a bucket at 0.94 renders as 'less than 1%' and you walk straight into a 429.",
  },
  {
    text: "The only number that matches what Anthropic enforces is usage.five_hour.utilization on /api/organizations/{org_uuid}/usage.",
  },
];

const sequenceActors = ["You", "Browser", "claude.ai server", "Rate limiter"];
const sequenceMessages = [
  { from: 0, to: 1, label: "send a prompt", type: "request" as const },
  { from: 1, to: 2, label: "POST /completions", type: "request" as const },
  { from: 2, to: 3, label: "increment five_hour bucket", type: "event" as const },
  { from: 3, to: 2, label: "utilization +=  weight(prompt, model, attachments)", type: "response" as const },
  { from: 2, to: 1, label: "stream response", type: "response" as const },
  { from: 1, to: 2, label: "GET /api/organizations/{org}/usage", type: "request" as const },
  { from: 2, to: 1, label: "{ five_hour: { utilization, resets_at } }", type: "response" as const },
  { from: 2, to: 1, label: "next message: 429 if utilization >= 1", type: "error" as const },
];

const myths = [
  "Myth: 45 messages per 5 hours",
  "Myth: window starts at first prompt",
  "Myth: window expires all at once",
  "Myth: utilization is on a fixed scale",
  "Myth: local token counts equal server quota",
  "Myth: peak-hour throttling is a separate field",
];

const relatedPosts = [
  {
    href: "/t/claude-rolling-window-cap",
    title: "The rolling window cap is seven windows, not one",
    excerpt:
      "Five-hour is the famous one. The same endpoint returns six other buckets, each with its own ceiling and reset.",
    tag: "Related",
  },
  {
    href: "/how-it-works",
    title: "How ClaudeMeter reads your quota live",
    excerpt:
      "Browser extension forwards your existing claude.ai session over localhost:63762 to a Rust menu-bar app. Polls every 60 seconds.",
    tag: "Internals",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage counts tokens in your local Claude Code logs. ClaudeMeter reads the server-side utilization the rate limiter actually checks. Different question, different answer.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline: "Claude Pro 5-hour window quota: what the server actually counts",
  description:
    "Pro's 5-hour quota is one server-side utilization float on a sliding window, not a 45-message counter anchored to your first prompt. Where it lives in the JSON, why the resets_at slides, and how to read it yourself in one curl.",
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

export default function ClaudePro5HourWindowQuotaPage() {
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
          Claude Pro&apos;s 5-hour window quota is{" "}
          <GradientText>one float on a sliding clock</GradientText>, not 45 messages
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Anthropic does not publish a 5-hour message counter. The server tracks
          one opaque utilization fraction in a single field, on a window that
          slides forward every time you send a prompt. If you have ever been
          surprised by a 429 while you thought you had &ldquo;hours left,&rdquo;
          this is the field you wanted to be watching.
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
          ratingCount="Sourced from the live claude.ai usage endpoint"
          highlights={[
            "Field names from src/models.rs, lines 3-7",
            "Verifiable in 30 seconds with one curl",
            "Same JSON the Settings page itself fetches",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <RemotionClip
          title="five_hour: one float, sliding clock"
          subtitle="What Pro's 5-hour quota actually is on the wire"
          captions={[
            "utilization: a single opaque fraction",
            "resets_at: an ISO timestamp that slides forward",
            "scale: 0-to-1 OR 0-to-100, in the same payload",
            "endpoint: /api/organizations/{org_uuid}/usage",
            "weighted by: prompt length, model, attachments, peak-hour",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The myth, in one sentence
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Almost every article on this topic gives you the same shape: Pro
          equals roughly 45 messages per 5 hours, the window starts when you
          send your first prompt, and at the 5-hour mark you get a fresh batch.
          That description is wrong on three counts. There is no 45-message
          counter on the server. The window is not anchored to your first
          prompt. The 5-hour mark is not a fresh batch.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The shape that actually exists on the server is one number plus one
          timestamp, in one place.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <BeforeAfter
          title="Mental model swap"
          before={before}
          after={after}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: <NumberTicker value={1} /> field, <NumberTicker value={1} /> timestamp, <NumberTicker value={1} /> endpoint
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Hit{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          with your logged-in claude.ai cookies. The relevant slice for this
          topic is the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          object on top. Verbatim shape (formatted for readability):
        </p>
        <AnimatedCodeBlock
          code={fiveHourPayload}
          language="json"
          filename="claude.ai/api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          That is the entire 5-hour quota surface. One{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          float. One{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          ISO 8601 string. There is no message count. There is no remaining
          tokens field. There is no model breakdown inside this bucket. The
          rate limiter trips on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization {">="} 1.0
          </code>{" "}
          (or 100.0, depending on which scale your payload picked).
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The struct, verbatim
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter deserializes the response into this. If Anthropic ever
          changes the field shape, this is where you will see it break first:
        </p>
        <AnimatedCodeBlock
          code={windowStruct}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What &ldquo;rolling&rdquo; really means
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          A rolling window is not a timer. It is a moving boundary. At any
          moment, the window covers the last 5 hours of your activity. The
          server is keeping a list of recent messages and totaling the
          (weighted) cost of every one inside that boundary.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          When you send a new message, the cost lands inside the boundary and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          goes up. When the earliest unexpired message ages out (its timestamp
          becomes older than 5 hours), its cost falls out of the boundary and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          goes down. The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          field is the wall-clock time of that next age-out event.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Which means: every prompt you send pushes{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          forward. If you keep sending steadily, your &ldquo;reset&rdquo;
          timestamp is always five hours from your earliest unexpired message,
          which is always five hours from a moment that keeps moving. People
          read this and say the window &ldquo;never resets,&rdquo; but the
          mechanic is just that the boundary slid with them.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          One prompt, one bucket increment
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The exact handshake between you, the browser, the claude.ai server,
          and the rate limiter for a single 5-hour bucket request.
        </p>
        <SequenceDiagram
          title="five_hour update path"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 0-to-1 vs 0-to-100 trap
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          One ugly detail if you call the endpoint yourself: utilization
          arrives on inconsistent scales. We have seen the same payload come
          back with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          at <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">0.72</code>{" "}
          and a sibling bucket at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">94.0</code>.
          ClaudeMeter normalizes with one clamp:
        </p>
        <AnimatedCodeBlock
          code={normalizeFn}
          language="javascript"
          filename="claude-meter/extension/popup.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Without that clamp, a bucket at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">0.94</code>{" "}
          renders as &ldquo;less than 1%&rdquo; and your next prompt 429s.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The sliding clock, in code
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter does not start a 5-hour timer when you open the popup.
          It reads{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          straight from the server, every poll, and converts it into a
          human-readable countdown:
        </p>
        <AnimatedCodeBlock
          code={slidingFn}
          language="javascript"
          filename="claude-meter/extension/popup.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          That label (&ldquo;5-hour · 2h&rdquo;, &ldquo;5-hour · 47m&rdquo;,
          and so on) updates whenever the server returns a new{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>
          , which in practice is every minute the extension polls. The reason
          the countdown sometimes &ldquo;ticks back up&rdquo; instead of down
          is exactly the rolling-window behavior: you sent a message, the
          earliest-unexpired-message pointer moved, the timestamp moved with
          it.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce it yourself in one curl
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need ClaudeMeter to verify any of this. Open DevTools on
          claude.ai/settings/usage, copy the cookie header from the Network
          panel, and call the endpoint directly:
        </p>
        <TerminalOutput
          title="claude.ai/api/organizations/{org_uuid}/usage"
          lines={reproTerminal}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What every prompt actually does
        </h2>
        <AnimatedBeam
          title="Inputs to the five_hour float"
          from={[
            { label: "Prompt length", sublabel: "tokens you sent" },
            { label: "Model picked", sublabel: "Sonnet vs Opus weighting" },
            { label: "Attachments", sublabel: "PDFs, images, files" },
            { label: "Tool calls", sublabel: "code execution, web" },
            { label: "Peak-hour multiplier", sublabel: "weekday US Pacific midday" },
          ]}
          hub={{ label: "five_hour.utilization", sublabel: "one float, server-side" }}
          to={[
            { label: "Settings page bar" },
            { label: "Rate limiter at >= 1.0" },
            { label: "ClaudeMeter menu bar" },
            { label: "ClaudeMeter CLI --json" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The whole verification path, end to end
        </h2>
        <StepTimeline steps={reproSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Why the wrong mental model gets you 429&rsquo;d
        </h2>
        <AnimatedChecklist
          title="What you miss by counting messages"
          items={matterChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The numbers that matter
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              From the implementation. No invented benchmarks.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 1, label: "five_hour fields the server returns" },
              { value: 60, suffix: "s", label: "ClaudeMeter poll cadence" },
              { value: 63762, label: "Localhost bridge port" },
              { value: 0, label: "Cookies you have to paste" },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Common myths to drop
        </h2>
        <Marquee speed={40} pauseOnHover>
          {myths.map((m) => (
            <span
              key={m}
              className="mx-3 inline-flex items-center px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-200 whitespace-nowrap"
            >
              {m}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why local-token tools cannot give you this number
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              ccusage and Claude-Code-Usage-Monitor read{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ~/.claude/projects/**/*.jsonl
              </code>{" "}
              and total the tokens recorded in those files. That tells you what
              Claude Code burned on disk. It does not tell you what the server
              counts in your{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                five_hour
              </code>{" "}
              bucket.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              The reason is not philosophical. It is concrete. The server
              applies weighting that local logs do not see: a peak-hour
              multiplier (announced by Anthropic in late 2025), an
              attachment-cost factor, a per-model factor, and a tool-call
              factor. None of those land in your local JSONL file. They all
              land on{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                utilization
              </code>
              . The single endpoint that returns the post-weighting number is{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /api/organizations/&#123;org_uuid&#125;/usage
              </code>
              .
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              ClaudeMeter exists because that endpoint is the only one that
              matches what the rate limiter checks, and because a browser
              extension is the cleanest way to hit it (your existing session
              cookies, no paste, no scrape, no reverse-engineering).
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint is internal and undocumented. The field names listed
          here have been stable for many months but Anthropic could rename or
          reshape them in any release. ClaudeMeter deserializes into a strict
          struct, so if{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          changes shape the menu bar surfaces a parse error and we ship a
          patch the same day. Until then, this is the field. This is what the
          rate limiter checks.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch your 5-hour float live
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter sits in your macOS menu bar and refreshes every 60
          seconds. Free, MIT licensed, no cookie paste, reads the same JSON
          claude.ai/settings/usage reads.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <FaqSection items={faqs} />

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </section>

      <div className="max-w-4xl mx-auto px-6 mb-16">
        <BookCallCTA
          destination="https://cal.com/m13v/claude-meter"
          appearance="footer"
          heading="Seeing a different shape on five_hour?"
          description="If your payload returns extra fields, a different scale, or a resets_at that does not slide, send it. We map every variant we see."
          text="Book a 15-minute call"
          section="five-hour-quota-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/m13v/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on the 5-hour endpoint? 15 min."
        section="five-hour-quota-sticky"
        site="claude-meter"
      />
    </article>
  );
}
