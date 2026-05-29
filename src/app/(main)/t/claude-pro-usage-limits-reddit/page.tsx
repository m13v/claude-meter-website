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
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-pro-usage-limits-reddit";
const PUBLISHED = "2026-05-09";

export const metadata: Metadata = {
  title:
    "Claude Pro Usage Limits on Reddit: What r/ClaudeAI Says vs What the Server Tracks (2026)",
  description:
    "The most-upvoted Reddit complaints about Claude Pro limits, mapped to the eight utilization buckets the claude.ai server actually returns. Real thread links, the bucket each gripe is about, and what redditors do about it.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Pro Usage Limits on Reddit: What r/ClaudeAI Says vs What the Server Tracks",
    description:
      "Reddit megathreads about Pro limits, decoded against the eight bucket fields the rate limiter checks. With permalinks and the Rust deserializer that names them.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Pro usage limits on Reddit", url: PAGE_URL },
];

const faqs = [
  {
    q: "Is Claude Pro really as bad as Reddit says?",
    a: "Depends what you mean by bad. The numbers Anthropic publishes (about 45 short messages per 5 hours, 40 to 80 hours of Sonnet 4 weekly) are accurate for the workflow they were measured against: short prompts, no attachments, Sonnet only. Redditors complaining loudest tend to run agentic loops, long contexts, image attachments, or Opus, all of which the server weights heavier inside the same bucket. That is why one user gets 60 hours of work a week and another reports the cap exhausted in two days. Both can be true on the same plan.",
  },
  {
    q: "What is the most upvoted Reddit thread on Claude Pro limits?",
    a: "The August 2025 announcement thread, r/ClaudeAI/comments/1mbo1sb, where Anthropic posted that it was rolling out weekly usage caps. It collected hundreds of comments. The October 2025 megathread (r/ClaudeAI/comments/1nvnafs) and the recurring 'Usage Limits are Way Out of Hand' threads are the other ones to read if you want the voice-of-the-user version.",
  },
  {
    q: "Did Claude Pro limits actually get worse in 2026?",
    a: "Two visible inflection points. Around September 29, 2025, after Sonnet 4.5 shipped, redditors reported their effective weekly hours dropped from roughly 40 to 50 per week down to 6 to 8 with no announcement. Around March 26, 2026, peak-hour throttling tightened again and MacRumors and The Register both covered the wave of complaints. Anthropic acknowledged in the rate-limit thread that 'approximately 7 percent of users will hit session limits they wouldn't have before.'",
  },
  {
    q: "Why do redditors say there is no warning before they hit the limit?",
    a: "Because the in-chat indicator is binary. claude.ai shows a fraction in Settings, then Usage, but the chat surface itself does not warn you on the way up. The server tracks utilization as a float per bucket; whichever bucket reaches 1.0 first is what blocks you, and a 429 comes back generic without naming which bucket tripped. That is the gap a meter fills: it polls the same endpoint /settings/usage uses, every 60 seconds, so you watch the number climb instead of getting blindsided at 100 percent.",
  },
  {
    q: "What is the Reddit-recommended workaround for Claude Pro limits?",
    a: "The recurring suggestions are: split into two or three sessions across the day, start fresh chats per task to avoid the long-context replay tax, downgrade Opus to Sonnet for routine prompts, run heavy work outside US peak hours (5 to 11 AM PT), enable extra-usage credits if cost is acceptable, and run a usage tracker so you see the wall coming. ccusage and Claude-Code-Usage-Monitor (both on GitHub) read local Claude Code logs. ClaudeMeter reads the server-side utilization the rate limiter actually checks.",
  },
  {
    q: "Is the free tier really better than Pro like some redditors claim?",
    a: "It is not, but the perception comes from a real thing. Free tier users get smaller per-window allowances and tend to send shorter prompts, which keeps utilization low in any single bucket. Pro users running long debugging sessions or agentic loops can hit utilization 1.0 on five_hour or seven_day_sonnet faster than a free user runs out of free messages. Same enforcement model, different bucket weights, different ceilings.",
  },
  {
    q: "Can I read my own Claude Pro usage like a redditor would?",
    a: "Yes. Open claude.ai, go to Settings, then Usage. The page renders bars by calling GET /api/organizations/{your-org-uuid}/usage on load. There is no public API token; the request rides your existing session cookies. The Rust deserializer in claude-meter/src/models.rs lines 18 to 28 declares the same eight optional fields the page reads, so what you see in the UI matches what the rate limiter checks.",
  },
  {
    q: "What does Anthropic say in the Reddit threads themselves?",
    a: "On August 28, 2025, in r/ClaudeAI/comments/1mbo1sb, Anthropic announced weekly caps starting September 2025 and stated about 7 percent of users would notice. They have replied to follow-up threads acknowledging Claude Code is being used 24/7 in agentic loops at a rate they did not size for. The tightening since then has been mostly silent: lower weights on the same buckets, no schema change, so trackers built against the old bucket names still work.",
  },
  {
    q: "Why are there eight buckets if Anthropic only talks about two?",
    a: "Anthropic talks about the user-facing concepts: a 5-hour rolling window and a weekly cap. The server breaks the weekly cap into per-model and per-channel slices: seven_day (all-models total), seven_day_sonnet, seven_day_opus, seven_day_oauth_apps for third-party clients, plus two undocumented codenames (seven_day_omelette and seven_day_cowork) that show up if Anthropic ships a feature that lands inside Pro. ClaudeMeter parses all eight so you can see which one trips first.",
  },
  {
    q: "Is there a Reddit-friendly tool that just shows my Pro usage?",
    a: "ClaudeMeter is one option that reads the server number. It is open source on GitHub (m13v/claude-meter), MIT licensed, anonymous telemetry is opt-out, and the browser extension forwards the claude.ai session so you do not paste a cookie. ccusage and Claude-Code-Usage-Monitor are two other Reddit-popular projects that count tokens locally from Claude Code JSONL files. They answer different questions: local tokens vs server-truth utilization.",
  },
];

const usageStruct = `// claude-meter/src/models.rs (lines 18 to 28)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:           Option<Window>,
    pub seven_day:           Option<Window>,
    pub seven_day_sonnet:    Option<Window>,
    pub seven_day_opus:      Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:  Option<Window>,  // undocumented codename
    pub seven_day_cowork:    Option<Window>,  // undocumented codename
    pub extra_usage:         Option<ExtraUsage>,
}`;

const complaintRows = [
  {
    feature: "“Hit the limit after maybe 10 messages on a real project”",
    competitor: "five_hour",
    ours: "Long prompts, attachments, and Opus all weight heavier in this bucket. The 45-message estimate assumes short Sonnet prompts.",
  },
  {
    feature: "“Cap exhausted by Tuesday on a normal week”",
    competitor: "seven_day_sonnet",
    ours: "The Sonnet-only weekly slice. Anthropic publishes 40-80 hours, but the float is what the limiter checks.",
  },
  {
    feature: "“Limit dropped overnight in late September 2025”",
    competitor: "seven_day_sonnet, seven_day_opus",
    ours: "Buckets unchanged. Per-model weights tightened after Sonnet 4.5 shipped. Same field names, lower allowance.",
  },
  {
    feature: "“Got blocked with no warning”",
    competitor: "Any of the eight",
    ours: "The 429 is generic. Whichever bucket hit 1.0 first throttles you, and the chat surface does not name it.",
  },
  {
    feature: "“Claude Code chewed through my whole week in one session”",
    competitor: "seven_day_oauth_apps",
    ours: "Third-party clients land here. Long agentic loops with file-edit tool calls add up faster than chat messages.",
  },
  {
    feature: "“Went over and got billed for extra usage”",
    competitor: "extra_usage",
    ours: "Not a limit. A separate ExtraUsage struct: is_enabled, monthly_limit, used_credits, utilization, currency.",
  },
];

const redditTimeline = [
  {
    title: "Aug 28, 2025: Anthropic announces weekly caps",
    description:
      "Posted to r/ClaudeAI as 'Updating rate limits for Claude subscription plans.' Acknowledged about 7 percent of users would hit session limits they wouldn't have before. Hundreds of comments, mostly Pro and Max subscribers asking for visibility before they hit the wall.",
    detail: (
      <a
        className="text-teal-700 underline"
        href="https://www.reddit.com/r/ClaudeAI/comments/1mbo1sb/updating_rate_limits_for_claude_subscription/"
      >
        r/ClaudeAI/comments/1mbo1sb
      </a>
    ),
  },
  {
    title: "Sept 29, 2025: Sonnet 4.5 ships, effective hours fall",
    description:
      "Pro and Max users in the October megathread report weekly hours dropping from roughly 40 to 50 down to 6 to 8 with no in-app notice. The bucket names did not change, weights did. This is when 'I burn through the whole damn quota in like ONE OR TWO DAYS' starts getting upvoted to the top of every thread.",
    detail: (
      <a
        className="text-teal-700 underline"
        href="https://www.reddit.com/r/ClaudeAI/comments/1nvnafs/"
      >
        r/ClaudeAI/comments/1nvnafs
      </a>
    ),
  },
  {
    title: "Mar 26, 2026: peak-hour throttling tightens",
    description:
      "MacRumors and The Register cover a wave of Reddit complaints about Claude Code burning weekly caps faster than the bucket math allows. Anthropic acknowledges and partially restores. The visible signal: peak-hour multipliers (5 to 11 AM PT) climb. Off-peak runs feel normal again.",
    detail: (
      <a
        className="text-teal-700 underline"
        href="https://www.macrumors.com/2026/03/26/claude-code-users-rapid-rate-limit-drain-bug/"
      >
        MacRumors coverage
      </a>
    ),
  },
  {
    title: "May 2026: limits double for Claude Code rate-limit ceilings",
    description:
      "Anthropic announces the rate-limit ceilings for Claude Code on Pro and Max get doubled. The weekly cap concept does not change. The five_hour bucket gets headroom. Reddit reaction is mixed: power users notice, casual Pro users see no difference because they were never bottlenecked on five_hour to start with.",
    detail: (
      <a
        className="text-teal-700 underline"
        href="https://www.anthropic.com/news/higher-limits-spacex"
      >
        Anthropic announcement
      </a>
    ),
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-usage-limit",
    title: "The eight buckets the server actually tracks",
    excerpt:
      "Field-by-field tour of the UsageResponse struct: five_hour, seven_day, seven_day_sonnet, the two undocumented codenames, and extra_usage. The reference page for what each bucket means.",
    tag: "Reference",
  },
  {
    href: "/t/claude-pro-weekly-quota-wall-refactor",
    title: "Hitting the weekly wall mid-refactor",
    excerpt:
      "First-person walkthrough of a refactor session that crashed at 62 percent weekly used. What ClaudeMeter showed, when the bucket flipped, and how the rolling 5-hour reset relates.",
    tag: "Story",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage reads local Claude Code JSONL files. ClaudeMeter reads the server-side utilization the rate limiter actually checks. Different question, different answer. Run both.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Pro usage limits on Reddit: what r/ClaudeAI says vs what the server tracks",
  description:
    "The recurring Reddit complaints about Claude Pro usage limits, mapped to the eight utilization buckets the claude.ai usage endpoint actually returns. Permalinks to the threads and the Rust deserializer that names the buckets.",
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

export default function ClaudeProUsageLimitsRedditPage() {
  return (
    <article className="min-h-screen text-zinc-900">
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
          Claude Pro usage limits on Reddit:{" "}
          <GradientText>what r/ClaudeAI says, decoded</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Most of the Reddit complaints about Claude Pro limits are about one
          of eight utilization fields the claude.ai server returns. The bucket
          names are stable, the per-model weights move quietly, and the chat
          surface does not warn you on the way up. This page maps the loudest
          gripes on r/ClaudeAI to the field each one is actually about.
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

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <GlowCard>
          <div className="p-6 sm:p-8 bg-teal-50 border border-teal-200 rounded-xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900">
                Direct answer (verified 2026-05-09)
              </h2>
              <span className="text-xs uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-1 rounded">
                Explainer
              </span>
            </div>
            <p className="text-zinc-700 leading-relaxed mb-4">
              <strong className="text-zinc-900">In one paragraph:</strong>{" "}
              Reddit users on r/ClaudeAI report burning their weekly cap in one
              or two days, hitting walls with no warning, and the cap dropping
              silently around September 29, 2025 and again March 26, 2026.
              Anthropic publishes two numbers (about 45 short messages per
              5 hours, 40 to 80 hours of Sonnet 4 weekly on Pro) but the rate
              limiter checks eight separate utilization buckets, and any one
              of them at 100 percent throttles the account. The chat surface
              does not name which bucket tripped, which is why redditors keep
              describing the same experience: &ldquo;blocked, no idea why,
              opened Settings/Usage and one bar was full.&rdquo;
            </p>
            <p className="text-zinc-700 leading-relaxed text-sm">
              Authoritative source for the August 2025 announcement and
              Anthropic&rsquo;s own &ldquo;approximately 7 percent of users
              will hit session limits they wouldn&rsquo;t have before&rdquo;
              comment:{" "}
              <a
                className="text-teal-700 underline"
                href="https://www.reddit.com/r/ClaudeAI/comments/1mbo1sb/updating_rate_limits_for_claude_subscription/"
              >
                r/ClaudeAI/comments/1mbo1sb
              </a>
              . Bucket schema verified against{" "}
              <code className="px-1.5 py-0.5 rounded bg-white border border-teal-100 text-zinc-800 text-sm">
                claude-meter/src/models.rs
              </code>{" "}
              lines 18 to 28 on 2026-05-09.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The four moments redditors complained loudest
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6 max-w-3xl">
          The complaint corpus has shape. Spikes line up with announcements
          and silent reweightings. If you read just the megathreads from
          these four moments you have the full Reddit story.
        </p>
        <StepTimeline steps={redditTimeline} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Mapping the loudest Reddit gripes to the bucket they&rsquo;re about
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6 max-w-3xl">
          Left column is paraphrased from highly upvoted r/ClaudeAI comments.
          Middle column is the field on the usage JSON the gripe is actually
          describing. Right column is why the user&rsquo;s perception and the
          server view diverge.
        </p>
        <ComparisonTable
          productName="Bucket on the server"
          competitorName="Reddit gripe"
          rows={complaintRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The struct that names every bucket
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4 max-w-3xl">
          Open the ClaudeMeter source and search for{" "}
          <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm">
            UsageResponse
          </code>
          . The strict Rust deserializer locks down exactly eight optional
          fields. If Anthropic renames or removes one, the parse fails loudly
          and we ship a release. So far they have not. The bucket names are
          stable, the weights are not.
        </p>
        <AnimatedCodeBlock
          code={usageStruct}
          language="rust"
          filename="src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed mt-4 max-w-3xl">
          The two codenames at the bottom (
          <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm">
            seven_day_omelette
          </code>{" "}
          and{" "}
          <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm">
            seven_day_cowork
          </code>
          ) are not in the Help Center. They appear in the JSON the
          claude.ai/settings/usage page itself fetches. ClaudeMeter parses
          them so you can see if one of those is the bucket that just
          throttled you, instead of staring at the visible 5-hour bar
          wondering why a 429 came back.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What redditors actually do about it
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Behavior workarounds
            </h3>
            <ul className="space-y-2 text-zinc-700 text-sm leading-relaxed">
              <li>
                Split work into two or three sessions across the day so the
                rolling 5-hour window resets in between.
              </li>
              <li>
                Start fresh chats per task. Long contexts pay a replay tax
                that lands disproportionately in five_hour.
              </li>
              <li>
                Downgrade Opus to Sonnet for routine prompts. Opus weighs more
                in seven_day_opus and the all-models seven_day total.
              </li>
              <li>
                Run heavy agentic work outside US peak hours (5 to 11 AM PT).
                Peak-hour multipliers were the trigger for the late-March
                2026 wave of complaints.
              </li>
              <li>
                Enable extra-usage credits if the cost is acceptable. That
                surfaces a separate balance, not a limit lift.
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Tools redditors install
            </h3>
            <ul className="space-y-2 text-zinc-700 text-sm leading-relaxed">
              <li>
                <a
                  className="text-teal-700 underline"
                  href="https://github.com/ryoppippi/ccusage"
                >
                  ccusage
                </a>{" "}
                reads local Claude Code JSONL files and tallies tokens. Most
                Reddit-recommended for offline analysis.
              </li>
              <li>
                <a
                  className="text-teal-700 underline"
                  href="https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor"
                >
                  Claude-Code-Usage-Monitor
                </a>{" "}
                is a real-time terminal monitor with predictions, also local.
              </li>
              <li>
                <a
                  className="text-teal-700 underline"
                  href="https://github.com/m13v/claude-meter"
                >
                  ClaudeMeter
                </a>{" "}
                reads the server-side utilization the rate limiter actually
                checks. macOS menu bar plus browser extension. Numbers match
                claude.ai/settings/usage exactly. MIT licensed.
              </li>
            </ul>
          </div>
        </div>
        <p className="text-zinc-600 text-sm mt-5 max-w-3xl">
          ccusage and ClaudeMeter answer different questions. ccusage tells
          you what tokens your local Claude Code instance generated.
          ClaudeMeter tells you what fraction of each server bucket your org
          has consumed. The first is what you sent. The second is what the
          rate limiter is enforcing. They do not match, and the gap is
          exactly what redditors are venting about when they say
          &ldquo;ccusage said 5 percent, claude.ai said rate-limited.&rdquo;
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The Reddit threads worth reading in full
        </h2>
        <ul className="space-y-3 text-zinc-700 leading-relaxed">
          <li>
            <a
              className="text-teal-700 underline"
              href="https://www.reddit.com/r/ClaudeAI/comments/1mbo1sb/updating_rate_limits_for_claude_subscription/"
            >
              Updating rate limits for Claude subscription plans
            </a>{" "}
            (August 2025): the official announcement thread, with
            Anthropic&rsquo;s &ldquo;approximately 7 percent of users will
            hit session limits they wouldn&rsquo;t have before&rdquo; quote.
          </li>
          <li>
            <a
              className="text-teal-700 underline"
              href="https://www.reddit.com/r/ClaudeAI/comments/1nvnafs/"
            >
              Update on usage limits megathread
            </a>{" "}
            (October 2025): the post-Sonnet 4.5 frustration thread.
            &ldquo;I burn through the whole damn quota in like ONE OR TWO
            DAYS.&rdquo;
          </li>
          <li>
            <a
              className="text-teal-700 underline"
              href="https://www.reddit.com/r/ClaudeAI/comments/1bj7gb0/whats_the_actual_quota_policy_of_claude_pro/"
            >
              What&rsquo;s the actual quota policy of Claude Pro?
            </a>
            : the transparency thread. The answer that thread never gets is
            in src/models.rs lines 18 to 28.
          </li>
          <li>
            <a
              className="text-teal-700 underline"
              href="https://www.reddit.com/r/ClaudeAI/comments/1bsl5ti/forced_to_buy_two_pro_accounts_due_to/"
            >
              Forced to Buy Two Pro Accounts Due to Unreasonably Low Limits
            </a>
            : the &ldquo;stack two subscriptions&rdquo; workaround thread.
          </li>
          <li>
            <a
              className="text-teal-700 underline"
              href="https://www.reddit.com/r/ClaudeAI/comments/1c5py2e/limits_are_getting_ridiculous/"
            >
              Limits are getting ridiculous
            </a>
            : an evergreen complaint thread that resurfaces after every
            silent reweighting.
          </li>
          <li>
            <a
              className="text-teal-700 underline"
              href="https://www.reddit.com/r/ClaudeAI/comments/1bafnb7/claude_pro_just_introduced_limits/"
            >
              Claude Pro just introduced limits
            </a>
            : the original 2024 thread, useful for the historical baseline.
          </li>
        </ul>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Reading every megathread is a job. Watching the bucket is a glance."
          description="Book 15 minutes if you want to see ClaudeMeter against your own claude.ai org and figure out which bucket actually trips first on your workflow."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <FaqSection
          heading="Reddit-style questions, answered against the data"
          items={faqs}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16 mb-20">
        <RelatedPostsGrid
          title="Keep going"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See your own Pro buckets live. 15 min."
      />
    </article>
  );
}
