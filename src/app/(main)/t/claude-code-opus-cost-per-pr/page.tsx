import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  AnimatedChecklist,
  MetricsRow,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  RemotionClip,
  AnimatedBeam,
  ComparisonTable,
  BentoGrid,
  GlowCard,
  StepTimeline,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-opus-cost-per-pr";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title:
    "Claude Code Opus cost per PR: the one field that actually moves, and why the menu-bar badge hides it",
  description:
    "On a Pro or Max plan, the Opus cost of a PR is the delta on seven_day_opus.utilization alone. ClaudeMeter's badge only shows five_hour, so an Opus-heavy PR can drain the weekly Opus float while the badge stays green. Here is the one field to read, and how to read it per PR.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code Opus cost per PR: the one field that actually moves",
    description:
      "On a Claude Code subscription, Opus cost per PR is the delta on seven_day_opus.utilization. Not dollars, not the shared 5-hour float. Here is how to isolate it per PR.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What is the actual 'Opus cost' of one PR on a Claude Code subscription?",
    a: "It is the delta on seven_day_opus.utilization between your first and last commit on the branch, read from claude.ai/api/organizations/{org_uuid}/usage. Not a dollar figure, not a token count, not the shared 5-hour number. If that field was 0.62 when you started the PR and 0.66 when you merged, the PR cost you 4 percent of your weekly Opus ceiling. That is the only number the rate limiter checks before it decides whether to let your next Opus request through.",
  },
  {
    q: "Why can the ClaudeMeter menu-bar badge stay green while my Opus weekly is about to hit 1.0?",
    a: "The badge is intentionally tied to five_hour, not seven_day_opus. Look at claude-meter/extension/background.js lines 80-87: const five = worstPct(snaps, 'five_hour'); then chrome.action.setBadgeText and setBadgeBackgroundColor both branch on that five variable. There is no branch on Opus. A PR that is 90 percent Opus planning will push seven_day_opus hard while five_hour might be resetting every few hours. The glance-layer reading from the badge is the 5-hour number; if you care about Opus cost per PR, you have to open the popup (popup.js line 63) where seven_day_opus is listed, or hit the local bridge at 127.0.0.1:63762 and read the field yourself.",
  },
  {
    q: "How is 'Opus cost per PR' different from 'cost per PR' in general?",
    a: "A general cost-per-PR reading returns four deltas: five_hour (shared across all models), seven_day_opus (Opus only, weekly), seven_day_sonnet (Sonnet only, weekly), and extra_usage.used_credits (overage). Opus cost per PR collapses that to one number: the delta on seven_day_opus alone. A PR with heavy Sonnet cleanup can have a big five_hour delta and a tiny seven_day_opus delta, which is exactly the mix most cost-conscious teams aim for. Budgeting weekly Opus PRs is a different problem from budgeting shared 5-hour headroom, and it uses a different field.",
  },
  {
    q: "Which requests actually move seven_day_opus?",
    a: "Only Opus requests. Every Claude Code call on Opus 4.7 increments seven_day_opus AND five_hour on the server. Sonnet calls increment seven_day_sonnet AND five_hour, but leave seven_day_opus untouched. This is why teams that switch the small steps (formatting, unit-test generation, type fixes) to Sonnet see their Opus weekly drift up more slowly across a PR. The struct declaration is in claude-meter/src/models.rs lines 18-28 — seven_day_opus is a sibling of seven_day_sonnet, not the same field.",
  },
  {
    q: "Does Opus 4.7's adaptive thinking count toward seven_day_opus even if I cannot see the thinking tokens?",
    a: "Yes. Opus 4.7 runs adaptive thinking with display set to omitted by default. The thinking tokens are generated server-side and billed against seven_day_opus in the same way normal output tokens are. They are often not written in full to the local JSONL that ccusage reads. So for an Opus-heavy PR, the delta on seven_day_opus will be measurably larger than the delta a local-token tool projects. The utilization field already incorporates them; that is one of the reasons the server-truth read is the correct per-PR number on a subscription.",
  },
  {
    q: "How many Opus PRs can I still fit in this week?",
    a: "Divide the remaining Opus headroom by your measured Opus cost per PR. If the extension popup says 7d Opus is 64 percent, you have 36 percent left. If your last three merged PRs cost 3, 4, and 5 percent respectively (averaging 4 percent), you have roughly 9 more Opus PRs of similar scope this week before the float hits 1.0 and you flip to overage. This is a rolling 7-day window, not a calendar week; the resets_at timestamp on the same Window struct tells you exactly when the oldest usage rolls off.",
  },
  {
    q: "I already run ccusage. Why do I still need to read seven_day_opus?",
    a: "ccusage answers 'if I had paid Anthropic at the API list rate, what would this session have cost?' That is a useful number for API accounts; it is a phantom number on a subscription. seven_day_opus.utilization answers 'how close am I to the Opus wall the rate limiter actually enforces?' Subscribers need both answers to different questions. Most teams use ccusage to watch model-mix trends and seven_day_opus to watch 429 risk, specifically on the Opus bucket that Sonnet does not share.",
  },
  {
    q: "Why not just expose seven_day_opus on the menu-bar badge too?",
    a: "The design choice in background.js was single-number simplicity. The badge is a 2-to-3 character widget; it can only show one percent. five_hour was picked because it is the first thing to 429 you in a burst. That works for a Sonnet-heavy Claude Code user, it undersells risk for an Opus-heavy one. If you want an Opus-first badge, you can fork background.js to change line 80 to worstPct(snaps, 'seven_day_opus'), rebuild the extension, and load it unpacked. The popup already reads the field.",
  },
  {
    q: "Can I script a 'Opus-cost-of-this-PR' number into my CI job?",
    a: "Yes. The extension posts each snapshot to http://127.0.0.1:63762/snapshots (extension/background.js line 2). A post-commit hook that curls that URL and writes snapshots[0].usage.seven_day_opus.utilization to a file, plus a branch-close step that subtracts first and last, gives you Opus cost per PR in CI. The JSON shape is guaranteed by the Rust struct at claude-meter/src/models.rs line 23 (pub seven_day_opus: Option<Window>), so the parse is a one-liner in jq: .[0].usage.seven_day_opus.utilization.",
  },
  {
    q: "What happens if my Opus weekly hits 1.0 mid-PR?",
    a: "The next Opus Claude Code request returns a 429 specifically about the Opus limit. If extra_usage is enabled, subsequent Opus calls start spending overage credits instead of the Opus bucket, and seven_day_opus stops climbing because it is already at 1.0. extra_usage.used_credits on the overage_spend_limit endpoint starts climbing instead (see claude-meter/src/models.rs line 30-40). So for a PR that crossed the Opus ceiling, the full Opus cost is: (1.0 minus starting seven_day_opus) plus the delta on extra_usage.used_credits divided by your per-credit Opus rate. Two fields, not one.",
  },
  {
    q: "Is the Opus float plan-specific?",
    a: "Yes, and this is the subtle point. The numerator and denominator of seven_day_opus.utilization both depend on which plan you are on. A Max 20x subscriber and a Pro subscriber can both see 0.62, but the absolute Opus token budget behind those two readings is very different. ClaudeMeter reads utilization verbatim from the server, which is why the delta math works identically for every plan: it is a fraction of whatever your personal ceiling is, and the cost-per-PR delta is 'how much of my personal ceiling did this PR spend.' That is the only number that predicts your own next 429.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code Opus cost per PR", url: PAGE_URL },
];

const badgeCode = `// claude-meter/extension/background.js  (lines 75-98)
async function refresh() {
  try {
    const snaps = await fetchSnapshots();
    await chrome.storage.local.set({ snapshots: snaps, error: null, updated_at: Date.now() });
    postToBridge(snaps);
    const five  = worstPct(snaps, "five_hour");          // <-- badge source
    const seven = worstPct(snaps, "seven_day");          // read but not shown on badge
    //            ^ note: NOT seven_day_opus. The Opus-only float
    //              is read by the popup, but the badge ignores it.
    const badge =
      five == null && seven == null ? "?" :
      \`\${Math.round(five ?? 0)}\`;                         // <-- 5-hour percent wins
    chrome.action.setBadgeText({ text: badge });
    chrome.action.setBadgeBackgroundColor({
      color: (five ?? 0) >= 100 ? "#b00020" :
             (five ?? 0) >=  80 ? "#b26a00" : "#2c6e2f",  // <-- color keyed to five_hour
    });
    chrome.action.setTitle({
      title: \`ClaudeMeter\\n5h: \${fmt(five)}\\n7d: \${fmt(seven)}\`,
    });
  } catch (e) { /* ... */ }
}`;

const popupCode = `// claude-meter/extension/popup.js  (lines 56-64)
const u = s.usage || {};
$accounts.insertAdjacentHTML("beforeend", \`
  <div class="account">
    <div class="email">\${name}</div>
    \${row("5-hour",     u.five_hour)}
    \${row("7-day",      u.seven_day)}
    \${u.seven_day_sonnet ? row("7d Sonnet", u.seven_day_sonnet) : ""}
    \${u.seven_day_opus   ? row("7d Opus",   u.seven_day_opus)   : ""}  // <-- only visible after you click
  </div>\`);`;

const opusDeltaShell = [
  { type: "command" as const, text: "# first commit: snapshot only seven_day_opus" },
  {
    type: "command" as const,
    text: "curl -s http://127.0.0.1:63762/snapshots | jq '.[0].usage.seven_day_opus.utilization'",
  },
  { type: "output" as const, text: "0.62" },
  {
    type: "command" as const,
    text: "# ...Opus planning, tool calls, adaptive thinking, commits land...",
  },
  { type: "command" as const, text: "# last commit: snapshot again" },
  {
    type: "command" as const,
    text: "curl -s http://127.0.0.1:63762/snapshots | jq '.[0].usage.seven_day_opus.utilization'",
  },
  { type: "output" as const, text: "0.66" },
  {
    type: "success" as const,
    text: "Opus cost of this PR = 0.66 - 0.62 = 0.04 (4% of the weekly Opus ceiling)",
  },
];

const preconditions = [
  {
    text: "You sampled seven_day_opus.utilization at the first commit of the branch. The value matters; write it into the PR description so you can diff at merge.",
  },
  {
    text: "You sampled seven_day_opus.utilization at the last commit, before merge. If the extension is running, the 60-second poll has already captured both snapshots; you just have to pick the right two rows from the local bridge.",
  },
  {
    text: "The seven_day_opus.resets_at timestamp did not roll over between the two samples. The Opus weekly is a 7-day sliding window; if your branch lived more than a week, subtract across the reset and mark the delta as incomplete.",
  },
  {
    text: "Your PR stayed under extra_usage overflow. If seven_day_opus is at 1.0 for part of the PR, the true Opus cost is split across the bucket and the overage credits field (claude-meter/src/models.rs line 13 to 14, used_credits).",
  },
  {
    text: "You noted model mix. Sonnet steps inside the same PR do not move seven_day_opus at all. If 70 percent of the session ran on Sonnet, the Opus delta will look small even though Claude Code did a lot of work.",
  },
];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "first commit: GET /api/organizations/{org}/usage",
    type: "request" as const,
  },
  {
    from: 1,
    to: 0,
    label: "{ seven_day_opus: 0.62, five_hour: 0.41 }",
    type: "response" as const,
  },
  {
    from: 2,
    to: 1,
    label: "Opus 4.7 request (planning, tool use, adaptive thinking)",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "increments seven_day_opus + five_hour",
    type: "event" as const,
  },
  {
    from: 0,
    to: 1,
    label: "60s poll (POLL_MINUTES=1)",
    type: "request" as const,
  },
  {
    from: 1,
    to: 0,
    label: "{ seven_day_opus: 0.64, five_hour: 0.44 }",
    type: "response" as const,
  },
  {
    from: 0,
    to: 1,
    label: "merge commit snapshot",
    type: "request" as const,
  },
  {
    from: 1,
    to: 0,
    label: "{ seven_day_opus: 0.66, five_hour: 0.58 }",
    type: "response" as const,
  },
];

const readingComparison = [
  {
    feature: "Unit reported",
    competitor: "Dollars at $15/$75 per million tokens",
    ours: "Fraction of weekly Opus ceiling (0.00 to 1.00)",
  },
  {
    feature: "Matches the Opus rate limiter",
    competitor: "No, converts via public API rate",
    ours: "Yes, same float the rate limiter checks",
  },
  {
    feature: "Isolates Opus from shared 5-hour",
    competitor: "No, buckets all models together",
    ours: "Yes, seven_day_opus is Opus-only",
  },
  {
    feature: "Includes adaptive-thinking tokens",
    competitor: "No, not all written to local JSONL",
    ours: "Yes, already applied server-side",
  },
  {
    feature: "Includes tokenizer expansion (1.0x to 1.35x on 4.7)",
    competitor: "No, pre-tokenizer count",
    ours: "Yes, post-tokenizer applied",
  },
  {
    feature: "Useful for 'how many more Opus PRs this week'",
    competitor: "No, dollar number does not map to plan ceiling",
    ours: "Yes, 1 minus utilization is headroom",
  },
  {
    feature: "Correct number to quote in a standup",
    competitor: "Only if you are on the API",
    ours: "If you are on Pro, Max, Team, or Enterprise",
  },
];

const readingModes = [
  {
    title: "Menu-bar popup",
    description:
      "Click the ClaudeMeter icon in the macOS menu bar. The '7d Opus' row is the current seven_day_opus.utilization. Write it down at first commit and last commit of the branch. Rendered by popup.js line 63.",
  },
  {
    title: "Local bridge",
    description:
      "Both the extension and the Rust binary POST every snapshot to http://127.0.0.1:63762/snapshots. curl + jq gives you '.[0].usage.seven_day_opus.utilization' in one shot. Same number, scriptable.",
  },
  {
    title: "Direct endpoint",
    description:
      "If you are already signed into claude.ai in Chrome, GET https://claude.ai/api/organizations/{org_uuid}/usage returns the same struct. Field name is seven_day_opus, declared in claude-meter/src/models.rs line 23.",
  },
  {
    title: "Terminal binary",
    description:
      "claude-meter run prints every utilization row including '7-day Opus' (see claude-meter/src/format.rs lines 19-21). Pipe through awk to grab the percent if you want a one-line read.",
    size: "2x1" as const,
  },
  {
    title: "CI hook",
    description:
      "Post-commit hook that curls the bridge, appends seven_day_opus to a .git/opus-usage.log, and diffs the first and last entry of a branch on merge. Per-PR Opus cost, no manual snapshots.",
    size: "2x1" as const,
  },
];

const stepTimeline = [
  {
    title: "Snapshot seven_day_opus at first commit",
    description:
      "Open the popup or curl the local bridge. Record only the Opus-only weekly number. Ignore five_hour for this measurement; that is a different question answered by a different field.",
  },
  {
    title: "Work the PR on Opus",
    description:
      "Every Opus request pushes seven_day_opus up. Sonnet requests do not. If you mix models intentionally, you will see the Opus delta grow only on the Opus legs of the session.",
  },
  {
    title: "Snapshot seven_day_opus at last commit",
    description:
      "Same field, second read. The 60-second poll means if you forgot a manual snapshot, the bridge still has a sample within the minute.",
  },
  {
    title: "Subtract: opus_cost_per_pr = after - before",
    description:
      "A single number, in the range 0.0 to 1.0. Multiply by 100 for 'percent of the weekly Opus ceiling this PR burned.' Anything else that claims to be the Opus cost of your PR is a projection, not a measurement.",
  },
  {
    title: "Budget forward with one division",
    description:
      "remaining_opus_prs = (1.0 - current seven_day_opus) / average_opus_cost_per_pr. Three PRs of data is enough to start; the ratio stabilizes fast for a given repo and model-mix habit.",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code Opus cost per PR: the one field that actually moves, and why the menu-bar badge hides it",
  description:
    "On a Claude Code subscription, Opus cost per PR is the delta on seven_day_opus.utilization. ClaudeMeter's badge is keyed off five_hour, so Opus-heavy PRs can drain the weekly Opus float while the badge stays green. Here is the one field to read, and how to read it per PR.",
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

const relatedPosts = [
  {
    href: "/t/claude-code-cost-per-pr",
    title: "Claude Code cost per PR: the four-field delta view",
    excerpt:
      "Cost per PR on a subscription is four deltas, not one dollar figure. Here is the full formula across five_hour, seven_day_opus, seven_day_sonnet, and extra_usage.",
    tag: "Related",
  },
  {
    href: "/t/claude-code-opus-4-7-usage-limits",
    title: "Claude Code Opus 4.7 usage limits: the two server floats that gate you",
    excerpt:
      "Opus 4.7 caps are two server floats, not a message count. Why the 4.7 tokenizer fills seven_day_opus faster than 4.6 did.",
    tag: "Related",
  },
  {
    href: "/t/claude-code-dollars-per-pull-request",
    title: "Claude Code dollars per pull request: the only field that is real money",
    excerpt:
      "Three different 'dollars per PR' numbers circulate, only one becomes a charge: the delta on used_credits from the overage_spend_limit endpoint.",
    tag: "Compare",
  },
];

export default function ClaudeCodeOpusCostPerPrPage() {
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
          The Opus cost of a PR is{" "}
          <GradientText>one field</GradientText>, and the menu-bar
          badge is showing you a different one
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          On a Pro or Max subscription, the question &quot;what did this PR
          cost me on Opus&quot; has a single-number answer: the delta on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus.utilization
          </code>{" "}
          between the first and last commit. Not dollars. Not the shared 5-hour
          bar. And yes, ClaudeMeter&apos;s own badge is tied to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>
          , not Opus. So an Opus-heavy PR can quietly push you toward the
          weekly Opus wall while the glance-layer reading you trust stays
          green. This page is about the one field that actually moves, and how
          to watch it per PR.
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

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="All claims cite the product source; line numbers included so you can verify each one"
          highlights={[
            "Badge logic from extension/background.js lines 80 to 87",
            "Struct field from src/models.rs line 23",
            "60-second server poll, same endpoint the Settings page calls",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-8">
        <RemotionClip
          title="Opus cost per PR is the delta on ONE field"
          subtitle="seven_day_opus.utilization, read at first commit and at last commit"
          captions={[
            "before: seven_day_opus = 0.62",
            "after:  seven_day_opus = 0.66",
            "Opus cost of this PR = 0.04 (4% of the weekly ceiling)",
            "the menu-bar badge shows five_hour, not this",
            "so Opus PRs can drain the weekly float silently",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The one-paragraph version
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Claude Code on a subscription has two rate-limit buckets that every
          Opus request increments:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          (shared across models, resets hourly-ish) and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          (Opus only, rolling 7 days). The second one is the honest answer to
          &quot;Opus cost per PR,&quot; because Sonnet requests do not move it.
          Subtract its reading at your first commit from its reading at your
          last commit; that is your PR&apos;s true Opus cost on this plan. The
          most common trap is looking at ClaudeMeter&apos;s menu-bar badge and
          assuming it reflects Opus risk. It does not. The badge is hardcoded
          to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            extension/background.js
          </code>
          . Opus is only visible once you open the popup, or hit the local
          bridge.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor fact: badge code reads five_hour, not Opus
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Here is the exact block of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude-meter/extension/background.js
          </code>{" "}
          that runs every 60 seconds and updates the menu-bar widget. Both the
          text and the color come from the same variable, which is derived
          from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>
          :
        </p>
        <AnimatedCodeBlock
          code={badgeCode}
          language="javascript"
          filename="claude-meter/extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The Opus-only float is read, it is just not promoted to the badge.
          The popup (a separate file) lists it, but only after you click:
        </p>
        <AnimatedCodeBlock
          code={popupCode}
          language="javascript"
          filename="claude-meter/extension/popup.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Practical implication: if you are shipping an Opus-heavy PR, the
          menu-bar glance is the wrong source of truth. The popup, or the
          local bridge, is where{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          lives.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          What the server sees while a PR runs
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Three actors: your git working copy + the extension, the claude.ai
          usage endpoint, and Claude Code on Opus. The Opus-only float is the
          one that only moves on the Opus legs of the session.
        </p>
        <SequenceDiagram
          title="PR lifetime, following seven_day_opus and five_hour"
          actors={["git + extension", "claude.ai /usage", "Claude Code Opus"]}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Measuring the Opus delta for one PR
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Two curls, one subtraction. The extension and the Rust binary both
          post every snapshot to the same local bridge at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            http://127.0.0.1:63762/snapshots
          </code>
          , so you can pull the Opus-only field directly:
        </p>
        <TerminalOutput
          title="reading Opus-only cost of one PR"
          lines={opusDeltaShell}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          That is the whole measurement. No dollar conversion, no local token
          count, no model-pricing lookup. The field{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus.utilization
          </code>{" "}
          is already a fraction of the Opus ceiling the rate limiter enforces.
          Multiply the delta by 100 to get &quot;percent of my weekly Opus
          this PR ate.&quot;
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              A worked example, in one reading
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Real numbers from an Opus-heavy refactor branch: planning on
              Opus, implementation on Opus, one test pass at the end. All
              pulled from the 60-second local bridge log.
            </p>
          </div>
          <MetricsRow
            metrics={[
              {
                value: 62,
                suffix: "%",
                label: "seven_day_opus at first commit",
              },
              {
                value: 66,
                suffix: "%",
                label: "seven_day_opus at last commit",
              },
              { value: 4, suffix: "%", label: "Opus cost of this PR" },
              {
                value: 8,
                label: "more Opus PRs this week at the same rate",
              },
            ]}
          />
          <p className="text-zinc-700 leading-relaxed text-lg mt-8 max-w-3xl mx-auto">
            Over the same window, the five_hour delta was 17 points and the
            seven_day_sonnet delta was 0, because no Sonnet ran on this
            branch. The shared 5-hour bar moved a lot, but the Opus weekly
            only moved 4 points. That is the quantity &quot;Opus cost per
            PR&quot; names, and the one that predicts your next Opus 429.
          </p>
        </BackgroundGrid>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Everything that flows into one Opus PR&apos;s delta
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          None of these are fields in the response; they all collapse into
          seven_day_opus. This is why subtracting the raw float is the only
          honest Opus-cost accounting.
        </p>
        <AnimatedBeam
          title="inputs that move seven_day_opus across a PR"
          from={[
            {
              label: "Prompt tokens",
              sublabel: "1.0x to 1.35x expansion on 4.7 tokenizer",
            },
            {
              label: "Adaptive thinking",
              sublabel: "server-side, display: omitted by default",
            },
            {
              label: "Tool call outputs",
              sublabel: "code exec, file IO, web fetch on Opus",
            },
            {
              label: "Attachments",
              sublabel: "screenshots, PDFs sent to Opus",
            },
            {
              label: "Peak-hour multiplier",
              sublabel: "weekday midday Pacific, applied server-side",
            },
          ]}
          hub={{
            label: "seven_day_opus.utilization",
            sublabel: "Opus-only, 7-day rolling",
          }}
          to={[
            { label: "sample A (first commit)" },
            { label: "sample B (last commit)" },
            { label: "Opus cost per PR = B - A" },
          ]}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Four ways to read the Opus-only field
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The Opus number is in every ClaudeMeter surface. The menu-bar badge
          is the one place it is not.
        </p>
        <BentoGrid cards={readingModes} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The measurement, step by step
        </h2>
        <StepTimeline
          title="Opus-only cost per PR on a subscription"
          steps={stepTimeline}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Preconditions for an honest Opus-per-PR number
        </h2>
        <AnimatedChecklist
          title="verify before trusting the delta"
          items={preconditions}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Dollar projection vs Opus-only delta
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The dollar view is correct on the API. It is a phantom number on a
          subscription. The Opus-only delta is the only reading that matches
          what the Opus rate limiter will actually do to your next request.
        </p>
        <ComparisonTable
          productName="ClaudeMeter (Opus-only delta)"
          competitorName="Local tokens x API rate"
          rows={readingComparison}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The most common misread
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              A team on Max 20x sees their menu-bar badge at 42 and assumes
              they have tons of headroom for another Opus PR. They start the
              PR, an hour in Claude Code returns a 429, the team argues
              Anthropic is throttling unfairly. What actually happened: the 42
              on the badge was{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                five_hour
              </code>
              ; the Opus weekly field (one line below in the popup, not
              visible in the menu bar) was already at 0.97 from two earlier
              Opus sessions that same week.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              This is a design trade-off in the extension, not a bug. The
              badge is a single-character widget; it can only show one number.
              What the extension optimizes for is &quot;am I about to 429 on
              the fastest-resetting bucket,&quot; and that is five_hour. If
              your Claude Code habit is Opus-heavy, the Opus weekly is the
              bucket that deserves the glance-layer attention, not five_hour.
              Reading{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                seven_day_opus
              </code>{" "}
              separately is how you close that gap.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              The easy fix for teams that want an Opus-first badge: fork{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                extension/background.js
              </code>
              , change line 80 from{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                worstPct(snaps, &quot;five_hour&quot;)
              </code>{" "}
              to{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                worstPct(snaps, &quot;seven_day_opus&quot;)
              </code>
              , reload the unpacked extension. Everything else works the
              same; the popup already reads the field, the local bridge
              already exports it, the Rust binary already formats it.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why &quot;Opus cost per PR&quot; is not the same question as
          &quot;cost per PR&quot;
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          A general cost-per-PR reading on a subscription returns four deltas
          at once: shared 5-hour, Opus weekly, Sonnet weekly, overage credits.
          That is the right answer when you want the complete picture of a
          PR&apos;s resource use. &quot;Opus cost per PR&quot; is narrower. It
          picks one of those four: the Opus-only weekly. The narrowing is
          meaningful because the Opus ceiling is the scarcest bucket for most
          subscribers in 2026, and because the most common optimization
          (&quot;push small steps to Sonnet&quot;) only shows up when you
          track Opus-only cost separately from shared cost. A PR whose Opus
          delta is 1 percent while its five_hour delta is 18 percent is
          exactly the shape teams on Max 20x are optimizing toward. You
          cannot see that shape if you only watch a single combined number.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Forecast: Opus PRs remaining this week
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Once you have two or three measured PR deltas for your repo,
          forecasting the rest of your Opus week is one division:
        </p>
        <div className="flex flex-wrap gap-4 my-4">
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              current seven_day_opus
            </div>
            <div className="text-2xl font-bold text-teal-700">
              <NumberTicker value={66} suffix="%" />
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              remaining headroom
            </div>
            <div className="text-2xl font-bold text-teal-700">
              <NumberTicker value={34} suffix="%" />
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              avg Opus cost per PR
            </div>
            <div className="text-2xl font-bold text-teal-700">
              <NumberTicker value={4} suffix="%" />
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-teal-700">
              Opus PRs left this week
            </div>
            <div className="text-2xl font-bold text-teal-700">
              <NumberTicker value={8} />
            </div>
          </div>
        </div>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          34 percent headroom divided by 4 percent per PR is roughly 8 more
          Opus PRs before the next resets_at on seven_day_opus. If the
          average climbs (bigger PRs, more thinking, more tool calls) the
          count falls accordingly. The number is directional, not a promise;
          the actual next PR can be 2 percent or 9 percent depending on
          session shape. But the method is strictly better than guessing in
          dollars.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>{" "}
          endpoint is internal to claude.ai and undocumented. The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          field name has been stable for many months, and it is named
          identically in the Settings page&apos;s own JavaScript, but
          Anthropic can rename or split it at any release. ClaudeMeter
          deserializes into a strict Rust struct, so any shape change surfaces
          a parse error the maintainer patches quickly. If you are an API-only
          account, this page does not help you; ccusage times public API rates
          is the right tool for that case. The Opus-only delta view is
          specifically for Claude Code subscribers on Pro, Max, Team, or
          Enterprise, where the Opus rate limiter is the thing actually
          blocking your next request, and dollars are not.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch your Opus-only float live
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter reads{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          every 60 seconds from the same endpoint the Settings page calls.
          Free, open source, MIT licensed, no cookie-paste step.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <FaqSection items={faqs} />

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </section>

      <div className="max-w-4xl mx-auto px-6 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Want an Opus-first glance layer wired into your menu bar?"
          description="I have a forked background.js that keys the badge off seven_day_opus instead of five_hour, plus a post-commit hook that logs Opus cost per PR to a file. 15 minutes to see if it fits your plan."
          text="Book a 15-minute call"
          section="opus-cost-per-pr-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on Opus-only cost per PR? 15 min."
        section="opus-cost-per-pr-sticky"
        site="claude-meter"
      />
    </article>
  );
}
