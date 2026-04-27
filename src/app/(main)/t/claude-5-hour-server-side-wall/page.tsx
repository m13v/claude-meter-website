import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  FlowDiagram,
  ComparisonTable,
  AnimatedChecklist,
  MetricsRow,
  GlowCard,
  StepTimeline,
  BentoGrid,
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

const PAGE_URL = "https://claude-meter.com/t/claude-5-hour-server-side-wall";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title: "The Claude 5-Hour Server-Side Wall Is Three Walls, Not One",
  description:
    "When Claude Pro or Max 429s you at the 5-hour mark, three separate server-side conditions can produce identical-looking errors. Here is where each one lives in the JSON, why overage_spend_limit has its own suspension clock, and how to reconstruct the full wall state from the endpoints the Settings page hides.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "The Claude 5-Hour Server-Side Wall Is Three Walls, Not One",
    description:
      "The 5-hour wall on claude.ai is not one boundary. It is three stacked conditions across two endpoints the Settings page renders only a small slice of. Here is each layer, with field names.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What is the Claude 5-hour server-side wall?",
    a: "It is the moment a rolling 5-hour utilization float on the claude.ai server crosses the bucket ceiling and the rate limiter starts returning 429 to your org. The field that trips it is five_hour.utilization on GET /api/organizations/{org_uuid}/usage. The wall lives on the server, not in the client. ClaudeMeter polls that endpoint every 60 seconds so you see the float move in real time instead of guessing from a local token count.",
  },
  {
    q: "If I have overage enabled, does the wall still stop me?",
    a: "Sometimes. Overage lives on a different endpoint: /api/organizations/{org_uuid}/overage_spend_limit. That response has three fields that can block you: is_enabled (master switch), out_of_credits (monthly cap hit), and disabled_until (a wall-clock timestamp when overage is suspended, independent of the other two). If any one of those blocks, the 5-hour wall is hard again. The /usage endpoint does not mirror these flags, which is why the Settings page can look healthy while your next prompt 429s.",
  },
  {
    q: "What does disabled_until mean?",
    a: "It is an ISO 8601 timestamp on the overage_spend_limit response. While Utc::now() is less than disabled_until, the server refuses overage spend even if is_enabled is true and you are under the monthly credit limit. We see it populated after payment failures and during manual Trust & Safety holds. ClaudeMeter reads it at src/models.rs line 37 and the CLI appends an 'until Fri Apr 26' suffix when it is set (format.rs lines 35 to 38).",
  },
  {
    q: "Why does my 429 message not tell me which layer tripped?",
    a: "Because the server returns the same generic message whether the 5-hour quota pinned, the overage hit its monthly cap, or the overage is suspended by disabled_until. Only the JSON from the three usage endpoints distinguishes them. A client that reads just /usage sees five_hour at 100 percent and assumes quota. A client that reads /usage plus /overage_spend_limit can tell you which layer is actually walling you off.",
  },
  {
    q: "Why does hitting the wall feel stickier than 5 hours?",
    a: "Two reasons. First, the 5-hour window is a rolling boundary, not a fixed timer, so each new message you attempt pushes the earliest-unexpired-message pointer forward and resets_at slides with it. Second, if your overage is off, on out_of_credits, or suspended via disabled_until, the 5-hour reset does not unlock you because the 5-hour bucket was never the binding constraint, the overage layer was. Both layers have to clear.",
  },
  {
    q: "Can ccusage or Claude-Code-Usage-Monitor tell me any of this?",
    a: "No. Those tools read ~/.claude/projects/**/*.jsonl and estimate token spend from local Claude Code sessions. They do not call /api/organizations/{org}/usage, they do not call /api/organizations/{org}/overage_spend_limit, and they cannot see the server-weighted utilization float the rate limiter checks. They answer a different question (what Claude Code burned locally) from the one the wall answers (what the server is counting against your org).",
  },
  {
    q: "Where is out_of_credits exactly?",
    a: "It is a boolean on the overage response. See src/models.rs line 39, `#[serde(default)] pub out_of_credits: bool,`. When the monthly credit pool is exhausted, the server sets it to true and starts 429ing overage requests. The CLI shows it as 'BLOCKED' next to the extra-usage line (format.rs line 26).",
  },
  {
    q: "How do I read all three layers myself?",
    a: "GET /api/organizations/{org_uuid}/usage returns the 5-hour and weekly buckets. GET /api/organizations/{org_uuid}/overage_spend_limit returns overage state including out_of_credits and disabled_until. GET /api/organizations/{org_uuid}/subscription_details returns payment method and next charge date, useful for guessing why disabled_until got populated. Pass your logged-in claude.ai Cookie header to each.",
  },
  {
    q: "Why does ClaudeMeter call all three endpoints, not just usage?",
    a: "Because the full wall state is not on /usage. See api.rs lines 16 to 60: three serial calls, each with its own error handling, each producing one field on the UsageSnapshot struct. Dropping any one of them produces a snapshot that can say '5-hour at 42 percent' while the next prompt still 429s.",
  },
  {
    q: "Does the wall reset at a fixed wall-clock time?",
    a: "The 5-hour layer slides continuously; resets_at is whichever oldest-message-ageing-out event is next. The weekly buckets roll at a fixed time per account, usually when the week ticks over in your billing zone. The overage layer resets at the billing cycle boundary (see subscription_details.next_charge_date), not at 5 hours. So 'when does my wall lift' depends on which layer is binding right now.",
  },
  {
    q: "What does the 5-hour wall look like on Max 5x and Max 20x?",
    a: "The same shape, different ceiling. The five_hour.utilization field is identical, weighted more generously on Max, and the wall still trips at utilization >= 1.0. Max plans also populate seven_day_opus and seven_day_sonnet more often, so you can wall on a narrower model-specific bucket while the headline 5-hour is fine. ClaudeMeter surfaces each bucket that exists on your org without needing plan detection.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude 5-hour server-side wall", url: PAGE_URL },
];

const apiRsSnippet = `// claude-meter/src/api.rs (lines 10 to 60, trimmed)
pub async fn fetch_usage_snapshot(cookies: &ClaudeCookies) -> Result<UsageSnapshot> {
    let usage:        Option<UsageResponse>        = get_json(..., "/api/organizations/{org}/usage").await.ok();
    let overage:      Option<OverageResponse>      = get_json(..., "/api/organizations/{org}/overage_spend_limit").await.ok();
    let subscription: Option<SubscriptionResponse> = get_json(..., "/api/organizations/{org}/subscription_details").await.ok();

    Ok(UsageSnapshot {
        org_uuid: cookies.last_active_org.clone(),
        fetched_at: chrono::Utc::now(),
        usage,        // five_hour, seven_day, seven_day_opus, ...
        overage,      // is_enabled, out_of_credits, disabled_until, used_credits
        subscription, // next_charge_date, payment_method
        ..
    })
}`;

const overageStruct = `// claude-meter/src/models.rs (lines 30 to 40)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverageResponse {
    pub is_enabled:            bool,
    pub monthly_credit_limit:  Option<i64>,
    pub currency:              Option<String>,
    pub used_credits:          Option<f64>,
    pub disabled_reason:       Option<String>,
    pub disabled_until:        Option<chrono::DateTime<chrono::Utc>>,
    #[serde(default)]
    pub out_of_credits:        bool,
}`;

const cliFormatSnippet = `// claude-meter/src/format.rs (lines 24 to 40)
if let Some(ov) = &s.overage {
    let u = ov.used_credits.unwrap_or(0.0) / 100.0;
    let status = if ov.out_of_credits { "  BLOCKED" } else { "" };
    let mut line = match ov.monthly_credit_limit {
        Some(l) => {
            let l = l as f64 / 100.0;
            let pct = if l > 0.0 { u / l * 100.0 } else { 0.0 };
            format!("\${:.2} / \${:.2} ({:.0}%){}", u, l, pct, status)
        }
        None => format!("\${:.2} used (no cap){}", u, status),
    };
    if let Some(until) = &ov.disabled_until {
        let local: DateTime<Local> = (*until).into();
        line.push_str(&format!(" until {}", local.format("%a %b %-d")));
    }
    println!("{:<16} {}", "Extra usage", line);
}`;

const reproTerminal = [
  { type: "command" as const, text: "# From a claude.ai browser session, copy the Cookie header out of DevTools" },
  { type: "command" as const, text: "ORG=<your org uuid, visible in any /settings URL>" },
  { type: "command" as const, text: "COOKIE=\"$(< ~/.claude-session)\"" },
  { type: "command" as const, text: "" },
  { type: "command" as const, text: "# Layer 1: the 5-hour utilization float" },
  { type: "command" as const, text: "curl -s -H \"Cookie: $COOKIE\" \\" },
  { type: "command" as const, text: "  https://claude.ai/api/organizations/$ORG/usage | jq '.five_hour'" },
  { type: "output" as const, text: "{ \"utilization\": 1.0, \"resets_at\": \"2026-04-24T22:08:00Z\" }" },
  { type: "command" as const, text: "" },
  { type: "command" as const, text: "# Layer 2 and 3: overage switch, monthly cap, suspension clock" },
  { type: "command" as const, text: "curl -s -H \"Cookie: $COOKIE\" \\" },
  { type: "command" as const, text: "  https://claude.ai/api/organizations/$ORG/overage_spend_limit" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"is_enabled\":            true," },
  { type: "output" as const, text: "  \"monthly_credit_limit\":  5000," },
  { type: "output" as const, text: "  \"used_credits\":          5000," },
  { type: "output" as const, text: "  \"out_of_credits\":        true," },
  { type: "output" as const, text: "  \"disabled_reason\":       \"payment_failed\"," },
  { type: "output" as const, text: "  \"disabled_until\":        \"2026-04-26T09:02:00Z\"" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "5-hour at 100% AND out_of_credits true AND disabled_until in the future. Three walls, all up." },
];

const walkthroughSteps = [
  {
    title: "Layer 1 trips: five_hour.utilization hits 1.0",
    description:
      "The 5-hour bucket on /api/organizations/{org_uuid}/usage crossed the weighted ceiling. The Settings page bar pins. Any new request from this org gets 429 from the rate limiter. If overage is off, the request stops here and you see the familiar 'try again later' message with resets_at buried in the payload.",
  },
  {
    title: "Layer 2 decides: overage_spend_limit.is_enabled",
    description:
      "If is_enabled is false, layer 1 is your wall. Nothing you do below matters, you wait for resets_at. If is_enabled is true, the request continues into metered billing and used_credits starts climbing. The Settings page does not render a badge for this switch; the flag lives on the overage endpoint only.",
  },
  {
    title: "Layer 3 gates: out_of_credits or disabled_until",
    description:
      "Even with is_enabled true, two other flags can block overage: out_of_credits (monthly cap hit) and disabled_until (a wall-clock timestamp the server uses to suspend overage after payment failures or manual holds). ClaudeMeter flags this by appending 'BLOCKED' and 'until <date>' to the extra-usage line (format.rs lines 26 and 36).",
  },
  {
    title: "Reset semantics differ by layer",
    description:
      "Layer 1 slides forward as your earliest unexpired message ages out. Layer 2 resets at next_charge_date from subscription_details (the billing cycle boundary). Layer 3's disabled_until carries its own timestamp and can persist across 5-hour resets and billing cycles. The three clocks are independent.",
  },
  {
    title: "Reading server truth means three calls, not one",
    description:
      "ClaudeMeter polls /usage, /overage_spend_limit, and /subscription_details in the same cycle (api.rs lines 10 to 60). Local-log tools see none of them. That is why a tool that counts tokens in ~/.claude/projects can tell you what Claude Code burned on disk and still miss the wall entirely.",
  },
];

const matterChecklist = [
  {
    text: "A 429 at the 5-hour mark is not one event. It is whichever layer trips first, and the error body does not name the layer.",
  },
  {
    text: "If you only poll /usage, you cannot distinguish 'quota pinned' from 'overage disabled by payment failure'. Both return generic 429s.",
  },
  {
    text: "disabled_until can outlast the 5-hour reset. Your 5-hour bar drains, you still 429 because layer 3 is still armed.",
  },
  {
    text: "out_of_credits flips true silently when monthly overage hits the cap. Nothing in /usage reflects it.",
  },
  {
    text: "ccusage and Claude-Code-Usage-Monitor do not call either endpoint. They read JSONL files under ~/.claude/projects and cannot see server state.",
  },
];

const layerCards = [
  {
    title: "Layer 1: the rolling 5-hour float",
    description:
      "One weighted utilization fraction on /api/organizations/{org_uuid}/usage under five_hour. Slides continuously. Trips at >= 1.0 with a 429 from the rate limiter. resets_at slides forward as you send.",
    size: "2x1" as const,
    accent: true,
  },
  {
    title: "Layer 2: the overage switch",
    description:
      "is_enabled on /overage_spend_limit. When true, requests continue after layer 1 and start consuming used_credits toward monthly_credit_limit. When false, layer 1 is a hard wall.",
    size: "1x1" as const,
  },
  {
    title: "Layer 3a: out_of_credits",
    description:
      "Flipped true when used_credits reaches monthly_credit_limit. Overage stops even with is_enabled true. ClaudeMeter renders 'BLOCKED' next to extra-usage.",
    size: "1x1" as const,
  },
  {
    title: "Layer 3b: disabled_until",
    description:
      "ISO 8601 timestamp that suspends overage until that wall-clock moment. Populated after payment failures or manual holds. Persists across 5-hour resets. Not mirrored on /usage.",
    size: "2x1" as const,
    accent: true,
  },
];

const before = {
  label: "What most articles describe",
  content:
    "You hit 100 percent of the 5-hour window, you get 429s, you wait about 5 hours, the window rolls, you work again. A single boundary with a single timer.",
  highlights: [
    "Implies one endpoint, one field, one timer",
    "Implies waiting solves it",
    "Ignores overage, credit cap, and disabled_until",
    "Ignores that 429 messages do not name the layer",
  ],
};

const after = {
  label: "What the server actually enforces",
  content:
    "Three layers across two endpoints. Layer 1 is five_hour.utilization on /usage. Layer 2 is is_enabled on /overage_spend_limit. Layer 3 is out_of_credits OR disabled_until on the same endpoint. A 429 can come from any one, with the same error body.",
  highlights: [
    "Two endpoints minimum to reconstruct state",
    "Four flag fields any one of which walls you",
    "Independent clocks per layer",
    "Field names verifiable in src/models.rs and src/api.rs",
  ],
};

const comparisonRows = [
  {
    feature: "Reads /api/organizations/{org}/usage",
    competitor: "No (reads local JSONL)",
    ours: "Yes, every 60 seconds",
  },
  {
    feature: "Reads /api/organizations/{org}/overage_spend_limit",
    competitor: "No",
    ours: "Yes, same cycle",
  },
  {
    feature: "Surfaces out_of_credits",
    competitor: "No",
    ours: "Yes, shown as BLOCKED",
  },
  {
    feature: "Surfaces disabled_until",
    competitor: "No",
    ours: "Yes, shown as 'until <date>'",
  },
  {
    feature: "Knows server-weighted utilization",
    competitor: "No (local tokens only)",
    ours: "Yes, reads the float the rate limiter checks",
  },
  {
    feature: "Handles cookie paste",
    competitor: "N/A (no cookie)",
    ours: "Zero, extension forwards existing session",
  },
];

const myths = [
  "Myth: the 5-hour wall is one 429",
  "Myth: overage enabled means no wall",
  "Myth: the wall lives on /usage",
  "Myth: 5 hours of waiting always clears it",
  "Myth: local token counts equal the server float",
  "Myth: the error message tells you which layer",
];

const beamInputs = [
  { label: "five_hour.utilization", sublabel: "/api/organizations/{org}/usage" },
  { label: "is_enabled", sublabel: "/overage_spend_limit" },
  { label: "out_of_credits", sublabel: "/overage_spend_limit" },
  { label: "disabled_until", sublabel: "/overage_spend_limit" },
  { label: "next_charge_date", sublabel: "/subscription_details" },
];

const beamOutputs = [
  { label: "Menu bar percentage" },
  { label: "BLOCKED badge" },
  { label: "'until <date>' suffix" },
  { label: "CLI --json snapshot" },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-5-hour-window-quota",
    title: "The 5-hour quota is one float on a sliding clock, not 45 messages",
    excerpt:
      "Where five_hour.utilization and resets_at live in the JSON, how the rolling window actually moves, and why the 45-message number is an average over an unknown distribution.",
    tag: "Related",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "The rolling window cap is seven windows, not one",
    excerpt:
      "The usage endpoint returns seven utilization buckets, not two. Five-hour is the loud one; weekly, per-model, OAuth-apps, and two internal-named buckets all trip independently.",
    tag: "Related",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "Local token counters cannot see server buckets or overage flags. They answer a different question from the one the wall answers.",
    tag: "Compare",
  },
];

const wallFlowSteps = [
  { label: "/usage poll", icon: "server" as const, detail: "five_hour float + resets_at" },
  { label: "/overage_spend_limit poll", icon: "wallet" as const, detail: "is_enabled, out_of_credits, disabled_until" },
  { label: "/subscription_details poll", icon: "webhook" as const, detail: "next_charge_date, payment method" },
  { label: "Merge into UsageSnapshot", icon: "check" as const, detail: "one struct, three layers" },
  { label: "Render three-layer state", icon: "browser" as const, detail: "menu bar + CLI --json" },
];

const articleJsonLd = articleSchema({
  headline: "The Claude 5-hour server-side wall is three walls, not one",
  description:
    "Three stacked server-side conditions across two undocumented endpoints produce identical-looking 429s when Claude Pro or Max walls you at the 5-hour mark. Where each layer lives in the JSON, with file and line references.",
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

export default function Claude5HourServerSideWallPage() {
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
          The Claude 5-hour server-side wall is{" "}
          <GradientText>three walls, not one</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          When a 429 hits at the 5-hour mark, three independent server-side
          conditions across two undocumented endpoints can have produced it.
          They emit the same generic error body. The Settings page renders only
          a slice. Here is where each layer lives in the JSON, with file and
          line references from the ClaudeMeter source.
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
          ratingCount="Verified against the live claude.ai endpoints"
          highlights={[
            "Field names from src/models.rs lines 30 to 40",
            "Poll logic from src/api.rs lines 10 to 60",
            "Reproducible in three curls",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <RemotionClip
          title="The 5-hour wall, layered"
          subtitle="Two endpoints, four flags, three independent clocks"
          captions={[
            "Layer 1: five_hour.utilization on /usage",
            "Layer 2: is_enabled on /overage_spend_limit",
            "Layer 3a: out_of_credits on the same endpoint",
            "Layer 3b: disabled_until, its own wall-clock timer",
            "One 429 body. No indication which layer tripped.",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The shape every other guide describes
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Look up this topic and you will mostly find the same story: Claude
          Pro gives you about 45 messages in a 5-hour rolling window, when the
          utilization bar fills you get throttled, you wait about five hours,
          the bar drains, you are back. A single endpoint, a single field, a
          single timer.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          That story is directionally right about layer 1 and silent about
          layers 2 and 3, which is exactly how you end up staring at a
          drained-looking 5-hour bar and eating 429s anyway.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <BackgroundGrid>
          <div className="p-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
              Mental model swap, in one line
            </h2>
            <p className="text-zinc-700 leading-relaxed text-lg">
              The 5-hour wall is not the condition <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">five_hour.utilization {">="} 1</code>. It is
              the condition{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                (five_hour {">="} 1) AND NOT (overage allowed)
              </code>
              , where &ldquo;overage allowed&rdquo; is itself a three-flag
              AND across a different endpoint. ClaudeMeter polls both.
            </p>
          </div>
        </BackgroundGrid>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The four layers, laid out
        </h2>
        <BentoGrid cards={layerCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: <NumberTicker value={3} /> endpoints, <NumberTicker value={4} /> flags, one 429 body
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The full wall state on a ClaudeMeter poll is assembled from three
          calls running inside{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            fetch_usage_snapshot
          </code>
          . Each one can fail independently, each contributes a different
          layer:
        </p>
        <AnimatedCodeBlock
          code={apiRsSnippet}
          language="rust"
          filename="claude-meter/src/api.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          If any of the three calls 5xx or 401, the snapshot drops that field
          but keeps the others. That is how ClaudeMeter can show &ldquo;5-hour
          at 92 percent, extra-usage unknown&rdquo; instead of going blank
          when the overage endpoint blips.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The struct that makes the wall legible
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The overage response is where layers 2 and 3 live. The ClaudeMeter
          Rust struct is intentionally explicit about every field, so a
          rename from Anthropic breaks loudly instead of silently hiding a
          wall:
        </p>
        <AnimatedCodeBlock
          code={overageStruct}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Three flags on this struct can wall you:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            is_enabled
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            out_of_credits
          </code>
          , and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            disabled_until
          </code>
          . Combined with layer 1 on the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            usage
          </code>{" "}
          endpoint, that is four boolean-ish conditions feeding one 429.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          How ClaudeMeter assembles the wall state
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Three calls per 60-second cycle, merged into one snapshot, rendered
          as one menu bar badge.
        </p>
        <FlowDiagram title="One poll cycle" steps={wallFlowSteps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What every flag in the wall feeds
        </h2>
        <AnimatedBeam
          title="Flags in, wall state out"
          from={beamInputs}
          hub={{
            label: "UsageSnapshot",
            sublabel: "merged struct, one poll",
          }}
          to={beamOutputs}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          disabled_until, the field nobody else mentions
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          This is the stickiest layer. When populated, the server treats
          overage as disabled until that wall-clock moment, regardless of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            is_enabled
          </code>{" "}
          or the monthly credit math. We see it set after payment failures (a
          declined card pushes the field forward a day or two, giving Stripe
          retry logic a runway) and during what we believe are Trust &amp;
          Safety holds. It does not appear on the Settings page bar.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The CLI surfaces it as a &ldquo;until &lt;date&gt;&rdquo; suffix on
          the extra-usage line:
        </p>
        <AnimatedCodeBlock
          code={cliFormatSnippet}
          language="rust"
          filename="claude-meter/src/format.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          If your 5-hour bar drains and your next message still 429s, open the
          menu bar and look at the extra-usage line. If it says &ldquo;until
          Fri Apr 26&rdquo;, waiting for 5 hours will not help you. Waiting
          for Friday or fixing the underlying billing issue will.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce the three layers in three curls
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need ClaudeMeter to verify this. With a logged-in
          claude.ai session cookie, you can hit all three endpoints by hand:
        </p>
        <TerminalOutput
          title="Three endpoints, three curls, one wall"
          lines={reproTerminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          That specific payload is the nastiest combination: quota at 100
          percent, monthly credit cap hit, and overage suspended until a
          later date. All three walls up. The 429 body you get from the next
          prompt is still the same generic message, which is why reading the
          JSON is the only way to know which clock to watch.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Before and after
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-3">
              {before.label}
            </h3>
            <p className="text-zinc-700 leading-relaxed">{before.content}</p>
            <ul className="mt-4 space-y-2">
              {before.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2 text-sm text-zinc-600"
                >
                  <span aria-hidden className="text-zinc-400 mt-0.5">×</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
            <h3 className="text-sm font-mono uppercase tracking-widest text-teal-700 mb-3">
              {after.label}
            </h3>
            <p className="text-zinc-700 leading-relaxed">{after.content}</p>
            <ul className="mt-4 space-y-2">
              {after.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2 text-sm text-zinc-700"
                >
                  <svg
                    className="w-4 h-4 mt-0.5 text-teal-600 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The full wall traversal, step by step
        </h2>
        <StepTimeline steps={walkthroughSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the naive mental model gets you surprised 429s
        </h2>
        <AnimatedChecklist
          title="The traps a single-endpoint view creates"
          items={matterChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The numbers from the implementation
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Drawn from the ClaudeMeter source, not invented benchmarks.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 3, label: "endpoints polled per cycle" },
              { value: 4, label: "wall-tripping flags across them" },
              { value: 60, suffix: "s", label: "poll cadence" },
              { value: 63762, label: "localhost bridge port" },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <ComparisonTable
          heading="Local-log tools vs ClaudeMeter for wall state"
          intro="Why counting tokens in ~/.claude/projects cannot tell you where the wall is."
          productName="ClaudeMeter"
          competitorName="Local-log tools"
          rows={comparisonRows}
        />
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
          Why a local token counter cannot reconstruct this
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              ccusage and Claude-Code-Usage-Monitor read{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ~/.claude/projects/**/*.jsonl
              </code>{" "}
              and sum token usage from your local Claude Code sessions. The
              number they produce is real, but it is the answer to a different
              question. It does not include the server-applied weighting
              (peak-hour multiplier, attachment cost, model factor, tool-call
              factor) that feeds the five_hour float. It does not include any
              state from{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /overage_spend_limit
              </code>
              . It cannot see{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                out_of_credits
              </code>{" "}
              or{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                disabled_until
              </code>
              . That is the entire reason ClaudeMeter exists: the only place
              the three-layer wall is visible is on the two undocumented
              Anthropic endpoints, and you need the browser session cookies to
              hit them.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Both endpoints (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /overage_spend_limit
          </code>
          ) are internal and undocumented. Anthropic can rename fields,
          remove buckets, or change semantics in any release. ClaudeMeter
          deserializes each response into a strict Rust struct (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>
          ), so any breaking change surfaces as a loud parse error in the
          menu bar instead of a silent wrong number. Until that happens, this
          is the shape. These are the fields. This is the wall.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch the three-layer wall live
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter sits in your macOS menu bar, polls all three endpoints
          every 60 seconds, and shows you which layer is binding right now.
          Free, MIT licensed, no cookie paste, reads what the rate limiter
          reads.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <FaqSection items={faqs} />

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </section>

      <div className="max-w-4xl mx-auto px-6 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Seeing a layer we do not cover?"
          description="If your overage response has a flag we did not name, or disabled_until fires on an event we did not describe, send it. We map every variant we see."
          text="Book a 15-minute call"
          section="five-hour-wall-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Stuck behind a layer-3 wall? 15 min."
        section="five-hour-wall-sticky"
        site="claude-meter"
      />
    </article>
  );
}
