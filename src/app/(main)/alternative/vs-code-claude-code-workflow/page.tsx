import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  BeforeAfter,
  GlowCard,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/alternative/vs-code-claude-code-workflow";
const PUBLISHED = "2026-05-05";

export const metadata: Metadata = {
  title:
    "VS Code with Claude Code workflow: the rate-limit gap nobody else covers",
  description:
    "Most VS Code + Claude Code workflow guides walk through panels, @-mentions and permission modes, then leave you to discover the rolling 5-hour wall mid-refactor. The Anthropic extension exposes /usage as a one-shot lookup. claude-meter pins the same number live in your menu bar so the meter stays in your peripheral vision while you keep typing.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "VS Code with Claude Code workflow: the rate-limit gap nobody else covers",
    description:
      "Anthropic's VS Code extension has /usage as a one-shot slash command. claude-meter renders the same numbers live in the menu bar on a 60-second tick so the wall does not surprise you mid-refactor.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Does the Anthropic VS Code extension already show plan usage?",
    a: "It exposes a /usage slash command in the prompt box. The Anthropic VS Code docs page (code.claude.com/docs/en/vs-code) lists it in the command menu alongside file attachments, model switching and extended thinking. /usage is a one-shot dump: you type it, you read it, the answer scrolls off as soon as you keep prompting. There is no persistent indicator in the VS Code chrome that tells you the 5-hour window is at 78% before the next agentic loop starts.",
  },
  {
    q: "Does claude-meter replace the VS Code Claude Code extension?",
    a: "No. They are complementary. The VS Code extension is where you run prompts, review diffs, manage permission modes and accept edits. claude-meter is a separate macOS menu bar app and browser extension whose only job is to keep the rolling 5-hour, 7-day, and extra-usage numbers visible while you work in VS Code. You install both. Neither cares the other exists.",
  },
  {
    q: "Where does claude-meter get its numbers from?",
    a: "From claude.ai/api/organizations/{org}/usage, the same internal endpoint the VS Code extension's /usage command and claude.ai/settings/usage page read. The browser extension (extension/background.js, line 24) calls that URL with your existing claude.ai cookies once per minute and pushes the snapshot to the menu bar app over localhost. Numbers match Settings exactly because they come from the same source of truth.",
  },
  {
    q: "Will claude-meter measure tokens spent inside VS Code?",
    a: "No, by design. Token counting from the local Claude Code session lives in ccusage, which reads ~/.claude/projects/<project>/<session>.jsonl on disk. claude-meter measures plan quota, not token spend. If you want both views (cost-per-session locally and quota-remaining server-side) you run the two side by side. They answer different questions.",
  },
  {
    q: "What runs while VS Code is closed?",
    a: "claude-meter does. The macOS menu bar app and the browser extension are independent of VS Code's lifecycle. Even with VS Code quit and Claude Code idle, the meter keeps polling the rolling window so when you come back, it is already current. The /usage slash command obviously does not run unless you have an open Claude Code conversation in VS Code.",
  },
  {
    q: "Is there a CLI I can pipe into a VS Code status bar widget?",
    a: "Yes. The brew cask installs a claude-meter binary at /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter that prints the same percentages and reset timestamps to stdout (with --json for machine-readable output). You can wire that into a custom VS Code status-bar contributor extension, into the integrated terminal as a Starship segment, or into tmux. The CLI is the same code path as the menu bar; nothing extra is required.",
  },
  {
    q: "Does it work with Claude Code's worktree mode?",
    a: "claude --worktree spins up an isolated branch and file state but uses the same Anthropic plan. The rolling window is account-wide on the server, so claude-meter's number reflects every parallel worktree, every other VS Code window, and every claude.ai web tab combined. That is what you want: one quota, one meter, regardless of how many parallel Claude Code conversations you have open.",
  },
  {
    q: "I am on Cursor, not VS Code. Does this still work?",
    a: "Yes. Anthropic ships the same Claude Code extension to Cursor (cursor:extension/anthropic.claude-code per the Anthropic docs page), and claude-meter does not care which IDE you run in: it reads claude.ai cookies from your Chromium-family browser, not from your editor. The workflow gap is identical: /usage is one-shot inside the editor, claude-meter is live outside it.",
  },
  {
    q: "How do I keep the menu bar number visible without a full-screen VS Code?",
    a: "On macOS the menu bar is always visible in the standard window mode and stays visible in Stage Manager. In native full-screen the menu bar auto-hides; either move VS Code into a tiled split (System Settings > Desktop & Dock > 'Show menu bar in full screen': on) or use the CLI in your VS Code integrated terminal as an always-on second display. The browser extension toolbar icon also shows the 5-hour percentage as a badge, so a pinned Chrome window in Stage Manager works too.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Alternatives", url: "https://claude-meter.com/alternative" },
  { name: "VS Code with Claude Code workflow", url: PAGE_URL },
];

const comparisonRows = [
  {
    feature: "Where the number lives",
    competitor:
      "Inside the Claude Code conversation panel after you type /usage. Scrolls away as soon as you send the next prompt.",
    ours: "macOS menu bar (always visible) and Chrome/Arc/Brave/Edge toolbar badge (always visible). Persists across VS Code restarts.",
  },
  {
    feature: "Refresh model",
    competitor:
      "On-demand only. You have to remember to type /usage. There is no push notification when you cross 80% on the 5-hour window.",
    ours: "Polls every 60 seconds (extension/background.js POLL_MINUTES = 1). Toolbar badge color shifts at 80% (orange) and 100% (red).",
  },
  {
    feature: "Data source",
    competitor:
      "claude.ai/api/organizations/{org}/usage (the same endpoint claude.ai/settings/usage renders).",
    ours: "claude.ai/api/organizations/{org}/usage. Identical endpoint, identical numbers. Plus /overage_spend_limit and /subscription_details for the metered ledger and next-charge date.",
  },
  {
    feature: "Surfaces the weekly + extra-usage rows together",
    competitor:
      "Yes for the rolling buckets if you are on a current Claude Code build; the dump is verbose and you have to parse it visually.",
    ours: "Compact six-row table in the menu bar dropdown: 5-hour, 7-day all, 7-day Sonnet, 7-day Opus, Extra usage, Next charge. One glance.",
  },
  {
    feature: "Visible while VS Code is closed",
    competitor: "No. Requires an open Claude Code conversation.",
    ours: "Yes. Menu bar app and browser extension run independently of VS Code's lifecycle.",
  },
  {
    feature: "Visible across multiple VS Code windows",
    competitor:
      "Per-window. Each Claude Code panel has its own conversation; /usage runs against your account either way.",
    ours: "Single menu bar item reflects account-wide quota across every VS Code window, every Cursor instance, and every claude.ai web tab.",
  },
  {
    feature: "Token spend per session",
    competitor: "No. /usage is plan quota, not token cost.",
    ours: "No, by design. Token cost lives in ccusage (npx ccusage). claude-meter and ccusage answer different questions.",
  },
  {
    feature: "Cost",
    competitor: "Bundled with the Claude Code extension. Free with a Pro/Max plan.",
    ours: "Free. MIT licensed. brew install --cask m13v/tap/claude-meter.",
  },
];

const backgroundJsExcerpt = `// claude-meter/extension/background.js
//
// One HTTPS request per minute. Same endpoint the VS Code
// /usage slash command and claude.ai/settings/usage render
// from. No cookie paste, no manual auth: the extension is
// running inside your authenticated claude.ai session.

const BASE = "https://claude.ai";
const BRIDGE = "http://127.0.0.1:63762/snapshots";
const POLL_MINUTES = 1;

async function fetchSnapshots() {
  const account = await fetchJSON(\`\${BASE}/api/account\`);
  const memberships = account.memberships || [];
  const results = [];
  for (const m of memberships) {
    const org = m.organization?.uuid || m.uuid;
    if (!org) continue;
    let usage = null, overage = null, subscription = null;
    try { usage = await fetchJSON(\`\${BASE}/api/organizations/\${org}/usage\`); }
    catch (e) { /* ... */ }
    try { overage = await fetchJSON(\`\${BASE}/api/organizations/\${org}/overage_spend_limit\`); }
    catch (e) { /* may not exist for all orgs */ }
    /* ... */
    results.push({ org_uuid: org, usage, overage, subscription, /* ... */ });
  }
  return results;
}

chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === "refresh") refresh();
});`;

const menuBarSession = [
  { type: "command" as const, text: "$ claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour            78.0% used    -> resets Tue May 5 18:00 (in 2h)" },
  { type: "output" as const, text: "7-day all         62.0% used    -> resets Sat May 9 09:00 (in 3d)" },
  { type: "output" as const, text: "7-day Sonnet      48.0% used    -> resets Sat May 9 09:00 (in 3d)" },
  { type: "output" as const, text: "7-day Opus        81.0% used    -> resets Sat May 9 09:00 (in 3d)" },
  { type: "output" as const, text: "Extra usage       $4.20 / $50.00 (8%)" },
  { type: "output" as const, text: "Next charge       May 14, 2026   visa ••0936" },
  { type: "output" as const, text: "" },
  { type: "success" as const, text: "Same numbers as /usage in VS Code, just always visible." },
];

const setupSteps = [
  {
    title: "Keep the Anthropic Claude Code extension where it is",
    description:
      "claude-meter does not replace it. Leave the Spark icon in your VS Code editor toolbar, leave plan/auto-accept/normal mode the way you set it. The only thing this changes is what is visible outside the editor.",
  },
  {
    title: "Install the menu bar app",
    description:
      "brew install --cask m13v/tap/claude-meter. The cask installs ClaudeMeter.app and the claude-meter CLI under /Applications/ClaudeMeter.app/Contents/MacOS/. No account creation, no sign-in screen, no telemetry. The app reads its data from your existing claude.ai browser session via the extension; nothing about VS Code changes.",
  },
  {
    title: "Load the browser extension once",
    description:
      "git clone the repo, open chrome://extensions (or arc://extensions etc.), enable Developer mode, Load unpacked, point it at the extension/ folder. Visit claude.ai once so the extension picks up your session cookie. From here a single HTTPS request per minute hits /api/organizations/{uuid}/usage and POSTs the snapshot to the menu bar app on localhost:63762.",
  },
  {
    title: "Drop the meter into your peripheral vision and forget it",
    description:
      "The menu bar item shows the worst of (5-hour, 7-day) as a percentage. The dropdown shows the full six-row breakdown. The browser extension's toolbar badge is the same percentage. While you stay typing in VS Code, the number ticks down from the corner of your eye. Type /usage in Claude Code only when you want the verbose dump.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-code-usage-menu-bar",
    title: "Claude Code usage in the menu bar: what to actually look at",
    excerpt:
      "Six rows, one glance. The menu bar layout that maps each row to a different concrete failure mode (5-hour wall, weekly cap, opus-specific cap, metered BLOCKED).",
    tag: "Reference",
  },
  {
    href: "/t/claude-code-rolling-5-hour-usage",
    title: "Claude Code rolling 5-hour usage: what triggers the wall",
    excerpt:
      "How the 5-hour bucket is actually shaped on the server, what messages count toward it, and why the count from your VS Code session does not match the claude.ai number.",
    tag: "Diagnosis",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage measures local Claude Code tokens off disk. ClaudeMeter measures plan quota off claude.ai. Many heavy VS Code Claude Code users run both.",
    tag: "Comparison",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "VS Code with Claude Code workflow: the rate-limit gap nobody else covers",
  description:
    "Anthropic's VS Code Claude Code extension exposes /usage as a one-shot slash command. claude-meter renders the same numbers (rolling 5-hour, 7-day, extra-usage) live in the macOS menu bar on a 60-second tick. Same endpoint, same data, different surface. The workflow gap most VS Code Claude Code guides skip.",
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

export default function VsCodeClaudeCodeWorkflowPage() {
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
          VS Code with Claude Code workflow:{" "}
          <GradientText>the rate-limit gap</GradientText> nobody else covers
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every VS Code + Claude Code workflow guide walks through the Spark
          icon, @-mentions, plan vs auto-accept, /worktree and the diff
          reviewer. None of them cover the moment the agent dies mid-refactor
          because you blew through the rolling 5-hour window. The Anthropic
          extension does have a /usage slash command, but it is a one-shot dump
          inside the chat panel. claude-meter pins the same number into your
          macOS menu bar on a 60-second tick so the wall stops sneaking up on
          you. Same endpoint, same data, different surface.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="7 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-05)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            Type{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /usage
            </code>{" "}
            inside the Anthropic VS Code Claude Code extension for a one-shot
            plan-quota dump (it sits in the same{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /
            </code>{" "}
            command menu as file attachments, model switching, and extended
            thinking, per Anthropic&apos;s{" "}
            <a
              href="https://code.claude.com/docs/en/vs-code"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              VS Code extension docs
            </a>
            ). For a live, always-visible readout that does not require leaving
            the editor, install{" "}
            <a
              href="https://github.com/m13v/claude-meter"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              claude-meter
            </a>{" "}
            (
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              brew install --cask m13v/tap/claude-meter
            </code>
            ). It calls the same{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              /api/organizations/&#123;org&#125;/usage
            </code>{" "}
            endpoint on a 60-second alarm and pins the rolling 5-hour, 7-day,
            and extra-usage rows to your macOS menu bar so the wall stops
            surprising you. Numbers match exactly because the data source is
            identical.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The gap every VS Code + Claude Code guide skips
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Open any current article on running Claude Code inside VS Code,
          including Anthropic&apos;s own docs page, eesel&apos;s setup guide,
          DataCamp&apos;s tutorial, ClaudeLog, sitepoint, builder.io, and
          claudefa.st. Compare the section headings: install the extension,
          sign in, send a prompt, review changes, switch permission modes,
          @-mention files, attach images, run multiple sessions in tabs, use
          worktrees, swap to terminal mode, configure MCP servers, integrate
          git. Every one of those is real and useful.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          What is missing: the moment Claude Code stops responding, posts
          &ldquo;message limit reached&rdquo; into the panel, and your half-done
          refactor sits there in the diff view waiting for a reset timer you
          cannot see. The Anthropic docs page mentions{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          exactly once, in a list of available slash commands. None of the
          third-party guides mention it at all. None of them mention the
          rolling 5-hour window, the 7-day weekly quota, or the extra-usage
          metered ledger that activates when you opt in.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          That is the gap. The workflow people actually live with on Pro and
          Max is: write, prompt, accept, write, prompt, accept, dead. The
          dead moment is the one nobody covers.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          /usage in VS Code vs claude-meter in the menu bar
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          They are not rivals. They run against the same endpoint and surface
          the same fact. The difference is whether the fact is a slash command
          you remember to run, or a number you cannot help but see.
        </p>
        <ComparisonTable
          productName="claude-meter (menu bar)"
          competitorName="/usage (slash command)"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The five lines that do the work
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The data path is short enough to read. The browser extension declares
          a base URL, a localhost bridge URL, and a poll interval, then the
          alarm handler calls{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            fetchSnapshots()
          </code>{" "}
          which hits the same{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          URL the VS Code{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          command and the claude.ai/settings/usage page read from. Cookies are
          your existing claude.ai session, so there is no cookie paste and no
          new auth flow. MIT licensed; the file is 121 lines total.
        </p>
        <AnimatedCodeBlock
          code={backgroundJsExcerpt}
          language="javascript"
          filename="extension/background.js"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the menu bar dropdown actually looks like
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You can also pipe this same data through the CLI in your VS Code
          integrated terminal. The output is identical to the menu bar
          dropdown, with the same six rows.
        </p>
        <TerminalOutput title="claude-meter status, mid-workday" lines={menuBarSession} />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The menu bar item itself just shows the worst-of (5-hour, 7-day) as a
          percent: a green 78 in this snapshot. At 80%+ it goes orange; at 100%
          red. That is enough peripheral signal to know whether to start a
          two-hour agentic loop or not, without ever opening the Claude Code
          panel to type{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>
          .
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Workflow with vs without the meter
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Same VS Code, same Claude Code extension, same Pro or Max plan.
          Toggle to flip between the two states.
        </p>
        <BeforeAfter
          before={{
            label: "Without claude-meter",
            content:
              "You start a refactor in plan mode, hit accept, watch the diffs land, and ten minutes in the panel suddenly says message limit reached. You scroll back to find /usage in the slash menu, run it, see 100% on the 5-hour. You do mental math against resets_at. Tomorrow you forget again, because the number was never visible the rest of the time.",
            highlights: [
              "/usage is a one-shot, not a status indicator",
              "First signal is the failure itself",
              "Mental math against a timestamp every time",
              "Easy to start an agentic loop you cannot finish",
            ],
          }}
          after={{
            label: "With claude-meter pinned",
            content:
              "Menu bar shows 78%. You see it before you start the refactor and decide whether to wait. At 95% the icon goes orange and you wrap the work. At 100% it goes red and you switch to non-Claude tasks until the resets_at on the dropdown passes. /usage in VS Code is still there for the verbose dump, but you almost never need it.",
            highlights: [
              "Quota visible 100 percent of working time",
              "Color shift at 80% and 100% as a peripheral alarm",
              "Six-row dropdown for weekly + extra-usage detail",
              "Decision moves from after-failure to before-start",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Adding it to your VS Code workflow
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Four steps. Nothing about your VS Code or Claude Code extension
          configuration changes; this is purely additive.
        </p>
        <StepTimeline steps={setupSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Where this gets people in trouble
        </h2>
        <GlowCard>
          <div className="p-2 space-y-4">
            <p className="text-zinc-700 leading-relaxed text-lg">
              The most common mistake: assuming{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /usage
              </code>{" "}
              and ccusage answer the same question, and that running both is
              redundant. They do not. ccusage measures local Claude Code tokens
              against the public price card. /usage and claude-meter measure
              plan quota the server enforces. ccusage at 5% of estimated spend
              while the rolling 5-hour bar is at 100% used is a real, frequent
              state. Both numbers are correct; they describe different things.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              The second mistake: assuming the rolling 5-hour resets exactly 5
              hours after the first message of your session. It does not
              exactly. The{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                resets_at
              </code>{" "}
              field on{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /usage
              </code>{" "}
              is the actual server-side timestamp, exact to the second. The
              menu bar dropdown prints it (e.g.{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                resets Tue May 5 18:00 (in 2h)
              </code>
              ). Trust that, not your wall clock.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg">
              The third mistake: forgetting that on a Max plan with extra
              usage enabled, the 5-hour bar can sit at 100% for hours while you
              are still serving prompts via the metered ledger. The menu bar
              has a separate Extra usage row for exactly this case, so you can
              tell &ldquo;rolling window pegged but spending dollars
              fine&rdquo; apart from &ldquo;rolling window pegged and 429
              imminent.&rdquo; The slash command shows the same fields, but it
              scrolls.
            </p>
          </div>
        </GlowCard>
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
          endpoint is undocumented, the same way the data behind{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usage
          </code>{" "}
          inside the Anthropic VS Code extension is undocumented. Anthropic
          could rename a field tomorrow. claude-meter declares every nullable
          field as Option in Rust and ships a same-day patch when something
          shifts; the cask updates pick it up. macOS only today (12+); Safari
          is not yet supported. If you live in Linux or Windows the slash
          command is the only option and the workflow gap stays. The repo is
          open at github.com/m13v/claude-meter if you want to see exactly what
          it sends.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Hitting the wall mid-refactor in VS Code?"
          description="15 minutes. Walk me through your Claude Code workflow, I will show you what claude-meter would tell you about it on day one."
          text="Book a 15-minute call"
          section="vs-code-claude-code-workflow-footer"
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
        description="Questions on Claude Code in VS Code and the rolling window? 15 min."
        section="vs-code-claude-code-workflow-sticky"
        site="claude-meter"
      />
    </article>
  );
}
