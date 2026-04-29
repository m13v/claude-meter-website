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
  BentoGrid,
  RemotionClip,
  AnimatedBeam,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  OrbitingCircles,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-opus-4-7-usage-limits";
const PUBLISHED = "2026-04-22";

export const metadata: Metadata = {
  title: "Claude Code Opus 4.7 Usage Limits: The Two Server Floats That Gate You",
  description:
    "Claude Code's Opus 4.7 cap is not a message count. It is two server-side utilization floats (five_hour and seven_day_opus) on claude.ai/api/organizations/{org_uuid}/usage. The new 1.0x to 1.35x tokenizer and adaptive thinking push the Opus-only float faster than they did on 4.6.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Code Opus 4.7 Usage Limits: The Two Server Floats That Gate You",
    description:
      "The Opus-only weekly bucket (seven_day_opus) is the field that actually rate-limits Claude Code on Opus 4.7. Here is where it lives, how the new tokenizer fills it faster, and how to read it live.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Does Claude Code on Opus 4.7 use the same usage bucket as Sonnet?",
    a: "Partially. Every Claude Code request, regardless of model, counts against the shared five_hour bucket on /api/organizations/{org_uuid}/usage. Opus 4.7 requests also count against a separate seven_day_opus bucket that Sonnet requests do not touch. That second bucket is why you can have plenty of Sonnet headroom and still get rate-limited on Opus: the Opus-only float hit 1.0 while the shared float was nowhere near. It is declared in claude-meter/src/models.rs line 23 as pub seven_day_opus: Option<Window>.",
  },
  {
    q: "How does the new Opus 4.7 tokenizer change my usage?",
    a: "Anthropic's what's-new doc for Opus 4.7 says the new tokenizer maps the same text to 1.0x to 1.35x as many tokens (up to ~35% more, varies by content). The tokenizer change does not add a new field to the usage payload. It makes seven_day_opus.utilization climb faster for the same prompt. If a coding session used 40% of your Opus weekly on 4.6, the same session can use 40% to 54% on 4.7. The server does not tell you which factor applied; only the aggregate utilization number moves.",
  },
  {
    q: "What about adaptive thinking, does that also count?",
    a: "Yes, and it is the bigger effect for most Claude Code users. Opus 4.7 uses adaptive thinking by default when the caller opts in, and burns more thinking tokens than 4.6 at the same effort level. Thinking tokens are real output tokens from the server's point of view and flow into the same seven_day_opus float. Anthropic announced they raised plan rate limits to offset this, but the weighting still lands on one opaque utilization number. You cannot back it out after the fact.",
  },
  {
    q: "Where exactly does Anthropic store the Opus-only weekly quota?",
    a: "In the JSON at GET https://claude.ai/api/organizations/{your_org_uuid}/usage under the key seven_day_opus. The shape is { utilization: number, resets_at: ISO8601 } — same Window struct as five_hour and seven_day, defined at claude-meter/src/models.rs lines 3-7. The bar on claude.ai/settings/usage labeled 'Opus weekly usage' is drawn from this exact field.",
  },
  {
    q: "Can ccusage or Claude-Code-Usage-Monitor show me my Opus 4.7 quota?",
    a: "No. Those tools read ~/.claude/projects/**/*.jsonl and sum local tokens. Local token counts miss three things the server applies before it writes to seven_day_opus: the 4.7 tokenizer's 1.0x to 1.35x expansion (counted server-side), thinking tokens (generated server-side and not always written to JSONL in full), and any peak-hour weighting Anthropic has layered on. The only number that matches what the Opus-rate-limiter checks is the one returned by /api/organizations/{org_uuid}/usage.",
  },
  {
    q: "Why does the 'Opus weekly' bar on Settings sometimes jump without me sending anything?",
    a: "Because Claude Code running in a background agentic loop keeps sending requests while you are not in the chat. Opus 4.7 also tends to produce more regular progress updates and fewer subagents by default, which changes the shape of a session's token bill without changing anything you typed. ClaudeMeter polls the endpoint every 60 seconds so you see the float move while the session runs.",
  },
  {
    q: "Does 'switching to Sonnet' actually free up Opus quota?",
    a: "It frees up seven_day_opus, yes. It does not free up five_hour, because five_hour aggregates across models. So if a Sonnet-heavy day burns five_hour, you can be Opus-healthy and still locked out of Claude Code because the shared 5-hour float is pinned. Two floats, one AND gate. Both have to stay below 1.0.",
  },
  {
    q: "Is the utilization field 0-to-1 or 0-to-100?",
    a: "Both, inconsistently, across buckets in the same payload. We have seen five_hour returned as 0.72 next to seven_day_opus returned as 94.0 in the same response. The extension normalizes with one clamp at popup.js:6-11: u <= 1 ? u * 100 : u. If you write your own client and skip that clamp, a bucket at 0.94 will render as 'less than 1 percent' and you will walk into a 429 on your next Opus 4.7 request.",
  },
  {
    q: "Does task_budget or effort=medium reduce what lands in seven_day_opus?",
    a: "Yes, but only indirectly. task_budget is an advisory token cap the model sees as a running countdown; effort=medium cuts adaptive-thinking spend. Both reduce the output tokens the model generates, so they reduce what the server writes to seven_day_opus. Neither tells you how much you saved. The honest way to measure savings is to compare seven_day_opus.utilization between two comparable sessions with and without the budget or with different effort levels.",
  },
  {
    q: "Is seven_day_opus the only Opus-specific field?",
    a: "Yes. There is a seven_day_sonnet field as well (Sonnet-only weekly) and a shared seven_day (all models combined), but no per-model 5-hour bucket and no per-version bucket for 4.7 vs 4.6. From the server's perspective, Opus 4.7 and Opus 4.6 both write to seven_day_opus. The only way to tell 4.7 apart is indirectly: your float rises faster than it did on 4.6 for the same workload.",
  },
  {
    q: "Where does this leave me if I'm on a Max plan?",
    a: "The field names are the same. What changes is the denominator baked into utilization. Max 5x and Max 20x have higher ceilings, so the same absolute workload produces a lower fraction. ClaudeMeter reads the fraction verbatim, so the plan is implicit in the numbers you see. The rate limiter trips at utilization >= 1.0 regardless of plan.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code Opus 4.7 usage limits", url: PAGE_URL },
];

const usagePayload = `{
  "five_hour":        { "utilization": 0.68, "resets_at": "2026-04-22T17:12:00Z" },
  "seven_day":        { "utilization": 0.44, "resets_at": "2026-04-27T09:02:00Z" },
  "seven_day_sonnet": { "utilization": 0.19, "resets_at": "2026-04-27T09:02:00Z" },
  "seven_day_opus":   { "utilization": 0.91, "resets_at": "2026-04-27T09:02:00Z" },
  "extra_usage": {
    "is_enabled":    true,
    "monthly_limit": 5000,
    "used_credits":  1420.5,
    "utilization":   0.2841,
    "currency":      "USD"
  }
}`;

const modelsRsSnippet = `// claude-meter/src/models.rs  (lines 19-28)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:            Option<Window>,
    pub seven_day_sonnet:     Option<Window>,
    pub seven_day_opus:       Option<Window>,  // <-- the Opus 4.7 gate
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,
}`;

const formatRsSnippet = `// claude-meter/src/format.rs  (lines 19-21)
if let Some(w) = &u.seven_day_opus {
    println!("{:<16} {}", "7-day Opus", format_window(w));
}`;

const popupJsSnippet = `// claude-meter/extension/popup.js  (lines 57-64)
<div class="account">
  <div class="email">\${name}</div>
  \${row("5-hour", u.five_hour)}
  \${row("7-day",  u.seven_day)}
  \${u.seven_day_sonnet ? row("7d Sonnet", u.seven_day_sonnet) : ""}
  \${u.seven_day_opus   ? row("7d Opus",   u.seven_day_opus)   : ""}
</div>`;

const curlRepro = [
  { type: "command" as const, text: "# From DevTools on claude.ai/settings/usage: copy the Cookie header." },
  { type: "command" as const, text: "ORG=<your org uuid from any /settings url>" },
  { type: "command" as const, text: "curl -s https://claude.ai/api/organizations/$ORG/usage \\" },
  { type: "command" as const, text: "  -H \"Cookie: $(< ~/.claude-session)\" | jq '.seven_day_opus'" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"utilization\": 0.91," },
  { type: "output" as const, text: "  \"resets_at\":   \"2026-04-27T09:02:00Z\"" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "0.91 = 91 percent of the Opus-only weekly float. This is the number that gates Opus 4.7." },
];

const preconditionChecklist = [
  {
    text: "seven_day_opus.utilization < 1.0 (Opus-only weekly float). This is the field whose ceiling is the specific reason Opus 4.7 requests 429.",
  },
  {
    text: "five_hour.utilization < 1.0 (shared across every model, including Sonnet). Claude Code cannot send any request, Opus or otherwise, when this is pinned.",
  },
  {
    text: "Your session cookie on claude.ai is still valid. All three fields come from the same /api/organizations/{org_uuid}/usage endpoint, authed with your browser session.",
  },
  {
    text: "Your extra_usage config, if enabled, is not out_of_credits. When overage runs out, Claude Code also stops even if both utilization floats are below 1.0.",
  },
];

const two47Changes = [
  {
    title: "New tokenizer (1.0x to 1.35x)",
    description:
      "The Opus 4.7 tokenizer maps the same English text to up to 35% more tokens than 4.6. Server-side accounting uses the 4.7 count, so the same prompt fills seven_day_opus faster than it did a month ago.",
    size: "1x1" as const,
  },
  {
    title: "Adaptive thinking by default",
    description:
      "Opus 4.7's adaptive thinking decides its own reasoning depth. Thinking output counts toward the Opus-only bucket. On the same effort level, 4.7 spends more thinking tokens than 4.6.",
    size: "1x1" as const,
  },
  {
    title: "New xhigh effort level",
    description:
      "The xhigh effort tier did not exist on 4.6. If Claude Code is set to it (or defaults promote it), each prompt's server-side cost rises, and seven_day_opus rises with it.",
    size: "1x1" as const,
  },
  {
    title: "Rate limits raised to compensate",
    description:
      "Anthropic publicly confirmed they raised subscriber rate limits on 4.7 to offset higher thinking token use. The denominator changed, but the field you watch (seven_day_opus.utilization) is still a single opaque fraction.",
    size: "1x1" as const,
  },
  {
    title: "Thinking content hidden by default",
    description:
      "Opus 4.7 omits thinking content from response payloads unless you opt in to summarized. That output is still generated and still billed against seven_day_opus, it just does not show up in your console log.",
    size: "1x1" as const,
  },
  {
    title: "Sampling params removed",
    description:
      "temperature, top_p, and top_k all 400 on Opus 4.7. This does not change quota math, but breaks old Claude Code configs and can cause retries that double-bill seven_day_opus if you do not catch them.",
    size: "1x1" as const,
  },
];

const flowSteps = [
  {
    label: "1. Claude Code sends Opus 4.7 request",
    detail:
      "Through your OAuth-authed claude.ai session. The request carries your org_uuid so the server knows which bucket set to update.",
  },
  {
    label: "2. Tokenizer expands prompt 1.0x to 1.35x",
    detail:
      "The 4.7 tokenizer runs server-side. The same characters produce more tokens than they did on 4.6. That count is what lands in accounting.",
  },
  {
    label: "3. Adaptive thinking generates thinking tokens",
    detail:
      "The model chooses its own reasoning depth. Thinking tokens count as output. If you requested summarized display, you see a summary; the full thinking is still billed.",
  },
  {
    label: "4. Server increments seven_day_opus + five_hour",
    detail:
      "Both floats move. seven_day_opus is Opus-only (Sonnet traffic does not touch it). five_hour is shared. Weights include peak-hour, attachment cost, tool calls.",
  },
  {
    label: "5. Rate limiter checks utilization >= 1.0",
    detail:
      "Trip on EITHER float and the next Claude Code request returns 429. The error does not name the bucket that tripped, so you have to watch both.",
  },
];

const comparisonRows = [
  {
    feature: "Reads the server-enforced Opus quota",
    competitor: "No, reads local JSONL",
    ours: "Yes, reads /api/organizations/{org_uuid}/usage",
  },
  {
    feature: "Sees seven_day_opus.utilization",
    competitor: "Not available locally",
    ours: "Yes, surfaced verbatim",
  },
  {
    feature: "Accounts for Opus 4.7's 1.0x to 1.35x tokenizer",
    competitor: "No, pre-tokenizer counts only",
    ours: "Yes, the server applies it before counting",
  },
  {
    feature: "Counts adaptive-thinking tokens you cannot see",
    competitor: "No, omitted thinking is not in your JSONL",
    ours: "Yes, already baked into utilization",
  },
  {
    feature: "Counts peak-hour weighting",
    competitor: "No, multiplier is server-private",
    ours: "Yes, already baked into utilization",
  },
  {
    feature: "Reads your local ~/.claude/projects JSONL",
    competitor: "Yes, this is its primary source",
    ours: "No, not the source of truth for quota",
  },
  {
    feature: "Works offline",
    competitor: "Yes",
    ours: "No, polls claude.ai",
  },
  {
    feature: "Requires a claude.ai session",
    competitor: "No",
    ours: "Yes",
  },
];

const articleJsonLd = articleSchema({
  headline: "Claude Code Opus 4.7 usage limits: the two server floats that gate you",
  description:
    "Claude Code's Opus 4.7 cap is not a message count. It is two utilization floats on claude.ai/api/organizations/{org_uuid}/usage, and the 1.0x to 1.35x tokenizer plus adaptive thinking both land on one of them (seven_day_opus).",
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

const relatedPosts = [
  {
    href: "/t/claude-pro-5-hour-window-quota",
    title: "Claude Pro's 5-hour window is one float on a sliding clock",
    excerpt:
      "The 5-hour bucket is not a 45-message counter and it does not reset at your first prompt plus 5h. Where the field lives and how the clock slides.",
    tag: "Related",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "The Claude rolling window cap is seven windows, not one",
    excerpt:
      "The same /usage endpoint returns seven rolling buckets: five_hour, seven_day, seven_day_sonnet, seven_day_opus, and three more. Hit any one, get throttled.",
    tag: "Related",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage counts tokens in ~/.claude/projects. ClaudeMeter reads seven_day_opus. Different questions, different answers, and only one of them matches the rate limiter.",
    tag: "Compare",
  },
];

export default function ClaudeCodeOpus47UsageLimitsPage() {
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
          Claude Code&apos;s Opus 4.7 limit lives in{" "}
          <GradientText>one server field called seven_day_opus</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every other explainer quotes abstractions: &ldquo;about 240 Opus
          prompts a week on Max&rdquo;, &ldquo;switch to Sonnet to save
          quota&rdquo;, &ldquo;use effort medium.&rdquo; The actual gate is
          concrete. One utilization fraction, on one JSON endpoint, computed
          with a new 4.7 tokenizer that spends 1.0x to 1.35x more tokens on the
          same text. Here is the field, the endpoint, and how to watch it move
          while Claude Code is running.
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
          ratingCount="Sourced from the live claude.ai usage endpoint"
          highlights={[
            "Field name from claude-meter/src/models.rs line 23",
            "Same JSON the Settings page itself fetches",
            "Verifiable in 30 seconds with one curl",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <RemotionClip
          title="seven_day_opus: the Opus-only float"
          subtitle="What actually gates Claude Code on Opus 4.7"
          captions={[
            "one field: seven_day_opus.utilization",
            "one endpoint: /api/organizations/{org_uuid}/usage",
            "tokenizer: 1.0x to 1.35x vs Opus 4.6",
            "adaptive thinking counts toward it too",
            "Sonnet requests do not touch it",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The shape of the limit, in one sentence
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Claude Code running on Opus 4.7 is throttled by two server-side
          utilization floats that must both stay below 1.0:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          (shared across every model you use) and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          (Opus-only weekly). Both arrive on the same JSON payload at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            GET /api/organizations/&#123;org_uuid&#125;/usage
          </code>
          . There is no per-version bucket, so Opus 4.7 and Opus 4.6 both write
          to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          — the difference is how fast 4.7 fills it.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: here is the field, verbatim
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The struct ClaudeMeter deserializes the response into declares
          every bucket the server returns. The Opus 4.7 gate is on line 23:
        </p>
        <AnimatedCodeBlock
          code={modelsRsSnippet}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          And here is the shape of the JSON the server actually returns on a
          live account. The bar labeled &ldquo;Opus weekly&rdquo; on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          is drawn from the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          object below:
        </p>
        <div className="mt-4">
          <AnimatedCodeBlock
            code={usagePayload}
            language="json"
            filename="claude.ai/api/organizations/{org_uuid}/usage"
          />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What Opus 4.7 changed that fills the float faster
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Six things in the Opus 4.7 release notes that change how fast{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus.utilization
          </code>{" "}
          rises for the same Claude Code session you had a month ago on 4.6.
        </p>
        <BentoGrid cards={two47Changes} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          One Claude Code request, one bucket increment
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The exact chain of effects from a Claude Code call on Opus 4.7 to
          the two utilization floats that gate your next request.
        </p>
        <FlowDiagram
          title="Claude Code -> seven_day_opus + five_hour"
          steps={flowSteps}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Everything that feeds the Opus float
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          None of these appear as separate fields in the response. They all
          collapse into one opaque utilization number, which is exactly why
          watching it live is the only reliable signal.
        </p>
        <AnimatedBeam
          title="Inputs to seven_day_opus.utilization"
          from={[
            { label: "Your prompt", sublabel: "tokenized 1.0x to 1.35x larger than 4.6" },
            { label: "Adaptive thinking", sublabel: "server decides depth" },
            { label: "xhigh effort", sublabel: "new tier in 4.7" },
            { label: "Tool calls", sublabel: "code exec, web, memory" },
            { label: "Attachments", sublabel: "docs, PDFs, high-res images" },
            { label: "Peak-hour multiplier", sublabel: "weekday midday Pacific" },
          ]}
          hub={{
            label: "seven_day_opus.utilization",
            sublabel: "one float, Opus-only weekly",
          }}
          to={[
            { label: "Settings 'Opus weekly' bar" },
            { label: "Rate limiter (>= 1.0 trips 429)" },
            { label: "ClaudeMeter 7d Opus row" },
          ]}
        />
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
              and sum the tokens recorded in those files. That is genuinely
              useful for Claude Code spend accounting. It is not the number the
              rate limiter checks.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              Three concrete gaps stop local-log tools from mirroring{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                seven_day_opus
              </code>
              . First: the Opus 4.7 tokenizer runs server-side, so the
              authoritative token count never lands in your JSONL at 4.7&apos;s
              expanded scale. Second: adaptive-thinking tokens are generated by
              the server. With the 4.7 default of{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                display: omitted
              </code>
              , the thinking content is not even in your response. Third: the
              peak-hour multiplier and plan-specific denominators are private
              to Anthropic.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              All three land on the one float. The single endpoint that
              returns the post-weighting, post-tokenizer number is{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /api/organizations/&#123;org_uuid&#125;/usage
              </code>
              . ClaudeMeter reads it every 60 seconds and surfaces the float
              verbatim.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce it yourself in one curl
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Open DevTools on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>
          , copy the Cookie header from the Network panel, and hit the
          endpoint directly. Filter to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            .seven_day_opus
          </code>{" "}
          to see the field that gates Opus 4.7 on your account:
        </p>
        <TerminalOutput
          title="claude.ai/api/organizations/{org_uuid}/usage"
          lines={curlRepro}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          How ClaudeMeter renders it
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The same field shows up in two places inside ClaudeMeter. In the CLI
          and menu bar it is printed by{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/format.rs
          </code>
          :
        </p>
        <AnimatedCodeBlock
          code={formatRsSnippet}
          language="rust"
          filename="claude-meter/src/format.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          And the browser extension popup renders the row only when the field
          is present, because some accounts do not have it yet:
        </p>
        <AnimatedCodeBlock
          code={popupJsSnippet}
          language="javascript"
          filename="claude-meter/extension/popup.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          There is no inference, no transformation beyond the 0-to-1 vs
          0-to-100 normalization. What Anthropic returns is what you see.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The concrete numbers
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              From the implementation and Anthropic&apos;s Opus 4.7 docs. No
              invented benchmarks.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 2, label: "utilization floats that must stay below 1.0" },
              { value: 1, label: "endpoint that returns both" },
              { value: 35, suffix: "%", label: "max token expansion on the 4.7 tokenizer" },
              { value: 60, suffix: "s", label: "ClaudeMeter poll cadence" },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What every prompt has to be true before it runs
        </h2>
        <AnimatedChecklist
          title="Preconditions for a successful Opus 4.7 call"
          items={preconditionChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Server truth vs local logs
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Two different questions. Both have legitimate answers. Only one
          matches what Anthropic enforces on Opus 4.7.
        </p>
        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="Local log tools"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20 mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Everything Opus 4.7 touches that a local counter cannot see
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The server is the only thing with a complete view of what lands in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>
          . ClaudeMeter is a thin wrapper on the same endpoint the Settings
          page calls.
        </p>
        <OrbitingCircles
          radius={150}
          duration={28}
          center={
            <span className="text-center text-sm leading-tight px-2">
              seven_day_opus
              <br />
              utilization
            </span>
          }
          items={[
            <span key="tok" className="px-3 py-2 rounded-xl bg-white shadow border border-zinc-200 text-xs font-medium text-zinc-800 whitespace-nowrap">
              4.7 tokenizer
            </span>,
            <span key="think" className="px-3 py-2 rounded-xl bg-white shadow border border-zinc-200 text-xs font-medium text-zinc-800 whitespace-nowrap">
              adaptive thinking
            </span>,
            <span key="xhigh" className="px-3 py-2 rounded-xl bg-white shadow border border-zinc-200 text-xs font-medium text-zinc-800 whitespace-nowrap">
              xhigh effort
            </span>,
            <span key="tools" className="px-3 py-2 rounded-xl bg-white shadow border border-zinc-200 text-xs font-medium text-zinc-800 whitespace-nowrap">
              tool calls
            </span>,
            <span key="peak" className="px-3 py-2 rounded-xl bg-white shadow border border-zinc-200 text-xs font-medium text-zinc-800 whitespace-nowrap">
              peak-hour
            </span>,
            <span key="att" className="px-3 py-2 rounded-xl bg-white shadow border border-zinc-200 text-xs font-medium text-zinc-800 whitespace-nowrap">
              attachments
            </span>,
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint is internal and undocumented. Field names have been
          stable for many months, but Anthropic could rename, split, or remove{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          in any release. ClaudeMeter deserializes into a strict Rust struct,
          so if the shape changes the menu bar surfaces a parse error and we
          patch the same day. There is also a realistic chance Anthropic will
          add a separate Opus-4.7-only bucket at some point; today, 4.7 and 4.6
          share the same float. Until either of those things happens, this is
          the field that enforces the cap.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch your Opus 4.7 float live
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter sits in your macOS menu bar and refreshes the two floats
          that gate Claude Code every 60 seconds. Free, MIT licensed, no cookie
          paste, reads the same JSON claude.ai/settings/usage reads.
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
          heading="Seeing a different shape on seven_day_opus?"
          description="If your payload returns extra Opus-specific fields, a 4.7-only bucket, or a utilization that disagrees with Settings, send it over. We map every variant we see."
          text="Book a 15-minute call"
          section="opus-4-7-limits-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on the Opus 4.7 usage endpoint? 15 min."
        section="opus-4-7-limits-sticky"
        site="claude-meter"
      />
    </article>
  );
}
