import type { Metadata } from "next";
import {
  Breadcrumbs,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  GlowCard,
  GradientText,
  BeforeAfter,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/alternative/menu-bar-meter-vs-activity-dashboard";
const PUBLISHED = "2026-05-07";

export const metadata: Metadata = {
  title:
    "Claude usage meter vs activity dashboard: two surfaces, two different questions",
  description:
    "A meter and a dashboard are not substitutes for each other. A meter pushes one float into your peripheral vision so you decide whether to keep prompting right now. A dashboard sits behind a deliberate visit so you can answer where your week went. Walking the structural difference, the two-tier redraw at src/bin/menubar.rs lines 136-146 that makes the meter pattern actually work, and why most heavy Claude Code users end up running both.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude usage meter vs activity dashboard: two surfaces, two different questions",
    description:
      "Meter and dashboard are different UI archetypes for different decisions. Here is the structural difference, the code branch that keeps the meter from blowing up the user's dropdown every minute, and when to use each one.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Alternatives", url: "https://claude-meter.com/alternative" },
  {
    name: "Meter vs activity dashboard",
    url: PAGE_URL,
  },
];

const faqs = [
  {
    q: "What is the practical difference between a usage meter and an activity dashboard?",
    a: "A meter is an ambient surface. It has one job: keep one or two numbers visible without you asking, so you notice them in your peripheral vision while you keep working. An activity dashboard is a deliberate surface. You stop what you are doing, open it in a tab, and read charts, breakdowns, history, costs, and per-session detail. Meters answer the in-the-moment question (should I keep prompting now?). Dashboards answer the retrospective question (where did my week go?). On Claude Pro and Max specifically, the meter saves you from the 5-hour wall and the dashboard tells you which model burned the most weekly compute.",
  },
  {
    q: "Does Anthropic ship an activity dashboard for Pro and Max?",
    a: "Yes, claude.ai/settings/usage is the official surface, but it is not really a dashboard in the analytics sense. It renders the same /api/organizations/{org_uuid}/usage JSON ClaudeMeter polls, with two progress bars (5-hour, weekly) plus per-model rows on Max. There are no historical charts, no per-session breakdown, no costs. Anthropic's full analytics dashboard with charts and per-user attribution is gated to Team and Enterprise (support.claude.com/en/articles/12883420). For Pro and Max individuals, the activity dashboard surface is shallow on purpose and the meter pattern fills the gap.",
  },
  {
    q: "Why is a menu bar app a better fit than a dashboard for the 5-hour window?",
    a: "Because the 5-hour wall hits without warning. By the time you remember to open the dashboard, you have already burned cycles to get there: switch to the browser, find the tab, wait for the page to load, read the bars. A menu bar chip is in the same field of view as your editor and your terminal at all times. ClaudeMeter polls every sixty seconds (POLL_INTERVAL at src/bin/menubar.rs line 18, POLL_MINUTES at extension/background.js line 3) and the title is colored bg_for at lines 942-950 with RGB (215, 58, 73) at 100 percent and RGB (219, 118, 32) at 90 percent. The orange flash at 90 is the tap on the shoulder you do not get from a dashboard you have to remember to open.",
  },
  {
    q: "Can a dashboard be made live so it acts like a meter?",
    a: "It can auto-refresh, but the UX is still a dashboard's UX. The phuryn/claude-usage local dashboard refreshes every 30 seconds and renders Chart.js charts of token usage; that is a dashboard with a polling job, not a meter. The reason it does not become a meter is that you have to keep its tab focused or visible on a second monitor for the live updates to enter your visual field. A meter does the opposite work: it lives in a place you cannot help but see (the macOS menu bar, the toolbar of the browser you are already in), and it shows the absolute minimum number of bytes (two percentages, one color) so glancing is cheap. You glance at a meter. You visit a dashboard.",
  },
  {
    q: "Will the meter dropdown collapse every minute when the percentages update?",
    a: "Not in ClaudeMeter, and that is the part most home-built menu bar apps get wrong. The redraw is split into two tiers. The poll fires once a minute. The title repaint is cheap and runs on every numeric change. The full menu rebuild is expensive (it tears down and re-attaches the submenu tree, which dismisses an open dropdown) and only runs when the account set changes: a new email logged in, an account flipped stale, an account got forgotten. The branch lives at src/bin/menubar.rs lines 136-146. The comment names the reason: \"Mid-flight percentage updates reach the user on their next click via title + re-render.\" If you keep the dropdown open through a long agentic loop, the percent in the title still ticks; the dropdown stays put.",
  },
  {
    q: "What about ccusage and the Claude-Code-Usage-Monitor dashboard?",
    a: "Both walk ~/.claude/projects/*.jsonl on your local disk and total input_tokens + output_tokens for sessions on this machine. That is a faithful local-log signal for Claude Code traffic only. Neither sees per-model weighting on the seven_day_opus and seven_day_sonnet sub-buckets, the peak-hour multiplier on the rolling 5-hour bucket, or browser-chat usage that depletes the same caps but never writes to ~/.claude/projects. ccusage at five percent of estimated spend while claude.ai shows ninety percent of the rolling window is a frequent, normal mismatch. Run ccusage as a cost-attribution dashboard and ClaudeMeter as the meter that reflects what Anthropic actually checks before throwing a 429.",
  },
  {
    q: "Why does the meter need a browser extension at all if the dashboard does not?",
    a: "Because the dashboard already has the cookie. When you open claude.ai/settings/usage, the browser sends your session cookie automatically and the page renders. A separate native menu bar app does not have access to that cookie. Without help, it would have to either ask you to paste your cookie manually (which Anthropic-Claude-Code-Usage-Monitor and similar tools do) or decrypt Chromium's cookie store via Apple Keychain (which works but is fragile across browser updates). The ClaudeMeter browser extension solves it the lazy way: it makes the same fetch your browser already makes for the settings page, then POSTs the JSON to localhost:63762 where the menu bar app picks it up. Same data the dashboard gets, no manual paste step.",
  },
  {
    q: "When should I use both?",
    a: "If you spend more than two hours a day in Claude Code on Max, both. The meter pins you to the moment so you do not start a sixty-prompt Opus refactor with the weekly Opus sub-bucket already at 91 percent. The dashboard (claude.ai/settings/usage plus ccusage if you also care about cost per pull request) is where you go on Friday afternoon to figure out which model class burned your week and whether to switch to Sonnet for the next sprint. They are complementary, not redundant. The meter is read-only ambient awareness, the dashboard is investigative.",
  },
  {
    q: "Does the meter cost more battery or network than the dashboard?",
    a: "Less, in the steady-state case. ClaudeMeter polls once a minute; that is one HTTPS request per sixty seconds against claude.ai. When the browser extension is running, BRIDGE_FRESHNESS at src/bin/menubar.rs line 350 is set to 120 seconds: if the extension has POSTed a snapshot in the last two minutes, the menu bar app skips the cookie-decrypt fetch entirely and just receives the extension's snapshot. So in practice the meter is one HTTPS request per minute total, not one per surface. A dashboard tab loaded in the foreground often refreshes more aggressively and burns more on rendering charts than the meter does on polling JSON.",
  },
  {
    q: "Is ClaudeMeter open source?",
    a: "Yes, MIT licensed, github.com/m13v/claude-meter. The Rust core, the menu bar binary at src/bin/menubar.rs, and the browser extension under extension/ are all readable. Usage data stays local; anonymous crash reporting and daily active telemetry are opt-out. The only usage-data network call is your one-per-minute HTTPS request to claude.ai using the session cookie that is already in your browser, and the localhost POST from the extension to 127.0.0.1:63762 that never leaves the loopback interface.",
  },
];

const comparisonRows = [
  {
    feature: "Primary decision it supports",
    competitor:
      "Where did my week go? Which model burned my Opus weekly cap? What is my cost per pull request?",
    ours: "Should I keep prompting right now? Will my next agentic loop blow through the rolling 5-hour wall?",
  },
  {
    feature: "When you look at it",
    competitor: "Deliberately. You stop, switch tabs, wait for charts to render, read.",
    ours: "Peripherally. The chip is already in your visual field while your editor and terminal are too.",
  },
  {
    feature: "Update model",
    competitor: "Pull. Refresh on visit, sometimes a 30-second auto-refresh if the tab is focused.",
    ours: "Push. The poll is a background loop on a 60-second tick (POLL_INTERVAL at line 18); the title repaints when numbers change.",
  },
  {
    feature: "Information density",
    competitor: "High. Charts, history, breakdowns, per-session detail, sometimes cost attribution.",
    ours: "Two percentages and one color (5h and 7d, plus an orange flash at 90 percent and a red flash at 100).",
  },
  {
    feature: "Failure mode",
    competitor: "You forget to open it. The week ends with a 429 you did not see coming.",
    ours: "You ignore the orange. The chip is there, but if you do not look up from your editor, it does not save you.",
  },
  {
    feature: "What it does not show",
    competitor:
      "Nothing on Pro/Max from Anthropic itself: no historical chart, no per-session detail, no cost. Local dashboards (ccusage) miss server weighting and browser-chat usage.",
    ours: "No history, no charts, no costs. The meter is a now-state surface; for retrospective questions you still want a dashboard.",
  },
  {
    feature: "Disturbance to the dropdown / view",
    competitor:
      "Whole-page rerender on each refresh. Scroll position, expanded rows, and selection state often reset.",
    ours: "Two-tier redraw at src/bin/menubar.rs lines 136-146. Title repaints on every numeric change, menu only rebuilds when the account set changes. Open dropdowns survive the tick.",
  },
  {
    feature: "Where the data comes from",
    competitor:
      "Local JSONL on disk for ccusage; first-party billing data for the Team/Enterprise dashboard; Anthropic's own settings page for individuals.",
    ours: "/api/organizations/{org_uuid}/usage on claude.ai, the same internal endpoint claude.ai/settings/usage already renders.",
  },
];

const redrawCode = `// claude-meter/src/bin/menubar.rs (lines 127-146)
// The branch that lets a meter update once a minute without
// dismissing the user's open dropdown. This is what separates a
// meter from a dashboard at the implementation layer.

let merged = merge_with_persisted(snaps, prev);
save_snapshots(&merged);
let numbers_changed = last_snaps
    .as_ref()
    .map(|old| !snaps_equal(old, &merged))
    .unwrap_or(true);
let accounts_changed = last_snaps
    .as_ref()
    .map(|old| account_set_changed(old, &merged))
    .unwrap_or(true);
last_snaps = Some(merged);
// Only rebuild the menu when the account set itself changed (new
// email, or stale<->fresh flip). Mid-flight percentage updates
// reach the user on their next click via title + re-render.
if accounts_changed {
    if let (Some(tray), Some(s)) = (tray_icon.as_ref(), last_snaps.as_deref()) {
        current_ids = render_menu_only(tray, s, last_fetched, config.title_format);
    }
}
if numbers_changed {
    dirty = true;
}`;

const pollCode = `// claude-meter/src/bin/menubar.rs
const POLL_INTERVAL: Duration = Duration::from_secs(60);   // line 18
const BRIDGE_FRESHNESS: Duration = Duration::from_secs(120); // line 350

// claude-meter/extension/background.js
const POLL_MINUTES = 1; // line 3
chrome.alarms.create("refresh", { periodInMinutes: POLL_MINUTES });`;

const meterSession = [
  { type: "command" as const, text: "$ claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour            78.0% used    -> resets Tue May 6 22:14 (in 2h)" },
  { type: "output" as const, text: "7-day all         62.0% used    -> resets Tue May 12 09:02 (in 5d)" },
  { type: "output" as const, text: "7-day Opus        91.0% used    -> resets Tue May 12 09:02 (in 5d)" },
  { type: "output" as const, text: "Extra usage       $4.20 / $50.00 (8%)" },
  { type: "output" as const, text: "" },
  { type: "success" as const, text: "Meter answer: weekly Opus near the wall. Switch to Sonnet today." },
];

const dashboardSession = [
  { type: "command" as const, text: "$ open https://claude.ai/settings/usage" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "Plan usage" },
  { type: "output" as const, text: "----------" },
  { type: "output" as const, text: "Current 5-hour session     [============      ] 78%" },
  { type: "output" as const, text: "Weekly usage (all models)  [==========        ] 62%" },
  { type: "output" as const, text: "Weekly usage (Opus)        [==================] 91%" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "Resets: Tue May 12 09:02 UTC" },
  { type: "success" as const, text: "Dashboard answer: same numbers, but you only see them when you visit." },
];

const relatedPosts = [
  {
    href: "/t/claude-rate-limit-dashboard",
    title: "What a real Pro/Max rate-limit dashboard would have to render",
    excerpt:
      "Anthropic does not ship a dashboard to individual subscribers. Field by field, what one would have to surface, including the eight floats and the 90/100 percent color thresholds.",
    tag: "Reference",
  },
  {
    href: "/t/claude-code-usage-menu-bar",
    title: "Claude Code usage in the macOS menu bar",
    excerpt:
      "Why the menu bar is the right surface for Claude Code usage, and the two-tier redraw branch at lines 136-146 that keeps the dropdown stable while you watch the percent climb.",
    tag: "Diagnosis",
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
    "Claude usage meter vs activity dashboard: two surfaces, two different questions",
  description:
    "A meter pushes one float into your peripheral vision so you can decide whether to keep prompting right now. A dashboard sits behind a deliberate visit so you can answer where your week went. Walking the structural difference, the redraw branch at src/bin/menubar.rs lines 136-146 that makes the meter pattern work, and when to run both.",
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

export default function MeterVsActivityDashboardPage() {
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
          Claude usage meter <GradientText>vs activity dashboard</GradientText>:
          two surfaces, two different questions
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          People treat these as alternatives because the words sound like
          synonyms. They are not. A meter is an ambient surface that pins one
          number to your peripheral vision so you decide, in the moment,
          whether to keep prompting. A dashboard is a deliberate surface that
          you visit on Friday afternoon to figure out where your Opus weekly
          cap went. Same data, different jobs. Below: the structural
          difference, the actual code branch that makes the meter pattern
          work without blowing up the user&apos;s open dropdown every minute,
          and when to run both.
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-07)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            <strong>They answer different questions.</strong> A meter pushes a
            number into your peripheral vision so you decide{" "}
            <em>whether to keep prompting right now</em>. A dashboard sits
            behind a deliberate visit so you can answer{" "}
            <em>where your week went</em>. The official Anthropic activity
            surface is{" "}
            <a
              href="https://claude.ai/settings/usage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              claude.ai/settings/usage
            </a>
            ; on Pro and Max it has no charts, no history, no per-session
            detail, just two progress bars on the same{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /api/organizations/&#123;org&#125;/usage
            </code>{" "}
            JSON ClaudeMeter polls. Most heavy Claude Code users on Max
            end up running both: the meter to stop them at the rolling
            5-hour wall, the dashboard for retrospective analysis at the end
            of the week.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Side by side
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Same JSON, two UI archetypes. Each row is a dimension where the
          archetype, not the feature list, decides the answer.
        </p>
        <ComparisonTable
          productName="Meter (claude-meter)"
          competitorName="Activity dashboard"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Same numbers, different jobs
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The clearest way to see the difference is to look at what the two
          surfaces actually output for the same Tuesday afternoon on Max. The
          rolling 5-hour bucket is at 78 percent, the weekly Opus sub-bucket
          is at 91 percent, the meter is in your menu bar, the dashboard is a
          tab you have not opened today.
        </p>

        <BeforeAfter
          title="Same data, two surfaces"
          before={{
            label: "Activity dashboard",
            content:
              "Activity dashboard. You open a tab, the page loads, you read three progress bars and a reset timestamp. You learn the same thing the meter would have told you, but you only learn it after you decided to look.",
            highlights: [
              "Pull mode. You stop work to visit it.",
              "High information density when you do.",
              "Easy to forget to open it on a busy day.",
              "Whole-page rerender on each refresh.",
            ],
          }}
          after={{
            label: "Menu bar meter",
            content:
              "Menu bar meter. Two percentages already in your peripheral vision, with a colored background that flashes orange at 90 percent. Numbers update on a 60-second tick without dismissing your open dropdown.",
            highlights: [
              "Push mode. The number finds your eye.",
              "Two percentages, one color, nothing else.",
              "Title repaints on every change at line 144.",
              "Menu only rebuilds when accounts change.",
            ],
          }}
        />

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <TerminalOutput title="Meter output (claude-meter status)" lines={meterSession} />
          <TerminalOutput title="Dashboard output (claude.ai/settings/usage)" lines={dashboardSession} />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What actually makes the meter pattern work
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You can not turn a dashboard into a meter just by polling more
          aggressively. A meter has two non-negotiable constraints that a
          dashboard does not. First, every update has to be cheap, because
          the surface is permanent: if updating costs ten frames of jank, the
          user notices ten times an hour, sixty times a workday, three
          hundred times a week. Second, every update has to leave the
          user&apos;s state alone, because they are not looking at the
          surface when it updates. If the dropdown is open and the redraw
          dismisses it, the user has to reopen it just to read the number
          they were already trying to read.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter solves both with a two-tier redraw. The poll fires
          every sixty seconds. On every poll, the menu bar title repaints
          (cheap, two NSAttributedString segments, no menu teardown). The
          full menu rebuild only fires when{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            account_set_changed
          </code>{" "}
          returns true, which means a new email logged in, an account
          flipped to stale, or an account got forgotten. The branch is
          twenty lines:
        </p>

        <AnimatedCodeBlock
          code={redrawCode}
          language="rust"
          filename="src/bin/menubar.rs (lines 127-146)"
        />

        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The comment on the branch is the spec for the meter pattern in one
          sentence:{" "}
          <em>
            mid-flight percentage updates reach the user on their next click
            via title plus re-render
          </em>
          . If you keep the dropdown open through a long agentic loop, the
          number in the title still ticks up; the dropdown stays put. A
          dashboard that auto-refreshes does the opposite: the whole DOM
          re-renders, scroll position resets, expanded rows snap shut, and
          you reorient yourself every refresh.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Polling discipline
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The other thing a meter has to do, that a dashboard does not, is
          stay almost free at the network layer. A user who keeps a
          dashboard tab open for an hour pays a tab&apos;s worth of memory
          and rerender cost, and probably checks it twice. A meter has to be
          on for sixteen hours a day. ClaudeMeter sets the cadence in two
          places, both intentionally aligned:
        </p>
        <AnimatedCodeBlock
          code={pollCode}
          language="rust"
          filename="poll cadence (Rust + extension)"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Sixty seconds is the poll. One hundred and twenty seconds is the
          freshness window for the localhost bridge: if the browser
          extension has POSTed a snapshot from your live claude.ai session
          in the last two minutes, the menu bar app skips the cookie-decrypt
          fallback and just receives the extension&apos;s snapshot. So in
          the steady state, the meter makes <strong>one HTTPS request per minute</strong>{" "}
          to claude.ai (from the browser extension, on a session you already
          have), and zero direct requests from the native app. A dashboard
          tab loaded in the foreground often refreshes harder than that and
          burns more on rendering charts than the meter does on polling
          JSON.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Three real workdays, three different surfaces won
        </h2>
        <GlowCard>
          <div className="p-2 space-y-4">
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>Tuesday 11 a.m. Pacific, Pro user.</strong> Mid-refactor,
              Claude Code dies with &ldquo;message limit reached.&rdquo; Meter
              had been showing 88 percent in orange for twenty minutes; user
              ignored it. Dashboard would not have helped because the user
              never opened it. Surface that won: meter, but only if the user
              looks up. The orange flash is the meter doing its job.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>Friday 4 p.m., Max user.</strong> Sprint is wrapping up.
              The question is which model burned the weekly cap. Meter shows
              7-day Opus at 94 percent, 7-day Sonnet at 41 percent, but does
              not say &ldquo;Opus burned 73 percent of your week&rdquo; or
              draw a line chart. Dashboard answers the retrospective question:
              ccusage shows token totals per session, claude.ai/settings/usage
              shows the breakdown by model. Surface that won: dashboard. The
              meter pinned the now-state, the dashboard explained how you
              got here.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              <strong>Sunday 9 p.m., Max user with extra-usage on.</strong>{" "}
              Long agentic loop running. Rolling 5-hour pegged at 100 percent
              hours ago, but prompts keep going through because metered
              overage is on. Meter shows Extra usage at $73 / $200 (the
              dropdown row updates with each poll). Dashboard would only show
              this if the user opens the billing page, which most people do
              not on a Sunday night. Surface that won: meter, because the
              billing surprise is the kind of thing you want to see in your
              peripheral vision and not at month end.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why most heavy users run both
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The argument is not meter <em>or</em> dashboard. It is meter{" "}
          <em>plus</em> dashboard, with each one answering the question its
          archetype is good at.
        </p>
        <ul className="space-y-3 text-zinc-700 leading-relaxed text-lg ml-6 list-disc">
          <li>
            <strong>Meter for the moment.</strong> ClaudeMeter in the menu
            bar, sixty-second tick, two percentages, orange at 90 and red
            at 100. Decides whether the next agentic loop is safe.
          </li>
          <li>
            <strong>Anthropic&apos;s settings page for the official numbers.</strong>{" "}
            claude.ai/settings/usage when you want to confirm what the
            server actually thinks. Same JSON the meter polls; you visit it
            once a week to spot-check.
          </li>
          <li>
            <strong>ccusage for cost retrospection.</strong> Walks
            ~/.claude/projects/*.jsonl on disk, gives you cost per session,
            cost per pull request, model mix. The right surface for the
            Friday afternoon &ldquo;where did my budget go&rdquo; question
            on Claude Code traffic specifically.
          </li>
        </ul>
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          None of these replace each other. They answer different questions
          and the answers can drift by 30 to 40 percentage points while all
          three are correct: ccusage at 5 percent of estimated spend, the
          rolling 5-hour at 100 percent, and the dashboard&apos;s weekly Opus
          bar at 91 percent are all the same Tuesday afternoon, just
          measured against different reference frames.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          endpoint is undocumented. Anthropic ships an analytics dashboard
          for Team and Enterprise plans (per{" "}
          <a
            href="https://support.claude.com/en/articles/12883420-view-usage-analytics-for-team-and-enterprise-plans"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            support.claude.com/en/articles/12883420
          </a>
          ) but Pro and Max individuals only get the two-bar settings page.
          Whether a meter pattern continues to be the right answer depends
          on Anthropic not breaking the JSON shape on the settings page;
          ClaudeMeter declares every nullable field as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option
          </code>{" "}
          in Rust, so when the server adds, removes, or renames a sub-bucket,
          the next brew release patches it. macOS only today (12+); Safari
          is not yet supported. Source is open at{" "}
          <a
            href="https://github.com/m13v/claude-meter"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            github.com/m13v/claude-meter
          </a>
          .
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Not sure if you need a meter, a dashboard, or both?"
          description="15 minutes. Walk me through your Claude Code week. I will tell you which surfaces are doing real work for you and which one is missing the decision you actually need to make."
          text="Book a 15-minute call"
          section="meter-vs-dashboard-footer"
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
        description="Meter vs dashboard for Claude usage? 15 min."
        section="meter-vs-dashboard-sticky"
        site="claude-meter"
      />
    </article>
  );
}
