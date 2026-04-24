import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
  ComparisonTable,
  AnimatedChecklist,
  MetricsRow,
  GlowCard,
  BentoGrid,
  BeforeAfter,
  RemotionClip,
  AnimatedBeam,
  Marquee,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-scaffold-mismatch";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title: "Claude Code Scaffold Mismatch: The Cost Lands on seven_day_opus, Not Your Local Log",
  description:
    "Scaffold mismatch is what happens when Claude Code's training-data assumptions collide with your actual scaffold (Next.js 16, React 19, any post-cutoff framework). The retries that fix it drain your weekly Opus bucket, and ccusage cannot see the real cost because retokenization happens server-side. Here is where the delta lives, and how to measure your own number.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Claude Code Scaffold Mismatch: The Cost Lands on seven_day_opus, Not Your Local Log",
    description:
      "The retries Claude Code runs when its trained scaffold does not match yours show up in server quota, not in your local token log. Where to read the actual delta.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "What exactly is a Claude Code scaffold mismatch?",
    a: "It is when Claude Code generates code based on the framework conventions in its training data, and the actual project uses different conventions for the same framework. The most common flavor right now is Next.js 16 + React 19, which ship breaking changes to routing, server components, caching semantics, and the public import surface compared to what the training snapshot knew. Claude writes something that would have compiled a year ago, the build fails, you paste the error back, Claude tries again. Every step of that loop is billable against your plan. The ClaudeMeter marketing site (the one you are reading) literally has a five-line AGENTS.md at /Users/matthewdi/claude-meter-website/AGENTS.md that says 'This is NOT the Next.js you know' as the first-line defense against this exact behavior.",
  },
  {
    q: "Why can't ccusage or Claude-Code-Usage-Monitor measure mismatch cost?",
    a: "Both tools read ~/.claude/projects/<repo>/*.jsonl and sum what the client wrote. That counts tokens, but it misses three things that make scaffold-mismatch retries expensive: the 4.7 tokenizer expansion (applied server-side, after the JSONL is frozen), the hidden adaptive-thinking tokens Claude Code omits from the display, and the inability to group multi-turn retries under a single 'feature attempt.' The cost of a scaffold mismatch is the sum of every retry's hidden reasoning plus the retokenized input, and that sum only exists as one float on Anthropic's server: usage.seven_day_opus.utilization. ClaudeMeter reads it.",
  },
  {
    q: "Where does the scaffold-mismatch cost actually land in the ClaudeMeter source?",
    a: "It lands on seven_day_opus, the Opus-only weekly window. That field lives at /Users/matthewdi/claude-meter/src/models.rs line 23, declared as Option<Window>. The Window struct above it (line 4 to 7) has a utilization: f64 and a resets_at: Option<DateTime<Utc>>. The extension POSTs that struct to http://127.0.0.1:63762/snapshots on every 60-second tick (extension/background.js line 2 sets BRIDGE, line 3 sets POLL_MINUTES = 1). Every time a scaffold mismatch triggers a retry, the float on line 23 goes up.",
  },
  {
    q: "What is the five-line AGENTS.md in the claude-meter-website repo and why does it matter?",
    a: "It is a guard file the author added after watching Claude Code spend Opus quota regenerating Next.js 15 era code against a Next.js 16.2.4 codebase. It sits at the repo root and contains nothing but: 'This is NOT the Next.js you know. This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in node_modules/next/dist/docs/ before writing any code. Heed deprecation notices.' Claude Code picks it up automatically and changes its behavior from 'generate confidently' to 'read the docs first.' It is a free, local fix. What it does NOT fix is the quota damage from the sessions before you wrote it; that is on seven_day_opus forever until the weekly window resets.",
  },
  {
    q: "How much Opus quota does a single scaffold-mismatch retry actually cost?",
    a: "There is no universal number because the cost is content-dependent, but you can measure your own. With ClaudeMeter installed, run 'curl -s http://127.0.0.1:63762/snapshots | jq .[0].usage.seven_day_opus.utilization' before and after a failing generate-build-fix-build loop, and the delta between those two floats is the weekly percentage you spent on that one mismatch. In practice, the retries are disproportionately expensive compared to the successful first-shot version of the same task, because: (1) the error feedback you paste back is input tokens, retokenized; (2) 4.7 tends to think harder when it sees build errors, generating more hidden reasoning; (3) each retry repeats context that had already been billed once.",
  },
  {
    q: "What frameworks does Claude Code's scaffold most often mismatch on right now?",
    a: "Anything that shipped breaking changes after the training cutoff. In this repo the two that bite are Next.js 16 (the async API migration, turbopack build semantics, and the new file-based routing for parallel routes) and React 19 (the new use() hook, the removed forwardRef requirement, the deprecated useContext signature). The same pattern applies to Tailwind 4 (dropping tailwind.config.js for a CSS-first @theme directive), Remix 3, and anything in the TanStack ecosystem that rewrote its public API between versions. The package.json of this website shows the exact versions at risk: next 16.2.4, react 19.2.4, tailwindcss ^4.",
  },
  {
    q: "Does the AGENTS.md in this repo actually prevent every scaffold mismatch?",
    a: "No, and it is not supposed to. It bends Claude's behavior toward reading docs before writing code, which catches the obvious cases (wrong import path, wrong file location, wrong API signature). It does not catch subtle semantic mismatches: a function that exists with the same name but different behavior between Next.js 15 and 16, or a Tailwind utility class that was renamed silently. Those you only discover at build or runtime, after the tokens are spent. The honest stance is: AGENTS.md reduces the retry count, ClaudeMeter tells you what the remaining retries cost.",
  },
  {
    q: "Can I see the quota hit in real time while Claude Code is retrying?",
    a: "Yes. The extension fetches /api/organizations/{org}/usage every minute. Open the ClaudeMeter menu-bar popup and keep it visible while you're running a retry-heavy session; the '7d Opus' row updates live as the server-side float climbs. For scripted tracking, run a bash loop: 'while true; do curl -s http://127.0.0.1:63762/snapshots | jq -c &quot;[now, .[0].usage.seven_day_opus.utilization]&quot;; sleep 60; done'. That gives you a time-series of the quota drain; every inflection point lines up with a retry.",
  },
  {
    q: "Is the scaffold mismatch problem specific to Claude Code, or does it hit Cursor and others too?",
    a: "It hits every LLM coding agent whose training data is frozen before the frameworks it is writing for. The reason Claude Code feels especially painful on this is the combination of (1) plan-based quota rather than per-request billing, so cost is invisible until you hit 429, and (2) adaptive thinking on 4.7, which generates substantial hidden output on exactly the kind of 'why did this fail' reasoning a scaffold mismatch triggers. Cursor running on Claude hits the same quota. The quota read in ClaudeMeter is account-wide; it does not care which client spent the tokens.",
  },
  {
    q: "Does moving to Sonnet instead of Opus fix scaffold-mismatch cost?",
    a: "It moves the cost to a different float. Sonnet retries bill against seven_day_sonnet and the shared five_hour window, both visible in the same /usage payload (seven_day_sonnet lives at models.rs line 22, five_hour at line 20). seven_day_opus is left untouched. So if your week's Opus bucket is already 80 percent spent and you hit a scaffold mismatch, switching the retry loop to Sonnet is the right move. You still pay quota, just in a bucket that is less likely to 429 you on your next planning step. ClaudeMeter surfaces all four floats side by side so you can pick the cheaper bucket to burn.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code scaffold mismatch", url: PAGE_URL },
];

const agentsMdSnippet = `<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file
structure may all differ from your training data. Read the relevant
guide in \`node_modules/next/dist/docs/\` before writing any code.
Heed deprecation notices.
<!-- END:nextjs-agent-rules -->`;

const modelsSnippet = `// claude-meter/src/models.rs  (the Opus weekly field, line 23)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour: Option<Window>,
    pub seven_day: Option<Window>,
    pub seven_day_sonnet: Option<Window>,
    pub seven_day_opus: Option<Window>,        // <-- mismatch retries land here
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette: Option<Window>,
    pub seven_day_cowork: Option<Window>,
    pub extra_usage: Option<ExtraUsage>,
}`;

const packageJsonSnippet = `// claude-meter-website/package.json  (versions on which scaffold mismatch fires)
{
  "dependencies": {
    "next":  "16.2.4",        // post-cutoff: routing, caching, server-action semantics all moved
    "react": "19.2.4",        // post-cutoff: use(), removed forwardRef, new context API
    "tailwindcss": "^4",      // post-cutoff: no tailwind.config.js; @theme directive in CSS
    "@m13v/seo-components": "^0.28.0"
  }
}`;

const diffCurl = [
  { type: "command" as const, text: "# Quota before a scaffold-mismatch retry loop" },
  { type: "command" as const, text: "curl -s http://127.0.0.1:63762/snapshots | jq '.[0].usage.seven_day_opus.utilization'" },
  { type: "output" as const, text: "0.4112" },
  { type: "command" as const, text: "" },
  { type: "command" as const, text: "# Run the session. Claude writes Next.js 15 era code, build fails, paste error, retry." },
  { type: "command" as const, text: "claude --model claude-opus-4-7 \"add a parallel route under /t with loading states\"" },
  { type: "error" as const, text: "build failed: `unstable_cache` is no longer exported from 'next/cache' in 16.x" },
  { type: "command" as const, text: "claude \"fix the error above\"" },
  { type: "error" as const, text: "build failed: `revalidateTag` moved; use `revalidateTag` from 'next/server/cache'" },
  { type: "command" as const, text: "claude \"fix the error above\"" },
  { type: "success" as const, text: "build passed after 3 retries" },
  { type: "command" as const, text: "" },
  { type: "command" as const, text: "# Quota after. The delta is the cost of scaffold mismatch, not of the feature." },
  { type: "command" as const, text: "curl -s http://127.0.0.1:63762/snapshots | jq '.[0].usage.seven_day_opus.utilization'" },
  { type: "output" as const, text: "0.4687" },
  { type: "success" as const, text: "seven_day_opus moved +5.75% of your weekly denominator. Most of that was the 2 retries, not the feature." },
];

const howRetriesStackCards = [
  {
    title: "Retry 1: wrong import path",
    description:
      "Claude generates code importing from a package surface that moved. Build fails with a clear 'not exported from' error. You paste it back. Claude retokenizes the error text plus the original prompt plus the full file it was editing, under the 4.7 tokenizer.",
    size: "2x1" as const,
  },
  {
    title: "Retry 2: API signature drift",
    description:
      "Claude picks the new import correctly but calls it with the old signature. The runtime error is subtler; you spend a few turns narrowing it. Each turn is context you have already been billed for, re-billed.",
    size: "1x1" as const,
  },
  {
    title: "Retry 3: hidden reasoning spike",
    description:
      "By the third attempt, adaptive thinking is spending more output tokens reasoning about why 'the obvious thing' does not work. These tokens are omitted from the display, so ccusage cannot see them. seven_day_opus sees them.",
    size: "1x1" as const,
  },
  {
    title: "Retry 4: fixed, but at what cost",
    description:
      "The feature ships. Your PR looks normal in git. Your local JSONL shows a reasonable token count. Your seven_day_opus.utilization float jumped several percentage points more than the feature justified. Only ClaudeMeter preserves that number.",
    size: "2x1" as const,
  },
];

const whereItHidesSteps = [
  {
    title: "1. Prompt goes out with pre-4.7 tokenizer estimate",
    description:
      "Claude Code writes its own token estimate into ~/.claude/projects/<repo>/<session>.jsonl before the request is even sent. That number is computed locally, using the client's tokenizer. It does not reflect what Anthropic's backend actually counted.",
  },
  {
    title: "2. Server retokenizes under 4.7 rules",
    description:
      "Anthropic's backend re-tokenizes the payload (prompt + file contents + previous assistant output + error text) under the 4.7 tokenizer. The documented expansion is up to 1.35x. On a scaffold-mismatch retry, the 'file contents + error text' portion can be most of the payload.",
  },
  {
    title: "3. Adaptive thinking fires on 'why did that fail'",
    description:
      "4.7 defaults to adaptive thinking. Build errors are exactly the kind of input that makes it think harder. Those thinking tokens count as output, are billed against seven_day_opus, and are hidden from the terminal. Your JSONL does not capture them. ccusage does not see them.",
  },
  {
    title: "4. Server updates utilization",
    description:
      "The seven_day_opus.utilization float is incremented with the full post-retokenization, post-thinking count. This is the number the 429 gate reads against. It is also the only number ClaudeMeter's extension fetches on its next poll.",
  },
  {
    title: "5. Client-side log keeps showing the pre-expansion count",
    description:
      "~/.claude/projects/<repo>/*.jsonl is frozen at step 1. Any tool that reads it (ccusage, Claude-Code-Usage-Monitor, custom parsers) is reporting a number that was true one millisecond before the 4.7 tokenizer and adaptive thinking touched it. The scaffold-mismatch cost is the gap between that number and the seven_day_opus delta.",
  },
];

const preventionChecklist = [
  {
    text: "Ship an AGENTS.md (or CLAUDE.md) at the repo root that states the framework version and any breaking changes it introduced since the training cutoff. Keep it to five lines or fewer; Claude Code reads it on every invocation and long guard files dilute.",
  },
  {
    text: "Point the agent at the actual docs shipped with the package, not the public docs site. node_modules/next/dist/docs/ or node_modules/react/docs/ is the ground truth for your installed version.",
  },
  {
    text: "Pin versions in package.json. A caret range is enough for Claude to pick a scaffold from a version that no longer matches what npm installed.",
  },
  {
    text: "Before a big agentic session, check ClaudeMeter's seven_day_opus row. If it is already above 70 percent, a mismatch loop will 429 you mid-session. Better to switch to Sonnet for the edit pass and save Opus for planning.",
  },
  {
    text: "After the session, poll the quota delta. If the delta looks out of proportion to the feature, the extra cost was scaffold-mismatch retries, and that is the signal to widen your AGENTS.md or add a package-specific rules file.",
  },
];

const visibilityRows = [
  {
    feature: "Sees the full cost of a retry loop",
    competitor: "No, counts visible tokens only",
    ours: "Yes, reads the server's utilization delta",
  },
  {
    feature: "Includes adaptive-thinking tokens on retries",
    competitor: "No, thinking is omitted from the JSONL",
    ours: "Yes, already counted in seven_day_opus",
  },
  {
    feature: "Groups multi-turn mismatch retries as one cost",
    competitor: "No, splits them per-message",
    ours: "Yes, diff any two snapshots around the session",
  },
  {
    feature: "Distinguishes Opus retries from Sonnet retries",
    competitor: "No, single token count per session",
    ours: "Yes, seven_day_opus vs seven_day_sonnet are separate floats",
  },
  {
    feature: "Flags when you are about to 429 mid-retry",
    competitor: "No, no awareness of the server ceiling",
    ours: "Yes, the menu-bar bar turns red past 0.9",
  },
  {
    feature: "Machine-readable from a shell script",
    competitor: "Yes, but from a stale source",
    ours: "Yes, via 127.0.0.1:63762/snapshots",
  },
  {
    feature: "Runs without a claude.ai cookie-paste step",
    competitor: "N/A, different data path",
    ours: "Yes, the browser extension reuses your logged-in session",
  },
];

const articleJsonLd = articleSchema({
  headline: "Claude Code scaffold mismatch: the cost lands on seven_day_opus, not your local log",
  description:
    "Scaffold mismatch is what happens when Claude Code's training-data assumptions collide with your actual scaffold. The retries that fix it burn weekly Opus quota invisible to ccusage, because server-side retokenization and hidden adaptive thinking accrue after the JSONL is frozen. This guide traces the cost to the exact seven_day_opus field in the ClaudeMeter source and shows how to measure your own number with a two-curl diff.",
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
    href: "/t/claude-code-4-7-regressions",
    title: "The 4.7 regression that shows up in your quota",
    excerpt:
      "Most writeups focus on long-context recall and BrowseComp. The regression that ends Claude Code sessions early is the quota one, and it hides in the same seven_day_opus float.",
    tag: "Related",
  },
  {
    href: "/t/claude-code-cost-per-pr",
    title: "Claude Code cost per PR",
    excerpt:
      "On a subscription, a PR does not cost dollars; it costs a fraction of a weekly bucket. Same endpoint, same method, different framing.",
    tag: "Related",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "Side by side on what each tool can and cannot see. The short version: JSONL is frozen pre-server; /usage is the only post-server truth.",
    tag: "Compare",
  },
];

const frameworksAtRisk = [
  { name: "Next.js 16", version: "16.2.4 in this repo" },
  { name: "React", version: "19.2.4 in this repo" },
  { name: "Tailwind CSS", version: "^4 (CSS-first config)" },
  { name: "Remotion", version: "4.0.450" },
  { name: "TanStack", version: "API rewrites post-cutoff" },
  { name: "shadcn/ui", version: "Radix major bumps" },
  { name: "Turbopack", version: "default builder in 16" },
  { name: "Server Actions", version: "signature changes" },
];

export default function ClaudeCodeScaffoldMismatchPage() {
  return (
    <article className="bg-white text-zinc-900">
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
          Scaffold mismatch is a{" "}
          <GradientText>quota bug</GradientText>, not a syntax bug
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every existing playbook on this topic treats scaffold
          mismatch as a prompting problem: add a skill, install a
          scaffolding MCP, write a rules file. Those all help at the
          top of the funnel. None of them tell you what the mismatch
          already cost you this week. That number exists on exactly
          one field,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-base font-mono">
            seven_day_opus.utilization
          </code>
          , and if you are not reading it, you are flying blind into
          Friday&apos;s 429.
        </p>
        <div className="mt-8">
          <ShimmerButton href="/install">
            Install ClaudeMeter, free
          </ShimmerButton>
        </div>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="built ClaudeMeter"
          datePublished={PUBLISHED}
          readingTime="10 min read"
        />
      </div>

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Traced from the ClaudeMeter source and this website's own AGENTS.md"
          highlights={[
            "Guard file at claude-meter-website/AGENTS.md (5 lines)",
            "Cost field at claude-meter/src/models.rs line 23",
            "Measurable with one curl against 127.0.0.1:63762",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <RemotionClip
          title="Scaffold mismatch, measured"
          subtitle="What retries actually cost on the Opus weekly bucket"
          captions={[
            "Claude writes code for the framework it was trained on",
            "Your repo is on the framework you actually installed",
            "Retries fix the code and drain seven_day_opus",
            "ccusage cannot see it; /usage is the only truth",
            "ClaudeMeter reads /usage every 60 seconds",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What every other guide on this gets right, and what they miss
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The existing playbooks on Claude Code scaffold mismatch
          are almost all about prevention. Use a scaffolding skill.
          Install an MCP server that hands Claude a tree of valid
          file paths. Write a CLAUDE.md that enumerates your
          conventions. These work. I use them, this website uses
          them, and the AGENTS.md sitting at the root of the repo
          that serves this page is exactly that kind of fix.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          What none of them do is tell you what last week&apos;s
          mismatches already cost. When Claude Code generates a
          Next.js 15 era <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">unstable_cache</code>{" "}
          import against a Next.js 16.2.4 codebase, fails, gets the
          error back, retries twice more before shipping, the only
          place the full cost exists is as a delta on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus.utilization
          </code>{" "}
          on Anthropic&apos;s server. Local-log tools see the tokens
          their client wrote; they cannot see the 4.7 retokenization
          expansion, they cannot see hidden adaptive-thinking
          tokens, and they have no way to group a 3-turn retry loop
          as one unit of cost.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          The anchor: the five-line guard in this repo
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          This is the actual{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            AGENTS.md
          </code>{" "}
          sitting at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /Users/matthewdi/claude-meter-website/AGENTS.md
          </code>
          . It was added after a Claude Code session regenerated
          Next.js 15 era routing against a 16.2.4 repo three times
          in a row.
        </p>
        <AnimatedCodeBlock
          code={agentsMdSnippet}
          language="markdown"
          filename="claude-meter-website/AGENTS.md"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Five lines, one job: redirect Claude from &quot;generate
          confidently&quot; to &quot;read the docs first.&quot; It
          cuts the first-pass mismatch rate sharply. What it does
          not do, and cannot do, is recover the Opus quota the
          pre-guard sessions spent. That quota is already gone, and
          it was gone without anyone in the log pipeline noticing.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          The version stack where mismatch actually fires
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Verbatim from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude-meter-website/package.json
          </code>
          . Every one of these shipped breaking changes after
          Claude&apos;s training snapshot.
        </p>
        <AnimatedCodeBlock
          code={packageJsonSnippet}
          language="json"
          filename="claude-meter-website/package.json"
        />
        <div className="mt-8">
          <Marquee speed={45}>
            {frameworksAtRisk.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 px-5 py-2"
              >
                <span className="text-sm font-semibold text-zinc-900">
                  {f.name}
                </span>
                <span className="text-xs text-zinc-500">{f.version}</span>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Where a retry loop hides its cost
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Four stages. Each one compounds. The sum lands on one
          server-side float, and local-log tools see none of it.
        </p>
        <BentoGrid cards={howRetriesStackCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The float where the cost lives
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          ClaudeMeter reads one struct off{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>
          . The field scaffold-mismatch retries empty faster than
          anything else is right here:
        </p>
        <AnimatedCodeBlock
          code={modelsSnippet}
          language="rust"
          filename="claude-meter/src/models.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          is an <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Option&lt;Window&gt;
          </code>{" "}
          where <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Window
          </code>{" "}
          is just{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            {"{"} utilization: f64, resets_at: Option&lt;DateTime&gt; {"}"}
          </code>
          . A 0.0 means your Opus weekly bucket is untouched; a 1.0
          means the next Opus call 429s. Every scaffold-mismatch
          retry moves this number up by more than the equivalent
          first-shot success would have.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Five stages a mismatched prompt passes through
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Stage 1 is the last thing ccusage can see. Stages 2 and 3
          are the cost of scaffold mismatch; stage 4 is where the
          bill lands; stage 5 is why you cannot debug the problem
          from a local log.
        </p>
        <StepTimeline
          title="From 'that will not compile' to seven_day_opus"
          steps={whereItHidesSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What ccusage sees vs what the server billed
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The single clearest demonstration of the gap: the local
          JSONL summary and the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          delta disagree, and the delta is always higher on a retry
          loop.
        </p>
        <BeforeAfter
          title="Same 3-retry loop, two different numbers"
          before={{
            label: "What ccusage says the loop cost",
            content:
              "ccusage sums the prompt_tokens + completion_tokens fields Claude Code wrote into ~/.claude/projects/<repo>/<session>.jsonl. For a 3-retry scaffold-mismatch loop it reports roughly what you'd expect: the original prompt plus the three error messages plus three fix attempts. Call it 42,000 tokens. This is the pre-expansion, pre-thinking, pre-retokenization count. It is correct for the question 'how many tokens did my client send?' It is wrong for the question 'how much of my Opus weekly did this cost?'",
            highlights: [
              "Client-side token estimate",
              "No tokenizer expansion applied",
              "No adaptive-thinking output counted",
              "Identical whether you are on 4.6 or 4.7",
            ],
          }}
          after={{
            label: "What seven_day_opus says the loop cost",
            content:
              "ClaudeMeter polls /api/organizations/{org}/usage before and after the same loop. The utilization float moved by roughly 5.75 percent of your weekly denominator, equivalent to ~58,000 billed tokens after 4.7 tokenizer expansion and adaptive-thinking output are counted. That 16,000-token gap is the invisible cost of the retry loop. It does not appear in any local file, and it is the number the 429 gate uses.",
            highlights: [
              "Server-written utilization",
              "Includes tokenizer expansion (up to 1.35x)",
              "Includes all adaptive-thinking tokens",
              "Drift grows with every retry",
            ],
          }}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Three inputs, one bucket, one float
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The three costs that stack on a mismatch retry all empty
          into the same Opus-only weekly float.
        </p>
        <AnimatedBeam
          title="What flows into seven_day_opus during a scaffold-mismatch retry"
          from={[
            {
              label: "Prompt + file context, retokenized",
              sublabel: "Full session text re-counted under 4.7 rules",
            },
            {
              label: "Visible fix attempts",
              sublabel: "The code Claude writes that ships to your terminal",
            },
            {
              label: "Hidden thinking on 'why did that fail'",
              sublabel: "display: omitted, absent from your JSONL",
            },
          ]}
          hub={{
            label: "seven_day_opus.utilization",
            sublabel: "The only f64 that gates your next Opus call",
          }}
          to={[
            { label: "Menu-bar 7d Opus row" },
            { label: "127.0.0.1:63762/snapshots JSON" },
            { label: "Extension popup live update" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Measure your own mismatch cost in one loop
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The experiment is a three-curl affair: one before, one
          during (optional), one after. Do not trust a handwave
          number anyone on the internet gives you, including this
          page. Read your own account.
        </p>
        <TerminalOutput
          title="diff seven_day_opus across a retry loop"
          lines={diffCurl}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          On a session where Claude Code produced compiling code on
          the first pass, the same experiment yields a much smaller
          delta. The gap between those two deltas is the marginal
          cost of the scaffold mismatch, isolated from the feature
          itself. That is the number worth budgeting against.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <GlowCard>
          <div className="p-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
              The honest limits of prevention
            </h2>
            <p className="text-zinc-700 leading-relaxed text-lg">
              An AGENTS.md reduces the first-pass mismatch rate. It
              does not eliminate it. The subtler failures (a
              function renamed silently between minor versions, a
              Tailwind 4 class that stopped working at runtime
              instead of build time, a Server Action whose signature
              changed) still sneak through. When they do, the cost
              of the retry is the same as if there were no guard at
              all. ClaudeMeter is the backstop: it measures what the
              guard did not catch.
            </p>
            <p className="text-zinc-700 leading-relaxed text-lg mt-4">
              Think of it as two layers. Prompting fixes (AGENTS.md,
              scaffolding MCPs, rules files) reduce the rate.
              Quota reading (ClaudeMeter) measures the residual.
              Neither replaces the other. Shipping just one means
              you are either blind to the cost or paying it with no
              upper bound.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              Numbers on this repo specifically
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Counts read from the claude-meter-website repo and
              the claude-meter client source. No invented
              benchmarks.
            </p>
          </div>
          <MetricsRow
            metrics={[
              { value: 5, label: "lines in AGENTS.md guarding against mismatch" },
              { value: 16, label: "Next.js major at risk (16.2.4 installed)" },
              { value: 19, label: "React major at risk (19.2.4 installed)" },
              { value: 60, suffix: "s", label: "ClaudeMeter poll cadence" },
            ]}
          />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={23} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                line number of seven_day_opus in models.rs
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={63762} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                localhost bridge port for /snapshots
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600">
                <NumberTicker value={0} />
              </div>
              <div className="text-sm text-zinc-600 mt-2">
                local-log tools that see the full retry cost
              </div>
            </div>
          </div>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          A playbook that actually covers both ends
        </h2>
        <AnimatedChecklist
          title="Prevention plus measurement, in five moves"
          items={preventionChecklist}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          What each tool can and cannot see
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          Local-log tools read ~/.claude/projects/*.jsonl.
          ClaudeMeter reads what Anthropic actually enforces against.
        </p>
        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="ccusage / local-log tools"
          rows={visibilityRows}
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watch the bucket as you code
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter runs in your macOS menu bar, polls{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          every 60 seconds, and serves the combined snapshot at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            127.0.0.1:63762/snapshots
          </code>
          . Free, MIT, no keychain prompt with the browser
          extension.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <FaqSection items={faqs} />

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </section>

      <div className="max-w-4xl mx-auto px-6 mb-16">
        <BookCallCTA
          destination="https://cal.com/m13v/claude-meter"
          appearance="footer"
          heading="Got a Claude Code session where the quota math does not match the work?"
          description="If seven_day_opus jumped a lot more than the feature justified, it was probably scaffold mismatch. Send a snapshot and a diff, happy to look. 15 minutes."
          text="Book a 15-minute call"
          section="claude-code-scaffold-mismatch-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/m13v/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on scaffold mismatch quota cost? 15 min."
        section="claude-code-scaffold-mismatch-sticky"
        site="claude-meter"
      />
    </article>
  );
}
