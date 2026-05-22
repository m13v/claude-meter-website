import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-max-5-hour-rolling-window-server-tracked";
const PUBLISHED = "2026-05-21";

export const metadata: Metadata = {
  title:
    "Claude Max 5-hour rolling window: how it is server-tracked, not counted",
  description:
    "On Claude Max the 5-hour window is not a prompt counter. The server tracks it as a single utilization float that it recomputes continuously over a rolling age-off, which is why your bar can move while you send nothing. Here is the field, the endpoint, and why local token tools cannot see it.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Max 5-hour rolling window: how it is server-tracked, not counted",
    description:
      "The five_hour bucket is a server-computed utilization fraction on claude.ai/api/organizations/{org_uuid}/usage, recomputed over a rolling age-off. Verified from the open-source claude-meter source.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "Claude Max 5-hour rolling window, server-tracked",
    url: PAGE_URL,
  },
];

const faqs = [
  {
    q: "How does the server track the Claude Max 5-hour window?",
    a: "As a single float. On GET claude.ai/api/organizations/{org_uuid}/usage the five_hour field is a Window object with two members: utilization (a number between 0.0 and 1.0) and resets_at (an ISO 8601 timestamp). The server does not return a prompt count or a token count for the window. It returns the fraction of your effective ceiling you are currently using, recomputed on its side. The open-source claude-meter app deserializes exactly that shape in src/models.rs lines 18 to 28.",
  },
  {
    q: "Why does my 5-hour bar move when I am not sending anything?",
    a: "Because it is a rolling window, not a fixed timer that resets at one instant. Each message you send has its own 5-hour age-off clock. As the oldest messages cross the 5-hour mark they drop out of the window, so utilization falls on its own, with no action from you. The server recomputes the fraction continuously, which is why the number drifts down between prompts and why resets_at slides forward as new messages enter the window.",
  },
  {
    q: "Is utilization the same as a percentage?",
    a: "Almost. The server is inconsistent about scale, so the claude-meter browser extension normalizes both shapes. In extension/background.js the helper pctFromWindow does: const u = w.utilization; return u <= 1 ? u * 100 : u. A value of 0.97 means 97 percent, and a raw 97 also means 97 percent. If you call the endpoint yourself, branch on u <= 1 before multiplying or you will show 9700 percent.",
  },
  {
    q: "Can ccusage or Claude-Code-Usage-Monitor show me the server-tracked 5-hour number?",
    a: "No. Those tools read ~/.claude/projects/**/*.jsonl on your disk and sum tokens against a model price card. That is an accurate local numerator. It is not utilization. The server fold-ins (peak-hour weighting, browser chat traffic, traffic from other devices on the same account, OAuth-app calls) never appear in your local files, and the denominator Anthropic divides by is private. They answer 'what did Claude Code burn locally', not 'how close is the server to 429ing me'. The tools are complementary, not replacements.",
  },
  {
    q: "When exactly does the 5-hour window start?",
    a: "5 hours after your first message of the current rolling window. Each subsequent message ages off on its own clock. resets_at is the next age-off boundary, so it is not a single weekly-style reset moment. If you show up at the listed resets_at expecting zero and the bar still reads 40 percent, that is because later messages in the window have not aged off yet.",
  },
  {
    q: "Did the May 6, 2026 rate-limit change touch the 5-hour window?",
    a: "Yes. Anthropic doubled the 5-hour rate limit on Pro, Max, Team, and seat-based Enterprise plans on May 6, 2026 (announcement: 'Increased rate limits on Claude Code for Pro, Max, Team and Enterprise users'). That changes the denominator, so the same workload produces a lower five_hour.utilization than before. The weekly caps were not doubled, so the most common Max surprise after May 6 is a healthy 5-hour bar while a weekly bucket quietly climbs.",
  },
  {
    q: "How do I read the server-tracked number myself, without installing anything?",
    a: "Open claude.ai/settings/usage with DevTools, switch to the Network tab, filter for /usage, and refresh. The response of GET /api/organizations/{org_uuid}/usage is the raw JSON, with five_hour.utilization and five_hour.resets_at right there. That is the exact value the rate limiter checks, the same one the Settings page renders as its top horizontal bar.",
  },
  {
    q: "How often does claude-meter re-read the server number?",
    a: "Every 60 seconds. POLL_MINUTES = 1 in extension/background.js. Because utilization slides continuously as messages age off, sampling once a minute matches the resolution a human can act on and stays below the rate at which the float typically changes in a heavy session. The macOS menu bar app and the browser extension share one fetch over a localhost bridge so the request rate to claude.ai is not doubled.",
  },
];

const usageJson = `// GET https://claude.ai/api/organizations/{org_uuid}/usage
// The server returns a fraction, not a prompt count.
{
  "five_hour": {
    "utilization": 0.83,        // 83% of your effective 5-hour ceiling
    "resets_at": "2026-05-21T19:40:00Z"
  },
  "seven_day":        { "utilization": 0.41, "resets_at": "2026-05-26T09:00:00Z" },
  "seven_day_opus":   { "utilization": 0.58, "resets_at": "2026-05-26T09:00:00Z" }
  // ...more weekly buckets on Max
}
// There is no "messages_used" or "tokens" field. The denominator
// (your plan's effective ceiling, under the current weighting) is private.`;

const modelsRsCode = `// claude-meter/src/models.rs (lines 18-28)
// The whole 5-hour "window" is two numbers.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,                       // 0.0 .. 1.0 (sometimes 0..100)
    pub resets_at: Option<DateTime<Utc>>,       // next age-off boundary
}

// On the parent UsageResponse, five_hour is one of seven Window fields.
// Pro returns three; Max returns all seven. None of them carry a count.`;

const liveOutput = [
  { type: "command" as const, text: "$ claude-meter status" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour           83.0% used    -> resets Wed May 21 19:40 (in 1h 06m)" },
  { type: "output" as const, text: "7-day all        41.0% used    -> resets Mon May 26 09:00 (in 4d 19h)" },
  { type: "output" as const, text: "7-day Opus       58.0% used    -> resets Mon May 26 09:00 (in 4d 19h)" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "fetched 2026-05-21 18:34:11 PDT   founder@example.com via Chrome" },
  { type: "success" as const, text: "5-hour is the wall today. ~1h until enough messages age off to drop below the ceiling." },
];

const mechanismSteps = [
  {
    title: "You send a message.",
    description:
      "The server timestamps it and weights it. Not every message costs the window equally: peak-hour multipliers and model weighting fold in on the server. The weight is invisible to your machine, which is the first reason a local token sum cannot reproduce the number.",
  },
  {
    title: "The server divides, it does not count.",
    description:
      "It sums the weighted, still-in-window messages and divides by your plan's effective 5-hour ceiling. The result is five_hour.utilization, a fraction. The ceiling (the denominator) is never sent on the wire, so the only honest source of the fraction is the server itself.",
  },
  {
    title: "Old messages age off on their own clock.",
    description:
      "Each message leaves the window 5 hours after it was sent. As the oldest ones drop, the numerator shrinks and utilization falls, with no input from you. resets_at is the next age-off boundary, so it slides as the window contents change.",
  },
  {
    title: "At utilization 1.0, the next prompt 429s.",
    description:
      "The rate limiter checks the float, not a prompt tally. When five_hour.utilization reaches 1.0 your next message is rejected. It clears not at a fixed reset moment but as enough messages age off to push the fraction back under the ceiling.",
  },
  {
    title: "claude-meter samples the float every 60 seconds.",
    description:
      "Because the number slides continuously, claude-meter (MIT, github.com/m13v/claude-meter) polls GET /api/organizations/{org_uuid}/usage once a minute and pins five_hour to the menu bar with its live resets_at. The browser extension hands the logged-in claude.ai session to the macOS app, so there is no cookie paste and no expiring token.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-max-rolling-5-hour-weekly-limit",
    title: "Claude Max rolling 5-hour weekly limit: the two limits are actually four",
    excerpt:
      "Max enforces five_hour plus several weekly buckets, each its own utilization float and its own 429. The full field list and the May 6, 2026 doubling.",
    tag: "Buckets",
  },
  {
    href: "/t/claude-server-quota-visibility",
    title: "Why token counters cannot see what Anthropic actually enforces",
    excerpt:
      "Utilization is a fraction with a private denominator. A local token sum has the numerator but never the denominator, so it cannot equal the server quota.",
    tag: "Server truth",
  },
  {
    href: "/t/claude-rolling-5-hour-reset",
    title: "Claude rolling 5-hour reset: each message ages off on its own clock",
    excerpt:
      "The window does not reset to zero at one instant. Each message has its own 5-hour age-off clock. Why people arrive at resets_at and find the bar still high.",
    tag: "Reset semantics",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Max 5-hour rolling window: how it is server-tracked, not counted",
  description:
    "On Claude Max the 5-hour window is a single server-computed utilization float on claude.ai/api/organizations/{org_uuid}/usage, recomputed continuously over a rolling age-off. Local token tools cannot reproduce it because the denominator is private. Verified from the open-source claude-meter source on 2026-05-21.",
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

export default function ClaudeMax5HourServerTrackedPage() {
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

      <BackgroundGrid>
        <header className="max-w-3xl mx-auto px-6 pb-6 pt-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-zinc-900">
            The Claude Max 5-hour window is{" "}
            <GradientText>server-tracked, not counted.</GradientText>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-zinc-600 leading-relaxed">
            People picture the rolling 5-hour limit as a tally of prompts that
            ticks up and zeroes out every five hours. It is not. The server
            tracks it as one floating-point fraction it recomputes
            continuously over a rolling age-off. That single design choice
            explains why your bar drifts while you send nothing, why the reset
            never lands cleanly, and why no local token tool can show you the
            real number.
          </p>
        </header>
      </BackgroundGrid>

      <div className="pt-2 max-w-3xl mx-auto">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="5 min read"
        />
      </div>

      <section className="max-w-3xl mx-auto px-6 mt-10">
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-5 sm:p-6">
          <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold">
            Direct answer (verified 2026-05-21)
          </p>
          <p className="mt-3 text-zinc-900 text-base sm:text-lg leading-relaxed">
            Claude Max&apos;s 5-hour window is server-tracked as a{" "}
            <strong>single utilization float</strong>, not a prompt count. On{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono break-all">
              claude.ai/api/organizations/&#123;org_uuid&#125;/usage
            </code>{" "}
            the{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              five_hour
            </code>{" "}
            field is a Window object with{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              utilization
            </code>{" "}
            (0.0 to 1.0) and{" "}
            <code className="bg-white px-1 py-0.5 rounded text-sm font-mono">
              resets_at
            </code>{" "}
            (an ISO 8601 timestamp). The server recomputes the fraction over a
            rolling age-off, so it can fall while you are idle. The rate
            limiter checks that float; at 1.0 your next message returns a 429.
            You can confirm the shape in the open-source claude-meter source (
            <a
              className="text-teal-700 underline"
              href="https://github.com/m13v/claude-meter"
            >
              github.com/m13v/claude-meter
            </a>
            , src/models.rs lines 18-28).
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What the server actually returns
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          Here is the relevant slice of the live response for a Max account
          mid-session. Note what is missing: there is no{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            messages_used
          </code>{" "}
          and no{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            tokens
          </code>{" "}
          field for the window. Just a fraction and a reset time.
        </p>
        <AnimatedCodeBlock
          code={usageJson}
          language="javascript"
          filename="usage.json"
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The whole window is two numbers
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          The open-source claude-meter Rust app deserializes the same response.
          The 5-hour window maps to a{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            Window
          </code>{" "}
          struct with exactly two members. That is the entire server-side state
          for the window: a utilization float and a reset timestamp. No counter
          lives anywhere on your side.
        </p>
        <AnimatedCodeBlock
          code={modelsRsCode}
          language="rust"
          filename="src/models.rs"
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          How the server computes the float, step by step
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The reason a local token sum can never match this number is that the
          window is a server-side division, not a client-side count. Here is
          what happens to a single message.
        </p>
        <StepTimeline steps={mechanismSteps} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What it looks like once you stop guessing
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          Same server response, formatted one row per bucket. This is what{" "}
          <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono">
            claude-meter status
          </code>{" "}
          prints, and what the macOS menu bar dropdown renders. The 5-hour row
          carries its own live reset clock, so you can watch the float age off
          instead of refreshing the Settings page.
        </p>
        <TerminalOutput lines={liveOutput} title="claude-meter status" />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want the live float pinned to your menu bar?"
          description="Book 15 minutes. I will walk through your actual /usage JSON, show where the 5-hour float sits right now, and get claude-meter reading your session with no cookie paste."
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16 mb-20">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="More on the server-tracked rolling-window primitive."
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See your live 5-hour float instead of guessing from a token sum"
      />
    </article>
  );
}
