import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  ComparisonTable,
  AnimatedChecklist,
  StepTimeline,
  GlowCard,
  GradientText,
  ShimmerButton,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-usage-monitoring-app-for-mac";
const PUBLISHED = "2026-04-28";

export const metadata: Metadata = {
  title:
    "Claude usage monitoring app for Mac: the cookie pipeline most apps skip explaining",
  description:
    "Most Mac apps that read claude.ai usage make you paste a session cookie, log in inside an embedded browser, or hand them an Anthropic API key (which cannot see plan quota). ClaudeMeter takes none of those paths. Here is the Mac-native pipeline: PBKDF2-saltysalt-1003 against the browser Safe Storage Keychain entry, AES-128-CBC, and the localhost bridge fallback on port 63762.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude usage monitoring app for Mac: the cookie pipeline most apps skip explaining",
    description:
      "How a usage monitor reads your live claude.ai session on macOS without a paste, an embedded browser, or an API key. With the exact crypto and the localhost bridge fallback.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Why does it matter how a Mac usage monitor authenticates?",
    a: "Because the way it gets your claude.ai session decides what you have to do, what it can see, and what it can break. Manual paste means re-pasting whenever the cookie rotates and copying a value that grants full access to your account. An embedded WebKit browser means signing in twice (once in your real browser, once in the app). An Anthropic API key only grants visibility into API console spend, which has nothing to do with your Pro or Max plan quota. None of those map cleanly to 'whatever the claude.ai/settings/usage page is showing right now in my real browser'. The cookie-decrypt path does, because it is reading the same cookie the page is using.",
  },
  {
    q: "Does it ever pop the macOS Keychain prompt?",
    a: "Chrome's Safe Storage entry has an ACL that already trusts /usr/bin/security, so calling /usr/bin/security find-generic-password -wa Chrome -s 'Chrome Safe Storage' returns the password silently. Arc, Brave, and Edge prompt once on first run because their Safe Storage ACLs do not list the security binary by default. After clicking Always Allow once, the same path runs without a prompt. ClaudeMeter shells out to security on purpose, see src/keychain.rs lines 11 to 19, because reaching into the Keychain via the Security framework would always prompt.",
  },
  {
    q: "What happens if the cookie-decrypt path breaks?",
    a: "The browser extension runs as a fallback. extension/background.js sets BRIDGE = 'http://127.0.0.1:63762/snapshots' and POSTs a fresh snapshot to that URL every 60 seconds, using fetch with credentials: 'include' so the request carries your live claude.ai cookies the way any other claude.ai page request does. The menu bar app reads the bridge instead of decrypting cookies. The two paths are independent. If the next Chrome release rotates the cookie format again, you switch to the extension path with no reinstall.",
  },
  {
    q: "Why does PBKDF2 use 1003 iterations and not a round number?",
    a: "Chromium picked 1003 a long time ago and never changed it. The salt is the literal ASCII string 'saltysalt' and the IV is 16 bytes of ASCII space. AES-128-CBC, PKCS7 padding. ClaudeMeter mirrors all of those constants in src/cookies.rs lines 142 to 146 because Chrome, Arc, Brave, and Edge all inherit them. If Anthropic shipped its own desktop browser tomorrow with the same Safe Storage scheme, it would slot into Browser::ALL with one entry and the rest of the pipeline would just work.",
  },
  {
    q: "What is the 32-byte SHA-256 prefix that the code strips?",
    a: "Chrome v20 (October 2024) started prepending 32 bytes of SHA-256(host_key) to every cookie plaintext as a binding to the host. The plaintext you decrypt now looks like 32 bytes of opaque binary then your real cookie value. ClaudeMeter detects it heuristically: if byte 0 is non-printable but byte 32 is printable ASCII, strip the first 32 bytes. See src/cookies.rs lines 168 to 176. That one branch is the difference between working with cookies set last week and breaking on cookies set after the v20 rollout.",
  },
  {
    q: "Does it work with Safari?",
    a: "No. Safari stores cookies in a Binary Property List under ~/Library/Cookies, not in a SQLite database with Chromium-style v10 encryption. The same pipeline does not apply. ClaudeMeter's Browser enum only lists Chrome, Arc, Brave, and Edge, see src/browser.rs lines 12 to 18. If you only use Safari, the menu bar app cannot read your session and there is no extension you can load. Open claude.ai in any Chromium browser to give it a session to work from.",
  },
  {
    q: "How does this compare with the other Mac apps that show Claude usage?",
    a: "ClaudeUsageBar asks for a manual paste of the full Cookie header from DevTools. Hamed Elfayome's tracker offers paste, an embedded WebKit sign-in window, or detection of a logged-in Claude Code CLI account. ClaudeUsageTracker by masorange and a couple of others only support an Anthropic API key, which means they can see api.anthropic.com console spend but cannot read /api/organizations/{org}/usage and therefore cannot show the same percent claude.ai/settings/usage shows. SessionWatcher reads local Claude Code logs only, no server endpoint at all. ClaudeMeter is the one that piggybacks on whichever Chromium browser you already had logged in, with the extension as a fallback. None of the other docs explain the cookie pipeline because they do not use it.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "Claude usage monitoring app for Mac",
    url: PAGE_URL,
  },
];

const cookieDecryptCode = `// claude-meter/src/cookies.rs (lines 142-146)
fn derive_key(password: &[u8]) -> [u8; 16] {
    let mut key = [0u8; 16];
    pbkdf2::pbkdf2_hmac::<Sha1>(password, b"saltysalt", 1003, &mut key);
    key
}`;

const v20StripCode = `// claude-meter/src/cookies.rs (lines 168-176)
// Chrome v20+ (Oct 2024+) prepends SHA256(host_key) = 32 bytes
// of opaque binary to the cookie plaintext. Strip it if present.
let bytes: &[u8] = if plaintext.len() > 32
    && !is_printable(plaintext[0])
    && is_printable(plaintext[32])
{
    &plaintext[32..]
} else {
    plaintext
};`;

const keychainShellCode = `// claude-meter/src/keychain.rs (lines 11-19)
// Shell out to /usr/bin/security rather than calling the Keychain
// API directly. Chrome's Safe Storage item ACL already trusts
// /usr/bin/security, so Chrome skips the per-app approval dialog.
let out = std::process::Command::new("/usr/bin/security")
    .args([
        "find-generic-password",
        "-wa", browser.keychain_account(),
        "-s", browser.keychain_service(),
    ])
    .output()?;`;

const bridgeCode = `// claude-meter/extension/background.js (lines 1-3)
const BASE = "https://claude.ai";
const BRIDGE = "http://127.0.0.1:63762/snapshots";
const POLL_MINUTES = 1;`;

const reproTerminal = [
  {
    type: "command" as const,
    text: "# 1) Confirm Chrome already trusts /usr/bin/security for its Safe Storage entry",
  },
  {
    type: "command" as const,
    text: "/usr/bin/security find-generic-password -wa Chrome -s 'Chrome Safe Storage' | wc -c",
  },
  { type: "output" as const, text: "      17" },
  {
    type: "command" as const,
    text: "# 2) The cookies database lives where Chrome puts it, no special copy step needed",
  },
  {
    type: "command" as const,
    text: "ls -lh ~/Library/Application\\ Support/Google/Chrome/Default/Network/Cookies",
  },
  {
    type: "output" as const,
    text: "-rw-------  1 you  staff   816K Apr 28 09:41 Cookies",
  },
  {
    type: "command" as const,
    text: "# 3) Run the menu bar app's CLI: it reads Keychain + cookies, hits /api/organizations/{org}/usage, prints",
  },
  { type: "command" as const, text: "claude-meter" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: "claude-meter" },
  { type: "output" as const, text: "============" },
  {
    type: "output" as const,
    text: "5-hour            42.0% used    -> resets Mon Apr 28 22:14 (in 2h 47m)",
  },
  {
    type: "output" as const,
    text: "7-day all         78.0% used    -> resets Sun May 3 09:02 (in 5d 18h)",
  },
  {
    type: "output" as const,
    text: "7-day Opus        91.0% used    -> resets Sun May 3 09:02 (in 5d 18h)",
  },
  {
    type: "output" as const,
    text: "Extra usage       $12.49 / $50.00 (25%)",
  },
  { type: "output" as const, text: "" },
  {
    type: "output" as const,
    text: "fetched 2026-04-28 09:41:18 PDT   you@example.com via Chrome",
  },
  {
    type: "success" as const,
    text: "Same numbers claude.ai/settings/usage shows. No cookie pasted. No new login.",
  },
];

const profilePathsCode = `// claude-meter/src/browser.rs (lines 51-56)
let root = match self {
    Browser::Chrome => app_support.join("Google/Chrome"),
    Browser::Arc    => app_support.join("Arc/User Data"),
    Browser::Brave  => app_support.join("BraveSoftware/Brave-Browser"),
    Browser::Edge   => app_support.join("Microsoft Edge"),
};`;

const installSteps = [
  {
    title: "brew install --cask m13v/tap/claude-meter",
    description:
      "Drops a signed, notarized ClaudeMeter.app into /Applications and a claude-meter binary alongside. The cask is a thin shell over the GitHub release. macOS 12+ for the SwiftUI menu bar surface; the Rust core builds back to 10.13 if you prefer to compile from source.",
  },
  {
    title: "Launch ClaudeMeter once",
    description:
      "The C| icon appears in the menu bar. On first launch it walks the four supported browsers (Chrome, Arc, Brave, Edge) under ~/Library/Application Support and skips the ones not installed. For the ones that are installed, it asks /usr/bin/security for the Safe Storage password.",
  },
  {
    title: "Approve the Keychain prompt (Arc/Brave/Edge only)",
    description:
      "Chrome's Safe Storage ACL already lists /usr/bin/security, so it does not prompt. Arc, Brave, and Edge prompt the very first time. Click Always Allow. The prompt does not come back. If you only use Chrome, you will not see this step at all.",
  },
  {
    title: "Visit claude.ai once in any of those browsers",
    description:
      "If you were not already logged in, log in. The browser writes a sessionKey cookie to its Cookies SQLite database. Within a minute the menu bar reads that cookie, hits /api/organizations/{your-org}/usage, and the percents start ticking.",
  },
  {
    title: "Optional: load the unpacked extension",
    description:
      "If you would rather skip the cookie-decrypt path entirely, load extension/ from the cloned repo into the same browser. The extension calls fetch with credentials: 'include' on the same endpoints and POSTs the JSON to http://127.0.0.1:63762/snapshots every minute. The menu bar reads from the bridge instead.",
  },
];

const sequenceActors = [
  "ClaudeMeter",
  "/usr/bin/security",
  "Cookies SQLite",
  "claude.ai",
  "Menu bar",
];
const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "find-generic-password Chrome Safe Storage",
    type: "request" as const,
  },
  { from: 1, to: 0, label: "17-byte password", type: "response" as const },
  { from: 0, to: 0, label: "PBKDF2-saltysalt-1003 -> AES-128 key", type: "event" as const },
  {
    from: 0,
    to: 2,
    label: "open ~/Library/.../Default/Cookies (RO copy)",
    type: "request" as const,
  },
  {
    from: 2,
    to: 0,
    label: "encrypted_value rows for claude.ai",
    type: "response" as const,
  },
  {
    from: 0,
    to: 0,
    label: "AES-128-CBC decrypt, strip 32-byte v20 prefix",
    type: "event" as const,
  },
  {
    from: 0,
    to: 3,
    label: "GET /api/organizations/{org}/usage with cookie header",
    type: "request" as const,
  },
  {
    from: 3,
    to: 0,
    label: "five_hour, seven_day, seven_day_opus floats",
    type: "response" as const,
  },
  { from: 0, to: 4, label: "render percents", type: "event" as const },
];

const otherAppsRows = [
  {
    feature: "How it gets the session",
    ours:
      "Decrypts cookies from your existing Chromium profile, or extension forwards them",
    competitor:
      "Manual cookie paste, embedded WebKit sign-in, or Anthropic API key",
  },
  {
    feature: "What you have to do on first run",
    ours: "brew install, click Always Allow once for Arc/Brave/Edge, done",
    competitor:
      "Open DevTools, copy Cookie header, paste into a text field; or sign in inside the app",
  },
  {
    feature: "What happens when the cookie rotates",
    ours: "Nothing. The next decrypt picks up the new value automatically",
    competitor:
      "Re-paste, or re-sign-in inside the embedded browser, every few weeks",
  },
  {
    feature: "Plan quota visibility (5-hour, weekly, Opus)",
    ours:
      "Yes, reads /api/organizations/{org}/usage directly (same as the Settings page)",
    competitor:
      "API-key tools cannot see plan quota at all (different endpoint scope)",
  },
  {
    feature: "Browsers supported",
    ours: "Chrome, Arc, Brave, Edge (any one logged into claude.ai)",
    competitor:
      "Whichever browser you happen to paste from, one at a time",
  },
  {
    feature: "Multi-browser, multi-account",
    ours:
      "Walks all four browsers, dedupes by account email, labels each snapshot by source browser",
    competitor: "One cookie at a time",
  },
  {
    feature: "Source code",
    ours: "MIT, Rust + SwiftUI, full crypto path on github.com/m13v/claude-meter",
    competitor: "Mostly open source; cookie pipeline rarely documented",
  },
];

const checklistItems = [
  {
    text: "Browsers checked: Chrome, Arc, Brave, Edge. Browser::ALL has four entries; adding a fifth is a one-line change in src/browser.rs.",
  },
  {
    text: "Profiles walked: Default, plus every directory whose name starts with 'Profile '. The first profile that has a claude.ai cookie wins. Side profiles do not require extra config.",
  },
  {
    text: "Keychain access path: /usr/bin/security find-generic-password, never the Security framework. This is the line that keeps Chrome silent and keeps Arc/Brave/Edge to one-time prompts.",
  },
  {
    text: "Crypto: PBKDF2-HMAC-SHA1, salt 'saltysalt', 1003 iterations, 16-byte key. AES-128-CBC, IV is sixteen ASCII space bytes. PKCS7 padding. All four browsers share these constants.",
  },
  {
    text: "Chrome v20 prefix: 32 bytes of SHA-256(host_key) prepended to the plaintext on cookies set after October 2024. Detected with a printable-byte heuristic and stripped before parsing.",
  },
  {
    text: "Endpoints called: /api/account (email, memberships), /api/organizations/{org}/usage (the percents), /api/organizations/{org}/overage_spend_limit (extra credits), /api/organizations/{org}/subscription_details (next charge).",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-usage-server-truth",
    title: "The server-truth quota the local-log tools cannot see",
    excerpt:
      "Why ccusage and Claude-Code-Usage-Monitor measure something different from claude.ai/settings/usage, and which one matches the 429.",
    tag: "Mental model",
  },
  {
    href: "/t/open-source-claude-usage-trackers-april-2026",
    title: "Open-source Claude usage trackers, April 2026",
    excerpt:
      "Side-by-side roundup of ClaudeUsageBar, hamed-elfayome, ccusage, lugia19, and ClaudeMeter, by surface and data source.",
    tag: "Compare",
  },
  {
    href: "/install",
    title: "Install ClaudeMeter on macOS in 60 seconds",
    excerpt:
      "One brew cask for the menu bar app, one unpacked extension if you want the bridge path. macOS 12+, all four Chromium browsers.",
    tag: "How to",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude usage monitoring app for Mac: the cookie pipeline most apps skip explaining",
  description:
    "Most Mac usage monitors require a cookie paste, an embedded browser sign-in, or an Anthropic API key. ClaudeMeter takes none of those paths. Here is the Mac-native cookie pipeline, the exact crypto, and the localhost bridge fallback.",
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

export default function ClaudeUsageMonitoringAppForMacPage() {
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
          The Mac-native cookie pipeline most usage monitors{" "}
          <GradientText>skip explaining</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Every Claude usage monitor for Mac has to answer the same
          question: how do you get my live claude.ai session without
          asking me to paste a cookie or sign in twice. Most of them
          punt: cookie paste, embedded WebKit, or an Anthropic API key
          that cannot see plan quota at all. ClaudeMeter takes a fourth
          path that nobody else seems to document, because it is
          specific to macOS and it leans on a chain of small Mac details
          that are not obvious. This is that chain.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="11 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The four authentication paths a Mac monitor can pick
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Take a quick survey of the apps you find when you go looking
          for a Claude usage monitor on macOS. ClaudeUsageBar wants you
          to copy your full Cookie header from DevTools and paste it
          into a text field. Hamed Elfayome&rsquo;s tracker offers
          paste, an embedded WebKit sign-in window, or detection of a
          logged-in Claude Code CLI account. ClaudeUsageTracker by
          masorange and a handful of similar tools want an Anthropic
          API key, which means they can see api.anthropic.com console
          spend but they cannot read /api/organizations/&#123;org&#125;/usage
          and so they cannot show the percents the Settings page is
          showing. SessionWatcher reads only your local Claude Code log
          files; the server endpoint never enters the picture.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          ClaudeMeter is the one with a fourth answer: the menu bar app
          reads the cookie that&rsquo;s already in your real Chromium
          browser&rsquo;s on-disk cookie store, decrypts it with the
          Safe Storage password from your Keychain, and uses it to call
          the same JSON endpoint the Settings page calls. There is no
          paste. There is no embedded browser. There is no API key. If
          that path fails for any reason, a small browser extension
          calls the same endpoint with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            credentials: &quot;include&quot;
          </code>{" "}
          and POSTs the JSON to a localhost bridge.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The reason no other app docs explain this pipeline is they do
          not use it. The pipeline is the differentiator and it lives
          entirely in macOS-specific details: the Keychain ACL on
          Chrome&rsquo;s Safe Storage entry, the on-disk path to the
          Cookies SQLite, the encryption scheme Chromium picked years
          ago and never changed, and a 32-byte prefix Chrome quietly
          added in October 2024.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          One run, end to end
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          What actually happens when the menu bar refreshes. No paste,
          no embedded browser, no API key in the loop.
        </p>
        <SequenceDiagram
          title="ClaudeMeter refresh path on macOS"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Step 1: ask /usr/bin/security for the browser&rsquo;s Safe Storage password
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Each Chromium browser stores a per-install random password in
          a macOS Keychain entry. Chrome calls the entry &ldquo;Chrome
          Safe Storage&rdquo;. Arc calls it &ldquo;Arc Safe
          Storage&rdquo;. Brave: &ldquo;Brave Safe Storage&rdquo;. Edge:
          &ldquo;Microsoft Edge Safe Storage&rdquo;. The password is the
          input to PBKDF2 that derives the cookie encryption key.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You can read it three ways: Security framework calls (always
          prompts), the Keychain Access app (manual click-through), or{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /usr/bin/security
          </code>
          . That last one is special. Chrome&rsquo;s Safe Storage entry
          ships with an ACL that explicitly lists /usr/bin/security as a
          trusted reader, so calling it returns the password without
          prompting. Arc, Brave, and Edge prompt once and then never
          again. ClaudeMeter shells out to security on purpose:
        </p>
        <AnimatedCodeBlock
          code={keychainShellCode}
          language="rust"
          filename="claude-meter/src/keychain.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The trade-off is a process spawn per browser per refresh. The
          payoff is one of the smoothest first-run experiences on macOS
          in this category. If you only use Chrome, you do not see a
          single Keychain prompt for the entire lifetime of the
          install.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Step 2: PBKDF2-saltysalt-1003 derives a 16-byte AES key
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          This is the part where the implementation gets specific in a
          way no other monitor seems to write down. Chromium derives the
          cookie key from the Safe Storage password using PBKDF2 with
          three constants that have not changed in years:
        </p>
        <AnimatedCodeBlock
          code={cookieDecryptCode}
          language="rust"
          filename="claude-meter/src/cookies.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The salt is the literal ASCII string{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            saltysalt
          </code>
          . The iteration count is 1003, not 1000 or 1024. The HMAC is
          SHA-1. The output is 16 bytes, used as an AES-128 key. The
          IV for CBC mode is sixteen ASCII spaces. PKCS7 padding. Those
          numbers come straight out of the Chromium source and apply to
          every Chromium browser shipped on macOS.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          You will not see those constants printed in any other
          Mac-usage-monitor README, because the apps that do not use
          this path do not need them. ClaudeMeter prints them in the
          source as one function so the next time Chromium changes
          one (1003 to 1004, SHA-1 to SHA-256, whatever it is), the
          patch is one file.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Step 3: read the Cookies SQLite, decrypt the rows that match claude.ai
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Each Chromium browser keeps cookies in a SQLite database
          under macOS Application Support. The path varies by vendor
          but the schema does not:
        </p>
        <AnimatedCodeBlock
          code={profilePathsCode}
          language="rust"
          filename="claude-meter/src/browser.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Inside each profile, look for{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Network/Cookies
          </code>{" "}
          first (newer Chromium), falling back to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Cookies
          </code>{" "}
          (older). ClaudeMeter copies the database to a temp file before
          opening it, so a live browser never sees a contended
          read-write handle and ClaudeMeter never sees a half-written
          row. Then a single query:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            SELECT name, encrypted_value FROM cookies WHERE host_key
            LIKE &lsquo;%claude.ai%&rsquo;
          </code>
          . Each row&rsquo;s encrypted_value starts with a three-byte
          version tag (v10 or v11), which gets stripped, then the rest
          is AES-128-CBC ciphertext you decrypt with the key from step
          2.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Step 4: strip the 32-byte SHA-256 prefix Chrome v20 added in October 2024
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          This is the step that broke a lot of older cookie-decrypt
          tools. Chrome v20+ prepends 32 bytes of SHA-256(host_key) to
          every cookie plaintext as a binding to the host. After
          decryption, the first 32 bytes of plaintext are opaque binary
          and the actual cookie value starts at byte 32. If you do not
          strip it, the cookie value is garbage and claude.ai
          immediately 401s your refresh.
        </p>
        <AnimatedCodeBlock
          code={v20StripCode}
          language="rust"
          filename="claude-meter/src/cookies.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The detection is a heuristic and it is honest about being
          one. If byte 0 is non-printable but byte 32 is printable
          ASCII, assume the prefix is there and strip it. Cookies
          written before the v20 rollout in October 2024 still decrypt
          to a printable byte 0 and skip the strip. New cookies written
          in 2025 and beyond have the prefix and need it removed. Both
          cases are handled by the same six lines.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Step 5: call /api/organizations/&#123;org&#125;/usage with the cookie header
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          With the cookie map in hand, the rest of the pipeline is what
          you would write in any HTTP client. Build a Cookie header
          from the decrypted name/value pairs, set the Referer to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            https://claude.ai/settings/usage
          </code>
          , send a GET to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>
          . The response has the same shape the Settings page itself
          fetches, because it is the same response. Parse five_hour,
          seven_day, seven_day_opus, extra_usage. Render each one as a
          percent in the menu bar.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The Rust client uses{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            rquest
          </code>{" "}
          with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Emulation::Chrome131
          </code>{" "}
          so the TLS fingerprint and header set match a real Chrome
          request. That matters because Cloudflare in front of
          claude.ai blocks anything that looks like a generic curl. The
          request that the menu bar makes is, byte for byte, the
          request your browser would make if you opened the Settings
          page yourself.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The whole install, end to end
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The pipeline above is invisible to the user. From the
          install side, this is what you actually do:
        </p>
        <StepTimeline steps={installSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproducing the read yourself in three commands
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not have to take any of this on faith. Three shell
          commands walk the entire pipeline from outside the app:
        </p>
        <TerminalOutput
          title="claude-meter --json equivalent, in three steps"
          lines={reproTerminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The point of this section is not the percents. It is that
          every step is a Mac thing you can already do with bundled
          tools. The menu bar app is one process glued to a chain of
          steps macOS already supports.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The fallback: a localhost bridge on port 63762
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The cookie-decrypt path covers the common case. It does not
          cover everything. Chromium has rotated the encryption scheme
          three times in the last six years; the next rotation could
          break this pipeline overnight. ClaudeMeter ships a second
          path that does not depend on any of the crypto above:
        </p>
        <AnimatedCodeBlock
          code={bridgeCode}
          language="javascript"
          filename="claude-meter/extension/background.js"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The browser extension runs in the same browser session you
          are already logged into. It calls the same{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/account
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          endpoints with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            credentials: &quot;include&quot;
          </code>
          , same as any other claude.ai page would, and POSTs the JSON
          response to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            http://127.0.0.1:63762/snapshots
          </code>
          . The menu bar app listens on that loopback port and renders
          whatever the bridge sends.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The two paths are independent. If the cookie-decrypt code
          breaks tomorrow, you load the unpacked extension and
          everything else keeps working. If you do not want to load an
          extension, the cookie-decrypt path is enough. The bridge port
          (63762) is on the loopback interface only; nothing on your
          network can reach it.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Every detail in the pipeline, one place
        </h2>
        <AnimatedChecklist
          title="What ClaudeMeter actually does on macOS"
          items={checklistItems}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          ClaudeMeter vs other Mac usage monitors
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The differences come from how each app gets your session, not
          from how each app renders the percent. The percent is the
          same number in every monitor that reads the right endpoint.
        </p>
        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="Other Mac monitors"
          rows={otherAppsRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the menu bar actually shows once it is wired up
        </h2>
        <GlowCard>
          <div className="p-2">
            <p className="text-zinc-700 leading-relaxed text-lg">
              Once the cookie pipeline (or the bridge) is feeding it,
              the popover lists every bucket the API returns: 5-hour
              window, 7-day all-models, 7-day Opus, optional 7-day
              Sonnet, and extra-usage credits if you have metered
              billing on. Each row has a percent and a human-readable
              countdown to the next reset. A typical render:
            </p>
            <pre className="text-sm font-mono text-zinc-900 leading-relaxed mt-6 p-4 bg-zinc-50 rounded-lg overflow-x-auto">
{`5-hour            42% used    -> resets Mon Apr 28 22:14 (in 2h 47m)
7-day all         78% used    -> resets Sun May 3 09:02 (in 5d 18h)
7-day Opus        91% used    -> resets Sun May 3 09:02 (in 5d 18h)
Extra usage       $12.49 / $50.00 (25%)
fetched 2026-04-28 09:41:18 PDT   you@example.com via Chrome`}
            </pre>
            <p className="text-zinc-700 leading-relaxed text-lg mt-6">
              The line at the bottom names the source browser, because
              if you are logged into work and personal accounts in
              different browsers ClaudeMeter walks all four and renders
              one block per account. The dedupe key is the email from{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
                /api/account
              </code>
              , so the same account opened in two browsers shows up
              once with both browsers listed. None of that requires any
              extra config.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The honest caveats
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The endpoint at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>{" "}
          is internal and undocumented. Field names have been stable
          for many months but Anthropic could rename or remove any of
          them in any release. The cookie-decrypt path depends on
          Chromium not changing the Safe Storage scheme; it has held
          for years but a new Chrome version could ship with a
          different KDF or a different prefix and break this pipeline
          overnight. That is exactly why the bridge path exists as a
          fallback.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          Safari is not supported. Safari stores cookies in a Binary
          Property List under{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/Library/Cookies
          </code>
          , not in a SQLite database with v10/v11 encryption. Different
          format, different keychain story, different decision. If you
          are a Safari-only user, neither path works for you today and
          the menu bar will sit empty.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          And yes, every part of this is a side-effect of reading
          cookies your browser already wrote on your machine. If you
          would rather a monitor never touched a cookie file, the
          extension-only mode is the right pick: load the extension,
          skip the cookie-decrypt path entirely, and let the bridge be
          the only data source.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Where this fits, and where it does not
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          ClaudeMeter is a Mac usage monitor for people who want their
          plan quota in the menu bar and do not want a paste workflow.
          It is not the right pick if you only have an Anthropic API
          key and no plan subscription, because there is no plan to
          meter. It is not the right pick if you only use Safari. It
          is not a per-project local-token attribution tool; for that,
          ccusage and Claude-Code-Usage-Monitor are the right shape.
          They read{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ~/.claude/projects
          </code>{" "}
          JSONL logs, which is a different data source from the server
          quota.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          For seeing the exact percent the rate limiter is comparing
          against, on a Mac, in your menu bar, without a paste, this is
          the path. The implementation is open and small enough that
          the entire cookie pipeline fits in one file.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Put the percent in your menu bar
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          One brew cask. One optional unpacked extension. Reads the
          same JSON the Settings page reads. No cookie paste, no new
          login. macOS 12+ on Chrome, Arc, Brave, or Edge.
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
          heading="Cookie-decrypt path failing on a browser variant?"
          description="If your install lands on a Chromium fork with a different Safe Storage layout, send the failing path. We add browsers when we see them."
          text="Book a 15-minute call"
          section="mac-cookie-pipeline-footer"
          site="claude-meter"
        />
      </div>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Questions on the Mac cookie pipeline? 15 min."
        section="mac-cookie-pipeline-sticky"
        site="claude-meter"
      />
    </article>
  );
}
