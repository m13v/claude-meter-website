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
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claudmeter";
const PUBLISHED = "2026-05-16";
const MODIFIED = "2026-05-17";

export const metadata: Metadata = {
  title:
    "Claudmeter: the product you mean is ClaudeMeter (claude-meter.com)",
  description:
    "Claudmeter is a common misspelling of ClaudeMeter, the free open-source macOS menu bar app that shows your live Claude Pro and Max plan usage. Same product, missing one e. Here is what it is, the brew install, and how it differs from ccusage.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claudmeter: the product you mean is ClaudeMeter (claude-meter.com)",
    description:
      "Claudmeter is a common misspelling of ClaudeMeter, the free open-source macOS menu bar app and browser extension that reads server-truth Claude plan quota.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Guides", href: "/t/claude-code-rate-limit" },
  { label: "Claudmeter" },
];

const breadcrumbsForSchema = [
  { name: "Home", url: "https://claude-meter.com/" },
  { name: "Guides", url: "https://claude-meter.com/t/claude-code-rate-limit" },
  { name: "Claudmeter", url: PAGE_URL },
];

const installLines = [
  { text: "brew install --cask m13v/tap/claude-meter", type: "command" as const },
  { text: "==> Installing Cask claude-meter", type: "output" as const },
  { text: "==> Moving App 'ClaudeMeter.app' to '/Applications/ClaudeMeter.app'", type: "output" as const },
  { text: "claude-meter was successfully installed!", type: "success" as const },
  { text: "open /Applications/ClaudeMeter.app", type: "command" as const },
  { text: "ClaudeMeter icon appears in the menu bar.", type: "output" as const },
  { text: "claude-meter --json", type: "command" as const },
  {
    text: '{"five_hour":{"utilization":0.42,"resets_at":"2026-05-16T19:08:00Z"},',
    type: "output" as const,
  },
  {
    text: ' "seven_day":{"utilization":0.61,"resets_at":"2026-05-19T09:11:00Z"}, ...',
    type: "output" as const,
  },
];

const usageJsonShape = `// /Users/<you>/claude-meter/src/models.rs  lines 19-28
pub struct UsageResponse {
    pub five_hour:             Option<Window>,
    pub seven_day:             Option<Window>,
    pub seven_day_sonnet:      Option<Window>,
    pub seven_day_opus:        Option<Window>,
    pub seven_day_oauth_apps:  Option<Window>,
    pub seven_day_omelette:    Option<Window>,
    pub seven_day_cowork:      Option<Window>,
    pub extra_usage:           Option<ExtraUsage>,
}`;

const faqs = [
  {
    q: "Is claudmeter a real product, or did I misspell it?",
    a: "You missed one e. The product is ClaudeMeter, spelled c-l-a-u-d-e-m-e-t-e-r, hosted at claude-meter.com with the source at github.com/m13v/claude-meter. People type 'claudmeter' often enough that Google Search Console shows it as a recurring impression source for the real domain. Everything below uses the correct spelling.",
  },
  {
    q: "What does ClaudeMeter actually do?",
    a: "It is a free, open-source macOS menu bar app plus a browser extension. It reads the same JSON that claude.ai/settings/usage renders ('/api/organizations/{org_uuid}/usage') and shows you your rolling 5-hour window, your weekly quota, your Sonnet and Opus per-model weekly caps, and your extra-usage (metered overage) balance. The menu bar icon stays live; the popover gives you the numbers plus per-bucket reset clocks.",
  },
  {
    q: "How do I install ClaudeMeter?",
    a: "Two commands plus one click. (1) brew install --cask m13v/tap/claude-meter installs the menu bar app. (2) Open https://github.com/m13v/claude-meter/releases, download the extension zip, and Load unpacked in chrome://extensions. (3) Visit claude.ai once so the extension can call the usage endpoint with your existing cookies. Within a minute the menu bar lights up with your live numbers. Full instructions live at https://claude-meter.com/install.",
  },
  {
    q: "Is ClaudeMeter free? What is the catch?",
    a: "Free, MIT licensed, zero telemetry. The catch is that the claude.ai usage endpoint is undocumented; Anthropic could change the response shape and the project would need a one-line patch to src/models.rs to keep up. There is no paid tier, no account to make, no email to give. The single network destination is claude.ai itself, called once per minute on a chrome.alarms tick (POLL_MINUTES = 1 in extension/background.js).",
  },
  {
    q: "ClaudeMeter vs ccusage, which one do I want?",
    a: "They answer different questions, so most heavy users run both. ccusage reads ~/.claude/projects/<project>/<session>.jsonl and tells you what your Claude Code prompts would have cost at API token prices. ClaudeMeter reads the server-truth plan utilization floats that Anthropic enforces, the same numbers claude.ai/settings/usage shows you. Local token sum and server-side plan quota are different data sources for different decisions ('how much would I spend on API?' versus 'how close am I to a 429?').",
  },
  {
    q: "Does ClaudeMeter work on Windows or Linux?",
    a: "Not today. It is macOS 12+ for the menu bar binary (Rust core, SwiftUI shell). The browser extension itself is Chrome, Arc, Brave, and Edge; Safari is not supported because Manifest V3 sideload behavior differs there. A Windows or Linux port would mostly be a tray-icon shell on top of the existing Rust core. Open an issue on the GitHub repo if you want it.",
  },
  {
    q: "What is the GitHub repo for ClaudeMeter?",
    a: "github.com/m13v/claude-meter. The Rust core lives in src/, the SwiftUI menu bar shell in macos/, and the browser extension in extension/. README.md has the install steps and the undocumented usage-endpoint details. Issues and pull requests are welcome.",
  },
  {
    q: "Is it spelled 'clawd meter' or 'claude meter'?",
    a: "It is ClaudeMeter, c-l-a-u-d-e. 'Clawd meter' is a phonetic spelling: the model name Claude is pronounced 'clawd' (rhyming with 'broad'), so people who heard the name before they read it tend to write 'clawd'. There is no product called 'clawd meter'; it is the same free, open-source macOS menu bar app and browser extension at claude-meter.com. Search for 'clawd meter', 'claudmeter', or 'claude meter' and you land on the same project either way.",
  },
  {
    q: "Does claudemeter need a password or my Anthropic API key?",
    a: "Neither. The browser extension calls /api/organizations/{org_uuid}/usage with credentials: 'include', meaning it reuses the same session cookie your browser already has from being logged in to claude.ai. It POSTs the parsed snapshot to a loopback bridge on 127.0.0.1:63762 that only the menu bar app on your own machine can reach. No password, no API key, no manual cookie paste.",
  },
];

const relatedPosts = [
  {
    title: "Claude Code rate limit: eight floats on one endpoint",
    href: "/t/claude-code-rate-limit",
    excerpt:
      "Field-by-field walkthrough of the eight utilization floats Anthropic enforces, why ccusage cannot see them, and the brew install that shows all eight.",
    tag: "Deep dive",
  },
  {
    title: "Claude Code Max usage limits: the float they actually come from",
    href: "/t/claude-code-max-usage-limits",
    excerpt:
      "Max plans get higher denominators on the same eight floats, not a separate prompt count. Why blog posts disagree on '~200 prompts per session' for Max 5x.",
    tag: "Plans",
  },
  {
    title: "Claude 5-hour server-side wall",
    href: "/t/claude-5-hour-server-side-wall",
    excerpt:
      "The rolling 5-hour window is one specific float on one specific endpoint. How the age-off works and why resets_at is not a cliff.",
    tag: "Reference",
  },
];

const articleJsonLd = articleSchema({
  url: PAGE_URL,
  headline:
    "Claudmeter: the product you mean is ClaudeMeter (claude-meter.com)",
  description:
    "Claudmeter is a common misspelling of ClaudeMeter, the free open-source macOS menu bar app that shows your live Claude Pro and Max plan usage. Same product, missing one e.",
  datePublished: PUBLISHED,
  dateModified: MODIFIED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "ClaudeMeter",
  publisherUrl: "https://claude-meter.com",
});

const breadcrumbJsonLd = breadcrumbListSchema(breadcrumbsForSchema);
const faqJsonLd = faqPageSchema(faqs);

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-8 pb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <header className="mx-auto max-w-3xl px-4 sm:px-6 pt-2 pb-6">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
          You meant <GradientText>ClaudeMeter</GradientText>. Missing one e.
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-zinc-600 leading-relaxed">
          &quot;Claudmeter&quot; is the most common misspelling of ClaudeMeter,
          a free open-source macOS menu bar app that shows your real Claude Pro
          and Max plan usage by reading the same server endpoint that
          claude.ai/settings/usage renders. Here is what it is, how to install
          it, and how it differs from ccusage.
        </p>
        <div className="mt-6">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="4 min read"
          />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-10">
        <GlowCard>
          <div className="p-5 sm:p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Direct answer, verified May 16, 2026
            </div>
            <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-zinc-900">
              The product is ClaudeMeter, spelled with an &quot;e&quot; after &quot;Claud&quot;.
            </h2>
            <p className="mt-3 text-zinc-700 leading-relaxed">
              Domain:{" "}
              <a
                className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
                href="https://claude-meter.com"
                rel="noopener"
              >
                claude-meter.com
              </a>
              . Source:{" "}
              <a
                className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
                href="https://github.com/m13v/claude-meter"
                rel="noopener"
              >
                github.com/m13v/claude-meter
              </a>
              . Install:{" "}
              <a
                className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
                href="https://claude-meter.com/install"
                rel="noopener"
              >
                claude-meter.com/install
              </a>
              . It runs as a menu bar app on macOS 12+ and a browser extension
              for Chrome, Arc, Brave, and Edge. MIT licensed, no telemetry.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          What ClaudeMeter shows you that nothing else does
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The claude.ai usage endpoint returns eight utilization floats. The
          Settings page renders four of them as bars. The other four pin to
          1.0 with every visible bar still green; that is the silent 429 path.
          ClaudeMeter parses the full payload and renders all eight, plus the
          metered-overage balance, plus a per-bucket reset clock.
        </p>
        <div className="mt-6">
          <AnimatedCodeBlock
            code={usageJsonShape}
            language="rust"
            filename="claude-meter/src/models.rs"
          />
        </div>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The four fields below the horizontal line (
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px] text-zinc-800">
            seven_day_oauth_apps
          </code>
          ,{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px] text-zinc-800">
            seven_day_omelette
          </code>
          ,{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px] text-zinc-800">
            seven_day_cowork
          </code>
          ,{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px] text-zinc-800">
            extra_usage
          </code>
          ) are the ones the Settings page hides. They are the most common
          source of the &quot;rate limit reached&quot; popup that arrives when
          your visible bars look fine.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Install in 30 seconds
        </h2>
        <StepTimeline
          steps={[
            {
              title: "1. brew install the menu bar app",
              description:
                "brew install --cask m13v/tap/claude-meter. macOS 12 or newer. The cask tap is m13v/tap (Homebrew formula at github.com/m13v/homebrew-tap).",
            },
            {
              title: "2. Load the browser extension once",
              description:
                "Download the extension zip from https://github.com/m13v/claude-meter/releases. In chrome://extensions, enable Developer mode, Load unpacked, point at the unzipped folder. Pin the icon.",
            },
            {
              title: "3. Visit claude.ai once",
              description:
                "The extension calls /api/organizations/{org_uuid}/usage on a 1-minute alarm with your existing cookies. The menu bar lights up within a minute. No keychain prompt if the extension is the active source.",
            },
          ]}
        />
        <div className="mt-8">
          <TerminalOutput lines={installLines} title="Local terminal" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Other ways people spell it
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          For the record, the brand has been typed as &quot;claudmeter&quot;,
          &quot;claudemeter&quot;, &quot;claude meter&quot;,
          &quot;claude-meter&quot;, &quot;clude meter&quot;, and
          &quot;clawd meter&quot; in real queries that reached this site. They
          all refer to the same project at{" "}
          <a
            className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
            href="https://claude-meter.com"
            rel="noopener"
          >
            claude-meter.com
          </a>
          . The canonical spelling is ClaudeMeter (one word, two e&#39;s); the
          domain hyphenates because the unhyphenated one was taken.
        </p>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          &quot;Clawd meter&quot; is the phonetic one. Claude the model is
          pronounced &quot;clawd&quot; (it rhymes with &quot;broad&quot;, not
          &quot;loud&quot;), so anyone who heard the name spoken in a video or a
          podcast before they ever saw it written tends to spell the tool
          &quot;clawd meter&quot;. It is not a separate product. If you came
          here searching for &quot;clawd meter&quot;, the tool you want is
          ClaudeMeter, the menu bar app and browser extension described above:
          brew install --cask m13v/tap/claude-meter, then load the extension.
          Source for the spelling list: Google Search Console export for
          claude-meter.com, May 2026.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          ClaudeMeter vs ccusage in one paragraph
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          ccusage reads{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px] text-zinc-800">
            ~/.claude/projects/&lt;project&gt;/&lt;session&gt;.jsonl
          </code>{" "}
          and sums input plus output tokens against a price card. It is the
          right tool for &quot;what would these prompts have cost on the
          API?&quot; ClaudeMeter reads the eight server-side utilization floats
          Anthropic actually enforces against your plan, the same numbers your
          Settings page shows. Local token sum and server plan quota are two
          different data sources. Most heavy users run both. The deeper
          comparison lives on{" "}
          <a
            className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
            href="https://claude-meter.com/vs-ccusage"
            rel="noopener"
          >
            /vs-ccusage
          </a>
          .
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-4">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Want to see your real plan quota before you ship it?"
          description="20-minute call. We walk through your eight utilization floats on a heavy week and whether ClaudeMeter changes anything for your workflow."
        />
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
        <FaqSection items={faqs} />
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <RelatedPostsGrid posts={relatedPosts} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="See your real Claude plan quota in your menu bar."
      />
    </article>
  );
}
