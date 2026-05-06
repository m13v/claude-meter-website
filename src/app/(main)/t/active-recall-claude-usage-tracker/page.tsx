import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  AnimatedChecklist,
  StepTimeline,
  GlowCard,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/active-recall-claude-usage-tracker";
const PUBLISHED = "2026-05-05";

export const metadata: Metadata = {
  title:
    "Active Recall Study Sessions and the Claude 5-Hour Window: Where the Usage Goes",
  description:
    "Quizzing yourself with Claude Pro burns the rolling 5-hour window faster than the card count suggests, because each new question carries the growing transcript. Here is the mechanic, the JSON the server returns, and how to schedule a study break around the reset instead of around the 'message limit reached' wall.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Active Recall Study Sessions and the Claude 5-Hour Window: Where the Usage Goes",
    description:
      "Why a flashcard back-and-forth eats the 5-hour rolling cap on Claude Pro, what /api/organizations/{org}/usage actually returns mid-session, and how to plan a study break around resets_at instead of the rate-limit error.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Why does an active recall session with Claude burn quota faster than the same number of normal questions?",
    a: "Because each turn includes the entire prior transcript. When you ask Claude to quiz you on chapter three, then answer, then ask for the next card, every prompt sends back the system prompt, the running quiz frame, the cards you have already seen, your previous answers, and Claude's previous responses. By card twenty the input is a small essay even though the visible message is one sentence. The 5-hour rolling cap weighs input tokens too, so a 30-card recall session can register against the cap like a long technical conversation.",
  },
  {
    q: "How do I see the actual percent of my 5-hour window mid-session without leaving the chat?",
    a: "Install ClaudeMeter (free, MIT, github.com/m13v/claude-meter). It runs as a macOS menu bar app plus a browser extension that polls /api/organizations/{org_uuid}/usage on claude.ai once every 60 seconds with your existing logged-in cookie, reads five_hour.utilization and five_hour.resets_at, and renders a row labelled '5-hour · {countdown} · {percent}%' in the popup and on the menu bar. No cookie paste, no API key, no extra tab.",
  },
  {
    q: "Will ccusage tell me how much of my Claude Pro session quota I have left during a study session?",
    a: "No. ccusage reads ~/.claude/projects/{project}/{session}.jsonl on disk, which is what the Claude Code CLI writes locally. A claude.ai chat session does not write to that path at all, so ccusage shows zero usage even after an hour of recall quizzing in the browser. The number Anthropic actually weighs against your 5-hour cap only comes through the cookie-authenticated GET on /api/organizations/{org_uuid}/usage, which is what ClaudeMeter polls.",
  },
  {
    q: "How long does the 5-hour rolling window actually take to reset?",
    a: "The window is rolling, not fixed. resets_at points at the moment the oldest weighted prompt in your bucket ages out 5 hours after it was sent. So if you fire your first heavy prompt at 14:02 and your last one at 15:30, the bucket does not empty all at once at 19:30; it tapers as each prompt rolls past its 5-hour anniversary. The popup countdown ('38m', '4h', '12m') is the time until the bucket utilization drops below the cap, computed off the resets_at field the server returns.",
  },
  {
    q: "What is the cheapest active recall pattern that does not eat the cap?",
    a: "Three things in combination. First, start each card in a fresh chat instead of one long thread; that drops the carried transcript to zero. Second, use Sonnet or Haiku for the quiz turns and reserve Opus for the moments you actually need a deep explanation; the per-model weighting matters. Third, watch the menu bar percent. When the 5-hour row crosses 80, switch to lighter models or let the next 30 minutes roll the bucket forward before you push more cards through.",
  },
  {
    q: "Does ClaudeMeter work if I am studying through claude.ai in the browser, not Claude Code?",
    a: "Yes. The extension fetches /api/organizations/{org}/usage with credentials: 'include', which means it travels on the same session cookie claude.ai uses for the chat surface. Whether your last hour of usage came from Claude Code, the desktop app, claude.ai chat, or all three at once, the server reports the unified five_hour.utilization fraction and the extension reads it. The chat-side burn is exactly what active recall study sessions generate, and it is exactly the burn local-log tools cannot see.",
  },
  {
    q: "How do I time a study break so the window resets while I am away from the desk?",
    a: "Look at the popup row. If it reads '5-hour · 1h · 84%', a 60 to 75 minute break gets you back to a fresh bucket, because the next batch of weighted prompts ages out during that window. If the countdown reads 'Nh' (e.g. '3h'), a single break is not going to clear it; alternate to lighter cards, switch to a notebook, or accept that the rest of the session is going to be Sonnet-only.",
  },
  {
    q: "What does the popup actually show while I am quizzing?",
    a: "Two rows on a Pro account. The first is '5-hour · {countdown} · {percent}%' for the rolling cap; the second is '7-day · {countdown} · {percent}%' for the weekly bucket. Both come from the same /usage JSON. The toolbar badge holds the 5-hour percent (because that is the cap that fires next on a heavy session), and the icon tooltip shows both. The menu bar app surfaces the same numbers, color coded green under 80, orange at 80, red at 100.",
  },
  {
    q: "Can I run claude-meter as a CLI and pipe the percent into a status line?",
    a: "Yes. The brew cask installs a CLI next to the app at /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter. Pass --json for a machine-readable snapshot. A common pattern during a study session is to bind a shell alias that prints '5h: NN%' so a tmux pane can show it without opening the popup; the data is exactly the same fields, served once on demand instead of polled.",
  },
  {
    q: "What if the active recall session pushes me over the cap mid-card?",
    a: "Anthropic returns a 429 and the chat refuses the next prompt. ClaudeMeter cannot prevent this; the cap is enforced server side. What the popup gives you is the 5 to 15 minute warning. The bar turns orange at 80 and red at 100. If you treat orange as 'finish the current card and stop', you almost never see the 429. If you ignore the bar, the failure mode is the same as it would be without ClaudeMeter, with one extra signal you chose not to act on.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t/claude-pro-weekly-quota-tracker" },
  { name: "Active recall study sessions and Claude usage", url: PAGE_URL },
];

const recallSession = [
  { type: "command" as const, text: "# 16:14 — first card. Tiny prompt, near-empty transcript." },
  { type: "output" as const, text: "you: quiz me on the Krebs cycle, one step at a time. ask the first question." },
  { type: "output" as const, text: "claude: name the molecule that enters step 1 of the cycle." },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# 16:32 — card 12. 'small' prompt, transcript now 8k tokens." },
  { type: "output" as const, text: "you: next card." },
  { type: "output" as const, text: "claude: which enzyme catalyzes the conversion of isocitrate to alpha-ketoglutarate?" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# 16:51 — card 27. The visible turn is two words. The input is a 14k-token essay." },
  { type: "output" as const, text: "you: next." },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# Glance at the menu bar:" },
  { type: "output" as const, text: "ClaudeMeter  5h: 71%   7d: 18%" },
  { type: "success" as const, text: "Three cards from the orange band, with thirty more on the deck." },
];

const popupCloseUp = [
  { type: "output" as const, text: "you@claude-pro.example" },
  { type: "output" as const, text: "  5-hour · 38m   |==========       |  71%" },
  { type: "output" as const, text: "  7-day  · 5d    |===              |  18%" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "  updated 7s ago" },
];

const fmtResetsCode = `// extension/popup.js lines 17-27
function fmtResets(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = Date.now();
  const diff = d - now;
  if (diff <= 0)  return "now";
  const h = diff / 3_600_000;
  if (h < 1)      return \`\${Math.round(diff / 60_000)}m\`;
  if (h < 48)     return \`\${Math.round(h)}h\`;
  return                 \`\${Math.round(h / 24)}d\`;
}

// On a study session the 5-hour row almost always lives in
// the "Nm" or "Nh" band. That is the band that lets you
// schedule a break around the reset, not around the failure.`;

const pollCadenceCode = `// extension/background.js lines 1-3 and 75-91
const BASE = "https://claude.ai";
const BRIDGE = "http://127.0.0.1:63762/snapshots";
const POLL_MINUTES = 1;

async function refresh() {
  try {
    const snaps = await fetchSnapshots();
    await chrome.storage.local.set({ snapshots: snaps, error: null });
    postToBridge(snaps);
    const five = worstPct(snaps, "five_hour");
    chrome.action.setBadgeText({ text: \`\${Math.round(five ?? 0)}\` });
    chrome.action.setBadgeBackgroundColor({
      color: (five ?? 0) >= 100 ? "#b00020"
           : (five ?? 0) >= 80  ? "#b26a00"
           :                      "#2c6e2f",
    });
  } catch (e) { /* ... */ }
}

// One minute is the cadence claude.ai's own Settings page
// recomputes against. A faster poll gains nothing; a slower
// poll misses the moment a long Opus turn lands on the bucket.`;

const fetchSnapshotsCode = `// extension/background.js lines 14-44
async function fetchSnapshots() {
  const account = await fetchJSON(\`\${BASE}/api/account\`);
  const memberships = account.memberships || [];
  const results = [];
  for (const m of memberships) {
    const org = m.organization?.uuid || m.uuid;
    if (!org) continue;
    let usage = null;
    try { usage = await fetchJSON(\`\${BASE}/api/organizations/\${org}/usage\`); }
    catch (e) { /* ... */ }
    if (!usage) continue;
    results.push({ org_uuid: org, usage, fetched_at: new Date().toISOString() });
  }
  return results;
}

// Same endpoint claude.ai/settings/usage hits when you load
// that page. credentials: "include" sends the existing browser
// cookie, so no manual paste, no second login.`;

const recallVsLog = [
  {
    feature: "What the tool counts",
    ours: "five_hour.utilization fraction the server returns for your account",
    competitor: "Tokens summed from ~/.claude/projects/{project}/{session}.jsonl on disk",
  },
  {
    feature: "Sees claude.ai chat usage (where flashcard quizzing happens)",
    ours: "Yes (chat traffic is part of five_hour on the server)",
    competitor: "No (no jsonl is written for browser chats)",
  },
  {
    feature: "Counts the input transcript carried by every recall turn",
    ours: "Yes (server already weighed it)",
    competitor: "Browser chat is not in the file at all",
  },
  {
    feature: "Refresh cadence during a session",
    ours: "60 seconds (POLL_MINUTES = 1)",
    competitor: "On demand (re-runs the JSONL scan when you ask)",
  },
  {
    feature: "Countdown to the reset",
    ours: "Banded label off resets_at: Nm, Nh, Nd",
    competitor: "Not part of the local-log signal",
  },
  {
    feature: "Surface",
    ours: "macOS menu bar, browser toolbar popup, CLI",
    competitor: "Terminal only",
  },
  {
    feature: "Cost",
    ours: "Free, MIT licensed",
    competitor: "Free, MIT licensed (different scope, complementary)",
  },
];

const studyInvariants = [
  {
    text: "Every active recall turn re-sends the prior transcript. The visible message is short; the request body is not. The 5-hour cap weighs input tokens, so card 27 of a quiz is a heavier prompt than card 1 even when the words you typed are the same.",
  },
  {
    text: "claude.ai chat usage shows up in five_hour.utilization on the server but does not get written to ~/.claude/projects/. Local-log tools cannot see it. The only ground-truth read is the cookie-authenticated GET on /api/organizations/{org}/usage.",
  },
  {
    text: "The popup row reads '5-hour · {countdown} · {percent}%'. The countdown comes from fmtResets banding the resets_at timestamp into Nm, Nh, or Nd. On a study session it almost always lives in Nm or low-Nh territory.",
  },
  {
    text: "The window is rolling. resets_at moves as your oldest weighted prompts age out 5 hours after they were sent. A break of 'until the countdown clears' restores the budget; a break of 'an hour' gets you most of the way there.",
  },
  {
    text: "ClaudeMeter polls every 60 seconds. That is the cadence claude.ai's own Settings page recomputes against. Tighter polling gains nothing because the server-side bucket only updates that often anyway.",
  },
  {
    text: "Color thresholds: under 80 percent green, 80 to 99 orange, 100 and up red. Treating orange as 'finish this card and stop' takes the 429 surprise out of a recall session almost entirely.",
  },
];

const installSteps = [
  {
    title: "Step 1: brew install the menu bar app",
    description:
      "brew install --cask m13v/tap/claude-meter. The cask installs ClaudeMeter.app under /Applications and registers a launch agent so the menu bar icon comes back after reboot.",
  },
  {
    title: "Step 2: load the unpacked extension in your study browser",
    description:
      "Clone github.com/m13v/claude-meter, open chrome://extensions (or arc://extensions, brave://extensions, edge://extensions), enable Developer mode, click 'Load unpacked', select the extension/ folder. The browser pins the icon next to the URL bar.",
  },
  {
    title: "Step 3: open claude.ai once",
    description:
      "If you are not already logged in, sign in. The extension reads your existing session cookie via fetch with credentials: 'include' against /api/organizations/{org}/usage; you do not paste anything. Within one minute the badge lights up with a percent.",
  },
  {
    title: "Step 4: start your recall session and watch the row",
    description:
      "Begin quizzing. The popup updates every 60 seconds with the current 5-hour percent and a countdown. When the row turns orange (80 percent) you have one or two more cards before the cap. Plan the break, switch models, or close the chat and start a fresh thread.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-5-hour-window-tracker",
    title: "5-hour window tracker: the countdown math most guides skip",
    excerpt:
      "The resets_at humanization function (now / Nm / Nh / Nd) and why a fixed 60-second poll keeps the countdown honest.",
    tag: "Tracker",
  },
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "Local counter vs server quota: why ccusage and claude.ai disagree",
    excerpt:
      "Why ccusage at 8 percent and claude.ai at 71 percent are both correct. Two ledgers, two sources, neither replaces the other.",
    tag: "Compare",
  },
  {
    href: "/t/claude-rolling-5-hour-burn-rate",
    title: "Burn rate on the 5-hour window: what one heavy prompt costs",
    excerpt:
      "How a single Opus turn lands on the bucket, why the curve is not linear, and how to read the percent jump in real time.",
    tag: "Mental model",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Active recall study sessions and the Claude 5-hour window: where the usage goes",
  description:
    "An active recall session re-sends the growing transcript on every turn, so the rolling 5-hour cap fires sooner than the card count suggests. The mechanic, the JSON the server returns, and how to plan a break around resets_at.",
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

export default function ActiveRecallClaudeUsageTrackerPage() {
  return (
    <article className="text-zinc-900 min-h-screen">
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
          Active recall sessions burn the{" "}
          <GradientText>5-hour rolling window</GradientText> faster than your
          card count suggests
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Quizzing yourself with Claude Pro looks like a sequence of one-line
          turns. Under the hood, every &ldquo;next card&rdquo; re-sends the
          entire growing transcript: the system prompt, the running quiz frame,
          the cards you have already answered, your last replies. By card 27 a
          two-word prompt is a 14k-token request. The 5-hour cap weighs input
          tokens, which is why a 30-card recall session can light up the
          orange band the way a long technical conversation does. This page is
          the mechanic, the JSON, and how to plan the break around{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          instead of around the rate-limit error.
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

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-05)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            To track Claude usage during active recall study sessions, install{" "}
            <a
              href="https://github.com/m13v/claude-meter"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              ClaudeMeter
            </a>{" "}
            (free, MIT, browser extension plus macOS menu bar app). It polls{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              GET /api/organizations/&#123;org&#125;/usage
            </code>{" "}
            on claude.ai every 60 seconds with your existing logged-in cookie,
            reads{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              five_hour.utilization
            </code>{" "}
            and{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              five_hour.resets_at
            </code>
            , and renders a row labelled{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              5-hour &middot; &#123;Nm/Nh&#125; &middot; &#123;percent&#125;%
            </code>{" "}
            in the popup and on the menu bar. Source verified at{" "}
            <a
              href="https://github.com/m13v/claude-meter/blob/main/extension/background.js"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              extension/background.js
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why a recall quiz is heavier than it looks
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Active recall as a study technique works by retrieval, not review.
          You ask Claude to quiz you, you answer, Claude grades, you move on.
          From the human side every turn is a card. From the API side every
          turn is the entire prior conversation plus one new sentence.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          That asymmetry is what surprises students who run their first
          serious study session. Card 1 is cheap. Card 12 is meaningfully
          heavier. Card 27 is a small essay every time you say &ldquo;next&rdquo;,
          because the transcript Claude needs to keep grading consistently is
          18 prior question/answer pairs and your running notes:
        </p>
        <TerminalOutput
          title="The same study session, three timestamps"
          lines={recallSession}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The visible turn at 16:51 is two words. The request body is whatever
          the running thread weighs at that point: every prompt and reply,
          serialized back to the model, weighed against the 5-hour cap. That is
          why this page exists, and why a guide that talks about active recall
          without mentioning the rolling cap leaves out the part that fires.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the menu bar actually shows during the session
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          One row, three columns, updated every 60 seconds. The countdown is
          the time until the rolling window has shed enough usage that the
          fraction goes back under the cap; the percent is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour.utilization
          </code>{" "}
          rounded for display:
        </p>
        <TerminalOutput
          title="ClaudeMeter popup, 71% and counting"
          lines={popupCloseUp}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The 7-day row is also there, but during a single recall session it
          barely moves. The signal that matters for &ldquo;am I about to be
          cut off mid-card&rdquo; is the 5-hour row. At 71 percent with 38
          minutes on the clock, you have somewhere between three and seven
          more heavy turns before the bar trips orange, depending on how the
          transcript has grown. That is enough information to decide
          consciously whether to push or stop.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The countdown is one function, four bands
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The label after the &ldquo;5-hour&rdquo; word comes from a single
          humanization function in popup.js. It bands the difference between
          now and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          into one of four shapes: &ldquo;now&rdquo; if the bucket is already
          clear, &ldquo;Nm&rdquo; under one hour, &ldquo;Nh&rdquo; up to forty
          eight hours, &ldquo;Nd&rdquo; beyond. On a study session the 5-hour
          row lives in &ldquo;Nm&rdquo; or low &ldquo;Nh&rdquo;, which is the
          band that lets you plan a break:
        </p>
        <AnimatedCodeBlock
          code={fmtResetsCode}
          language="javascript"
          filename="extension/popup.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          So &ldquo;38m&rdquo; is a thirty-eight minute coffee break. &ldquo;1h&rdquo;
          is a walk. &ldquo;3h&rdquo; is &ldquo;the rest of this study session
          will be Sonnet, not Opus&rdquo;. The function is ten lines and it is
          the part of the tracker that makes the percent actionable, because
          a percent without a clock is just an apology in advance.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The poll is fixed at 60 seconds, on purpose
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The extension registers a chrome.alarms tick on install and on
          browser startup with a one-minute period. The same alarm fires{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            refresh()
          </code>
          , which calls{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            fetchSnapshots()
          </code>{" "}
          and posts to the menu bar app over localhost. The number is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            POLL_MINUTES = 1
          </code>{" "}
          on line 3:
        </p>
        <AnimatedCodeBlock
          code={pollCadenceCode}
          language="javascript"
          filename="extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          A faster poll would not get you a fresher answer because the
          server-side bucket only recomputes that often. A slower poll would
          miss the moment a long Opus turn lands on the bucket, which is the
          moment the percent jumps from 64 to 78 in one tick during a recall
          session. Sixty seconds is the cadence claude.ai&apos;s own Settings
          page recomputes against, and matching it keeps the numbers in
          lockstep.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The endpoint, and why nothing else can see your study traffic
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The extension calls{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            fetch
          </code>{" "}
          with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            credentials: &quot;include&quot;
          </code>{" "}
          so the existing claude.ai session cookie travels with the request.
          The endpoint is the same internal one{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          renders against:
        </p>
        <AnimatedCodeBlock
          code={fetchSnapshotsCode}
          language="javascript"
          filename="extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The reason this matters specifically for active recall sessions:
          most Claude usage trackers (ccusage, Claude-Code-Usage-Monitor) read{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/&lt;project&gt;/&lt;session&gt;.jsonl
          </code>{" "}
          on disk. Those files are written by the Claude Code CLI. A claude.ai
          chat session, which is where flashcard quizzing happens for most
          students, never writes to that path. Local-log tools therefore show
          zero usage during a recall session even when the server-side bucket
          is at 71 percent. The only honest read on the cap is the cookie
          authenticated GET, which is what the extension is doing once a
          minute on your behalf.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Server-truth tracker vs local-log tool, on a recall session
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Both kinds of tools are useful for different things. They do not
          replace each other. For a study session running through claude.ai
          chat, only one of them sees the traffic.
        </p>
        <ComparisonTable
          productName="ClaudeMeter (server-truth read)"
          competitorName="ccusage (local Claude Code log read)"
          rows={recallVsLog}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Six things to keep in mind during the session
        </h2>
        <AnimatedChecklist
          title="Active recall and the rolling cap"
          items={studyInvariants}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Install in four steps, before your next session
        </h2>
        <StepTimeline steps={installSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The pattern that keeps the bar green for two hours
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              Three habits, in combination, change a 30-card recall session
              from a sprint to the orange band into a steady run that ends
              with the bar around 60 percent.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              First, end the chat after every 8 to 10 cards and start a fresh
              one. The new thread carries no transcript, so card 1 of the new
              chat is genuinely cheap. The recall benefit is the retrieval,
              not the running history; the model does not need to remember
              card 7 to grade card 14.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              Second, use Sonnet for the quiz turns and reserve Opus for the
              moments you actually need a deeper explanation. The 5-hour cap
              weights model picks. Sonnet on a recall card costs measurably
              less of the bucket than Opus on the same card.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              Third, glance at the menu bar between cards. When the row reads{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                5-hour &middot; 38m &middot; 81%
              </code>
              , finish the current card and stop. The bucket is going to
              clear in 38 minutes; that is exactly the length of a real break.
              Coming back at 38 percent is the difference between two
              productive hours and one productive hour followed by a 429.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint is internal and undocumented. Anthropic can rename a
          field in any release. The Rust struct in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>{" "}
          declares each known field as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option&lt;Window&gt;
          </code>
          , so a missing field deserializes cleanly and the menu bar shows an
          error chip instead of a wrong percent. That is a forward-compat
          hedge, not a guarantee. If the shape of the response moves, the
          open-source repo gets a same-day patch and you pull the next brew
          release.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Studying through Claude Pro and want to compare bucket math?"
          description="15 minutes, no slide deck. Happy to swap notes on the rolling-bucket edges, what an Opus turn really costs on a recall session, and the moments the JSON shape shifts."
          text="Book a 15-minute call"
          section="active-recall-footer"
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
        description="Studying through Claude Pro? 15 min, happy to compare notes."
        section="active-recall-sticky"
        site="claude-meter"
      />
    </article>
  );
}
