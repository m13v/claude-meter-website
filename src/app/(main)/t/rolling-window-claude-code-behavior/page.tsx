import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
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
  "https://claude-meter.com/t/rolling-window-claude-code-behavior";
const PUBLISHED = "2026-05-06";

export const metadata: Metadata = {
  title:
    "Rolling 5-hour window: how Claude Code actually behaves before, at, and after the wall",
  description:
    "The rolling 5-hour window is not a 5-hour timer. Each message you send is in-window for exactly 5 hours from when you sent it, then ages out. Claude Code keeps sending until the server's five_hour.utilization crosses 1.0, then 429s. Reset is gradual, not a cliff. Verified against ClaudeMeter's Rust struct.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Rolling 5-hour window: how Claude Code actually behaves before, at, and after the wall",
    description:
      "Each message ages out 5 hours after you sent it. Claude Code keeps sending until five_hour.utilization >= 1.0, then 429s with no client warning. Reset is gradual.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "Rolling 5-hour window: Claude Code behavior",
    url: PAGE_URL,
  },
];

const faqs = [
  {
    q: "Does the rolling 5-hour window start when I start coding?",
    a: "No. There is no 'session start' event on the server. The window is always defined as the 5 hours ending right now. When you send a message at 09:14, that message is in-window from 09:14 until 14:14 sharp. Send another at 11:30 and it is in-window until 16:30. The bucket measures the cost of every message that has not yet aged out, summed at this moment. Anthropic's help docs talk about a '5-hour session', which is true in the sense that the longest-lived message ages out at 5 hours, but not in the sense of a session timer that ticks down.",
  },
  {
    q: "What does Claude Code actually do as I get close to the limit?",
    a: "Nothing. There is no client-side warning, no progress bar, no 'you have 12% left' message. Claude Code keeps streaming responses normally until the server returns a 429 on the next prompt. The /usage slash command will print a snapshot, but it interrupts your loop and prints once. The first time most people learn the wall is right there is when the agentic loop hits it mid-refactor and aborts.",
  },
  {
    q: "What is the exact moment Claude Code 429s?",
    a: "When the server's five_hour.utilization for your organization passes 1.0 on the request you just sent. The cost is computed server-side from message bytes, model used, peak-hour multiplier, attachments, and tool-call overhead, then added to the running tally. If the new tally crosses 1.0, that request returns 429 with a retry-after pointing at resets_at. Per ClaudeMeter's Rust deserializer at src/models.rs lines 4-7, the Window struct that holds this number has exactly two fields: utilization and resets_at. There is no 'started_at', no 'session_id', no 'first_message_at'. The server does not need any of those to enforce the cap.",
  },
  {
    q: "Why doesn't a 4-hour break reset me to zero?",
    a: "Because the window is rolling, not session-based. Imagine your messages from the last hour cost 0.6 of your budget. You step away for 4 hours. When you come back, NONE of those messages have aged out yet, because the oldest one is only 5 hours old. The server still sees 0.6 of your budget consumed. Your only real reset point is when your specific oldest message ages out, and after that the next-oldest, and so on. Reset is gradual, not a cliff.",
  },
  {
    q: "What does resets_at actually mean?",
    a: "It is the timestamp when the OLDEST currently-counted message in your window will age out. On a steady Claude Code loop sending one message every couple of minutes, resets_at is roughly 5 hours after your earliest still-in-window message, and it shifts forward by a few minutes every time that earliest message ages out and the next-earliest takes its place. ClaudeMeter renders this in src/format.rs lines 75-98 by formatting the timestamp in your local time and computing the delta from now in days and hours; it never assumes the value is fixed.",
  },
  {
    q: "Can I avoid the 429 by sending fewer prompts?",
    a: "Only in the moment, and only if your specific old prompts are heavy. Your utilization right now is the sum of every still-in-window prompt's weighted cost. Sending zero new prompts does NOT decrease utilization until the oldest in-window prompt ages out. If your earliest message in the window cost 30% of your budget, your utilization will not drop by that 30% until 5 hours after you sent it, regardless of what you do in between.",
  },
  {
    q: "Does my claude.ai browser chat affect Claude Code's rolling window?",
    a: "Yes. Pro and Max plans share one usage pool across claude.ai and Claude Code, per Anthropic's help article on using Claude Code with subscription plans. A long PR description you drafted in the browser at 10am is in your five_hour bucket until 3pm, even if you only run Claude Code in the afternoon. Local-token tools like ccusage cannot see the browser-chat half because nothing writes to ~/.claude/projects/*.jsonl when you talk to Claude in a browser tab.",
  },
  {
    q: "Is /usage in Claude Code the same number as the website?",
    a: "Yes for the snapshot. Claude Code's /usage hits an OAuth-authenticated endpoint at api.anthropic.com/api/oauth/usage. claude.ai/settings/usage hits a cookie-authenticated endpoint at claude.ai/api/organizations/{org_uuid}/usage. Both return the same five_hour.utilization float (sometimes 0-1, sometimes 0-100 in the same payload, normalized by ClaudeMeter as `u <= 1 ? u * 100 : u`). The difference is /usage interrupts your CLI loop; the settings page is a tab; ClaudeMeter polls the same JSON every 60 seconds (POLL_INTERVAL at src/bin/menubar.rs:18) so neither breaks your flow.",
  },
  {
    q: "Why does my burn rate sometimes go negative?",
    a: "Because messages age out. If you poll five_hour.utilization at 13:42 and again at 13:43, and between those two polls a heavy message from 08:42 aged out, the utilization at 13:43 is lower than at 13:42 even though you sent prompts in between. Local token-counting tools cannot show this because tokens do not un-spend themselves on disk. The server-side rolling tally can and does decrease.",
  },
  {
    q: "How do I actually see what's coming so the 429 doesn't surprise me?",
    a: "Run ClaudeMeter alongside Claude Code. The macOS menu bar shows the live five_hour.utilization percent and the resets_at countdown, polled every 60 seconds from the same endpoint claude.ai/settings/usage uses. When you watch the bar instead of guessing, the wall stops being a surprise: you see it climb past 80%, you wrap up the current task, and you let the oldest messages age out. The browser extension forwards your existing claude.ai session so there is no cookie paste and no second login.",
  },
];

const slashUsageLines = [
  { type: "command" as const, text: "/usage" },
  { type: "output" as const, text: "" },
  {
    type: "output" as const,
    text: "Current 5-hour session:    62%",
  },
  {
    type: "output" as const,
    text: "Current week:              48%",
  },
  {
    type: "output" as const,
    text: "Extra usage balance:       $0.00",
  },
  { type: "output" as const, text: "" },
  {
    type: "output" as const,
    text: "(snapshot. does not stream. interrupts your loop.)",
  },
];

const wallTerminalLines = [
  { type: "command" as const, text: "claude code" },
  { type: "output" as const, text: "> refactor the auth middleware to use the new session shape" },
  { type: "output" as const, text: "Reading 14 files..." },
  { type: "output" as const, text: "Editing src/auth/middleware.ts..." },
  { type: "output" as const, text: "Editing src/auth/session.ts..." },
  {
    type: "error" as const,
    text: "Error: 429 rate_limit_exceeded",
  },
  {
    type: "error" as const,
    text: '{"five_hour": {"utilization": 1.0, "resets_at": "2026-05-06T17:42:18Z"}}',
  },
  {
    type: "output" as const,
    text: "(no warning before this line. retry_after points to when your OLDEST still-counted message ages out.)",
  },
];

const windowStructLines = `// claude-meter/src/models.rs lines 4-7
// the entire shape Anthropic's server returns per window.
// note: no started_at, no session_id, no first_message_at.

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}`;

const behaviorRows = [
  {
    feature: "When does the window start?",
    ours: "It does not 'start'. The window is the 5 hours ending now.",
    competitor: "Most guides say it starts at your first message of the day.",
  },
  {
    feature: "What does Claude Code show as I approach the wall?",
    ours: "Nothing in the CLI. ClaudeMeter shows the live percent in the menu bar.",
    competitor: "Nothing. You find out the wall is there at the 429.",
  },
  {
    feature: "What does the 429 look like?",
    ours: "rate_limit_exceeded with retry_after = oldest in-window message + 5h.",
    competitor: "Same shape. The 429 itself is identical regardless of tracker.",
  },
  {
    feature: "Does a long break reset me?",
    ours: "No. Only the specific message that is 5h old ages out. Reset is gradual.",
    competitor: "Many guides imply a hard reset every 5 hours from the first message.",
  },
  {
    feature: "Does browser chat use the same window?",
    ours: "Yes, per Anthropic's help docs. Same five_hour bucket.",
    competitor: "Local-log tools (ccusage, Claude-Code-Usage-Monitor) cannot see browser usage.",
  },
  {
    feature: "Can the bucket drain while I keep coding?",
    ours: "Yes. As old messages age out, utilization decreases mid-session.",
    competitor: "Token-counter burn rates cannot go negative; they only count up locally.",
  },
];

const lifecycleSteps = [
  {
    title: "T = 09:14, first heavy prompt",
    description:
      "You send a 'refactor X across N files' prompt. Cost lands at, say, 0.18 of your budget. five_hour.utilization is now 0.18. resets_at is 14:14: that is when this specific message will age out.",
  },
  {
    title: "T = 09:14 to 12:30, normal coding",
    description:
      "More prompts get added to the tally. Utilization climbs steadily. resets_at stays at 14:14 because the 09:14 message is still the oldest in-window thing. Your 'reset countdown' is decreasing, but only because clock time is advancing toward that one fixed timestamp.",
  },
  {
    title: "T = 12:30, you 429 mid-loop",
    description:
      "Tally crosses 1.0 on a tool-heavy prompt. Claude Code returns 429. retry_after = 14:14, because that's when the oldest message (the 09:14 one) finally ages out and a chunk of your budget comes back.",
  },
  {
    title: "T = 14:14, the 09:14 message ages out",
    description:
      "The server drops it from your window. Utilization steps down by 0.18 in a single tick. Next-oldest (say, the 09:21 prompt) is now the new resets_at: 14:21. You can send again. You did not get a clean reset, you got back exactly what the 09:14 prompt cost.",
  },
  {
    title: "T = 14:14 onward, gradual drain",
    description:
      "As each old prompt ages out, utilization steps down by that prompt's specific weighted cost. The bucket fills up and drains continuously rather than emptying at a clock. Watch the meter and you can see the steps in real time.",
  },
];

const relatedPosts = [
  {
    title: "Claude Code rolling 5-hour usage: three ledgers, three answers",
    excerpt:
      "Why /usage, ccusage, and the server tally answer different questions, and which pair to run together.",
    href: "/t/claude-code-rolling-5-hour-usage",
    tag: "Guide",
  },
  {
    title: "Claude rolling window cap: seven windows, not one",
    excerpt:
      "The /usage endpoint returns seven utilization buckets, not just five_hour. Here is every one.",
    href: "/t/claude-rolling-window-cap",
    tag: "Reference",
  },
  {
    title: "Claude rolling 5-hour burn rate: Δu/Δt, not tokens per minute",
    excerpt:
      "Why local token-flow numbers are the wrong burn rate, and how to compute the rate that actually matters.",
    href: "/t/claude-rolling-5-hour-burn-rate",
    tag: "Deep dive",
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
                "Rolling 5-hour window: how Claude Code actually behaves before, at, and after the wall",
              description:
                "Each message you send is in-window for exactly 5 hours from when you sent it, then ages out. Claude Code keeps sending until the server's five_hour.utilization crosses 1.0, then 429s. Reset is gradual, not a cliff. Verified against ClaudeMeter's Rust struct.",
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "ClaudeMeter",
              publisherUrl: "https://claude-meter.com",
              articleType: "TechArticle",
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema(
              breadcrumbs.map((b) => ({ name: b.name, url: b.url }))
            )
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqPageSchema(faqs.map((f) => ({ q: f.q, a: f.a })))
          ),
        }}
      />

      <Breadcrumbs
        items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))}
        className="pt-8"
      />

      <header className="max-w-3xl mx-auto px-6 pt-6 pb-3">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          The rolling 5-hour window is not a{" "}
          <GradientText>5-hour timer</GradientText>. Here is how Claude Code
          actually behaves around it.
        </h1>
        <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
          Most guides describe the window like a session timer that resets 5
          hours after your first prompt. That model is wrong, and Claude
          Code's behavior makes more sense once you see the real shape:
          messages age out one by one, the bucket drains gradually, and the
          429 lands with no client-side warning.
        </p>
      </header>

      <div className="pt-1">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="5 min read"
        />
      </div>

      <section className="max-w-3xl mx-auto px-6 mt-8">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-06)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            Claude Code keeps sending until the server&apos;s{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              five_hour.utilization
            </code>{" "}
            crosses{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              1.0
            </code>
            , then 429s. There is no client-side warning. The window is
            rolling: each message you send counts against your budget for
            exactly 5 hours from when you sent it, then ages out. The reset
            you see in{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              resets_at
            </code>{" "}
            is when your oldest still-in-window message will age out, not a
            clock that resets the whole bucket. Verified against ClaudeMeter&apos;s
            Rust struct at{" "}
            <a
              href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              src/models.rs
            </a>{" "}
            and the live response from{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              claude.ai/api/organizations/&#123;org&#125;/usage
            </code>
            .
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The shape Anthropic returns
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          The single source of truth for what your Claude Code session is
          burning is the JSON the server returns from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>
          . ClaudeMeter deserializes it into this Rust struct. Two fields per
          window. That is the whole API surface. No timer, no session id, no
          start time.
        </p>
        <AnimatedCodeBlock
          code={windowStructLines}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed mt-5">
          The point: there is no &quot;when did this 5-hour session start&quot; on
          the server. There cannot be, because no such moment exists. The
          window is always the 5 hours ending now. The only forward-looking
          thing the server tells you is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>
          : when your single oldest in-window message ages out. Everything
          else you might want to know (when did I start? how long have I
          been at it?) is your problem on the client.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What you actually see in Claude Code
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          Two terminal moments worth getting clear on. First, the snapshot
          you can ask for, and second, the wall when it lands.
        </p>
        <div className="space-y-5">
          <TerminalOutput
            title="The snapshot Claude Code prints when you ask"
            lines={slashUsageLines}
          />
          <TerminalOutput
            title="The wall, no warning"
            lines={wallTerminalLines}
          />
        </div>
        <p className="text-zinc-700 leading-relaxed mt-5">
          The first is a manual snapshot you have to type. It interrupts the
          agentic loop, prints once, does not stream, and the 5-hour bar is
          a single integer. The second is what shows up the first time the
          tally crosses 1.0 on a tool-heavy prompt. Nothing in the Claude
          Code TUI told you 90% was about to become 100%.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          One real lifecycle, minute by minute
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          To make the rolling part concrete, here is what happens to one
          actual prompt as the day progresses. Numbers are illustrative,
          shape is real.
        </p>
        <StepTimeline steps={lifecycleSteps} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What most guides get wrong vs. what actually happens
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The model in most posts (start a 5-hour timer, get 100%, timer
          resets) is wrong in three different places. Here are the same
          questions answered against the actual server mechanic.
        </p>
        <ComparisonTable
          productName="What actually happens"
          competitorName="What most guides imply"
          rows={behaviorRows}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          So how do you stop being surprised?
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          You watch the same number Claude Code is about to 429 against,
          before it does. The number is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          on the JSON Anthropic&apos;s server returns to you. The path is one
          brew command plus a one-time browser-extension load.
        </p>
        <GlowCard>
          <div className="p-6 sm:p-7">
            <ol className="space-y-5 text-zinc-800 leading-relaxed">
              <li>
                <span className="block text-xs font-mono uppercase tracking-widest text-teal-700 mb-1">
                  Step 1
                </span>
                <code className="bg-zinc-100 px-2 py-1 rounded text-sm font-mono">
                  brew install --cask m13v/tap/claude-meter
                </code>
                <span className="block text-sm text-zinc-600 mt-1">
                  macOS menu bar app and{" "}
                  <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs">
                    claude-meter
                  </code>{" "}
                  CLI in one command.
                </span>
              </li>
              <li>
                <span className="block text-xs font-mono uppercase tracking-widest text-teal-700 mb-1">
                  Step 2
                </span>
                Load the unpacked browser extension from{" "}
                <a
                  href="https://github.com/m13v/claude-meter/tree/main/extension"
                  className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
                >
                  github.com/m13v/claude-meter/tree/main/extension
                </a>{" "}
                into Chrome, Arc, Brave, or Edge. Forwards your existing
                claude.ai session so the menu bar app does not need a second
                login.
              </li>
              <li>
                <span className="block text-xs font-mono uppercase tracking-widest text-teal-700 mb-1">
                  Step 3
                </span>
                Visit{" "}
                <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs">
                  claude.ai
                </code>{" "}
                once. Within 60 seconds the bar shows your live
                five_hour percent and the resets_at countdown. The polling
                cadence is set in{" "}
                <a
                  href="https://github.com/m13v/claude-meter/blob/main/src/bin/menubar.rs"
                  className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
                >
                  src/bin/menubar.rs
                </a>{" "}
                line 18 (
                <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs">
                  POLL_INTERVAL = Duration::from_secs(60)
                </code>
                ). MIT-licensed, anonymous telemetry is opt-out.
              </li>
            </ol>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Your agentic loop keeps eating the wall and you want a real meter?"
          description="20-minute call. I will help you wire the right rolling-window meter into your Claude Code workflow so the 429 stops being a surprise."
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <FaqSection
          heading="More questions about Claude Code's rolling 5-hour behavior"
          items={faqs}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-14 mb-16">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="More on the same bucket, the same fields, and the same wall."
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Book a call: stop the 5-hour 429 from killing your refactor."
      />
    </article>
  );
}
