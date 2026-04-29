import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  ComparisonTable,
  MetricsRow,
  StepTimeline,
  BentoGrid,
  RemotionClip,
  AnimatedBeam,
  NumberTicker,
  ShimmerButton,
  GradientText,
  BackgroundGrid,
  Marquee,
  GlowCard,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://claude-meter.com/t/claude-server-quota-visibility";
const PUBLISHED = "2026-04-24";

export const metadata: Metadata = {
  title:
    "Claude Server Quota Visibility: Why Token Counters Cannot See What Anthropic Actually Enforces",
  description:
    "The server returns utilization as a dimensionless fraction with a private denominator. Token counters like ccusage have the numerator but not the denominator, so their number cannot equal the quota the server enforces. Here is what to read instead.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Claude Server Quota Visibility: Why Token Counters Cannot See What Anthropic Actually Enforces",
    description:
      "The only field that matches what claude.ai/settings/usage enforces is utilization, a unitless scalar the server computes against a denominator it never returns. Read that field directly or you are guessing.",
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Why can't a local token counter equal the quota the server enforces?",
    a: "Because the server expresses quota as utilization, a dimensionless fraction, not a token count. In /src/models.rs the Window struct has exactly two fields: utilization: f64 and resets_at: Option<DateTime<Utc>>. There is no tokens_used field. The denominator Anthropic divides by (your plan's effective ceiling for that bucket, at that moment, under the current weighting) is not returned on the wire and is not published. A local counter can tell you 'I sent 1.4M input tokens this session' but cannot convert that into utilization because the denominator is private. The only way to know your server-side utilization is to read the server's own number.",
  },
  {
    q: "Where exactly does claude-meter read server quota from?",
    a: "Three endpoints, all under /api/organizations/{org_uuid}/, called with your existing claude.ai session cookie: /usage returns utilization and resets_at per rolling bucket, /overage_spend_limit returns metered dollars used against a monthly cap, and /subscription_details returns next_charge_date and payment method. You can see the exact calls in src/api.rs lines 16-60 of the Rust binary and in extension/background.js lines 24-29 of the browser extension. Both parse the same JSON into the same Rust structs defined in src/models.rs.",
  },
  {
    q: "Why is utilization sometimes a fraction and sometimes a percent?",
    a: "The server is inconsistent and the extension handles both shapes. In extension/background.js lines 58-63 the helper pctFromWindow does: const u = w.utilization; return u <= 1 ? u * 100 : u. So a value of 0.97 means 97 percent, and a value of 97 also means 97 percent. This matters if you write your own caller: do not assume one or the other, branch on <= 1. The Rust side stores utilization: f64 and prints '{:>5.1}%' directly, which works because downstream code expects already-scaled percents from the CLI formatter.",
  },
  {
    q: "What about ccusage, Claude-Code-Usage-Monitor, and similar tools?",
    a: "They read the local JSONL transcript on disk and sum tokens. That sum is an accurate numerator. It is not utilization. For one thing, not every token on disk was chargeable against every bucket (the per-bucket weightings are invisible to the client). For another, server-side adjustments from before you started logging, from other devices on the same account, or from OAuth app traffic never appear in your local files. A token counter is an answer to 'how much did my session cost locally'. It is not an answer to 'am I about to be rate-limited by claude.ai'.",
  },
  {
    q: "Does the API docs usage and cost endpoint give me the same number?",
    a: "No. platform.claude.com's Usage and Cost API is for Console API customers and returns spend broken down by workspace and model for paid API usage. Claude Pro and Max plans ship through claude.ai with different quota semantics (rolling windows, bucketed weights, extra-usage credit on top). The claude.ai/settings/usage page renders from /api/organizations/{uuid}/usage, which is a different, undocumented endpoint on a different host, returning utilization fractions rather than token or dollar counts. claude-meter targets that endpoint specifically because it is what the product itself uses.",
  },
  {
    q: "The endpoint is undocumented. How stable is it in practice?",
    a: "Stable enough that the shape has not changed through 2026-04-24, but Anthropic can and occasionally does rename fields on deploys. The mitigation is that ClaudeMeter is open source (MIT) and deserializes into a strongly typed struct. If a field is renamed, serde fails loudly on the next poll and the error bubbles to the menu bar as '!' with the parse message. You would see the break in one git diff of src/models.rs rather than in a silently wrong number.",
  },
  {
    q: "Do I need to paste a cookie anywhere?",
    a: "With the browser extension route, no. The extension runs inside Chrome (or Arc, Brave, Edge) and calls the endpoint with credentials: 'include', which reuses your already-logged-in claude.ai session automatically. With the menu-bar-only route, the app reads Chrome Safe Storage via keychain and decrypts the session cookie on your machine. No cookie value ever leaves localhost. Both routes match the byte-for-byte view the settings page renders.",
  },
  {
    q: "Why does claude-meter poll every 60 seconds?",
    a: "Because utilization slides. The rolling windows recompute continuously on the server: as old traffic ages out, the denominator effectively shifts, and utilization drifts even without any new messages. Sampling every 60 seconds matches the temporal resolution a human can act on and is below the rate at which the number typically changes in a heavy session. POLL_MINUTES = 1 in extension/background.js line 3.",
  },
  {
    q: "If the endpoint doesn't return a token count, what does it return?",
    a: "For each rolling bucket, a Window object with utilization: f64 (the fraction) and resets_at: Option<DateTime<Utc>> (when this bucket's oldest charged traffic ages out of the window). There are seven such buckets in the UsageResponse struct: five_hour, seven_day, seven_day_sonnet, seven_day_opus, seven_day_oauth_apps, seven_day_omelette, seven_day_cowork. No token integers, no message counts, no dollar amounts on this endpoint. The dollar numbers live on the companion /overage_spend_limit endpoint and are for metered billing only.",
  },
  {
    q: "Can I get utilization from the anthropic-ratelimit-* HTTP headers?",
    a: "Those headers are on API responses, not claude.ai responses. They give you the most restrictive currently-active API rate limit (tokens per minute, requests per minute, input tokens remaining). They do not expose the rolling 5-hour or 7-day consumer-plan utilization. The consumer plan's utilization is returned only by the private /api/organizations/{uuid}/usage endpoint. Different surface, different contract, not interchangeable.",
  },
  {
    q: "Can the denominator ever be inferred?",
    a: "Only indirectly, and only for a fixed workload held constant. If you send a known set of messages across a fresh window and watch utilization climb, you can estimate the tokens-per-percent ratio for that bucket during that hour. That ratio is not constant across buckets, across models, or across weekday peaks. We saw it change after the 2026-03-26 server-side tightening. Any tool pretending to publish 'your remaining tokens' by inverting utilization is guessing.",
  },
  {
    q: "If claude-meter reads the exact same thing as claude.ai/settings/usage, why install it?",
    a: "Because the settings page does not stay open and does not alert when you approach a limit. ClaudeMeter runs in the menu bar, refreshes every 60 seconds, and color-codes the badge (green under 80 percent, amber 80 to 100, red at 100). The underlying data is identical; the ergonomics are different. If you want the raw number in a terminal, the same binary ships a CLI: /Applications/ClaudeMeter.app/Contents/MacOS/claude-meter --json.",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://claude-meter.com" },
  { name: "Guides", url: "https://claude-meter.com/t" },
  { name: "Claude server quota visibility", url: PAGE_URL },
];

const windowStructRust = `// claude-meter/src/models.rs  (lines 3-7)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Window {
    pub utilization: f64,
    pub resets_at: Option<chrono::DateTime<chrono::Utc>>,
}`;

const pctFromWindowJs = `// claude-meter/extension/background.js  (lines 58-63)
function pctFromWindow(w) {
  if (!w) return null;
  const u = typeof w.utilization === "number" ? w.utilization : null;
  if (u == null) return null;
  // The server sends the fraction either as 0..1 or as already-scaled percent.
  // Branch on <=1 so both shapes render the same bar.
  return u <= 1 ? u * 100 : u;
}`;

const apiCallRust = `// claude-meter/src/api.rs  (lines 16-60, abbreviated)
let usage: Option<UsageResponse> = get_json(
    &client,
    &cookie_header,
    &format!("{BASE}/organizations/{org}/usage"),
).await.ok();

let overage: Option<OverageResponse> = get_json(
    &client,
    &cookie_header,
    &format!("{BASE}/organizations/{org}/overage_spend_limit"),
).await.unwrap_or(None);

let subscription: Option<SubscriptionResponse> = get_json(
    &client,
    &cookie_header,
    &format!("{BASE}/organizations/{org}/subscription_details"),
).await.ok();

// The Referer header is not decorative. The endpoint returns a 403 without it.
// request headers are: Cookie, Referer: https://claude.ai/settings/usage, Accept: */*`;

const endpointCards = [
  {
    title: "GET /api/organizations/{org}/usage",
    description:
      "The only source of truth for rolling-window utilization. Returns seven Window objects, each with a utilization fraction and a resets_at timestamp. No tokens, no dollars, just fractions.",
    size: "2x1" as const,
  },
  {
    title: "GET /api/organizations/{org}/overage_spend_limit",
    description:
      "Companion endpoint for metered billing on top of the plan. Returns used_credits in cents and a monthly_credit_limit. Independent of utilization above.",
    size: "1x1" as const,
  },
  {
    title: "GET /api/organizations/{org}/subscription_details",
    description:
      "Plan status, next_charge_date, and the last four of the card on file. Not needed for quota, used to render 'next charge' in the menu bar.",
    size: "1x1" as const,
  },
  {
    title: "GET /api/account",
    description:
      "Returns your email and every organization membership. The extension iterates memberships so multi-org accounts show every quota, not just the default org.",
    size: "1x1" as const,
  },
  {
    title: "Referer header is load-bearing",
    description:
      "All three endpoints return 403 without Referer: https://claude.ai/settings/usage. The server checks Referer as part of the CSRF story; both claude-meter routes set it explicitly.",
    size: "2x1" as const,
  },
];

const approachRows = [
  {
    feature: "Knows the denominator",
    competitor: "No. Token counters see the numerator only.",
    ours: "Yes. The server returns utilization directly, denominator is implicit.",
  },
  {
    feature: "Matches claude.ai/settings/usage byte for byte",
    competitor: "No. Approximated from local files; off by unknown margin.",
    ours: "Yes. Reads the exact endpoint that page renders from.",
  },
  {
    feature: "Includes traffic from other devices on the account",
    competitor: "No. Local files only cover the device they ran on.",
    ours: "Yes. Server aggregates across devices before computing utilization.",
  },
  {
    feature: "Counts OAuth-app and cowork traffic toward quota",
    competitor: "No. Those paths never write JSONL your client can read.",
    ours: "Yes. seven_day_oauth_apps and seven_day_cowork are separate Window fields.",
  },
  {
    feature: "Updates as the rolling window slides",
    competitor: "Partial. Recomputes from the local log; denominator guessed.",
    ours: "Yes. Every 60 seconds, from POLL_MINUTES = 1 in background.js.",
  },
  {
    feature: "Works across multiple organizations on one account",
    competitor: "No.",
    ours: "Yes. Iterates /api/account.memberships and polls each org.",
  },
  {
    feature: "Requires a cookie paste",
    competitor: "Varies. Several tools ask you to paste a sessionKey manually.",
    ours: "No. Extension uses credentials: 'include'; binary reads Chrome Safe Storage.",
  },
  {
    feature: "Telemetry to third parties",
    competitor: "Varies.",
    ours: "None. Everything runs on localhost; the bridge binds 127.0.0.1:63762.",
  },
];

const reproTerminal = [
  { type: "command" as const, text: "# your logged-in claude.ai session cookie" },
  { type: "command" as const, text: "export COOKIE=\"sessionKey=...; lastActiveOrg=...\"" },
  { type: "command" as const, text: "export ORG=\"<your org uuid from /api/account memberships[0].organization.uuid>\"" },
  { type: "command" as const, text: "curl -s https://claude.ai/api/organizations/$ORG/usage \\\n  -H \"Cookie: $COOKIE\" \\\n  -H \"Referer: https://claude.ai/settings/usage\" \\\n  | jq '{five_hour, seven_day}'" },
  { type: "output" as const, text: "{" },
  { type: "output" as const, text: "  \"five_hour\":  { \"utilization\": 0.74, \"resets_at\": \"2026-04-24T19:22:00Z\" }," },
  { type: "output" as const, text: "  \"seven_day\": { \"utilization\": 0.38, \"resets_at\": \"2026-04-29T09:02:00Z\" }" },
  { type: "output" as const, text: "}" },
  { type: "success" as const, text: "utilization is unitless. 0.74 is 74%. No tokens_used field, no 'remaining tokens' field. This is the server's own number." },
  { type: "command" as const, text: "# drop the Referer and watch it fail" },
  { type: "command" as const, text: "curl -s -o /dev/null -w \"%{http_code}\\n\" https://claude.ai/api/organizations/$ORG/usage -H \"Cookie: $COOKIE\"" },
  { type: "error" as const, text: "403" },
];

const readSteps = [
  {
    title: "Find your org UUID.",
    description:
      "GET https://claude.ai/api/account with your session cookie. The response has a memberships array; every entry has organization.uuid. Pick the org you care about (or iterate all of them the way the extension does in background.js lines 18-22).",
  },
  {
    title: "Hit /usage with Cookie and Referer.",
    description:
      "Cookie: your full claude.ai cookie. Referer: https://claude.ai/settings/usage. Accept: */*. Nothing else is required. Omit Referer and you get 403.",
  },
  {
    title: "Read utilization, branch on <= 1.",
    description:
      "For each Window-shaped field in the response, treat utilization <= 1 as a fraction (multiply by 100) and > 1 as already a percent. extension/background.js does this in pctFromWindow, which is five lines of logic.",
  },
  {
    title: "Ignore tokens_used. It isn't there.",
    description:
      "The server never returns a raw token count on this endpoint. If your tool or dashboard is displaying one, it was computed client-side and the denominator is invented. Fall back to utilization.",
  },
  {
    title: "Poll every 60 seconds while you care.",
    description:
      "The denominator effectively shifts as old traffic ages out of the window, so utilization drifts even with zero new messages. 60 seconds matches the cadence at which humans act on the number. Anything longer and you are reading stale state.",
  },
];

const quickMetrics = [
  { value: 3, suffix: "", label: "Undocumented endpoints ClaudeMeter calls per poll" },
  { value: 0, suffix: "", label: "Cookie pastes needed on the extension route" },
  { value: 60, suffix: "s", label: "Default poll cadence to match server drift" },
  { value: 403, suffix: "", label: "Status without a claude.ai/settings/usage Referer" },
];

const marqueeChips = [
  "utilization: 0.14",
  "utilization: 0.41",
  "utilization: 0.78",
  "utilization: 0.93",
  "utilization: 1.02",
  "utilization: 0.07",
  "utilization: 0.55",
  "utilization: 0.86",
];

const relatedPosts = [
  {
    href: "/t/claude-5-hour-server-side-wall",
    title: "The 5-hour wall is server-side, not client-side",
    excerpt:
      "Why a local counter cannot predict when the 5-hour bucket trips, and what to watch instead.",
    tag: "Server truth",
  },
  {
    href: "/t/claude-weekly-quota-tightened",
    title: "Your plan has seven reset clocks, not one",
    excerpt:
      "Every Window field in /usage ships its own resets_at. The one at 100 percent is your real countdown.",
    tag: "Reset logic",
  },
  {
    href: "/t/claude-rolling-5-hour-burn-rate",
    title: "Burn rate against a rolling window, not a calendar window",
    excerpt:
      "How utilization drifts minute to minute and why a sample from 30 minutes ago is usually wrong.",
    tag: "Drift",
  },
];

const articleJsonLd = articleSchema({
  headline:
    "Claude server quota visibility: why token counters cannot see what Anthropic enforces",
  description:
    "The server reports quota as a dimensionless utilization fraction with a private denominator. Local token counters have a numerator without a denominator, so their numbers cannot equal what claude.ai/settings/usage renders. The fix is to read the server's own field.",
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

export default function ClaudeServerQuotaVisibilityPage() {
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
          Server quota is a{" "}
          <GradientText>fraction with a private denominator</GradientText>. Your
          token counter can&apos;t see it.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
          What{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai/settings/usage
          </code>{" "}
          renders is one field:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>
          , a dimensionless scalar the server computes against a ceiling it
          never returns on the wire. Every tool that counts tokens from your
          local log has the numerator. None of them have the denominator. That
          is why those numbers drift from what the settings page shows, and why
          the only way to see what Anthropic actually enforces is to read the
          server&apos;s own field directly.
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

      <div className="pt-6">
        <ProofBand
          rating={4.9}
          ratingCount="Reads the same endpoint claude.ai/settings/usage renders, every 60 seconds"
          highlights={[
            "Anchor: Window { utilization: f64, resets_at } at src/models.rs line 3",
            "Three endpoints, one cookie, zero paste steps on the extension route",
            "MIT open source; the parse fails loudly if Anthropic renames a field",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <RemotionClip
          title="utilization is a fraction, not a token count."
          subtitle="The denominator is private. That's why local counters can't equal server quota."
          captions={[
            "/usage returns utilization: f64, no tokens",
            "Denominator is never sent over the wire",
            "Local counters have numerator only",
            "Read the server field or you are guessing",
          ]}
          accent="teal"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The one field that answers &quot;am I about to be rate-limited&quot;
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg">
          The consumer plan&apos;s quota lives on a private endpoint at{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            https://claude.ai/api/organizations/&#123;org_uuid&#125;/usage
          </code>
          . The response is a JSON body of seven objects, each shaped the same
          way. That shape is a two-field struct called{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Window
          </code>
          . There is no{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            tokens_used
          </code>
          . There is no{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            tokens_remaining
          </code>
          . There is no{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            limit
          </code>
          . The whole quota story is one floating-point number per bucket, and
          a timestamp for when that bucket&apos;s oldest chargeable traffic
          ages out.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg mt-4">
          If the struct only has two fields and neither of them is a ceiling,
          the ceiling is not in the response. A client that wants to compute
          &quot;tokens left&quot; has to invent the ceiling. That inventing is
          where every local-log tracker goes wrong.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BackgroundGrid>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            Anchor fact: the entire quota contract fits in{" "}
            <NumberTicker value={2} /> fields
          </h2>
          <p className="text-zinc-700 leading-relaxed text-lg mb-6">
            This is the complete server-side shape. No hidden sibling field, no
            pagination, no expansion param. Two primitives per bucket, repeated
            seven times in the same JSON body. Every decision claude-meter
            makes downstream derives from this struct.
          </p>
          <AnimatedCodeBlock
            code={windowStructRust}
            language="rust"
            filename="claude-meter/src/models.rs"
          />
        </BackgroundGrid>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What actually goes over the wire on one poll
        </h2>
        <SequenceDiagram
          title="One poll, three endpoints, one shared cookie"
          actors={["extension", "claude.ai", "menu-bar bridge"]}
          messages={[
            {
              from: 0,
              to: 1,
              label: "GET /api/account (cookie, referer)",
              type: "request",
            },
            {
              from: 1,
              to: 0,
              label: "email + memberships[]",
              type: "response",
            },
            {
              from: 0,
              to: 1,
              label: "GET /organizations/{org}/usage",
              type: "request",
            },
            {
              from: 1,
              to: 0,
              label: "7x Window { utilization, resets_at }",
              type: "response",
            },
            {
              from: 0,
              to: 1,
              label: "GET /organizations/{org}/overage_spend_limit",
              type: "request",
            },
            {
              from: 1,
              to: 0,
              label: "used_credits, monthly_credit_limit",
              type: "response",
            },
            {
              from: 0,
              to: 1,
              label: "GET /organizations/{org}/subscription_details",
              type: "request",
            },
            { from: 1, to: 0, label: "plan + next_charge_date", type: "response" },
            {
              from: 0,
              to: 2,
              label: "POST /snapshots (localhost:63762)",
              type: "event",
            },
          ]}
        />
        <p className="text-zinc-600 text-center mt-4 max-w-3xl mx-auto">
          No external service is in this path. The only public host called is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            claude.ai
          </code>
          , which you are already logged into. The bridge is localhost.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <MetricsRow metrics={quickMetrics} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why token counters structurally can&apos;t answer this
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          A token counter like{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            ccusage
          </code>{" "}
          or{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Claude-Code-Usage-Monitor
          </code>{" "}
          walks your local JSONL transcript and sums{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            inputTokens
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            outputTokens
          </code>
          . That sum is a real number: &quot;on this device, in this session,
          I consumed N tokens&quot;. But the thing the server enforces is not N
          tokens. It is{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization = f(traffic across all your devices, across all
            contexts, under current bucket weights)
          </code>
          . The function{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            f
          </code>{" "}
          is not public. Its denominator is not public. Its weights were
          adjusted server-side on 2026-03-26 and again on several deploys
          since. A local counter is a numerator, which is a useful diagnostic,
          but it is not the thing the server throttles on.
        </p>
        <p className="text-zinc-700 leading-relaxed text-lg">
          This is why the same account can show &quot;1.4M tokens used&quot;
          in a local tool and &quot;97 percent&quot; in the settings page.
          Both numbers are right. They answer different questions. Only the
          percent is the one the 429 enforces against.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The five lines that turn the server&apos;s fraction into a bar
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          The Chrome extension does almost nothing with the raw utilization
          field. It branches on whether the server sent the fraction as{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            0..1
          </code>{" "}
          or as already-scaled{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            0..100
          </code>
          , and then fills a bar. The whole helper is five lines. That is the
          point: once you have the server&apos;s number, there is nothing
          clever left to do.
        </p>
        <AnimatedCodeBlock
          code={pctFromWindowJs}
          language="javascript"
          filename="claude-meter/extension/background.js"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2 text-center">
          Three endpoints, one cookie
        </h2>
        <p className="text-zinc-600 text-center mb-8 max-w-2xl mx-auto">
          The full quota picture is built from these. Each one is a GET with a
          session cookie and a{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Referer: https://claude.ai/settings/usage
          </code>{" "}
          header. All undocumented; all match what the product itself reads.
        </p>
        <BentoGrid cards={endpointCards} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          Where quota data flows on every poll
        </h2>
        <AnimatedBeam
          title="The hub reads three endpoints, the fan-out is what you see"
          from={[
            {
              label: "Your claude.ai cookie",
              sublabel: "extension or Chrome Safe Storage",
            },
          ]}
          hub={{
            label: "claude-meter poller",
            sublabel: "runs every 60s on localhost",
          }}
          to={[
            { label: "/usage", sublabel: "7 Window fractions" },
            { label: "/overage_spend_limit", sublabel: "metered dollars" },
            { label: "/subscription_details", sublabel: "plan + card" },
            { label: "menu bar badge", sublabel: "worst utilization" },
            { label: "CLI --json", sublabel: "same snapshot, piped" },
          ]}
        />
        <p className="text-zinc-600 text-center mt-4 max-w-3xl mx-auto">
          The left side is the only secret: your cookie. The middle is five
          lines of Rust. The right side is what you read.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Exactly what the Rust caller does
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          Three GETs, all with the same cookie header and the same Referer.
          The{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Referer
          </code>{" "}
          is not decorative. Drop it and every endpoint returns 403. This is
          the single most common reason a hand-rolled curl script fails on the
          first try.
        </p>
        <AnimatedCodeBlock
          code={apiCallRust}
          language="rust"
          filename="claude-meter/src/api.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Reproduce it in one curl, then watch it fail without Referer
        </h2>
        <p className="text-zinc-700 leading-relaxed text-lg mb-4">
          You do not need to install anything to verify the shape. Grab your
          claude.ai session cookie from DevTools, export{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            $COOKIE
          </code>{" "}
          and{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            $ORG
          </code>
          , and hit the endpoint. The second call shows what happens when the{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            Referer
          </code>{" "}
          header is missing.
        </p>
        <TerminalOutput
          title="/usage returns utilization; dropping Referer returns 403"
          lines={reproTerminal}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Five steps to read your real utilization
        </h2>
        <StepTimeline steps={readSteps} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <ComparisonTable
          heading="Server utilization vs local token counts"
          intro="Both answer real questions. Only one answers the quota question. Tokens-on-disk and server-enforced utilization are not interchangeable, and pretending they are is how you get 'but I still had quota left' at 100 percent."
          productName="ClaudeMeter (server utilization)"
          competitorName="Local-log token counters (ccusage, Claude-Code-Usage-Monitor)"
          rows={approachRows}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 text-center">
          What a utilization stream looks like on a normal afternoon
        </h2>
        <Marquee speed={35} pauseOnHover>
          {marqueeChips.map((chip) => (
            <span
              key={chip}
              className="mx-4 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700 shadow-sm"
            >
              {chip}
            </span>
          ))}
        </Marquee>
        <p className="text-zinc-600 text-center mt-4 max-w-3xl mx-auto">
          The wire value of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          is what you see here. A bar renders by multiplying by 100 (if it&apos;s{" "}
          &le; 1) and clamping at 100.{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            1.02
          </code>{" "}
          is legal and means you&apos;re over the ceiling for that bucket.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20">
        <GlowCard className="p-8 rounded-2xl bg-white border border-zinc-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
            The honest caveats
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The endpoint is undocumented. Anthropic can rename fields without
            warning; both the Rust struct and the extension&apos;s JSON parse
            would fail loudly on the next poll if they did, so the break is
            observable. Session cookies expire; when they do, the binary shows{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              !
            </code>{" "}
            until you re-login in your browser. Safari&apos;s cookie store is
            not supported yet. The whole stack is macOS-only for now. And
            because{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
              utilization
            </code>{" "}
            is a fraction with a private denominator, the server can change
            the denominator at any moment (it did on 2026-03-26) and your
            percent will shift without any of your behaviour changing.
          </p>
        </GlowCard>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          See what the server actually enforces
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          ClaudeMeter is free, MIT-licensed, and reads the same endpoint the
          settings page renders from. Install the menu-bar app and the Chrome
          extension, and every bucket&apos;s{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">
            utilization
          </code>{" "}
          shows up with its own live reset timestamp, no cookie paste.
        </p>
        <ShimmerButton href="/install">Install ClaudeMeter</ShimmerButton>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-20 mb-16">
        <BookCallCTA
          destination="https://cal.com/team/mediar/claude-meter"
          appearance="footer"
          heading="Need help wiring a custom caller to the /usage endpoint?"
          description="Send us a sample response and we'll help you parse it the same way ClaudeMeter does, field by field."
          text="Book a 15-minute call"
          section="server-quota-visibility-footer"
          site="claude-meter"
        />
      </div>

      <FaqSection items={faqs} />

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </section>

      <BookCallCTA
        destination="https://cal.com/team/mediar/claude-meter"
        appearance="sticky"
        text="Book a call"
        description="Read your server quota in 15 min."
        section="server-quota-visibility-sticky"
        site="claude-meter"
      />
    </article>
  );
}
