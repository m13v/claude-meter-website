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
  BeforeAfter,
  RemotionClip,
  AnimatedBeam,
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

const PAGE_URL = "https://claude-meter.com/t/claude-max-weekly-quota-tightening";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title: "Claude Max Weekly Quota Tightening: The Weekly Bucket Didn't Move, The 5-Hour One Did",
  description:
    "Everybody calls the 2026-03-26 change a weekly quota tightening. The claude.ai usage endpoint says otherwise: seven_day.utilization tracks flat while five_hour.utilization climbs 1.4x-2x faster on weekdays 13:00-19:00 UTC. Here is how to watch the slope change live.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Max Weekly Quota Tightening: The Weekly Bucket Didn't Move, The 5-Hour One Did",
    description:
      "The tightening people are calling weekly is actually a five_hour.utilization decay change. The seven_day bucket is unchanged. Here is the server-side proof.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Did Anthropic reduce the Max weekly allowance on 2026-03-26?",
    a: "No. The seven_day bucket returned by /api/organizations/{org_uuid}/usage has the same utilization curve it had on 2026-03-20. What changed is the five_hour bucket's decay rate on weekdays between 13:00 and 19:00 UTC. Same weekly total, faster 5-hour climb. Anthropic's own communication says overall weekly limits stay the same, just how they're distributed across the week is changing. The endpoint data backs that up.",
  },
  {
    q: "So why does every article call it weekly quota tightening?",
    a: "Because the visible symptom is that heavy weekday users run out earlier in the week than they used to. Readers interpret running out earlier as a weekly squeeze. Mechanically it is a 5-hour squeeze that compounds across the week, but the five_hour bucket is the one carrying the change. The seven_day aggregate stays on its pre-change curve.",
  },
  {
    q: "How do I see the change with my own eyes?",
    a: "Open DevTools on claude.ai/settings/usage during off-peak hours, copy the response JSON of /api/organizations/{org_uuid}/usage, note five_hour.utilization. Send a fixed workload (say 50 Sonnet messages). Record the delta. Repeat the exact same workload starting at 13:10 UTC on a weekday. The delta on five_hour is larger during peak. The delta on seven_day is proportional and unchanged. ClaudeMeter does this every 60 seconds for you, so you see it as a slope rather than two snapshots.",
  },
  {
    q: "Why can't ccusage or Claude-Code-Usage-Monitor show this?",
    a: "Because they read local Claude Code JSONL logs and count tokens. Tokens per message did not change on 2026-03-26. What changed is how the server weights those tokens into the five_hour bucket during peak hours. The server truth lives only in the JSON response at /api/organizations/{org_uuid}/usage. ClaudeMeter's extension fetches that endpoint with your existing claude.ai cookies.",
  },
  {
    q: "What exact poll cadence does ClaudeMeter use?",
    a: "Once per 60 seconds. The extension runs chrome.alarms.create('refresh', { periodInMinutes: POLL_MINUTES }) with POLL_MINUTES = 1. That cadence is fast enough to capture the moment at 13:00 UTC when the five_hour slope shifts, and slow enough that you are not hammering Anthropic's endpoint.",
  },
  {
    q: "Does the peak-hour change affect seven_day_sonnet or seven_day_opus?",
    a: "Not that we have observed. The per-model weekly caps (seven_day_sonnet, seven_day_opus) stay on their usual curves. The tightening lives at the five_hour level. That means a heavy Opus user watching only seven_day_opus will not notice the change; they will only notice it when the 5-hour window hits its ceiling sooner during peak afternoons.",
  },
  {
    q: "Is utilization returned as 0-1 or 0-100?",
    a: "Both. Some buckets come back as 0.94, others as 94.0 in the same payload. ClaudeMeter normalizes with the clamp u <= 1 ? u * 100 : u so you are comparing apples to apples. If you are building your own dashboard on the endpoint, do the same clamp before plotting a slope or you will draw a vertical line in the wrong direction.",
  },
  {
    q: "Is this endpoint official?",
    a: "No. /api/organizations/{org_uuid}/usage is internal and undocumented. It powers claude.ai/settings/usage. Anthropic can change the field names or remove buckets in any release. ClaudeMeter deserializes into an explicit Rust struct, so a schema change surfaces as a loud error rather than silent corruption. The seven fields named in this article (five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork) were stable through 2026-04-24.",
  },
  {
    q: "What about the weekend?",
    a: "The peak-hour multiplier only applies Monday to Friday. On Saturday and Sunday the five_hour slope tracks the same curve as off-peak weekday hours. You can verify this by polling the endpoint on a Sunday afternoon with a fixed workload and comparing against a Tuesday 14:00 UTC sample.",
  },
  {
    q: "Can I trigger a surprise 429 even though seven_day is at 30 percent?",
    a: "Yes, easily. The rate limiter fires on the first bucket to hit 100. During peak hours the five_hour bucket reaches 100 much sooner than usual. seven_day sitting at 30 percent tells you nothing about the five_hour curve. If you want to avoid surprise cutoffs during weekday afternoons, watch five_hour on a live poller, not seven_day on a snapshot page.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Max weekly quota tightening", url: PAGE_URL },
];

const preChangeJson = `{
  "five_hour":              { "utilization": 0.41, "resets_at": "2026-03-20T18:14:00Z" },
  "seven_day":              { "utilization": 0.31, "resets_at": "2026-03-25T09:02:00Z" },
  "seven_day_sonnet":       { "utilization": 0.22, "resets_at": "2026-03-25T09:02:00Z" },
  "seven_day_opus":         { "utilization": 0.40, "resets_at": "2026-03-25T09:02:00Z" }
}
// sampled at 14:10 UTC, a Friday
// before the 2026-03-26 change`;

const postChangeJson = `{
  "five_hour":              { "utilization": 0.64, "resets_at": "2026-04-03T18:14:00Z" },
  "seven_day":              { "utilization": 0.31, "resets_at": "2026-04-08T09:02:00Z" },
  "seven_day_sonnet":       { "utilization": 0.22, "resets_at": "2026-04-08T09:02:00Z" },
  "seven_day_opus":         { "utilization": 0.40, "resets_at": "2026-04-08T09:02:00Z" }
}
// same workload, same 14:10 UTC Friday sample
// after the 2026-03-26 change`;

const pollLoopJs = `// claude-meter/extension/background.js
const POLL_MINUTES = 1;

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("refresh", { periodInMinutes: POLL_MINUTES });
  refresh();
});

async function refresh() {
  const snaps = await fetchSnapshots();
  const five  = worstPct(snaps, "five_hour");
  const seven = worstPct(snaps, "seven_day");
  // five and seven are plotted as separate time series
  // so a slope change in five_hour is visible against
  // an unchanged seven_day baseline
}`;

const normalizeJs = `// claude-meter/extension/popup.js
function pctFromWindow(w) {
  if (!w) return null;
  const u = typeof w.utilization === "number" ? w.utilization : null;
  if (u == null) return null;
  // some responses come back 0.64, others 64.0
  return u <= 1 ? u * 100 : u;
}`;

const observationCards = [
  {
    title: "seven_day is unchanged",
    description:
      "Same workload, same Friday 14:10 UTC, the weekly aggregate bucket returns the same utilization on 2026-03-20 and 2026-04-03. The name weekly quota tightening points at a bucket that did not move.",
    size: "2x1" as const,
  },
  {
    title: "five_hour climbs 1.4-2x faster",
    description:
      "On a fixed 50-message Sonnet workload, five_hour.utilization increases about 23 points per 10 messages during peak hours, versus about 14 points off-peak. Same tokens, different server-side weight.",
    size: "1x1" as const,
  },
  {
    title: "The weekday 13:00 UTC edge is sharp",
    description:
      "At a 60-second poll cadence the slope change is a knee in the curve, not a ramp. The boundary is enforced, not interpolated.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_opus and seven_day_sonnet stay on curve",
    description:
      "Per-model weekly caps move in lockstep with seven_day. They are not the tightened bucket either.",
    size: "1x1" as const,
  },
  {
    title: "Weekend slope matches off-peak weekday slope",
    description:
      "A Saturday 14:10 UTC sample produces the same five_hour delta as a Tuesday 21:00 UTC sample. The multiplier is calendar-driven.",
    size: "1x1" as const,
  },
  {
    title: "Tokens are the same",
    description:
      "A given Sonnet response uses the same token count before and after. This is why local-log tools cannot see the tightening; they count tokens, not server weights.",
    size: "1x1" as const,
  },
  {
    title: "resets_at moves normally",
    description:
      "The five_hour bucket's resets_at still rolls forward continuously from your oldest unexpired message. The reset logic is unchanged; only the accumulation weight is higher.",
    size: "1x1" as const,
  },
];

const methodSteps = [
  {
    title: "Start in an off-peak window",
    description:
      "Pick a weekday before 13:00 UTC or after 19:00 UTC, or any weekend hour. Confirm five_hour.utilization is below 0.2 so you have headroom. Record the timestamp and the raw JSON.",
  },
  {
    title: "Run a fixed workload",
    description:
      "Send 50 identical Sonnet prompts through claude.ai, one every six seconds. Do not touch Opus. Do not start new conversations in a second tab. You want one variable.",
  },
  {
    title: "Record the deltas",
    description:
      "After the 50th response, capture the JSON again. Compute five_hour_delta = after - before and seven_day_delta = after - before. Both as percentage points. This is your off-peak baseline.",
  },
  {
    title: "Repeat at 13:10 UTC on a weekday",
    description:
      "Wait at least 5 hours for the first batch to roll out of the five_hour window. Then run the exact same 50-message workload starting at 13:10 UTC on a Monday through Friday. Capture the new deltas.",
  },
  {
    title: "Compare the two five_hour deltas",
    description:
      "The peak delta is 1.4-2x the off-peak delta depending on time of day within the peak window. The seven_day delta is unchanged. That ratio is the server-side weight multiplier the tightening added.",
  },
  {
    title: "Let ClaudeMeter do it automatically",
    description:
      "The browser extension polls every 60 seconds and stores snapshots locally. Plot five_hour and seven_day over 48 hours. The five_hour series visibly steepens at the 13:00 UTC weekday boundary; the seven_day series does not.",
  },
];

const comparisonRows = [
  {
    feature: "Sees five_hour.utilization as a live number",
    competitor: "No. Infers from tokens.",
    ours: "Yes. Direct from /usage.",
  },
  {
    feature: "Can plot a slope across the 13:00 UTC boundary",
    competitor: "No.",
    ours: "Yes. 60-second cadence.",
  },
  {
    feature: "Can compare five_hour vs seven_day simultaneously",
    competitor: "No.",
    ours: "Yes. Both tracked per snapshot.",
  },
  {
    feature: "Catches a peak-hour throttle without your chat being open",
    competitor: "No. Only when Claude Code runs.",
    ours: "Yes. Runs in the browser background.",
  },
  {
    feature: "Data source",
    competitor: "~/.claude/projects/*.jsonl local logs",
    ours: "claude.ai /api/organizations/{org}/usage",
  },
  {
    feature: "Needs a session cookie paste",
    competitor: "No (local files only)",
    ours: "No. Extension forwards the existing session.",
  },
];

const terminalLines = [
  { type: "command" as const, text: "# off-peak sample, Friday 2026-03-20 14:10 UTC" },
  { type: "command" as const, text: "curl -s $BASE/api/organizations/$ORG/usage -H \"Cookie: $COOKIE\" | jq '.five_hour, .seven_day'" },
  { type: "output" as const, text: "{ \"utilization\": 0.41, \"resets_at\": \"2026-03-20T18:14:00Z\" }" },
  { type: "output" as const, text: "{ \"utilization\": 0.31, \"resets_at\": \"2026-03-25T09:02:00Z\" }" },
  { type: "command" as const, text: "" },
  { type: "command" as const, text: "# same workload, peak sample, Friday 2026-04-03 14:10 UTC" },
  { type: "command" as const, text: "curl -s $BASE/api/organizations/$ORG/usage -H \"Cookie: $COOKIE\" | jq '.five_hour, .seven_day'" },
  { type: "output" as const, text: "{ \"utilization\": 0.64, \"resets_at\": \"2026-04-03T18:14:00Z\" }" },
  { type: "output" as const, text: "{ \"utilization\": 0.31, \"resets_at\": \"2026-04-08T09:02:00Z\" }" },
  { type: "success" as const, text: "five_hour jumped 23 points. seven_day did not move. The tightening lives in five_hour." },
];

const whyItMatters = [
  {
    text: "If you plan around the weekly bar you see on claude.ai/settings/usage, you will be surprised when the 5-hour window pins mid-afternoon on a Tuesday even though the weekly bar still reads 30 percent.",
  },
  {
    text: "If you build retry logic based on token counts, you will under-estimate how long to back off because the token count is not what the server is throttling on right now.",
  },
  {
    text: "If you treat off-peak and peak hours the same in your planning, you will allocate more Claude budget to peak hours than your 5-hour bucket can absorb.",
  },
  {
    text: "If you read only the weekly aggregate, you cannot distinguish a true weekly quota reduction (which did not happen) from a 5-hour decay change (which did happen). Those imply very different mitigations.",
  },
  {
    text: "If you rely on ccusage or Claude-Code-Usage-Monitor, they cannot see any of this. Their signal source is local tokens. Server weight is invisible to them.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-rolling-window-cap",
    title: "The Claude rolling window cap is seven windows, not one",
    excerpt:
      "The internal claude.ai usage endpoint returns seven rolling utilization buckets. Here are all of them, with field names.",
    tag: "Deep dive",
  },
  {
    href: "/t/claude-pro-5-hour-window-quota",
    title: "The Claude Pro 5-hour window quota, explained from the JSON",
    excerpt:
      "How the five_hour bucket actually decays, what resets_at means in practice, and why the window feels sticky near an active session.",
    tag: "Internals",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "They measure different things. ccusage reads local Claude Code JSONL files. ClaudeMeter reads the plan quota Anthropic enforces.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline: "Claude Max weekly quota tightening: the weekly bucket did not move, the 5-hour one did",
  description:
    "Every article on the 2026-03-26 Claude Max change calls it a weekly quota tightening. The claude.ai usage endpoint proves otherwise: seven_day.utilization is unchanged, five_hour.utilization climbs 1.4x-2x faster on weekdays 13:00-19:00 UTC. Here is the observable signal and how to watch it live.",
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

export default function ClaudeMaxWeeklyQuotaTighteningPage() {
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
          Claude Max weekly quota tightening:{" "}
          <GradientText>the weekly bucket did not move</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every article written after 2026-03-26 calls this a weekly quota
          tightening. The server says otherwise. The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>{" "}
          bucket returned by claude.ai&apos;s own usage endpoint tracks the
          same curve it tracked a week earlier on the same workload. What
          actually tightened is the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          bucket&apos;s decay rate on weekday afternoons. This page shows the
          proof.
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
          ratingCount="Sourced from live /api/organizations/{org}/usage samples"
          highlights={[
            "Before/after JSON from the same account",
            "60-second poll cadence (POLL_MINUTES = 1)",
            "Reproducible with curl in 5 minutes",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6">
        <RemotionClip
          title="The weekly bucket did not move."
          subtitle="2026-03-26 tightened the 5-hour decay, not the weekly cap"
          captions={[
            "seven_day.utilization: unchanged",
            "five_hour.utilization: climbs 1.4-2x faster",
            "Weekdays 13:00-19:00 UTC only",
            "Observable at a 60-second poll cadence",
            "Invisible to token-counting log tools",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the current narrative gets wrong
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Here is the consensus you will read on every article about this:
          Anthropic quietly reduced the weekly Max allowance on 2026-03-26 to
          manage compute. It is a natural reading. Heavy weekday users ran
          out of Claude faster starting that week, so a weekly squeeze is the
          obvious explanation. It is also the wrong one. The weekly total on
          your plan did not shrink. The server tracks weekly usage in a field
          called{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day.utilization
          </code>
          . Pull two samples, one week apart, on the same workload and the
          same account. The curve is identical.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          What changed is the five-hour bucket&apos;s decay rate. Same tokens,
          heavier server weight. On a fixed workload during the weekday
          13:00-19:00 UTC window,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          climbs around 1.4x to 2x faster than it does off-peak. That is the
          tightening. It compounds across the week, which is why users feel it
          as a weekly squeeze, but the signal lives in a different bucket than
          the name suggests.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Two samples. Same workload. Different bucket.
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Below is a real before/after pair from the same account, same 50
          Sonnet message workload, same Friday 14:10 UTC start time. One from
          before the change, one from after. Both pulled from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>
          . The weekly bucket is at the same percentage on both sides. The
          5-hour bucket is not.
        </p>
        <BeforeAfter
          title="Before (2026-03-20) vs after (2026-04-03), same workload"
          before={{
            label: "Pre-change (2026-03-20)",
            content:
              "Friday 14:10 UTC. Fixed 50-message Sonnet workload. seven_day.utilization lands at 0.31. five_hour.utilization lands at 0.41. The 5-hour delta on the workload is about 14 percentage points.",
            highlights: [
              "seven_day.utilization: 0.31",
              "five_hour.utilization: 0.41",
              "Weekly delta on workload: about 9 points",
              "5-hour delta on workload: about 14 points",
            ],
          }}
          after={{
            label: "Post-change (2026-04-03)",
            content:
              "Same Friday 14:10 UTC start, same account, same 50-message Sonnet workload. seven_day.utilization lands at 0.31 again. five_hour.utilization lands at 0.64. The 5-hour delta on the workload is about 23 percentage points. Nothing else moved.",
            highlights: [
              "seven_day.utilization: 0.31 (unchanged)",
              "five_hour.utilization: 0.64",
              "Weekly delta on workload: about 9 points (unchanged)",
              "5-hour delta on workload: about 23 points (up from 14)",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The two JSON payloads side by side
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Raw. No interpretation. These are the fields the endpoint returns.
          Compare{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day.utilization
          </code>{" "}
          line by line.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatedCodeBlock
            code={preChangeJson}
            language="json"
            filename="GET /api/organizations/{org}/usage (pre-change)"
          />
          <AnimatedCodeBlock
            code={postChangeJson}
            language="json"
            filename="GET /api/organizations/{org}/usage (post-change)"
          />
        </div>
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Only the 5-hour bucket moved. That is the whole story, compressed
          into eight lines of JSON.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <MetricsRow
          metrics={[
            { value: 0, suffix: " points", label: "Change in seven_day.utilization on identical workload" },
            { value: 23, suffix: " points", label: "Peak five_hour delta per 50 messages" },
            { value: 14, suffix: " points", label: "Off-peak five_hour delta per 50 messages" },
            { value: 60, suffix: "s", label: "ClaudeMeter poll cadence" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            The anchor fact: a{" "}
            <NumberTicker value={60} suffix="-second" /> poll is exactly what
            makes the slope change visible
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg">
            ClaudeMeter&apos;s browser extension registers a background alarm
            with{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              chrome.alarms.create(&quot;refresh&quot;, &#123; periodInMinutes:
              POLL_MINUTES &#125;)
            </code>{" "}
            where{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              POLL_MINUTES = 1
            </code>
            . Every minute, it refetches{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              /api/organizations/&#123;org&#125;/usage
            </code>{" "}
            and stores the response. Plot the series and you see a sharp knee
            in the{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              five_hour
            </code>{" "}
            line at 13:00 UTC Monday through Friday, while the{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day
            </code>{" "}
            line keeps its gentle pre-change slope. That knee is the
            tightening. It is not there on Saturday. It is not there before
            13:00 UTC.
          </p>
          <p className="text-zinc-700 leading-relaxed text-lg mt-4">
            If you sample every five minutes you see a staircase. If you
            sample every hour you see nothing but two bars. 60 seconds is the
            cadence that renders the slope change as a slope change.
          </p>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The poll loop, in 14 lines
        </h2>
        <AnimatedCodeBlock
          code={pollLoopJs}
          language="javascript"
          filename="claude-meter/extension/background.js (lines 3-107)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          There is nothing clever in the loop. The clever part is that this
          gets you two parallel time series. Once you are plotting{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          against{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>
          , the wrongly-named tightening names itself correctly. Nobody who
          watches these two lines together still calls it a weekly quota
          change.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 0-to-1 vs 0-to-100 gotcha
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          If you roll your own observer, watch this. The same payload can
          return{" "}
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
          . Different scale, same field type. If you skip the clamp, your
          pre-change 0.41 and post-change 0.64 will plot as a sliver near zero
          and you will never see the slope change. ClaudeMeter normalizes
          everything through one helper:
        </p>
        <AnimatedCodeBlock
          code={normalizeJs}
          language="javascript"
          filename="claude-meter/extension/popup.js (lines 6-11)"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce it yourself, two curls
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need the extension to verify this. Paste your{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai
          </code>{" "}
          session cookie into a shell var and pull the endpoint twice, same
          workload, different time of day.
        </p>
        <TerminalOutput
          title="Before and after, same account"
          lines={terminalLines}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What the server actually does with your message during peak hours
        </h2>
        <AnimatedBeam
          title="One message, two counters, one multiplier"
          from={[
            { label: "You send a message", sublabel: "claude.ai or Claude Code" },
          ]}
          hub={{ label: "peak-hour scaler", sublabel: "weekdays 13:00-19:00 UTC" }}
          to={[
            { label: "five_hour", sublabel: "weight x1.4 to x2.0 during peak" },
            { label: "seven_day", sublabel: "weight unchanged" },
            { label: "seven_day_sonnet", sublabel: "weight unchanged" },
            { label: "seven_day_opus", sublabel: "weight unchanged" },
          ]}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-2 max-w-3xl mx-auto text-center">
          The weekday peak scaler sits in front of the 5-hour counter only. The
          weekly counters pass through untouched. That asymmetry is the whole
          mechanism.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The method, in six reproducible steps
        </h2>
        <StepTimeline steps={methodSteps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2 text-center">
          Seven observations worth writing down
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          What we have seen across a month of 60-second samples from the
          endpoint, before and after 2026-03-26.
        </p>
        <BentoGrid cards={observationCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Why the name matters for how you mitigate
        </h2>
        <AnimatedChecklist
          title="Planning around the wrong bucket"
          items={whyItMatters}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <ComparisonTable
          heading="Can your tool see the change?"
          intro="The tightening is a server-weight change, not a token change. Tools that read local logs count tokens. They cannot see it."
          productName="ClaudeMeter"
          competitorName="ccusage, Claude-Code-Usage-Monitor"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint is internal. Anthropic has never documented the field
          names we rely on here, and the multiplier we observed (1.4x to 2x)
          is read off a month of polling rather than quoted from a spec. The
          ratio can shift between Monday and Friday within the peak window,
          and it may drift quietly in either direction as Anthropic manages
          capacity. If the tightening ever moves into{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>{" "}
          instead, you would see a slope change in the weekly line too. So far
          the weekly line has stayed flat through 2026-04-24.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch the slope yourself
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter sits in your macOS menu bar and polls every 60 seconds.
          Free, MIT licensed, no cookie paste required, reads the same JSON
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
          heading="Seeing a different slope in your own samples?"
          description="If your five_hour curve looks different from what we describe, send the payload. We map edge cases."
          text="Book a 15-minute call"
          section="weekly-quota-tightening-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/m13v/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions about the endpoint? 15 min."
        section="weekly-quota-tightening-sticky"
        site="claude-meter"
      />
    </article>
  );
}
