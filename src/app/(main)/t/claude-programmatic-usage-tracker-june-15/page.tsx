import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  GlowCard,
  GradientText,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://claude-meter.com/t/claude-programmatic-usage-tracker-june-15";
const PUBLISHED = "2026-05-14";

export const metadata: Metadata = {
  title:
    "Claude programmatic usage tracker before June 15: the OAuth endpoint Anthropic does not document",
  description:
    "June 15, 2026 is the Sonnet 4 / Opus 4 deprecation deadline. Anthropic's official Usage & Cost Admin API only reports API-key (sk-ant-...) spend, not consumer Pro/Max plan windows. The programmatic tracker for Pro/Max is one CLI command (claude-meter --json) reading api.anthropic.com/api/oauth/usage with the Bearer token Claude Code already put in your keychain.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude programmatic usage tracker before June 15: the OAuth endpoint Anthropic does not document",
    description:
      "Pro/Max plan windows do not show up in Anthropic's Admin Usage & Cost API. They live on /api/oauth/usage, reachable with Claude Code's own keychain Bearer token. One CLI command, scriptable JSON, no API key.",
    url: PAGE_URL,
    type: "article",
  },
};

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com/" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  {
    name: "Programmatic usage tracker before June 15",
    url: PAGE_URL,
  },
];

const faqs = [
  {
    q: "Why is June 15 the deadline I keep seeing?",
    a: "Anthropic retires the original Claude Sonnet 4 (claude-sonnet-4-20250514) and Claude Opus 4 (claude-opus-4-20250514) on June 15, 2026. After that date, requests to those model IDs return errors. The replacements are Sonnet 4.5 / 4.6 and Opus 4.5 / 4.7. The official deprecation page is at platform.claude.com/docs/en/about-claude/model-deprecations. If you have any pipeline still pinned to the 20250514 model strings, this is the calendar date it stops working.",
  },
  {
    q: "Why does the migration matter for usage tracking specifically?",
    a: "Two reasons. First, the new models are weighted differently against the rolling 5-hour and weekly windows; an Opus 4.7 turn does not consume the same fraction of plan as an Opus 4 turn did. Anything you measured pre-migration is a stale baseline. Second, anyone running model-pinned scripts on a Pro or Max subscription needs a way to see the new burn rate from a script, not just from a settings page. That is the case the consumer plan never had a real answer for, and where the OAuth endpoint comes in.",
  },
  {
    q: "Doesn't Anthropic already publish a programmatic Usage & Cost API?",
    a: "Yes, two of them: the Usage & Cost Admin API at /v1/organizations/usage_report/messages and the Enterprise Analytics API. Both authenticate with an Admin API key (sk-ant-admin...), both report per-message token consumption and dollar cost for API-key traffic. Neither one exposes the consumer Pro / Max plan's 5-hour and 7-day windows. Those are a separate enforcement surface. If your usage runs through Claude Code, claude.ai chat, or anything else billed against a Pro / Max subscription rather than an API key, the official Usage & Cost API will not see your traffic.",
  },
  {
    q: "Where do consumer plan windows actually live then?",
    a: "On two undocumented endpoints. claude.ai/settings/usage renders from GET /api/organizations/{org_uuid}/usage with your browser session cookie. The same shape is reachable on api.anthropic.com via GET /api/oauth/usage with the OAuth Bearer token Claude Code already stashed in your macOS Keychain under service \"Claude Code-credentials\". Both routes return the same eight-float UsageResponse: five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork, plus an extra_usage block for the metered overage balance.",
  },
  {
    q: "What does claude-meter --json actually emit?",
    a: "A JSON array of UsageSnapshot objects. Each snapshot has org_uuid, browser, account_email, fetched_at, and the parsed usage / overage / subscription blocks. The shape is defined in src/models.rs lines 60-73. A typical day's array is about 1.5 KB, easy to pipe into Slack, a Starship segment, a tmux status line, an Alertmanager rule, or whatever else you script against. There is no API key to manage; the tool reads Claude Code's existing OAuth credentials and, if those are missing or expired, falls back to your already-logged-in browser cookies.",
  },
  {
    q: "Is calling api.anthropic.com/api/oauth/usage allowed?",
    a: "It is the same endpoint the running Claude Code CLI calls every time it refreshes its own usage cache. The Bearer token is the one Claude Code minted for you when you logged in (scope user:profile is enough). claude-meter does not refresh the token (Claude Code does that automatically with its refresh token); it just reads what is already in the keychain. The cadence is one request per minute, well under what an open Claude Code session generates. The endpoint is undocumented, which means Anthropic can rename a field and break the parse; not that they prohibit reading it.",
  },
  {
    q: "Can I do this without installing anything?",
    a: "Yes. Read the keychain entry, pull the accessToken field, and curl the endpoint yourself: security find-generic-password -s 'Claude Code-credentials' -w | jq -r .claudeAiOauth.accessToken | xargs -I {} curl -s https://api.anthropic.com/api/oauth/usage -H 'Authorization: Bearer {}' -H 'anthropic-version: 2023-06-01'. You get the same JSON. claude-meter just wraps that with token-expiry handling, multi-account dedupe, an optional menu bar surface, and a polished --json shape.",
  },
  {
    q: "What if I am not on macOS?",
    a: "Today, claude-meter is macOS only because the keychain reader is /usr/bin/security and the cookie fallback understands Chromium's Safe Storage on macOS. The OAuth endpoint itself is not platform-specific, so the same curl pattern works on Linux or Windows if you can locate Claude Code's stored credentials on your platform (Claude Code uses the OS keychain on each: libsecret on Linux, Credential Manager on Windows). The lugia19/Claude-Usage-Extension Chrome extension is the cross-platform option that reads the cookie path instead.",
  },
  {
    q: "Should I run this alongside ccusage?",
    a: "Yes. They answer different questions. ccusage walks ~/.claude/projects/*.jsonl and totals the tokens your local Claude Code CLI sent to Anthropic. claude-meter reads the server's plan-side utilization. ccusage tells you what your machine spent in tokens; claude-meter tells you what fraction of plan ceiling Anthropic counted that against. Local-token sums and server utilization can drift by 30-40 points and both still be correct readings of what they measure. Run both. They poll different sources.",
  },
  {
    q: "Will this break on June 16?",
    a: "No. The model deprecation removes the old model identifiers from the inference API; it does not touch the usage endpoint or the OAuth scope. claude-meter keeps reading the same JSON; the only thing that changes is the Sonnet / Opus weekly buckets start filling at the 4.5 / 4.6 / 4.7 burn rate instead of the 4.0 burn rate. The breakage to plan for is at the inference layer of any pinned-model script you run, not at the metering layer.",
  },
];

const oauthCallSrc = `// claude-meter/src/oauth.rs lines 27-28, 95-123 (abridged)
const KEYCHAIN_SERVICE: &str = "Claude Code-credentials";
// API base host: api.anthropic.com (no path; the OAuth routes below add it)

pub async fn fetch_oauth_snapshot() -> Result<UsageSnapshot> {
    let creds = read_token().context("read OAuth token from Keychain")?;

    let now_ms = Utc::now().timestamp_millis();
    if creds.expires_at > 0 && creds.expires_at < now_ms {
        anyhow::bail!(
            "Claude Code OAuth token expired. Run \`claude\` once to refresh."
        );
    }

    // /api/oauth/usage carries rolling-window utilization AND the
    // extra_usage block, so no second overage_spend_limit call needed.
    let usage: UsageResponse = get_json(
        &client, &creds.access_token,
        "https://api.anthropic.com/api/oauth/usage",
    ).await?;

    let profile: OAuthProfile = get_json(
        &client, &creds.access_token,
        "https://api.anthropic.com/api/oauth/profile",
    ).await?;

    Ok(UsageSnapshot {
        org_uuid: profile.organization.uuid,
        account_email: profile.account.email,
        usage: Some(usage),
        ..
    })
}`;

const keychainBlobSrc = `// claude-meter/src/oauth.rs lines 30-57 (the keychain blob shape)
// The blob \`security find-generic-password -s "Claude Code-credentials" -w\` returns:
{
  "claudeAiOauth": {
    "accessToken":      "sk-ant-oat01-...",
    "refreshToken":     "sk-ant-ort01-...",
    "expiresAt":        1778299177154,
    "scopes":           ["user:profile", "user:inference", ...],
    "subscriptionType": "max",
    "rateLimitTier":    "default_claude_max_20x"
  }
}

// scope user:profile is enough for /api/oauth/usage and /api/oauth/profile.
// Token rotation is not implemented in claude-meter on purpose: the running
// Claude Code CLI rotates it for you and writes the fresh value back to the
// same keychain entry.`;

const usageJsonSrc = `[
  {
    "org_uuid": "8b2e51e1-7b5a-4f1f-b3e2-aaaaaaaaaaaa",
    "browser":  "Claude Code",
    "account_email": "matt@example.com",
    "fetched_at": "2026-05-14T18:14:02.117Z",
    "usage": {
      "five_hour":             { "utilization": 92.0, "resets_at": "2026-05-14T19:36:00Z" },
      "seven_day":             { "utilization": 61.0, "resets_at": "2026-05-19T02:11:00Z" },
      "seven_day_sonnet":      { "utilization": 48.0, "resets_at": "2026-05-19T02:11:00Z" },
      "seven_day_opus":        { "utilization": 78.0, "resets_at": "2026-05-19T02:11:00Z" },
      "seven_day_oauth_apps":  { "utilization":  0.0, "resets_at": null },
      "seven_day_omelette":    { "utilization":  0.0, "resets_at": null },
      "seven_day_cowork":      { "utilization":  0.0, "resets_at": null },
      "extra_usage": {
        "is_enabled":    true,
        "monthly_limit": 2000,
        "used_credits":   420.0,
        "utilization":     21.0,
        "currency":      "USD"
      }
    },
    "errors": [],
    "stale":  false
  }
]`;

const cliSession = [
  { type: "command" as const, text: "claude-meter --json | jq '.[0].usage.five_hour'" },
  { type: "output" as const, text: '{' },
  { type: "output" as const, text: '  "utilization": 92.0,' },
  { type: "output" as const, text: '  "resets_at": "2026-05-14T19:36:00Z"' },
  { type: "output" as const, text: "}" },
  { type: "command" as const, text: "claude-meter --json | jq '.[0].usage.seven_day_opus.utilization'" },
  { type: "output" as const, text: "78.0" },
  {
    type: "command" as const,
    text: "claude-meter --json | jq -r '.[0] | \"5h \\(.usage.five_hour.utilization)% | 7d-opus \\(.usage.seven_day_opus.utilization)%\"'",
  },
  { type: "output" as const, text: "5h 92% | 7d-opus 78%" },
  {
    type: "success" as const,
    text: "Pipe that into your tmux right segment, your Slack /usage slash command, your Alertmanager rule, whatever.",
  },
];

const noInstallCurl = [
  {
    type: "command" as const,
    text: "TOKEN=$(security find-generic-password -s 'Claude Code-credentials' -w | jq -r .claudeAiOauth.accessToken)",
  },
  {
    type: "command" as const,
    text: "curl -s https://api.anthropic.com/api/oauth/usage \\\n  -H \"Authorization: Bearer $TOKEN\" \\\n  -H \"anthropic-version: 2023-06-01\" | jq .five_hour",
  },
  { type: "output" as const, text: '{' },
  { type: "output" as const, text: '  "utilization": 92.0,' },
  { type: "output" as const, text: '  "resets_at": "2026-05-14T19:36:00Z"' },
  { type: "output" as const, text: "}" },
  {
    type: "success" as const,
    text: "Two shell commands. No API key, no Cloudflare bypass, no cookie paste.",
  },
];

const walkthrough = [
  {
    title: "1. Confirm Claude Code has a current OAuth token",
    description:
      "security find-generic-password -s 'Claude Code-credentials' -w prints the JSON blob. Look for accessToken starting with sk-ant-oat01- and an expiresAt epoch in the future. If expired, run claude once and the CLI refreshes it back into the same keychain entry.",
  },
  {
    title: "2. Install the wrapper or run the curl yourself",
    description:
      "brew install --cask m13v/tap/claude-meter gives you a CLI that handles token-expiry, multi-account dedupe, and emits the parsed UsageSnapshot. If you want zero install, the curl block in the next section is the equivalent for the active Claude Code account only.",
  },
  {
    title: "3. Pipe --json into whatever script you already have",
    description:
      "Cron a Slack notifier on five_hour.utilization > 85, post to Alertmanager when extra_usage.utilization > 80, render seven_day_opus into your Starship prompt while you migrate model strings off the 20250514 IDs. The shape is stable across releases.",
  },
  {
    title: "4. Re-baseline after each model migration",
    description:
      "Switching one pipeline from claude-sonnet-4-20250514 to claude-sonnet-4-6 shifts the seven_day_sonnet float because the per-token weighting changes. Save a week of pre and post snapshots so you can see whether the new model burns the bucket faster or slower for your workload, before June 15 forces the migration on everyone else's traffic too.",
  },
];

const apiCompare = [
  {
    feature: "Endpoint",
    ours: "GET api.anthropic.com/api/oauth/usage",
    competitor: "POST /v1/organizations/usage_report/messages",
  },
  {
    feature: "Auth",
    ours: "OAuth Bearer (sk-ant-oat01-) from Claude Code keychain, scope user:profile",
    competitor: "Admin API key (sk-ant-admin-), org admin role required",
  },
  {
    feature: "What it reports",
    ours: "Pro / Max plan rolling 5-hour and 7-day windows + extra_usage",
    competitor: "API-key (sk-ant-...) per-message tokens and USD cost",
  },
  {
    feature: "Sees Claude Code on a Max subscription",
    ours: "Yes (the same token Claude Code itself uses)",
    competitor: "No (Pro / Max is not API-key billed)",
  },
  {
    feature: "Sees raw API traffic billed to a console workspace",
    ours: "No",
    competitor: "Yes, with workspace + service-tier breakdowns",
  },
  {
    feature: "Available to individual Pro / Max subscribers",
    ours: "Yes",
    competitor: "No (Admin API key requires org admin)",
  },
  {
    feature: "Documented",
    ours: "No (undocumented; same endpoint Claude Code's --usage uses)",
    competitor: "Yes (platform.claude.com/docs)",
  },
  {
    feature: "Best for",
    ours: "Tracking how close you are to a 429 inside a Claude Code loop",
    competitor: "Cost attribution across an org's API workspaces",
  },
];

const relatedPosts = [
  {
    href: "/t/claude-code-usage-tracker",
    title: "Claude Code usage tracker: there are two of them",
    excerpt:
      "Local-token tracker (ccusage) vs server-quota tracker (claude-meter). Why the numbers disagree and why you want both.",
    tag: "Compare",
  },
  {
    href: "/t/open-source-claude-usage-trackers-april-2026",
    title: "Open source Claude usage trackers, April 2026 field guide",
    excerpt:
      "Seven OSS trackers, sorted by what they actually read. Local JSONL vs the same private endpoint claude.ai/settings/usage renders.",
    tag: "Reference",
  },
  {
    href: "/t/claude-rate-limit-dashboard",
    title: "Claude rate-limit dashboard for Pro and Max",
    excerpt:
      "No first-party rate-limit dashboard exists for Pro / Max. Walking what a real one has to render: eight floats, color thresholds, multi-account tiles.",
    tag: "Dashboard",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude programmatic usage tracker before June 15: the OAuth endpoint Anthropic does not document",
  description:
    "June 15, 2026 retires Sonnet 4 and Opus 4. Anthropic's Admin Usage & Cost API only sees API-key spend, not consumer Pro/Max plan windows. The programmatic tracker for Pro/Max is one CLI command reading /api/oauth/usage with the Bearer token Claude Code already put in your keychain.",
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

export default function ClaudeProgrammaticUsageTrackerJune15Page() {
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
        <p className="text-sm uppercase tracking-wider text-teal-700 font-semibold mb-4">
          Deadline: June 15, 2026
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-zinc-900">
          A programmatic Claude usage tracker before June 15, written in{" "}
          <GradientText>one CLI command</GradientText> against an endpoint Anthropic does not document.
        </h1>
        <p className="mt-6 text-lg text-zinc-700 leading-relaxed max-w-3xl">
          Sonnet 4 and Opus 4 retire on June 15, 2026. Every pipeline pinned to
          <code className="bg-zinc-100 px-1.5 py-0.5 mx-1 rounded text-sm font-mono">
            claude-sonnet-4-20250514
          </code>
          or
          <code className="bg-zinc-100 px-1.5 py-0.5 mx-1 rounded text-sm font-mono">
            claude-opus-4-20250514
          </code>
          breaks that day. The migration itself is a one-line model-string
          change. The harder part: knowing whether the new model burns your
          plan window faster than the old one did. Anthropic&rsquo;s official
          Usage &amp; Cost API does not see the Pro / Max plan windows.
          <code className="bg-zinc-100 px-1.5 py-0.5 mx-1 rounded text-sm font-mono">
            claude-meter --json
          </code>
          does, and it reads them with the OAuth Bearer token Claude Code
          already put in your keychain.
        </p>
      </header>

      <div className="pt-2">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="7 min read"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <GlowCard>
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold">
              Direct answer (verified 2026-05-14)
            </p>
            <p className="mt-3 text-zinc-900 text-lg leading-relaxed">
              For consumer <strong>Pro and Max</strong> plans, the programmatic
              tracker is{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-sm">
                claude-meter --json
              </code>
              , which calls{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-sm">
                GET api.anthropic.com/api/oauth/usage
              </code>{" "}
              with the OAuth Bearer token Claude Code stores in macOS Keychain
              under service{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-sm">
                Claude Code-credentials
              </code>
              . That endpoint returns the same eight-float UsageResponse the
              claude.ai settings page renders.{" "}
              <strong>
                Anthropic&rsquo;s official Usage &amp; Cost Admin API (
                <a
                  className="text-teal-700 underline"
                  href="https://platform.claude.com/docs/en/build-with-claude/usage-cost-api"
                >
                  docs
                </a>
                ) only reports API-key (sk-ant-...) spend
              </strong>
              ; consumer Pro / Max plan rolling-window utilization is not on
              that surface. June 15, 2026 is the Sonnet 4 / Opus 4 deprecation
              date (
              <a
                className="text-teal-700 underline"
                href="https://platform.claude.com/docs/en/about-claude/model-deprecations"
              >
                official deprecations page
              </a>
              ), which is why a working tracker matters before then: the new
              models weight against your plan window differently and any
              baseline measured pre-migration is stale.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Two usage APIs, only one of them sees Pro / Max plans
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Anthropic ships a real, documented, programmatic usage API. It is the
          right tool for the wrong job. Side by side:
        </p>
        <ComparisonTable
          productName="api.anthropic.com /api/oauth/usage (used by claude-meter)"
          competitorName="Anthropic Admin Usage &amp; Cost API"
          rows={apiCompare}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          If your usage runs through Claude Code on a Max subscription, the
          official Admin API will report zero traffic for it. The metering
          surface for Pro and Max is a different endpoint, on a different auth,
          with a different shape. The deprecation deadline does not change that;
          it just makes the gap more visible because the gap is exactly where
          your migration risk sits.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The four steps that get you a scriptable plan-usage feed
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-6">
          This is the whole flow. None of it is more than a couple of shell
          commands; the longest step is waiting a week for a re-baseline.
        </p>
        <StepTimeline steps={walkthrough} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The endpoint claude-meter actually calls
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Two GETs, one OAuth Bearer, no Cloudflare. The cleanest source for
          the active Claude Code account, and the only path that does not
          require touching a browser cookie. Source from{" "}
          <a
            className="text-teal-700 underline"
            href="https://github.com/m13v/claude-meter/blob/main/src/oauth.rs"
          >
            claude-meter/src/oauth.rs
          </a>
          :
        </p>
        <AnimatedCodeBlock
          code={oauthCallSrc}
          language="rust"
          filename="claude-meter/src/oauth.rs"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The keychain entry that makes this work is the same one the running
          Claude Code CLI writes when you log in. Its shape, with the field
          names that matter:
        </p>
        <AnimatedCodeBlock
          code={keychainBlobSrc}
          language="javascript"
          filename="security find-generic-password -s 'Claude Code-credentials' -w"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The token rotates on its own. Claude Code holds the refresh token
          and the right OAuth client credentials and writes the new
          accessToken back into the same keychain entry. claude-meter just
          reads whatever is there. If the token expired and Claude Code is not
          running to refresh it, claude-meter falls back to the browser-cookie
          path that the menu bar also uses.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the JSON looks like
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          A single snapshot. The shape is stable across releases; new fields
          are added, old fields are not removed silently. About 1.5 KB on a
          normal day:
        </p>
        <AnimatedCodeBlock
          code={usageJsonSrc}
          language="json"
          filename="claude-meter --json"
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          Eight utilization floats, each in 0..100. The first four
          (five_hour, seven_day, seven_day_sonnet, seven_day_opus) are the
          ones the Settings page renders. The next three are weekly buckets
          for OAuth-app traffic, the &ldquo;omelette&rdquo; bucket, and the
          Cowork bucket; they exist on the wire even if the Settings UI does
          not show them. The extra_usage block is the metered-billing balance
          Anthropic shipped in April 2026; utilization here is dollar-based
          rather than token-based.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Use it from a script
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Three jq one-liners that are good enough to paste into a Slack
          notifier, a Starship segment, or a tmux right-status:
        </p>
        <TerminalOutput title="claude-meter --json | jq" lines={cliSession} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Or skip the install entirely
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          If you want to see the JSON without touching a brew tap, the curl
          equivalent is two commands. It only sees the account Claude Code is
          logged into; the wrapper is for multi-account dedupe and a menu bar
          surface, not for the call itself:
        </p>
        <TerminalOutput
          title="curl /api/oauth/usage with Claude Code's keychain Bearer"
          lines={noInstallCurl}
        />
        <p className="text-zinc-700 leading-relaxed text-lg mt-6">
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            anthropic-version
          </code>{" "}
          header is required;{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            2023-06-01
          </code>{" "}
          is the only value that has worked across this endpoint&rsquo;s
          history. No Referer header is needed for the OAuth route (unlike the
          claude.ai cookie route, which 403s without a settings/usage Referer).
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the deadline matters more than the model swap
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The June 15 migration itself is a one-line change. Replace
          <code className="bg-zinc-100 px-1.5 py-0.5 mx-1 rounded text-sm font-mono">
            claude-sonnet-4-20250514
          </code>
          with
          <code className="bg-zinc-100 px-1.5 py-0.5 mx-1 rounded text-sm font-mono">
            claude-sonnet-4-6
          </code>
          (or
          <code className="bg-zinc-100 px-1.5 py-0.5 mx-1 rounded text-sm font-mono">
            claude-opus-4-7
          </code>
          for the Opus side) and your inference layer keeps working. What you
          do not get told is what the swap does to your{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_sonnet
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            seven_day_opus
          </code>{" "}
          buckets. Per-token plan weighting can shift across model versions
          and the public docs do not publish the weights. A week of snapshots
          captured before the swap and a week after is the only way to see
          whether you should expect to hit the rolling 5-hour wall earlier or
          later post-migration.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          Capture cadence: one snapshot per minute is enough to spot a window
          tipping over within the same poll interval the menu bar uses. If
          you are running an agentic Claude Code loop, that resolution is
          fine; if you are running batch jobs, every five minutes is plenty.
          The endpoint does not rate-limit at this cadence on a normal Pro or
          Max session.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/claude-meter"
          site="claude-meter"
          heading="Hit a wall mid-migration?"
          description="Half-hour call to walk through the OAuth endpoint, the curl, and what the snapshot drift looks like in your specific workload before June 15."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          FAQ
        </h2>
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-20 mb-20">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="The rest of the rabbit hole, for when the snapshot raises more questions than it answers."
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/claude-meter"
        site="claude-meter"
        description="Walk through the OAuth endpoint and the migration baseline before June 15."
      />
    </article>
  );
}
