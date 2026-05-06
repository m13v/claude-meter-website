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
  ComparisonTable,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-code-openrouter-spillover";
const PUBLISHED = "2026-05-06";

export const metadata: Metadata = {
  title:
    "Claude Code Spillover to OpenRouter: Flip Before the 429, Flip Back After Reset",
  description:
    "How to spill Claude Code over to OpenRouter when your Pro/Max plan caps, what env vars to set, and the 12-line shell hook that uses claude-meter --json to flip BEFORE you hit a 429 and flip back the moment the 5-hour clock resets.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code Spillover to OpenRouter: Flip Before the 429, Flip Back After Reset",
    description:
      "Most spillover guides stop at ANTHROPIC_BASE_URL. The hard part is timing the flip. Here is the shell hook that uses server-truth plan quota to do it for you.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code OpenRouter spillover", url: PAGE_URL },
];

const faqs = [
  {
    q: "What is Claude Code spillover to OpenRouter, in one sentence?",
    a: "It is the workaround where you point Claude Code at OpenRouter's API endpoint instead of Anthropic's once your Pro or Max plan hits a rolling 5-hour or weekly cap, so the agent loop keeps running on metered API pricing instead of stalling. You flip four environment variables (ANTHROPIC_BASE_URL, ANTHROPIC_AUTH_TOKEN, ANTHROPIC_API_KEY blanked, plus model overrides), and Claude Code happily talks the Anthropic protocol to OpenRouter as if it were Anthropic.",
  },
  {
    q: "What four environment variables do I need to set?",
    a: "Per OpenRouter's own integration doc: ANTHROPIC_BASE_URL=\"https://openrouter.ai/api\", ANTHROPIC_AUTH_TOKEN=\"$OPENROUTER_API_KEY\", ANTHROPIC_API_KEY=\"\" (explicitly empty so it does not collide with your real plan key), and model overrides like ANTHROPIC_DEFAULT_OPUS_MODEL=\"anthropic/claude-opus-4.7\" / ANTHROPIC_DEFAULT_SONNET_MODEL=\"anthropic/claude-sonnet-4.6\" / ANTHROPIC_DEFAULT_HAIKU_MODEL=\"anthropic/claude-haiku-4.5\". Reverse the same four vars to flip back to plan billing.",
  },
  {
    q: "Why not just stay on OpenRouter the whole time?",
    a: "Because if you are already paying $100 to $200 a month for Claude Max, the plan is meaningfully cheaper than API rates for the same Opus/Sonnet traffic until you saturate it. Spillover only makes financial sense as overflow: run the plan as your default, flip to OpenRouter the moment a plan bucket is about to 429, and flip back when the 5-hour rolling window resets. That cycle is what people actually want when they search for 'spillover'. The Anthropic plan cannot give you 'wait it out' for the rest of the week, but it does give you another full bucket every five hours.",
  },
  {
    q: "Why does timing the flip matter? Why not flip AFTER the 429 fires?",
    a: "Two reasons. One, a 429 mid-agent-loop usually leaves Claude Code holding partial tool outputs and a pending edit; restarting from the same checkpoint costs you a few minutes of context rebuild every time. Two, you do not know which of the eight server-side buckets fired the 429, so you cannot tell if waiting 5 hours unblocks you or if the wall is a 7-day bucket that will not reset until Sunday. Flipping at 95% utilization on five_hour, before the wall, avoids both: no half-finished turn, and you keep the option to fall back to plan if the next bucket up is healthy.",
  },
  {
    q: "Why can ccusage not drive this for me?",
    a: "ccusage reads the local ~/.claude/projects/<project>/<session>.jsonl files Claude Code writes to disk. That is local-truth: tokens that left your machine, priced against a model card. The plan caps live on Anthropic's servers as utilization fractions on /api/organizations/{org_uuid}/usage. They are different numbers, and ccusage cannot see the server one. ClaudeMeter reads the server one (the same JSON claude.ai/settings/usage renders) and exposes it as JSON, which is why a spillover hook can be driven by it. ccusage and ClaudeMeter are complementary; one tells you tokens-spent, the other tells you plan-quota-remaining.",
  },
  {
    q: "What does the actual shell hook look like?",
    a: "Twelve lines. Run claude-meter --json, jq the five_hour.utilization fraction, compare it against a threshold (0.95 is a sane default), and either export ANTHROPIC_BASE_URL=https://openrouter.ai/api or unset it. The full snippet is in the Spillover hook section above. Wire it as a direnv hook, a starship/zsh prehook, or run it on a 60-second cron and write to a file your shell sources. The schema you depend on is documented in src/models.rs lines 18 to 28 of the open-source repo, so the field names will not move on you silently.",
  },
  {
    q: "Does OpenRouter rate-limit me too?",
    a: "Yes, but on a different axis. OpenRouter's free models cap around 20 requests per minute and 200 per day per model. Paid OpenRouter credits raise that significantly and add automatic provider failover (if one Anthropic provider in their pool is throttled, OpenRouter routes your next request to a different one). For agent-loop spillover, you generally want paid OpenRouter credits, not free-tier; a single Claude Code session blasts past 200 requests/day on the first refactor.",
  },
  {
    q: "Will OpenRouter pricing exactly match anthropic.com pricing?",
    a: "On the Anthropic-routed providers in OpenRouter's pool, base model cost is the same per-token as Anthropic's API. OpenRouter takes its margin on top, which they publish per provider on each model page. So spilled-over traffic is a few percent more expensive than calling Anthropic's API directly with your own API key, and meaningfully more expensive per token than driving the same model through your plan. The point of the cycle is to use the plan as long as possible and only spill the overflow.",
  },
  {
    q: "What about flipping back? How do I know my plan unlocked?",
    a: "Same JSON, different field. claude-meter --json returns five_hour.resets_at as an ISO-8601 timestamp. Either compare it to now() in the shell hook ('if resets_at <= now and utilization < 0.5, flip back'), or just rerun the threshold check; the moment the 5-hour clock rolls, utilization on five_hour drops back near zero and the hook unsets ANTHROPIC_BASE_URL on its next tick. ClaudeMeter's menu bar shows the same number as a relative duration ('in 4h 12m'), so eyeballing it works too.",
  },
  {
    q: "What happens to my claude.ai/settings/usage view while I am spilled over?",
    a: "Nothing changes there. Spillover traffic flows through OpenRouter's API key, which is billed against your OpenRouter account, not your Claude plan. The plan-side buckets keep their utilization frozen until the rolling window rolls. So you can spill over for an hour, watch claude.ai/settings/usage stay still, and then spill back the moment your bucket comes off the wall. The two billing surfaces never cross.",
  },
];

const tableRows = [
  {
    feature: "Knowing the wall is coming, not just that it has hit",
    competitor: "Wait for the 429, then flip. Lose the in-flight turn.",
    ours: "Watch five_hour.utilization climb in the menu bar. Flip at 95%, never see a 429.",
  },
  {
    feature: "Knowing which bucket fired",
    competitor: "Settings page says 'rate limited'. You do not know if it was 5-hour or 7-day or per-model.",
    ours: "ClaudeMeter renders one row per bucket with the exact percent and resets_at. You see the wall by name.",
  },
  {
    feature: "Knowing when to flip back",
    competitor: "Stay on OpenRouter until you remember to switch back. Pay API rates for hours you did not need to.",
    ours: "five_hour.resets_at is a real timestamp. Hook fires and unsets ANTHROPIC_BASE_URL the moment it rolls.",
  },
  {
    feature: "Scripting it",
    competitor: "Most guides give you the env vars. You wire the rest manually.",
    ours: "claude-meter --json is structured output. Pipe it into jq and you have a 12-line direnv hook.",
  },
  {
    feature: "Cookie paste step",
    competitor: "Other plan-side tools ask you to paste your sessionKey cookie into a config file.",
    ours: "Browser extension forwards the live claude.ai cookies via Manifest V3 (extension/background.js, POLL_MINUTES = 1). No paste.",
  },
];

const envSetup = `# Spillover env vars (per OpenRouter's Claude Code integration doc)
# https://openrouter.ai/docs/guides/coding-agents/claude-code-integration

export OPENROUTER_API_KEY="sk-or-v1-..."          # your OpenRouter key

# Flip these to spill over:
export ANTHROPIC_BASE_URL="https://openrouter.ai/api"
export ANTHROPIC_AUTH_TOKEN="$OPENROUTER_API_KEY"
export ANTHROPIC_API_KEY=""                       # MUST be empty

# Optional model overrides:
export ANTHROPIC_DEFAULT_OPUS_MODEL="anthropic/claude-opus-4.7"
export ANTHROPIC_DEFAULT_SONNET_MODEL="anthropic/claude-sonnet-4.6"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="anthropic/claude-haiku-4.5"

# Flip back to plan: unset all four (or open a fresh shell).
unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN ANTHROPIC_API_KEY`;

const hookScript = `# ~/.config/spillover.sh
# Source this from your shell prehook or run on a 60s cron.
# Depends on: claude-meter (brew install --cask m13v/tap/claude-meter), jq.

THRESHOLD=0.95   # spill at 95% on five_hour
COOLDOWN=0.50    # spill back when five_hour drops under 50%

read u r <<<"$(claude-meter --json 2>/dev/null \\
  | jq -r '.[0].usage.five_hour | "\\(.utilization) \\(.resets_at)"')"

if [ -z "$u" ] || [ "$u" = "null" ]; then
  return 0   # no signal, don't change anything
fi

if (( $(echo "$u > $THRESHOLD" | bc -l) )); then
  export ANTHROPIC_BASE_URL="https://openrouter.ai/api"
  export ANTHROPIC_AUTH_TOKEN="$OPENROUTER_API_KEY"
  export ANTHROPIC_API_KEY=""
elif (( $(echo "$u < $COOLDOWN" | bc -l) )); then
  unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN ANTHROPIC_API_KEY
fi`;

const usageStruct = `// claude-meter/src/models.rs lines 18-28
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:            Option<Window>,
    pub seven_day_sonnet:     Option<Window>,
    pub seven_day_opus:       Option<Window>,
    pub seven_day_oauth_apps: Option<Window>,
    pub seven_day_omelette:   Option<Window>,
    pub seven_day_cowork:     Option<Window>,
    pub extra_usage:          Option<ExtraUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,                  // 0..1
    pub resets_at:   Option<DateTime<Utc>>,
}

// This is the contract your spillover hook depends on.`;

const climbingTerminal = [
  { type: "command" as const, text: "$ claude-meter   # 14:02, mid-refactor" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour            72.0% used    -> resets Wed May 6 18:00 (in 3h 58m)" },
  { type: "output" as const, text: "7-day all         41.0% used" },
  { type: "output" as const, text: "7-day Opus        58.0% used" },
  { type: "output" as const, text: "7-day OAuth       49.0% used" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "$ claude-meter   # 14:38, ~30 min later" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "5-hour            96.0% used    -> resets Wed May 6 18:00 (in 3h 22m)" },
  { type: "output" as const, text: "7-day all         44.0% used" },
  { type: "output" as const, text: "7-day Opus        62.0% used" },
  { type: "output" as const, text: "7-day OAuth       52.0% used" },
  { type: "success" as const, text: "[hook] five_hour > 0.95, flipping ANTHROPIC_BASE_URL to OpenRouter" },
];

const flippedBackTerminal = [
  { type: "command" as const, text: "$ claude-meter   # 18:00, the 5h window just rolled" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  { type: "output" as const, text: "5-hour             3.0% used    -> resets Wed May 6 23:00 (in 5h 0m)" },
  { type: "output" as const, text: "7-day all         44.0% used" },
  { type: "output" as const, text: "7-day Opus        62.0% used" },
  { type: "output" as const, text: "7-day OAuth       52.0% used" },
  { type: "success" as const, text: "[hook] five_hour < 0.50, unsetting ANTHROPIC_BASE_URL (back on plan)" },
];

const steps = [
  {
    title: "Install ClaudeMeter and load the browser extension",
    description:
      "brew install --cask m13v/tap/claude-meter. Then load the extension from claude-meter/extension/ as an unpacked extension in Chrome, Arc, Brave, or Edge. The extension picks up your live claude.ai cookies via Manifest V3 and posts a snapshot to the menu-bar app every 60 seconds; no cookie paste, no keychain prompt. Verify with claude-meter --json: you should see a usage object with five_hour.utilization populated.",
  },
  {
    title: "Get an OpenRouter API key with paid credits on it",
    description:
      "Sign up at openrouter.ai and add credits. Free-tier limits are around 20 requests per minute and 200 per day per model, which a single Claude Code session burns through in one refactor. Save the key as OPENROUTER_API_KEY in your shell rc, but do NOT export ANTHROPIC_BASE_URL yet. You want spillover to be conditional, not permanent.",
  },
  {
    title: "Drop the 12-line spillover hook into ~/.config/spillover.sh",
    description:
      "It reads claude-meter --json, jq's the five_hour.utilization, and exports or unsets ANTHROPIC_BASE_URL based on a threshold. Source it from your zsh/bash prehook (so each new prompt re-checks) or wire it as a direnv .envrc that re-evaluates every 60 seconds. The full hook is in the Spillover hook section.",
  },
  {
    title: "Pick the threshold and the cooldown",
    description:
      "0.95 / 0.50 is a reasonable default: flip to OpenRouter at 95% utilization on the rolling 5-hour bucket, flip back when it drops under 50% (which usually means the window has just rolled). Tighten the threshold to 0.85 if you want more headroom; loosen the cooldown to 0.30 if you want to be sure you are fully out of the wall before paying API rates again.",
  },
  {
    title: "Verify the flip in both directions",
    description:
      "Trigger spillover manually by setting THRESHOLD=0.10 temporarily, source the hook, and check echo $ANTHROPIC_BASE_URL — it should print https://openrouter.ai/api. Run a small claude command and confirm the request actually went to OpenRouter (their dashboard logs requests in real time). Then restore THRESHOLD=0.95 and source again; ANTHROPIC_BASE_URL should be unset.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-max-plan-still-hitting-limits",
    title: "Claude Max plan still hitting limits? It is eight buckets, not one",
    excerpt:
      "Why Max users still 429 mid-week. Eight independent server-side gates, the 60-second triage to find which one fired, and the right exit per gate.",
    tag: "Triage",
  },
  {
    href: "/t/claude-max-weekly-quota-enforcement",
    title: "Claude Max weekly quota enforcement",
    excerpt:
      "The exact data path from server state to the BLOCKED string. How each gate decides whether the next prompt 429s, and where the resets_at clock comes from.",
    tag: "Internals",
  },
  {
    href: "/vs-ccusage",
    title: "ClaudeMeter vs ccusage",
    excerpt:
      "ccusage reads local Claude Code JSONL files and prices them against a model card. ClaudeMeter reads the server-truth plan quota Anthropic actually enforces.",
    tag: "Compare",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude Code spillover to OpenRouter: flip before the 429, flip back after reset",
  description:
    "How to spill Claude Code over to OpenRouter when your Pro or Max plan caps, the four env vars, and the 12-line shell hook that uses claude-meter --json to flip at 95% utilization and flip back when the 5-hour window rolls.",
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

export default function ClaudeCodeOpenRouterSpilloverPage() {
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
          Claude Code spillover to OpenRouter:{" "}
          <GradientText>flip before the 429, flip back after reset.</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every guide on this tells you the four env vars and stops. The hard
          part is timing. Flip too late and a 429 kills your in-flight tool
          turn. Flip permanently and you pay OpenRouter API rates for hours
          you did not need to. Here is the shell hook that uses your real plan
          quota to flip at the right moment, and flip back the second the
          5-hour clock rolls.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="8 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <GlowCard>
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold">
              Direct answer (verified 2026-05-06)
            </p>
            <p className="mt-3 text-zinc-900 text-lg leading-relaxed">
              To spill Claude Code over to OpenRouter when your Pro or Max plan
              caps, set four env vars per OpenRouter&rsquo;s{" "}
              <a
                className="text-teal-700 underline"
                href="https://openrouter.ai/docs/guides/coding-agents/claude-code-integration"
              >
                Claude Code integration doc
              </a>
              :{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ANTHROPIC_BASE_URL=&quot;https://openrouter.ai/api&quot;
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ANTHROPIC_AUTH_TOKEN=&quot;$OPENROUTER_API_KEY&quot;
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ANTHROPIC_API_KEY=&quot;&quot;
              </code>{" "}
              (must be empty), and model overrides like{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ANTHROPIC_DEFAULT_OPUS_MODEL=&quot;anthropic/claude-opus-4.7&quot;
              </code>
              . Flip back by unsetting them. The interesting part is{" "}
              <strong>when</strong> to flip. ClaudeMeter exposes the same
              server-truth utilization fractions that{" "}
              <a
                className="text-teal-700 underline"
                href="https://claude.ai/settings/usage"
              >
                claude.ai/settings/usage
              </a>{" "}
              renders, as JSON via{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                claude-meter --json
              </code>
              , so a 12-line shell hook can flip{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                ANTHROPIC_BASE_URL
              </code>{" "}
              the moment{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                five_hour.utilization
              </code>{" "}
              crosses 0.95, and unflip it the moment the rolling window rolls.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why people search for &ldquo;spillover&rdquo;
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You are 40 minutes into a Claude Code refactor on Max. The agent has
          touched 14 files, has a half-applied migration, and is mid-tool-call.
          A 429 fires. Settings/usage says &ldquo;rate limit reached&rdquo; and
          gives you a reset time five hours from now. You are not waiting five
          hours. So you Google around and learn that Claude Code respects an{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ANTHROPIC_BASE_URL
          </code>{" "}
          override; you can point it at OpenRouter, paste in your OpenRouter
          API key, and the same agent loop keeps running on metered API
          pricing. That is &ldquo;spillover&rdquo;: plan as the default,
          OpenRouter as the safety net.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The pattern works. The problem is most people only set it up after
          the wall has already cost them an in-flight turn, and most people
          forget to switch back, so they pay API rates for hours their plan
          would have happily covered. Both of those are timing problems, and
          both are solvable if you can see the plan-side quota in advance.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The four env vars (verified against OpenRouter&rsquo;s doc)
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          This is the part every other guide covers. It is correct, it is
          short, and it is straight from{" "}
          <a
            className="text-teal-700 underline"
            href="https://openrouter.ai/docs/guides/coding-agents/claude-code-integration"
          >
            OpenRouter&rsquo;s Claude Code integration doc
          </a>
          . The empty ANTHROPIC_API_KEY matters: if your real plan key is in
          your environment, Claude Code prefers it and ignores the auth token,
          so the spillover quietly fails and you keep eating plan quota.
        </p>
        <AnimatedCodeBlock
          code={envSetup}
          language="bash"
          filename="~/.spillover-env"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What ClaudeMeter adds that nothing else does
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Knowing the four env vars is table stakes. The questions that break
          people in practice are the ones nothing else answers.
        </p>
        <ComparisonTable
          productName="With ClaudeMeter driving timing"
          competitorName="Manual flip, no plan-side visibility"
          rows={tableRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Watching the wall climb (and the hook firing)
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The interesting moment is the one between &ldquo;everything is
          fine&rdquo; and &ldquo;everything is on fire.&rdquo; ClaudeMeter
          exposes that moment as a number. Here is the same machine 36 minutes
          apart on a Wednesday afternoon, with the hook firing at 95%.
        </p>
        <TerminalOutput title="claude-meter" lines={climbingTerminal} />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6 mb-6">
          And here is the same shell once the 5-hour window rolls. Utilization
          drops from 96% to 3% in a single tick. The hook unsets{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ANTHROPIC_BASE_URL
          </code>{" "}
          and you are back on plan billing without thinking about it.
        </p>
        <TerminalOutput title="claude-meter" lines={flippedBackTerminal} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            The spillover hook (12 lines, MIT, copy as is)
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg mb-6">
            This is the anchor. Drop it in{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              ~/.config/spillover.sh
            </code>{" "}
            and source it from your shell prehook, or run it on a 60-second
            cron and source the output file. It depends on{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              claude-meter --json
            </code>{" "}
            (declared in{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              src/main.rs
            </code>{" "}
            lines 8 to 11) and{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              jq
            </code>
            . The schema it relies on is in{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              src/models.rs
            </code>{" "}
            lines 18 to 28 and is part of the public Rust types, so it will
            not move silently.
          </p>
          <AnimatedCodeBlock
            code={hookScript}
            language="bash"
            filename="~/.config/spillover.sh"
          />
          <p className="text-zinc-700 leading-relaxed text-base mt-6">
            The schema you depend on:
          </p>
          <div className="mt-4">
            <AnimatedCodeBlock
              code={usageStruct}
              language="rust"
              filename="claude-meter/src/models.rs"
            />
          </div>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Setup, end to end
        </h2>
        <StepTimeline steps={steps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What this does not solve
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          A 5-hour rolling wall is the easy case. The harder case is when the
          weekly bucket fires. If{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day
          </code>{" "}
          or{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          or{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_oauth_apps
          </code>{" "}
          is the gate, the rolling window will not save you for days. In that
          case spillover stops being &ldquo;a few hours of overflow&rdquo; and
          starts being &ldquo;the rest of the cycle on API rates,&rdquo; which
          is meaningfully more expensive. The hook above only watches{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            five_hour
          </code>{" "}
          on purpose; you want a human eye on a weekly wall, not an autopilot.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The fix when a weekly bucket fires is usually one of three things:
          switch the model bucket that is hot (drop from Opus to Sonnet for
          the rest of the week), turn on Anthropic&rsquo;s metered billing
          inside the plan, or ride spillover until reset. ClaudeMeter shows
          you which weekly bucket is hot so you can pick.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why this is hard to do without server-truth quota
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The two other tools people reach for here are{" "}
          <a
            className="text-teal-700 underline"
            href="https://github.com/ryoppippi/ccusage"
          >
            ccusage
          </a>{" "}
          and{" "}
          <a
            className="text-teal-700 underline"
            href="https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor"
          >
            Claude-Code-Usage-Monitor
          </a>
          . Both are good at what they do; neither sees plan quota. They read
          the local{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects/&lt;project&gt;/&lt;session&gt;.jsonl
          </code>{" "}
          files Claude Code writes to disk and price the tokens against a
          model card. That is local-truth: tokens that left your machine,
          dollars per million.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Plan caps live on Anthropic&rsquo;s servers as utilization fractions
          on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org_uuid&#125;/usage
          </code>
          . That endpoint is undocumented, but it is the same one
          claude.ai/settings/usage calls in your browser tab right now, and
          the response is publicly inspectable through DevTools. ClaudeMeter
          replays that call every 60 seconds with the cookies your browser
          already holds (no cookie paste, no keychain prompt) and surfaces
          the result as JSON. That is what makes a spillover hook driveable.
          Local-truth tools cannot give you the wall-is-coming signal because
          the wall is not in the local logs.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want help wiring this into your shell?"
          description="Book 20 minutes and we will set up the spillover hook against your real claude-meter --json output and verify the flip in both directions."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Frequently asked
        </h2>
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16 mb-20">
        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Read your /usage JSON live with the team."
      />
    </article>
  );
}
