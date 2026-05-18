import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-max-weekly-limit-tracker";
const PUBLISHED = "2026-05-18";

export const metadata: Metadata = {
  title:
    "Claude Max weekly limit tracker: it's three weekly bars, not one",
  description:
    "The weekly limit on Claude Max isn't one number, it's three: 7-day all, 7-day Sonnet, 7-day Opus. Plus an extra-usage dollar row. ClaudeMeter prints all four in one shell command and renders them in the macOS menu bar. Free, open source, MIT.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Max weekly limit tracker: it's three weekly bars, not one",
    description:
      "Three independent weekly meters ship on every Max usage poll. The Opus bar bites first. Here is the tracker that surfaces all three side by side instead of collapsing them.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "How many weekly limit rows does Claude Max actually have?",
    a: "Three weekly utilization rows ship on a Max account every time you poll /api/oauth/usage (or /api/organizations/{org}/usage via cookies). They are seven_day, seven_day_sonnet, and seven_day_opus, each carrying its own utilization fraction and resets_at timestamp. A fourth row, extra_usage, shows pay-as-you-go dollars spent against your monthly cap once you turn metered billing on. ClaudeMeter prints all four in one shell command (claude-meter) and stacks them in the macOS menu bar popover so you can see which one is closest to the cap at any moment.",
  },
  {
    q: "Why does the Opus row hit the cap before the combined 7-day row?",
    a: "Because Opus consumes its dedicated weekly bucket faster than the same workload consumes the combined bucket. If you run one heavy Opus refactor on Monday morning, seven_day_opus.utilization can climb to 70 percent while seven_day.utilization is at 28 percent. The combined-weekly bar tells you you are fine. The Opus-specific bar tells you Opus is going to throttle this Wednesday. They are different questions. claude.ai/settings/usage hides this behind a details expander; the menu bar shows all three rows at once.",
  },
  {
    q: "What does the claude-meter CLI print on a Max account?",
    a: "Four labeled rows plus a billing line. The format is set in claude-meter/src/format.rs lines 13 to 22: \"5-hour\", \"7-day all\", \"7-day Sonnet\", \"7-day Opus\". Each row carries the percent used and a reset countdown like \"-> resets Mon May 11 09:02 (in 5d 22h)\". If metered billing is on, an \"Extra usage\" row appears with dollars spent against the monthly cap. The exact column widths are formatted with \"{:<16}\" so the rows line up in a terminal.",
  },
  {
    q: "How does ClaudeMeter know I am on Max and not Pro?",
    a: "It reads the OAuth blob Claude Code writes into the macOS Keychain under service \"Claude Code-credentials\". The JSON includes subscriptionType (max or pro) and rateLimitTier (default_claude_max_20x for the standard Max plan). claude-meter/src/oauth.rs deserializes these fields directly. The tracker uses them to decide which rows to expect and to label the popover header. If you have Claude Code logged in to your Max account, ClaudeMeter sees both fields on the very first launch.",
  },
  {
    q: "Does ccusage track the weekly Max limit?",
    a: "No. ccusage reads ~/.claude/projects/<project>/<session>.jsonl on disk and sums tokens against the model price card. That is local truth: tokens your machine sent. The weekly limit is server truth: which bucket Anthropic charged the request to, what fraction of the cap that landed at. ccusage at 5 percent next to claude.ai at 71 percent is normal; they measure different ledgers. ClaudeMeter complements ccusage rather than replaces it: ccusage tells you what your Claude Code session weighed in tokens, ClaudeMeter tells you what fraction of the weekly cap Anthropic counted against it.",
  },
  {
    q: "How often does the tracker repoll the weekly numbers?",
    a: "Once per 60 seconds. The browser extension uses chrome.alarms.create('refresh', { periodInMinutes: 1 }) (extension/background.js line 105). The macOS menu bar app refreshes on the same cadence by default and lets you set it from 30 seconds to 5 minutes in the popover. One minute matches the cadence claude.ai/settings/usage recomputes against, so the two stay in lockstep without hammering the endpoint.",
  },
  {
    q: "What happens when one of the three weekly rows hits 100 percent?",
    a: "Anthropic short-circuits your next prompt with HTTP 429 and a JSON body explaining the limit that fired. The check runs on every prompt, so enforcement is real-time. The reset is independent per row: hitting seven_day_opus at 100 percent stops Opus traffic until that row's resets_at; you can still send Sonnet messages until seven_day_sonnet or the combined seven_day also crosses. The menu bar pulls the next snapshot within 60 seconds and the row whose percent flipped to 100 is the one carrying the gate.",
  },
  {
    q: "Will I see all three rows if my account is a fresh Max account?",
    a: "Yes, as soon as you send any messages on each model. The fields seven_day, seven_day_sonnet, and seven_day_opus are present in the JSON response from day one; the utilization stays at zero until activity lands on them. A brand new Max account with no Opus traffic yet will show 7-day Opus at 0 percent. The row appears in the tracker regardless, so you watch it climb rather than discover it after the cap.",
  },
  {
    q: "Is this endpoint going to keep working?",
    a: "The endpoints powering the rows are internal and undocumented. /api/oauth/usage is what api.anthropic.com exposes for Bearer-token clients; /api/organizations/{org}/usage is the cookie-authenticated mirror that powers claude.ai/settings/usage. Anthropic can rename fields or remove buckets in any release. ClaudeMeter deserializes into explicit Rust structs (UsageResponse in src/models.rs), so a schema change surfaces as a parse error rather than a silent zero. The field names listed above were stable through 2026-05-18 and the repo is open source MIT.",
  },
  {
    q: "How do I install it from a Twitter reply on mobile?",
    a: "You cannot install a macOS menu bar app from an iPhone. Bookmark this page, open it on the Mac you run Claude Code on, then run brew install --cask m13v/tap/claude-meter in a terminal and visit claude.ai once. The menu bar popover lights up within a minute. The browser extension is a separate install from the GitHub releases page (Chrome, Arc, Brave, Edge supported, Safari not yet).",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Max weekly limit tracker", url: PAGE_URL },
];

const cliOutput = [
  { type: "command" as const, text: "claude-meter   # one shell command, four rows" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour            62.0% used    -> resets Mon May 18 18:00 (in 4h)" },
  { type: "output" as const, text: "7-day all         28.0% used    -> resets Sat May 23 09:02 (in 5d 22h)" },
  { type: "output" as const, text: "7-day Sonnet      20.0% used    -> resets Sat May 23 09:02 (in 5d 22h)" },
  { type: "info" as const, text: "7-day Opus        71.0% used    -> resets Sat May 23 09:02 (in 5d 22h)" },
  { type: "output" as const, text: "Extra usage       $4.20 / $50.00 (8%)" },
  { type: "output" as const, text: "Next charge       2026-06-15   visa ••0936" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "fetched 2026-05-18 14:02:31 PDT   matt@example.com via Claude Code   org 5d3..." },
  { type: "success" as const, text: "The 7-day Opus row is the one carrying the active cap. Combined 7-day says you're fine. It's lying." },
];

const formatRsCode = `// claude-meter/src/format.rs (lines 9 to 22)
if let Some(u) = &s.usage {
    if let Some(w) = &u.five_hour {
        println!("{:<16} {}", "5-hour",       format_window(w));
    }
    if let Some(w) = &u.seven_day {
        println!("{:<16} {}", "7-day all",    format_window(w));
    }
    if let Some(w) = &u.seven_day_sonnet {
        println!("{:<16} {}", "7-day Sonnet", format_window(w));
    }
    if let Some(w) = &u.seven_day_opus {
        println!("{:<16} {}", "7-day Opus",   format_window(w));
    }
}`;

const oauthBlobCode = `// What Claude Code writes into the macOS Keychain
// service: "Claude Code-credentials"
{
  "claudeAiOauth": {
    "accessToken":       "sk-ant-oat01-...",
    "refreshToken":      "sk-ant-ort01-...",
    "expiresAt":         1778299177154,
    "scopes":            ["user:profile", "user:inference", ...],
    "subscriptionType":  "max",
    "rateLimitTier":     "default_claude_max_20x"
  }
}
// claude-meter/src/oauth.rs reads subscriptionType and rateLimitTier
// to decide which rows to expect on the usage endpoint. No prompt,
// no API key, no manual cookie paste.`;

const weeklyRows = [
  {
    title: "7-day all",
    description:
      "The combined weekly bucket. Aggregates everything across every model. Slow-moving for most Max users on agentic loops; faster-moving for heavy chat writers. Resets 168 hours from the first message of the rolling window, not at calendar midnight.",
  },
  {
    title: "7-day Sonnet",
    description:
      "Sonnet-specific weekly bucket. Independent of the combined bucket and of 7-day Opus. Most Max users sit here at moderate utilization through the week. It is rarely the bucket that bites first because Sonnet has the higher allowance per Max plan.",
  },
  {
    title: "7-day Opus",
    description:
      "Opus-specific weekly bucket. The bucket that bites Max users with heavy Opus reasoning loops. Can reach the cap mid-week even when 7-day all is at 30 percent. If you do one heavy Opus refactor in a sitting, watch this row, not the combined one. The CLI labels it explicitly so it cannot hide.",
  },
  {
    title: "Extra usage",
    description:
      "Not a utilization fraction. Dollars spent on Anthropic's April 2026 pay-as-you-go metered billing, shown against the monthly_credit_limit you set. Lights up once a rolling window hits 100 and you have metered billing turned on. Reads from a separate endpoint (/api/organizations/{org}/overage_spend_limit) but renders on the same row stack.",
  },
];

const trackerVsSettingsRows = [
  {
    feature: "Surfaces 7-day all",
    competitor: "Yes (prominent bar)",
    ours: "Yes (one row)",
  },
  {
    feature: "Surfaces 7-day Sonnet and 7-day Opus side by side",
    competitor: "Hidden behind a details expander",
    ours: "Always visible as two distinct rows",
  },
  {
    feature: "Surfaces Extra usage (April 2026 metered billing)",
    competitor: "Yes, separate section",
    ours: "Yes, same row stack",
  },
  {
    feature: "Reset timestamps as relative durations",
    competitor: "Banner copy only (\"usage will reset at...\")",
    ours: "(in 5d 22h) next to every row",
  },
  {
    feature: "Visibility without opening claude.ai/settings/usage",
    competitor: "No",
    ours: "Menu bar at all times; CLI on demand",
  },
  {
    feature: "Plan tier auto-detected",
    competitor: "N/A",
    ours: "Reads subscriptionType + rateLimitTier from Claude Code keychain",
  },
  {
    feature: "Manual cookie paste",
    competitor: "N/A",
    ours: "None (browser extension forwards your live session)",
  },
];

const installSteps = [
  {
    title: "brew install",
    description:
      "brew install --cask m13v/tap/claude-meter. One Homebrew tap command on any Mac running macOS 12 or later. No login, no signup, no API key.",
  },
  {
    title: "Install the browser extension",
    description:
      "Open the GitHub releases page on Chrome, Arc, Brave, or Edge and load the bundled extension. The extension forwards your existing claude.ai session to the local app over 127.0.0.1, so the cookie-paste step that other trackers require is gone.",
  },
  {
    title: "Visit claude.ai once",
    description:
      "Open claude.ai/settings/usage in the same browser. The extension polls /api/organizations/{org}/usage once per minute and posts the snapshot to the menu bar. Within 60 seconds the popover lights up with the three weekly rows.",
  },
  {
    title: "Watch the right row",
    description:
      "Click the menu bar icon. Scan down the list. The row whose percent is highest is the one carrying the cap. If 7-day Opus is at 71 percent and 7-day all is at 28 percent, you have a Wednesday wall coming on Opus traffic only.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-max-usage-tracker",
    title: "Claude Max usage tracking is seven counters, not one",
    excerpt:
      "Beyond the three weekly rows, the same payload carries four more buckets (5-hour, oauth_apps, omelette, cowork). The full shape of /api/organizations/{org}/usage.",
    tag: "Deep dive",
  },
  {
    href: "/t/claude-max-weekly-quota-enforcement",
    title: "Claude Max weekly quota enforcement: three gates, two endpoints",
    excerpt:
      "How the server actually rejects a prompt. Gates 1 and 2 live on /usage; Gate 3 lives on /overage_spend_limit. The exact boolean that flips.",
    tag: "Internals",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage reads local Claude Code JSONL token counts. ClaudeMeter reads server-side plan quota. Different data, complementary tools.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Max weekly limit tracker: it's three weekly bars, not one",
  description:
    "The Claude Max weekly limit isn't one number, it's three independent weekly utilization rows plus a dollar row for metered billing. Free open-source tracker that surfaces all four at once.",
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

export default function ClaudeMaxWeeklyLimitTrackerPage() {
  return (
    <article className="min-h-screen text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd, faqJsonLd]),
        }}
      />

      <div className="py-8">
        <Breadcrumbs
          items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))}
        />
      </div>

      <header className="max-w-3xl mx-auto px-6 pb-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          The Claude Max weekly limit is{" "}
          <GradientText>three bars, not one</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
          Most readers and most trackers watch one weekly meter. Max actually
          surfaces three: a combined 7-day, a Sonnet-specific 7-day, and an
          Opus-specific 7-day. They are independent. The Opus row is the one
          that bites first on heavy reasoning loops, often while the combined
          row is still in the green. This is the open-source tracker that
          stacks all three (plus the dollar row for metered billing) in one
          view.
        </p>
      </header>

      <div className="pt-2 max-w-3xl mx-auto px-6">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="5 min read"
        />
      </div>

      <section className="max-w-3xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-18)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            On a Max plan the weekly limit ships as three independent
            utilization fractions on{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /api/oauth/usage
            </code>
            :{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day
            </code>
            ,{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day_sonnet
            </code>
            , and{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day_opus
            </code>
            , each with its own{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              resets_at
            </code>
            . A fourth row (
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              extra_usage
            </code>
            ) shows pay-as-you-go dollars. The free open-source tracker that
            prints all four with one shell command is{" "}
            <a
              href="https://github.com/m13v/claude-meter"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              ClaudeMeter
            </a>
            ; the row-printing code is at{" "}
            <a
              href="https://github.com/m13v/claude-meter/blob/main/src/format.rs"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              src/format.rs
            </a>
            . Authoritative dashboard:{" "}
            <a
              href="https://claude.ai/settings/usage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              claude.ai/settings/usage
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What the tracker prints
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          This is the literal output of <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">claude-meter</code> on a heavy-Opus Monday afternoon. Read the percent column, then the reset countdown. The row carrying the highest percent is the one closest to the wall.
        </p>
        <TerminalOutput
          title="claude-meter on a Max account"
          lines={cliOutput}
        />
        <p className="text-zinc-500 text-sm leading-relaxed mt-3">
          The four-row layout is hardcoded into the CLI's pretty printer.
          Source:{" "}
          <a
            href="https://github.com/m13v/claude-meter/blob/main/src/format.rs"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            src/format.rs
          </a>
          .
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The four rows, one by one
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          Each row carries a different signal. Skipping one means walking into
          a wall you could have seen 24 hours earlier.
        </p>
        <StepTimeline steps={weeklyRows} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Why the Opus row hits first
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          On a Max plan, the Opus weekly allowance is smaller than the
          Sonnet weekly allowance, even though both feed into the same combined
          7-day bucket. So one heavy Opus refactor consumes a larger fraction
          of <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">seven_day_opus</code> than of <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">seven_day</code>. The math:
          if a session burns roughly the same dollar-equivalent of compute, the
          Opus-specific row climbs maybe two or three times faster than the
          combined row.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The trap is reading the combined row alone. Combined 7-day at 28
          percent on a Tuesday looks healthy. Opus 7-day at 71 percent on the
          same Tuesday means you are out of Opus by Wednesday afternoon. Same
          plan, same week, two different answers depending on which row you
          looked at.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          claude.ai/settings/usage shows you the combined row as the
          headline bar and tucks the per-model rows behind a details expander.
          The tracker pulls all three to the same row stack so the top
          percentage is the one carrying the cap.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The print loop, in 14 lines of Rust
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The four-row layout isn't a config option. It's hardcoded into the
          pretty-printer. Every Max account hits this exact path on every CLI
          run.
        </p>
        <AnimatedCodeBlock
          code={formatRsCode}
          language="rust"
          filename="claude-meter/src/format.rs"
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          How it knows you are on Max
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Claude Code stashes its OAuth credentials in the macOS Keychain under
          service <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">Claude Code-credentials</code>. The JSON blob includes two
          fields the tracker reads directly: <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">subscriptionType</code> and{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">rateLimitTier</code>. If you are on the standard Max
          plan those come back as <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">"max"</code> and{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">"default_claude_max_20x"</code>.
        </p>
        <AnimatedCodeBlock
          code={oauthBlobCode}
          language="json"
          filename="macOS Keychain blob (read-only)"
        />
        <p className="text-zinc-700 leading-relaxed mt-4">
          The upshot for someone arriving from a Twitter reply: install the
          app, the tracker finds your tier automatically, no pasting, no
          re-login.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <ComparisonTable
          heading="Tracker vs the Settings page"
          intro="Both read the same JSON. The tracker just doesn't hide the per-model rows."
          productName="ClaudeMeter"
          competitorName="claude.ai/settings/usage"
          rows={trackerVsSettingsRows}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Install (four steps, Mac only for the menu bar)
        </h2>
        <StepTimeline steps={installSteps} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want help wiring the tracker into your shell prompt?"
          description="Fifteen minutes to get claude-meter into tmux, Starship, or Fig and to set per-row alerts. No charge."
        />
      </section>

      <FaqSection heading="FAQ" items={faqs} />

      <section className="max-w-4xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="More on Max plan limits and tracker internals"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Talk to the team about Claude Max limits, live."
      />
    </article>
  );
}
