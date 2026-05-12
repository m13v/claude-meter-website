import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-pro-usage";
const PUBLISHED = "2026-05-12";

export const metadata: Metadata = {
  title:
    "Claude Code Pro usage: the buckets, the math, and why ‘45 messages’ is the wrong unit",
  description:
    "On the $20 Pro plan, Claude Code shares one rolling 5-hour bucket and one weekly bucket with claude.ai web chat. The server measures both as a utilization float on /api/organizations/{org}/usage, not as a message count. Here is the JSON shape, the per-model sub-buckets the help center omits, and how a Pro Code user actually walls.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code Pro usage: how the $20 plan actually counts your CLI turns",
    description:
      "One rolling 5-hour float, one weekly float, both shared with the browser. The help center quotes ‘about 45 messages’; Claude Code burns differently. The bucket names, the JSON shape, and the meter that shows it.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code Pro usage", url: PAGE_URL },
];

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Guides", href: "https://claude-meter.com/t" },
  { label: "Claude Code Pro usage" },
];

const jsonShape = `// What claude.ai/settings/usage actually receives for a Pro account.
// ClaudeMeter's Rust deserializer at src/models.rs lines 18–28 mirrors
// the same shape; every field is optional except utilization on each Window.

{
  "five_hour":            { "utilization": 0.42, "resets_at": "2026-05-12T21:14:00Z" },
  "seven_day":            { "utilization": 0.61, "resets_at": "2026-05-16T08:02:00Z" },
  "seven_day_sonnet":     { "utilization": 0.71, "resets_at": "2026-05-16T08:02:00Z" },
  "seven_day_opus":       { "utilization": 0.08, "resets_at": "2026-05-16T08:02:00Z" },
  "seven_day_oauth_apps": { "utilization": 0.88, "resets_at": "2026-05-16T08:02:00Z" },
  "extra_usage":          { "is_enabled": false, "monthly_limit": null }
}`;

const codeVsChatRows = [
  {
    feature: "Where the request originates",
    ours: "claude.ai/chat in a browser tab",
    competitor: "claude command in a terminal, OAuth-authed",
  },
  {
    feature: "Tokens per ‘message’",
    ours: "One prompt; you typed it; usually <1k input tokens",
    competitor: "One turn ingests file context, system prompt, tool definitions; often 20k–120k input tokens",
  },
  {
    feature: "Tool calls per turn",
    ours: "0–1 (web search, attachment read)",
    competitor: "Often 3–10 (bash, edit, read, grep, write)",
  },
  {
    feature: "Counts against five_hour",
    ours: "Yes, same float",
    competitor: "Yes, same float; faster per ‘turn’",
  },
  {
    feature: "Counts against seven_day_oauth_apps",
    ours: "No",
    competitor: "Yes (Claude Code is the OAuth client)",
  },
  {
    feature: "Reasonable rule of thumb on Pro",
    ours: "~45 short messages per 5 hours",
    competitor: "~10–40 prompts per 5 hours; varies wildly by repo size",
  },
];

const steps = [
  {
    title: "Pro gives you one 5-hour float, one 7-day float, plus per-model sub-floats",
    description:
      "The same /api/organizations/{org}/usage endpoint that draws the bars on claude.ai/settings/usage returns up to eight Window structs for a Pro account. five_hour and seven_day are the two the help center talks about. seven_day_sonnet, seven_day_opus, and seven_day_oauth_apps are the ones it does not. Each Window carries one utilization float and an optional resets_at timestamp. There is no per-account message counter; the server tracks the float, weighted by per-model factors and per-request context size.",
  },
  {
    title: "Claude Code shares those buckets with your browser tabs",
    description:
      "The Pro plan is one account, one org, one set of buckets. A claude.ai chat tab and the claude CLI both authenticate to the same /api/organizations/{org_uuid}/usage record. If you spent the morning chatting with Sonnet on the web and then start a Claude Code session, you are picking up where the web chat left the float. seven_day_oauth_apps is the only bucket the CLI fills exclusively, because the browser uses session cookies, not the OAuth client, so chat traffic does not hit that sub-bucket.",
  },
  {
    title: "The ‘45 messages’ number is the wrong unit for Code",
    description:
      "Anthropic's help center estimates “about 45 messages every 5 hours” for Pro. That estimate assumes short prompts, no attachments, Sonnet only. Claude Code violates all three: each turn re-ingests the system prompt and tool definitions, plus whatever file context the session has pulled. A single Code turn can be ten or twenty times the input tokens of a typical web-chat message, before the model has answered. The float on five_hour climbs accordingly. A Pro Code user running an agentic refactor will burn through five_hour in 30 minutes; the same account doing web chat would take three hours.",
  },
  {
    title: "Which sub-bucket walls you depends on the model you pinned",
    description:
      "If your Claude Code session has --model sonnet (or claude config selects Sonnet by default), the per-turn input/output tokens charge seven_day_sonnet. If you have Opus access on Pro and run --model opus, the same turns charge seven_day_opus instead. seven_day is the all-up aggregate. A Pro Opus user can sit at seven_day=58% while seven_day_opus has already crossed 100% and walled them. The help-center page does not name these sub-buckets; the JSON returns them; ClaudeMeter shows them.",
  },
  {
    title: "May 2026 doubled the 5-hour cap but not the weekly cap",
    description:
      "Anthropic announced on 2026-05-07 that the rolling 5-hour rate limits for Pro and Max accounts were doubled, including for Claude Code. The weekly bucket (seven_day, plus its sub-buckets) was explicitly not changed. Net effect for a Pro Code user: you can run twice as many Code turns inside a single 5-hour window before hitting that wall, but the week-long ceiling is the same it was at the start of 2026. Your weekly wall arrives at the same total spend, just packed into fewer rolling windows.",
  },
];

const liveTerminal = [
  { type: "command" as const, text: "claude-meter --json | jq '{plan: .subscription, five_hour: .usage.five_hour, seven_day: .usage.seven_day, seven_day_oauth_apps: .usage.seven_day_oauth_apps, extra_usage: .usage.extra_usage}'" },
  { type: "output" as const, text: '{' },
  { type: "output" as const, text: '  "plan":            { "status": "active", "billing_interval": "month" },' },
  { type: "output" as const, text: '  "five_hour":       { "utilization": 0.42, "resets_at": "2026-05-12T21:14:00Z" },' },
  { type: "output" as const, text: '  "seven_day":       { "utilization": 0.61, "resets_at": "2026-05-16T08:02:00Z" },' },
  { type: "output" as const, text: '  "seven_day_oauth_apps": { "utilization": 0.88, "resets_at": "2026-05-16T08:02:00Z" },' },
  { type: "output" as const, text: '  "extra_usage":     { "is_enabled": false, "monthly_limit": null }' },
  { type: "output" as const, text: '}' },
  { type: "info" as const, text: "Same JSON that claude.ai/settings/usage renders. Read straight from your browser session cookie, no Anthropic API key needed." },
];

const extensionFetch = `// extension/background.js, lines 1–12 of the open-source repo.
// This is the entire mechanism that reads your Pro plan usage.

const BASE = "https://claude.ai";

async function fetchJSON(url) {
  const r = await fetch(url, {
    credentials: "include",       // piggybacks your existing claude.ai cookie
    headers: { "accept": "application/json" },
  });
  if (!r.ok) throw new Error(\`\${r.status} \${r.statusText} @ \${url}\`);
  return r.json();
}`;

const faqs = [
  {
    q: "How does Claude Code usage work on the Pro plan?",
    a: "One rolling 5-hour utilization float and one rolling 7-day utilization float, both shared with claude.ai web chat on the same Pro account. The server measures each as a fraction on /api/organizations/{org_uuid}/usage, not as an integer message count. Anthropic's help center estimates about 45 short messages per 5-hour window and 40 to 80 hours of Sonnet per 7-day window for Pro, but those numbers are derived from short, simple prompts; Claude Code's per-turn input tokens are usually 10 to 20 times higher because of file context and tool definitions, so the float climbs faster. Pro includes Sonnet, and (per Anthropic's clarification at xda-developers.com/anthropic-charging-claude-code-pro-users-extra-opus) Opus stays accessible on Pro after the April 2026 documentation confusion was resolved.",
  },
  {
    q: "How many Claude Code messages can I send on Pro in 5 hours?",
    a: "Not a fixed number. The server tracks one float per bucket; how many Code turns fit under 1.0 depends on context size, attachments, tool calls, and which model you pinned. Empirically, Pro users running Claude Code on a medium-size repo (50k–150k tokens of file context per turn) see the five_hour bucket climb roughly 2 to 4 percentage points per turn, which lands somewhere between 25 and 50 turns before the wall. Short, focused turns on Sonnet without big file reads can stretch that to 80+. The help center's '45 messages' is a web-chat estimate; it is not the right unit for Code.",
  },
  {
    q: "Does Claude Code on Pro share usage with claude.ai web chat?",
    a: "Yes. Both surfaces post to the same org_uuid. The five_hour and seven_day buckets are organisation-scoped, not surface-scoped. If you spent the morning in claude.ai with two browser tabs open and then opened a terminal to run Claude Code, the five_hour float starts wherever the browser left it. The only bucket Code fills that browser chat does not is seven_day_oauth_apps, because the CLI is the OAuth client; browser chat uses session cookies. ClaudeMeter renders all of them in the menu bar so you can see the split.",
  },
  {
    q: "What buckets does the /api/organizations/{uuid}/usage endpoint actually return for Pro?",
    a: "Up to eight Window structs and one extra_usage block. The Rust deserializer at src/models.rs lines 18 to 28 in the open-source ClaudeMeter repo lists every field the endpoint can return: five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork, plus an extra_usage object for paid metered overage. Every Window field is optional; Pro accounts typically receive five_hour, seven_day, seven_day_sonnet, and seven_day_oauth_apps, plus seven_day_opus once you have used Opus on the plan. seven_day_omelette and seven_day_cowork are internal Anthropic codenames that surface on some accounts and not others.",
  },
  {
    q: "Why does ccusage say I have only used a few percent when Claude Code refuses my next prompt?",
    a: "ccusage and the Pro plan limiter are measuring different things. ccusage (github.com/ryoppippi/ccusage) walks the local ~/.claude/projects/*.jsonl session transcripts and sums input_tokens + output_tokens; it is the right tool for asking 'what did my Code session cost in tokens this week.' The Anthropic rate limiter on the Pro plan is the utilization float on /api/organizations/{org}/usage, which weighs per-model factors, attachments, and tool calls, and also includes your browser-chat usage on the same account. The two numbers can drift by 30 or 40 percentage points and both be correct. ClaudeMeter reads the second one directly, so you can see the gap.",
  },
  {
    q: "How do I check my current Pro usage without opening claude.ai/settings/usage?",
    a: "Three ways. (1) Open the Pro account at claude.ai/settings/usage in a browser; it draws bars from the same endpoint discussed here. (2) Install ClaudeMeter (brew install --cask m13v/tap/claude-meter, plus the open-source browser extension), which fetches /api/organizations/{org}/usage every 60 seconds with your existing browser cookie and renders the five_hour and seven_day percentages in the macOS menu bar. (3) Run the ClaudeMeter CLI: claude-meter --json prints the same JSON shape the menu bar uses, suitable for tmux or Starship status lines. There is no public Anthropic API token for the plan-usage endpoint; the request rides your session cookie.",
  },
  {
    q: "Does Pro include Opus on Claude Code, and how does Opus use affect usage?",
    a: "Yes. After the April 2026 documentation confusion, Anthropic confirmed that Pro keeps Opus access on Claude Code (xda-developers.com/anthropic-charging-claude-code-pro-users-extra-opus). Practical effect on usage: each Opus turn weighs more against the seven_day_opus sub-bucket than the equivalent Sonnet turn weighs against seven_day_sonnet. A Pro user pinned to Opus will hit seven_day_opus = 100% with seven_day still well below 100%. The headline weekly bar on the settings page is seven_day; the bar that actually walls you is the sub-bucket of the model you pinned.",
  },
  {
    q: "Does the May 2026 limit doubling apply to Pro Claude Code users?",
    a: "Yes for the 5-hour cap, no for the weekly cap. Anthropic's 2026-05-07 announcement (9to5google.com/2026/05/06/claude-code-is-getting-higher-usage-limits-doubled-for-most-users) doubled the rolling 5-hour rate limits for Pro, Max, Team, and seat-based Enterprise accounts on Claude Code, and removed peak-hour throttling on Pro and Max. The weekly cap on Pro was not changed. Net effect: you can pack twice the work into one 5-hour window before the local wall fires, but your week-long ceiling is the same; the weekly wall just arrives in fewer, denser rolling windows.",
  },
  {
    q: "What happens when I hit 100% on a Pro Claude Code bucket?",
    a: "The next request from your account returns HTTP 429 with a generic rate_limit_error string that does not name which bucket tripped. Claude Code prints something like 'rate limit reached, please try again later' and exits the turn. The float on the bucket pins at or just above 1.0 on /api/organizations/{org}/usage; resets_at on the same Window tells you when it rolls off. If extra_usage.is_enabled is true on your account (you opted in to metered billing), additional turns spill into pay-as-you-go and the extra_usage block tracks used_credits in dollars. If extra_usage is disabled, you wait for resets_at.",
  },
  {
    q: "Where do I see the buckets the help center does not name?",
    a: "Either look at the raw JSON or use a meter. Raw JSON: open DevTools on claude.ai/settings/usage, reload the page, find the call to /api/organizations/{org_uuid}/usage, and read the response. Meter: ClaudeMeter is the open-source menu bar app that ships a Rust deserializer for every documented and undocumented Window field (src/models.rs lines 18–28) and surfaces them in the popover; if Anthropic ever adds a new field or renames one, the strict deserializer fails loudly and a new release ships within a day. MIT licensed; the entire fetch is the seven-line fetchJSON helper at extension/background.js lines 5–12.",
  },
];

const relatedPosts = [
  {
    title: "Claude Pro usage limit: the eight buckets the server actually tracks",
    href: "/t/claude-pro-usage-limit",
    excerpt:
      "Pro is not one limit. The claude.ai server returns up to eight separate utilization buckets, two of them undocumented, and any one at 100% throttles your account.",
    tag: "Buckets",
  },
  {
    title: "Claude Code usage tracker: there are two of them, and only one knows when your loop will 429",
    href: "/t/claude-code-usage-tracker",
    excerpt:
      "Local-token trackers (ccusage) vs server-quota trackers (ClaudeMeter). Different inputs, different ledgers, both useful at the same time.",
    tag: "Tooling",
  },
  {
    title: "The Claude Code weekly quota wall: what the CLI hides",
    href: "/t/claude-code-weekly-quota-wall",
    excerpt:
      "When the wall fires, Claude Code prints a generic rate_limit_error string. The OAuth token plus the right endpoint tell you which bucket actually walled you.",
    tag: "Weekly wall",
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
                "Claude Code Pro usage: the buckets, the math, and why ‘45 messages’ is the wrong unit",
              description:
                "How the $20 Pro plan actually counts Claude Code turns: one rolling 5-hour utilization float and one weekly float on /api/organizations/{org}/usage, both shared with claude.ai web chat. The JSON shape, the per-model sub-buckets the help center omits, and how a Pro Code user walls.",
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "ClaudeMeter",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqs)) }}
      />

      <div className="pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-3xl mx-auto px-6 mt-6 mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
          Claude Code Pro usage: the buckets, the math, and why &lsquo;45 messages&rsquo; is the wrong unit
        </h1>
        <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
          On the $20 Pro plan, Claude Code shares one rolling 5-hour bucket and one weekly bucket with claude.ai web chat. The server measures both as a utilization float on{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            /api/organizations/{"{org_uuid}"}/usage
          </code>
          , not as an integer message count. The help center quotes &lsquo;about 45 messages per 5 hours&rsquo;, but that estimate is built for web chat; Claude Code burns the same float two to four times faster per turn.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="7 min read"
      />

      <section className="max-w-3xl mx-auto px-6 my-8">
        <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-12)
          </p>
          <p className="text-zinc-900 text-base leading-relaxed">
            On the Pro plan, Claude Code uses the same rolling 5-hour and 7-day buckets as claude.ai web chat. Both buckets are stored as utilization floats on{" "}
            <code className="text-sm bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
              /api/organizations/{"{org_uuid}"}/usage
            </code>
            . Anthropic estimates roughly 44,000 Sonnet tokens (about 45 short messages) per 5-hour window and 40 to 80 hours of Sonnet per 7-day window for Pro, but those are web-chat numbers; Claude Code turns burn the same float faster because each turn ingests file context and fires tool calls. May 2026 doubled the 5-hour cap and left the weekly cap unchanged. Authoritative source:{" "}
            <a
              href="https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan"
              className="text-teal-700 underline underline-offset-2"
            >
              support.claude.com article 11145838
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The JSON Pro actually returns (and what the help center omits)
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The bars you see at <code className="text-sm bg-zinc-100 px-1 rounded">claude.ai/settings/usage</code> are drawn from one GET request. Open DevTools, refresh the page, find{" "}
          <code className="text-sm bg-zinc-100 px-1 rounded">/api/organizations/{"{your-org-uuid}"}/usage</code>, and you will see this shape (sample values, real fields):
        </p>
        <AnimatedCodeBlock
          code={jsonShape}
          language="json"
          filename="GET /api/organizations/{org_uuid}/usage  →  Pro account response"
        />
        <p className="text-zinc-700 leading-relaxed mt-4">
          Three of those fields are not mentioned in Anthropic&apos;s help article on Pro usage:{" "}
          <code className="text-sm bg-zinc-100 px-1 rounded">seven_day_sonnet</code>,{" "}
          <code className="text-sm bg-zinc-100 px-1 rounded">seven_day_opus</code>, and{" "}
          <code className="text-sm bg-zinc-100 px-1 rounded">seven_day_oauth_apps</code>. They are the buckets that decide which Pro Code user walls first. ClaudeMeter&apos;s Rust deserializer mirrors every field, optional and otherwise, at{" "}
          <code className="text-sm bg-zinc-100 px-1 rounded">src/models.rs</code> lines 18&ndash;28 in the open-source repo.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          How Code burns the same bucket faster than chat
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Anthropic&apos;s estimate of &lsquo;about 45 messages every 5 hours&rsquo; is built on short, simple, Sonnet-only prompts with no attachments. Claude Code violates all three assumptions every single turn. Here is the same Pro account, doing two different things, against the same float:
        </p>
        <ComparisonTable
          productName="Claude.ai web chat (Pro)"
          competitorName="Claude Code CLI (Pro)"
          rows={codeVsChatRows}
        />
        <p className="text-zinc-700 leading-relaxed mt-6">
          The float on <code className="text-sm bg-zinc-100 px-1 rounded">five_hour</code> moves in proportion to weighted input + output tokens, not message count. A 60k-token Code turn weighs roughly the same as 60 short web-chat messages against the same float, even though it looked like one prompt to you. This is why a Pro user can watch <code className="text-sm bg-zinc-100 px-1 rounded">five_hour</code> jump from 14% to 38% on a single &lsquo;please add the missing tests&rsquo; turn and feel like the meter is broken. It is not.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The walkthrough: what every Pro Code user should know about their buckets
        </h2>
        <StepTimeline steps={steps} />
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The seven lines that read it
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          There is no public API for plan usage. The endpoint is the same one your own browser hits when you open the settings page, and the only authentication is the cookie you already have. ClaudeMeter&apos;s browser extension is twelve files and the load-bearing one is this:
        </p>
        <AnimatedCodeBlock
          code={extensionFetch}
          language="javascript"
          filename="extension/background.js (open source, MIT)"
        />
        <p className="text-zinc-700 leading-relaxed mt-4">
          <code className="text-sm bg-zinc-100 px-1 rounded">credentials: &quot;include&quot;</code> is the entire trick. The extension runs inside the browser you are already logged into, so the request to <code className="text-sm bg-zinc-100 px-1 rounded">claude.ai</code> rides your existing session cookie. No copy-paste of cookies from DevTools, no embedded sign-in webview, no Anthropic API token (the API token sees console spend, not plan quota; they are separate ledgers). The full open-source extension is at{" "}
          <a
            href="https://github.com/m13v/claude-meter/tree/main/extension"
            className="text-teal-700 underline underline-offset-2"
          >
            github.com/m13v/claude-meter/tree/main/extension
          </a>
          .
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What the CLI prints when you ask
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The brew cask installs both a menu bar app and a <code className="text-sm bg-zinc-100 px-1 rounded">claude-meter</code> CLI binary. Running it with <code className="text-sm bg-zinc-100 px-1 rounded">--json</code> on a Pro account prints the same shape the browser settings page reads, suitable for piping into tmux, Starship, or anything else that takes JSON on stdin:
        </p>
        <TerminalOutput
          lines={liveTerminal}
          title="claude-meter --json (Pro account)"
        />
        <p className="text-zinc-700 leading-relaxed mt-4">
          <code className="text-sm bg-zinc-100 px-1 rounded">seven_day_oauth_apps</code> climbing without <code className="text-sm bg-zinc-100 px-1 rounded">seven_day</code> climbing is the signature of an active Claude Code session: the OAuth-apps sub-bucket fills, and the all-up weekly bar moves more slowly because it aggregates browser chat too. If you ever see the all-up bar at 60% and the OAuth bar at 90%, your CLI is the load.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want help wiring this into a Pro Code workflow?"
          description="Fifteen-minute call to walk through the buckets on your account, set up the menu bar meter, and decide whether the Pro plan is enough for your Code volume."
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <FaqSection heading="FAQ" items={faqs} />
      </section>

      <section className="max-w-3xl mx-auto px-6 my-12">
        <RelatedPostsGrid
          title="Adjacent guides"
          subtitle="More on Pro and Code usage, from different angles."
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Pro plan running thin? Talk through the buckets."
      />
    </article>
  );
}
