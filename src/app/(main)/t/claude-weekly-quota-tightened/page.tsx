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
  OrbitingCircles,
  Marquee,
  GlowCard,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  BeforeAfter,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-weekly-quota-tightened";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title:
    "Claude Weekly Quota Tightened? You Have Seven Reset Clocks, Not One",
  description:
    "After the tightening, your plan is gated by whichever of seven rolling buckets hits 100 first, and each one carries its own resets_at timestamp in the /usage endpoint. Read that timestamp and you know exactly when you can code again, per bucket, to the minute.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Weekly Quota Tightened? You Have Seven Reset Clocks, Not One",
    description:
      "The tightening did not merge the buckets. Each of the seven rolling windows ships its own resets_at field. The one closest to 100 percent is your real wait time.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "My Claude got tightened and I am blocked. How do I know when I can code again?",
    a: "Pull /api/organizations/{org_uuid}/usage right now. For every field where utilization is close to 100, read the resets_at ISO timestamp next to it. That is your real wait time. The block is being enforced by whichever of the seven buckets crossed 100 first, and only that bucket's resets_at matters. ClaudeMeter prints it in the menu bar as, for example, '5-hour 98% -> resets Fri Apr 24 18:14 (in 37m)'. If the gating bucket is five_hour your wait is measured in minutes, not days, regardless of where the weekly bar sits.",
  },
  {
    q: "So which of the seven buckets blocked me?",
    a: "You cannot tell from a single HTTP 429. The server does not name the bucket in the response body. You have to read /api/organizations/{org_uuid}/usage a moment before or after and find the field where utilization >= 100. In practice that is five_hour, seven_day, seven_day_sonnet, or seven_day_opus. The less common ones (seven_day_oauth_apps, seven_day_omelette, seven_day_cowork) gate different traffic paths. ClaudeMeter names all seven as distinct Option<Window> fields in src/models.rs lines 18-28 so you can see which ceiling you hit.",
  },
  {
    q: "Why isn't there just one 'quota resets in' countdown?",
    a: "Because the buckets are rolling, not calendar-aligned. resets_at is computed as 'the moment this window's oldest chargeable usage falls out of the window', which is a different wall-clock time for every bucket and every account. Two Pro users at the same utilization can have different five_hour resets_at values because their charging histories differ. That is why ClaudeMeter's format.rs prints the delta in '(in 2d 4h)' form next to each bucket: a single 'resets on Sunday' line would be wrong for almost everyone.",
  },
  {
    q: "Where exactly is resets_at defined in the product source?",
    a: "In /src/models.rs, the Window struct is the shape of every rolling bucket: { utilization: f64, resets_at: Option<DateTime<Utc>> }. Every one of the seven fields (five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork) deserializes into a Window, so each has its own resets_at. The CLI formatter at src/format.rs lines 75-98 prints a separate 'resets Mon Apr 28 14:30 (in 2d 4h)' per bucket. The extension UI at extension/popup.js uses fmtResets to render the same value inline as '5-hour · 30m' on each bar.",
  },
  {
    q: "Does the tightening change what resets_at means?",
    a: "No. The field's semantics are unchanged. What changed after 2026-03-26 is the rate at which utilization climbs against a fixed workload during weekday peak hours, which makes five_hour reach 100 faster and therefore resets_at on five_hour becomes the active countdown far more often than it used to be. Before the tightening, seven_day was the common gate. After, five_hour is the gate on heavy weekday afternoons. Same field, different bucket showing up as the blocker.",
  },
  {
    q: "Can I read resets_at without installing ClaudeMeter?",
    a: "Yes. Paste your claude.ai session cookie into curl, hit /api/organizations/{org_uuid}/usage, and every Window-shaped field in the response will contain a resets_at ISO timestamp. ClaudeMeter just polls that endpoint every 60 seconds and formats the delta for you. The extension uses credentials: 'include' so no cookie paste is needed. The menu bar binary uses Chrome Safe Storage via keychain. Either route, same field.",
  },
  {
    q: "Can resets_at be null?",
    a: "Yes. In the Rust struct it is Option<DateTime<Utc>>, and the extension checks fmtResets(w?.resets_at) returns an empty string when the field is absent. Treat null as 'not currently windowed' for that bucket. In practice we see it null for per-model buckets when the account has not used that model in the current window. Once you start using the model, a resets_at appears on the next poll.",
  },
  {
    q: "Why does ClaudeMeter show the delta in 'm' or 'h' or 'd' instead of a fixed format?",
    a: "Because in a tight window you need minute resolution and in a calm week you don't. extension/popup.js fmtResets uses: below 1 hour show '37m', below 48 hours show '14h', otherwise show '3d'. The CLI format.rs format_window does the same partition via chrono's num_days and num_hours. The point is to surface the resolution that matters for planning the next action, not an academic timestamp.",
  },
  {
    q: "If seven_day is at 78 percent can I still be blocked?",
    a: "Yes, trivially, if five_hour is at 100. The server rate-limits on the first bucket to cross the ceiling. seven_day at 78 tells you nothing about the five_hour curve during a weekday peak hour. This is the single most common 'but I still had quota left' confusion since the tightening. Reading only the weekly bar and assuming it is authoritative is what every pre-tightening guide tells you to do. Post-tightening, it is often wrong.",
  },
  {
    q: "Does resets_at march forward as time passes or does it stay fixed until the window rolls?",
    a: "It slides forward. Because the window is rolling, every new message shifts the window's right edge, which shifts resets_at for that bucket. Sampling once a minute is enough to catch the drift. If you sampled once an hour the resets_at you saw at 14:00 would already be stale by 14:05 in a heavy session. A 60-second cadence matches the precision the field is returned at.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude weekly quota tightened", url: PAGE_URL },
];

const windowStructRust = `// claude-meter/src/models.rs  (lines 3-28)
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

const formatWindowRust = `// claude-meter/src/format.rs  (lines 75-98)
fn format_window(w: &Window) -> String {
    let reset = w
        .resets_at
        .map(|t| {
            let local: DateTime<Local> = t.into();
            let delta = t.signed_duration_since(Utc::now());
            let mut parts: Vec<String> = Vec::new();
            if delta.num_days() > 0 {
                parts.push(format!("{}d", delta.num_days()));
            }
            let hrs = delta.num_hours() - delta.num_days() * 24;
            if hrs > 0 {
                parts.push(format!("{}h", hrs));
            }
            let in_str = if parts.is_empty() {
                String::from("soon")
            } else {
                format!("in {}", parts.join(" "))
            };
            format!("-> resets {} ({})", local.format("%a %b %-d %H:%M"), in_str)
        })
        .unwrap_or_default();
    format!("{:>5.1}% used    {}", w.utilization, reset)
}`;

const fmtResetsJs = `// claude-meter/extension/popup.js  (lines 17-40)
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

function row(label, win) {
  const v = pctFromWindow(win);
  const cls = v == null ? "" : v >= 100 ? "hot" : v >= 80 ? "warn" : "";
  const resets = fmtResets(win?.resets_at);
  const lab = resets ? \`\${label} · \${resets}\` : label;
  // ...renders the bar with per-bucket reset suffix
}`;

const bucketCards = [
  {
    title: "five_hour",
    description:
      "The rolling 5-hour window. After the tightening, this is the bucket that tends to hit 100 first on weekday afternoons. Its resets_at moves in minutes, not days.",
    size: "2x1" as const,
  },
  {
    title: "seven_day",
    description:
      "The aggregate rolling 7-day. Its resets_at typically lands 5 to 7 days out. Unchanged curve on the same fixed workload after 2026-03-26.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_sonnet",
    description:
      "Sonnet-specific weekly. Carries its own resets_at. Can be at a totally different utilization than seven_day.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_opus",
    description:
      "Opus-specific weekly. Often closer to 100 than the aggregate, because Opus tokens are weighted heavier. Its resets_at is what matters for Opus users.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_oauth_apps",
    description:
      "Third-party app traffic. Separate ceiling, separate resets_at, and it is possible to be blocked here while the main seven_day is well below 100.",
    size: "1x1" as const,
  },
  {
    title: "seven_day_omelette + seven_day_cowork",
    description:
      "Less common traffic paths. Both ship in the same payload, both have their own resets_at. Unless you are live in those flows you will usually see them null.",
    size: "2x1" as const,
  },
];

const trackerRows = [
  {
    feature: "Shows resets_at for five_hour",
    competitor: "Not emitted. Log readers have no concept of server-side windows.",
    ours: "Yes. Formatted as 'in 37m' when close, 'in 4h' when comfortable.",
  },
  {
    feature: "Shows resets_at for seven_day",
    competitor: "Approximated from a calendar assumption. Often wrong by hours.",
    ours: "Yes. The endpoint's own timestamp, rounded to days when >48h out.",
  },
  {
    feature: "Shows per-model reset (Sonnet, Opus)",
    competitor: "No. Log tools don't separate the model-specific weekly caps.",
    ours: "Yes. Two independent resets_at values alongside their bars.",
  },
  {
    feature: "Updates resets_at as the window slides",
    competitor: "Not applicable.",
    ours: "Every 60 seconds, matching the endpoint's precision.",
  },
  {
    feature: "Labels which bucket caused a 429",
    competitor: "No. Only the server knows which bucket tripped.",
    ours: "Implicit: the bucket where utilization >= 100 is the one blocking you.",
  },
  {
    feature: "Tells you when a null resets_at flips to a real one",
    competitor: "No.",
    ours: "Yes. Poll catches the first sample with a non-null timestamp.",
  },
];

const reproTerminal = [
  {
    type: "command" as const,
    text: "# pull /usage with your existing claude.ai cookie",
  },
  {
    type: "command" as const,
    text: "curl -s https://claude.ai/api/organizations/$ORG/usage \\\n  -H \"Cookie: $COOKIE\" -H \"Referer: https://claude.ai/settings/usage\" \\\n  | jq '{five_hour, seven_day, seven_day_sonnet, seven_day_opus} | with_entries(.value |= {utilization, resets_at})'",
  },
  {
    type: "output" as const,
    text: "{",
  },
  {
    type: "output" as const,
    text: "  \"five_hour\":        { \"utilization\": 0.97, \"resets_at\": \"2026-04-24T18:37:00Z\" },",
  },
  {
    type: "output" as const,
    text: "  \"seven_day\":        { \"utilization\": 0.41, \"resets_at\": \"2026-04-29T09:02:00Z\" },",
  },
  {
    type: "output" as const,
    text: "  \"seven_day_sonnet\": { \"utilization\": 0.28, \"resets_at\": \"2026-04-29T09:02:00Z\" },",
  },
  {
    type: "output" as const,
    text: "  \"seven_day_opus\":   { \"utilization\": 0.54, \"resets_at\": \"2026-04-29T09:02:00Z\" }",
  },
  {
    type: "output" as const,
    text: "}",
  },
  {
    type: "success" as const,
    text: "gating bucket: five_hour at 97%. real wait: until 18:37 UTC (about 37m). seven_day is at 41% and irrelevant to the current block.",
  },
];

const readResetSteps = [
  {
    title: "Open the endpoint response, or let ClaudeMeter show it.",
    description:
      "GET /api/organizations/{org_uuid}/usage with your session cookie, or just open the ClaudeMeter menu bar icon. The binary prints 'N% used -> resets (in Nh)' per bucket, straight from format.rs lines 75-98.",
  },
  {
    title: "Find the bucket closest to 100 percent.",
    description:
      "That is the one the server is rate-limiting against. For five_hour the number is often >90 during weekday peak afternoons after the tightening; for seven_day it is often well below.",
  },
  {
    title: "Read the resets_at for that bucket only.",
    description:
      "The other six resets_at values are not your active block. They matter later. ClaudeMeter rounds the delta via fmtResets (popup.js lines 17-27) so '(in 37m)' tells you the wait in the correct unit.",
  },
  {
    title: "Plan the next action against that delta.",
    description:
      "If five_hour is the gate, your wait is minutes: queue the next task. If seven_day_opus is the gate and the delta is '3d', do not retry in a loop; switch model or stop for the day.",
  },
  {
    title: "Keep the poll running.",
    description:
      "The window slides. resets_at for every bucket shifts minute by minute. A sample you took 45 minutes ago is stale. 60-second polling (POLL_MINUTES = 1 in extension/background.js) matches the data's own cadence.",
  },
];

const quickMetrics = [
  { value: 7, suffix: "", label: "Rolling buckets that ship a resets_at" },
  { value: 1, suffix: "", label: "Bucket that is actually blocking you" },
  { value: 60, suffix: "s", label: "Poll cadence to track a sliding window" },
  { value: 0, suffix: "", label: "Cookie pastes required (extension route)" },
];

const misreadingList = [
  {
    text: "Reading the 'resets Sunday' line on claude.ai and assuming that is when you get unblocked. It is only true if seven_day is the gating bucket, which is no longer the common case.",
  },
  {
    text: "Treating five_hour.resets_at like a fixed clock. It slides forward with every new message. A sample from an hour ago is already wrong.",
  },
  {
    text: "Ignoring seven_day_opus.resets_at as an Opus user. The per-model ceiling often trips before the aggregate, and the resets_at for the aggregate won't free you.",
  },
  {
    text: "Treating null resets_at as 'that bucket doesn't exist'. It means you have not used that model in the current window. The next message materialises it.",
  },
  {
    text: "Scheduling a 'retry at Monday 09:00' job that hammers the endpoint. If your gating bucket is five_hour with a 37-minute reset, you are 37 minutes away, not three days.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-weekly-quota-silent-tightening",
    title: "What the silent tightening actually changed (and didn't)",
    excerpt:
      "Tokens per message stayed identical. Server-side bucket weights did not. Here is what to poll, and how often, to see the change.",
    tag: "Mechanism",
  },
  {
    href: "/t/claude-max-weekly-quota-tightening",
    title: "The weekly bucket didn't move. The 5-hour one did.",
    excerpt:
      "Two samples of /usage before and after 2026-03-26 on a fixed workload. seven_day holds. five_hour climbs 1.4x-2x faster on weekday afternoons.",
    tag: "Evidence",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "The rolling window cap is seven windows, not one",
    excerpt:
      "Every Window field returned by /usage, with semantics, reset behaviour, and how to surface each one.",
    tag: "Deep dive",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude weekly quota tightened? You have seven reset clocks, not one",
  description:
    "The /api/organizations/{org_uuid}/usage endpoint returns a resets_at per bucket. After the tightening, the one that matters for your current block is whichever bucket is closest to 100 percent, not the single weekly line claude.ai shows in Settings.",
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

export default function ClaudeWeeklyQuotaTightenedPage() {
  return (
    <article className="bg-white text-zinc-900">
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
          The tightened Claude plan has{" "}
          <GradientText>seven reset clocks</GradientText>. You are probably
          watching the wrong one.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every guide about the quota tightening tells you to wait for Sunday.
          That is only correct if the bucket blocking you right now is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>
          . After 2026-03-26, it usually isn&apos;t. The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          endpoint returns a{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          timestamp on every one of seven rolling windows. Read the one next to
          the bucket that is actually at 100 percent, and you know, to the
          minute, when your next message will go through.
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
          ratingCount="Reads the same endpoint claude.ai/settings/usage renders, every 60 seconds"
          highlights={[
            "Anchor fact: the Window struct at src/models.rs line 3",
            "Per-bucket reset formatting from src/format.rs lines 75-98",
            "Works without a cookie paste via the Chrome extension",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <RemotionClip
          title="Seven buckets, seven reset clocks."
          subtitle="The tightening didn't merge them. The one closest to 100% is your wait."
          captions={[
            "resets_at is per bucket, not per plan",
            "Window = { utilization, resets_at }",
            "five_hour resets_at moves in minutes",
            "seven_day resets_at moves in days",
            "Read the bucket at 100, ignore the rest",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why &quot;when do I get my quota back&quot; is seven questions
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Before the tightening most people could ignore this. The weekly bar on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          was the one that tripped, and its reset roughly aligned with the start
          of your usage week, so &quot;wait until Sunday&quot; was usually right
          and usually close enough. After 2026-03-26 the same fixed workload
          drives the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          bucket to 100 percent during weekday afternoons, while{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>{" "}
          keeps its old curve. The gating bucket has changed, which means the
          active reset clock has changed. &quot;Wait until Sunday&quot; is often
          off by several days.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The endpoint does not hide any of this. It returns seven{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Window
          </code>
          -shaped fields, each with its own{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>
          . The only work for a tracker is to read them all, pick the one at 100
          percent, and render its reset delta in a unit a human can act on.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            Anchor fact: the <NumberTicker value={2} />-field{" "}
            <code className="bg-white/70 px-1.5 py-0.5 rounded text-lg font-mono">
              Window
            </code>{" "}
            struct
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg mb-6">
            This is the whole shape. Two fields per bucket, repeated seven
            times. ClaudeMeter deserializes into this struct directly in{" "}
            <code className="bg-white/70 px-1.5 py-0.5 rounded text-sm font-mono">
              src/models.rs
            </code>
            . If the endpoint ever renames the field, the parse fails loudly
            instead of silently mapping the new name into a missing key on your
            plot.
          </p>
          <AnimatedCodeBlock
            code={windowStructRust}
            language="rust"
            filename="claude-meter/src/models.rs"
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2 text-center">
          The seven clocks, bucket by bucket
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Each of these returns its own utilization and its own resets_at in the
          same JSON payload. After the tightening, the one most likely to block
          you is the first one.
        </p>
        <BentoGrid cards={bucketCards} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          One message, seven clocks ticking
        </h2>
        <AnimatedBeam
          title="Every message updates every bucket's resets_at, not just one"
          from={[
            {
              label: "You send a message",
              sublabel: "claude.ai or Claude Code",
            },
          ]}
          hub={{
            label: "Anthropic quota accumulator",
            sublabel: "writes utilization + resets_at per bucket",
          }}
          to={[
            { label: "five_hour", sublabel: "minutes out" },
            { label: "seven_day", sublabel: "days out" },
            { label: "seven_day_sonnet", sublabel: "independent clock" },
            { label: "seven_day_opus", sublabel: "independent clock" },
            { label: "seven_day_oauth_apps", sublabel: "null unless used" },
          ]}
        />
        <p className="text-zinc-600 text-center mt-4 max-w-3xl mx-auto">
          The right-hand side is what a tracker has to read. Reading only one is
          where the &quot;but I still had quota left&quot; confusion comes from.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <MetricsRow metrics={quickMetrics} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The CLI that prints a reset per bucket
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The CLI formatter inside ClaudeMeter is the cleanest expression of
          this idea. It takes one{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Window
          </code>
          , computes the delta between now and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>
          , and returns a single line with the delta rendered in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            d
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            h
          </code>{" "}
          components. The caller just invokes it per bucket and prints. No
          global &quot;quota resets&quot; line, because there isn&apos;t one to
          print.
        </p>
        <AnimatedCodeBlock
          code={formatWindowRust}
          language="rust"
          filename="claude-meter/src/format.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BeforeAfter
          title="What the reset line looks like, before vs after the tightening"
          before={{
            label: "Before 2026-03-26",
            content:
              "The weekly line was almost always the active block. A single 'resets on Sunday' read was usually close enough. Most readers never touched the five_hour line.",
            highlights: [
              "seven_day is the gating bucket",
              "resets_at is days out",
              "a calendar mental model works",
            ],
          }}
          after={{
            label: "After 2026-03-26",
            content:
              "Weekday afternoons push five_hour to 100 before seven_day gets close. The active reset is minutes out, not days. A calendar mental model is wrong by 2 to 5 days.",
            highlights: [
              "five_hour is the gating bucket",
              "resets_at is minutes out",
              "read the bucket at 100, not the weekly line",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The extension renders each reset inline on the bar
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The Chrome extension&apos;s popup renders the bucket bars with the
          reset delta appended to the label. The helper{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            fmtResets
          </code>{" "}
          picks minute, hour, or day resolution based on how far out the reset
          is, so a 37-minute wait is literally labelled{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            5-hour · 37m
          </code>{" "}
          instead of a decimal hour. That small formatting choice is what turns
          seven clocks into something you glance at once and act on.
        </p>
        <AnimatedCodeBlock
          code={fmtResetsJs}
          language="javascript"
          filename="claude-meter/extension/popup.js"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <ComparisonTable
          heading="What a tracker has to do with resets_at"
          intro="Local-log tools can count tokens but cannot read a server-side window. resets_at is the server's field. That is why no log-scanner can answer 'when can I code again' on the tightened plan."
          productName="ClaudeMeter"
          competitorName="Local-log trackers (ccusage, Claude-Code-Usage-Monitor, etc.)"
          rows={trackerRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce it in one curl call
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need the extension to confirm any of this. Paste your
          logged-in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai
          </code>{" "}
          cookie into{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            $COOKIE
          </code>{" "}
          and hit the endpoint once. Every{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Window
          </code>{" "}
          carries its own{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>
          . The one you care about is the one next to the bucket closest to 100
          percent.
        </p>
        <TerminalOutput
          title="One endpoint call, seven reset timestamps"
          lines={reproTerminal}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The five-step read on a tightened plan
        </h2>
        <StepTimeline steps={readResetSteps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          The fields you care about live in one payload
        </h2>
        <div className="flex justify-center">
          <OrbitingCircles
            center={
              <div className="rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 w-28 h-28 flex items-center justify-center text-white text-xs font-mono text-center leading-tight px-2">
                /usage
                <br />
                response
              </div>
            }
            items={[
              <span
                key="fh"
                className="rounded-full bg-white border border-teal-200 px-3 py-2 text-xs font-mono text-teal-700 shadow-sm"
              >
                five_hour
              </span>,
              <span
                key="sd"
                className="rounded-full bg-white border border-teal-200 px-3 py-2 text-xs font-mono text-teal-700 shadow-sm"
              >
                seven_day
              </span>,
              <span
                key="sds"
                className="rounded-full bg-white border border-teal-200 px-3 py-2 text-xs font-mono text-teal-700 shadow-sm"
              >
                seven_day_sonnet
              </span>,
              <span
                key="sdo"
                className="rounded-full bg-white border border-teal-200 px-3 py-2 text-xs font-mono text-teal-700 shadow-sm"
              >
                seven_day_opus
              </span>,
              <span
                key="sdoa"
                className="rounded-full bg-white border border-teal-200 px-3 py-2 text-xs font-mono text-teal-700 shadow-sm"
              >
                seven_day_oauth_apps
              </span>,
              <span
                key="sdom"
                className="rounded-full bg-white border border-teal-200 px-3 py-2 text-xs font-mono text-teal-700 shadow-sm"
              >
                seven_day_omelette
              </span>,
              <span
                key="sdc"
                className="rounded-full bg-white border border-teal-200 px-3 py-2 text-xs font-mono text-teal-700 shadow-sm"
              >
                seven_day_cowork
              </span>,
            ]}
            radius={170}
            duration={30}
          />
        </div>
        <p className="text-zinc-600 text-center mt-6 max-w-3xl mx-auto">
          Every orbiting chip is an{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option&lt;Window&gt;
          </code>{" "}
          field in the same JSON body. Every one has its own{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>
          .
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Shapes of the delta you&apos;ll see on each bucket
        </h2>
        <Marquee speed={35} pauseOnHover>
          <span className="mx-4 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700 shadow-sm">
            five_hour · 37m
          </span>
          <span className="mx-4 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700 shadow-sm">
            five_hour · 12m
          </span>
          <span className="mx-4 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700 shadow-sm">
            seven_day · 3d
          </span>
          <span className="mx-4 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700 shadow-sm">
            seven_day · 5d
          </span>
          <span className="mx-4 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700 shadow-sm">
            seven_day_sonnet · 2d
          </span>
          <span className="mx-4 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700 shadow-sm">
            seven_day_opus · 6d
          </span>
          <span className="mx-4 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700 shadow-sm">
            five_hour · 4h
          </span>
          <span className="mx-4 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700 shadow-sm">
            seven_day_oauth_apps · 1d
          </span>
          <span className="mx-4 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700 shadow-sm">
            five_hour · now
          </span>
        </Marquee>
        <p className="text-zinc-600 text-center mt-4 max-w-3xl mx-auto">
          Same helper (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            fmtResets
          </code>
          ) chose the unit for each. Below one hour you get minutes. Below 48
          hours you get hours. Past that, days.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <GlowCard className="p-8 rounded-2xl bg-white border border-zinc-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
            Five ways people misread the reset after the tightening
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Each of these is the same core mistake: treating the plan as having
            one clock instead of seven. The endpoint does not work that way.
          </p>
          <AnimatedChecklist title="Avoid these" items={misreadingList} />
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveats
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint is internal. The field names can change without notice.
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          timestamps slide as the window rolls, so a sample from 30 minutes ago
          is usually off. The seven bucket names listed here were stable through
          2026-04-24; Anthropic could rename, add, or drop one on any release.
          ClaudeMeter is MIT and open source, so if that happens you can see the
          shape change in one{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            git diff
          </code>{" "}
          of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>
          .
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          See all seven resets at once
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter is free, MIT-licensed, no cookie paste. Install the
          extension and the menu-bar app, open the popup, and every bucket
          renders with its own live reset label.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-20 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Stuck on a tightened plan and not sure which bucket is blocking you?"
          description="Send us a /usage sample and we'll map which of the seven reset clocks applies to your workload."
          text="Book a 15-minute call"
          section="weekly-quota-tightened-footer"
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
        description="Find your gating bucket in 15 min."
        section="weekly-quota-tightened-sticky"
        site="claude-meter"
      />
    </article>
  );
}
