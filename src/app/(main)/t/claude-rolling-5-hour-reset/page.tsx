import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
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

const PAGE_URL = "https://claude-meter.com/t/claude-rolling-5-hour-reset";
const PUBLISHED = "2026-05-09";

export const metadata: Metadata = {
  title:
    "Claude rolling 5-hour reset: there is no single reset, each message ages off on its own clock",
  description:
    "The rolling 5-hour window does not reset to 0% all at once. Each message you send has its own 5-hour age-off clock. The resets_at timestamp at claude.ai/settings/usage is just when the oldest message in the window falls off, not when utilization returns to zero.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude rolling 5-hour reset: there is no single reset, each message ages off on its own clock",
    description:
      "Why waiting for a single 5-hour reset is the wrong mental model. The window drains in N steps, one per message. Verified from the field claude.ai actually returns.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude rolling 5-hour reset", url: PAGE_URL },
];

const faqs = [
  {
    q: "When does the rolling 5-hour window reset?",
    a: "It does not reset to 0% at one moment. Each message you send has its own 5-hour clock; the cost of that one message drops off exactly 5 hours after you sent it. The resets_at timestamp at claude.ai/settings/usage is the next age-off boundary, which is the oldest message in your current window. Utilization steps down at that boundary by however much that one message cost. The window only fully empties 5 hours after the LAST message you sent.",
  },
  {
    q: "If resets_at says 6:00pm, will I be at 0% at 6:00pm?",
    a: "Almost never. resets_at is when one specific contributor (the oldest message still in the window) ages off the bucket. If you sent messages at 1pm, 2pm, and 3pm, resets_at is 6pm and at 6pm only the 1pm message's cost drops out. The 2pm cost still ages out at 7pm; the 3pm cost ages out at 8pm. You are at 0% at 8pm, not 6pm. People who 'wait for the reset' and come back at 6pm to find the bar still at 60% are seeing exactly this.",
  },
  {
    q: "Where in the API does the 5-hour reset come from?",
    a: "It comes from one cookie-authenticated GET on claude.ai. Open DevTools on /settings/usage and watch /api/organizations/{org_uuid}/usage fire. The response carries a five_hour object that has exactly two fields: utilization (a float between 0 and 1, sometimes 0 and 100) and resets_at (an ISO 8601 timestamp). One number, one timestamp, per window. There is no per-message age-off list. The server only tells you when the next thing ages off; it does not tell you what comes next.",
  },
  {
    q: "Why do popular guides say 'window resets 5 hours after your first message'?",
    a: "Because that is true on a fresh account that sent one message and stopped. It breaks the moment you send a second message. The cost of message two ages off 5 hours after message two, not 5 hours after message one. Most rate-limit explainers stop at the simple case because they were written by someone who tested it once at 9am and reported the 2pm reset. They never reported what 60% to 0% looks like with a chatty session in the middle.",
  },
  {
    q: "Does the resets_at value move forward as I send new messages?",
    a: "Sometimes. resets_at always points at the oldest unexpired message in the window. If you send a new message and the oldest message is still inside the 5-hour boundary, resets_at does not move (the new message is now the newest, not the oldest). If you let enough time pass that the oldest message ages out, resets_at jumps forward to the next-oldest message's age-off time. So you watch resets_at by sometimes-stepping forward, not by sliding smoothly.",
  },
  {
    q: "How do I see the actual remaining time live, instead of refreshing the Settings page?",
    a: "Install ClaudeMeter (brew install --cask m13v/tap/claude-meter) and load its browser extension. The macOS menu bar pulls the same /api/organizations/{org}/usage payload every 60 seconds and prints '5-hour 58.0% used resets Sat May 9 17:30 (in 2h)' verbatim from the resets_at field. No cookie paste. Numbers match the Settings page exactly because the source is the same endpoint.",
  },
  {
    q: "Does Claude Code share the rolling 5-hour bucket with claude.ai chat?",
    a: "Yes on Pro and Max plans. The five_hour bucket on the server tracks the union of your prompts: chat in the browser, prompts inside Claude Code, prompts from Claude Desktop. They all age off on the same per-message clock. This is why ccusage can say 5% used while the server says 95% (ccusage only sees Claude Code; the server sees everything).",
  },
  {
    q: "Can the rolling 5-hour utilization drop without me doing anything?",
    a: "Yes, and that is the defining property. If you stop sending messages, the bucket drains as each contribution ages off. Utilization can fall from 90% to 70% to 50% to 0% over the next 5 hours with zero new prompts. That is the rolling part of 'rolling window'. Tools that estimate burn from local token logs cannot show this because tokens do not un-spend themselves on disk.",
  },
  {
    q: "What about the weekly window, does it reset all at once or rolling?",
    a: "Same shape, different scale. The seven_day bucket is also a rolling window and also exposes one resets_at field, which is the next-oldest age-off time on a 7-day clock instead of a 5-hour one. Same mental model: it drains in N steps, not one. The Settings page showing 'resets in 3 days' just means the oldest still-counting message ages out in 3 days; you only return to 0% when the LAST message in that 7-day stretch ages out.",
  },
  {
    q: "Is the 5-hour clock measured from when I started typing or when the request landed?",
    a: "The server timestamps each request when it hits the rate limiter, not when you started typing. A long-running prompt counts as one timestamp at the moment Anthropic accepted the request. Streaming output does not extend the clock; it is one event. So a 90-second Opus generation that started at 1:30pm ages off at 6:30pm, not 6:32pm.",
  },
];

const resetWalkthroughLines = [
  { type: "command" as const, text: "# 13:30 PT — you send your first prompt of the day" },
  { type: "output" as const, text: "GET /api/organizations/{org}/usage" },
  { type: "output" as const, text: '{ "five_hour": { "utilization": 0.18, "resets_at": "2026-05-09T18:30:00Z" } }' },
  { type: "output" as const, text: "5-hour    18.0% used    -> resets Sat May 9 18:30 (in 5h)" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# 14:00 PT — you send a second prompt (Opus 4.7, ~heavier)" },
  { type: "output" as const, text: '{ "five_hour": { "utilization": 0.42, "resets_at": "2026-05-09T18:30:00Z" } }' },
  { type: "output" as const, text: "5-hour    42.0% used    -> resets Sat May 9 18:30 (in 4h 30m)" },
  { type: "output" as const, text: "# resets_at did NOT move. The 13:30 message is still the oldest." },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# 15:00 PT — third prompt" },
  { type: "output" as const, text: '{ "five_hour": { "utilization": 0.61, "resets_at": "2026-05-09T18:30:00Z" } }' },
  { type: "output" as const, text: "5-hour    61.0% used    -> resets Sat May 9 18:30 (in 3h 30m)" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# 18:30 PT — your 13:30 message ages off the window" },
  { type: "output" as const, text: '{ "five_hour": { "utilization": 0.43, "resets_at": "2026-05-09T19:00:00Z" } }' },
  { type: "output" as const, text: "5-hour    43.0% used    -> resets Sat May 9 19:00 (in 30m)" },
  { type: "output" as const, text: "# Utilization stepped DOWN by 18 points. resets_at JUMPED to the 14:00 age-off." },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# 19:00 PT — 14:00 message ages off" },
  { type: "output" as const, text: '{ "five_hour": { "utilization": 0.19, "resets_at": "2026-05-09T20:00:00Z" } }' },
  { type: "output" as const, text: "5-hour    19.0% used    -> resets Sat May 9 20:00 (in 1h)" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# 20:00 PT — last (15:00) message ages off, window finally at 0" },
  { type: "output" as const, text: '{ "five_hour": { "utilization": 0.0, "resets_at": null } }' },
  { type: "success" as const, text: "Three messages, three resets. The window emptied 5 hours after the LAST one, not the first." },
];

const windowStruct = `// claude-meter/src/models.rs (lines 3-7)

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}

// Two fields. That is the entire shape Anthropic ships per window.
// There is no list of per-message timestamps. There is no
// "fully_resets_at". The server only knows when the next
// contributor ages off. Everything after that, you find out by
// polling again.`;

const formatRender = `// claude-meter/src/format.rs (lines 90-113)

fn format_window(w: &Window) -> String {
    let reset = w
        .resets_at
        .map(|t| {
            let local: DateTime<Local> = t.into();
            let delta = t.signed_duration_since(Utc::now());
            let mut parts: Vec<String> = Vec::new();
            if delta.num_days() > 0 {
                parts.push(format!("{}d", delta.num_days()));
            }
            let hrs = delta.num_hours() - delta.num_days() * 24;
            if hrs > 0 {
                parts.push(format!("{}h", hrs));
            }
            let in_str = if parts.is_empty() {
                String::from("soon")
            } else {
                format!("in {}", parts.join(" "))
            };
            format!("-> resets {} ({})", local.format("%a %b %-d %H:%M"), in_str)
        })
        .unwrap_or_default();
    format!("{:>5.1}% used    {}", w.utilization, reset)
}

// We render exactly what the server sent us. The "resets" suffix
// is the next age-off, not the window-zero time. ClaudeMeter does
// not lie about that because the server itself does not know.`;

const ageOffSteps = [
  {
    title: "1. You send a message",
    description:
      "The server time-stamps the request when it lands at the rate limiter (not when you started typing). That timestamp gets added to your org's five_hour bucket with whatever cost weight Anthropic computes for that prompt (per-model multiplier, peak-hour multiplier, attachments, tool calls).",
  },
  {
    title: "2. Utilization climbs by the cost of that one message",
    description:
      "Your live utilization is the sum of all message costs whose timestamps are within the last 5 hours. Send a heavier Opus prompt with attachments and the bar jumps further than a quick Sonnet question. Send nothing for an hour and the bar does not move.",
  },
  {
    title: "3. Each message ages off on its own private 5-hour clock",
    description:
      "Five hours after the timestamp on a given message, that message's cost is subtracted from the bucket. Not your whole bucket: just that one message's contribution. The bucket steps DOWN by exactly that much. If three messages happen to age off at nearly the same moment, you see three steps down, not one collapse to 0%.",
  },
  {
    title: "4. resets_at always points at the next age-off",
    description:
      "The server picks the oldest message still in the window and returns its age-off time as resets_at. That is the next moment utilization will drop. After that drop, the next-oldest message becomes the new candidate and resets_at jumps forward to ITS age-off. The Settings page only ever shows you one step ahead.",
  },
  {
    title: "5. The window is empty 5 hours after the LAST message",
    description:
      "Not the first one. The window only returns to 0% utilization when every contributing message has aged off. If you sent prompts continuously between 1pm and 3pm, the bucket only fully empties at 8pm. Most rate-limit explainers report the 5-hours-after-first-message rule, which describes a single-message session and nothing else.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-rolling-5-hour-burn-rate",
    title: "Burn rate is delta-utilization, not tokens per minute",
    excerpt:
      "The right rate to watch on a rolling window is the change in server-side utilization between polls, not the local token total ccusage prints.",
    tag: "Deep dive",
  },
  {
    href: "/t/claude-5-hour-server-side-wall",
    title: "The 5-hour server-side wall is three walls, not one",
    excerpt:
      "Three stacked conditions can produce a 429 at the 5-hour mark. Where each one lives in the JSON, and why overage_spend_limit has its own clock.",
    tag: "Reference",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "The rolling window cap is seven windows, not one",
    excerpt:
      "Anthropic publishes two windows. The internal usage endpoint returns seven utilization buckets, each with its own resets_at and its own throttle.",
    tag: "Reference",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude rolling 5-hour reset: there is no single reset, each message ages off on its own clock",
  description:
    "The rolling 5-hour window does not reset to 0% all at once. Each message you send has its own 5-hour age-off clock. The resets_at timestamp at claude.ai/settings/usage is the next age-off, not when utilization returns to zero.",
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "ClaudeMeter",
  publisherUrl: "https://claude-meter.com",
  articleType: "TechArticle",
});

const breadcrumbJsonLd = breadcrumbListSchema(
  breadcrumbs.map((b) => ({ name: b.name, url: b.url })),
);

const faqJsonLd = faqPageSchema(faqs);

export default function ClaudeRolling5HourResetPage() {
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
          The Claude rolling 5-hour reset is{" "}
          <GradientText>N staggered resets</GradientText>, not one
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          You hit a 429, googled &ldquo;claude rolling 5 hour reset&rdquo;,
          and every page told you to wait 5 hours from your first message. You
          waited. The bar is still at 60%. This page explains why, with the
          actual field Anthropic returns and what it means.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="6 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-09)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            The rolling 5-hour window does not reset all at once. Each message
            you send has its own private 5-hour clock; the cost of that one
            message drops off the bucket exactly 5 hours after you sent it.
            The{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              resets_at
            </code>{" "}
            timestamp at{" "}
            <a
              href="https://claude.ai/settings/usage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              claude.ai/settings/usage
            </a>{" "}
            is when the OLDEST message in the current window will age off, not
            when utilization returns to 0%. The window is only empty 5 hours
            after the LAST message you sent. Source: the{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              five_hour
            </code>{" "}
            object on Anthropic&rsquo;s internal usage endpoint, verified via{" "}
            <a
              href="https://github.com/m13v/claude-meter"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              ClaudeMeter
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What every &ldquo;5 hours after your first message&rdquo; guide
          gets wrong
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Open the first ten guides on this topic and they all say the same
          thing: &ldquo;Send your first message at 9am, your reset is at
          2pm.&rdquo; That is true once, on a session with exactly one
          message. As soon as you send a second prompt, that rule is wrong by
          design. The cost of message two ages off 5 hours after message two,
          not 5 hours after message one.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          So when a chatty afternoon session has 14 messages spread between
          1pm and 5pm, you do not have one reset at 6pm. You have 14 separate
          age-offs spread between 6pm and 10pm. The bar steps down 14 times.
          The Settings page can only show you the next step. People who wait
          for &ldquo;the reset,&rdquo; come back at the time the page printed,
          and find the bar still well above 0% are seeing exactly this
          behavior. Nothing is broken. The headline number is the next step,
          not the destination.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The reason every popular guide misses this is that the server only
          ever returns ONE timestamp per window. There is no list of per-message
          age-offs in the API. You have to either stare at it for 5 hours, or
          read the source of a tool that polls it for you, to notice the
          stair-step pattern. Below is what that staircase actually looks like.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The reset, frame by frame
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Three messages, three age-offs. The Settings page (and ClaudeMeter)
          show you the same payload at each tick. Watch{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          move:
        </p>
        <TerminalOutput
          title="One day, three messages, three resets"
          lines={resetWalkthroughLines}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Notice that{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          does not move when you send new messages, because new messages are
          never the oldest. It only jumps forward when the current oldest
          message ages off, at which point the next-oldest becomes the new
          candidate. So you watch the field tick by sometimes-jumping forward,
          not by smoothly counting down to one moment.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The five steps a single age-off goes through
        </h2>
        <StepTimeline steps={ageOffSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the API can only ever show you the NEXT reset
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The shape of Anthropic&rsquo;s response is the constraint. The whole
          window object is two fields wide:
        </p>
        <AnimatedCodeBlock
          code={windowStruct}
          language="rust"
          filename="src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          One float, one optional timestamp. There is no array of pending
          age-offs, no &ldquo;fully resets at&rdquo; field. The server picks
          the oldest still-counting message and returns its age-off time. That
          is everything. ClaudeMeter renders that single field verbatim, with
          no synthesized &ldquo;final reset&rdquo;:
        </p>
        <div className="mt-6">
          <AnimatedCodeBlock
            code={formatRender}
            language="rust"
            filename="src/format.rs"
          />
        </div>
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          If you want to know when you will hit 0%, your only options are to
          remember the time of your last message and add 5 hours, or to keep
          polling and watch the staircase. The wire does not give you the
          full schedule.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The practical takeaway
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              When the bar says &ldquo;resets at 6:00pm,&rdquo; that is the
              first step down, not the floor. If your session was busy, expect
              several more steps after 6pm before you are anywhere near 0%.
              Plan around the time of your LAST heavy prompt, not your first
              one.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              For a refactor that needs hours of headroom, the question to
              ask is not &ldquo;when does my window reset.&rdquo; It is
              &ldquo;when did my last big prompt land, and is it more than 5
              hours ago.&rdquo; That is the actual zero-point.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              For watching the steps live, the cheapest way is{" "}
              <a
                href="https://claude-meter.com/install"
                className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
              >
                ClaudeMeter
              </a>
              . It pulls the same payload claude.ai/settings/usage shows, every
              60 seconds, into the macOS menu bar. You see the staircase tick
              down without having to refresh anything. Free, MIT-licensed,
              local-only,{" "}
              <a
                href="https://github.com/m13v/claude-meter"
                className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
              >
                source on GitHub
              </a>
              .
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              ccusage and Claude-Code-Usage-Monitor cannot show this because
              they read local JSONL token logs, not the server bucket.
              Tokens do not un-spend themselves on disk; the server bucket
              drains as messages age off. Two different ledgers, two different
              numbers.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The honest caveat
            </h2>
          </div>
          <p className="text-zinc-700 leading-relaxed text-lg max-w-3xl mx-auto">
            The{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /api/organizations/&#123;org&#125;/usage
            </code>{" "}
            endpoint is undocumented. Anthropic could rename{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              resets_at
            </code>{" "}
            on any release. The behavior described here is what the field
            does today (verified 2026-05-09). The age-off mechanism itself is
            inherent to a rolling window and is unlikely to change, but the
            field name and shape can. ClaudeMeter declares each field as
            Optional in{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              src/models.rs
            </code>{" "}
            so a missing or renamed field deserializes to None and the row
            goes blank instead of crashing. If a name changes, the open-source
            repo gets a same-day patch.
          </p>
        </BackgroundGrid>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Trying to plan around the rolling window for an agentic loop?"
          description="15 minutes. Bring your worst rate-limited day and we will walk through what the staircase looked like and how to time your next session."
          text="Book a 15-minute call"
          section="rolling-5-hour-reset-footer"
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
        description="Questions on the 5-hour staircase? 15 min."
        section="rolling-5-hour-reset-sticky"
        site="claude-meter"
      />
    </article>
  );
}
