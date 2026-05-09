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
  "https://claude-meter.com/alternative/claude-free-vs-pro-usage-limits";
const PUBLISHED = "2026-05-09";

export const metadata: Metadata = {
  title:
    "Claude Free vs Pro usage limits: one daily cap vs eight server buckets",
  description:
    "Free is one opaque daily-style cap, Sonnet only, no usage page worth checking. Pro is a rolling 5-hour window plus a weekly quota and, on the server, an 8-bucket JSON object that ccusage cannot see and that the Settings page only half-renders. Verified Free vs Pro numbers and the actual data shape.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Free vs Pro usage limits: one daily cap vs eight server buckets",
    description:
      "Pro is officially at least 5x Free, but the bigger change is structural. Free returns nothing useful from the usage endpoint. Pro starts populating eight separate buckets, two of them undocumented, and any one of them can independently throttle you.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Alternatives", url: "https://claude-meter.com/alternative" },
  {
    name: "Free vs Pro usage limits",
    url: PAGE_URL,
  },
];

const faqs = [
  {
    q: "How many messages does Claude Free get per 5 hours vs Claude Pro?",
    a: "Free is roughly 30 short messages on a daily-style reset (Anthropic publishes it as a range, around 30 to 100 in light usage, dropping to 20 to 30 the moment you attach files or run long conversations). Pro is roughly 45 short messages per rolling 5-hour window, plus a separate weekly compute budget. Anthropic's official phrasing is that Pro provides at least 5x the usage of Free per session, and that ratio holds across most days.",
  },
  {
    q: "Is the Free 'daily limit' actually daily?",
    a: "Not exactly. Anthropic does not publish a hard 24-hour reset for the Free tier, the way it publishes a sliding 5-hour window for Pro. In practice it behaves more like a daily-style budget that refills over a 4 to 8 hour band depending on your timezone and load. The point is Free is a single opaque limit; Pro is two clearly named limits (rolling 5-hour and weekly) that you can read off a JSON object.",
  },
  {
    q: "Which models do Free users get vs Pro users?",
    a: "Free is Claude Sonnet only (Sonnet 4.6 as of 2026), with no model picker. Pro adds the model selector and unlocks Opus 4.7 (heavier per byte, the model agentic loops actually want for hard refactors) and Haiku for cheap drafting. The model you pick on Pro materially affects which weekly sub-bucket fills first; Opus byte for byte fills seven_day_opus faster than Sonnet does seven_day_sonnet.",
  },
  {
    q: "Does the Free plan include Claude Code?",
    a: "No. Claude Code is a Pro and Max feature. If you are on Free and want to run Claude as a local coding agent, you have to upgrade to Pro at $20 per month or use the API separately (the API is metered and not covered by either Pro or Max). The moment you turn on Claude Code is also the moment the rolling 5-hour bucket starts mattering, because agentic loops are the workload that pegs it before lunch.",
  },
  {
    q: "Can a Free user even see their usage live?",
    a: "Not in any useful way. claude.ai/settings/usage exists for Free accounts but the underlying /api/organizations/{org_uuid}/usage endpoint largely does not populate the bucket fields a Free user has. The Pro account version of that endpoint returns a JSON object with five_hour and seven_day populated; the Free version returns mostly empty. There is no rolling window to render because Free does not have one.",
  },
  {
    q: "What does Pro actually return that Free does not?",
    a: "Eight optional fields on the same JSON object. ClaudeMeter's Rust deserializer at src/models.rs lines 18 to 28 names them: five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork, plus an extra_usage object for paid overage. On a typical Pro account, two of those populate (five_hour, seven_day). On a Max account with Claude Code, four to five populate. On Free, zero of them populate in any meaningful way. That structural difference, not the message-count multiplier, is what changes about your day.",
  },
  {
    q: "Is Pro at $20 per month actually 5x Free?",
    a: "By Anthropic's official phrasing, Pro is 'at least 5x' the usage of Free per session, plus a weekly compute budget that Free does not have at all. In practice it lands closer to 5x to 10x depending on what you do. A heavy claude.ai writer who only sends short prompts gets a clean 5x. A Claude Code user who triggers agentic loops with attachments and Opus selected gets much more value out of Pro because Free literally cannot run those workflows.",
  },
  {
    q: "Why does upgrading to Pro mean I suddenly need a usage tracker?",
    a: "Because Pro replaces one opaque ceiling with two named ceilings (5-hour, weekly) plus paid overage. On Free you cannot really overspend; you hit the cap, you stop. On Pro you can: blow through the rolling 5-hour and not realize you have crossed onto metered overage until your card statement; or run an Opus-heavy week that pegs seven_day_opus on a Tuesday afternoon while seven_day overall is at 60 percent. ClaudeMeter exists for that gap. Free users do not need it (nothing to track); Pro users do (eight buckets, two undocumented).",
  },
  {
    q: "Does Anthropic peak-hour throttling apply to Free or Pro?",
    a: "Anthropic's March 2026 statement says the company is adjusting the rolling 5-hour window during peak hours of 5 to 11 a.m. Pacific on weekdays, while leaving overall weekly limits unchanged. That multiplier applies to Pro and Max five_hour buckets specifically, because those are the buckets that exist. Free users feel peak hour load mostly as 'priority access goes to paid users first,' not as a quota multiplier; the Free limit itself is not weighted hour by hour.",
  },
  {
    q: "Can ccusage replace ClaudeMeter for telling me about Free vs Pro limits?",
    a: "No. ccusage walks ~/.claude/projects/*.jsonl on disk and totals input_tokens + output_tokens on this machine. That is local Claude Code spend; it is a different question from server quota. ccusage cannot tell you whether you are on Free or Pro, cannot read either the 5-hour or the 7-day bucket, and cannot see browser-chat usage that is depleting the same buckets. Run ccusage for cost, run ClaudeMeter for limits. They answer different questions; many people on Pro run both.",
  },
  {
    q: "Should I upgrade from Free to Pro just for the higher limit?",
    a: "If your Free workflow is occasional short prompts and you almost never run into the cap, no. If you find yourself rationing prompts, switching to ChatGPT mid-task because Claude is locked, attaching files and watching the daily cap halve, or wanting Claude Code at all, yes. Pro is $20 per month for at least 5x the per-session usage, the model picker, Projects, and Claude Code. The honest reason most people upgrade is Claude Code, not the message count.",
  },
];

const comparisonRows = [
  {
    feature: "Per-session message budget",
    competitor:
      "Roughly 30 short messages on a daily-style reset. Long prompts and attachments halve it.",
    ours:
      "Roughly 45 short messages per sliding 5-hour window. Refills continuously as old prompts age out.",
  },
  {
    feature: "Weekly compute budget",
    competitor: "None. Free has no weekly cap, just the daily-style budget.",
    ours:
      "Roughly 40 to 80 hours of Sonnet 4 per rolling 7 days, shared across claude.ai chat, IDE, and Claude Code.",
  },
  {
    feature: "Model selector",
    competitor: "No. Free is Sonnet only (Sonnet 4.6 default in 2026).",
    ours: "Yes. Opus 4.7, Sonnet, Haiku. Opus is heavier per byte against the weekly cap.",
  },
  {
    feature: "Claude Code (local agentic loops)",
    competitor: "Not available.",
    ours: "Included. Draws from the same five_hour and seven_day buckets as the web chat.",
  },
  {
    feature: "Projects, Cowork, Research",
    competitor: "Not available.",
    ours: "Included. File memory across chats, persistent context, multi-doc Research.",
  },
  {
    feature: "Priority access during peak hours",
    competitor: "Last in line during peak.",
    ours: "Higher priority. Peak-hour multiplier applies to the 5-hour bucket only (not weekly).",
  },
  {
    feature: "Server JSON returned by /api/organizations/{org}/usage",
    competitor:
      "Largely empty. Free has no rolling 5-hour and no weekly bucket to render.",
    ours:
      "Eight optional fields populate. five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, plus two undocumented sub-buckets and an extra_usage object.",
  },
  {
    feature: "Paid overage (extra usage)",
    competitor: "Not available. You hit the cap, you wait.",
    ours:
      "Available on Pro. Once enabled you keep prompting after the 5-hour pegs, billed per token. Easy to spend dollars without realizing.",
  },
  {
    feature: "Where to read your live limit",
    competitor:
      "Nowhere useful. The Free Settings, Usage page does not render meaningful progress bars.",
    ours: "claude.ai/settings/usage renders five_hour and seven_day bars from the same JSON ClaudeMeter polls.",
  },
  {
    feature: "Price (US, 2026)",
    competitor: "$0.",
    ours: "$20 per month.",
  },
];

const usageJsonPro = `// GET https://claude.ai/api/organizations/{org_uuid}/usage
// Response on a Pro account, mid-week. Two buckets actively used,
// extra_usage disabled, the seven_day_* sub-buckets are present
// (sometimes empty on Pro, always populated on Max).

{
  "five_hour": {
    "utilization": 0.62,                 // 62% of rolling 5-hour
    "resets_at":   "2026-05-09T22:14:00Z"
  },

  "seven_day": {
    "utilization": 0.41,                 // 41% of weekly compute
    "resets_at":   "2026-05-15T09:02:00Z"
  },

  "seven_day_sonnet": { "utilization": 0.38, "resets_at": "2026-05-15T09:02:00Z" },
  "seven_day_opus":   { "utilization": 0.05, "resets_at": "2026-05-15T09:02:00Z" },
  "seven_day_oauth_apps": null,
  "seven_day_omelette":   null,
  "seven_day_cowork":     null,

  "extra_usage": {
    "is_enabled":   false,
    "monthly_limit": null,
    "used_credits":  null,
    "utilization":   null
  }
}`;

const usageJsonFree = `// GET https://claude.ai/api/organizations/{org_uuid}/usage
// Response on a Free account. The endpoint is reachable but most
// quota fields are not populated, because Free does not have a
// rolling 5-hour window or a weekly bucket on the server.

{
  "five_hour":            null,
  "seven_day":            null,
  "seven_day_sonnet":     null,
  "seven_day_opus":       null,
  "seven_day_oauth_apps": null,
  "seven_day_omelette":   null,
  "seven_day_cowork":     null,
  "extra_usage":          null
}`;

const modelsRsExcerpt = `// claude-meter/src/models.rs lines 18-28
//
// Eight optional buckets, every one nullable. ClaudeMeter assumes
// nothing about which fields populate; it just renders whichever
// the server fills in. That is why the same code path handles a
// Free account (nothing to render), a Pro account (two buckets),
// and a Max account with Claude Code (four to five buckets).

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:            Option<Window>,
    pub seven_day_sonnet:     Option<Window>,
    pub seven_day_opus:       Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,
}`;

const proMenuBarSession = [
  { type: "command" as const, text: "$ claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter (account: Pro $20/mo)" },
  { type: "output" as const, text: "==================================" },
  { type: "output" as const, text: "5-hour            62.0% used    -> resets Sat May 9 22:14 (in 1h)" },
  { type: "output" as const, text: "7-day all         41.0% used    -> resets Fri May 15 09:02 (in 6d)" },
  { type: "output" as const, text: "7-day Sonnet      38.0% used    -> resets Fri May 15 09:02 (in 6d)" },
  { type: "output" as const, text: "7-day Opus         5.0% used    -> resets Fri May 15 09:02 (in 6d)" },
  { type: "output" as const, text: "Extra usage       disabled" },
  { type: "output" as const, text: "" },
  { type: "success" as const, text: "Pro account, both walls comfortable. Opus barely touched this week." },
];

const freeMenuBarSession = [
  { type: "command" as const, text: "$ claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter (account: Free)" },
  { type: "output" as const, text: "============================" },
  { type: "error" as const, text: "no quota fields returned by claude.ai/api/organizations/{org}/usage" },
  { type: "output" as const, text: "Free accounts do not have a rolling 5-hour bucket or a weekly bucket" },
  { type: "output" as const, text: "to render. Upgrade to Pro to enable usage tracking." },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-usage-limit",
    title: "Claude Pro usage limit: the eight buckets the server actually tracks",
    excerpt:
      "The verified Pro limits, the bucket field names, and which one is most likely to trip first on a typical Pro week.",
    tag: "Reference",
  },
  {
    href: "/alternative/claude-code-rolling-5-hour-vs-weekly-quota",
    title: "Claude Code rolling 5-hour vs weekly quota",
    excerpt:
      "Two separate caps on the same JSON object. Either one can independently 429 your Claude Code loop while the other sits at zero.",
    tag: "Comparison",
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
    "Claude Free vs Pro usage limits: one daily cap vs eight server buckets",
  description:
    "Pro is officially at least 5x Free, but the bigger change is structural. Free returns nothing useful from the usage endpoint. Pro starts populating eight separate buckets, two of them undocumented, and any one can independently throttle the account.",
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

export default function ClaudeFreeVsProUsageLimitsPage() {
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
          Claude <GradientText>Free vs Pro</GradientText> usage limits: one daily cap vs eight server buckets
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Most comparisons of Free vs Pro come down to a single number: Free is roughly 30 short messages, Pro is roughly 45 per rolling 5-hour window. That is the official 5x answer and it is correct as far as it goes. The thing it misses is that Pro is not just a bigger ceiling. It is a different shape: two named windows on the server, paid overage on top, model selection that changes which sub-bucket fills first. Below is what each tier actually returns from the same internal endpoint, and why upgrading is the moment you start needing a tracker.
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-09)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            Claude <strong>Free</strong> is one opaque, daily-style cap (about 30 short messages, dropping to 20 to 30 the moment you attach files), Sonnet only, no Claude Code, no Projects, no model picker. Claude <strong>Pro</strong> at $20 per month is officially {" "}
            <a
              href="https://support.claude.com/en/articles/8325606-what-is-the-pro-plan"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              at least 5x the per-session usage
            </a>{" "}
            (about 45 short messages per <em>rolling 5-hour window</em>), plus a separate weekly compute budget (~40 to 80 hours of Sonnet 4), plus the model selector (Opus 4.7, Sonnet, Haiku), Projects, Cowork, Research, and Claude Code. Structurally, Pro adds two named limits where Free has one. The verified numbers come from{" "}
            <a
              href="https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              Anthropic&apos;s usage and length limits help center
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
          Side by side, every dimension that actually changes
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The 5x message multiplier is one row in this table. The other nine rows are why people upgrade.
        </p>
        <ComparisonTable
          productName="Claude Pro ($20/mo)"
          competitorName="Claude Free ($0)"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the server actually returns on each tier
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Every time you load{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          your browser fetches{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          using your existing session cookie. The response shape is identical across tiers; what changes is which fields are populated. On a typical Pro account, two of the buckets are non-null. On a Free account, the response is essentially empty for quota purposes:
        </p>
        <h3 className="text-xl font-semibold text-zinc-900 mb-3 mt-8">Pro account response</h3>
        <AnimatedCodeBlock
          code={usageJsonPro}
          language="json"
          filename="GET /api/organizations/{org_uuid}/usage  (Pro)"
        />
        <h3 className="text-xl font-semibold text-zinc-900 mb-3 mt-8">Free account response</h3>
        <AnimatedCodeBlock
          code={usageJsonFree}
          language="json"
          filename="GET /api/organizations/{org_uuid}/usage  (Free)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          That is the whole structural story. Pro has rolling-window state to track. Free has a per-session cap that the server enforces but does not surface as a sliding bucket. There is nothing for a meter to render on Free, and that is not a missing feature; it is what the tier is.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The Rust struct that handles all three tiers
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter parses the response with one struct, eight optional fields. That is also the shape of the comparison: zero of them populate on Free, two on Pro, four to five on Max. You do not configure the tier anywhere in the app. The deserializer reads what is there and renders only the buckets that exist.
        </p>
        <AnimatedCodeBlock
          code={modelsRsExcerpt}
          language="rust"
          filename="src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Two of those fields ({" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_omelette
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_cowork
          </code>
          ) are internal Anthropic codenames not documented anywhere public; they only appear in the JSON the Settings page itself fetches. ClaudeMeter surfaces them in the dropdown so when one of them is what blocked you, you actually see it.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why upgrading is the moment you start needing a tracker
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          On Free you cannot really overspend. The cap is a single number, you hit it, you stop. There is nothing a tracker would help you optimize. On Pro that changes in three ways at once:
        </p>
        <GlowCard>
          <div className="p-2 space-y-4">
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>Two limits, not one.</strong> The rolling 5-hour and the weekly compute budget are sibling fields on the same JSON. Either one independently 429s you. The 5-hour resets continuously as old prompts age out, the weekly hardly moves because seven days absorbs most idle time. People hit the 5-hour wall during a long refactor, then come back the next day and hit the weekly cap by Tuesday because Claude Code agentic loops chew through compute hours faster than chat does.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>Model selection makes the buckets unequal.</strong> Opus is heavier per byte than Sonnet against the weekly cap. An Opus-heavy week pegs{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                seven_day_opus
              </code>{" "}
              while{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                seven_day
              </code>{" "}
              overall is at 60 percent. The fix (switch the model to Sonnet for the rest of the week) is invisible without a per-model breakdown.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>Paid overage exists.</strong> Once you opt in to extra-usage on Pro, you keep prompting after the 5-hour pegs at 100%, but the requests draw from a separate dollar balance instead. Without a meter, this is invisible until your card statement. Free does not have this failure mode; Pro does.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What ClaudeMeter shows on each tier
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Same binary, same brew install, two different outputs depending on which session cookie the extension picks up. The Pro view is what most readers came here for; the Free view is included so you know what to expect if you install before upgrading.
        </p>
        <h3 className="text-xl font-semibold text-zinc-900 mb-3 mt-6">Pro account, mid-week</h3>
        <TerminalOutput title="claude-meter status (Pro $20/mo)" lines={proMenuBarSession} />
        <h3 className="text-xl font-semibold text-zinc-900 mb-3 mt-8">Free account</h3>
        <TerminalOutput title="claude-meter status (Free)" lines={freeMenuBarSession} />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          This is the honest answer to &ldquo;does ClaudeMeter help on Free?&rdquo; No. The data source does not exist on that tier. ClaudeMeter is a Pro and Max tool because Pro and Max are the tiers Anthropic actually exposes a quota state for.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          When Free is the right answer, and when it is not
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The 5x multiplier is real but it is the wrong axis to evaluate the upgrade on. The correct axis is workflow:
        </p>
        <ul className="space-y-3 text-zinc-700 leading-relaxed text-lg ml-6 list-disc">
          <li>
            <strong>Stay on Free</strong> if your usage is occasional short prompts, no file attachments, no agentic loops, and you almost never hit the cap. Free is a generous tier for casual chat and one-off questions.
          </li>
          <li>
            <strong>Upgrade to Pro ($20/mo)</strong> the moment you find yourself rationing prompts, switching to ChatGPT mid-task because Claude is locked out, attaching files (which halves the Free budget), or wanting Claude Code at all. The upgrade is rarely about the message count itself; it is about Claude Code, the model picker, and Projects.
          </li>
          <li>
            <strong>Upgrade past Pro to Max ($100 or $200/mo)</strong> only when you are running Claude Code in agentic loops several hours a day and hitting the rolling 5-hour wall before lunch on a Pro plan. Max 5x is roughly 225 short messages per 5-hour window and 140 to 280 hours per week; Max 20x is roughly 900 messages per 5-hour and 240 to 480 hours per week.
          </li>
        </ul>
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Whichever paid tier you land on, the structural story is the same: more buckets, more sub-buckets, more reasons to surface the live numbers somewhere you can glance at.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The {" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          endpoint is undocumented. The published Anthropic numbers (Pro ~45 messages per 5 hours, ~40 to 80 weekly hours, Free ~30 messages on a daily-style reset) come from the Help Center as ranges, not contracts. Anthropic adjusted the weekly buckets multiple times since announcing weekly caps in mid-2025; the actual fraction the server checks is a weighted internal float with no published formula. The only thing you can really trust is the float in the JSON, which is why the data shape matters more than the headline number. ClaudeMeter declares every nullable field as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option
          </code>{" "}
          in Rust, so when Anthropic adds, removes, or renames a sub-bucket, the next brew release patches it in one line. macOS only today (12+); Safari is not yet supported. The repo is open at{" "}
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
          heading="On the fence about upgrading? Want me to look at your week with you?"
          description="15 minutes. Walk me through how often you are hitting the Free cap and what you do when it locks. I will tell you whether Pro is the right move and which bucket would have been the actual constraint."
          text="Book a 15-minute call"
          section="claude-free-vs-pro-usage-limits-footer"
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
        description="Free vs Pro upgrade question? 15 min."
        section="claude-free-vs-pro-usage-limits-sticky"
        site="claude-meter"
      />
    </article>
  );
}
