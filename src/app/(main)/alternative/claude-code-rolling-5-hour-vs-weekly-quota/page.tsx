import type { Metadata } from "next";
import {
  Breadcrumbs,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  GlowCard,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/alternative/claude-code-rolling-5-hour-vs-weekly-quota";
const PUBLISHED = "2026-05-06";

export const metadata: Metadata = {
  title:
    "Claude Code rolling 5-hour vs weekly quota: what they actually are, and which one 429s you",
  description:
    "Two separate caps. The rolling 5-hour is a sliding burst limit (~45 messages on Pro, resets continuously as old prompts age out). The weekly quota is a 7-day compute ceiling (~40-80h on Pro, shared across claude.ai chat, IDE, and Claude Code). On the server they are sibling fields on the same JSON, and either can independently kill your loop.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code rolling 5-hour vs weekly quota: what they actually are, and which one 429s you",
    description:
      "The rolling 5-hour and the weekly quota are two separate caps on the same JSON object claude.ai returns. Here is what each one measures, when each one bites, and why ccusage cannot see either of them.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Alternatives", url: "https://claude-meter.com/alternative" },
  {
    name: "Rolling 5-hour vs weekly quota",
    url: PAGE_URL,
  },
];

const faqs = [
  {
    q: "What is the rolling 5-hour window in Claude Code?",
    a: "It is a sliding 5-hour budget that fills as you prompt and drains as your oldest prompts age past the 5-hour mark. The clock starts on your first prompt of a session, and at any moment the bucket measures the cost of all activity in the last 5 hours, weighted by model class, attachments, tool calls, and a peak-hour multiplier Anthropic announced in late 2025. On the server it is the float in the five_hour.utilization field of /api/organizations/{org_uuid}/usage. When that float crosses 1.0 every further request from your org returns 429 until the earliest unexpired prompt ages out.",
  },
  {
    q: "What is the weekly quota in Claude Code?",
    a: "It is a 7-day rolling ceiling on total compute hours across your account. Anthropic introduced the weekly cap on August 28, 2025 and tightened enforcement through early 2026. Pro is roughly 40 to 80 hours per week, Max 5x is 140 to 280, Max 20x is 240 to 480. On the server it is the seven_day field in the same JSON; on Max plans you also get seven_day_sonnet and seven_day_opus as sub-buckets. The weekly quota is shared: claude.ai chat, the IDE extension, and Claude Code all draw from it.",
  },
  {
    q: "How are the two limits actually different?",
    a: "Window length and what they cap. The 5-hour window caps burst usage in a sliding 5-hour band; it is meant to keep one user from saturating the cluster in a sprint. The weekly quota caps total compute hours over a sliding 7-day band; it is meant to keep heavy users from saturating the cluster across an entire workweek. Practically, the 5-hour window resets visibly throughout the day (you watch its resets_at slide forward in real time), while the weekly bucket basically never falls because seven days is long enough that even an idle weekend barely moves the boundary. Either one can independently 429 you, even if the other is at zero.",
  },
  {
    q: "If I am hitting only one of them, which one is it usually?",
    a: "On Pro, it is overwhelmingly the rolling 5-hour. Pro lets through enough weekly hours that most people only run out of them on extreme weeks. On Max with Claude Code agentic loops, both happen, often in the same session. People hit the 5-hour wall during a long refactor at hour three, then come back the next day and hit the weekly cap by Tuesday afternoon because the agentic loops chew through compute hours faster than any chat workflow does. The seven_day_opus sub-bucket is the most common Max-plan failure: Opus is heavier per byte, so an Opus-heavy week pegs that one even when seven_day overall is fine.",
  },
  {
    q: "Does ccusage tell me where I stand on either limit?",
    a: "No, not directly. ccusage walks ~/.claude/projects/*.jsonl on disk and totals input_tokens + output_tokens for sessions on this machine. That is a reasonable proxy for raw token spend on Claude Code only, but the 5-hour and 7-day floats are server-side, weighted, and include browser-chat usage that is not on disk anywhere. ccusage at 5% of estimated spend while the 5-hour bar is at 100% used is a real, frequent state. ccusage is excellent for cost attribution; it is not a faithful proxy for the limits the server actually enforces.",
  },
  {
    q: "Where do I see both numbers without typing /usage every time?",
    a: "claude.ai/settings/usage in a browser tab is the official surface; both rows render there. /usage inside Claude Code is a one-shot dump that scrolls off as soon as you keep prompting. For an always-visible readout, ClaudeMeter polls /api/organizations/{org_uuid}/usage every 60 seconds (POLL_INTERVAL at src/bin/menubar.rs:18, POLL_MINUTES at extension/background.js:3) and pins both rows plus the Opus and Sonnet sub-buckets to the macOS menu bar. Same endpoint, same numbers, different surface.",
  },
  {
    q: "Do the two limits reset at the same time?",
    a: "No. They each carry their own resets_at field in the JSON. The 5-hour resets_at slides every time you stop prompting and an old message ages out; in a quiet hour you can watch it tick down. The 7-day resets_at also slides, but in 7-day chunks of activity, so it usually looks more like a hard wall than a sliding window. ClaudeMeter prints both timestamps in the dropdown (-> resets Tue May 5 18:00 (in 2h)) and you trust those, not your wall clock.",
  },
  {
    q: "Does Anthropic peak-hour throttling affect both limits the same way?",
    a: "Per Anthropic's March 2026 statement, the company has been adjusting the 5-hour window during peak hours of 5 to 11 a.m. Pacific on weekdays, while leaving overall weekly limits unchanged. So during peak hours the 5-hour bucket fills faster than the same prompts would fill it at midnight, but the seven_day bucket does not get the same multiplier. If you keep getting 5-hour walls before noon Pacific and they go away at night, that is the peak-hour multiplier, not your prompts changing.",
  },
  {
    q: "Is the rolling 5-hour per-machine or per-account?",
    a: "Per-account, more precisely per-organization. The five_hour bucket is computed on the server and keyed off your org_uuid. If you run Claude Code on a laptop and a desktop logged into the same Anthropic account, both deplete the same bucket. If you also chat in a browser, that adds to the same bucket. Same applies to the seven_day bucket. ccusage on one machine cannot see the other machines or the browser, which is one reason its number drifts from the server number on multi-machine days.",
  },
  {
    q: "I have extra-usage credits enabled. Does that change either limit?",
    a: "Once you opt in to metered overage on Max, you keep getting prompts after the 5-hour bucket pegs at 100%, but the requests draw from your extra_usage credit balance instead. The seven_day bucket still applies. ClaudeMeter has a separate Extra usage row in the menu bar dropdown, so you can tell rolling-window-pegged-but-spending-dollars-fine apart from rolling-window-pegged-and-fully-blocked. Without that distinction the surprise is figuring out at month end that you spent 200 dollars on overage you did not realize you were on.",
  },
];

const comparisonRows = [
  {
    feature: "What it caps",
    competitor:
      "Burst usage. A weighted utilization fraction that fills as you prompt and drains as old prompts age past the 5-hour mark.",
    ours: "Total compute over a 7-day rolling band. Pro is roughly 40 to 80 hours per week, Max 5x is 140 to 280, Max 20x is 240 to 480.",
  },
  {
    feature: "Window length",
    competitor: "Sliding 5 hours. resets_at moves continuously as messages age out.",
    ours: "Sliding 7 days. resets_at also moves but the bucket rarely falls since 7 days absorbs most idle time.",
  },
  {
    feature: "Server JSON field",
    competitor: "five_hour.utilization (float between 0 and 1, sometimes 0 and 100 in the same payload) and five_hour.resets_at (ISO timestamp).",
    ours: "seven_day.utilization and seven_day.resets_at, plus seven_day_sonnet and seven_day_opus on Max plans, plus seven_day_oauth_apps on accounts using Claude Code.",
  },
  {
    feature: "When it bites you on Pro",
    competitor: "Often. Plan limits ~45 messages per 5-hour window, and a long Opus message with attachments can be 5 to 10 of those.",
    ours: "Rare on Pro unless you push 6+ hours of activity per day across the whole week.",
  },
  {
    feature: "When it bites you on Max with Claude Code",
    competitor: "On long agentic loops at hour 3 of a session.",
    ours: "On Tuesday afternoon, especially the seven_day_opus sub-bucket, because Opus is heavier per byte than Sonnet.",
  },
  {
    feature: "Does ccusage see it?",
    competitor: "No. ccusage reads local JSONL token totals; the server-side weighting and browser-chat usage are invisible to it.",
    ours: "No. Same reason. Plus the weekly weighting includes oauth-app traffic and other surfaces that never write to ~/.claude/projects.",
  },
  {
    feature: "Effect of peak-hour multiplier",
    competitor: "Yes (per Anthropic March 2026: weekdays 5 to 11 a.m. Pacific). The same prompts fill it faster during peak.",
    ours: "No. Anthropic statement explicitly leaves overall weekly limits unchanged.",
  },
  {
    feature: "Visible in /usage inside Claude Code?",
    competitor: "Yes, as a session percentage.",
    ours: "Yes, as a week percentage. Plus extra-usage balance if you opted in.",
  },
];

const usageJson = `// GET https://claude.ai/api/organizations/{org_uuid}/usage  (formatted)
//
// Both limits live on the same JSON object. They are sibling fields,
// not a parent/child relationship. Either one independently 429s you.

{
  "five_hour": {
    "utilization": 0.78,                 // 78% of the rolling 5-hour bucket
    "resets_at":   "2026-05-06T22:14:00Z"  // slides every time a prompt ages out
  },

  "seven_day": {
    "utilization": 0.62,                 // 62% of weekly compute hours
    "resets_at":   "2026-05-12T09:02:00Z"  // 7 days from your oldest prompt
  },

  "seven_day_sonnet": {
    "utilization": 0.48,
    "resets_at":   "2026-05-12T09:02:00Z"
  },

  "seven_day_opus": {
    "utilization": 0.91,                 // Max-plan sub-bucket; the most common 429 cause
    "resets_at":   "2026-05-12T09:02:00Z"
  },

  "extra_usage": {
    "is_enabled":   true,
    "monthly_limit": 5000,               // cents
    "used_credits":   420,               // cents
    "utilization":  0.084
  }
}`;

const modelsRsExcerpt = `// claude-meter/src/models.rs
//
// Both buckets are the same Rust struct. The semantic difference
// (sliding 5h burst cap vs sliding 7d weekly cap) is purely about
// what the server measures, not about the data shape.

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
    pub seven_day_omelette:  Option<Window>,
    pub seven_day_cowork:    Option<Window>,
    pub extra_usage:         Option<ExtraUsage>,
}`;

const backgroundJsExcerpt = `// claude-meter/extension/background.js
//
// The badge color is decided by the worse of the 5-hour and 7-day
// utilization. If either one is at 100%, the badge is red and the
// next agentic loop will 429 even if the other is at 0%.

function worstPct(snaps, key) {
  let worst = null;
  for (const s of snaps) {
    if (!s.usage) continue;
    const v = pctFromWindow(s.usage[key]);
    if (v != null && (worst == null || v > worst)) worst = v;
  }
  return worst;
}

const five  = worstPct(snaps, "five_hour");
const seven = worstPct(snaps, "seven_day");

chrome.action.setBadgeBackgroundColor({
  color: (five ?? 0) >= 100 ? "#b00020"
       : (five ?? 0) >= 80  ? "#b26a00"
                            : "#2c6e2f",
});`;

const menuBarSession = [
  { type: "command" as const, text: "$ claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour            78.0% used    -> resets Tue May 6 22:14 (in 2h)" },
  { type: "output" as const, text: "7-day all         62.0% used    -> resets Tue May 12 09:02 (in 5d)" },
  { type: "output" as const, text: "7-day Sonnet      48.0% used    -> resets Tue May 12 09:02 (in 5d)" },
  { type: "output" as const, text: "7-day Opus        91.0% used    -> resets Tue May 12 09:02 (in 5d)" },
  { type: "output" as const, text: "Extra usage       $4.20 / $50.00 (8%)" },
  { type: "output" as const, text: "" },
  { type: "success" as const, text: "5-hour fine, weekly Opus near the wall. Switch to Sonnet today." },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-weekly-cap-rolling-5-hour-window-tracker",
    title: "Claude Pro weekly cap on top of the rolling 5-hour window",
    excerpt:
      "Why the in-app indicator only flips between low and reset, what the server actually returns for the weekly bucket, and how to surface the float you cannot see.",
    tag: "Diagnosis",
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
      "ccusage measures local Claude Code tokens off disk. ClaudeMeter measures plan quota off claude.ai. They answer different questions; many users run both.",
    tag: "Comparison",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code rolling 5-hour vs weekly quota: what they actually are, and which one 429s you",
  description:
    "The rolling 5-hour caps burst usage in a sliding 5-hour window (~45 messages on Pro). The weekly quota caps total compute over a sliding 7 days (~40-80h on Pro). On the server they are sibling fields on the same JSON, and either can independently kill your Claude Code loop. Grounded in the actual code paths claude-meter uses to read both.",
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

export default function RollingFiveHourVsWeeklyQuotaPage() {
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
          Claude Code rolling 5-hour{" "}
          <GradientText>vs weekly quota</GradientText>: what they actually are, and which one 429s you
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Two separate caps. Either one can independently 429 your Claude Code
          loop while the other sits at zero. Most explanations on this topic
          treat them as variations of the same limit. They are not. They cap
          different things, slide on different time bands, and on the server
          they are sibling fields on the same JSON object claude.ai returns.
          Here is what each one is, when each one bites, and the actual code
          inside claude-meter that reads both.
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-06)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            The <strong>rolling 5-hour</strong> caps burst usage in a sliding
            5-hour band that resets continuously as old prompts age out
            (roughly 45 messages on Pro, 225 on Max 5x, 900 on Max 20x). The{" "}
            <strong>weekly quota</strong> caps total compute hours over a
            sliding 7-day band (roughly 40 to 80 hours on Pro, 140 to 280 on
            Max 5x, 240 to 480 on Max 20x). On the server they are separate
            fields (
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              five_hour
            </code>{" "}
            and{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day
            </code>
            ) on the same{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /api/organizations/&#123;org&#125;/usage
            </code>{" "}
            JSON. Either one independently 429s your Claude Code loop. Source:{" "}
            <a
              href="https://www.anthropic.com/news/updated-rate-limits"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              Anthropic&apos;s August 28, 2025 announcement
            </a>{" "}
            and the same internal endpoint{" "}
            <a
              href="https://claude.ai/settings/usage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              claude.ai/settings/usage
            </a>{" "}
            renders.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Side by side
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Same plan, same JSON. Two columns of behavior the documentation hides
          behind one phrase (&ldquo;rate limits&rdquo;).
        </p>
        <ComparisonTable
          productName="Weekly quota (seven_day)"
          competitorName="Rolling 5-hour (five_hour)"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Both limits, one JSON
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The clearest way to see the difference is to look at what claude.ai
          actually sends back. Every time the Settings page loads, your browser
          fetches{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          using your existing session cookie. The response is one JSON object
          with both buckets on it. Below is a real-shaped payload (with
          numbers swapped to a typical Max-plan day):
        </p>
        <AnimatedCodeBlock
          code={usageJson}
          language="json"
          filename="GET /api/organizations/{org_uuid}/usage"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Notice that{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>{" "}
          have the exact same shape: a utilization float and a resets_at
          timestamp. The semantic difference (5-hour burst cap vs 7-day compute
          ceiling) is invisible at the data layer. That is why a Rust struct
          that knows how to parse one knows how to parse the other:
        </p>
        <div className="mt-6">
          <AnimatedCodeBlock
            code={modelsRsExcerpt}
            language="rust"
            filename="src/models.rs"
          />
        </div>
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Both fields are{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option&lt;Window&gt;
          </code>{" "}
          because either one can be missing on certain plan tiers. The
          server-side check that 429s your request looks at whichever bucket
          you crossed first.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Which one is about to bite
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The browser extension picks the worst of the two for the toolbar
          badge color. If either one is at 100%, your next request is going to
          429, regardless of how empty the other one is. The full code is
          eight lines:
        </p>
        <AnimatedCodeBlock
          code={backgroundJsExcerpt}
          language="javascript"
          filename="extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          So when ClaudeMeter shows 78% green in the menu bar, what it is
          really saying is &ldquo;the worse of (5-hour, 7-day) is 78%.&rdquo;
          You open the dropdown to see which one is which, and to see the Opus
          and Sonnet sub-buckets that are usually the actual cause on Max.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          A real Max-plan workday
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Below is what the dropdown looks like on a typical Tuesday afternoon
          for someone running Claude Code in agentic loops on Max. The 5-hour
          bucket is fine, but the weekly Opus sub-bucket is at 91%. If you do
          not look at the breakdown, the menu bar badge says 78 (the worse of
          5-hour at 78 and 7-day overall at 62) and you assume you are fine.
          You start an Opus refactor and 429 within a hundred prompts.
        </p>
        <TerminalOutput title="claude-meter status, Tuesday 4 p.m." lines={menuBarSession} />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The lesson: the 5-hour and the 7-day are not stand-ins for each
          other, and on Max the 7-day Opus row is the one to watch. Switch to
          Sonnet for the rest of the week and the Opus bucket bleeds back down
          while Sonnet picks up the slack.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Three real failure modes (each one a different bucket)
        </h2>
        <GlowCard>
          <div className="p-2 space-y-4">
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>Pro user, 11 a.m. Pacific Tuesday:</strong> Claude Code
              dies mid-refactor with &ldquo;message limit reached.&rdquo; The
              5-hour bucket is at 100%, the 7-day is at 18%. This is the
              peak-hour multiplier (Anthropic March 2026: 5 to 11 a.m. Pacific
              weekdays). Your same prompt count would have left you at maybe
              60% of the 5-hour at midnight. Wait two hours, the 5-hour
              resets_at slides forward, and you are back in.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>Max user, Tuesday 4 p.m.:</strong> No 5-hour wall yet,
              but every prompt 429s. The 5-hour bucket is at 78%, the
              seven_day_opus sub-bucket is at 100%. The weekly Opus cap hit
              before the rolling 5-hour did. resets_at on seven_day_opus is
              five days out. You are not getting your Opus loop back this
              week; the only fix is to switch the model to Sonnet (or Haiku)
              for the rest of the week and let Opus age out.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>Max user with extra-usage on, Friday 8 p.m.:</strong>{" "}
              Looks identical to scenario 2 from the outside, but the dropdown
              shows Extra usage at $73 / $200 and prompts are still going
              through. The 5-hour was pegged at noon, you flipped over to
              metered overage without realizing, and you have been spending
              dollars per prompt for 8 hours. ccusage shows $0 because metered
              overage is not in JSONL. The Extra usage row in the menu bar is
              the only place this is visible without logging into the billing
              page.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why ccusage cannot tell you which one is biting
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ccusage is excellent at what it does: walking{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/*.jsonl
          </code>{" "}
          and totalling input_tokens + output_tokens for sessions on this
          machine. Cost per pull request, cost per session, model mix, all
          easy. But neither the 5-hour nor the 7-day is a token count. They
          are weighted utilization fractions on the server, and the server
          weights them with three things ccusage cannot see:
        </p>
        <ul className="space-y-3 text-zinc-700 leading-relaxed text-lg ml-6 list-disc">
          <li>
            <strong>The peak-hour multiplier</strong> on the 5-hour bucket
            (5 to 11 a.m. Pacific weekdays per Anthropic). Same byte count,
            different multiplier.
          </li>
          <li>
            <strong>Claude.ai chat usage and IDE-extension usage</strong>{" "}
            both deplete the same buckets but never write to{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              ~/.claude/projects
            </code>
            .
          </li>
          <li>
            <strong>Per-model weighting</strong> on the seven_day_opus and
            seven_day_sonnet sub-buckets. An Opus byte is heavier than a
            Sonnet byte against the weekly cap.
          </li>
        </ul>
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Run ccusage for cost. Run claude-meter for limits. They answer
          different questions and the answers can drift by 30 to 40 points
          while both are correct.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          endpoint is undocumented. The published Anthropic numbers (Pro ~45
          messages per 5 hours, ~40 to 80 weekly hours, etc.) come from the
          Help Center as ranges, not contracts; the actual fraction the server
          checks is a weighted internal float with no published formula. The
          only thing you can really trust is the float in the JSON. ClaudeMeter
          declares every nullable field as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option
          </code>{" "}
          in Rust, so when Anthropic adds, removes, or renames a sub-bucket,
          the next brew release patches it in one line. macOS only today (12+);
          Safari is not yet supported. The repo is open at{" "}
          <a
            href="https://github.com/m13v/claude-meter"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            github.com/m13v/claude-meter
          </a>{" "}
          if you want to see exactly what it sends.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Hitting both walls? Want me to look at your usage with you?"
          description="15 minutes. Walk me through your Claude Code week. I will tell you which bucket is the actual problem and what to switch to so you stop blowing through the wrong one."
          text="Book a 15-minute call"
          section="rolling-5h-vs-weekly-quota-footer"
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
        description="Questions on the 5-hour wall vs the weekly cap? 15 min."
        section="rolling-5h-vs-weekly-quota-sticky"
        site="claude-meter"
      />
    </article>
  );
}
