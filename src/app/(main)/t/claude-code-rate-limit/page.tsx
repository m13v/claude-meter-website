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
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-rate-limit";
const PUBLISHED = "2026-05-16";

export const metadata: Metadata = {
  title:
    "Claude Code rate limit: 8 quota floats on one endpoint, 4 of them hidden",
  description:
    "The Claude Code rate limit is not one number. It is eight utilization floats on claude.ai /api/organizations/{org_uuid}/usage. Any one of them at 1.0 returns 429. claude.ai/settings/usage only renders four. Here are the field names, why ccusage cannot see them, and the one-line install that shows all eight.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code rate limit: 8 quota floats on one endpoint, 4 of them hidden",
    description:
      "The 429 you just got was one of eight server-side utilization floats hitting 1.0. The Settings page only shows four of them. Here are all eight, field by field, plus the brew command that puts them in your menu bar.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Guides", href: "/t/claude-code-usage-tracker" },
  { label: "Claude Code rate limit" },
];

const breadcrumbsForSchema = [
  { name: "Home", url: "https://claude-meter.com/" },
  { name: "Guides", url: "https://claude-meter.com/t/claude-code-usage-tracker" },
  { name: "Claude Code rate limit", url: PAGE_URL },
];

const usageResponseCode = `// /Users/<you>/claude-meter/src/models.rs  lines 19-28
pub struct UsageResponse {
    pub five_hour:             Option<Window>,  // shown
    pub seven_day:             Option<Window>,  // shown
    pub seven_day_sonnet:      Option<Window>,  // shown
    pub seven_day_opus:        Option<Window>,  // shown
    pub seven_day_oauth_apps:  Option<Window>,  // hidden
    pub seven_day_omelette:    Option<Window>,  // hidden
    pub seven_day_cowork:      Option<Window>,  // hidden
    pub extra_usage:           Option<ExtraUsage>, // hidden bar
}`;

const installLines = [
  { text: "brew install --cask m13v/tap/claude-meter", type: "command" as const },
  { text: "Installing claude-meter...", type: "output" as const },
  { text: "claude-meter was successfully installed!", type: "success" as const },
  { text: "claude-meter --json", type: "command" as const },
  {
    text: '{"five_hour":{"utilization":0.94,"resets_at":"2026-05-16T18:42:00Z"},',
    type: "output" as const,
  },
  {
    text: ' "seven_day":{"utilization":0.71,"resets_at":"2026-05-19T09:11:00Z"},',
    type: "output" as const,
  },
  {
    text: ' "seven_day_opus":{"utilization":0.88,"resets_at":"2026-05-19T09:11:00Z"},',
    type: "output" as const,
  },
  {
    text: ' "seven_day_oauth_apps":{"utilization":0.97,"resets_at":"2026-05-19T09:11:00Z"} ...',
    type: "output" as const,
  },
];

const floatsRows = [
  {
    feature: "five_hour",
    competitor: "Yes (top bar)",
    ours: "Rolling 5-hour window. Doubled on May 7, 2026.",
  },
  {
    feature: "seven_day",
    competitor: "Yes (second bar)",
    ours: "Weekly all-model bucket. NOT doubled in May.",
  },
  {
    feature: "seven_day_sonnet",
    competitor: "Yes (third bar)",
    ours: "Sonnet-only weekly cap.",
  },
  {
    feature: "seven_day_opus",
    competitor: "Yes (fourth bar)",
    ours: "Opus-only weekly cap. First wall on heavy refactor weeks.",
  },
  {
    feature: "seven_day_oauth_apps",
    competitor: "No",
    ours: "OAuth-authenticated weekly cap. Claude Code traffic counts here.",
  },
  {
    feature: "seven_day_omelette",
    competitor: "No",
    ours: "Anthropic-internal feature bucket. Surfaces in the JSON; never named in the UI.",
  },
  {
    feature: "seven_day_cowork",
    competitor: "No",
    ours: "Another internal feature bucket. Same story.",
  },
  {
    feature: "extra_usage.utilization",
    competitor: "No (a spend line, not a bar)",
    ours: "Metered overage cap. When this hits 1.0 you 429 with green bars.",
  },
];

const faqs = [
  {
    q: "What is the Claude Code rate limit in one number?",
    a: "There isn't one. Claude Code on Pro and Max is gated by eight separate utilization floats returned by GET claude.ai /api/organizations/{org_uuid}/usage. Each float lives between 0.0 and 1.0; any one of them hitting 1.0 returns a 429 on the next prompt. The four visible ones on claude.ai/settings/usage are five_hour, seven_day, seven_day_sonnet, and seven_day_opus. The four the UI does not show are seven_day_oauth_apps, seven_day_omelette, seven_day_cowork, and extra_usage.utilization. Field names verified in claude-meter's UsageResponse struct, src/models.rs lines 19-28.",
  },
  {
    q: "Why did Claude Code rate-limit me when my bars looked green on claude.ai?",
    a: "Because four of the eight enforcement floats are not rendered on claude.ai/settings/usage. The most common silent cause is extra_usage.utilization (your metered overage hit its monthly cap) and the second-most is seven_day_oauth_apps (the OAuth-only bucket Claude Code traffic counts toward separately). The five_hour bar can read 40 percent, the three model bars can read 50 to 70 percent, and the next prompt still 429s because one of the four hidden floats is at 1.0.",
  },
  {
    q: "When does the Claude Code rate limit reset?",
    a: "Each bucket carries its own resets_at timestamp in the JSON. The five-hour window rolls continuously: when you sent your oldest message in the current window ages off, that message's cost drops out and the float decreases. resets_at on the five_hour field is the timestamp of that next age-off, not a cliff reset to zero. Weekly buckets behave the same way over seven days. ClaudeMeter prints the per-bucket reset clock as a local timestamp ('-> resets Sat May 16 18:42 (in 2h)') in src/format.rs lines 90-113.",
  },
  {
    q: "Did the Claude Code rate limit actually double in May 2026?",
    a: "Only the five_hour float did. Anthropic announced on May 7, 2026 that the 5-hour rate limit doubled for Pro, Max, Team, and seat-based Enterprise, and peak-hour throttling was removed for Pro and Max. The weekly caps (seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps) were not changed. In practice many heavy users now hit the weekly walls earlier in the week instead of bumping into the 5-hour wall mid-flow.",
  },
  {
    q: "Why does ccusage say I have headroom right before Claude Code 429s?",
    a: "ccusage reads ~/.claude/projects/<project>/<session>.jsonl on your machine and sums token counts against a price card. The plan limits Anthropic enforces live as the eight utilization floats on its server. The two are different data sources answering different questions. ccusage is good for 'what would these prompts have cost at API prices?' It cannot read the server quota because the server quota is not in your local logs. ClaudeMeter reads the server quota directly; running both is reasonable.",
  },
  {
    q: "How do I see my real Claude Code rate-limit numbers before the 429?",
    a: "Install ClaudeMeter: brew install --cask m13v/tap/claude-meter, then load the browser extension from the GitHub releases page once. The extension polls /api/organizations/{org}/usage every 60 seconds using your existing claude.ai cookies (no password, no token, no manual cookie paste) and POSTs the parsed snapshot to a localhost-only bridge on 127.0.0.1:63762 (BRIDGE constant in extension/background.js line 2). The menu-bar app redraws the four visible bars plus the four hidden floats. You can also run /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json for a one-shot JSON dump in a terminal or tmux status line.",
  },
  {
    q: "Does this work with Claude Code on the API tier, or only with Pro/Max?",
    a: "Pro and Max only. The /api/organizations/{org_uuid}/usage endpoint is part of the claude.ai web account surface; it returns plan-utilization floats for subscription seats. API-key-only customers do not have a 'plan quota' in that sense, they have per-key rate limits that surface as 429 headers on the Anthropic API itself. ClaudeMeter is built for the subscription cohort because that is the cohort whose limits are invisible until they fire.",
  },
  {
    q: "What does 'rate limit reached, please try again later' inside Claude Code actually mean?",
    a: "It means your last prompt would have crossed 1.0 on one of the eight floats. The CLI does not tell you which float because Anthropic's 429 response body does not disambiguate. The only ways to find out are: (a) open DevTools on claude.ai/settings/usage and check the network call to /usage to see which field is at 1.0, (b) curl http://127.0.0.1:63762/snapshots with ClaudeMeter running and inspect the parsed snapshot, or (c) run claude-meter --json directly. Knowing which float fired matters because the reset clock is different for each bucket.",
  },
  {
    q: "Is it safe to run a Rust binary that reads my claude.ai cookies?",
    a: "ClaudeMeter is MIT-licensed open source; the entire data path is in /Users/<you>/claude-meter/src/. Two routes exist: the browser-extension route never touches your cookie jar (the extension calls the API with credentials: 'include' and posts the parsed snapshot to localhost), and the keychain route shells out to security find-generic-password to read Chrome Safe Storage on your own machine. Anonymous telemetry is opt-out, no analytics, no network egress of usage data beyond claude.ai itself. The bridge listens on 127.0.0.1:63762 (loopback only), so nothing on your LAN can reach it.",
  },
  {
    q: "Will Anthropic change the endpoint or block third-party readers?",
    a: "The endpoint is undocumented and could change at any time. It has not changed in the year since claude.ai/settings/usage shipped. Because ClaudeMeter is a thin parser over the same JSON the Settings page renders, breakages tend to be field-shape changes that update with a one-line patch to src/models.rs. Anthropic has never blocked the endpoint behind a CSRF check or per-request token; the only auth is the same session cookie your browser already holds.",
  },
];

const relatedPosts = [
  {
    title: "The Claude Code rolling 5-hour wall is one float on one endpoint",
    href: "/t/claude-code-rolling-5-hour-wall",
    excerpt:
      "Drilling into five_hour.utilization specifically: how the rolling age-off works, why resets_at is not a cliff, and the one-minute poll that watches it.",
    tag: "Deep dive",
  },
  {
    title: "Claude Code Max usage limits: the float they actually come from",
    href: "/t/claude-code-max-usage-limits",
    excerpt:
      "Max plans get higher denominators on the same eight floats, not a separate prompt count. Why blog posts disagree on '~200 prompts per session' for Max 5x.",
    tag: "Plans",
  },
  {
    title: "Claude rate limit dashboard: what it has to render",
    href: "/t/claude-rate-limit-dashboard",
    excerpt:
      "Anthropic does not ship a rate-limit dashboard for individual Pro/Max users. Building one from the eight floats: thresholds, multi-account composition, localhost bridge.",
    tag: "Reference",
  },
];

const articleJsonLd = articleSchema({
  url: PAGE_URL,
  headline:
    "Claude Code rate limit: 8 quota floats on one endpoint, 4 of them hidden",
  description:
    "There is no single Claude Code rate-limit number. Anthropic enforces eight separate utilization floats on claude.ai /api/organizations/{org_uuid}/usage and renders only four of them on claude.ai/settings/usage. Field-by-field walkthrough, why ccusage cannot see them, and the brew install that shows all eight.",
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "ClaudeMeter",
  publisherUrl: "https://claude-meter.com",
});

const breadcrumbJsonLd = breadcrumbListSchema(breadcrumbsForSchema);
const faqJsonLd = faqPageSchema(faqs);

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-8 pb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <header className="mx-auto max-w-3xl px-4 sm:px-6 pt-2 pb-6">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
          The Claude Code rate limit is{" "}
          <GradientText>eight floats</GradientText>, not one number
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-zinc-600 leading-relaxed">
          Your 429 came from one of them crossing 1.0. The Claude settings page
          shows four. The other four can pin to 1.0 with every visible bar
          still green. Here is what is actually in the payload, why your local
          token counter cannot see it, and the brew command that puts all
          eight in your menu bar.
        </p>
        <div className="mt-6">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="6 min read"
          />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-10">
        <GlowCard>
          <div className="p-5 sm:p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Direct answer, verified May 16, 2026
            </div>
            <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-zinc-900">
              There is no single Claude Code rate-limit number.
            </h2>
            <p className="mt-3 text-zinc-700 leading-relaxed">
              Claude Code on Pro and Max is gated by{" "}
              <strong>eight utilization floats</strong> returned by a
              cookie-authenticated GET to{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px] text-zinc-800">
                /api/organizations/&#123;org_uuid&#125;/usage
              </code>{" "}
              on claude.ai. Any one of them at <code>1.0</code> returns a
              429 on the next prompt. The 5-hour float was doubled on May 7, 2026; the four
              weekly caps were not. Source:{" "}
              <a
                className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
                href="https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan"
                rel="noopener"
              >
                Anthropic support article on Claude Code with Pro/Max
              </a>
              .
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          The eight floats, named
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          Below is the exact Rust struct claude-meter deserializes the{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px] text-zinc-800">
            /usage
          </code>{" "}
          response into. Each <code>Option&lt;Window&gt;</code> is one
          utilization float plus its own{" "}
          <code>resets_at</code> timestamp. The comments are mine; the field
          names are exactly what Anthropic returns.
        </p>
        <div className="mt-6">
          <AnimatedCodeBlock
            code={usageResponseCode}
            language="rust"
            filename="claude-meter/src/models.rs"
          />
        </div>
        <p className="mt-6 text-zinc-700 leading-relaxed">
          That is the contract. Marketing numbers like &quot;Max 20x&quot; or
          &quot;~45 prompts per 5-hour window&quot; are downstream estimates
          that wobble with model choice, context length, and tokenizer
          version. The floats are the truth.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <ComparisonTable
          heading="What the Settings page shows you, and what it doesn&#39;t"
          intro="claude.ai/settings/usage renders four bars. The JSON it fetches contains four more fields that no UI surface ever exposes."
          productName="ClaudeMeter (all 8)"
          competitorName="claude.ai/settings/usage"
          rows={floatsRows}
        />
        <p className="mt-6 text-zinc-700 leading-relaxed">
          The two most common silent 429 culprits are{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px] text-zinc-800">
            extra_usage.utilization
          </code>{" "}
          (your metered overage cap is exhausted) and{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px] text-zinc-800">
            seven_day_oauth_apps
          </code>{" "}
          (Claude Code traffic specifically counts toward an OAuth-only weekly
          bucket on top of every other bucket it touches). Neither shows up
          as a bar on the Settings page. Both can pin to 1.0 with every
          visible bar still in the green.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          When does the rate limit reset?
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          Every bucket carries its own{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px] text-zinc-800">
            resets_at
          </code>{" "}
          timestamp. None of them is a cliff. The 5-hour window rolls: the
          cost of message one ages off five hours after message one, the cost
          of message two ages off five hours after message two, and so on.
          The <code>resets_at</code> field on{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px] text-zinc-800">
            five_hour
          </code>{" "}
          is the time of the next single age-off, not the moment the bar
          returns to 0 percent. Same for the weekly fields over a seven-day
          window.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Practically: if you burned through the bucket in a single 30-minute
          burst, the bar drops in a single step five hours after that burst.
          If you spread it across four hours, the bar drains in four steps
          over the next four hours. ClaudeMeter renders the local-clock
          version of <code>resets_at</code> as &quot;-&gt; resets Sat May 16
          18:42 (in 2h)&quot; so you can stop refreshing the Settings page.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          See all eight floats in 30 seconds
        </h2>
        <StepTimeline
          steps={[
            {
              title: "1. Install the menu-bar app",
              description:
                "Single brew cask. macOS 12+. No keychain prompt if you also load the extension in step 2.",
            },
            {
              title: "2. Load the browser extension once",
              description:
                "Clone the repo, open chrome://extensions, enable Developer mode, Load unpacked → extension/. Pin the icon. The extension calls /api/organizations/{org}/usage with the cookies you already have and posts the snapshot to a loopback bridge.",
            },
            {
              title: "3. Visit claude.ai once",
              description:
                "The first poll fires on chrome.alarms with POLL_MINUTES = 1 (extension/background.js line 3). Your menu bar lights up within a minute. claude-meter --json prints the same payload to stdout for tmux or Starship.",
            },
          ]}
        />
        <div className="mt-8">
          <TerminalOutput lines={installLines} title="Local terminal" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Why ccusage cannot tell you this
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          ccusage is great. It reads{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px] text-zinc-800">
            ~/.claude/projects/&lt;project&gt;/&lt;session&gt;.jsonl
          </code>{" "}
          and sums input and output tokens against a model price card.
          That is a cost calculator for tokens that left your laptop.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The plan quota is not in your local logs. It is on Anthropic&#39;s
          server, as the eight utilization floats above. claude.ai web chat
          fills the same buckets but never writes to your local JSONL.
          Server-side cache reweighting (cached prefixes at 0.10x, cold-turn
          input at 1.25x) means even your tracked tokens do not sum to the
          server&#39;s float. Two different numbers, two different questions.
          Run both tools side by side; they answer different things.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-4">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Burning through your weekly quota by Tuesday?"
          description="20-minute call. Walk through what your eight floats actually look like on a heavy week and whether ClaudeMeter changes anything for your workflow."
        />
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <FaqSection items={faqs} />
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <RelatedPostsGrid posts={relatedPosts} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See your real Claude Code quota in your menu bar."
      />
    </article>
  );
}
