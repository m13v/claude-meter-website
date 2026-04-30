import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  AnimatedChecklist,
  MetricsRow,
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

const PAGE_URL = "https://claude-meter.com/t/claude-pro-weekly-quota-tracker";
const PUBLISHED = "2026-04-30";

export const metadata: Metadata = {
  title:
    "Claude Pro Weekly Quota Tracker: What the 7-Day Row Actually Shows",
  description:
    "On a Pro plan the weekly quota tracker is one popup row: '7-day · 5d' next to a percent bar. Pulled from seven_day.utilization and seven_day.resets_at on /api/organizations/{org}/usage, polled once a minute. Here is what is behind every pixel of that row, and why the toolbar badge keeps tracking the 5-hour number instead of the weekly one.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Pro Weekly Quota Tracker: What the 7-Day Row Actually Shows",
    description:
      "The Pro weekly quota tracker is two rows in a popup. Where the percent comes from, why the countdown lands on days, and why the badge stays pinned to the 5-hour bucket.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What is a Claude Pro weekly quota tracker?",
    a: "It is a tool that polls /api/organizations/{org_uuid}/usage on claude.ai with your existing browser cookies, reads the seven_day.utilization fraction and seven_day.resets_at timestamp the server returns, and renders them as a percent bar plus a countdown label so you can see how much of the weekly bucket you have spent without opening claude.ai/settings/usage. ClaudeMeter is the open-source one (MIT, free); it ships as a browser extension plus a macOS menu bar app.",
  },
  {
    q: "Why does claude.ai not just show me the weekly percent itself?",
    a: "It does, on the Settings page, but only for the 5-hour bucket. The seven_day field has a bar drawn from the same JSON, but the small auxiliary label collapses the continuous fraction into 'usage is low' or 'usage will reset at X'. You can read the precise fraction by opening DevTools on the Settings page and reading the JSON response, but a tracker exists so you do not have to do that every five minutes during a heavy session.",
  },
  {
    q: "How often does the tracker repoll the weekly number?",
    a: "Once per 60 seconds. extension/background.js sets POLL_MINUTES = 1 and registers a chrome.alarms tick on install and on browser startup. The seven_day bucket moves slowly compared to five_hour, so a faster cadence gains nothing; a slower cadence misses the moment a long Opus run lands on the bucket. One minute is the cadence claude.ai's own Settings page recomputes against, so matching it keeps the numbers in lockstep.",
  },
  {
    q: "Why does the toolbar badge show the 5-hour percent instead of the weekly one?",
    a: "Because the 5-hour bucket fires first. The badge has room for one number; that number has to be the cap most likely to throw a 429 on your next prompt. background.js calls worstPct(snaps, 'five_hour') for the badge text and only puts the weekly number in the icon's tooltip title (the second line: '7d: NN%'). Hover the icon and you see both. Click the icon and the popup shows them side by side with the countdown attached.",
  },
  {
    q: "Does the popup show 7d Sonnet and 7d Opus rows on Pro?",
    a: "Conditionally. popup.js lines 62 and 63 are ternary expressions: `${u.seven_day_sonnet ? row('7d Sonnet', u.seven_day_sonnet) : ''}`. They render only when the API response actually contains those fields. On a typical Pro account you see two rows (5-hour and 7-day). Plans that include per-model buckets get the extra rows automatically, no setting to flip; the extension just trusts whatever the server hands back.",
  },
  {
    q: "What does the countdown next to the 7-day row look like?",
    a: "Almost always 'Nd', e.g. '7-day · 5d'. The fmtResets function in popup.js (lines 17-27) bands the resets_at timestamp into 'now' (negative diff), 'Nm' (under one hour), 'Nh' (one to forty-eight hours), or 'Nd' (forty-eight hours and up). The seven_day reset is roughly 168 hours away after a fresh window, so it lands in the days band for almost the whole life of the bucket. You only see 'Nh' on the 7-day row in the last day or two before reset.",
  },
  {
    q: "Why does the percent sometimes look weirdly off compared to claude.ai?",
    a: "Two reasons that both come back to normalization. The server returns utilization as a float between 0 and 1 on most buckets, but the seven_day_omelette and seven_day_cowork buckets ship 0 to 100 instead. pctFromWindow in popup.js handles this with one line: `return u <= 1 ? u * 100 : u;`. If you wrote your own scraper and skipped the normalization step, you would see 0.78 percent next to a 'usage is low' label and assume the server was lying. The second reason is that claude.ai rounds the bar visually; the tracker shows the rounded percent (Math.round) but uses the raw float for the bar width, so the bar can look 1 to 2 percent tighter than the displayed number.",
  },
  {
    q: "Does ccusage track the weekly Pro quota?",
    a: "No. ccusage reads ~/.claude/projects/<project>/<session>.jsonl on disk and sums tokens per turn. That is a faithful local-log signal for Claude Code traffic only, and it does not have access to the per-model weights, peak-hour multiplier, or browser-chat usage that Anthropic folds into seven_day.utilization. ccusage at 8 percent next to claude.ai at 71 percent is normal; they are different ledgers. ClaudeMeter complements ccusage rather than replacing it: ccusage tells you what your Claude Code session weighed in tokens, ClaudeMeter tells you what fraction of the cap Anthropic counted that against.",
  },
  {
    q: "Do I have to paste a cookie or grant any other permission?",
    a: "Not on the extension route. The Chrome extension calls fetch with credentials: 'include' against /api/organizations/{org}/usage, so your existing claude.ai session cookie travels automatically. The macOS menu bar app reads Chrome Safe Storage out of keychain to do the same thing without the extension; that route triggers one keychain prompt the first time you launch it. Either way, no manual cookie paste, no second login, no API key.",
  },
  {
    q: "What if I am on Claude Pro across two organizations?",
    a: "background.js iterates account.memberships and calls /usage once per org. The badge runs worstPct across all of them, so the percent you see is the worst-case 5-hour bucket of any org you belong to. The popup splits accounts into separate sections labeled by email, so the 7-day rows are itemized per account. If you sit in one personal Pro org and one team Pro org, the badge tells you which one is hottest and the popup tells you the breakdown.",
  },
  {
    q: "Is the endpoint going to keep working?",
    a: "It is the same endpoint claude.ai/settings/usage already calls when you load that page. Anthropic does not document it as a public API, so the field names can shift in any release. The Rust struct in src/models.rs declares each known field as Option<Window> so a missing field deserializes cleanly; that is a forward-compat hedge, not a guarantee. If a field gets renamed, the open-source repo gets a same-day patch and you pull the next brew release.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Pro weekly quota tracker", url: PAGE_URL },
];

const popupSession = [
  { type: "command" as const, text: "# Click the toolbar icon mid-week, the popup renders this:" },
  { type: "output" as const, text: "matt@example.com" },
  { type: "output" as const, text: "  5-hour · 38m   |======           |  61%" },
  { type: "output" as const, text: "  7-day  · 5d    |==========       |  72%" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "  updated 4s ago" },
  { type: "success" as const, text: "Two rows. The weekly tracker is the second one." },
];

const popupSessionMax = [
  { type: "command" as const, text: "# Same surface on a plan that ships the per-model weekly buckets:" },
  { type: "output" as const, text: "matt@example.com" },
  { type: "output" as const, text: "  5-hour    · 38m   |======         |  61%" },
  { type: "output" as const, text: "  7-day     · 5d    |==========     |  72%" },
  { type: "output" as const, text: "  7d Sonnet · 5d    |======         |  44%" },
  { type: "output" as const, text: "  7d Opus   · 5d    |==========     |  73%" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "  updated 4s ago" },
  { type: "success" as const, text: "Four rows. The conditional ternaries lit up." },
];

const conditionalRowsCode = `// extension/popup.js lines 56-65
const u = s.usage || {};
$accounts.insertAdjacentHTML("beforeend", \`
  <div class="account">
    <div class="email">\${name}</div>
    \${row("5-hour", u.five_hour)}
    \${row("7-day", u.seven_day)}
    \${u.seven_day_sonnet ? row("7d Sonnet", u.seven_day_sonnet) : ""}
    \${u.seven_day_opus   ? row("7d Opus",   u.seven_day_opus)   : ""}
  </div>\`);

// 5-hour and 7-day always render. The other two render only when
// the JSON ships them. No setting to flip, no plan detection, no
// hardcoded list of plan tiers. The extension trusts the server.`;

const normalizationCode = `// extension/popup.js lines 6-15
function pctFromWindow(w) {
  if (!w) return null;
  const u = typeof w.utilization === "number" ? w.utilization : null;
  if (u == null) return null;
  return u <= 1 ? u * 100 : u;
}

function fmtPct(v) {
  return v == null ? "—" : \`\${Math.round(v)}%\`;
}

// One line of normalization. Five buckets ship 0-1, two ship 0-100.
// The condition u <= 1 picks the right scale per call. Without this,
// you get 0.72% on the bar where claude.ai shows 72%.`;

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

// Four bands. The 7-day bucket lives in the "Nd" band almost always
// because the window is 168 hours long. You only see "Nh" on the 7-day
// row in the last day or two before reset.`;

const badgeCode = `// extension/background.js lines 75-91
async function refresh() {
  try {
    const snaps = await fetchSnapshots();
    await chrome.storage.local.set({ snapshots: snaps, error: null, updated_at: Date.now() });
    postToBridge(snaps);
    const five  = worstPct(snaps, "five_hour");
    const seven = worstPct(snaps, "seven_day");
    const badge =
      five == null && seven == null ? "?" :
      \`\${Math.round(five ?? 0)}\`;
    chrome.action.setBadgeText({ text: badge });
    chrome.action.setBadgeBackgroundColor({
      color: (five ?? 0) >= 100 ? "#b00020"
           : (five ?? 0) >= 80  ? "#b26a00"
           :                      "#2c6e2f",
    });
    chrome.action.setTitle({
      title: \`ClaudeMeter\\n5h: \${fmt(five)}\\n7d: \${fmt(seven)}\`,
    });
  } catch (e) { /* … */ }
}

// The badge text is the 5-hour percent. The weekly percent is in the
// title attribute (icon tooltip), one line below "5h:". Hover to see
// both. Open the popup to see the breakdown per account.`;

const rustModelCode = `// claude-meter/src/models.rs lines 18-28
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:           Option<Window>,
    pub seven_day:           Option<Window>,
    pub seven_day_sonnet:    Option<Window>,
    pub seven_day_opus:      Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:  Option<Window>,
    pub seven_day_cowork:    Option<Window>,
    pub extra_usage:         Option<ExtraUsage>,
}

// Every bucket is Option<Window>. A typical Pro response fills in
// five_hour and seven_day; the rest come back null. The typed struct
// rejects unknown drift loudly instead of mapping it into a missing
// key that silently goes unplotted.`;

const trackerVsPage = [
  {
    feature: "Weekly percent",
    ours: "Rounded fraction next to a clamped bar (Math.round on raw float)",
    competitor: "Drawn bar without a numeric label on the 7-day row",
  },
  {
    feature: "Weekly countdown",
    ours: "'7-day · 5d' label, banded by fmtResets",
    competitor: "Mostly absent; small text on reset reads 'usage will reset at X'",
  },
  {
    feature: "Refresh cadence",
    ours: "Every 60 seconds in the background while the browser is awake",
    competitor: "On full page reload",
  },
  {
    feature: "Where you read it",
    ours: "Browser toolbar popup, macOS menu bar, CLI",
    competitor: "claude.ai/settings/usage page",
  },
  {
    feature: "Multi-org coverage",
    ours: "Worst-case across every account.membership in one badge",
    competitor: "One organization per visible page",
  },
  {
    feature: "Source",
    ours: "Both buckets pulled from the same /usage JSON, normalized in popup.js",
    competitor: "Both buckets rendered server-side by the same JSON",
  },
  {
    feature: "Cost",
    ours: "Free, MIT licensed Rust + JavaScript",
    competitor: "Bundled with Pro/Max",
  },
];

const trackerInvariants = [
  {
    text: "Two rows always render: '5-hour' and '7-day'. The 7d Sonnet and 7d Opus rows render only when the JSON ships those fields. Plan tier is inferred from the response, never hardcoded in the extension.",
  },
  {
    text: "The percent normalization runs per call: u <= 1 ? u * 100 : u. Five buckets ship 0-1, two ship 0-100 in the same JSON object. Skipping this step makes 0.72 percent on the bar look like 0.72 percent of the cap.",
  },
  {
    text: "The countdown next to the 7-day label lives in the 'Nd' band for almost all of the 168-hour window. You see 'Nh' only in the last 24 to 48 hours, and 'Nm' essentially never.",
  },
  {
    text: "The toolbar badge text is the 5-hour percent. The weekly percent goes into the icon tooltip (chrome.action.setTitle) on the second line. The badge has one slot; the cap most likely to fire next gets it.",
  },
  {
    text: "The bar width is clamped at Math.min(100, v ?? 0). Overage on the weekly bucket can return a value above 100, and an unclamped bar would push past the 280-pixel popup column and break the row layout.",
  },
  {
    text: "Multi-account coverage runs through worstPct(snaps, 'seven_day') (and 'five_hour'). The badge surfaces the hottest membership; the popup itemizes per email so a team org and a personal org keep their breakdowns visible.",
  },
];

const installSteps = [
  {
    title: "Step 1: brew install the menu bar app",
    description:
      "brew install --cask m13v/tap/claude-meter. The cask installs ClaudeMeter.app under /Applications and registers a launch agent so the menu bar icon comes back after reboot.",
  },
  {
    title: "Step 2: load the unpacked extension",
    description:
      "Clone github.com/m13v/claude-meter, open chrome://extensions (or arc://extensions, brave://extensions, edge://extensions), enable Developer mode, click 'Load unpacked', select the extension/ folder. The browser pins the icon next to the URL bar.",
  },
  {
    title: "Step 3: visit claude.ai once",
    description:
      "If you are not already logged in, visit claude.ai and sign in. The extension reads your existing session cookie via fetch with credentials: 'include'; you do not paste anything. Within one minute the badge lights up with a percent.",
  },
  {
    title: "Step 4: open the popup",
    description:
      "Click the ClaudeMeter icon in the toolbar. The popup shows one block per logged-in account with the 5-hour row, the 7-day row, and any per-model weekly rows the server returned. The 'updated Ns ago' footer confirms the polling loop is alive.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-5-hour-window-tracker",
    title: "5-hour window tracker: the countdown math most guides skip",
    excerpt:
      "Walking the resets_at humanization function (now / Nm / Nh / Nd) and why a fixed 60-second poll is what makes the countdown honest.",
    tag: "Tracker",
  },
  {
    href: "/t/claude-weekly-limit-by-tuesday",
    title: "Why the weekly limit hits by Tuesday: it is a 168-hour clock",
    excerpt:
      "The seven_day window is rolling, not calendar-aligned. resets_at points at the moment the oldest weighted prompt ages out 168 hours later.",
    tag: "Mental model",
  },
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "Local counter vs server quota: why ccusage and claude.ai disagree",
    excerpt:
      "Why ccusage at 8 percent and claude.ai at 71 percent are both correct. Two ledgers, two sources, neither replaces the other.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Pro weekly quota tracker: what the 7-day row actually shows",
  description:
    "On a Pro plan the weekly quota tracker is one popup row, '7-day · {Nd}', pulled from seven_day.utilization and seven_day.resets_at. Walking the conditional rows, the percent normalization, the days-band countdown, and why the badge keeps tracking the 5-hour bucket instead.",
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

export default function ClaudeProWeeklyQuotaTrackerPage() {
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
          A Claude Pro weekly quota tracker is{" "}
          <GradientText>one popup row</GradientText>, plus a few lines of
          normalization
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Open the ClaudeMeter popup on a Pro plan and you see two rows:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            5-hour
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            7-day
          </code>
          . The second row is the weekly quota tracker. Behind it is one HTTP
          GET against{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>
          , a percent normalization that handles two scales the server ships in
          the same JSON, and a countdown band that almost always lands on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Nd
          </code>
          . This page walks every pixel of that row.
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
            Direct answer (verified 2026-04-30)
          </p>
          <p className="text-zinc-800 leading-relaxed text-lg">
            The free, open-source Claude Pro weekly quota tracker is{" "}
            <a
              href="https://github.com/m13v/claude-meter"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              ClaudeMeter
            </a>{" "}
            (MIT licensed, Rust core, browser extension). It polls{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              GET /api/organizations/&#123;org&#125;/usage
            </code>{" "}
            on claude.ai every 60 seconds with your existing logged-in cookies,
            reads{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day.utilization
            </code>{" "}
            and{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              seven_day.resets_at
            </code>
            , and renders a row labeled{" "}
            <code className="bg-white px-1.5 py-0.5 rounded text-sm font-mono">
              7-day &middot; Nd
            </code>{" "}
            with a percent bar. Source verified at{" "}
            <a
              href="https://github.com/m13v/claude-meter/blob/main/extension/popup.js"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              extension/popup.js
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the popup looks like on a Pro account
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Two rows. That is the entire surface for a Pro user. The first row
          is the 5-hour bucket; the second row is the weekly quota.
        </p>
        <TerminalOutput title="ClaudeMeter popup, Pro account" lines={popupSession} />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-4">
          On a plan that ships per-model weekly buckets in the same JSON, the
          popup grows to four rows automatically; the extension does not have
          to know which plan you are on:
        </p>
        <TerminalOutput
          title="ClaudeMeter popup, plan with per-model weekly buckets"
          lines={popupSessionMax}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The popup does not consult a plan flag. It looks at the JSON
          response, asks &ldquo;is this field present?&rdquo;, and renders a
          row only if the answer is yes. Plan tier is observable, never
          configurable.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The conditional rows, in code
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The render block is ten lines. Two unconditional{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            row()
          </code>{" "}
          calls (5-hour, 7-day) and two ternary expressions for the per-model
          weekly buckets that some plans ship:
        </p>
        <AnimatedCodeBlock
          code={conditionalRowsCode}
          language="javascript"
          filename="extension/popup.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          When Anthropic added{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_sonnet
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          to the response, this code did not need a release. The fields show
          up; the rows show up. If the server adds an eighth bucket tomorrow,
          you would need one more ternary line and one more entry in the Rust
          struct, both small. The shape of the change Anthropic ships first is
          new fields, not renamed fields, which is why this works.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the percent has to be normalized per call
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The same JSON ships the utilization field on two different scales.
          Most buckets (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_sonnet
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>
          ) come back as a float between 0 and 1. The two newer ones,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_omelette
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_cowork
          </code>
          , come back as 0 to 100. Mixing those without a normalization step
          gives you a 0.72% bar where the Settings page shows 72%.
        </p>
        <AnimatedCodeBlock
          code={normalizationCode}
          language="javascript"
          filename="extension/popup.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          One condition handles both. If the value is at most 1, it gets
          multiplied by 100; otherwise it is already on the percent scale. The
          rule is per-bucket, per-poll, picked from the value itself rather
          than from a hardcoded list of which buckets ship which scale.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The countdown almost always says &ldquo;Nd&rdquo;
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The label format is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            7-day &middot; &#123;countdown&#125;
          </code>
          , and the countdown comes out of the same humanization function the
          5-hour row uses:
        </p>
        <AnimatedCodeBlock
          code={fmtResetsCode}
          language="javascript"
          filename="extension/popup.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The window is 168 hours long. After your first heavy session,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            resets_at
          </code>{" "}
          is somewhere between 5 and 7 days in the future, so the band falls
          to the days output. You see &ldquo;5d&rdquo;, then &ldquo;4d&rdquo;,
          then &ldquo;3d&rdquo;, and only in the last 48 hours does it switch
          to &ldquo;Nh&rdquo;. The minute band on the 7-day row is essentially
          theoretical; you would have to be staring at the popup at the exact
          second the window resets.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The toolbar badge ignores the weekly number on purpose
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The browser toolbar gives you one badge slot. Whichever cap is most
          likely to fire next gets the slot. That is the 5-hour bucket. The
          weekly percent goes into the icon tooltip on the second line, and
          the popup is the place you look when you actually want both at once.
        </p>
        <AnimatedCodeBlock
          code={badgeCode}
          language="javascript"
          filename="extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Color thresholds: green under 80, orange 80 to 99, red 100 and up.
          Same thresholds for the bar inside the popup row, controlled by{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            cls = v &gt;= 100 ? &quot;hot&quot; : v &gt;= 80 ? &quot;warn&quot;
            : &quot;&quot;
          </code>{" "}
          on line 31 of popup.js. So your 7-day row turns orange when you cross
          80 percent and red when you hit the cap, which is the moment a
          tracker exists for: not the moment of failure, the moment your
          decision shifts from &ldquo;keep going&rdquo; to &ldquo;switch to
          Sonnet&rdquo; or &ldquo;wait for reset&rdquo;.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The typed struct that makes the JSON safe to read
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          On the macOS side the same JSON gets deserialized into a typed Rust
          struct. Every bucket is wrapped in{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option&lt;Window&gt;
          </code>
          , so a missing field is a clean None and not a parser error:
        </p>
        <AnimatedCodeBlock
          code={rustModelCode}
          language="rust"
          filename="src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The struct also rejects unknown drift loudly. If Anthropic renames a
          field tomorrow, deserialization fails on that field and the menu bar
          shows an error chip instead of silently mapping the new name into a
          missing key. That is the loud failure mode you want from a typed
          schema; quiet failures lead to dashboards that read &ldquo;0%
          weekly&rdquo; when the actual response shape moved.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          Tracker vs the Settings page on the weekly bucket
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Both read the same JSON. The difference is what they render and how
          fresh the render stays.
        </p>
        <ComparisonTable
          productName="ClaudeMeter (browser + menu bar)"
          competitorName="claude.ai/settings/usage"
          rows={trackerVsPage}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Six invariants the weekly row holds
        </h2>
        <AnimatedChecklist
          title="What a Pro weekly quota tracker has to get right"
          items={trackerInvariants}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              The numbers behind the row
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Every one is readable out of the source. None are invented
              benchmarks.
            </p>
          </div>
          <MetricsRow
            metrics={[
              {
                value: 2,
                label: "rows on a Pro popup (5-hour, 7-day)",
              },
              {
                value: 60,
                suffix: "s",
                label: "fixed poll cadence (POLL_MINUTES = 1)",
              },
              {
                value: 7,
                label: "Option<Window> fields in src/models.rs",
              },
              {
                value: 0,
                label: "API keys or pasted cookies",
              },
            ]}
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Install in four steps
        </h2>
        <StepTimeline steps={installSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why this matters for someone watching a weekly quota
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              The Pro weekly quota tightened on Anthropic's side over the
              last six months. The 5-hour cap fires first on a daily basis;
              the 7-day cap fires on a 168-hour rhythm that hardly anyone
              feels until late Tuesday. A tracker that surfaces both at the
              same time means the moment the 7-day row crosses 80 you can
              switch to lighter models for the rest of the week, instead of
              hitting a 429 mid-Wednesday-refactor and discovering the
              weekly bucket was the one to watch all along.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              Local-log tools (ccusage, Claude-Code-Usage-Monitor) cannot do
              this. They read{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ~/.claude/projects/&lt;project&gt;/&lt;session&gt;.jsonl
              </code>{" "}
              and sum tokens. Server-side weights, peak-hour multipliers, and
              browser-chat usage are not in those files. The number that
              matters for a 429 is the float in the JSON, and the JSON only
              comes through the cookie-authenticated GET on{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /api/organizations/&#123;org&#125;/usage
              </code>
              . Run them together; ccusage tells you what your local Claude
              Code session weighed in tokens, ClaudeMeter tells you what
              fraction of the cap Anthropic counted that against.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveat
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint is internal and undocumented. Anthropic can rename any
          field in any release. The conditional ternary pattern in popup.js is
          additive-friendly (new fields show up as new rows) but a rename
          breaks it for the duration between the rename and the next brew
          release. If the field shape changes the macOS app shows an error
          chip and the popup hides the offending row; the rest of the surface
          keeps rendering against the fields that still parse. That is the
          tradeoff for reading server truth instead of a published API.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Building your own weekly tracker and want to compare bucket math?"
          description="Send a 15 minute call. Happy to swap notes on the rolling-bucket edges, the per-model weekly fields, and the moments the JSON shape shifts."
          text="Book a 15-minute call"
          section="weekly-quota-tracker-footer"
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
        description="Questions on the weekly quota row? 15 min."
        section="weekly-quota-tracker-sticky"
        site="claude-meter"
      />
    </article>
  );
}
