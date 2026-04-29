import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  ComparisonTable,
  AnimatedChecklist,
  StepTimeline,
  GlowCard,
  MetricsRow,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-pro-5-hour-window-tracker";
const PUBLISHED = "2026-04-28";

export const metadata: Metadata = {
  title:
    "Claude Pro 5-Hour Window Tracker: The Countdown Math Most Guides Skip",
  description:
    "A 5-hour window tracker is mostly a countdown problem, not a percent problem. Walking the resets_at timestamp from the claude.ai server through every transformation a real tracker has to make, with the exact lines of code that turn an ISO 8601 string into a one-glance label.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Pro 5-Hour Window Tracker: The Countdown Math Most Guides Skip",
    description:
      "Inside a 5-hour window tracker: the resets_at humanization math (now / Nm / Nh / Nd), the 60-second poll cadence, and why a rolling window forces both. Source code from extension/popup.js with line numbers.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What is the rolling 5-hour window on Claude Pro and Max?",
    a: "It is a server-side cap that bills your prompts against the last 5 hours of activity, weighted by model class, attachments, and tool calls. The endpoint /api/organizations/{org_uuid}/usage on claude.ai returns it as a five_hour object with two fields: utilization (a float between 0 and 1, sometimes 0 and 100 depending on the bucket) and resets_at (an ISO 8601 timestamp pointing at the moment the oldest weighted message in the window will age out). A 'tracker' is anything that polls that JSON and turns it into something you can glance at without opening the Settings page.",
  },
  {
    q: "Why is the countdown the part that actually matters?",
    a: "Because the percent on its own is half information. 92 percent with a reset four minutes away is a coffee break. 92 percent with a reset four hours away is a switch-to-Sonnet-or-stop decision. The Settings page reduces resets_at to a binary 'usage will reset at HH:MM' string. A tracker has to render both axes (how full, and how long until empty) so you can pick the right remediation in under a second. The countdown is what makes the page-on-the-toolbar tracker more useful than the page on claude.ai.",
  },
  {
    q: "How does the tracker turn an ISO 8601 timestamp into '22m' or '3h'?",
    a: "extension/popup.js lines 17 to 27. The function fmtResets parses the ISO string, subtracts Date.now(), and bands the result. <=0ms returns 'now'. <1 hour returns Math.round(diff / 60000) plus 'm'. 1 to 48 hours returns Math.round(h) plus 'h'. >=48 hours returns Math.round(h / 24) plus 'd'. Three thresholds, four output shapes. The 1-hour boundary is the place where '60m' would feel coarse next to '1h'. The 48-hour boundary is where '50h' starts to feel less readable than '2d'. The bands are picked for one-glance legibility on a 6-character toolbar surface.",
  },
  {
    q: "Why does the tracker have to repoll every 60 seconds?",
    a: "Because the 5-hour window is rolling. resets_at is computed off the oldest weighted prompt still inside the 5-hour boundary; as soon as you fire another big prompt, that boundary slides forward and the timestamp changes. A static countdown would lie within minutes. background.js sets POLL_MINUTES = 1, registers a chrome.alarms tick on install and on startup, and calls refresh() on every fire. The cadence is fixed: no exponential backoff, no on-focus poll, no jitter. One minute, every minute, while the browser is awake.",
  },
  {
    q: "What does the tracker actually display?",
    a: "Two surfaces. The toolbar badge shows one number, the rounded percent on the worst five_hour bucket across every org you belong to, with a green/orange/red color band at <80 / >=80 / >=100 thresholds. Click the icon and the popup renders one row per account (email, percent, bar, countdown). The label format is '<bucket-name> · <countdown>' assembled in popup.js line 33: `${label} · ${resets}`. So '5-hour · 22m' or '5-hour · 3h' or '5-hour · now' depending on which band fmtResets fell into.",
  },
  {
    q: "Why not just show a precise countdown like 1h 47m 12s?",
    a: "Three reasons. First, the popup row is narrow (the extension popup is a fixed 320 pixel surface) and 1h 47m 12s eats horizontal space. Second, anything finer than minute precision flickers as the second ticks; the user reads a flicker as 'something is wrong'. Third, a single-unit label compresses to the part you need to plan around: when you see '3h' you do not need the minutes to know your refactor session is over for the afternoon. The design choice is precision proportional to the action the user will take, not to the resolution of the underlying timestamp.",
  },
  {
    q: "What about the seven-day buckets, do they get countdowns too?",
    a: "Yes, the same fmtResets function runs on every bucket the popup row renders: five_hour, seven_day, seven_day_sonnet, seven_day_opus when present. seven_day buckets land in the days band almost always, so you typically see '7d · 5d' or '7d Opus · 4d'. The algorithm does not care which bucket; it just receives an ISO timestamp and returns the band. That is intentional. The cap shape is changing on Anthropic's side fast enough that hardcoding bucket-specific countdown logic would be an immediate footgun.",
  },
  {
    q: "Does the countdown ever read 'now' for more than a second?",
    a: "Yes. resets_at can be a few seconds or even a few minutes in the past at the moment you read it, because the server's clock and the prompt-aging logic do not always tick on the same edge. fmtResets line 22 returns 'now' for any non-positive diff, which covers that small leading window. The next refresh, 60 seconds later, will pick up the new resets_at the server has computed against the next-oldest weighted prompt and the countdown will jump forward to a real value. This is also why the popup feels briefly stuck after a reset: the server has not yet recomputed the boundary.",
  },
  {
    q: "What if my system clock is wrong, do I get a wrong countdown?",
    a: "Yes. fmtResets uses Date.now() as the reference, which reads the local OS clock. If you have skewed your clock by an hour to test something, the countdown will be off by an hour. The percent is unaffected because it comes straight from the server. There is no NTP step inside the tracker. In practice machines stay close enough to true time that this never matters, but it is the one place the countdown depends on something other than the server payload.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "5-hour window tracker",
    url: PAGE_URL,
  },
];

const rawPayload = `// GET https://claude.ai/api/organizations/{org_uuid}/usage
{
  "five_hour": {
    "utilization": 0.92,
    "resets_at":   "2026-04-28T19:36:14.221Z"
  },
  "seven_day": {
    "utilization": 0.61,
    "resets_at":   "2026-05-04T08:14:02.510Z"
  },
  "seven_day_opus": {
    "utilization": 0.78,
    "resets_at":   "2026-05-04T08:14:02.510Z"
  }
}
// utilization: server-truth weighted fraction, 0 to 1 (sometimes 0 to 100)
// resets_at:   the next moment the oldest weighted prompt ages out`;

const fmtResetsCode = `// extension/popup.js lines 17-27
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
}

// Four output bands, picked for one-glance legibility:
//   <=0ms   -> "now"
//   <1h     -> "Nm"   (e.g. "22m")
//   1-48h   -> "Nh"   (e.g. "3h")
//   >=48h   -> "Nd"   (e.g. "5d")`;

const rowAssembly = `// extension/popup.js lines 29-40
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
}

// One row, three pieces of information:
//   "5-hour · 22m"     |==========       |   92%
//   the bucket label,    a clamped bar,    a rounded percent.`;

const pollCadenceCode = `// extension/background.js lines 1-3
const BASE = "https://claude.ai";
const BRIDGE = "http://127.0.0.1:63762/snapshots";
const POLL_MINUTES = 1;

// extension/background.js lines 104-114
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("refresh", { periodInMinutes: POLL_MINUTES });
  refresh();
});
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("refresh", { periodInMinutes: POLL_MINUTES });
  refresh();
});
chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === "refresh") refresh();
});`;

const trackerSession = [
  {
    type: "command" as const,
    text: "# Click the toolbar icon. The popup renders the live state.",
  },
  { type: "output" as const, text: "matt@example.com" },
  { type: "output" as const, text: "  5-hour · 22m   |==========       |  92%" },
  { type: "output" as const, text: "  7-day        |======           |  61%" },
  { type: "output" as const, text: "  7d Opus · 4d  |========         |  78%" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "  updated 11s ago" },
  {
    type: "success" as const,
    text: "5-hour at 92, reset in 22m. Coffee break, not switch-models.",
  },
];

const trackerSessionLater = [
  {
    type: "command" as const,
    text: "# Same surface, 17 minutes later. One Opus prompt fired in between.",
  },
  { type: "output" as const, text: "matt@example.com" },
  { type: "output" as const, text: "  5-hour · 9m    |===========      |  94%" },
  { type: "output" as const, text: "  7-day        |======           |  62%" },
  { type: "output" as const, text: "  7d Opus · 4d  |========         |  79%" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "  updated 4s ago" },
  {
    type: "success" as const,
    text: "Countdown moved 22m -> 9m. Window slid forward 4 minutes from one prompt.",
  },
];

const transformationSteps = [
  {
    title: "Step 1: server returns ISO 8601",
    description:
      "claude.ai/api/organizations/{org_uuid}/usage returns five_hour.resets_at as a millisecond-precision ISO 8601 string ('2026-04-28T19:36:14.221Z'). The same Settings page bar uses this exact string. The tracker fetches it with credentials: 'include' so it rides the existing logged-in session, no API key, no cookie paste.",
  },
  {
    title: "Step 2: parse to a Date",
    description:
      "popup.js line 19 calls new Date(iso). Browsers parse the Z-suffixed millisecond format natively, so there is no library dependency. The Date object stores UTC internally, which is what the math wants.",
  },
  {
    title: "Step 3: subtract Date.now()",
    description:
      "popup.js line 21 computes diff = d - now. Date arithmetic in JS coerces both sides to milliseconds since the epoch, so diff is a signed millisecond delta. Negative means resets_at has already passed; positive means it is in the future.",
  },
  {
    title: "Step 4: band into one of four shapes",
    description:
      "popup.js lines 22 to 26. <=0 returns 'now'. <1 hour returns minutes. 1-48 hours returns hours. >=48 hours returns days. Math.round at every step. The output is always two or three characters, never a precision-pretending string.",
  },
  {
    title: "Step 5: prepend the bucket label",
    description:
      "popup.js line 33 assembles `${label} · ${resets}`. So '5-hour' alone if resets came back empty, '5-hour · 22m' if it did. The middle dot is U+00B7. The label slot accepts any bucket name the API ships, which is why Anthropic adding seven_day_sonnet did not break anything.",
  },
  {
    title: "Step 6: redraw on the next 60-second tick",
    description:
      "background.js line 3 sets POLL_MINUTES = 1, registered as a chrome.alarms tick. Every 60 seconds the extension refetches /usage, normalizes utilization, recomputes resets_at into the band, and rewrites the popup HTML. If you keep prompting, the band moves; if you go idle, it stops.",
  },
];

const trackerVsPage = [
  {
    feature: "What the percent comes from",
    ours: "five_hour.utilization parsed from the live JSON",
    competitor: "five_hour.utilization parsed from the same JSON",
  },
  {
    feature: "What the countdown looks like",
    ours: "'22m', '3h', '5d' (one-unit, single glance)",
    competitor: "'usage will reset at 19:36' (absolute clock time)",
  },
  {
    feature: "Where you read it",
    ours: "Browser toolbar badge or macOS menu bar",
    competitor: "claude.ai/settings/usage page",
  },
  {
    feature: "When it refreshes",
    ours: "Every 60 seconds in the background",
    competitor: "On full page reload",
  },
  {
    feature: "How it handles a sliding resets_at",
    ours: "Re-derives every poll from the new timestamp",
    competitor: "Stale until the next reload",
  },
  {
    feature: "What it shows for already-passed timestamps",
    ours: "'now' literal, no negative durations",
    competitor: "Hides the label until the next poll",
  },
  {
    feature: "Cross-org coverage",
    ours: "Worst-case across every membership in one badge",
    competitor: "One org per visible page",
  },
  {
    feature: "Cost",
    ours: "Free, MIT licensed",
    competitor: "Bundled in your Pro/Max subscription",
  },
];

const sequenceActors = [
  "claude.ai",
  "extension",
  "fmtResets",
  "popup row",
];
const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "five_hour.resets_at = '...19:36:14Z'",
    type: "response" as const,
  },
  {
    from: 1,
    to: 2,
    label: "fmtResets(iso)",
    type: "request" as const,
  },
  {
    from: 2,
    to: 2,
    label: "diff = d - Date.now()",
    type: "event" as const,
  },
  {
    from: 2,
    to: 2,
    label: "band: <=0 / <1h / 1-48h / >=48h",
    type: "event" as const,
  },
  {
    from: 2,
    to: 1,
    label: "'22m'",
    type: "response" as const,
  },
  {
    from: 1,
    to: 3,
    label: "'5-hour · 22m'",
    type: "request" as const,
  },
  {
    from: 1,
    to: 1,
    label: "wait 60s, repeat",
    type: "event" as const,
  },
];

const trackerInvariants = [
  {
    text: "The countdown is one unit, never two. '22m' but not '0h 22m'. '3h' but not '3h 14m'. The unit is whichever band fmtResets fell into. Compound countdowns flicker on the second tick and burn pixels.",
  },
  {
    text: "The countdown re-derives from a fresh resets_at every minute, not from the last value minus 60 seconds. The window is rolling, so a stored countdown drifts; only the server knows where the boundary now sits.",
  },
  {
    text: "Negative diffs collapse to 'now', not to a negative duration. resets_at can briefly land in the past while the server recomputes against the next-oldest weighted prompt; the band hides that crack.",
  },
  {
    text: "The bucket label and the countdown are separated by U+00B7 (middle dot), not by a hyphen. Hyphens read like negative numbers next to a digit; the dot does not.",
  },
  {
    text: "The bar width is clamped at Math.min(100, v ?? 0). The server can return >100% on overage, and an unclamped bar would push past the row, breaking the popup layout.",
  },
  {
    text: "The poll cadence is fixed at 60 seconds. No exponential backoff, no on-focus poll, no jitter. Predictable cadence is what lets the user trust that the countdown reflects the last full minute of state.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-5-hour-window-quota",
    title: "The 5-hour window is one float on a sliding clock",
    excerpt:
      "Where the 5-hour bucket lives in the JSON, why resets_at slides, and how to read it yourself in one curl.",
    tag: "Mental model",
  },
  {
    href: "/t/claude-pro-5-hour-window-visibility",
    title: "5-hour visibility: one worst-case number on your toolbar",
    excerpt:
      "Multi-org-aware visibility into Claude Pro's rolling 5-hour window. The badge shows the worst case, not the active tab.",
    tag: "Visibility",
  },
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "Local counter vs server quota: why ccusage and claude.ai disagree",
    excerpt:
      "Why ccusage at 5 percent and claude.ai at rate-limited are both correct. They are reading two different sources.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Pro 5-hour window tracker: the countdown math most guides skip",
  description:
    "A 5-hour window tracker is mostly a countdown problem, not a percent problem. Walking the resets_at timestamp through every transformation a real tracker has to make.",
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

export default function ClaudePro5HourWindowTrackerPage() {
  return (
    <article className="text-zinc-900">
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
          A 5-hour window tracker is mostly a{" "}
          <GradientText>countdown problem</GradientText>, not a percent problem
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          The percent on its own is half information. 92 percent with reset in
          22 minutes is a coffee break. 92 percent with reset in 3 hours is a
          switch-to-Sonnet decision. The Settings page on claude.ai shows the
          percent and a binary low/reset label. A tracker has to render both
          axes (how full, and how long until empty) on a single glance. This
          page walks through the resets_at humanization math that turns the
          server&rsquo;s ISO 8601 timestamp into the &ldquo;22m&rdquo; or
          &ldquo;3h&rdquo; you actually plan around.
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

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Step 1: what the server actually hands you
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Hit{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          on claude.ai with your existing logged-in cookies. This is the same
          endpoint the Settings page fetches to draw its own bar. The
          interesting field for the countdown is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.resets_at
          </code>
          , an ISO 8601 string with millisecond precision:
        </p>
        <AnimatedCodeBlock
          code={rawPayload}
          language="json"
          filename="claude.ai/api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Two things to notice. The timestamp is UTC (Z suffix), so any
          countdown has to convert against the local clock at render time. And
          it is the moment the oldest weighted prompt in the rolling window
          will age out, which means the next prompt you fire can move that
          timestamp forward by minutes. The countdown is not stable; it is a
          live rolling boundary.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Step 2: the humanization function (the anchor of this whole page)
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          A timestamp is not a tracker. The tracker is what turns the
          timestamp into a label that fits on a 6-character badge surface and
          tells you which decision to make. ClaudeMeter does that in eleven
          lines of JavaScript:
        </p>
        <AnimatedCodeBlock
          code={fmtResetsCode}
          language="javascript"
          filename="extension/popup.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Four output bands, three thresholds. The 1-hour boundary is where
          &ldquo;60m&rdquo; would feel coarse next to &ldquo;1h&rdquo;. The
          48-hour boundary is where &ldquo;50h&rdquo; starts to scan worse than
          &ldquo;2d&rdquo;. The 0-millisecond floor catches the brief window
          where{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          has already passed but the server has not yet recomputed against the
          next-oldest weighted prompt. The bands are picked for one-glance
          legibility, not for precision; precision is a bug here, not a
          feature.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Step 3: gluing the countdown to the bucket label
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The popup row is one line per bucket. Three pieces of information,
          assembled in twelve more lines:
        </p>
        <AnimatedCodeBlock
          code={rowAssembly}
          language="javascript"
          filename="extension/popup.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The label looks like{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            5-hour &middot; 22m
          </code>
          . The middle dot is U+00B7, deliberately not a hyphen; a hyphen next
          to a digit reads like a negative sign on first glance and the
          countdown should never read as negative. The bar width is clamped at
          100 because the server can return values over 1.0 on overage, and an
          unclamped bar would push past the 320-pixel popup column and break
          the layout.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Step 4: why this only works because the poll is fixed at 60 seconds
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          A countdown derived once and then ticked locally drifts within
          minutes when the underlying boundary is rolling. Every new prompt
          can slide{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          forward by however long the oldest aging prompt was holding the
          window. The tracker re-fetches the JSON every minute and re-runs the
          band, which is the only way the label stays honest:
        </p>
        <AnimatedCodeBlock
          code={pollCadenceCode}
          language="javascript"
          filename="extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The cadence is intentional. No exponential backoff, no on-focus
          poll, no jitter. Predictable cadence is what lets you trust that the
          number on the badge reflects the last full minute of state. The
          chrome.alarms registration on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            onInstalled
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            onStartup
          </code>{" "}
          covers the case where the service worker has been put to sleep by
          Chrome between sessions; setInterval would not survive that.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What it actually looks like
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          A snapshot of the popup at the start of an Opus session, with one
          5-hour bucket close to the cap:
        </p>
        <TerminalOutput title="ClaudeMeter popup, 14:06" lines={trackerSession} />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          17 minutes later, after one heavy prompt, the same surface looks
          like this:
        </p>
        <TerminalOutput title="ClaudeMeter popup, 14:23" lines={trackerSessionLater} />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The percent ticked from 92 to 94 (small move). The countdown ticked
          from 22m to 9m (much bigger move). That ratio is the whole point: a
          rolling window can move the reset countdown by minutes for every one
          or two percent of utilization burned, because what is aging out is a
          single weighted prompt at a time, not a smooth curve. Watch the
          countdown, not the percent.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          End-to-end transformation, one timestamp
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          One ISO 8601 string from the server, one popup row at the end. Six
          steps in between, each implemented in a handful of lines.
        </p>
        <SequenceDiagram
          title="resets_at to popup row"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The whole transformation, in steps
        </h2>
        <StepTimeline steps={transformationSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Six invariants the tracker holds, all derived from the rolling-window shape
        </h2>
        <AnimatedChecklist
          title="What a 5-hour tracker has to get right"
          items={trackerInvariants}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Tracker vs the Settings page
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Both read the same JSON. The difference is what they render and how
          fresh the render is.
        </p>
        <ComparisonTable
          productName="ClaudeMeter (browser + menu bar)"
          competitorName="claude.ai/settings/usage"
          rows={trackerVsPage}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The numbers that fix the design
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              All four are knobs you can read out of the source. None are
              invented benchmarks.
            </p>
          </div>
          <MetricsRow
            metrics={[
              {
                value: 4,
                label: "output bands fmtResets returns (now / Nm / Nh / Nd)",
              },
              {
                value: 60,
                suffix: "s",
                label: "fixed poll cadence (POLL_MINUTES = 1)",
              },
              {
                value: 11,
                label: "lines of code in fmtResets (popup.js 17-27)",
              },
              {
                value: 0,
                label: "API keys or cookies pasted by the user",
              },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What this buys you in practice
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              A 5-hour window tracker that gets the countdown right turns the
              cap from a surprise into a planning input. You see{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                5-hour &middot; 22m
              </code>{" "}
              at 92 percent and you finish the function you are in the middle
              of, then take the break. You see{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                5-hour &middot; 3h
              </code>{" "}
              at 92 percent and you switch to Sonnet for the rest of the
              session. Both are signals the Settings page conveys with a
              binary &ldquo;low&rdquo; or &ldquo;reset at 19:36&rdquo; and a
              static bar. Neither of those tells you which mitigation actually
              fits the next 90 seconds of work.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              The countdown is also the part of the tracker that catches a
              quiet behavioral change first. When Anthropic tightens the
              window weighting, the percent moves a little but the reset
              countdown jumps a lot, because aging is the variable they are
              actually adjusting. Tracking both is what makes a tightening
              detectable in a session rather than three days later when you
              hit a 429.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint is internal and undocumented. Anthropic could rename
          fields or change the rolling-window semantics in any release. The
          countdown math is robust to that because it operates on the field
          shape, not on the field meaning, but if the shape changes a release
          ships the same day. The four-band humanization is a UX choice, not
          a protocol decision; if your taste runs to compound countdowns or
          finer precision, the eleven lines of fmtResets are the only thing
          you would need to fork.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Building your own tracker and want to compare countdown bands?"
          description="If you have a different humanization scheme or a poll cadence story you want to compare against, send a 15 minute call. Happy to swap notes on the rolling-window edge cases."
          text="Book a 15-minute call"
          section="5h-window-tracker-footer"
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
        description="Questions on the 5-hour countdown math? 15 min."
        section="5h-window-tracker-sticky"
        site="claude-meter"
      />
    </article>
  );
}
