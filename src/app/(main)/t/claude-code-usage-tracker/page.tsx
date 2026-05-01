import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  AnimatedChecklist,
  GlowCard,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-usage-tracker";
const PUBLISHED = "2026-05-01";

export const metadata: Metadata = {
  title:
    "Claude Code usage tracker: there are two of them, and only one knows when your loop will 429",
  description:
    "Most Claude Code usage trackers count the local tokens you sent (ccusage, Claude-Code-Usage-Monitor). The number that actually 429s your loop is a server-side utilization on /api/organizations/{org}/usage. ClaudeMeter is the open-source tracker that reads it directly from the browser cookie you already have. Run both.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code usage tracker: there are two of them, and only one knows when your loop will 429",
    description:
      "Local-token trackers vs server-quota trackers. Why ccusage at 5% and a 429 happen on the same minute, and the seven lines of background.js that close that gap.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code usage tracker", url: PAGE_URL },
];

const faqs = [
  {
    q: "What is the best Claude Code usage tracker?",
    a: "Wrong question, because there are two non-overlapping tools and you want both. ccusage (github.com/ryoppippi/ccusage) walks ~/.claude/projects/*.jsonl and totals the tokens your CLI sent. ClaudeMeter (github.com/m13v/claude-meter) calls https://claude.ai/api/organizations/{org}/usage with your browser cookie and reads the percentage of plan that Anthropic counted those tokens against. ccusage answers 'what did this machine spend?'. ClaudeMeter answers 'when does the next prompt get a 429?'. Different inputs, different ledgers, both useful at the same time.",
  },
  {
    q: "Why does ccusage say 5% used when my Claude Code session got rate-limited?",
    a: "Because the two numbers are not the same number. ccusage sums input_tokens + output_tokens out of the JSONL transcripts on disk. The 429 is decided by the server-side seven_day or five_hour utilization on Anthropic's side, which factors in per-model weights, the peak-hour multiplier, attachments, browser-chat usage on the same plan, and tool-call overhead. The local token count and the server utilization can drift by 30 or 40 points and both still be correct readings of what they actually measure. ClaudeMeter shows the second one alongside ccusage so you can see the gap and stop guessing.",
  },
  {
    q: "How does ClaudeMeter read the server-side number without a cookie paste or API key?",
    a: "It ships a Manifest V3 browser extension that runs in the same browser you're already logged into. The extension fetches /api/organizations/{org}/usage with credentials: 'include', so the existing claude.ai cookie travels automatically. No copy-paste from DevTools, no embedded sign-in webview, no Anthropic API key (which only sees console spend, not plan quota). The seven lines that do this are at extension/background.js lines 5 to 12 in the open-source repo. Same private endpoint that claude.ai/settings/usage itself reads to draw your usage page.",
  },
  {
    q: "Will Anthropic block this for reading an undocumented endpoint?",
    a: "It is your own session calling a route your browser already calls every time you open Settings > Usage. There is no second account, no scraping, no parallel session. The READ rate is one request per minute per browser, well under what your normal browsing of claude.ai produces. The endpoint is undocumented, which means Anthropic can change it, not that they prohibit it. If they rename a field, the open-source repo gets a same-day patch and you pull the next brew release. The risk profile sits between 'reading my own bank statement on the bank's site' and 'using a chrome extension that customizes my Gmail'. Worth it for the 429-prediction; not worth it for someone uncomfortable with that.",
  },
  {
    q: "Does the menu bar app even need the browser extension?",
    a: "Not strictly, but it is the recommended path. With the extension loaded, the menu bar app gets snapshots over localhost:63762 and never touches your keychain. Without the extension, the app falls back to decrypting the Chrome Safe Storage cookie itself, which works but pops a Keychain prompt the first time on Arc, Brave, and Edge (Chrome silently approves). Most people use Route A because it skips the prompt and works across multiple browsers without configuration.",
  },
  {
    q: "Will it work on Linux or Windows?",
    a: "The browser extension yes, the macOS menu bar app no. The README is explicit: macOS only. On Linux or Windows you can install the extension and read the same 5h/7d numbers from the browser toolbar popup, but you don't get the always-visible menu bar chip or the localhost bridge. If you want a status-line readout on those platforms, the extension's chrome.action API still exposes the latest snapshot and a small companion script can mirror it into i3blocks/Polybar/Powershell.",
  },
  {
    q: "Should I uninstall ccusage if I'm using ClaudeMeter?",
    a: "No. ccusage is the only thing that breaks down spend by Claude Code session, by model, by project. If you want to see 'this refactor cost me 1.2M Sonnet tokens' you keep ccusage. ClaudeMeter does not parse JSONL at all and cannot show you which session burned which model. The two tools are complements: ccusage tells you what your Claude Code traffic weighed in tokens, ClaudeMeter tells you what fraction of the plan ceiling Anthropic counted that against. Run both. They poll different sources and answer different questions.",
  },
  {
    q: "What is in the JSON the extension actually reads?",
    a: "Eight Window structs and one ExtraUsage block, typed in src/models.rs lines 18 to 28. The Window structs are five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, and seven_day_cowork. Each Window has a utilization float (0.0 to 1.0+) and an optional resets_at timestamp. The ExtraUsage block carries is_enabled, monthly_limit, used_credits, utilization, and currency for the April 2026 metered-billing fall-through. The menu bar surfaces five_hour and seven_day in the title; the dropdown lists every Window, the extra-usage dollar line, and the resets_at countdown for each.",
  },
  {
    q: "How fast is install? I'm reading this from my phone on a Twitter thread.",
    a: "Open ClaudeMeter on a Mac later. The full path is brew install --cask m13v/tap/claude-meter (one command), then load the unpacked extension from the cloned repo into Chrome/Arc/Brave/Edge (about 60 seconds), then visit claude.ai once. The menu bar lights up within a minute with two percentages. If you only want the browser side, the extension folder is at github.com/m13v/claude-meter/tree/main/extension; load it unpacked and the toolbar badge starts ticking after one refresh of claude.ai.",
  },
];

const localTrackerLines = [
  { type: "command" as const, text: "ccusage --json | jq '.daily | last | .totalTokens'" },
  { type: "output" as const, text: "127432" },
  { type: "info" as const, text: "(ccusage adds up tokens from ~/.claude/projects/*.jsonl. Local truth.)" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# meanwhile, on the same minute:" },
  { type: "command" as const, text: "$ claude code 'finish the refactor'" },
  { type: "error" as const, text: "Error: rate limit reached. retry in 1h47m." },
  { type: "info" as const, text: "(Anthropic decided the same traffic was 91% of your plan. Different ledger.)" },
];

const serverTrackerLines = [
  { type: "command" as const, text: "# what claude.ai/settings/usage actually shows the moment you 429:" },
  { type: "output" as const, text: "5-hour       91.4% · resets in 1h47m" },
  { type: "output" as const, text: "7-day all    64.2% · resets in 4d" },
  { type: "output" as const, text: "7-day Sonnet 41.0%" },
  { type: "output" as const, text: "7-day Opus   78.6%" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# the menu bar chip during that same run:" },
  { type: "output" as const, text: "Claude  5h [91%]  ·  7d 64%" },
  { type: "info" as const, text: "(91% painted RGB 219,118,32. peripheral-vision warning, before the 429.)" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "$ /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json | jq '.usage.five_hour'" },
  { type: "output" as const, text: '{ "utilization": 91.4, "resets_at": "2026-05-01T19:14:00Z" }' },
  { type: "success" as const, text: "same number, machine-readable. drop into starship/tmux/fish." },
];

const backgroundJsExcerpt = `// extension/background.js lines 1-12 (the seven that matter, verbatim)
const BASE = "https://claude.ai";
const BRIDGE = "http://127.0.0.1:63762/snapshots";
const POLL_MINUTES = 1;

async function fetchJSON(url) {
  const r = await fetch(url, {
    credentials: "include",                 // <- THIS is the line
    headers: { "accept": "application/json" },
  });
  if (!r.ok) throw new Error(\`\${r.status} \${r.statusText} @ \${url}\`);
  return r.json();
}

// Manifest V3 background service worker.
// host_permissions in manifest.json includes "https://claude.ai/*",
// so the browser attaches your existing session cookie to this fetch
// the same way it would for any tab open at claude.ai/settings/usage.
// No paste. No second login. No anthropic API key.`;

const trackerCamps = [
  {
    feature: "What it reads",
    ours: "/api/organizations/{org}/usage on claude.ai (server-side utilization)",
    competitor: "~/.claude/projects/*.jsonl on disk (local token transcripts)",
  },
  {
    feature: "Predicts the 429?",
    ours: "Yes. The server utilization is the field Anthropic checks before throwing 429.",
    competitor: "No. Tokens-on-disk and server-utilization can disagree by 30 to 40 points.",
  },
  {
    feature: "Sees browser-chat usage on the same plan?",
    ours: "Yes. The server bucket counts every prompt against your plan, regardless of source.",
    competitor: "No. Only Claude Code traffic ends up in JSONL.",
  },
  {
    feature: "Sees per-model weights and peak-hour multiplier?",
    ours: "Yes. The server has already applied them by the time it returns utilization.",
    competitor: "No. JSONL records raw token counts.",
  },
  {
    feature: "Auth model",
    ours: "Existing claude.ai browser cookie via credentials: 'include'. No paste, no API key.",
    competitor: "None needed. Reads files on your filesystem.",
  },
  {
    feature: "Where you read it",
    ours: "macOS menu bar (always visible), browser toolbar popup, claude-meter --json CLI.",
    competitor: "Terminal pane (ccusage --watch) or one-shot ccusage table.",
  },
  {
    feature: "License",
    ours: "MIT, Rust + JavaScript",
    competitor: "MIT, TypeScript",
  },
  {
    feature: "Best used",
    ours: "To know whether your next prompt 429s",
    competitor: "To know which session burned which model and how many tokens",
  },
];

const invariants = [
  {
    text: "ccusage and ClaudeMeter measure non-overlapping things. ccusage = tokens you sent. ClaudeMeter = % of plan Anthropic counted those (and your browser-chat usage) against. Treating them as alternatives is a category error; treating them as alternatives is what produces 'I'm only at 5% why am I rate-limited' tweets.",
  },
  {
    text: "Only server-quota trackers can predict the 429. The 429 fires on the server-side utilization, not the local token count, so any tool that does not call /api/organizations/{org}/usage (or watch the live SSE message_limit stream) is structurally unable to warn you in advance.",
  },
  {
    text: "credentials: 'include' is the entire trick. With it, an extension reuses whatever cookie Chrome is storing for claude.ai. Without it, every other server-quota tool has to either embed a webview, ask you to paste the Cookie header from DevTools, or pop a macOS Keychain prompt to decrypt the cookie database itself.",
  },
  {
    text: "An Anthropic API key cannot read plan usage. The console.anthropic.com API key sees console spend (your billable API calls), which has zero relationship to Pro/Max plan quota. Trackers that ask for an API key are reading a different ledger and will never warn you about a Claude Code 429.",
  },
  {
    text: "The endpoints are undocumented but stable enough to ship. The repo declares every Window field as Optional and uses #[serde(default)] on booleans, so a renamed field deserializes as None or false instead of crashing. When Anthropic does rename one, the fix is one line in src/models.rs and the next brew release ships within hours.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "Why ccusage and claude.ai disagree on your usage percent",
    excerpt:
      "The full walk through the gap: peak-hour multiplier, attachments, tool calls, browser-chat usage, and the field that actually trips the 429.",
    tag: "Local vs server",
  },
  {
    href: "/t/claude-code-usage-menu-bar",
    title: "Claude Code usage in the macOS menu bar: the two-tier redraw",
    excerpt:
      "Why the menu bar is the right surface for an agentic Claude Code loop, and the redraw branch that keeps the dropdown from snapping shut every poll.",
    tag: "Menu bar",
  },
  {
    href: "/t/claude-weekly-limit-extra-usage",
    title: "Claude weekly limit and extra usage: the fall-through chain",
    excerpt:
      "When the 7-day bar pegs at 100, three things can happen. Three values across two endpoints decide which one. The full state machine, with JSON.",
    tag: "Weekly + metered",
  },
  {
    href: "/t/open-source-claude-usage-trackers-april-2026",
    title: "Open source Claude usage trackers: a field guide",
    excerpt:
      "Seven OSS trackers sorted by the only question that matters: do they read local logs or the server endpoint? Plus the one that gets there with no cookie paste.",
    tag: "Field guide",
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
                "Claude Code usage tracker: there are two of them, and only one knows when your loop will 429",
              description:
                "Local-token trackers (ccusage, Claude-Code-Usage-Monitor) vs server-quota trackers (ClaudeMeter). Why both exist, why both are useful, and why only the second one can warn you before the 429.",
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
          __html: JSON.stringify(faqPageSchema(faqs.map((f) => ({ q: f.q, a: f.a })))),
        }}
      />

      <Breadcrumbs
        items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))}
        className="pt-8"
      />

      <header className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          A Claude Code usage tracker that{" "}
          <GradientText>predicts the 429</GradientText> reads a different number than ccusage
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          You came here from a thread asking which tool to install. Short version:
          there are two camps of trackers, they read non-overlapping data, and the
          tracker that tells you when your next Claude Code prompt 429s is not the
          tracker most posts recommend. This page walks the gap, shows the seven
          lines of source that close it, and tells you which two tools to install
          (yes, two) so you stop being surprised by rate limits.
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
            Direct answer (verified 2026-05-01)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            Two trackers, two answers, and you want both.{" "}
            <a
              href="https://github.com/ryoppippi/ccusage"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              ccusage
            </a>{" "}
            sums local Claude Code tokens out of{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              ~/.claude/projects/*.jsonl
            </code>
            .{" "}
            <a
              href="https://github.com/m13v/claude-meter"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              ClaudeMeter
            </a>{" "}
            calls{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              GET /api/organizations/&#123;org&#125;/usage
            </code>{" "}
            with the cookie your browser already has and reads the same percentage
            Anthropic uses to decide your next 429. ccusage tells you what you
            spent. ClaudeMeter tells you how close you are to the wall. Install
            both. Source for the cookie path is verifiable at{" "}
            <a
              href="https://github.com/m13v/claude-meter/blob/main/extension/background.js"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              extension/background.js
            </a>{" "}
            (the line is{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              credentials: &quot;include&quot;
            </code>
            ).
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The 5%-and-rate-limited paradox
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You probably hit it once already. Your terminal-side tracker says
          you have used a small fraction of your tokens this week. Your next
          Claude Code prompt comes back with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            rate limit reached
          </code>
          . Both readings are correct. They are not the same reading.
        </p>
        <TerminalOutput
          title="What ccusage reports vs what Anthropic enforces"
          lines={localTrackerLines}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          The local tracker counts tokens it can see on your filesystem. That is
          a faithful, complete record of one channel: Claude Code traffic from
          this machine. It does not see the chat tab you used to draft a PR
          description, the per-model weight Anthropic applies (Opus is heavier
          than Sonnet on the same byte count), the peak-hour multiplier, or any
          attachments, tool calls, or browser-chat usage that share the same
          rolling-window bucket on the server.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Server-side utilization is what gets compared against 1.0 before
          Anthropic decides to 429 your next prompt. It lives at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/api/organizations/&#123;org&#125;/usage
          </code>
          . Read it directly and you can see the 91% before you discover it the
          way most people do, with an error message mid-loop.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The tracker that predicts the 429 reads a different number
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Here is the same minute from the server side. The five-hour bucket is
          at 91%, two clicks shy of the wall. The chip in the menu bar is
          painted orange. The CLI prints the same number, machine-readable, so
          you can fold it into a status line.
        </p>
        <TerminalOutput
          title="ClaudeMeter on the same minute"
          lines={serverTrackerLines}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The seven lines that close the gap
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The thing every other server-quota tracker stumbles on is auth.
          Three common patterns: paste your{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            sessionKey
          </code>{" "}
          from DevTools, sign into claude.ai inside an embedded webview, or hand
          over an Anthropic API key (which only reads console spend, never plan
          quota). All three add a manual step the user has to redo when the
          cookie rotates.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          A real Manifest V3 extension running inside Chrome, Arc, Brave, or
          Edge has a fourth option, and it is one keyword on a fetch call:
        </p>
        <AnimatedCodeBlock
          code={backgroundJsExcerpt}
          language="javascript"
          filename="extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The browser attaches the existing claude.ai cookie to the request the
          same way it would for any tab on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>
          . No paste. No second sign-in. No keychain prompt. The endpoint
          returns eight Window structs (rolling 5-hour, plus seven 7-day
          buckets including Sonnet-specific and Opus-specific) and the
          extra-usage block for April 2026 metered billing. Typed in{" "}
          <a
            href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
            className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          >
            src/models.rs
          </a>{" "}
          lines 18 to 28. Shipped over a localhost bridge to the menu bar app.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Two camps of trackers, eight rows that distinguish them
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Both are MIT-licensed and free. The choice is not better or worse, it
          is what you want to measure. ccusage and ClaudeMeter complement each
          other; running both is the right answer.
        </p>
        <ComparisonTable
          productName="Server-quota tracker (ClaudeMeter)"
          competitorName="Local-token tracker (ccusage, Claude-Code-Usage-Monitor)"
          rows={trackerCamps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Five things to remember when you pick a tracker
        </h2>
        <AnimatedChecklist
          title="Mental model for Claude Code usage tracking"
          items={invariants}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Install path, the 60-second version
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You can do this later from a Mac. The full path is one brew command
          plus a one-time browser-extension load. The extension is what removes
          the cookie-paste step; without it, ClaudeMeter still works by reading
          the Chrome Safe Storage cookie directly, but Arc, Brave, and Edge
          will pop a Keychain prompt the first time.
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
                . Drops ClaudeMeter.app into /Applications and registers a
                launch agent so the menu bar icon comes back after reboot.
              </li>
              <li>
                <span className="block text-xs font-mono uppercase tracking-widest text-teal-700 mb-1">
                  Step 2
                </span>
                Clone the repo. Open chrome://extensions (or arc://extensions,
                brave://extensions, edge://extensions). Enable Developer mode.
                Click Load unpacked. Point at the{" "}
                <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                  extension/
                </code>{" "}
                folder. Pin the icon if you want the toolbar popup.
              </li>
              <li>
                <span className="block text-xs font-mono uppercase tracking-widest text-teal-700 mb-1">
                  Step 3
                </span>
                Visit claude.ai once. The extension fetches{" "}
                <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                  /api/organizations/&#123;org&#125;/usage
                </code>{" "}
                with your existing cookie and POSTs the snapshot to the menu
                bar over localhost:63762. Within sixty seconds the chip lights
                up with two percentages.
              </li>
              <li>
                <span className="block text-xs font-mono uppercase tracking-widest text-teal-700 mb-1">
                  Step 4 (optional, for the local-token side)
                </span>
                <code className="bg-zinc-100 px-2 py-1 rounded text-sm font-mono">
                  npm i -g ccusage
                </code>{" "}
                and run{" "}
                <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                  ccusage --watch
                </code>{" "}
                in a tmux pane. Now you have both numbers: the local tokens you
                burned, and the server percentage that decides the 429.
              </li>
            </ol>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoints are undocumented. Anthropic can rename a field in any
          claude.ai release and a tracker built on them has to ship a patch.
          ClaudeMeter declares every Window field as Optional and ships{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            #[serde(default)]
          </code>{" "}
          on the booleans, so a missing or renamed field deserializes as None
          or false instead of crashing. That is forward-compat hedging, not a
          guarantee. If you need long-term stability over freshness, the
          official answer is to refresh{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          by hand. If you want a live menu bar chip and you accept that the
          repo follows Anthropic when they move, install ClaudeMeter.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Building your own Claude Code usage tracker?"
          description="Send a 15 minute call. Happy to compare endpoint shapes, the cookie pipeline, and the moments the JSON shifts under us."
          text="Book a 15-minute call"
          section="claude-code-usage-tracker-footer"
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
        description="Questions on Claude Code tracking? 15 min."
        section="claude-code-usage-tracker-sticky"
        site="claude-meter"
      />
    </article>
  );
}
