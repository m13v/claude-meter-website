import type { Metadata } from "next";
import {
  Breadcrumbs,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  BeforeAfter,
  GlowCard,
  GradientText,
  ProofBanner,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/alternative/context-compression-vs-plan-quota";
const PUBLISHED = "2026-05-08";

export const metadata: Metadata = {
  title:
    "Context compression vs plan quota: two completely different things people keep confusing",
  description:
    "Context compression (auto-compact) is a local 200K-token conversation mechanic. Plan quota is the server-side rolling 5-hour and 7-day budgets Anthropic enforces against your account. Compacting does not refund plan quota; per Anthropic's help center, automatic context management consumes more of it. Here is the actual data shape and what claude-meter sees on the server.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Context compression vs plan quota: two completely different things people keep confusing",
    description:
      "Auto-compact summarizes your conversation when it nears the 200K context window. Plan quota is what Anthropic 429s your account on. They are independent. Compaction is itself a billed call against the same week.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Alternatives", url: "https://claude-meter.com/alternative" },
  {
    name: "Context compression vs plan quota",
    url: PAGE_URL,
  },
];

const faqs = [
  {
    q: "Are context compression and plan quota the same thing?",
    a: "No. They are independent systems that both look like &ldquo;Claude is running out of room,&rdquo; which is why people conflate them. Context compression (auto-compact, /compact) summarizes earlier turns of a single conversation as it approaches the 200K-token context window. Plan quota is the rolling 5-hour and 7-day budgets Anthropic enforces against your whole Anthropic account, across every device, browser tab, and Claude Code session. The compression mechanic lives in the model server's prompt-construction step; the quota mechanic lives in a different server-side check that 429s your request based on a JSON Anthropic returns at /api/organizations/&#123;org_uuid&#125;/usage.",
  },
  {
    q: "Does running /compact save plan quota?",
    a: "No, it costs more of it. Anthropic's help center is explicit: &ldquo;Longer conversations that trigger automatic context management consume more of your usage limit.&rdquo; Compaction is itself an LLM call (the model summarizes your transcript), so it bills against the same rolling 5-hour and 7-day buckets. Compaction is good for keeping a long Claude Code session coherent, not for saving quota. If anything, it is a quota tax you accept in exchange for not hitting the 200K-token wall.",
  },
  {
    q: "Why does the prompt cache disappear after a compaction?",
    a: "Prompt caching keys on an exact prefix match of the input tokens. When /compact rewrites the conversation history into a summary, the prefix changes, so the next several turns get cache misses and pay full input-token rates. On a long Claude Code session with file context, that can mean tens of thousands of uncached input tokens flowing through the model right after compaction, none of which would have happened on the same conversation un-compacted.",
  },
  {
    q: "If compaction debits plan quota, can I see it happen on the server?",
    a: "Yes. Open claude.ai/settings/usage in a browser tab and watch the seven_day percentage and (on Max) seven_day_opus and seven_day_sonnet sub-buckets before and after a /compact. The float ticks up. ClaudeMeter polls /api/organizations/&#123;org_uuid&#125;/usage every 30 seconds (POLL_INTERVAL at src/bin/menubar.rs:18) so a compaction event shows up in the menu bar within a minute. The Anthropic-internal weighting on Opus prompts means an Opus compaction can move seven_day_opus by a measurable percentage on a single event.",
  },
  {
    q: "When does Claude Code auto-compact?",
    a: "Around 95% of the 200K-token context window, with about 20% of headroom reserved for the summarization call itself. The /compact slash command is the manual trigger. Either way it is the same mechanic: summarize earlier turns into a shorter recap, replace the original transcript with the recap plus the most recent turns. None of this touches the rolling 5-hour or 7-day buckets directly; the side effect is that the summarization itself is a billed prompt that does.",
  },
  {
    q: "If my context fills before my plan quota does, am I being inefficient?",
    a: "Not necessarily. Context window and plan quota measure different shapes of waste. A single very-long Claude Code session can blow through context before it dents the weekly bucket, especially on Pro. A bunch of short sessions can blow through the weekly bucket without any of them ever needing compaction. The right move depends on which one is your actual ceiling that week. ClaudeMeter shows the weekly float so you can tell which limit is the real constraint; the in-session /usage dump shows the context window so you can tell when you are near the 200K wall.",
  },
  {
    q: "Why does ccusage not show this?",
    a: "ccusage walks ~/.claude/projects/*.jsonl and totals input_tokens + output_tokens. The compaction summarization call writes to that JSONL like any other turn, so ccusage sees its raw token cost. What ccusage cannot see is the server-side weighting that turns those tokens into a fraction of seven_day or seven_day_opus, the peak-hour multiplier on the rolling 5-hour bucket, the prompt-cache miss penalty on the post-compaction turns, or browser-chat usage that depleted the same buckets without writing to JSONL. ccusage answers &ldquo;how much did this machine spend?&rdquo; ClaudeMeter answers &ldquo;how close am I to the wall the server is going to enforce?&rdquo;",
  },
  {
    q: "Can I just disable auto-compaction to avoid the quota cost?",
    a: "Some users have asked for a toggle (anthropics/claude-code#9540) but it is not currently exposed. The trade-off without compaction is harder: you hit the 200K context wall and the session stops cold. The practical workflow most heavy users settle on is /clear at phase boundaries (cheap, no LLM call) instead of /compact, and only let auto-compact run when you genuinely need to keep the prior turns in summarized form.",
  },
  {
    q: "Does Claude Pro get auto-compaction the same way Max does?",
    a: "Yes, the mechanic is identical; only the plan quota numbers differ. The 200K context window is the same on Pro and Max. The seven_day rolling bucket is roughly 40 to 80 hours per week on Pro, 140 to 280 on Max 5x, 240 to 480 on Max 20x, so a single compaction event eats a larger percentage of the Pro week than the Max week. On Pro you feel compaction's quota cost more, but only because there is less quota to start with.",
  },
  {
    q: "Where in claude-meter is the code that reads the plan quota?",
    a: "The Window struct at src/models.rs:3-7 is the data shape (utilization float, optional resets_at). The UsageResponse struct at src/models.rs:18-28 is what /api/organizations/&#123;org_uuid&#125;/usage returns: five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, plus the extra_usage block. The menu bar reads it on POLL_INTERVAL=30s (src/bin/menubar.rs:18) and the browser extension reads it on POLL_MINUTES=1m (extension/background.js). All open source, MIT, github.com/m13v/claude-meter.",
  },
];

const comparisonRows = [
  {
    feature: "What it caps",
    competitor:
      "The total tokens in this single conversation, against the 200K-token context window of the model.",
    ours:
      "The total compute on your whole Anthropic account, weighted, in two sliding bands (5 hours and 7 days).",
  },
  {
    feature: "Where it lives",
    competitor:
      "Inside the model server's prompt-construction step. It is local to the conversation, scoped to one chat session.",
    ours:
      "On a separate server-side enforcement layer that 429s your account, scoped to your org_uuid. Account-wide, every device, every browser tab, every Claude Code instance shares it.",
  },
  {
    feature: "How you see it",
    competitor:
      "/usage inside Claude Code (a one-shot dump). The &ldquo;Context left until auto-compact&rdquo; line in the Claude Code header. The auto-compact warning at ~95%.",
    ours:
      "claude.ai/settings/usage in a browser, /usage inside Claude Code, or a tool that reads /api/organizations/{org_uuid}/usage continuously (claude-meter polls every 30s).",
  },
  {
    feature: "What triggers a wall",
    competitor:
      "Conversation tokens approach 200K. Compaction triggers automatically; the session continues with summarized history.",
    ours:
      "The five_hour or seven_day utilization float crosses 1.0. Anthropic returns 429 on the next request from your org until the bucket bleeds back down.",
  },
  {
    feature: "Effect of compacting",
    competitor:
      "Frees up tokens in the conversation. The 200K wall is now further away.",
    ours:
      "Spends more of it. The summarization call is a billed prompt; per Anthropic, &ldquo;automatic context management consumes more of your usage limit.&rdquo; The post-compaction turns also miss the prompt cache, paying full input rates.",
  },
  {
    feature: "Effect of /clear",
    competitor:
      "Resets the context window to empty. No 200K problem.",
    ours:
      "No effect. The rolling 5-hour and 7-day buckets are server-side; they do not see /clear.",
  },
  {
    feature: "Time band",
    competitor:
      "Lifetime of one conversation. A new chat starts at zero tokens.",
    ours:
      "Sliding 5 hours (resets continuously as old prompts age out) and sliding 7 days (resets gradually).",
  },
  {
    feature: "Does ccusage see it?",
    competitor:
      "Indirectly. ccusage totals input + output tokens per session, so a long session shows up as a large token count.",
    ours:
      "No. The server-side weighting, peak-hour multiplier, and browser-chat usage are not in ~/.claude/projects/*.jsonl.",
  },
];

const usageJson = `// GET https://claude.ai/api/organizations/{org_uuid}/usage
//
// This is the *plan quota*. It has nothing to do with the 200K
// context window. Either bucket below can independently 429 your
// account, and a /compact event ticks them up because compaction
// is itself a billed prompt against your week.

{
  "five_hour": {
    "utilization": 0.62,                  // rolling 5-hour burst cap
    "resets_at":   "2026-05-08T22:14:00Z"
  },
  "seven_day": {
    "utilization": 0.71,                  // rolling 7-day weekly cap
    "resets_at":   "2026-05-14T09:02:00Z"
  },
  "seven_day_sonnet": {
    "utilization": 0.55,
    "resets_at":   "2026-05-14T09:02:00Z"
  },
  "seven_day_opus": {                     // the bucket compaction
    "utilization": 0.83,                  // hits hardest, because
    "resets_at":   "2026-05-14T09:02:00Z" // Opus is heavier per byte
  },
  "extra_usage": {
    "is_enabled":   true,
    "monthly_limit": 5000,
    "used_credits":   620,
    "utilization":  0.124
  }
}`;

const modelsRsExcerpt = `// claude-meter/src/models.rs
//
// The data shape that backs the menu bar. Note: there is no
// "context_window" field. Plan quota and context window are
// completely separate systems; this struct only knows the former.

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at:   Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:           Option<Window>,
    pub seven_day:           Option<Window>,
    pub seven_day_sonnet:    Option<Window>,
    pub seven_day_opus:      Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,
    pub extra_usage:         Option<ExtraUsage>,
}`;

const compactSession = [
  { type: "command" as const, text: "$ # In Claude Code, hour 3 of a refactor" },
  { type: "output" as const, text: "Context left until auto-compact: 3%" },
  { type: "command" as const, text: "$ /compact" },
  { type: "output" as const, text: "Compacting conversation..." },
  { type: "output" as const, text: "Summarized 47 turns into 1,820 tokens." },
  { type: "output" as const, text: "Context: 198K -> 12K. Continuing." },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "$ # In another window: claude-meter status" },
  { type: "output" as const, text: "BEFORE /compact:" },
  { type: "output" as const, text: "  5-hour          62.0% used    -> resets in 2h" },
  { type: "output" as const, text: "  7-day Opus      83.0% used    -> resets in 5d" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "AFTER /compact (60s later):" },
  { type: "output" as const, text: "  5-hour          64.7% used    -> resets in 2h" },
  { type: "output" as const, text: "  7-day Opus      84.2% used    -> resets in 5d" },
  { type: "output" as const, text: "" },
  { type: "error" as const, text: "Compaction freed 186K tokens of context. It also spent 1.2% of the weekly Opus bucket." },
];

const relatedPosts = [
  {
    href: "/alternative/claude-code-rolling-5-hour-vs-weekly-quota",
    title: "Rolling 5-hour vs weekly quota: same JSON, different walls",
    excerpt:
      "The 5-hour and 7-day are sibling fields on the same /usage payload. Either one independently 429s your account.",
    tag: "Comparison",
  },
  {
    href: "/t/claude-code-rolling-5-hour-usage",
    title: "Claude Code rolling 5-hour usage: three ledgers, three answers",
    excerpt:
      "Built-in /usage prints a snapshot. ccusage reads local JSONL. The float that 429s your loop is on claude.ai's server. Which tool reads which.",
    tag: "Reference",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage measures local Claude Code tokens off disk. ClaudeMeter measures plan quota off claude.ai. Different questions, different answers.",
    tag: "Comparison",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Context compression vs plan quota: two completely different things people keep confusing",
  description:
    "Context compression (auto-compact) is a local 200K-token conversation mechanic. Plan quota is the rolling 5-hour and 7-day server buckets. Compacting does not refund plan quota; Anthropic states it consumes more of it. The actual JSON shape and the claude-meter source that reads it.",
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

export default function ContextCompressionVsPlanQuotaPage() {
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
          Context compression{" "}
          <GradientText>vs plan quota</GradientText>: two different walls people keep mixing up
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Context compression is the auto-compact mechanic in Claude Code that
          summarizes your conversation when it gets near the 200K-token window.
          Plan quota is the rolling 5-hour and 7-day budgets Anthropic enforces
          against your whole account. They are independent. The thing every
          guide on this misses is that compacting does not save plan quota; it
          costs more of it, because the summarization itself is a billed prompt
          against the same week.
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-08)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            <strong>No, they are not the same.</strong> Context compression
            (auto-compact, <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">/compact</code>)
            summarizes earlier conversation turns when this single chat
            approaches the 200K-token context window of the model. Plan quota
            is the rolling 5-hour and 7-day server buckets Anthropic enforces
            against your Anthropic account, account-wide, across every device.
            Compacting <strong>does not refund</strong> plan quota. Per
            Anthropic&apos;s help center: &ldquo;Longer conversations that
            trigger automatic context management consume more of your usage
            limit.&rdquo; Source:{" "}
            <a
              href="https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              support.claude.com / how do usage and length limits work
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Two systems, side by side
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The names sound similar and both feel like &ldquo;Claude is running out
          of room,&rdquo; but they live in different places and respond to
          different commands.
        </p>
        <ComparisonTable
          productName="Plan quota (rolling 5h / 7d buckets)"
          competitorName="Context compression (200K window)"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 200K wall is local. The 429 wall is account-wide.
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Picture two doors in Claude Code, one in front of the other. The first
          door is the <strong>200K-token context window</strong>. It is the size
          of one conversation. When this single chat&apos;s prompt + response +
          file context approaches that ceiling, the model can no longer fit
          everything. Auto-compact triggers; the model summarizes the
          older turns and the conversation continues with a shorter prefix.
          A new chat starts at zero tokens, so this door resets every time you
          run <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">/clear</code>{" "}
          or open a new project.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The second door is <strong>plan quota</strong>. It does not care how
          many tokens are in your current conversation. It cares about the total
          weighted compute your <em>whole Anthropic account</em> has spent in
          the last 5 hours and the last 7 days, summed across every Claude Code
          instance, every browser tab on claude.ai, every IDE extension, every
          machine you are signed in on. Anthropic publishes this as JSON at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>
          , the same endpoint that powers claude.ai/settings/usage. When the
          float in <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">five_hour</code>{" "}
          or <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">seven_day</code>{" "}
          crosses 1.0, every further request from your org returns 429 until
          the bucket bleeds back down.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          A new chat does nothing to this door. <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">/clear</code>{" "}
          does nothing to it. Restarting Claude Code does nothing to it. Logging
          into a different machine does nothing to it. The buckets are
          server-side and per-account.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The data shape: there is no &ldquo;context_window&rdquo; field
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Here is the actual JSON Anthropic returns when you, your browser, or
          a tool like ClaudeMeter calls{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          using the cookie session you already have from claude.ai:
        </p>
        <AnimatedCodeBlock
          code={usageJson}
          language="json"
          filename="GET /api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Notice what is <em>not</em> there. There is no{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            context_window
          </code>{" "}
          field. There is no &ldquo;tokens left in this chat&rdquo; field.
          There is no &ldquo;auto-compact threshold&rdquo; field. The 200K
          context window is the model&apos;s problem, not the account&apos;s,
          and the account-level quota endpoint genuinely has nothing to say
          about it. The Rust struct that backs ClaudeMeter has the same shape:
        </p>
        <div className="mt-6">
          <AnimatedCodeBlock
            code={modelsRsExcerpt}
            language="rust"
            filename="src/models.rs"
          />
        </div>
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          That is the whole data model on the menu-bar side. The 5-hour float,
          the 7-day float, the per-model sub-buckets, the extra-usage block.
          Nothing about the conversation length, because conversation length
          is a different problem solved at a different layer. If a tool claims
          to show both your context-window position and your plan-quota
          position in one number, it is doing something synthetic; the server
          does not return them as the same thing.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The trick everyone misses: compaction itself spends quota
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The most common pop misconception about{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">/compact</code>{" "}
          is that it &ldquo;saves usage&rdquo; or &ldquo;extends the limit.&rdquo;
          It does neither. Compaction is implemented as another LLM call: the
          model is asked to summarize the conversation so far, and the summary
          replaces the original transcript. That summarization call counts
          against your plan quota the same way any other prompt does. Anthropic
          states this directly:
        </p>
        <ProofBanner
          quote="Longer conversations that trigger automatic context management consume more of your usage limit."
          source="Anthropic Help Center, How do usage and length limits work"
          metric="more, not less"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          You can watch this happen on the server in real time. ClaudeMeter
          polls{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          every 30 seconds (POLL_INTERVAL at src/bin/menubar.rs:18). Trigger
          a /compact in one window and watch the menu bar in another. The
          seven_day_opus float ticks up, often by 1 to 2 percent on a heavy
          conversation, because Opus is weighted more heavily than Sonnet
          against the weekly cap and the summarization runs on the same model
          you were using.
        </p>
        <BeforeAfter
          title="A real /compact event measured against the server-truth quota"
          before={{
            label: "Before /compact",
            content:
              "62% of the rolling 5-hour bucket used. 83% of the weekly Opus bucket used. The conversation is 198K tokens, about to hit the 200K context wall. The reader assumes /compact will free up room and that is the end of the cost.",
            highlights: [
              "Context: 198K of 200K. Auto-compact warning fires.",
              "Plan quota: five_hour 62%, seven_day_opus 83%.",
              "ccusage shows the session at 4.1M tokens.",
            ],
          }}
          after={{
            label: "After /compact",
            content:
              "Conversation summarized to 12K tokens. The 200K wall is far away again. But the seven_day_opus float is now 84.2%, 1.2 points higher than before, because the summarization itself was a billed Opus call against the weekly bucket. The next 3 to 5 turns also miss the prompt cache because the prefix changed, paying full input-token rates.",
            highlights: [
              "Context freed: 198K -> 12K (the 200K wall is gone).",
              "Plan quota cost: seven_day_opus 83% -> 84.2%, five_hour 62% -> 64.7%.",
              "Cache cost: next ~3 turns get cache misses, full input-token billing.",
            ],
          }}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The takeaway is not &ldquo;don&apos;t compact.&rdquo; The takeaway is
          that compaction is a quota tax you pay to keep the conversation alive
          past the 200K wall. It is the right move when you genuinely need the
          earlier turns in summary form. It is the wrong move when you only
          need the last few turns; in that case <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">/clear</code>{" "}
          and a fresh chat is free against plan quota and free against the
          context window.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watching it happen on the menu bar
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Here is a real session, two terminals open: Claude Code on the left,
          ClaudeMeter status on the right. Notice that the server-truth quota
          numbers move while the local conversation is being compacted, and
          the move is in the wrong direction for &ldquo;saving&rdquo; quota.
        </p>
        <TerminalOutput
          title="Two terminals, hour 3 of an Opus refactor"
          lines={compactSession}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The /compact freed 186K tokens of context window, which was real
          and necessary. It also spent 1.2% of the weekly Opus bucket and 2.7%
          of the rolling 5-hour bucket on the way. If you only had the
          context-left indicator to look at, you would think compaction was
          pure profit. The plan-quota numbers are the half of the picture
          Claude Code does not show you.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The cache-miss tail that nobody mentions
        </h2>
        <GlowCard>
          <div className="p-2 space-y-4">
            <p className="text-zinc-700 leading-relaxed text-lg">
              Anthropic&apos;s prompt cache keys on an exact prefix match of the
              input tokens. As long as your conversation prefix is stable
              between turns, you pay heavily discounted cache-hit rates on the
              re-sent context. That is the only reason a long Claude Code
              session is economically tolerable; on a 198K-token transcript,
              the un-cached input cost would be brutal every turn.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">/compact</code>{" "}
              rewrites the conversation prefix. The new prefix (a summary plus
              the most recent turns) does not match anything in the cache. The
              next 3 to 5 turns post-compaction therefore get cache misses,
              billing at the full input-token rate. This shows up on the
              server as another 1 to 2 percent dent in the weekly bucket on
              top of the summarization itself, just from the cache-miss tail.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              ccusage cannot disambiguate this from any other usage; in JSONL
              all input tokens look the same. ClaudeMeter cannot disambiguate
              it either, only the server can, and the server does not surface
              cache-hit/cache-miss attribution per turn. But the aggregate
              shows up on the seven_day float, and you can correlate it
              temporally with the compaction event by watching the menu bar.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          So which one should you actually watch?
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Both, on different timescales. The 200K context window is a per-chat
          concern; you keep an eye on it inside Claude Code via the
          &ldquo;context left&rdquo; indicator and you act on it with /compact
          or /clear. The plan quota is a per-week concern; you keep an eye
          on it via claude.ai/settings/usage or a tool that polls the same
          endpoint, and you act on it by switching models, deferring work to
          off-peak hours (Anthropic&apos;s peak-hour multiplier on the 5-hour
          bucket runs 5 to 11 a.m. Pacific weekdays per their March 2026
          statement), or topping up extra-usage credits.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The trap is treating one as a substitute for the other. Compacting
          does not buy you plan quota; clearing does not buy you context;
          starting a new chat does not reset your weekly bucket; topping up
          extra-usage does not give you a bigger context window. Each lever
          moves a different ceiling.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          ClaudeMeter is open source and MIT licensed; the relevant code is
          in <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">src/models.rs</code>{" "}
          (data shape), <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">src/api.rs</code>{" "}
          (the GET to /api/organizations/&#123;org_uuid&#125;/usage), and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">src/bin/menubar.rs</code>{" "}
          (the 30-second polling loop). It only knows about plan quota, not
          context window, on purpose, those are different problems and lumping
          them into one indicator was the original confusion this page is
          trying to undo. Repo:{" "}
          <a
            href="https://github.com/m13v/claude-meter"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            github.com/m13v/claude-meter
          </a>
          .
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The percentage numbers in the example session above are typical for
          an Opus-heavy refactor session, not a guaranteed measurement; the
          exact compaction cost depends on conversation length, model in use,
          and Anthropic&apos;s internal weighting which is not published as a
          formula. The directional claim, that{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">/compact</code>{" "}
          consumes plan quota rather than refunding it, is from Anthropic&apos;s
          own help center. The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          endpoint is undocumented; the published 200K context window and the
          published 5-hour / 7-day plan-quota numbers come from Help Center
          articles, not API contracts. The only thing you can fully trust is
          the float in the JSON, and that is what claude-meter pins to the
          menu bar.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Confused about which limit you are actually hitting? I will look at it with you."
          description="15 minutes. Walk me through your Claude Code week. I will tell you whether the wall you keep hitting is the 200K context window, the rolling 5-hour, the weekly Opus sub-bucket, or extra-usage spillover, and what to switch to so you stop spending quota on the wrong door."
          text="Book a 15-minute call"
          section="context-compression-vs-plan-quota-footer"
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
        description="Stuck between context window and plan quota? 15 min."
        section="context-compression-vs-plan-quota-sticky"
        site="claude-meter"
      />
    </article>
  );
}
