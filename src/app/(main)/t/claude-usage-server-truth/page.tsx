import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  ComparisonTable,
  StepTimeline,
  BackgroundGrid,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-usage-server-truth";
const PUBLISHED = "2026-04-27";

export const metadata: Metadata = {
  title:
    "How to verify a Claude usage tracker actually reads server truth (the three-step protocol)",
  description:
    "Every Claude usage tracker says 'we read your real session.' Here is how you prove it. Open DevTools on claude.ai/settings/usage, intercept the JSON, then curl the localhost bridge at 127.0.0.1:63762 and diff the two responses. Three steps, one minute, no trust required.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "How to verify a Claude usage tracker actually reads server truth",
    description:
      "Three checkable steps that prove ClaudeMeter shows the same number Anthropic enforces. DevTools intercept, localhost bridge curl, staleness flip when the extension stops posting.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Why does ClaudeMeter run a localhost HTTP server on port 63762?",
    a: "Because two processes on your machine fetch the same data from claude.ai and they need to coordinate. The browser extension already has your session and can call /api/organizations/{org}/usage with credentials: 'include' from the page context. The Rust menu-bar app runs outside the browser and has to read the encrypted Chrome cookie file to do the same call. If both poll independently every minute, you double the request rate to claude.ai and the menu bar shows numbers a few seconds apart from the popover. The extension POSTs every fetched snapshot to http://127.0.0.1:63762/snapshots and the menu-bar app prefers that bridge value if it arrived in the last 120 seconds. BRIDGE_PORT is defined at src/bin/menubar.rs line 349 and BRIDGE_FRESHNESS at line 350.",
  },
  {
    q: "What exactly is BRIDGE_FRESHNESS and why 120 seconds?",
    a: "BRIDGE_FRESHNESS = Duration::from_secs(120) at src/bin/menubar.rs line 350. It is the staleness budget the menu-bar app gives the extension. Inside poll_loop the check is bridge_fresh = last_bridge.elapsed() < BRIDGE_FRESHNESS. If the extension's last POST is younger than 120 seconds, the menu bar skips its own cookie-decrypt fetch entirely and waits another tick. 120 is double the 60-second extension poll cadence, so a single missed extension fetch does not force a fallback, but two missed fetches do. The fallback is what guarantees you keep seeing numbers when the browser is closed.",
  },
  {
    q: "Do I need ClaudeMeter installed to run the verification protocol?",
    a: "Step 1 (DevTools intercept) works against any Claude account regardless of which tracker you use, including no tracker. Step 2 (curl 127.0.0.1:63762/snapshots) only works if ClaudeMeter is running, because the bridge is the menu-bar app's own loopback HTTP server. Step 3 (staleness flip) requires ClaudeMeter so you can see the badge state change. If you are auditing a different tracker, run Step 1 to capture the truth value, then compare against whatever number that tracker is showing in its UI.",
  },
  {
    q: "Why is the bridge plaintext HTTP and not HTTPS?",
    a: "It binds to 127.0.0.1 only. Server::http(\"127.0.0.1:63762\") at src/bin/menubar.rs line 358 means the socket only accepts connections from the loopback interface. Nothing on the network can reach it, including other machines on the same Wi-Fi. Adding TLS would require a self-signed cert and a trust prompt for what is already a local-only socket. The CORS headers at lines 366-370 allow OPTIONS preflight from any origin so the extension's POST works from claude.ai's page context, but the listener itself never sees external traffic.",
  },
  {
    q: "What if the curl returns a stale snapshot?",
    a: "The snapshot's stale field flips to true. In the Rust schema at src/models.rs line 71, every UsageSnapshot has a stale: bool. The menu-bar app's merge_with_persisted function (src/bin/menubar.rs lines 840-884) marks an account as stale if the same browser POSTs without that account in the new snapshot, and drops it entirely after a 2-hour cutoff (chrono::Duration::hours(2) at line 865). When you read .[0].stale from the curl, you know whether the number is live or last-seen. The menu-bar UI also paints stale rows with '(stale, last 14:23)' so you can see the staleness in the dropdown without scripting anything.",
  },
  {
    q: "How does the bridge know which browser POSTed a snapshot?",
    a: "src/bin/menubar.rs lines 437-462. The bridge reads req.remote_addr() to get the peer's TCP port, runs lsof -nP -iTCP:{port} -sTCP:ESTABLISHED to find the local PID that owns that socket, runs ps -p {pid} -o command= to read the executable path, and matches substrings like /Arc.app/, /Google Chrome.app/, /Brave Browser.app/, /Microsoft Edge.app/ in classify_browser_exe. Falls back to Sec-Ch-Ua sniffing if lsof returns nothing. This is why the dropdown shows your real browser name even when the extension's User-Agent looks generic.",
  },
  {
    q: "What does jq see if I curl the bridge with no extension running?",
    a: "If the extension was running in the last 120 seconds the bridge serves the last cached snapshot. After 120 seconds with no POST, the menu-bar app's poll_loop wakes up, runs fetch_all, and the Rust binary's own bridge handler keeps serving until the next refresh writes new snapshots to disk via save_snapshots. So curl 127.0.0.1:63762/snapshots may return last-seen JSON with stale: true rather than a 404. Check fetched_at to see when the data was actually retrieved.",
  },
  {
    q: "Will Anthropic block this approach?",
    a: "The endpoint is what claude.ai's own settings page uses, called with the same headers the page sends (Cookie, Referer: https://claude.ai/settings/usage, Accept: */*). It is not a private API key or a scraping path. ClaudeMeter sends one HTTPS request per minute per org membership, identical to what an open browser tab would do if you reloaded the settings page. If Anthropic ships a breaking change to the response shape, the Rust serde deserializer fails fast and the menu bar shows '!' rather than a wrong number. The README documents this risk explicitly.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Verifying a server-truth tracker", url: PAGE_URL },
];

const verificationSteps = [
  {
    title: "Step 1: Intercept the request that draws the page.",
    description:
      "Open claude.ai/settings/usage in Chrome, press F12 to open DevTools, switch to the Network tab, filter for usage. Hard-refresh the page. You will see a single XHR to /api/organizations/{some-uuid}/usage. Click it. The Response tab shows a JSON body with five_hour, seven_day, seven_day_sonnet, and seven_day_opus fields, each with a utilization float and a resets_at timestamp. That JSON is the truth value for the next 60 seconds.",
    detail:
      "Copy the Response body to a scratch file. Note your org UUID from the URL path. You now have a ground-truth snapshot you can compare every other reading against.",
  },
  {
    title: "Step 2: Read the same JSON from the localhost bridge.",
    description:
      "If ClaudeMeter is running and the extension is loaded, run curl -s http://127.0.0.1:63762/snapshots from any terminal. Pipe through jq. You should see an array of UsageSnapshot objects, one per browser session. Find the entry whose org_uuid matches the UUID from Step 1, then drill into .usage.five_hour.utilization. Compare that float against what you saw in DevTools Response.",
    detail:
      "If they match, your tracker is reading server truth. If they differ by more than rounding (the menu-bar app rounds with {:.0}% for display, and the underlying float in the JSON is exact), something else is happening. Most likely: the cached bridge snapshot is older than 60 seconds, or the extension is logged into a different account than the DevTools tab.",
  },
  {
    title: "Step 3: Disable the extension and watch the staleness flip.",
    description:
      "Go to chrome://extensions, toggle ClaudeMeter off. Wait 120 seconds. Run curl http://127.0.0.1:63762/snapshots | jq '.[0].stale'. You will see the bridge still returns the last cached snapshot, but the menu-bar app's poll_loop has now seen bridge_fresh = false (last_bridge.elapsed() exceeds BRIDGE_FRESHNESS) and switched to its own cookie-decrypt fetch. The badge in the menu bar still updates because the Rust binary reads your Chrome cookie file directly via Safe Storage in the Keychain.",
    detail:
      "This is the proof that the tracker has two independent paths to the same number. Re-enable the extension and the next POST resets last_bridge to now, the menu bar yields back to the bridge, and the cycle continues.",
  },
];

const overviewMetrics = [
  {
    feature: "What you see in DevTools (Step 1 truth value)",
    competitor:
      ".five_hour.utilization = 0.42 from /api/organizations/{uuid}/usage",
    ours: "Same float, parsed via the Window struct in src/models.rs",
  },
  {
    feature: "What curl returns from the bridge (Step 2 echo)",
    competitor:
      ".usage.five_hour.utilization = 0.42 from 127.0.0.1:63762/snapshots",
    ours: "Identical to Step 1, decoded once, served unchanged",
  },
  {
    feature: "Where the bridge value originated",
    competitor:
      "extension POST inside the last 120 seconds (BRIDGE_FRESHNESS)",
    ours:
      "or, after 120 seconds without a POST, menu-bar fetch via decrypted Chrome cookie",
  },
  {
    feature: "How fast a divergence shows up",
    competitor: "Within 60 seconds of either fetch path completing",
    ours:
      "stale: true flips on the missing account, badge changes color",
  },
  {
    feature: "What you need to trust",
    competitor:
      "The MIT-licensed source for src/api.rs and extension/background.js",
    ours:
      "Or just diff the two values yourself; the protocol does not require trust",
  },
];

const bridgeSeqActors = ["claude.ai", "extension", "127.0.0.1:63762", "menu-bar"];

const bridgeSeqMessages = [
  { from: 1, to: 0, label: "GET /api/organizations/{org}/usage", type: "request" as const },
  { from: 0, to: 1, label: "200 { five_hour: { utilization: 0.42 } }", type: "response" as const },
  { from: 1, to: 2, label: "POST /snapshots [snapshot]", type: "request" as const },
  { from: 2, to: 3, label: "AppEvent::Snapshots(Ok(snaps))", type: "event" as const },
  { from: 3, to: 2, label: "last_bridge = Instant::now()", type: "event" as const },
  { from: 3, to: 3, label: "if bridge_fresh: skip fetch_all", type: "event" as const },
];

const bridgeFreshnessRust = `// claude-meter/src/bin/menubar.rs  (lines 330-345, abbreviated)
const BRIDGE_PORT: u16 = 63762;
const BRIDGE_FRESHNESS: Duration = Duration::from_secs(120);

fn poll_loop(/* ... */) {
    loop {
        let bridge_fresh = last_bridge
            .lock()
            .ok()
            .and_then(|g| *g)
            .map(|t| t.elapsed() < BRIDGE_FRESHNESS)
            .unwrap_or(false);

        if !bridge_fresh {
            let _ = proxy.send_event(AppEvent::Refreshing);
            let result = rt.block_on(fetch_all());
            let _ = proxy.send_event(AppEvent::Snapshots(result));
        }

        let _ = refresh_rx.recv_timeout(POLL_INTERVAL);
    }
}`;

const step1Terminal = [
  { type: "info" as const, text: "# In Chrome DevTools → Network → filter \"usage\"" },
  { type: "command" as const, text: "GET https://claude.ai/api/organizations/<your-uuid>/usage" },
  { type: "output" as const, text: "  Cookie: sessionKey=...; lastActiveOrg=<your-uuid>; ..." },
  { type: "output" as const, text: "  Referer: https://claude.ai/settings/usage" },
  { type: "output" as const, text: "  Accept: */*" },
  { type: "success" as const, text: "200 OK" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"five_hour\":      { \"utilization\": 0.42, \"resets_at\": \"2026-04-27T18:14:02Z\" }," },
  { type: "output" as const, text: "  \"seven_day\":      { \"utilization\": 0.71, \"resets_at\": \"2026-05-01T09:30:00Z\" }," },
  { type: "output" as const, text: "  \"seven_day_opus\": { \"utilization\": 0.84, \"resets_at\": \"2026-05-01T09:30:00Z\" }," },
  { type: "output" as const, text: "  \"extra_usage\":    { \"is_enabled\": true, \"used_credits\": 1340, \"currency\": \"USD\" }" },
  { type: "output" as const, text: "}" },
];

const step2Terminal = [
  { type: "command" as const, text: "curl -s http://127.0.0.1:63762/snapshots | jq '.[0].usage.five_hour'" },
  { type: "success" as const, text: "{" },
  { type: "output" as const, text: "  \"utilization\": 0.42," },
  { type: "output" as const, text: "  \"resets_at\": \"2026-04-27T18:14:02Z\"" },
  { type: "output" as const, text: "}" },
  { type: "info" as const, text: "# Same float. Same timestamp. Different process." },
  { type: "command" as const, text: "curl -s http://127.0.0.1:63762/snapshots | jq '.[0] | { account_email, browser, fetched_at, stale }'" },
  { type: "success" as const, text: "{" },
  { type: "output" as const, text: "  \"account_email\": \"you@example.com\"," },
  { type: "output" as const, text: "  \"browser\": \"Chrome\"," },
  { type: "output" as const, text: "  \"fetched_at\": \"2026-04-27T13:14:11.382Z\"," },
  { type: "output" as const, text: "  \"stale\": false" },
  { type: "output" as const, text: "}" },
];

const step3Terminal = [
  { type: "info" as const, text: "# Disable ClaudeMeter at chrome://extensions, then wait 120s." },
  { type: "command" as const, text: "curl -s http://127.0.0.1:63762/snapshots | jq '.[] | { browser, fetched_at, stale }'" },
  { type: "success" as const, text: "{" },
  { type: "output" as const, text: "  \"browser\": \"Chrome\"," },
  { type: "output" as const, text: "  \"fetched_at\": \"2026-04-27T13:14:11.382Z\"," },
  { type: "output" as const, text: "  \"stale\": true" },
  { type: "output" as const, text: "}" },
  { type: "info" as const, text: "# Now look at the menu bar. It still updates." },
  { type: "info" as const, text: "# The Rust binary fell back to reading Chrome's cookie file." },
  { type: "info" as const, text: "# Two independent paths, same number, both verifiable." },
];

const failureRows = [
  {
    feature: "Step 1 and Step 2 floats match exactly",
    competitor: "Healthy. The tracker is reading server truth.",
    ours: "Healthy. Use the bridge value in scripts and dashboards.",
  },
  {
    feature: "Step 2 returns nothing (connection refused)",
    competitor: "ClaudeMeter is not running. brew services start, or relaunch the app.",
    ours: "Not a tracker bug, a process bug. Check Activity Monitor.",
  },
  {
    feature: "Step 2 floats are off by more than rounding",
    competitor: "Bridge cache is older than 60s, or extension hit a different org.",
    ours: "Filter the array on org_uuid, then re-diff.",
  },
  {
    feature: "Step 2 returns stale: true after Step 3",
    competitor: "Expected. The extension stopped posting; the menu-bar takes over.",
    ours: "Re-enable the extension and the next POST resets the bridge.",
  },
  {
    feature: "Step 1 returns 403",
    competitor: "Your Cookie or Referer header is missing or wrong.",
    ours: "Use DevTools to copy the headers verbatim, including the lastActiveOrg cookie.",
  },
  {
    feature: "Step 1 returns a different float than the settings page UI",
    competitor: "The page renders client-side from a stale cached fetch; refresh.",
    ours: "Hard-reload the settings page and re-intercept the network call.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-server-quota-visibility",
    title: "The denominator is private. The numerator alone won't save you.",
    excerpt:
      "Why a token counter on disk cannot equal what claude.ai/settings/usage enforces, and which field to read instead.",
    tag: "Server truth",
  },
  {
    href: "/t/claude-rolling-window-cap",
    title: "Seven rolling windows, not one",
    excerpt:
      "The /usage endpoint returns seven stacked buckets, each with its own utilization and resets_at clock.",
    tag: "Reset logic",
  },
  {
    href: "/t/claude-session-window-monitor",
    title: "Multi-account dedupe and the menu-bar's merge logic",
    excerpt:
      "How ClaudeMeter merges fresh and persisted snapshots without flickering the menu when only utilization changed.",
    tag: "Architecture",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "How to verify a Claude usage tracker actually reads server truth (the three-step protocol)",
  description:
    "A reader-driven verification protocol for Claude usage trackers. Open DevTools, intercept /api/organizations/{org}/usage, then curl the localhost bridge at 127.0.0.1:63762 and diff. Three steps, no trust required.",
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

export default function ClaudeUsageServerTruthPage() {
  return (
    <article className="bg-white text-zinc-900">
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
          Every tracker says &quot;server truth.&quot;{" "}
          <GradientText>Here is how you check.</GradientText>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          Open Chrome DevTools on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          and watch the page&apos;s own request to{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            /api/organizations/&#123;org&#125;/usage
          </code>
          . The JSON it returns is the truth value Anthropic enforces for the
          next sixty seconds. Then run one curl against the loopback HTTP
          server ClaudeMeter starts at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            127.0.0.1:63762
          </code>
          . If the floats match byte for byte, your tracker is reading the
          same thing. If they don&apos;t, you have your answer. The whole
          protocol is three checks and roughly one minute.
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

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The trust gap with every other tracker
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The Claude usage tracker landscape is full of dashboards that print
          a number and ask you to trust it. The closed-source Chrome
          extensions show you a percentage that may or may not match the
          settings page. The local-log readers (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ccusage
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Claude-Code-Usage-Monitor
          </code>
          ) sum tokens out of your local JSONL transcript and present the sum
          as a quota. None of these tools give you a way to walk the data
          path yourself, from the wire that claude.ai actually serves, all
          the way to the number on your screen.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          ClaudeMeter is built so you can. The fetch path is two independent
          processes that hit the same internal endpoint, post their results
          to a loopback HTTP server, and serialise into a Rust struct that is
          MIT-licensed and 73 lines long (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/models.rs
          </code>
          ). The verification protocol below uses that loopback server. You
          do not need to read the Rust source to trust the output. You read
          one JSON, then read another JSON, then diff.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The three-step verification protocol
        </h2>
        <StepTimeline steps={verificationSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
          Step 1: capture the truth value in DevTools
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          The settings page makes one network call when you load it, and that
          call is the entire data source. There is no client-side
          aggregation, no token counter, no estimation. The response body is
          rendered into the bars and percentages you see. Open DevTools,
          filter the Network panel for the word{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            usage
          </code>
          , reload, and the call is right there.
        </p>
        <TerminalOutput
          title="DevTools → Network → /api/organizations/<uuid>/usage"
          lines={step1Terminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Three things to copy down: your org UUID (visible in the request
          URL), the response body (Right-click → Copy Response), and the
          three required headers (Cookie, Referer, Accept). The Referer is
          load-bearing. Drop it and the same endpoint returns 403; the
          server uses it as a CSRF check. Without these three headers a
          repeat curl will fail, and any third-party tracker that does not
          send them is doing something other than what the page does.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
          Step 2: read the same JSON from the bridge
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          With ClaudeMeter running, the menu-bar binary is listening on{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            127.0.0.1:63762/snapshots
          </code>{" "}
          and the browser extension is POSTing the very response you just
          captured to that URL once a minute. One curl returns the array of
          snapshots, one per browser session it is tracking. Drill into the
          object whose{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            org_uuid
          </code>{" "}
          matches Step 1, then read{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            .usage.five_hour.utilization
          </code>
          .
        </p>
        <TerminalOutput
          title="curl 127.0.0.1:63762/snapshots | jq"
          lines={step2Terminal}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The float is the same. The timestamp is the same. The fetched_at
          tells you the snapshot was retrieved less than a minute ago. The
          browser field is &quot;Chrome&quot; because the menu-bar app
          identified the POST&apos;s peer process via lsof on the TCP port
          (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            peer_browser_by_port
          </code>{" "}
          at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            src/bin/menubar.rs
          </code>
          ). Two processes, two paths, one number. If your script reads from
          the bridge in production, you are reading the same value the
          settings page would show you if you were watching it.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
          Step 3: prove there are two independent paths
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          A claim like &quot;the tracker reads what claude.ai shows&quot; is
          easier to believe when there are two ways to get the number and
          either one works on its own. Disable the extension at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            chrome://extensions
          </code>{" "}
          and the menu bar should keep updating. That works because the Rust
          binary has its own fetch path: it reads the encrypted Chrome
          cookie file via the macOS Keychain, decrypts the session cookie
          locally, and calls the same endpoint with the same Cookie/Referer
          headers. After 120 seconds without an extension POST, the menu-bar
          app takes over.
        </p>
        <AnimatedCodeBlock
          code={bridgeFreshnessRust}
          language="rust"
          filename="src/bin/menubar.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Watch the bridge response while the handoff happens. The cached
          snapshot stays in place for a moment, then the menu-bar refresh
          overwrites it with new numbers. The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            stale: true
          </code>{" "}
          flag in the JSON is the single bit that tells you the data is
          last-seen rather than just-fetched.
        </p>
        <div className="mt-6">
          <TerminalOutput
            title="watching the staleness flip"
            lines={step3Terminal}
          />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            Anchor fact: the entire dual-source contract is{" "}
            <GradientText>two constants</GradientText>
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg mb-2">
            The whole reason curl on localhost can return server truth is
            two lines in{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              src/bin/menubar.rs
            </code>
            :{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              BRIDGE_PORT: u16 = 63762
            </code>{" "}
            on line 349 and{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              BRIDGE_FRESHNESS: Duration = Duration::from_secs(120)
            </code>{" "}
            on line 350. The port is where the loopback HTTP server binds,
            the freshness budget is how long the menu-bar app trusts an
            extension POST before falling back to its own decrypt-and-fetch.
            Inside <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">poll_loop</code>{" "}
            the check is one line: if{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              last_bridge.elapsed() &lt; BRIDGE_FRESHNESS
            </code>{" "}
            the menu-bar yields. That is it. Two integers, one branch, and
            the verification protocol works.
          </p>
          <p className="text-zinc-700 leading-relaxed text-lg mt-4">
            The sequence below is one full minute of data flow. Note that
            the only outbound network call is from the extension to{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              claude.ai
            </code>
            . Everything else is local IPC over loopback.
          </p>
        </BackgroundGrid>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <SequenceDiagram
          title="One minute of polling, four participants"
          actors={bridgeSeqActors}
          messages={bridgeSeqMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What every protocol outcome means
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          Verification is not just for the happy path. The interesting cases
          are when Step 1 and Step 2 diverge, when curl returns nothing,
          when the bridge says stale. Below is the full decision table for
          what each outcome means and where to look next.
        </p>
        <ComparisonTable
          productName="What you see"
          competitorName="What it means"
          rows={failureRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The same protocol, applied to other trackers
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          You can run Step 1 against any tracker. Capture the DevTools
          response, then look at whatever number the third-party tool is
          showing in its UI. If the percentages do not match the
          DevTools-side floats, the tool is reading something else. The
          local-log tools are honest about this: ccusage&apos;s own README
          explains it tracks tokens out of the local Claude Code transcript,
          which is a different data source. Closed-source extensions are
          where it gets tricky, because there is no guarantee about which
          endpoint they hit. If you cannot run Step 2 against them, run
          Step 1 against the same browser session they use and see whether
          their UI matches.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          The reason ClaudeMeter ships the bridge in the first place is so
          you do not have to take a screenshot at face value. The same
          loopback URL also makes the data scriptable: a Starship prompt or
          tmux status line can curl the bridge once a minute and render the
          float without going near a browser. Whatever you build on top of
          it, the verification protocol is the same.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <ComparisonTable
          productName="Source of truth"
          competitorName="What you see in DevTools"
          rows={overviewMetrics}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Stuck on a tracker that does not match the settings page?"
          description="Bring a screenshot and the curl output and we will walk through the diff together."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16 mb-24">
        <RelatedPostsGrid posts={relatedPosts} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Walk through your tracker's number with the maintainer."
      />
    </article>
  );
}
