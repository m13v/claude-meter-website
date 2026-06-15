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
    title: "Claude weekly quota vs the 5-hour window",
    href: "https://claude-meter.com/t/weekly-quota-vs-5-hour-claude-limit",
    excerpt:
      "Two separate streams cap you. Which one is actually stopping your work, and how to tell them apart.",
    tag: "Limits",
  },
  {
    title: "Claude plan quota vs metered extra usage",
    href: "https://claude-meter.com/t/claude-plan-quota-vs-metered-credits",
    excerpt:
      "When your usage rolls from the included plan window into pay-as-you-go dollars, and how to see the handoff.",
    tag: "Billing",
  },
  {
    title: "Why your local token count is not the server quota",
    href: "https://claude-meter.com/t/claude-pro-rate-limit-local-counter-vs-server-quota",
    excerpt:
      "ccusage sums local JSONL tokens. Anthropic enforces server utilization. The gap is why you get rate-limited at 5%.",
    tag: "ccusage",
  },
];
