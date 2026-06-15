import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  ComparisonTable,
  BeforeAfter,
  AnimatedCodeBlock,
  TerminalOutput,
  GlowCard,
  RelatedPostsGrid,
  GradientText,
  BackgroundGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/pro-20x-weekly-codex-credits";
const PUBLISHED = "2026-06-15";
const BOOKING = "https://cal.com/team/mediar/claude-meter";

export const metadata: Metadata = {
  title:
    "Pro 20x weekly limits vs Codex credits: why Claude has no credit number",
  description:
    "Codex gives you one weekly credit balance you can watch and top up. Claude Pro and Max 20x have no credit counter at all. The weekly cap is actually six separate seven-day utilization buckets the server tracks, and the only place all of them surface is the raw /api/oauth/usage JSON. Here is the field list and how to read it live.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Pro 20x weekly limits vs Codex credits: why Claude has no credit number",
    description:
      "Codex meters in credits; Claude Pro/Max 20x meters in seven_day utilization buckets with no in-app counter. Verified from the open-source claude-meter src/models.rs.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "Pro 20x weekly limits vs Codex credits",
    url: PAGE_URL,
  },
];

const breadcrumbCrumbs = [
  { label: "Home", href: "https://claude-meter.com" },
  { label: "Guides", href: "https://claude-meter.com/t" },
  { label: "Pro 20x weekly vs Codex credits" },
];

const faqs = [
  {
    q: "Does Claude Pro or Max 20x have weekly credits like Codex?",
    a: "No. Codex switched to a token-based credit balance on April 2, 2026, so you see a number, you watch it tick down, and you can buy more without changing plans. Claude Pro and Max 20x have no credit balance at all. Anthropic meters you with utilization fractions on a rolling 5-hour window plus several 7-day (weekly) windows, and bills overflow as pay-as-you-go 'extra usage'. There is no 'credits remaining' figure anywhere in the Claude apps. The closest analog is the percentage bar at claude.ai/settings/usage, and even that does not show every weekly bucket the server enforces.",
  },
  {
    q: "What does '20x' actually refer to, Claude or Codex?",
    a: "Both ecosystems shipped a 20x tier, which is exactly why this comparison is confusing. ChatGPT Pro 20x is the $200/month plan, 20 times the Plus limits, roughly 200 to 1,200 Codex cloud tasks per 5-hour window. Claude Max 20x is also $200/month and is sized at about 20 times Claude Pro. The shared '20x' label hides a structural difference: Codex 20x meters you in credits you can see and buy, Claude Max 20x meters you in opaque utilization windows you cannot.",
  },
  {
    q: "How many weekly buckets does Claude actually track?",
    a: "At least six. The /api/oauth/usage payload that claude-meter reads deserializes into a UsageResponse struct (src/models.rs) with seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, and seven_day_cowork, alongside the five_hour window and an extra_usage block. Each seven_day* field is a Window object with a utilization float and a resets_at timestamp. Claude's own Settings page renders only a subset of these, so you can be fine on the headline weekly bar while a model-specific bucket like seven_day_opus is the one about to 429 you.",
  },
  {
    q: "Where does Claude's weekly number actually live if there is no credit counter?",
    a: "In one undocumented endpoint: GET https://api.anthropic.com/api/oauth/usage, authorized with the Bearer token Claude Code already stores in your macOS Keychain under the service name 'Claude Code-credentials'. That single response carries the 5-hour window, all the seven_day* windows, and the extra_usage block. claude.ai/settings/usage calls the same internal data and renders a trimmed version. claude-meter reads the raw response and shows every window in the menu bar.",
  },
  {
    q: "Can ccusage show me my Claude weekly quota like a Codex credit balance?",
    a: "No, and this is the most common mix-up. ccusage and Claude-Code-Usage-Monitor read ~/.claude/projects/**/*.jsonl on your disk and sum tokens against a price card. That is an accurate local token count, but it is not the server's utilization. The weekly buckets fold in peak-hour weighting, claude.ai web traffic, other devices on your account, and OAuth-app calls, none of which appear in your local files. They answer 'what did Claude Code burn here', not 'how close is Anthropic to weekly-capping me'. Only the server number tells you that.",
  },
  {
    q: "Does Claude let me buy more like topping up Codex credits?",
    a: "Sort of, but it is not a credit purchase. When you cross a window, Anthropic can route overflow into metered 'extra usage', a pay-as-you-go dollar balance, rather than hard-stopping you. claude-meter surfaces that as the extra_usage block in dollars. The difference from Codex is that you do not pre-buy a credit pack and watch it deplete; you accrue overage after the fact, which is exactly why seeing the weekly utilization climb before you hit it matters more on Claude than on Codex.",
  },
  {
    q: "Is claude-meter free and does it work without the Claude Code CLI?",
    a: "It is free, open-source (MIT), and macOS 12 or newer. The menu bar app reads the OAuth token that the Claude Code CLI stores in your Keychain, so you need Claude Code installed and logged in (run 'claude' once). There is also a browser extension path that forwards your claude.ai session instead. Either way there is no manual cookie paste and no separate login. Install: brew install --cask m13v/tap/claude-meter.",
  },
];

const comparisonRows = [
  {
    feature: "Unit of metering",
    competitor: "Token-based credits (since Apr 2, 2026)",
    ours: "Utilization fractions on rolling windows",
  },
  {
    feature: "Visible balance in-app",
    competitor: "Yes, a credit number you watch tick down",
    ours: "No credit number anywhere in the Claude apps",
  },
  {
    feature: "Weekly structure",
    competitor: "One credit pool per plan",
    ours: "Six+ separate seven_day* buckets",
  },
  {
    feature: "Per-model caps",
    competitor: "Credits priced per model, one balance",
    ours: "seven_day_opus and seven_day_sonnet are distinct windows",
  },
  {
    feature: "Paying for overflow",
    competitor: "Buy more credits, pre-paid, deplete",
    ours: "Metered extra_usage, accrued in dollars after",
  },
  {
    feature: "Where the real number lives",
    competitor: "Shown in ChatGPT / Codex UI",
    ours: "/api/oauth/usage JSON, trimmed at /settings/usage",
  },
];

const usageJson = `// GET https://api.anthropic.com/api/oauth/usage
// Bearer token from Keychain service "Claude Code-credentials"
{
  "five_hour":           { "utilization": 41.0, "resets_at": "..." },
  "seven_day":           { "utilization": 68.0, "resets_at": "..." },
  "seven_day_opus":      { "utilization": 91.0, "resets_at": "..." },
  "seven_day_sonnet":    { "utilization": 33.0, "resets_at": "..." },
  "seven_day_oauth_apps":{ "utilization": 12.0, "resets_at": "..." },
  "seven_day_omelette":  { "utilization":  4.0, "resets_at": "..." },
  "seven_day_cowork":    { "utilization":  0.0, "resets_at": "..." },
  "extra_usage":         { "spend": "...", "utilization": 0.0 }
}
// There is no "credits" field. There is no single "weekly" number.
// seven_day reads 68% while seven_day_opus is already at 91%.`;

const relatedPosts = [
  {
    title: "Claude weekly limit and metered extra usage",
    href: "https://claude-meter.com/t/claude-weekly-limit-extra-usage",
    excerpt:
      "When your usage rolls from the included weekly window into pay-as-you-go dollars, and how to see the handoff.",
    tag: "Billing",
  },
  {
    title: "Claude weekly quota, read from server truth",
    href: "https://claude-meter.com/t/claude-weekly-quota-server-truth-meter",
    excerpt:
      "ccusage sums local JSONL tokens. Anthropic enforces server utilization. The gap is why you get capped at 5%.",
    tag: "ccusage",
  },
  {
    title: "Claude Max weekly limit tracker",
    href: "https://claude-meter.com/t/claude-max-weekly-limit-tracker",
    excerpt:
      "Watch the Max weekly bar tick instead of guessing where the wall is on a $200 plan.",
    tag: "Max 20x",
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
                "Pro 20x weekly limits vs Codex credits: why Claude has no credit number",
              description:
                "Codex meters in weekly credits you can watch and buy. Claude Pro and Max 20x meter in six separate seven-day utilization buckets with no in-app counter. Field list and how to read it live.",
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "ClaudeMeter",
              publisherUrl: "https://claude-meter.com",
              articleType: "TechArticle",
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema(faqs)),
        }}
      />

      <div className="mx-auto max-w-3xl px-5 pt-10 pb-24">
        <Breadcrumbs items={breadcrumbCrumbs} />

        <BackgroundGrid className="mt-6 rounded-3xl border border-zinc-200 px-6 py-10 sm:px-10 sm:py-12">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
            Codex credits vs Claude weekly windows
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
            Pro 20x has a weekly credit number you can watch.{" "}
            <GradientText>Claude does not.</GradientText>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-700">
            If you came here from a thread mixing &ldquo;Pro 20x&rdquo;,
            &ldquo;weekly&rdquo;, &ldquo;Codex&rdquo;, and
            &ldquo;credits&rdquo;, you are circling a real mismatch. Both
            OpenAI and Anthropic now sell a $200 20x tier for heavy coders. Only
            one of them shows you a balance.
          </p>

          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="7 min read"
          />
        </BackgroundGrid>

        {/* DIRECT ANSWER */}
        <section className="mt-10">
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Direct answer (verified 2026-06-15)
            </p>
            <p className="mt-3 text-lg leading-relaxed text-zinc-800">
              No, Claude Pro and Max 20x do not have weekly credits like Codex.
              Codex switched to a token-based credit balance on April 2, 2026, so
              you see a number and can buy more. Claude has{" "}
              <strong className="text-zinc-900">no credit counter at all</strong>
              . It meters you with a rolling 5-hour window plus several 7-day
              (weekly) utilization buckets, and bills overflow as pay-as-you-go
              extra usage. The numbers live only in the raw{" "}
              <code className="rounded bg-white px-1.5 py-0.5 text-sm text-zinc-800">
                /api/oauth/usage
              </code>{" "}
              response, a trimmed version of which renders at{" "}
              <a
                href="https://claude.ai/settings/usage"
                className="font-medium text-teal-700 underline"
              >
                claude.ai/settings/usage
              </a>
              .
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            The two &ldquo;20x&rdquo; plans meter you in opposite ways
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-700">
            The shared label is the trap. ChatGPT Pro 20x is the $200/month
            plan, roughly 20 times the Plus Codex limits (about 200 to 1,200
            cloud tasks per 5-hour window). Claude Max 20x is also $200/month
            and sized at about 20 times Claude Pro. Same price, same multiplier,
            completely different way of telling you where you stand. Codex hands
            you a depleting credit balance. Claude hands you a set of percentage
            bars, and only some of them are visible in the product.
          </p>

          <div className="mt-8">
            <ComparisonTable
              productName="Claude Pro / Max 20x"
              competitorName="ChatGPT Pro 20x / Codex"
              heading="Credits vs utilization windows"
              intro="Both are $200 heavy-use tiers. Only one exposes a number you can watch."
              rows={comparisonRows}
              caveat="Codex credit pricing per OpenAI's April 2, 2026 token-billing change. Claude window fields read from the open-source claude-meter src/models.rs."
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Claude&rsquo;s &ldquo;weekly limit&rdquo; is not one number. It is six.
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-700">
            This is the part every Codex-vs-Claude comparison gets wrong. They
            write &ldquo;Claude weekly limit&rdquo; as if it were a single cap,
            the mirror of a Codex credit pool. It is not. The endpoint that
            backs your usage returns a whole family of seven-day windows, each
            with its own utilization float and its own reset clock. You can sit
            at 68% on the headline weekly bar while a model-specific bucket like{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
              seven_day_opus
            </code>{" "}
            is already at 91% and about to be the thing that stops you.
          </p>

          <div className="mt-8">
            <AnimatedCodeBlock
              code={usageJson}
              language="json"
              filename="api.anthropic.com/api/oauth/usage (response shape)"
            />
          </div>

          <GlowCard className="mt-8 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              The anchor fact
            </p>
            <p className="mt-3 leading-relaxed text-zinc-700">
              In the open-source claude-meter Rust core, the response
              deserializes into{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
                struct UsageResponse
              </code>{" "}
              in{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
                src/models.rs
              </code>
              . The weekly side alone is{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
                seven_day
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
                seven_day_sonnet
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
                seven_day_opus
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
                seven_day_oauth_apps
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
                seven_day_omelette
              </code>
              , and{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
                seven_day_cowork
              </code>
              . Six weekly windows, plus the 5-hour window and an{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
                extra_usage
              </code>{" "}
              block. A Codex credit balance is one scalar. This is a vector, and
              Anthropic only paints part of it for you.
            </p>
          </GlowCard>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Why the visibility gap actually bites
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-700">
            On Codex, running out is a non-event: the credit number told you it
            was coming, and you topped up. On Claude, the failure mode is a wall
            you did not see. Because there is no balance and the per-model
            buckets are hidden, the first signal you get is a 429 mid-refactor.
            That is the workflow this page is about closing.
          </p>

          <div className="mt-8">
            <BeforeAfter
              title="Hitting the weekly cap, with and without the number in front of you"
              before={{
                label: "Claude as shipped",
                content:
                  "You code against Opus all morning. The Settings page weekly bar reads a comfortable 68%, so you keep going. The bucket actually gating you is seven_day_opus, which the page does not foreground. It hits 100%. Claude Code stops mid-task and you find out from the error.",
                highlights: [
                  "No credit number to watch",
                  "Per-model weekly bucket hidden",
                  "First signal is the 429",
                ],
              }}
              after={{
                label: "Claude with the windows surfaced",
                content:
                  "The same six seven_day* windows are read straight from /api/oauth/usage and shown in the menu bar. seven_day_opus is visibly at 91% by mid-morning. You switch the heavy loop to Sonnet, or wrap up the Opus work before it caps, instead of getting stopped by it.",
                highlights: [
                  "Every weekly bucket visible",
                  "See the model-specific cap before it hits",
                  "Reset clock per window",
                ],
              }}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Read your own weekly windows in one request
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-700">
            You do not have to take this on faith. The number Anthropic enforces
            is one authenticated GET away, using the token Claude Code already
            put in your Keychain. claude-meter automates this on a one-minute
            poll, but here is the raw path so you can confirm the buckets exist.
          </p>

          <div className="mt-8">
            <TerminalOutput
              title="claude-meter --json"
              lines={[
                { text: "brew install --cask m13v/tap/claude-meter", type: "command" },
                { text: "Installing claude-meter...", type: "output" },
                { text: "Reads Keychain service: Claude Code-credentials", type: "info" },
                { text: "/Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json", type: "command" },
                { text: "5-hour        41.0% used", type: "output" },
                { text: "Weekly        68.0% used", type: "output" },
                { text: "Weekly (Opus) 91.0% used   <- the one that stops you", type: "error" },
                { text: "Weekly (Sonnet) 33.0% used", type: "output" },
                { text: "Extra usage   $0.00", type: "output" },
                { text: "Same numbers as claude.ai/settings/usage, all buckets", type: "success" },
              ]}
            />
          </div>

          <p className="mt-6 leading-relaxed text-zinc-700">
            One caveat worth stating plainly, since it is the second most common
            mix-up after the &ldquo;Claude has credits&rdquo; assumption:{" "}
            <strong className="text-zinc-900">
              ccusage cannot show you this
            </strong>
            . Local token tools sum the JSONL files in{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
              ~/.claude/projects
            </code>{" "}
            against a price card. That is an honest local token count, but it is
            a different data source than the server&rsquo;s utilization. The
            weekly buckets fold in web traffic, other devices, and peak-hour
            weighting that never touch your disk. Only the server response tells
            you how close you are to the cap.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={BOOKING}
          site="claude-meter"
          heading="Want every Claude weekly bucket on one bar?"
          description="If you are juggling Pro 20x, Codex credits, and a Claude Max plan, I can walk you through reading the server-truth windows live. Book 15 minutes."
        />

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Questions people actually ask about this
          </h2>
          <div className="mt-6">
            <FaqSection items={faqs} />
          </div>
        </section>

        <div className="mt-16">
          <RelatedPostsGrid
            title="Keep going"
            posts={relatedPosts}
          />
        </div>
      </div>

      <BookCallCTA
        appearance="sticky"
        destination={BOOKING}
        site="claude-meter"
        description="See your real Claude weekly windows, not a guess."
      />
    </article>
  );
}
