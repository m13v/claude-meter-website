import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
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
  "https://claude-meter.com/t/claude-usage-limit-reached-message-explained";
const PUBLISHED = "2026-05-01";

export const metadata: Metadata = {
  title:
    "Claude Usage Limit Hit Message Explained: Five Variants, Five Different Fields",
  description:
    "The 'Claude usage limit reached' banner is at least five distinct messages, each produced by a different field on a different endpoint. The reset time in the wording is for the window the banner names, not necessarily the wall actually blocking you. Decoding each variant against the JSON.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Usage Limit Hit Message Explained: Five Variants, Five Different Fields",
    description:
      "Five different banners share the name 'Claude usage limit'. Each one reads a different field on a different endpoint, so the time on the screen and the wall you actually hit can disagree. Verbatim text, JSON field, what to do.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com/" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "Claude usage limit reached message explained",
    url: PAGE_URL,
  },
];

const faqs = [
  {
    q: "What does 'Claude usage limit reached' actually mean?",
    a: "It means the rate limiter on claude.ai returned a 429 against your org and the client substituted a friendlier banner. The banner you see comes from one of at least five distinct templates documented in Anthropic's troubleshooting article, plus the Claude Code CLI variant. Each template reads a different field. 'Approaching 5-hour limit.' reads five_hour.utilization above the warning threshold. '5-hour limit reached - resets [time].' reads five_hour.utilization >= 1.0 with overage either off or already exhausted. '5-hour limit resets [time] - continuing with extra usage.' reads the same float at 1.0 but with extra_usage.is_enabled true and out_of_credits false. 'Opus weekly limit reached' reads seven_day_opus.utilization >= 1.0. The CLI banner 'Claude usage limit reached. Your limit will reset at 3pm (America/Santiago).' is the Claude Code CLI's collapsed version that does not name which window tripped at all. The wording does not tell you which field fired. ClaudeMeter polls the underlying endpoint every 60 seconds so you can read the field directly.",
  },
  {
    q: "Is the reset time in the message accurate?",
    a: "It is accurate for the window the message names, not necessarily for the wall you actually hit. GitHub issue anthropics/claude-code#9236 documents a user who saw 'Your limit will reset at 3pm (America/Santiago)' and was still locked out 23 hours later. The 5-hour window did reset on schedule; the wall in front of them was a different field on a different endpoint (overage_spend_limit.disabled_until) that the CLI banner never references. The /api/organizations/{org_uuid}/usage payload returns its own resets_at per window, and /api/organizations/{org_uuid}/overage_spend_limit returns its own disabled_until. ClaudeMeter prints both clocks in the CLI output (src/format.rs lines 75 to 98) so the disagreement is visible.",
  },
  {
    q: "Why does the message sometimes say 'continuing with extra usage' and sometimes just 'reached'?",
    a: "Both messages fire when five_hour.utilization >= 1.0. The branch is on the overage_spend_limit endpoint. When is_enabled is true, out_of_credits is false, and disabled_until is null or already past, Anthropic switches the banner to '5-hour limit resets [time] - continuing with extra usage.' and meters subsequent prompts against your monthly extra usage cap. When any one of those three blocks, the banner stays at the harder '5-hour limit reached - resets [time].' wording and your prompts 429 outright. ClaudeMeter parses all three fields into the OverageResponse struct in src/models.rs lines 30 to 40 and renders the BLOCKED state inline so you see the branch, not just the banner.",
  },
  {
    q: "What is the difference between the claude.ai banner and the Claude Code CLI banner?",
    a: "The web banners (Approaching 5-hour limit, 5-hour limit reached, Opus weekly limit reached) name the specific window. The Claude Code CLI prints a collapsed banner: 'Claude usage limit reached. Your limit will reset at 3pm (America/Santiago).' That string does not say five-hour, weekly, Opus, or extra usage. It is a single template the CLI reuses across every 429 family. The reset time is whichever resets_at field the gateway returned, formatted in the local IANA zone of the user's machine. If the wall is overage-driven, the CLI still prints a five-hour-shaped reset because the response shape it parses does not include disabled_until. This is why the Claude Code CLI banner is the most ambiguous of the five and why a usage tracker that reads the underlying fields is more useful than the banner itself.",
  },
  {
    q: "Why does the bar in the popup turn orange before claude.ai shows any banner?",
    a: "The popup uses an earlier threshold than Anthropic does. extension/popup.js line 31 picks the bar class as v >= 100 ? 'hot' : v >= 80 ? 'warn' : '' so the bar paints orange at 80 percent utilization, while the troubleshoot article confirms Anthropic only renders 'Approaching 5-hour limit.' once the gateway has decided to surface the warning. The 80 percent threshold catches you a tier earlier on the bar view because the bar is a compositional unit (it shares the popup with other rows and benefits from a stronger color step) while the menu-bar chip waits until 90 percent (src/bin/menubar.rs bg_for thresholds) because a chip flashing orange at 80 percent is noise.",
  },
  {
    q: "Does the message ever lie about the cause?",
    a: "It does not lie, but it reports only the named window. If five_hour.utilization is at 1.0 and seven_day_opus.utilization is also at 1.0, you will see one banner: usually whichever the gateway picked for that specific request. Switching to Sonnet may unblock you (because seven_day_sonnet is its own float) even though the Opus banner suggested every model was capped. The /api/organizations/{org_uuid}/usage payload returns eight separate utilization floats (UsageResponse in src/models.rs lines 19 to 28); the banner only references one. A tracker that renders all eight tells you which models still have room.",
  },
  {
    q: "Can I see the underlying field that produced the message?",
    a: "Yes. Open DevTools on claude.ai/settings/usage, refresh, and look for the XHR to /api/organizations/{org_uuid}/usage. The response body has utilization floats per window. Or run /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json to get the same payload pretty-printed in your terminal. The CLI prints the per-window resets_at in your local timezone next to each percent so you can compare what the banner said with what the field actually says. ClaudeMeter never reads, parses, or sees the banner text itself; it only reads the JSON.",
  },
  {
    q: "Is 'Claude usage limit reached' the same as the API rate-limit response?",
    a: "No. The API surface returns 429 with structured headers (anthropic-ratelimit-requests-remaining, anthropic-ratelimit-tokens-remaining, retry-after) documented at platform.claude.com/docs/en/api/rate-limits. The claude.ai web banner and the Claude Code CLI banner are user-facing translations of a 429 from the per-org rate limiter on the web stack. They share the underlying mechanism (you have hit a quota) but the surfaces are different: API consumers parse the headers themselves, web and CLI users see the banner. The /api/organizations/{org_uuid}/usage endpoint is the closest a web user gets to a structured view, and it is the one ClaudeMeter calls.",
  },
];

const messageVariants = [
  {
    title: "Approaching 5-hour limit.",
    description:
      "Soft warning. Triggered while five_hour.utilization is high but still under 1.0. The five-hour window is the rolling session quota; the warning fires before the wall.",
    detail: (
      <div className="space-y-2 text-sm">
        <p className="text-zinc-700">
          <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
            five_hour.utilization
          </span>{" "}
          on{" "}
          <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
            GET /api/organizations/&#123;org&#125;/usage
          </span>
        </p>
        <p className="text-zinc-700">
          Source: Anthropic troubleshoot article, listed verbatim under usage
          limit warnings.
        </p>
        <p className="text-zinc-700">
          What to do: nothing yet. The popup&apos;s bar paints orange at 80
          percent (extension/popup.js line 31), Anthropic surfaces the warning
          on its own threshold a bit later. You still have headroom in the
          window.
        </p>
      </div>
    ),
  },
  {
    title: "5-hour limit reached - resets [time].",
    description:
      "Hard wall. Triggered when five_hour.utilization >= 1.0 and overage is unavailable for any reason. Prompts 429 outright until resets_at.",
    detail: (
      <div className="space-y-2 text-sm">
        <p className="text-zinc-700">
          <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
            five_hour.utilization
          </span>{" "}
          on{" "}
          <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
            /usage
          </span>{" "}
          plus the overage block on{" "}
          <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
            /overage_spend_limit
          </span>{" "}
          showing not-enabled, out-of-credits, or disabled_until in the future.
        </p>
        <p className="text-zinc-700">
          Reset time in the message comes from{" "}
          <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
            five_hour.resets_at
          </span>
          . If the real wall is overage-driven, the CLI banner does not say so.
        </p>
        <p className="text-zinc-700">
          What to do: wait, switch to Sonnet if seven_day_sonnet has headroom,
          or enable extra usage if billing allows.
        </p>
      </div>
    ),
  },
  {
    title: "5-hour limit resets [time] - continuing with extra usage.",
    description:
      "Same float, softer outcome. five_hour.utilization is still >= 1.0, but extra_usage is on, has credit, and is not in a disabled_until hold. Subsequent prompts meter against the monthly cap.",
    detail: (
      <div className="space-y-2 text-sm">
        <p className="text-zinc-700">
          Branch: <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
            extra_usage.is_enabled == true
          </span>
          ,{" "}
          <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
            out_of_credits == false
          </span>
          ,{" "}
          <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
            disabled_until
          </span>{" "}
          null or in the past.
        </p>
        <p className="text-zinc-700">
          The five-hour wall is still on; you are paying through it. The
          CLI&apos;s overage line (format.rs lines 24 to 39) renders this as
          $X.XX / $Y.YY with a percent so you watch the meter run.
        </p>
        <p className="text-zinc-700">
          What to do: keep going if the spend is intentional. Set or lower the
          monthly cap if it is not.
        </p>
      </div>
    ),
  },
  {
    title: "Opus weekly limit reached . resets [date], [time].",
    description:
      "Different window entirely. Triggered when seven_day_opus.utilization >= 1.0. The 5-hour window may still have headroom; switching to Sonnet usually unblocks because seven_day_sonnet is its own field.",
    detail: (
      <div className="space-y-2 text-sm">
        <p className="text-zinc-700">
          <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
            seven_day_opus.utilization
          </span>{" "}
          on{" "}
          <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
            /usage
          </span>
          . The reset comes from{" "}
          <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">
            seven_day_opus.resets_at
          </span>
          , not five_hour.resets_at.
        </p>
        <p className="text-zinc-700">
          The weekly windows reset 7 days from your first message in that
          weekly window, not on a fixed calendar boundary, which is why two
          users on the same plan can see different reset times.
        </p>
        <p className="text-zinc-700">
          What to do: switch to Sonnet for the rest of the week, or wait.
        </p>
      </div>
    ),
  },
  {
    title: "Claude usage limit reached. Your limit will reset at 3pm (America/Santiago).",
    description:
      "Claude Code CLI variant. Verbatim from GitHub issue anthropics/claude-code#9236. The CLI does not name the window. The reset time is in the user's IANA timezone but does not include the date, so a user can read 3pm and assume today.",
    detail: (
      <div className="space-y-2 text-sm">
        <p className="text-zinc-700">
          Source: anthropics/claude-code GitHub issue 9236, where a user
          reported still seeing the banner 23 hours after the quoted reset
          time. The 5-hour window had reset; the wall blocking them was a
          different field.
        </p>
        <p className="text-zinc-700">
          The CLI banner string is the most ambiguous of the five because the
          CLI does not surface which JSON field tripped or which endpoint
          returned the 429. A tracker that renders the underlying floats in
          your menu bar tells you what the banner does not.
        </p>
        <p className="text-zinc-700">
          What to do: open claude.ai/settings/usage in a browser, or run the
          ClaudeMeter CLI, to see which window is actually at the wall.
        </p>
      </div>
    ),
  },
];

const fieldMapping = `// /Users/matthewdi/claude-meter/src/models.rs lines 19-40
//
// Every banner string above maps onto one of these fields.
pub struct UsageResponse {
    pub five_hour:            Option<Window>,   // "Approaching 5-hour limit." / "5-hour limit reached"
    pub seven_day:            Option<Window>,   // weekly aggregate, all models
    pub seven_day_sonnet:     Option<Window>,
    pub seven_day_opus:       Option<Window>,   // "Opus weekly limit reached"
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,
}

pub struct OverageResponse {
    pub is_enabled:            bool,                                   // "continuing with extra usage" branch
    pub monthly_credit_limit:  Option<i64>,
    pub used_credits:          Option<f64>,
    pub disabled_until:        Option<DateTime<Utc>>,                  // hidden wall the CLI banner never quotes
    #[serde(default)]
    pub out_of_credits:        bool,
}`;

const cliSession = [
  { type: "command" as const, text: "/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  {
    type: "output" as const,
    text: "5-hour          100.0% used    -> resets Fri May 1 18:42 (in 1h)",
  },
  {
    type: "output" as const,
    text: "7-day all        61.0% used    -> resets Wed May 6 02:11 (in 4d 9h)",
  },
  {
    type: "output" as const,
    text: "7-day Sonnet     48.0% used    -> resets Wed May 6 02:11 (in 4d 9h)",
  },
  {
    type: "output" as const,
    text: "7-day Opus      100.0% used    -> resets Sat May 3 08:14 (in 2d 14h)",
  },
  {
    type: "output" as const,
    text: "Extra usage     $4.20 / $20.00 (21%)  BLOCKED until Sat May 3",
  },
  { type: "output" as const, text: "" },
  {
    type: "info" as const,
    text: "Banner on claude.ai right now: '5-hour limit reached - resets 6:42pm.'",
  },
  {
    type: "error" as const,
    text: "But seven_day_opus is also at 100% and overage is BLOCKED until May 3.",
  },
  {
    type: "success" as const,
    text: "Reset at 6:42pm only frees the 5-hour float. The Opus and overage walls are still up.",
  },
];

const bannerVsFieldRows = [
  {
    feature: "What you read",
    competitor: "'Claude usage limit reached. Your limit will reset at 3pm.'",
    ours: "five_hour 100% (in 1h), seven_day_opus 100% (in 2d 14h), overage BLOCKED until May 3",
  },
  {
    feature: "Source",
    competitor: "Single banner template, no JSON field name",
    ours: "Eight utilization floats + overage block, by field",
  },
  {
    feature: "Reset clock the user sees",
    competitor: "One time, named window",
    ours: "Per-window resets_at + overage disabled_until, side by side",
  },
  {
    feature: "When the named reset arrives",
    competitor: "Banner disappears, but a second wall may still be up",
    ours: "Each wall ticks down independently; you see which one will free you",
  },
  {
    feature: "Endpoint coverage",
    competitor: "Whichever field the gateway picked for the 429",
    ours: "/usage + /overage_spend_limit + /subscription_details, all three",
  },
  {
    feature: "Refresh cadence",
    competitor: "On the next prompt that 429s",
    ours: "60 seconds, fixed (configurable 30s to 5m)",
  },
];

const decodeSteps = [
  {
    title: "Read the banner verbatim, ignore the conclusion",
    description:
      "The wording is a template, not a diagnosis. Pull out the named window (5-hour, weekly, Opus) and the reset time, but treat them as a starting point, not the answer.",
  },
  {
    title: "Open claude.ai/settings/usage or run ClaudeMeter",
    description:
      "Both surfaces hit GET /api/organizations/{org}/usage. Settings renders four bars; the CLI prints all four plus the overage block. Either way you now have the eight floats the banner is hiding.",
  },
  {
    title: "Find every field at or above 1.0",
    description:
      "Sort the floats. five_hour, seven_day_sonnet, seven_day_opus, and the seven_day aggregate are the four that gate Pro/Max users. If two are at 1.0, your banner only named one.",
  },
  {
    title: "Check overage_spend_limit",
    description:
      "GET /api/organizations/{org}/overage_spend_limit. If is_enabled is false, out_of_credits is true, or disabled_until is in the future, the CLI banner is hiding a fourth wall the named-window reset will not lift.",
  },
  {
    title: "Pick your unblock path against the real fields",
    description:
      "If only five_hour is at 1.0 and overage is healthy, the named reset will free you. If seven_day_opus is also at 1.0, switching to Sonnet usually works for the rest of the week. If overage is on a disabled_until, you wait for the date in that field, not the time in the banner.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-5-hour-server-side-wall",
    title: "The 5-hour wall is three walls, not one",
    excerpt:
      "Three independent server-side conditions can produce the same banner. /usage and /overage_spend_limit each have their own wall.",
    tag: "Mechanics",
  },
  {
    href: "/t/claude-rate-limit-dashboard",
    title: "What a real Claude rate-limit dashboard has to render",
    excerpt:
      "No first-party dashboard exists for Pro/Max. What one has to render: eight floats, RGB color thresholds, multi-account composition.",
    tag: "Walkthrough",
  },
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "Local counter vs server quota: why ccusage and claude.ai disagree",
    excerpt:
      "Local Claude Code JSONL totals and the server's utilization floats measure different things. Both can be right at the same time.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude usage limit hit message explained: five variants, five different fields",
  description:
    "The 'Claude usage limit reached' banner is at least five distinct messages, each produced by a different field on a different endpoint. The reset time in the wording is for the window the banner names, not necessarily the wall actually blocking you.",
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

export default function ClaudeUsageLimitMessageExplainedPage() {
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
          The Claude usage limit message{" "}
          <GradientText>is five messages</GradientText> wearing the same name.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          When Anthropic tells you you have hit your usage limit, the wording
          comes from a small set of templates. Each template reads a different
          field on a different endpoint. The reset clock in the message is for
          the window the message names, which is not always the wall in front
          of you. Below: each variant verbatim, the JSON field that produced
          it, and what the message does not tell you.
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

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <GlowCard>
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold">
              Direct answer (verified 2026-05-01)
            </p>
            <p className="mt-3 text-zinc-900 text-lg leading-relaxed">
              The &ldquo;Claude usage limit reached&rdquo; banner is one of at
              least five distinct messages: a soft warning before the wall, a
              hard 5-hour wall, a 5-hour wall with extra usage continuing, an
              Opus weekly wall, and the collapsed Claude Code CLI banner that
              does not name the window. Each one is produced by a different
              field on the{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-base font-mono">
                /api/organizations/&#123;org_uuid&#125;/usage
              </code>{" "}
              endpoint plus the overage endpoint. The reset time in the banner
              is for the window it names, not for any other wall that may also
              be up. Anthropic&apos;s troubleshoot article (
              <a
                className="text-teal-700 underline"
                href="https://support.claude.com/en/articles/12466728-troubleshoot-claude-error-messages"
              >
                support.claude.com
              </a>
              ) lists the web variants. The CLI variant is documented in{" "}
              <a
                className="text-teal-700 underline"
                href="https://github.com/anthropics/claude-code/issues/9236"
              >
                anthropics/claude-code#9236
              </a>
              .
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the banner is so vague on purpose
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The banner is a user-facing surface. Naming a JSON field would scare
          most readers and would not help the ones who do not run a tracker.
          So Anthropic compresses the rate-limit decision into one of five
          short templates. The compression is fine when only one wall is up;
          it gets confusing when two are. A user can read &ldquo;5-hour limit
          reached - resets 6:42pm,&rdquo; wait an hour and a half, and still
          be blocked because{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-sm">
            seven_day_opus.utilization
          </code>{" "}
          was also at 1.0 and the gateway only quoted one of them.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The fix is not to read the banner harder; it is to read the same
          fields the banner reads. Three endpoints on{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-sm">
            claude.ai
          </code>
          , available to any logged-in browser, return the structured truth.
          ClaudeMeter polls them every 60 seconds and renders the eight floats
          plus the overage block in a menu-bar tile. Same data the banner
          read; more of it on screen.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The five messages, decoded
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-2">
          Each card below is one verbatim banner. Click or expand to see which
          field on which endpoint produced it, and what the banner does not
          tell you.
        </p>
        <StepTimeline steps={messageVariants} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The fields, in one block of code
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Each banner above maps onto one of these fields. The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            UsageResponse
          </code>{" "}
          struct in src/models.rs holds the eight utilization floats. The
          overage block lives next to it. ClaudeMeter parses the three
          responses into one snapshot the menu bar redraws.
        </p>
        <AnimatedCodeBlock
          code={fieldMapping}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
      </section>

      <BackgroundGrid pattern="dots">
        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            What the banner says vs. what the fields say
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg mb-6">
            A real session: the banner names the 5-hour reset and stops there.
            The CLI prints every wall in the same view. The named reset will
            free the 5-hour float. The other two walls keep blocking.
          </p>
          <TerminalOutput lines={cliSession} title="claude-meter" />
        </section>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Banner vs. ClaudeMeter, side by side
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Two views of the same 429. The banner compresses, the tracker
          decompresses.
        </p>
        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="The banner alone"
          rows={bannerVsFieldRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          How to decode the message in five steps
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          When the banner appears, do this. The first three steps work without
          any tool. The last two are easier with a tracker.
        </p>
        <StepTimeline steps={decodeSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 23-hour gap
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          On{" "}
          <a
            className="text-teal-700 underline"
            href="https://github.com/anthropics/claude-code/issues/9236"
          >
            anthropics/claude-code#9236
          </a>
          , a user reported the Claude Code CLI banner saying{" "}
          <em>Your limit will reset at 3pm (America/Santiago)</em> at 4pm the
          previous day. They waited the 23 hours, and the banner was still
          there. The 5-hour window had reset on schedule; the wall blocking
          them was a different field on a different endpoint that the CLI
          banner does not reference.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Two takeaways. The banner is honest about the window it names. It
          is silent about every other window and about the overage clock. If
          you are seeing the same banner more than 5 hours later, you are
          almost certainly looking at a second wall. ClaudeMeter prints them
          all together so you do not have to wait the 23 hours to find out.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Where the data comes from
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Three endpoints, all on claude.ai, all callable with the cookies
          your browser already has. ClaudeMeter&apos;s browser extension calls
          them with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            credentials: &apos;include&apos;
          </code>{" "}
          and POSTs the parsed snapshot to the menu-bar app over{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            127.0.0.1:63762
          </code>
          . Nothing leaves your machine. The same JSON the Settings page
          renders is what the menu bar redraws every minute.
        </p>
        <AnimatedCodeBlock
          code={`// /Users/matthewdi/claude-meter/src/api.rs lines 8-49 (abridged)
const BASE: &str = "https://claude.ai/api";

let usage    = get_json(&client, &cookie_header,
    &format!("{BASE}/organizations/{org}/usage")).await?;
let overage  = get_json(&client, &cookie_header,
    &format!("{BASE}/organizations/{org}/overage_spend_limit")).await?;
let sub      = get_json(&client, &cookie_header,
    &format!("{BASE}/organizations/{org}/subscription_details")).await?;`}
          language="rust"
          filename="claude-meter/src/api.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Stuck on a banner that will not lift?"
          description="If the banner has been up longer than the named reset, two walls are probably stacked. Walk through your snapshot with us and we will help you find the second one."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <FaqSection heading="Common questions about the limit message" items={faqs} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <RelatedPostsGrid
          title="Keep reading"
          subtitle="Related guides on the same data"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Book a session if a banner is still up after the named reset."
      />
    </article>
  );
}
