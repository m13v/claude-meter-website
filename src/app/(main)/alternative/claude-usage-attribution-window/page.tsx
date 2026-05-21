import type { Metadata } from "next";
import {
  Breadcrumbs,
  FaqSection,
  ComparisonTable,
  TerminalOutput,
  AnimatedCodeBlock,
  StepTimeline,
  MetricsRow,
  GradientText,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/alternative/claude-usage-attribution-window";
const PUBLISHED = "2026-05-21";

export const metadata: Metadata = {
  title:
    "Claude usage attribution vs the server window: why your local count lies",
  description:
    "ccusage attributes one token sum to wall-clock time. Anthropic's server attributes every request across up to seven independent rolling windows, each with its own reset clock. That gap is why '5% used' locally can be the same minute claude.ai 429s you.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude usage attribution vs the server window: why your local count lies",
    description:
      "Local token counters track one number on one timeline. The server tracks seven named windows with seven reset clocks and rate-limits on whichever hits 100% first.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Alternatives", url: "https://claude-meter.com/alternative" },
  { name: "Usage attribution vs server window", url: PAGE_URL },
];

const breadcrumbCrumbs = breadcrumbs.map((b) => ({
  label: b.name,
  href: b.url,
}));

const rustStruct = `// claude-meter/src/models.rs — the exact shape it deserializes.
// Every field is a separate rolling window the server scores you on.

pub struct Window {
    pub utilization: f64,                          // 0.0 .. 100.0
    pub resets_at: Option<DateTime<Utc>>,          // this window's OWN clock
}

pub struct UsageResponse {
    pub five_hour:            Option<Window>,       // the rolling 5-hour wall
    pub seven_day:            Option<Window>,       // weekly, all models
    pub seven_day_sonnet:     Option<Window>,       // weekly, Sonnet only
    pub seven_day_opus:       Option<Window>,       // weekly, Opus only
    pub seven_day_oauth_apps: Option<Window>,       // weekly, OAuth surfaces
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,   // metered $ spillover
}`;

const comparisonRows = [
  {
    feature: "What gets counted",
    competitor: "A sum of input_tokens + output_tokens parsed from local JSONL",
    ours: "The server's own utilization float per window, weighted before you see it",
  },
  {
    feature: "How many buckets",
    competitor: "One number, one running total",
    ours: "Up to seven named windows scored in parallel on every request",
  },
  {
    feature: "Time attribution",
    competitor: "Your machine's wall clock and file timestamps",
    ours: "Each window's own resets_at, anchored server-side, not to your clock",
  },
  {
    feature: "Which one rate-limits you",
    competitor: "Cannot tell — it has no window concept",
    ours: "Whichever window crosses 100% first; claude-meter shows all of them",
  },
  {
    feature: "Per-model splits (Opus vs Sonnet)",
    competitor: "Lumped into one total",
    ours: "seven_day_opus and seven_day_sonnet tracked separately",
  },
  {
    feature: "Other surfaces (browser chats, agents)",
    competitor: "Invisible — only sees Claude Code's local files",
    ours: "Counted by the server and surfaced; nothing hides off-machine",
  },
];

const attributionSteps = [
  {
    title: "You send one Opus turn in Claude Code",
    description:
      "Locally, that turn appends a single row to ~/.claude/projects/*.jsonl: input_tokens, output_tokens, a timestamp. ccusage adds those two numbers to a running total. One bucket, one clock.",
  },
  {
    title: "The server fans that one turn out",
    description:
      "Same request hits five_hour, seven_day, seven_day_opus, and (because Claude Code authenticates over OAuth) seven_day_oauth_apps. One turn, attributed to four windows at once.",
  },
  {
    title: "Each window weights it differently",
    description:
      "The server applies a model multiplier and surface weighting before incrementing each utilization float. The Opus window climbs faster than the all-models window from the identical turn.",
  },
  {
    title: "Each window resets on its own clock",
    description:
      "five_hour rolls off ~5 hours after the request that opened the window. The seven_day family rolls on a weekly anchor. Your local file has no idea which clock applies.",
  },
  {
    title: "The limiter blocks on the first to hit 100%",
    description:
      "If seven_day_opus is at 96% and your local sum reads 5%, you get a 429. The number that stops you was never on your machine. That is the attribution gap.",
  },
];

const faqs = [
  {
    q: "What does 'usage attribution vs server window' actually mean?",
    a: "Attribution is the act of assigning a unit of usage to a bucket. A local tool like ccusage attributes your tokens to one running total keyed to your machine's clock. The server attributes the same request to up to seven named rolling windows, each with its own utilization score and its own reset time. The question 'where does this turn count?' has one answer locally and up to seven answers on the server. Rate limiting happens on the server's answer, not yours.",
  },
  {
    q: "Why does ccusage say 5% used while claude.ai rate-limits me?",
    a: "Because they are attributing to different things. ccusage sums the input and output tokens it finds in your local JSONL files and divides by an assumed cap. The server does not rate-limit on that sum. It rate-limits on whichever of its rolling windows crosses 100% first, after applying model and surface weights you never see. A single heavy Opus week can push seven_day_opus to 100% while your raw token count looks modest. There is no bug; the two systems attribute usage on different axes.",
  },
  {
    q: "How many windows does the server actually track?",
    a: "claude-meter deserializes seven: five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, and seven_day_cowork, plus a separate extra_usage block for metered dollar spillover. You can see the exact struct in claude-meter/src/models.rs. Anthropic can add or rename windows; claude-meter reads whatever the endpoint returns rather than guessing from token math.",
  },
  {
    q: "Can a local-log tool ever match the server window?",
    a: "No, and not because it is written badly. The weights, the per-window splits, the surface attribution, and the reset clocks all live server-side and are never written to your JSONL. A token counter can estimate token volume well; it structurally cannot reconstruct which window you are about to hit or when it resets. Those are different jobs. ccusage answers 'how many tokens did this session burn'; claude-meter answers 'which window stops me next, and when does it clear'.",
  },
  {
    q: "Where does claude-meter get its numbers, then?",
    a: "From the same internal endpoint claude.ai/settings/usage renders: /api/organizations/{uuid}/usage. The browser extension forwards your existing claude.ai session every 60 seconds, the menu-bar app reads the response, and the numbers match the settings page because they are the settings page's numbers. No token estimation, no cookie paste, no telemetry leaving your machine.",
  },
  {
    q: "Do I still need ccusage if I run claude-meter?",
    a: "They answer different questions, so many people run both. ccusage is excellent for per-session token accounting and cost breakdowns from local data. claude-meter is for the live plan-quota picture: which of the seven rolling windows you are burning and how long until each resets. Use ccusage to understand a session's token footprint; use claude-meter to know whether your next prompt gets a 429.",
  },
  {
    q: "Is claude-meter free and open source?",
    a: "Yes. MIT licensed, no telemetry, a single HTTPS request per minute to claude.ai using your own session. The macOS menu-bar app and the browser extension are both on GitHub at github.com/m13v/claude-meter. It supports Claude Pro and Max on macOS 12+, with extensions for Chrome, Arc, Brave, and Edge.",
  },
];

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline:
                "Claude usage attribution vs the server window: why your local count lies",
              description:
                "Local token counters attribute one summed number to wall-clock time. Anthropic's server attributes every request across up to seven independent rolling windows with seven reset clocks. That is the real reason local usage and the enforced window disagree.",
              url: PAGE_URL,
              datePublished: PUBLISHED,
              dateModified: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "claude-meter",
              publisherUrl: "https://claude-meter.com",
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbListSchema(breadcrumbs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema(faqs)),
        }}
      />

      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <Breadcrumbs items={breadcrumbCrumbs} />

        <header className="mt-6">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-600">
            Attribution vs the server window
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
            Your local count and the{" "}
            <GradientText>window that 429s you</GradientText> are not the same
            number
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-600">
            If ccusage reads 5% and claude.ai still tells you to come back later,
            nothing is broken. The two tools attribute your usage to different
            things. One sums tokens on your clock. The other scores you across
            seven rolling windows on its clock, and stops you on whichever fills
            first.
          </p>
        </header>

        {/* DIRECT ANSWER */}
        <GlowCard>
          <div className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Direct answer (verified 2026-05-21)
            </p>
            <p className="mt-2 text-base leading-relaxed text-zinc-800">
              Local counters attribute one token sum to wall-clock time.
              Anthropic&apos;s server attributes each request across up to{" "}
              <strong className="text-zinc-900">
                seven independent rolling windows
              </strong>{" "}
              (the rolling 5-hour window, the weekly window, plus per-model and
              per-surface weekly windows), each with its own utilization score
              and its own reset clock. The limiter blocks on whichever window
              hits 100% first, so the number that stops you is rarely the one
              your local count maps to.
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              Source of truth:{" "}
              <a
                href="https://claude.ai/settings/usage"
                className="font-medium text-teal-600 underline underline-offset-2"
              >
                claude.ai/settings/usage
              </a>
              , rendered from the internal{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-[13px] text-zinc-700">
                /api/organizations/&#123;uuid&#125;/usage
              </code>{" "}
              endpoint.
            </p>
          </div>
        </GlowCard>

        <section className="mt-12">
          <MetricsRow
            metrics={[
              { value: 7, label: "rolling windows the server scores per account" },
              { value: 7, label: "independent reset clocks, one per window" },
              { value: 1, label: "number a local token counter can report" },
            ]}
          />
        </section>

        {/* THE ANCHOR: what the endpoint really returns */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-zinc-900">
            What the server actually returns
          </h2>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            This is the response behind the usage page, fetched with your own
            session cookie. It is not a token total. It is a list of windows,
            each already weighted, each with its own clock.
          </p>
          <div className="mt-6">
            <TerminalOutput
              title="claude.ai/api/organizations/{uuid}/usage"
              lines={[
                { text: "curl -s 'https://claude.ai/api/organizations/{uuid}/usage' | jq .", type: "command" },
                { text: '{', type: "output" },
                { text: '  "five_hour":            { "utilization": 96.4, "resets_at": "2026-05-21T19:10:00Z" },', type: "error" },
                { text: '  "seven_day":            { "utilization": 71.0, "resets_at": "2026-05-26T00:00:00Z" },', type: "output" },
                { text: '  "seven_day_sonnet":     { "utilization": 22.8, "resets_at": "2026-05-26T00:00:00Z" },', type: "output" },
                { text: '  "seven_day_opus":       { "utilization": 88.1, "resets_at": "2026-05-26T00:00:00Z" },', type: "output" },
                { text: '  "seven_day_oauth_apps": { "utilization": 40.3, "resets_at": "2026-05-26T00:00:00Z" },', type: "output" },
                { text: '  "seven_day_omelette":   { "utilization": 12.0, "resets_at": "2026-05-26T00:00:00Z" },', type: "output" },
                { text: '  "seven_day_cowork":     { "utilization":  3.5, "resets_at": "2026-05-26T00:00:00Z" }', type: "output" },
                { text: '}', type: "output" },
                { text: "five_hour is at 96.4%. Your local token count has no row for that.", type: "success" },
              ]}
            />
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Values above are illustrative of the shape, not your account. The
            field names are exact: they are the keys claude-meter parses on
            every poll.
          </p>
        </section>

        {/* ANCHOR FACT: the struct */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-zinc-900">
            The seven windows, named
          </h2>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            You do not have to take my word for the count. Here is the struct
            claude-meter deserializes the response into, straight from{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-[13px] text-zinc-700">
              src/models.rs
            </code>
            . Each field is a window. Each window carries its own{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-[13px] text-zinc-700">
              resets_at
            </code>
            .
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={rustStruct}
              language="rust"
              filename="claude-meter/src/models.rs"
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A local-log tool parses two integers per turn and a timestamp. There
            is no field in your JSONL for &quot;which of these seven windows did
            this turn move, and by how much.&quot; That information is computed
            server-side and only ever exists in the response above. That is the
            uncopyable part: claude-meter reports the windows because it reads
            them, not because it estimates them.
          </p>
        </section>

        {/* HOW ONE TURN FANS OUT */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-zinc-900">
            How one turn becomes four windows
          </h2>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            Follow a single Opus prompt from your terminal to the rate limiter.
            This is where local attribution and server attribution split apart.
          </p>
          <div className="mt-8">
            <StepTimeline steps={attributionSteps} />
          </div>
        </section>

        {/* COMPARISON */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-zinc-900">
            Two ways to attribute the same usage
          </h2>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            ccusage and Claude-Code-Usage-Monitor read your local data well.
            They were built to answer a token question, and they answer it. The
            window question lives somewhere they cannot reach.
          </p>
          <div className="mt-6">
            <ComparisonTable
              productName="claude-meter (server windows)"
              competitorName="Local token counter"
              rows={comparisonRows}
              caveat="Not a knock on local-log tools. They estimate token volume; claude-meter reads the enforced windows. Different axes, both useful."
            />
          </div>
        </section>

        {/* RECOMMENDATION / WHEN THE OTHER WINS */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-zinc-900">
            When the local counter is the right tool
          </h2>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            If your question is &quot;how many tokens did this refactor cost&quot;
            or &quot;which session was the expensive one,&quot; a local-log tool
            is the better answer. It walks every turn in your JSONL and gives you
            a clean per-session breakdown that the usage endpoint does not expose.
            For cost accounting on local data, reach for ccusage.
          </p>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            If your question is &quot;why did I just get a 429 when I barely
            used anything&quot; or &quot;how long until the wall clears,&quot;
            that answer only exists in the seven windows. That is the gap
            claude-meter fills, and it is the gap a token estimate cannot close
            no matter how good the estimate is.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Still not sure which window keeps stopping you?"
          description="Walk through your own usage endpoint with me and I'll show you which of the seven windows is the real wall."
        />

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-zinc-900">
            Questions people actually ask
          </h2>
          <div className="mt-6">
            <FaqSection items={faqs} />
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-teal-200 bg-teal-50 p-6">
          <h2 className="text-xl font-bold text-zinc-900">See your real windows</h2>
          <p className="mt-2 text-zinc-700 leading-relaxed">
            One brew command, install the extension, visit claude.ai once. The
            menu bar lights up within a minute with the same numbers the settings
            page shows, all seven windows, live.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://claude-meter.com/install"
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Install claude-meter
            </a>
            <a
              href="https://github.com/m13v/claude-meter"
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700"
            >
              Read the source
            </a>
          </div>
          <p className="mt-3 text-sm text-zinc-500">
            Related read:{" "}
            <a
              href="https://claude-meter.com/alternative/server-truth-vs-local-claude-logs"
              className="font-medium text-teal-600 underline underline-offset-2"
            >
              the five weights your JSONL cannot see
            </a>
            .
          </p>
        </section>
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See which of the seven windows is your real wall."
      />
    </article>
  );
}
