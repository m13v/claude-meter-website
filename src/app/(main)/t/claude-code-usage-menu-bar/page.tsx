import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  AnimatedChecklist,
  StepTimeline,
  GlowCard,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-code-usage-menu-bar";
const PUBLISHED = "2026-04-30";

export const metadata: Metadata = {
  title:
    "Claude Code Usage in the macOS Menu Bar: The Two-Tier Redraw That Keeps the Dropdown From Snapping Shut",
  description:
    "ClaudeMeter is the macOS menu bar app for Claude Code usage. Free, open-source, brew install --cask m13v/tap/claude-meter. The unique part is the redraw strategy: title repaint every minute (cheap), menu rebuild only when the account set changes (expensive). That branch at src/bin/menubar.rs lines 137-146 is why the dropdown stays open while you watch a long Claude Code run burn through the 5-hour window.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Code Usage in the macOS Menu Bar: The Two-Tier Redraw That Keeps the Dropdown From Snapping Shut",
    description:
      "Why the menu bar is the right surface for Claude Code usage, what the chip actually shows, and the two-tier redraw at lines 137-146 that keeps the dropdown stable while you watch the percent climb.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude Code usage in the menu bar", url: PAGE_URL },
];

const faqs = [
  {
    q: "What is the macOS menu bar app for Claude Code usage?",
    a: "ClaudeMeter. It is free, open-source (MIT), and lives at github.com/m13v/claude-meter. Install with brew install --cask m13v/tap/claude-meter, load the unpacked browser extension from the same repo, and the menu bar icon lights up within sixty seconds with two numbers: 5h percent and 7d percent. The numbers are pulled from /api/organizations/{org_uuid}/usage on claude.ai, the same endpoint claude.ai/settings/usage renders. It is the same server quota Anthropic actually checks before throwing a 429 on your next Claude Code prompt.",
  },
  {
    q: "Why a menu bar, not a terminal status line, for Claude Code usage?",
    a: "Because the menu bar is in the same field of view as your editor and terminal, but does not steal a row of your terminal. ccusage --watch and similar tools render a live updating row inside a terminal pane, which is fine until you tab to a different pane or your tmux split changes layout. The macOS menu bar sits above every Space, every full-screen app, and every workspace; the chip is in your peripheral vision while Claude Code is mid-edit. If you also want a status line, the same data is available via claude-meter --json on the CLI; you can wire it into Starship, tmux, or fish without losing the menu bar version.",
  },
  {
    q: "Will the dropdown snap shut every time the percent updates?",
    a: "No, and that is the part most home-built menu bar apps get wrong. ClaudeMeter splits the redraw into two tiers. The poll fires once a minute. The title repaint is cheap and runs on every numeric change. The menu rebuild is expensive (it tears down and re-attaches the submenu tree, which dismisses an open dropdown) and only runs when the account set changes: a new email logged in, an account went stale, an account got forgotten. The branch lives at src/bin/menubar.rs lines 137-146. The comment on the same branch names the reason: 'Mid-flight percentage updates reach the user on their next click via title + re-render.' If you keep the dropdown open during a long Claude Code run, the percent in the title still ticks; the dropdown stays put.",
  },
  {
    q: "How is this different from ccusage and Claude-Code-Usage-Monitor?",
    a: "ccusage and Claude-Code-Usage-Monitor read your local ~/.claude/projects JSONL files and total tokens per session. That is a faithful local-log signal for Claude Code traffic only. They cannot see the per-model weights, the peak-hour multiplier, the per-attachment cost, or any browser-chat usage Anthropic stacks into the same five_hour and seven_day buckets. ccusage at 5 percent next to claude.ai at 90 percent is a normal, predictable mismatch. ClaudeMeter shows the second number, the one Anthropic uses to decide whether to 429 your next prompt. ClaudeMeter does not replace ccusage; ccusage tells you what your Claude Code traffic weighed in tokens, ClaudeMeter tells you what fraction of the cap Anthropic counted that against. Both repos are linked at the bottom of this page.",
  },
  {
    q: "What does the menu bar chip actually show?",
    a: "Two percentages: 5h and 7d. Three formats configurable from the dropdown's 'Menu bar style' submenu (TitleFormat enum at src/bin/menubar.rs lines 22-31). Long is 'Claude  5h 47%  ·  7d 62%'. Medium is '5h 47% · 7d 62%'. Compact is '47 · 62'. Each percent is its own NSAttributedString segment so the background can be colored independently: bg_for at lines 942-950 paints RGB (215, 58, 73), saturated red, at >=100 percent; RGB (219, 118, 32), orange, at >=90 percent; no background below. With the dropdown closed, you read both numbers in your peripheral vision, and the orange flash at 90 is your tap on the shoulder.",
  },
  {
    q: "Does it identify which browser my Claude Code session is using?",
    a: "Yes, and not by trusting a header. The menu bar app receives POSTs from the browser extension on 127.0.0.1:63762. To label which Chromium browser sent the snapshot, it asks the OS who owns the peer TCP socket: lsof -nP -iTCP:<port> -sTCP:ESTABLISHED returns the connected process, ps -o command= returns its executable path, and classify_browser_exe at src/bin/menubar.rs lines 464-477 maps '/google chrome.app/' to 'Chrome', '/arc.app/' to 'Arc', '/brave browser.app/' to 'Brave', and '/microsoft edge.app/' to 'Edge'. Sec-Ch-Ua headers are a fallback only, because Arc identifies as Chromium in many of those headers and would mislabel rows.",
  },
  {
    q: "What about multiple Claude accounts logged into different browsers?",
    a: "Each (browser, account_email) pair becomes its own snapshot. The menu bar then compresses them into one title. With one account, you see '5h 47% · 7d 62%'. With two, you see 'M: 5h 47% · 7d 62%     P: 5h 30% · 7d 12%' where M and P are the first letter of each account email (account_tag at lines 952-958). The dropdown shows one submenu per account, labeled with the email and the browser. Mergewith_persisted at lines 840-895 keys snapshots by (browser, account) so a POST from Chrome does not disturb your Arc rows, and a stale row stays visible (with a 'stale' marker) for two hours after the last fetch.",
  },
  {
    q: "Does it run as a regular app with a Dock icon?",
    a: "No. set_macos_accessory at src/bin/menubar.rs lines 1116-1126 calls NSApplication::sharedApplication(mtm).setActivationPolicy(NSApplicationActivationPolicy::Accessory) before anything else. Accessory means the process has no Dock icon, no app menu, and no Cmd-Tab presence. The status item in the menu bar is the entire user surface. If you want to quit, the dropdown has a Quit row. If you want to launch it on login, the brew cask installs a launch agent so it comes back after reboot.",
  },
  {
    q: "How often does it poll the usage endpoint?",
    a: "Every 60 seconds, but with a backoff. POLL_INTERVAL at line 18 is sixty seconds. BRIDGE_FRESHNESS at line 350 is 120 seconds. If the browser extension has POSTed a snapshot to the localhost bridge in the last 120 seconds, the poll loop skips the cookie-decrypt fetch entirely (lines 331-342). So in the common case, where you have the extension loaded and a browser open, the menu bar app does zero direct claude.ai requests; it just receives extension snapshots. If you close the browser, the cookie-decrypt path takes over after 120 seconds of bridge silence. One HTTPS request per minute either way.",
  },
  {
    q: "Can I read the same data from a Claude Code shell command?",
    a: "Yes. The brew cask installs a CLI binary at /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter. Run it with no flags for a human-readable block (format_window in src/format.rs lines 75-98 renders each window as 'X.X% used    -> resets <local clock> (in Nh)'). Run with --json for the parsed UsageSnapshot as JSON. The localhost bridge is also a read endpoint: curl http://127.0.0.1:63762/snapshots returns whatever the menu bar last received. That is the hook for embedding the same number into a Starship prompt or tmux status line, alongside the menu bar.",
  },
  {
    q: "What if I am on Linux or Windows?",
    a: "Not supported yet. The menu bar app is macOS-only because the AppKit code path that paints the colored title segments (the macos_title module at lines 1128-1283 of src/bin/menubar.rs) is locked behind cfg(target_os = 'macos') and there is no cross-platform analogue for setAttributedTitle on a status item. The browser extension itself runs anywhere Chromium runs, and exposes the same snapshot at chrome.action.setBadgeText, but the tray-icon Linux/Windows fallback in tray-icon does not support per-segment background colors. Until that lands upstream, the macOS-only experience is what ships.",
  },
  {
    q: "Is the cookie path safe?",
    a: "It reads what your browser is already storing, decrypts it with the key your browser already gave macOS, and never leaves the loopback interface. Specifically: Chrome's Safe Storage entry has an ACL that already trusts /usr/bin/security, so calling /usr/bin/security find-generic-password -wa Chrome -s 'Chrome Safe Storage' returns the AES key without a prompt. Arc, Brave, and Edge prompt once on first run because their ACLs do not list the security binary; click Always Allow once and the path runs silently afterward. The decrypted cookie is held in memory just long enough to fetch /api/organizations/{org_uuid}/usage and gets dropped. No telemetry, no analytics, no network egress beyond claude.ai itself. The bridge listens only on 127.0.0.1; the browser extension and the menu bar app are the only two processes that touch it.",
  },
];

const titleSegmentsCode = `// src/bin/menubar.rs lines 942-950
fn bg_for(util: f64) -> Option<(u8, u8, u8)> {
    if util >= 100.0 {
        Some((215, 58, 73))     // saturated red, fires on a 429-pending state
    } else if util >= 90.0 {
        Some((219, 118, 32))    // orange, the peripheral-vision warning
    } else {
        None                    // plain text, ambient state
    }
}`;

const redrawBranchCode = `// src/bin/menubar.rs lines 121-146 (excerpt)
Event::UserEvent(AppEvent::Snapshots(Ok(snaps))) => {
    last_fetched = Some(Local::now());
    last_error = None;
    let prev = last_snaps.clone().unwrap_or_default();
    let merged = merge_with_persisted(snaps, prev);
    save_snapshots(&merged);
    let numbers_changed = last_snaps
        .as_ref()
        .map(|old| !snaps_equal(old, &merged))
        .unwrap_or(true);
    let accounts_changed = last_snaps
        .as_ref()
        .map(|old| account_set_changed(old, &merged))
        .unwrap_or(true);
    last_snaps = Some(merged);
    // Only rebuild the menu when the account set itself changed (new
    // email, or stale<->fresh flip). Mid-flight percentage updates
    // reach the user on their next click via title + re-render.
    if accounts_changed {
        if let (Some(tray), Some(s)) = (tray_icon.as_ref(), last_snaps.as_deref()) {
            current_ids = render_menu_only(tray, s, last_fetched, config.title_format);
        }
    }
    if numbers_changed {
        dirty = true;
    }
}`;

const peerBrowserCode = `// src/bin/menubar.rs lines 437-477 (the OS-truth browser identification)
fn peer_browser_by_port(peer: &std::net::SocketAddr) -> Option<String> {
    use std::process::Command;
    let port = peer.port();
    let me = std::process::id();
    let out = Command::new("/usr/sbin/lsof")
        .args(["-nP", &format!("-iTCP:{port}"), "-sTCP:ESTABLISHED"])
        .output()
        .ok()?;
    let text = String::from_utf8_lossy(&out.stdout);
    // First non-header row whose PID isn't us = the browser process.
    let peer_pid = text.lines().skip(1).find_map(|line| {
        let mut cols = line.split_whitespace();
        let _cmd = cols.next()?;
        let pid: u32 = cols.next()?.parse().ok()?;
        if pid == me { None } else { Some(pid) }
    })?;
    let ps = Command::new("/bin/ps")
        .args(["-p", &peer_pid.to_string(), "-o", "command="])
        .output()
        .ok()?;
    let cmdline = String::from_utf8_lossy(&ps.stdout).to_string();
    classify_browser_exe(&cmdline)
}

fn classify_browser_exe(path: &str) -> Option<String> {
    let p = path.to_lowercase();
    if p.contains("/arc.app/")            { return Some("Arc".to_string()); }
    if p.contains("/google chrome.app/")
       || p.contains("/chrome.app/")      { return Some("Chrome".to_string()); }
    if p.contains("/brave browser.app/")
       || p.contains("/brave-browser")    { return Some("Brave".to_string()); }
    if p.contains("/microsoft edge.app/") { return Some("Edge".to_string()); }
    None
}`;

const fingerprintCode = `// src/bin/menubar.rs lines 1219-1246 (excerpt of macos_title::set_title)
pub fn set_title(segments: &[Segment]) -> bool {
    let Some(mtm) = MainThreadMarker::new() else { return false };
    BUTTON.with(|slot| {
        let mut b = slot.borrow_mut();
        if b.is_none() { *b = acquire_button(mtm); }
        let Some(btn) = b.as_ref() else { return false };
        let fp = fingerprint(segments);
        let should_apply = LAST_FINGERPRINT.with(|f| {
            let mut f = f.borrow_mut();
            if *f == Some(fp) { false }
            else { *f = Some(fp); true }
        });
        if !should_apply { return true; }
        let attr = build_attr(segments);
        unsafe { btn.setAttributedTitle(&attr); }
        true
    })
}`;

const session = [
  { type: "command" as const, text: "# minute 0: claude code starts a refactor on a 14-file feature" },
  { type: "output" as const, text: "menu bar:  Claude  5h 47%  ·  7d 62%" },
  { type: "info" as const, text: "(both numbers plain text. ambient state.)" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# minute 22: opus has chewed through the bigger files" },
  { type: "output" as const, text: "menu bar:  Claude  5h 89%  ·  7d 64%" },
  { type: "info" as const, text: "(still plain. one click off the wall.)" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# minute 24: peripheral vision picks up the orange flash" },
  { type: "output" as const, text: "menu bar:  Claude  5h [91%]  ·  7d 64%" },
  { type: "info" as const, text: "(91 painted RGB 219,118,32 by bg_for. you stop the loop.)" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# you click the menu bar to read the reset countdown" },
  { type: "output" as const, text: "matt@example.com [Chrome]  [91% / 64%]" },
  { type: "output" as const, text: "  5-hour       91.4% · resets in 2h" },
  { type: "output" as const, text: "  7-day all    64.2% · resets in 4d" },
  { type: "output" as const, text: "  7-day Sonnet 41.0%" },
  { type: "output" as const, text: "  7-day Opus   78.6%" },
  { type: "output" as const, text: "" },
  { type: "command" as const, text: "# minute 25: the next poll fires while your dropdown is open" },
  { type: "success" as const, text: "title repaints to 91.6%. dropdown stays put. accounts_changed == false." },
];

const cliJson = `$ /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json | jq '.usage'
{
  "five_hour":      { "utilization": 91.4, "resets_at": "2026-04-30T23:14:00Z" },
  "seven_day":      { "utilization": 64.2, "resets_at": "2026-05-04T17:00:00Z" },
  "seven_day_sonnet": { "utilization": 41.0 },
  "seven_day_opus":   { "utilization": 78.6 }
}

# the same numbers the menu bar is rendering, machine-readable.
# pipe into a starship prompt, a tmux status, or your own dashboard.`;

const installSteps = [
  {
    title: "1. brew install the menu bar app",
    description:
      "brew install --cask m13v/tap/claude-meter. Drops ClaudeMeter.app under /Applications and registers a launch agent so the icon comes back after reboot. The CLI binary lands at the same path inside the app bundle.",
  },
  {
    title: "2. load the unpacked extension",
    description:
      "git clone github.com/m13v/claude-meter, open chrome://extensions (or arc://extensions, brave://extensions, edge://extensions), enable Developer mode in the top right, click Load unpacked, point it at the extension/ folder. The icon pins next to the URL bar.",
  },
  {
    title: "3. visit claude.ai once",
    description:
      "If you are not already logged in, sign in. The extension calls /api/organizations/{org}/usage with credentials: 'include', so your existing claude.ai cookie travels automatically. No paste, no API key, no second login.",
  },
  {
    title: "4. start your next Claude Code run",
    description:
      "Within sixty seconds the menu bar lights up. The title shows '5h X%  ·  7d Y%' for one account or 'M: 5h X% · 7d Y%   P: 5h X% · 7d Y%' for two. Click for the per-window dropdown, including resets_at countdowns and the extra-usage credit balance for metered billing.",
  },
];

const vsTable = [
  {
    feature: "Source of truth",
    ours: "Server-side /api/organizations/{org}/usage utilization (the same number Anthropic checks for 429)",
    competitor: "Local ~/.claude/projects/<project>/<session>.jsonl token totals",
  },
  {
    feature: "Browser-chat usage included",
    ours: "Yes (server bucket counts it)",
    competitor: "No (JSONL only sees Claude Code traffic)",
  },
  {
    feature: "Per-attachment cost included",
    ours: "Yes (server bucket folds it in)",
    competitor: "No",
  },
  {
    feature: "Peak-hour multiplier",
    ours: "Yes",
    competitor: "No",
  },
  {
    feature: "Where you read it",
    ours: "macOS menu bar (always visible), CLI, browser toolbar popup",
    competitor: "Terminal pane (ccusage --watch), or one-shot ccusage table",
  },
  {
    feature: "Open-source",
    ours: "MIT, Rust + JavaScript",
    competitor: "MIT, TypeScript",
  },
  {
    feature: "Cost",
    ours: "Free",
    competitor: "Free",
  },
];

const watchInvariants = [
  {
    text: "The chip is two numbers: 5h percent and 7d percent. Three layouts in the dropdown's 'Menu bar style' submenu pick how compact (Long, Medium, Compact). The Compact format renders just '47 · 62' for users on small screens.",
  },
  {
    text: "The chip background flashes orange (RGB 219, 118, 32) at >=90 percent and red (RGB 215, 58, 73) at >=100 percent. Plain text below 90 keeps the menu bar quiet during ambient runs.",
  },
  {
    text: "The dropdown only rebuilds when the account set changes (new email, stale flip, forget action). Mid-flight percentage updates repaint the title only. Open dropdowns do not snap shut between polls.",
  },
  {
    text: "Multiple accounts compress into 'M: 5h X% · 7d Y%   P: 5h X% · 7d Y%' using the first letter of each email. The dropdown still shows full emails per submenu, browser-tagged.",
  },
  {
    text: "If the browser extension is alive (any POST in the last 120 seconds), the menu bar app skips the cookie-decrypt fetch path entirely. One HTTPS request per minute either way; the extension just owns it when it is awake.",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    title: "Why ccusage and claude.ai disagree on your usage percent",
    excerpt:
      "Local token counters say 5 percent, claude.ai says rate-limited. Walking the gap: peak-hour multiplier, attachments, tool calls, browser-chat usage, and the field that actually trips the 429.",
    tag: "Local vs server",
  },
  {
    href: "/t/claude-rate-limit-dashboard",
    title: "Claude rate limit dashboard for Pro and Max, field by field",
    excerpt:
      "What a real Pro/Max rate-limit dashboard has to render. The eight utilization floats, the RGB color thresholds, and the localhost bridge that wires extension snapshots into the native menu bar.",
    tag: "Dashboard",
  },
  {
    href: "/t/claude-usage-monitoring-app-for-mac",
    title: "Claude usage monitoring app for Mac: the cookie pipeline most apps skip explaining",
    excerpt:
      "PBKDF2-saltysalt-1003 against Chrome Safe Storage, AES-128-CBC, the localhost bridge fallback on port 63762, and why the Mac-native pipeline avoids manual cookie paste.",
    tag: "Cookie pipeline",
  },
  {
    href: "/t/claude-pro-weekly-quota-tracker",
    title: "Claude Pro weekly quota tracker: what the 7-day row actually shows",
    excerpt:
      "Where the 7-day percent comes from, why the countdown lands in days, and why the toolbar badge stays pinned to the 5-hour bucket.",
    tag: "Tracker",
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
                "Claude Code Usage in the macOS Menu Bar: The Two-Tier Redraw That Keeps the Dropdown From Snapping Shut",
              description:
                "ClaudeMeter is the macOS menu bar app for Claude Code usage. Free, open-source, brew install --cask m13v/tap/claude-meter. The unique part is the redraw strategy at src/bin/menubar.rs lines 137-146.",
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "ClaudeMeter",
              publisherUrl: "https://claude-meter.com",
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema(
              breadcrumbs.map((b) => ({ name: b.name, url: b.url }))
            )
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema(faqs.map((f) => ({ q: f.q, a: f.a })))),
        }}
      />

      <Breadcrumbs
        items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))}
        className="pt-8"
      />

      <header className="max-w-4xl mx-auto px-6 pt-10 pb-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900">
          Claude Code usage in the macOS menu bar:{" "}
          <span className="text-teal-600">
            the two-tier redraw that keeps the dropdown from snapping shut
          </span>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
          You came here because Claude Code keeps walking your 5-hour window mid-refactor and
          you want a menu bar chip that tells you when you are about to hit it. This page is
          about which app to install, what the chip is actually showing, and the one piece of
          control flow that distinguishes a usable menu bar reader from one that closes its
          own dropdown every minute.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="9 min"
      />

      <section className="max-w-4xl mx-auto px-6 my-10">
        <GlowCard>
          <div className="p-7">
            <p className="text-xs font-mono uppercase tracking-widest text-teal-700 mb-3">
              Direct answer (verified 2026-04-30)
            </p>
            <h2 className="text-2xl font-semibold text-zinc-900 mb-3">
              ClaudeMeter is the macOS menu bar app for Claude Code usage.
            </h2>
            <p className="text-zinc-700 leading-relaxed">
              Free, open-source (MIT), source at{" "}
              <a
                className="text-teal-700 underline underline-offset-2"
                href="https://github.com/m13v/claude-meter"
              >
                github.com/m13v/claude-meter
              </a>
              . Install with{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                brew install --cask m13v/tap/claude-meter
              </code>
              . Reads the same server quota Anthropic enforces for 429s, not the local
              ~/.claude/projects JSONL token estimate ccusage reads. Renders 5h percent and
              7d percent in the menu bar, color-coded at 90 and 100 percent. Polls once per
              minute via the browser extension, no manual cookie paste, no API key.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Why the menu bar (and not a terminal status line)
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          ccusage --watch and the other Claude Code usage monitors live in your terminal. That
          is the wrong surface for an agentic loop you are not actively babysitting. You are
          in your editor, you are reviewing a diff, you tabbed to your browser to read a doc,
          your tmux session is in another Space. The terminal pane you started ccusage in is
          three keystrokes and a context switch away.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The macOS menu bar sits above every Space, every full-screen app, every workspace.
          The chip is in your peripheral vision while Claude Code is mid-edit. The format is
          tight enough to read without looking directly at it: two two-digit percentages with
          a separator. When 5h crosses 90, the bg flips to orange and your peripheral vision
          notices. When it crosses 100, it flips to red and you have already 429&apos;d.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          You can have both. The same data is available via{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">claude-meter --json</code>{" "}
          on the CLI (the brew cask installs the binary inside the app bundle), so a Starship
          prompt or tmux status line can render the same number alongside the menu bar.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What the chip is actually showing
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Two percentages: 5h and 7d. Each one is a separate NSAttributedString segment so its
          background can be colored independently from the rest of the title. The painter is
          one function:
        </p>
        <AnimatedCodeBlock
          code={titleSegmentsCode}
          language="rust"
          filename="src/bin/menubar.rs"
        />
        <p className="text-zinc-700 leading-relaxed mt-6 mb-4">
          Three thresholds, three states. Below 90 percent the percent renders as plain text
          and the menu bar stays quiet during ambient Claude Code work. At 90 percent and up
          the segment paints RGB (219, 118, 32), an orange that contrasts against both light
          and dark menu bars. At 100 percent it paints RGB (215, 58, 73), a saturated red that
          is unmistakable in peripheral vision. A 429 from Anthropic happens at exactly that
          last threshold; the red flash and the rate-limit message arrive together.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The dropdown&apos;s &apos;Menu bar style&apos; submenu picks one of three layouts: Long
          (&quot;Claude  5h 47%  ·  7d 62%&quot;), Medium (&quot;5h 47% · 7d 62%&quot;), or
          Compact (&quot;47 · 62&quot;). On a 13&quot; MacBook with a packed menu bar, Compact
          is the format that fits without truncation.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The redraw branch nobody else documents
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Here is the part that matters when you are watching a long Claude Code run. You hit
          88 percent. You click the menu bar to see the resets_at countdown. The submenu opens.
          Sixty seconds later, the poll fires.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-6">
          A naive menu bar app calls{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">tray.set_menu(...)</code>{" "}
          on every poll to refresh the percentages in the submenu rows. AppKit treats that as a
          tear-down: the open dropdown gets dismissed out from under you, mid-read. ClaudeMeter
          does not do that. It splits the redraw into two tiers:
        </p>
        <AnimatedCodeBlock
          code={redrawBranchCode}
          language="rust"
          filename="src/bin/menubar.rs"
        />
        <p className="text-zinc-700 leading-relaxed mt-6 mb-4">
          Two equality checks decide the path. <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">snaps_equal</code>{" "}
          (lines 279-288) compares utilization fingerprints to detect numeric drift.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">account_set_changed</code>{" "}
          (lines 294-310) compares the (browser, account_email, stale) tuple set to detect a
          structural change. Numbers tick on every poll. Account sets change when you sign in
          to a new claude.ai account, when an account&apos;s session expires (stale flip), or
          when you click &quot;Forget this account&quot; from the dropdown.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          If only the numbers changed, the menu does not get rebuilt at all. The title gets a
          fresh paint via{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">apply_title</code>, which
          renders new segments through{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">setAttributedTitle</code>{" "}
          on the existing NSStatusBarButton. The dropdown stays open. You read the new percent.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The comment on lines 137-138 names the contract:{" "}
          <em>&quot;Mid-flight percentage updates reach the user on their next click via title +
          re-render.&quot;</em>{" "}
          The user sees the new number in the title without ever losing the dropdown.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The fingerprint cache one tier deeper
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Even within the cheap title-repaint path, ClaudeMeter avoids the AppKit work when
          the rendered output would be identical. A hash of the segment list is held in a
          thread-local cell; the next render compares fingerprints first.
        </p>
        <AnimatedCodeBlock
          code={fingerprintCode}
          language="rust"
          filename="src/bin/menubar.rs (macos_title module)"
        />
        <p className="text-zinc-700 leading-relaxed mt-6">
          A poll where 5h goes from 47.2 to 47.4 percent rounds to 47 in both cases. The
          fingerprint matches.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">setAttributedTitle</code>{" "}
          never gets called. The status item paints zero pixels. This sounds like trivial
          micro-optimization, but it is the difference between a menu bar app that lets your
          mouse hover stably on a chip and one that re-renders behind the cursor every minute.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          A Claude Code run, from the menu bar
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Here is the same loop watched through the chip. The menu bar paints in a tight loop;
          the dropdown is the user&apos;s checkpoint:
        </p>
        <TerminalOutput lines={session} title="claude code agentic run, watched from the menu bar" />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          OS-truth browser identification (no header trust)
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          When you have Chrome and Arc both open against different claude.ai accounts, the
          menu bar has to label which row came from which browser. The naive way is to read
          Sec-Ch-Ua off the POST headers and trust them. That fails on Arc, which identifies
          as Chromium in many headers and would mislabel rows.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-6">
          ClaudeMeter asks the OS instead. It reads the peer TCP socket&apos;s port, calls{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            lsof -nP -iTCP:&lt;port&gt; -sTCP:ESTABLISHED
          </code>{" "}
          to find the connected process, then{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">ps -o command=</code> to
          get its executable path. Pattern matching on path substrings does the rest:
        </p>
        <AnimatedCodeBlock
          code={peerBrowserCode}
          language="rust"
          filename="src/bin/menubar.rs"
        />
        <p className="text-zinc-700 leading-relaxed mt-6">
          The Sec-Ch-Ua fallback at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">detect_browser_from_headers</code>{" "}
          (lines 505-536) only fires if the OS lookup failed (sandboxed environments, lsof
          unavailable, etc.). In practice it is the second-choice path; the OS owns the
          authoritative answer.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          ccusage vs ClaudeMeter, side by side
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          They answer different questions. ccusage answers &quot;how many tokens did my Claude
          Code session weigh?&quot; ClaudeMeter answers &quot;how close am I to a 429?&quot;
          You want both, and they do not overlap.
        </p>
        <ComparisonTable
          productName="ClaudeMeter"
          competitorName="ccusage"
          rows={vsTable}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The CLI, for status lines
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The brew cask installs a CLI binary at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter
          </code>
          . With <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">--json</code> it
          prints the parsed UsageSnapshot for piping into Starship, tmux, fish, or your own
          dashboard. With no flag it prints a human block via{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">format_window</code>{" "}
          (src/format.rs lines 75-98).
        </p>
        <AnimatedCodeBlock code={cliJson} language="bash" filename="status line wiring" />
        <p className="text-zinc-700 leading-relaxed mt-6">
          Same numbers as the menu bar, machine-readable. The localhost bridge at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            curl http://127.0.0.1:63762/snapshots
          </code>{" "}
          returns the same payload without spawning the binary, which is the path to use if
          you are polling from a status line every couple of seconds.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">Install in four steps</h2>
        <StepTimeline steps={installSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">Invariants the chip holds to</h2>
        <AnimatedChecklist title="What the chip guarantees" items={watchInvariants} />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        heading="Hitting the 5-hour wall mid-refactor?"
        description="Twenty minutes to walk through the menu bar setup, server-truth quota, and how to wire the CLI into your Starship or tmux status line."
      />

      <FaqSection items={faqs} />

      <RelatedPostsGrid
        title="Related guides"
        subtitle="Adjacent walkthroughs on the same surface"
        posts={relatedPosts}
      />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Twenty-minute setup walkthrough"
      />
    </article>
  );
}
