import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  StepTimeline,
  TerminalOutput,
  AnimatedChecklist,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/seven-day-omelette";
const PUBLISHED = "2026-05-11";

export const metadata: Metadata = {
  title:
    "What is seven_day_omelette? The Claude Design weekly quota bucket, explained from the API",
  description:
    "seven_day_omelette is the rate-limit field for Claude Design's separate 7-day quota in claude.ai's internal /api/organizations/{uuid}/usage response. Anthropic codenames Claude Design 'Omelette'. Here is the parent struct, every sibling field, and what to do when this bucket walls you.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "What is seven_day_omelette in Claude's usage API?",
    description:
      "The field name maps to Anthropic's internal codename 'Omelette' (Claude Design). Open-source parser at line 25 of claude-meter/src/models.rs names it explicitly.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbItems = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Guides", href: "https://claude-meter.com/t/claude-weekly-quota-server-truth-meter" },
  { label: "seven_day_omelette" },
];

const usageJson = `{
  "five_hour":            { "utilization": 0.18, "resets_at": "2026-05-11T18:42:00Z" },
  "seven_day":            { "utilization": 0.62, "resets_at": "2026-05-13T09:14:00Z" },
  "seven_day_sonnet":     { "utilization": 0.41, "resets_at": "2026-05-13T09:14:00Z" },
  "seven_day_opus":       { "utilization": 0.74, "resets_at": "2026-05-13T09:14:00Z" },
  "seven_day_oauth_apps": { "utilization": 1.00, "resets_at": "2026-05-13T09:14:00Z" },
  "seven_day_omelette":   { "utilization": 0.33, "resets_at": "2026-05-13T09:14:00Z" },
  "seven_day_cowork":     null,
  "extra_usage":          { "is_enabled": false }
}
// GET https://claude.ai/api/organizations/{uuid}/usage
// Cookie:  <your existing claude.ai session>
// Referer: https://claude.ai/settings/usage
// Accept:  */*`;

const rustStruct = `// claude-meter/src/models.rs, lines 18-28
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageResponse {
    pub five_hour:            Option<Window>,
    pub seven_day:             Option<Window>,
    pub seven_day_sonnet:      Option<Window>,
    pub seven_day_opus:        Option<Window>,
    pub seven_day_oauth_apps:  Option<Window>,
    pub seven_day_omelette:    Option<Window>,   // <-- Claude Design weekly bucket
    pub seven_day_cowork:      Option<Window>,
    pub extra_usage:           Option<ExtraUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}`;

const curlSession = [
  { type: "command" as const, text: "# Open DevTools on claude.ai/settings/usage, copy the Cookie header, then:" },
  { type: "command" as const, text: "# Replace ORG_UUID with the org id visible in your settings page URL." },
  { type: "command" as const, text: "ENDPOINT=\"/api/organizations/ORG_UUID/usage\"" },
  { type: "command" as const, text: "curl -s \"https://claude.ai${ENDPOINT}\" \\" },
  { type: "command" as const, text: "  -H \"Cookie: paste-your-session-cookie-here\" \\" },
  { type: "command" as const, text: "  -H \"Referer: https://claude.ai/settings/usage\" | jq '.seven_day_omelette'" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"utilization\": 0.33," },
  { type: "output" as const, text: "  \"resets_at\": \"2026-05-13T09:14:00Z\"" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "If the field is null, your account is not in a plan that exposes the Omelette bucket yet." },
];

const wallSteps = [
  {
    title: "Confirm it is actually the Omelette bucket, not seven_day.",
    description:
      "The web UI on claude.ai/settings/usage will show generic 'rate limit reached' copy. The raw /usage JSON is the only place the bucket name is honest. Run the curl above, or watch the dropdown in ClaudeMeter, which renders every non-null window separately. If seven_day.utilization is 0.62 but seven_day_omelette.utilization is 1.00, that is the wall.",
  },
  {
    title: "Stop hitting Claude Design until resets_at.",
    description:
      "The other windows keep accruing as normal. Plain claude.ai chat, Claude Code, Sonnet, Opus all keep working. Only the Claude Design tool (the canvas-style design surface introduced as the public face of project 'Omelette') is paused for this account until the seven_day_omelette window's resets_at timestamp passes. UTC; convert it locally if you care.",
  },
  {
    title: "Decide if you actually wanted Claude Design's burn here.",
    description:
      "Because the Omelette weekly is a separate bucket, design-tool usage does not eat your generic seven_day quota. The flip side is also true: anyone running heavy Claude Code work cannot blame seven_day_omelette for their wall. If you got walled here without remembering using Claude Design, check whether a collaborator or an agent session opened a design canvas on your account.",
  },
  {
    title: "Pin the field name in your monitoring.",
    description:
      "If you do anything programmatic with the /usage endpoint (a status-bar script, a Starship segment, a Slack bot for your team), key your alerts on the field name directly, not on a 'weekly' summary. seven_day_omelette and seven_day reset on different aging windows whenever Anthropic introduces a per-product cap, and a summary view will hide which one fired.",
  },
];

const verifySteps = [
  { text: "Log into claude.ai in the browser you use day-to-day." },
  { text: "Open https://claude.ai/settings/usage in a new tab and open DevTools (Cmd-Opt-I)." },
  { text: "Network tab, filter by 'usage', then reload the page. One JSON response will appear." },
  { text: "Open the response. If your plan includes Claude Design, seven_day_omelette is an object with utilization and resets_at. If it does not, the value is null." },
  { text: "ClaudeMeter parses the same payload into the Rust struct on lines 18-28 of src/models.rs and renders each non-null window in the dropdown." },
];

const faqs = [
  {
    q: "What is seven_day_omelette, in one sentence?",
    a: "It is the JSON field name for Claude Design's separate weekly rate-limit bucket in Anthropic's internal /api/organizations/{uuid}/usage response. 'Omelette' is Anthropic's internal codename for the Claude Design product, visible in HTTP rate-limit response headers and in the JSON shape that claude.ai/settings/usage renders.",
  },
  {
    q: "Where does the codename come from?",
    a: "From Anthropic's own infrastructure. Ian Chan first posted publicly about it on X in 2026; the Lobster Pack writeup of Claude Design (May 2026) quotes the original observation: 'Anthropic's infrastructure calls the product Omelette. I'm mentioning it once because it's the codename visible in the API endpoints and rate-limit headers.' The bucket name in /usage is the same codename leaking through.",
  },
  {
    q: "Is this an official, documented Anthropic field?",
    a: "No. The /api/organizations/{uuid}/usage endpoint is undocumented; it is the call claude.ai/settings/usage makes on reload and was never published as a stable API. The field names are stable enough that the open-source claude-meter Rust client deserializes them by exact name (seven_day_omelette included). Anthropic can rename or drop them without notice.",
  },
  {
    q: "Why is there a separate weekly bucket for Claude Design at all?",
    a: "Because Claude Design's per-request cost looks nothing like a normal chat turn. The Lobster Pack analysis showed the Claude Design system prompt is roughly 30,240 characters (about 8,500 tokens) cached with ephemeral prompt caching, and each design turn fans out into tool calls and a verification subagent. If Anthropic let that burn count against the same weekly seven_day bucket as plain chat, one weekend of design experimentation would wall everything else. A separate per-product weekly bucket lets the design tool have its own ceiling.",
  },
  {
    q: "How do I read seven_day_omelette right now without installing anything?",
    a: "Open claude.ai/settings/usage in DevTools, copy the request Cookie header out of the Network tab, then curl 'https://claude.ai/api/organizations/{your-org-uuid}/usage' with that cookie and a Referer of https://claude.ai/settings/usage. Pipe it to jq .seven_day_omelette. If the response is null, your account is not on a plan that has Omelette enabled yet. If it is an object, utilization is a 0.0 to 1.0 fraction and resets_at is a UTC timestamp.",
  },
  {
    q: "What happens to seven_day_omelette when I have not used Claude Design at all?",
    a: "Two outcomes depending on plan. On accounts not in a tier that has the Omelette bucket enabled the field returns null, and there is nothing to render. On accounts that do have it, the field is an object with utilization: 0.0 until the first Claude Design turn lands on the account. After that, the bucket ages normally on its own rolling 7-day window.",
  },
  {
    q: "Does ClaudeMeter actually display seven_day_omelette in the menu bar?",
    a: "Yes when the field is non-null. The Rust struct UsageResponse at lines 18-28 of github.com/m13v/claude-meter/src/models.rs declares seven_day_omelette: Option<Window>, so the parser surfaces it. The dropdown shows each non-null window with its name and percentage; the badge is the worst non-null seven_day window across the set. If your Omelette bucket is at 91% you see '7d_omelette 91%' next to the all-up 7d number.",
  },
  {
    q: "Can a token counter like ccusage see seven_day_omelette burn?",
    a: "No. ccusage sums input and output tokens from ~/.claude/projects/*.jsonl on your local disk. Claude Design runs over the claude.ai web app and stores nothing in ~/.claude. Even if it did, Anthropic's quota numerator is dimensionless utilization (computed against a private per-product, per-plan ceiling), and the local logs have no concept of which product bucket a turn counted against. You can only see seven_day_omelette by reading the /usage JSON itself.",
  },
  {
    q: "Why does the field exist on accounts that do not have Claude Design?",
    a: "Because the JSON shape is server-driven and Anthropic chooses to emit nullable fields rather than omit them. claude-meter's struct declares the field Option<Window>, which deserializes both shapes cleanly: present-as-object when your plan has the bucket, present-as-null otherwise. This is also why the existing pages that called seven_day_omelette an 'experimental bucket usually null for individual accounts' were correct in late 2025 and went out of date once Claude Design rolled out more broadly in 2026.",
  },
];

const relatedPosts = [
  {
    title: "The Claude weekly quota server-truth meter",
    href: "/t/claude-weekly-quota-server-truth-meter",
    excerpt:
      "ClaudeMeter polls the same /api/organizations/{uuid}/usage endpoint claude.ai/settings/usage makes on reload. Field-by-field walkthrough of every window, with the Rust deserialization on lines 18-28.",
    tag: "Server truth",
  },
  {
    title: "Why token counters cannot see Anthropic's enforced quota",
    href: "/t/claude-server-quota-visibility",
    excerpt:
      "The /usage response returns utilization as a dimensionless 0.0 to 1.0 fraction with a private denominator. ccusage has the numerator only. Both are honest about different things; only one rate-limits you.",
    tag: "Server quota",
  },
  {
    title: "The Claude Code weekly quota wall: what the CLI hides",
    href: "/t/claude-code-weekly-quota-wall",
    excerpt:
      "Six weekly buckets, one generic 'rate limit reached' string from the CLI. The OAuth token in your Keychain plus the right endpoint will tell you which bucket actually walled you.",
    tag: "Claude Code",
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
                "What is seven_day_omelette? The Claude Design weekly quota bucket, explained from the API",
              description:
                "seven_day_omelette is the rate-limit field for Claude Design's separate 7-day quota window in Anthropic's internal /api/organizations/{uuid}/usage response. 'Omelette' is Anthropic's internal codename for Claude Design. claude-meter's open-source Rust struct names the field explicitly on line 25 of src/models.rs.",
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
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", url: "https://claude-meter.com" },
              {
                name: "Guides",
                url: "https://claude-meter.com/t/claude-weekly-quota-server-truth-meter",
              },
              { name: "seven_day_omelette", url: PAGE_URL },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqs)) }}
      />

      <div className="pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-4xl mx-auto px-6 mt-6 mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
          What is <code className="font-mono text-3xl sm:text-4xl bg-zinc-100 px-2 py-1 rounded text-teal-700">seven_day_omelette</code>?
        </h1>
        <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
          You hit this field name in a JSON payload (probably in DevTools on{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            claude.ai/settings/usage
          </code>
          , or in someone&apos;s rate-limit Slack screenshot) and you want to know
          what it actually means. Short answer: it is the rate-limit field for
          Claude Design&apos;s separate 7-day quota window. &ldquo;Omelette&rdquo; is
          Anthropic&apos;s internal codename for Claude Design, and the codename
          leaks through the API exactly here.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="6 min read"
      />

      <section className="max-w-4xl mx-auto px-6 my-10">
        <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-teal-700 mb-2">
            Direct answer (verified 2026-05-11)
          </p>
          <p className="text-zinc-900 text-base leading-relaxed">
            <strong>
              <code className="text-sm bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
                seven_day_omelette
              </code>{" "}
              is a field on Anthropic&apos;s internal
            </strong>{" "}
            <code className="text-sm bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
              GET claude.ai/api/organizations/&#123;uuid&#125;/usage
            </code>{" "}
            response. It is the separate 7-day rolling rate-limit bucket for the
            Claude Design product, internally codenamed &ldquo;Omelette&rdquo;.
            Each non-null instance is an object with two fields:{" "}
            <code className="text-sm bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
              utilization
            </code>{" "}
            (a 0.0 to 1.0 fraction the server computes against a private
            denominator) and{" "}
            <code className="text-sm bg-white px-1.5 py-0.5 rounded text-zinc-800 border border-teal-200">
              resets_at
            </code>{" "}
            (a UTC timestamp). Source-of-truth Rust deserializer:{" "}
            <a
              href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
              className="text-teal-700 underline underline-offset-2"
            >
              line 25 of claude-meter/src/models.rs
            </a>
            . Codename source:{" "}
            <a
              href="https://www.lobsterpack.com/blog/claude-design-trenchcoat/"
              className="text-teal-700 underline underline-offset-2"
            >
              Lobster Pack on Claude Design
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Where the field lives, in the raw JSON
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Open the Network tab on{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            claude.ai/settings/usage
          </code>{" "}
          and reload. The response from{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            /api/organizations/&#123;uuid&#125;/usage
          </code>{" "}
          is exactly this shape. seven_day_omelette sits beside six siblings.
          Each one is either a window object (
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            utilization
          </code>{" "}
          + <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            resets_at
          </code>
          ) or <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">null</code>{" "}
          if your plan does not have that bucket enabled.
        </p>
        <AnimatedCodeBlock
          code={usageJson}
          language="json"
          filename="claude.ai · /api/organizations/{uuid}/usage"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The seven sibling fields, and which products each one walls
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          seven_day_omelette is not the only weekly bucket. The full set lives
          in claude-meter&apos;s open-source Rust struct. The relevant rows are
          below. If you have ever been rate-limited by Claude with a confusing
          UI message, the bucket that actually fired is one of these seven.
        </p>
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="px-5 py-3 font-semibold text-zinc-900">Field</th>
                <th className="px-5 py-3 font-semibold text-zinc-900">What it counts</th>
                <th className="px-5 py-3 font-semibold text-zinc-900">Walls what</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700">
              <tr className="border-b border-zinc-200">
                <td className="px-5 py-3 font-mono text-xs">five_hour</td>
                <td className="px-5 py-3">Rolling 5-hour window, account-wide.</td>
                <td className="px-5 py-3">Web chat and Claude Code in the same 5-hour slice.</td>
              </tr>
              <tr className="border-b border-zinc-200">
                <td className="px-5 py-3 font-mono text-xs">seven_day</td>
                <td className="px-5 py-3">All-up rolling 168-hour aggregate.</td>
                <td className="px-5 py-3">The headline weekly cap.</td>
              </tr>
              <tr className="border-b border-zinc-200">
                <td className="px-5 py-3 font-mono text-xs">seven_day_sonnet</td>
                <td className="px-5 py-3">Rolling weekly bucket scoped to Sonnet traffic.</td>
                <td className="px-5 py-3">Sonnet calls only. Opus keeps working.</td>
              </tr>
              <tr className="border-b border-zinc-200">
                <td className="px-5 py-3 font-mono text-xs">seven_day_opus</td>
                <td className="px-5 py-3">Rolling weekly bucket scoped to Opus traffic.</td>
                <td className="px-5 py-3">Opus calls only. Drop to Sonnet for the rest of the week.</td>
              </tr>
              <tr className="border-b border-zinc-200">
                <td className="px-5 py-3 font-mono text-xs">seven_day_oauth_apps</td>
                <td className="px-5 py-3">OAuth-authenticated clients (Claude Code, MCP host loops).</td>
                <td className="px-5 py-3">Terminal stops. Web chat keeps working.</td>
              </tr>
              <tr className="border-b border-zinc-200 bg-teal-50">
                <td className="px-5 py-3 font-mono text-xs font-semibold text-teal-700">seven_day_omelette</td>
                <td className="px-5 py-3 text-zinc-900">Claude Design (codename Omelette) weekly bucket.</td>
                <td className="px-5 py-3 text-zinc-900">Claude Design canvas only. All other surfaces keep working.</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-mono text-xs">seven_day_cowork</td>
                <td className="px-5 py-3">Internal experimental bucket. Frequently null.</td>
                <td className="px-5 py-3">Usually nothing for individual accounts in 2026.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-zinc-500 mt-3">
          Source enumeration:{" "}
          <a
            href="https://github.com/m13v/claude-meter/blob/main/src/models.rs"
            className="text-teal-700 underline underline-offset-2"
          >
            github.com/m13v/claude-meter, src/models.rs lines 18-28
          </a>
          .
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          How an open-source tool names the field by exact string
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          A tool that promises to show Anthropic&apos;s weekly quota has to
          deserialize the JSON above. The cheapest way to verify a tracker is
          actually reading the bucket is to look at its parser. claude-meter is
          MIT-licensed Rust, so the relevant struct is on a single screen.
          Field name is the snake-case string Anthropic ships, no remapping, no
          summary view that hides the bucket.
        </p>
        <AnimatedCodeBlock
          code={rustStruct}
          language="rust"
          filename="github.com/m13v/claude-meter · src/models.rs"
        />
        <p className="text-sm text-zinc-500 mt-3">
          The whole HTTP client that calls the endpoint is{" "}
          <a
            href="https://github.com/m13v/claude-meter/blob/main/src/api.rs"
            className="text-teal-700 underline underline-offset-2"
          >
            142 lines in src/api.rs
          </a>
          . The base URL on line 8 is{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            https://claude.ai/api
          </code>{" "}
          and the per-org call is on line 19.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Read the field yourself in 60 seconds (no install)
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          You do not need any tool to verify what seven_day_omelette holds for
          your account. The session cookie in your browser already authenticates
          the call. Copy it out of DevTools and curl the endpoint.
        </p>
        <TerminalOutput lines={curlSession} title="curl claude.ai /usage" />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What to do when seven_day_omelette walls you
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-2">
          The Claude Design UI returns a generic message and points at the
          settings page. The settings page renders the percentage but the bar
          label collapses everything weekly into one number. The bucket that
          actually fired is in the JSON. Four moves, in order.
        </p>
        <StepTimeline steps={wallSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The 30-second sanity check
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Five steps that prove the field exists and that the value you are
          seeing matches what Anthropic itself is computing.
        </p>
        <AnimatedChecklist title="Verify the field" items={verifySteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Why this field is the one piece of evidence Claude Design exists as a
          separate product
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Anthropic ships Claude Design through the same surface as the rest of
          claude.ai. There is no separate domain, no separate API base URL, no
          separate pricing page. The only place the product is named as a
          distinct thing on the wire is this field. The string{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            seven_day_omelette
          </code>{" "}
          appears in rate-limit response headers, in the /usage JSON shape, and
          in the open-source parsers that handle that JSON. Nowhere else.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          If you have ever wondered why a single tab on claude.ai can suddenly
          tell you you are rate-limited while every other surface keeps working
          fine, the Omelette bucket is the wire-level reason. Two windows are
          aging on two clocks. One is the seven_day bucket counting your normal
          usage. The other is seven_day_omelette counting only Claude Design
          turns. Anthropic decided the two should not share a ceiling, and the
          JSON shape is the artefact of that decision.
        </p>
      </section>

      <FaqSection items={faqs} />

      <section className="max-w-4xl mx-auto px-6 my-12">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want me to walk through your /usage JSON?"
          description="Bring your settings page. I will tell you which bucket is closest to walling you and which field you should be alerting on."
        />
      </section>

      <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="20-minute call: read your usage JSON together."
      />
    </article>
  );
}
