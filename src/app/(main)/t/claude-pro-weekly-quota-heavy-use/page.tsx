import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  ComparisonTable,
  StepTimeline,
  GlowCard,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-pro-weekly-quota-heavy-use";
const PUBLISHED = "2026-05-10";

export const metadata: Metadata = {
  title:
    "Claude Pro weekly quota and 'heavy use' rate limit: the 80% threshold the tracker ships",
  description:
    "Anthropic estimates 40 to 80 hours of Sonnet per week on Pro, but never names the threshold for 'heavy use'. ClaudeMeter does: utilization >= 80% on any of up to seven separate 7-day buckets turns amber, >= 100% throttles. Here is the line in the code, and the six other weekly buckets every guide forgets to mention.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Pro weekly quota and 'heavy use' rate limit: the 80% threshold the tracker ships",
    description:
      "'Heavy use' isn't published; it's an 80% amber / 100% red trigger on up to seven independent 7-day buckets. The code line, the bucket list, and how to read your own number.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  {
    name: "Claude Pro weekly quota and heavy use rate limit",
    url: PAGE_URL,
  },
];

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Claude Pro weekly quota and heavy use rate limit" },
];

const faqs = [
  {
    q: "What is the Claude Pro weekly quota in plain numbers?",
    a: "Anthropic's support article on usage limits gives a range, not a counter: roughly 40 to 80 hours of Sonnet 4 per rolling 7-day window on the $20/month Pro plan, with a smaller 5-hour rolling sub-window inside it. The reason it's a range is that the limiter scores prompts by model weight, peak-hour multiplier, and message complexity, then writes the result into a utilization fraction. You hit the wall when that fraction crosses 1.0 on any bucket, not when you cross a fixed hour count.",
  },
  {
    q: "What counts as 'heavy use'?",
    a: "Operationally, utilization at or above 80% on any weekly bucket. That is the threshold ClaudeMeter's popup paints amber, and it's the threshold the toolbar badge switches color on. Source: extension/popup.js line 31 `v >= 100 ? \"hot\" : v >= 80 ? \"warn\" : \"\"` and extension/background.js line 87 (the same numbers driving the badge background color). Anthropic doesn't publish a 'heavy' tier, but 80% is the inflection where you have to start budgeting the rest of the rolling 168 hours.",
  },
  {
    q: "Isn't 'the weekly quota' a single number?",
    a: "No. The /api/organizations/{org}/usage JSON has up to seven separate 7-day buckets: seven_day (overall), seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork, and the rolling 5-hour bucket that interacts with all of them. Source: src/models.rs lines 20-26 in the ClaudeMeter repo. Each has its own utilization and resets_at. The badge picks the worst-case across all of them because any one at 100% throttles your next prompt with the same generic 'rate_limit_error' string.",
  },
  {
    q: "Why does Claude Code keep failing when claude.ai shows me under quota?",
    a: "Two reasons. First, Claude Code traffic lands in seven_day_oauth_apps in addition to seven_day. If oauth_apps is at 100% you get throttled even though the overall row reads 70%. Second, the 5-hour rolling sub-window resets independently; you can be fine on the weekly view and still hit the wall mid-refactor because five_hour spiked from a long Opus run. ClaudeMeter renders both rows so you can see which bucket actually fired.",
  },
  {
    q: "How do I read the exact percent without a tracker?",
    a: "Open claude.ai, sign in, open DevTools (Cmd+Option+I), Network tab, visit claude.ai/settings/usage. Filter for 'usage'. Open the request to /api/organizations/<uuid>/usage and look at the JSON response. Each bucket has a utilization field (0 to 1, sometimes 0 to 100; popup.js normalizes with `u <= 1 ? u * 100 : u`) and a resets_at ISO timestamp. The Settings page shows you the same numbers in human form, but rounds them; the JSON has the float.",
  },
  {
    q: "Does ccusage answer this question?",
    a: "No. ccusage reads ~/.claude/projects/<project>/<session>.jsonl on disk and sums tokens per Claude Code turn. That is a faithful local-log signal for Claude Code only, and it has no access to the per-model weights, peak-hour multiplier, or browser-chat usage the server folds into the weekly utilization fractions. ccusage at 5% next to claude.ai at 71% is normal: two ledgers, two ledger sources, neither replaces the other. ClaudeMeter is a separate tool for the server-side number; the two coexist.",
  },
  {
    q: "Will dropping to Sonnet only stop the weekly wall from firing?",
    a: "It slows it. seven_day_opus and seven_day_sonnet are weighted differently inside the overall seven_day bucket, and Opus consumes the cap faster per minute of generation. But seven_day is a single fraction across both models, and seven_day_sonnet still has its own cap that can fire on its own. Switching to Sonnet for grunt work extends the window; it doesn't make the wall impossible. The honest planning move is to watch the seven_day bar tick and pace against the resets_at countdown.",
  },
  {
    q: "Is ClaudeMeter the only way to see this live?",
    a: "It's the only free, open-source way that reads the same server-truth fields claude.ai/settings/usage renders. ccusage and Claude-Code-Usage-Monitor read local JSONL logs from Claude Code, which is a different data source (local token counts, not server-enforced quota). The claude.ai Settings page is the canonical source but you have to refresh it manually. ClaudeMeter polls the same endpoint once a minute and surfaces it in the menu bar.",
  },
];

const installSteps = [
  {
    title: "Install the menu bar app",
    description:
      "brew install --cask m13v/tap/claude-meter. The cask drops ClaudeMeter.app into /Applications and registers a launch agent so the icon comes back after reboot. macOS 12 or newer.",
  },
  {
    title: "Load the browser extension",
    description:
      "Clone github.com/m13v/claude-meter. Open chrome://extensions (or arc://extensions, brave://extensions, edge://extensions), enable Developer mode, click 'Load unpacked', point at the extension/ folder. Pin the icon.",
  },
  {
    title: "Visit claude.ai once",
    description:
      "If you are not already logged in, sign in to claude.ai in that browser. The extension uses fetch with credentials: 'include' against /api/organizations/{org}/usage, so your existing session cookie travels with the request. No paste, no API key, no second login.",
  },
  {
    title: "Watch the 7-day row",
    description:
      "Click the toolbar icon. The popup renders a 5-hour row and a 7-day row (plus 7d Sonnet / 7d Opus when the JSON ships those fields). The bar turns amber at 80%. That's the moment to start pacing.",
  },
];

const comparisonRows = [
  {
    feature: "Data source",
    ours: "GET /api/organizations/{uuid}/usage on claude.ai (server-truth)",
    competitor: "~/.claude/projects/<id>/<session>.jsonl files on disk",
  },
  {
    feature: "What it measures",
    ours: "All seven weekly buckets the server enforces, including oauth_apps",
    competitor: "Local Claude Code token counts only",
  },
  {
    feature: "Picks up claude.ai web chat usage",
    ours: "Yes (it's part of the server-side bucket)",
    competitor: "No (only sees Claude Code traffic)",
  },
  {
    feature: "Picks up Opus / Sonnet weighting",
    ours: "Yes (server already applied it before returning utilization)",
    competitor: "No (local logs don't carry the multiplier)",
  },
  {
    feature: "Heavy-use threshold",
    ours: "80% amber, 100% red, baked in at popup.js line 31",
    competitor: "User-configurable warn level on token count, not on quota",
  },
  {
    feature: "Cost / license",
    ours: "Free, MIT-licensed Rust + JavaScript",
    competitor: "Free, MIT-licensed (different lane, complementary)",
  },
];

const bucketCards = [
  {
    title: "seven_day",
    description:
      "The overall weekly bucket. The one most people mean by 'the weekly quota'. Fed by every prompt across every model.",
  },
  {
    title: "seven_day_sonnet",
    description:
      "Per-model weekly cap for Sonnet. Conditional in the JSON; renders only when present.",
  },
  {
    title: "seven_day_opus",
    description:
      "Per-model weekly cap for Opus. The one Claude Code heavy users tend to hit first on a Max plan.",
  },
  {
    title: "seven_day_oauth_apps",
    description:
      "Weekly cap for OAuth app traffic. Claude Code goes through this lane. You can be fine on seven_day and pinned here.",
  },
  {
    title: "seven_day_omelette",
    description:
      "Undocumented bucket. Ships utilization on a 0 to 100 scale, not 0 to 1, so any tracker that skips normalization renders it as 0.78%. ClaudeMeter handles it with `u <= 1 ? u * 100 : u`.",
  },
  {
    title: "seven_day_cowork",
    description:
      "Undocumented bucket. Same 0 to 100 scale quirk. Likely a future product feature; the field is already in the schema.",
  },
  {
    title: "five_hour",
    description:
      "Not weekly, but interacts with all of the above. A long Opus run can throttle you here without moving the weekly bar at all.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-usage-limit",
    title: "Claude Pro usage limit: the eight buckets the server tracks",
    excerpt:
      "Reference for every utilization field /usage returns, what each one means, and which one is most likely to throttle you first.",
    tag: "Reference",
  },
  {
    href: "/t/claude-pro-weekly-quota-wall-refactor",
    title: "Hit 100% weekly mid-refactor: a 90-second recovery playbook",
    excerpt:
      "What to read off the popup, which exact field to sleep on, and how to land the resumed run the second the wall lifts.",
    tag: "Playbook",
  },
  {
    href: "/t/claude-weekly-limit-by-tuesday",
    title: "Why the weekly limit hits by Tuesday: it's a 168-hour clock",
    excerpt:
      "The seven_day window is rolling, not calendar-aligned. resets_at points at the moment the oldest weighted prompt ages out.",
    tag: "Mental model",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Pro weekly quota and 'heavy use' rate limit: the 80% threshold the tracker ships",
  description:
    "'Heavy use' isn't a fixed Anthropic tier. It's the 80% amber / 100% red threshold ClaudeMeter applies to up to seven independent 7-day buckets. The code line, the bucket list, and how to read your own number live.",
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

const popupCode = `// extension/popup.js — line 31
const cls = v == null ? "" : v >= 100 ? "hot" : v >= 80 ? "warn" : "";

// "warn" paints the bar amber. "hot" paints it red.
// That's the operational definition of "heavy use".`;

const bucketCode = `// src/models.rs — the weekly side of the response
pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:            Option<Window>,
    pub seven_day_sonnet:     Option<Window>,
    pub seven_day_opus:       Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,
}

// Any one of the seven_day_* buckets at >= 100% throttles you.
// The "rate_limit_error" string never names which one fired.`;

export default function ClaudeProWeeklyQuotaHeavyUsePage() {
  return (
    <article className="text-zinc-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd, faqJsonLd]),
        }}
      />

      <div className="py-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-3xl mx-auto px-6 pb-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-zinc-900">
          'Heavy use' on Claude Pro is{" "}
          <GradientText>utilization &ge; 80%</GradientText> on any of seven
          weekly buckets
        </h1>
        <p className="mt-5 text-base sm:text-lg text-zinc-600 leading-relaxed">
          Anthropic publishes a range (40 to 80 hours of Sonnet a week on Pro)
          but never names the threshold for 'heavy use'. The open-source
          tracker does, in one line of code, and the weekly quota turns out to
          be six or seven separate buckets, any one of which can throttle you
          while the others read fine.
        </p>
      </header>

      <div className="pt-2 pb-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="6 min read"
        />
      </div>

      <section className="max-w-3xl mx-auto px-6 mt-8">
        <BackgroundGrid>
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
              Direct answer (verified 2026-05-10)
            </p>
            <p className="text-zinc-800 leading-relaxed text-base sm:text-lg">
              Claude Pro is roughly 40 to 80 hours of Sonnet 4 per rolling
              7-day window plus a 5-hour rolling sub-window, per{" "}
              <a
                href="https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work"
                className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
              >
                Anthropic's usage-limits article
              </a>
              . The server tracks this as up to seven separate weekly buckets
              and one 5-hour bucket. 'Heavy use' is not a published tier; the
              operational threshold is{" "}
              <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
                utilization &ge; 80%
              </code>{" "}
              on any of those buckets (the open-source tracker turns the bar
              amber at 80%, red at 100%; source:{" "}
              <a
                href="https://github.com/m13v/claude-meter/blob/main/extension/popup.js"
                className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
              >
                extension/popup.js line 31
              </a>
              ). At &ge; 100% on any bucket your next prompt returns a generic{" "}
              <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
                rate_limit_error
              </code>
              .
            </p>
          </div>
        </BackgroundGrid>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          The 80% threshold is one line of code
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Anthropic's docs never name a 'heavy use' tier. But there has to be
          one operationally, because the bar in claude.ai/settings/usage
          changes color, and so does the icon in ClaudeMeter's toolbar. The
          threshold is hardcoded:
        </p>
        <AnimatedCodeBlock
          code={popupCode}
          language="javascript"
          filename="claude-meter/extension/popup.js"
        />
        <p className="text-zinc-700 leading-relaxed mt-6">
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            v
          </code>{" "}
          is the utilization percent for one bucket. At 80% the row paints
          amber and the toolbar badge flips from green to amber (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            background.js:87
          </code>
          ). At 100% the row turns red and your next prompt fails with the
          generic rate-limit error. There is no separate 'medium-heavy' or
          'extreme' band; the limiter has one notch before zero.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          'The weekly quota' is actually seven buckets
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Every blog post that explains the weekly quota names it as one
          number. The wire shape is different. The /usage JSON ships up to
          seven independent fields, and the limiter runs each one against its
          own 80% / 100% gate:
        </p>
        <AnimatedCodeBlock
          code={bucketCode}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {bucketCards.map((b) => (
            <GlowCard key={b.title}>
              <div className="p-5">
                <code className="text-sm font-mono text-teal-700">
                  {b.title}
                </code>
                <p className="mt-2 text-sm text-zinc-700 leading-relaxed">
                  {b.description}
                </p>
              </div>
            </GlowCard>
          ))}
        </div>
        <p className="text-zinc-700 leading-relaxed mt-6">
          Most users only see two rows in the ClaudeMeter popup, because
          claude.ai only ships seven_day and five_hour for a vanilla Pro
          account. The conditional rows (7d Sonnet, 7d Opus) render when the
          JSON returns them. The undocumented buckets (omelette, cowork) are
          already in the schema; whether the server enforces them depends on
          plan tier and product surface. The point is the data model: the
          limiter does not have a single 'weekly quota' value.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          How to see your own number in under two minutes
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          You can read the same JSON in DevTools (Network tab, filter for
          'usage', click the /api/organizations/&#123;org&#125;/usage request).
          Faster, if you are going to keep hitting this question, is to put a
          live reading in your menu bar:
        </p>
        <StepTimeline steps={installSteps} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Where ccusage stops being the right tool
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          ccusage is good. It reads Claude Code's local JSONL files and tells
          you exactly how many tokens you spent in a session. But it cannot
          tell you whether you are 'heavy' against the weekly quota, because
          the weekly quota lives on the server with model weights and peak-hour
          multipliers folded in, and ccusage has no access to that. If your
          question is the rate-limit question, you need the server-truth row,
          not the local count.
        </p>
        <ComparisonTable
          productName="ClaudeMeter (server-truth)"
          competitorName="ccusage (local logs)"
          rows={comparisonRows}
        />
        <p className="text-zinc-700 leading-relaxed mt-6">
          They are complementary, not competitive. Run ccusage for the
          per-session post-mortem; run ClaudeMeter for the live 'how close am I
          to the wall' read.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-6 mt-16 mb-12">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Hitting the weekly wall every Tuesday and want a second pair of eyes?"
          description="15 minutes. Share your bucket pattern, we'll walk through which one is actually throttling you and how to pace the next 168 hours."
          text="Book a 15-minute call"
          section="heavy-use-footer"
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
        description="Questions on the 80% threshold? 15 min."
        section="heavy-use-sticky"
        site="claude-meter"
      />
    </article>
  );
}
