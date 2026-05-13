import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  AnimatedChecklist,
  ComparisonTable,
  GlowCard,
  GradientText,
  ProofBanner,
  TerminalOutput,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/clawdmeter";
const PUBLISHED = "2026-05-13";

export const metadata: Metadata = {
  title:
    "Clawdmeter: you meant ClaudeMeter (the free Claude plan usage tracker)",
  description:
    "'Clawdmeter' is a misspelling of ClaudeMeter, a free open-source macOS menu bar app and browser extension that shows your live Claude Pro and Max plan usage. Install with one brew command; the source is on GitHub at m13v/claude-meter.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Clawdmeter: you meant ClaudeMeter (the free Claude plan usage tracker)",
    description:
      "Yes, 'clawdmeter' is a misspelling of ClaudeMeter. Here is the one brew command that installs it, the anchor facts that prove you found the real thing, and the cookie pipeline most monitors skip explaining.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Clawdmeter (typo for ClaudeMeter)", url: PAGE_URL },
];

const faqs = [
  {
    q: "Is 'clawdmeter' the real product name?",
    a: "No. The product is ClaudeMeter, written as one word with a capital C and a capital M, and spelled like the model name 'Claude'. The 'clawd' spelling is what people type when they sound the name out and skip the silent letters; it shows up in real Google Search Console impressions for claude-meter.com. The repo on GitHub is m13v/claude-meter; the brew cask is m13v/tap/claude-meter; the website is claude-meter.com. If a result, a tweet, or a README spells it 'clawdmeter', 'clauwdmeter', 'cloudmeter', or 'clauwmeter', it is almost certainly pointing at the same project.",
  },
  {
    q: "What does ClaudeMeter actually do?",
    a: "It puts your live Claude Pro or Max plan usage in your macOS menu bar. Three numbers: the rolling 5-hour window percent (with reset time), the weekly quota percent (all models and Opus separately, with reset time), and your Extra Usage dollar balance for the metered billing Anthropic rolled out in April 2026. It reads those numbers from the same three internal endpoints that claude.ai/settings/usage renders, so the percents match exactly with what you see in the Settings page when both are open.",
  },
  {
    q: "How do I install the thing I was actually looking for?",
    a: "One command: brew install --cask m13v/tap/claude-meter. That puts the menu bar app in /Applications/ClaudeMeter.app and a CLI at /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter. Then load the browser extension once: clone github.com/m13v/claude-meter, open chrome://extensions in Chrome, Arc, Brave, or Edge, turn on Developer mode, click Load unpacked, and pick the extension/ folder. Visit claude.ai once. The menu bar popover lights up within 60 seconds. No cookie paste, no API key, no login screen for the app itself.",
  },
  {
    q: "Why am I seeing the typo 'clawdmeter' in my own search history?",
    a: "Two reasons. The first is phonetics: spoken out loud, 'Claude' sounds like 'clawd', so when someone has only heard the name (a podcast, a Discord call, a colleague mentioning it in a meeting) they often type the phonetic version into Google. The second is muscle memory from the word 'cloud'; people typing fast on autocomplete-aggressive iOS keyboards land on 'cloud' or 'clawd' before they realize the product name is the Anthropic model. Google's autosuggest and Search Console treat 'clawdmeter' as a distinct query from 'claudemeter', which is why the misspelling shows up as its own row in our impressions data.",
  },
  {
    q: "Is this the same project as 'claude meter' (with a space), 'claude-meter' (with a hyphen), and 'claudemeter' (one word)?",
    a: "Yes. All four are the same project. The GitHub repo is m13v/claude-meter, the npm-like brew cask name is claude-meter, the website is claude-meter.com, and the in-product display name with no space and capital letters is ClaudeMeter. The hyphen exists because Cargo, Homebrew, and DNS prefer lowercase-with-hyphens; the camel-case 'ClaudeMeter' exists because that is how the macOS .app bundle is labeled in the Dock. The misspellings ('clawdmeter', 'cloudmeter', 'clauwdmeter') are not separate forks.",
  },
  {
    q: "How can I verify on the install that I got the real ClaudeMeter and not a typosquat?",
    a: "Four checks. One: the brew tap is m13v/tap, owned by the same GitHub account that owns the source repo. Two: the cask URL points at a release artifact under github.com/m13v/claude-meter/releases, signed and notarized by the developer account. Three: the menu bar app's About panel links to https://claude-meter.com, not a lookalike domain. Four: the source for the data fetch is one file, src/api.rs, which you can read in 90 seconds; it hits three URLs under claude.ai, no third-party servers. The MIT license at the repo root means you can audit the binary against the source without asking permission.",
  },
  {
    q: "Why does the browser extension talk to localhost on port 63762?",
    a: "That is the bridge the menu bar app listens on. When the extension fetches your usage from claude.ai with your already-logged-in cookies, it POSTs the snapshot to http://127.0.0.1:63762/snapshots. The number is fixed in extension/background.js so the manifest can declare it as a host permission, and it is bound to 127.0.0.1 only, so nothing on your network can reach it. The menu bar app reads incoming snapshots, identifies which browser sent each one by looking up the peer TCP socket's owning process, and updates the icon. If you grep the repo for '63762' you find exactly two lines: extension/background.js:2 and extension/manifest.json:9.",
  },
  {
    q: "Does the typo-fix page mean my browser autocorrected the URL?",
    a: "No. There is no automatic redirect from typo'd brand domains to claude-meter.com; we do not own and would not buy 'clawdmeter.com'. You probably typed 'clawdmeter' into Google or Bing, the search engine matched it against pages from claude-meter.com that mention the product (or against this page now that it exists), and clicked through. The URL bar still shows whatever you typed. If you want to bookmark the real thing, the canonical address is https://claude-meter.com.",
  },
  {
    q: "What is the difference between ClaudeMeter and ccusage if both call themselves usage trackers?",
    a: "They measure different numbers. ccusage and Claude-Code-Usage-Monitor read the JSONL files Claude Code writes locally under ~/.claude/projects/, parse the prompt/response token counts out of those logs, and aggregate them. That is useful for per-project cost accounting, but the number does not include any usage that happened on claude.ai itself, on Claude Code on another machine, or before the JSONL window. ClaudeMeter polls claude.ai/api/organizations/{org_uuid}/usage instead, which is the server-truth number Anthropic's rate limiter actually compares against. The two are complementary; the percent that 429s you is the ClaudeMeter one.",
  },
  {
    q: "What if I am on Windows or Linux?",
    a: "ClaudeMeter is macOS 12+ only right now. Linux and Windows are not on the roadmap because the cookie-decrypt path depends on macOS Keychain APIs and the menu bar UI depends on SwiftUI. The browser extension by itself runs on any Chromium browser on any OS and will happily fetch and POST snapshots, but with no local bridge to receive them the data has nowhere to land. If you only want the data and not the menu bar UI, the three endpoints in src/api.rs work from any HTTP client; you can build a CLI tracker in 30 lines of Python.",
  },
];

const installCode = `# 1. Install the menu bar app
brew install --cask m13v/tap/claude-meter

# 2. Load the browser extension once (Chrome, Arc, Brave, or Edge)
git clone https://github.com/m13v/claude-meter
# open chrome://extensions  ->  Developer mode  ->  Load unpacked
#   ...and pick the cloned repo's extension/ folder

# 3. Visit claude.ai once. The menu bar popover updates within 60s.
open https://claude.ai/settings/usage`;

const verifyTerminal = [
  {
    type: "command" as const,
    text: "# Verify you grabbed the real ClaudeMeter, not a typosquat",
  },
  {
    type: "command" as const,
    text: "brew info --cask m13v/tap/claude-meter",
  },
  {
    type: "output" as const,
    text: "m13v/tap/claude-meter: stable 0.x.x",
  },
  {
    type: "output" as const,
    text: "https://github.com/m13v/claude-meter",
  },
  {
    type: "output" as const,
    text: "From: https://github.com/m13v/homebrew-tap/blob/HEAD/Casks/claude-meter.rb",
  },
  {
    type: "command" as const,
    text: "# The repo and the tap are both under the m13v account",
  },
  {
    type: "command" as const,
    text: "ls -la /Applications/ClaudeMeter.app/Contents/MacOS/",
  },
  {
    type: "output" as const,
    text: "claude-meter  ClaudeMeter",
  },
  {
    type: "success" as const,
    text: "Two binaries: the GUI app and a one-shot CLI you can pipe into Starship or tmux.",
  },
];

const proofChecklist = [
  {
    text: "Free. MIT license at github.com/m13v/claude-meter/blob/main/LICENSE.",
  },
  {
    text: "Open source. Rust core for the data fetch, SwiftUI for the menu bar, JavaScript for the browser extension. All three are in the same repo.",
  },
  {
    text: "No telemetry. The only outbound network traffic is to claude.ai itself, once per minute, with your own session cookies.",
  },
  {
    text: "Server-truth quota numbers. The three endpoints under claude.ai/api/organizations/{org_uuid}/ are the same source the Settings page renders from, so the percents match.",
  },
  {
    text: "Two install routes. The browser extension (no keychain prompt) or the keychain cookie decrypt (no extension to load). Pick either; both end at the same JSON.",
  },
  {
    text: "Includes Extra Usage dollars. The /overage_spend_limit endpoint is polled on the same interval, so you see what April 2026 metered billing has charged you so far.",
  },
];

const spellingRows = [
  {
    feature: "ClaudeMeter (one word, camel case)",
    ours: "The in-product display name. What the .app bundle is called and what the website hero shows.",
    competitor: "Same product",
  },
  {
    feature: "claude-meter (lowercase, hyphen)",
    ours: "The repo name, the Homebrew cask name, the domain claude-meter.com. Lowercase-with-hyphens is the convention for package and DNS namespaces.",
    competitor: "Same product",
  },
  {
    feature: "claude meter (two words, space)",
    ours: "Natural-language spelling. Lands the same Google result. There is no separate product.",
    competitor: "Same product",
  },
  {
    feature: "claudemeter (one word, lowercase)",
    ours: "Common in tweets and URLs. The brand_terms list in the site config explicitly recognizes it.",
    competitor: "Same product",
  },
  {
    feature: "clawdmeter, cloudmeter, clauwdmeter",
    ours: "Phonetic misspellings. Real impressions in Search Console. Same product, just misspelled.",
    competitor: "Same product, misspelled",
  },
  {
    feature: "claudmeter (missing the 'e')",
    ours: "Common autocomplete trip-up. Same product.",
    competitor: "Same product, misspelled",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-usage-server-truth",
    title: "Server-truth vs local-log: which quota the rate limiter actually checks",
    excerpt:
      "ccusage and Claude-Code-Usage-Monitor count tokens from local JSONL logs. ClaudeMeter reads the server's percent. The number that 429s you is the server one.",
    tag: "Mental model",
  },
  {
    href: "/t/claude-usage-monitoring-app-for-mac",
    title: "How the Mac cookie pipeline actually works",
    excerpt:
      "PBKDF2-saltysalt-1003, AES-128-CBC, and the localhost bridge fallback. The exact path from your browser profile to the menu bar number.",
    tag: "Deep dive",
  },
  {
    href: "/t/claude-usage-tracker-gone",
    title: "Three failure modes when the Plan Usage card disappears",
    excerpt:
      "The endpoints are still up when the Settings page goes blank. Here is which broke, and how an external tracker keeps reading.",
    tag: "Troubleshooting",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Clawdmeter: you meant ClaudeMeter (the free Claude plan usage tracker)",
  description:
    "'Clawdmeter' is a misspelling of ClaudeMeter, a free open-source macOS menu bar app and browser extension that shows live Claude Pro and Max plan usage. One brew command installs it. The repo is at github.com/m13v/claude-meter.",
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "ClaudeMeter",
  publisherUrl: "https://claude-meter.com",
  articleType: "TechArticle",
});

const breadcrumbJsonLd = breadcrumbListSchema(
  breadcrumbs.map((b) => ({ name: b.name, url: b.url })),
);

const faqJsonLd = faqPageSchema(faqs);

export default function ClawdmeterPage() {
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
          You typed{" "}
          <span className="line-through text-zinc-400 font-normal">clawdmeter</span>
          .{" "}
          <GradientText>You meant ClaudeMeter.</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Same product, just spelled the way it sounds. ClaudeMeter is the
          free, open-source macOS menu bar app and browser extension that
          shows your live Claude Pro or Max plan usage. One brew command,
          numbers match the Settings page, no telemetry, MIT license. Below
          is how to install the thing you were actually looking for, and the
          anchor facts you can use to confirm you reached the real project
          and not a typosquat.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="6 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <GlowCard>
          <div className="p-8 sm:p-10">
            <div className="text-xs uppercase tracking-[0.18em] text-teal-700 font-semibold mb-3">
              Direct answer (verified 2026-05-13)
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
              Yes. &ldquo;Clawdmeter&rdquo; is a misspelling of ClaudeMeter.
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-5">
              ClaudeMeter is a free open-source macOS menu bar app + browser
              extension that shows your live Claude Pro and Max plan usage
              (rolling 5-hour, weekly all-models, weekly Opus, and Extra
              Usage dollars). Authoritative source:{" "}
              <a
                href="https://github.com/m13v/claude-meter"
                className="text-teal-700 underline hover:text-teal-800"
              >
                github.com/m13v/claude-meter
              </a>
              . Install:
            </p>
            <div className="rounded-lg bg-zinc-900 text-zinc-100 font-mono text-sm px-5 py-4 overflow-x-auto">
              brew install --cask m13v/tap/claude-meter
            </div>
            <p className="text-sm text-zinc-500 mt-4 leading-relaxed">
              No keychain prompt if you also load the browser extension. No
              cookie paste. No API key. The menu bar number is the same
              number the Settings page shows you.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          The three lines that install the real thing
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6 max-w-3xl">
          Copy these three steps. The first installs the menu bar app and a
          CLI. The second loads the browser extension once so you skip the
          keychain prompt. The third confirms it works by triggering a first
          read of your usage.
        </p>
        <AnimatedCodeBlock
          code={installCode}
          language="bash"
          filename="install.sh"
          typingSpeed={6}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Verify you got the real ClaudeMeter
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6 max-w-3xl">
          The brew cask resolves to a release artifact under the m13v GitHub
          account, the same account that owns the source repo. Two binaries
          land inside the app bundle: the GUI app named{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            ClaudeMeter
          </code>{" "}
          and a CLI named{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            claude-meter
          </code>
          .
        </p>
        <TerminalOutput lines={verifyTerminal} title="terminal" />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          What you actually get
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6 max-w-3xl">
          The product is small on purpose. One menu bar app, one extension,
          one CLI. No login, no account, no settings sync. The whole point is
          to show three numbers honestly, fast, on the same machine where the
          data already lives.
        </p>
        <AnimatedChecklist
          title="What ClaudeMeter ships with"
          items={proofChecklist}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <ProofBanner
          quote="The extension fetches your usage from claude.ai with your already-logged-in cookies and POSTs each snapshot to http://127.0.0.1:63762/snapshots on the menu bar app. Two lines in the source: extension/background.js:2 and extension/manifest.json:9."
          metric="127.0.0.1:63762"
          source="m13v/claude-meter, extension/background.js"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Why the percents match the Settings page exactly
        </h2>
        <p className="text-zinc-700 leading-relaxed max-w-3xl">
          The Rust HTTP client in{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            src/api.rs
          </code>{" "}
          uses the{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            rquest
          </code>{" "}
          crate with{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            Emulation::Chrome131
          </code>
          , so the TLS fingerprint and header set match what Cloudflare expects
          from a real claude.ai page load. The{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            Referer
          </code>{" "}
          header is set to{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            https://claude.ai/settings/usage
          </code>
          . The three URLs it hits are hardcoded in the same file:{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            /usage
          </code>
          ,{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            /overage_spend_limit
          </code>
          , and{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            /subscription_details
          </code>
          . The response is byte-for-byte the same JSON the Settings page
          would have parsed, which is why the percents match exactly when both
          are working.
        </p>
        <p className="text-zinc-700 leading-relaxed mt-5 max-w-3xl">
          Local-log tools like ccusage and Claude-Code-Usage-Monitor read a
          completely different source (the JSONL files Claude Code writes
          under{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            ~/.claude/projects/
          </code>
          ). Their numbers are useful for per-project cost accounting but do
          not match the server quota the rate limiter actually enforces. The
          percent that produces a 429 is the ClaudeMeter one.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
          Spellings that all point at the same project
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6 max-w-3xl">
          The brand has a few legitimate forms (case, hyphenation, spacing)
          and a handful of common misspellings that Search Console still
          shows impressions for. None of them are separate projects.
        </p>
        <ComparisonTable
          productName="What it is"
          competitorName="Status"
          rows={spellingRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <FaqSection
          heading="Questions a clawdmeter searcher actually has"
          items={faqs}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16 mb-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          section="guide-footer-clawdmeter"
          heading="Stuck on the install, or your numbers do not match the Settings page?"
          description="15 minutes with the maintainer. Bring your browser, your shell, and your most recent rate-limit error."
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-20">
        <RelatedPostsGrid
          title="If you got here by accident, you might want these"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        section="guide-sticky-clawdmeter"
        description="Numbers off? 15 min with the maintainer."
      />
    </article>
  );
}
