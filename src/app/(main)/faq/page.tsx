import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClaudeMeter FAQ",
  description:
    "Answers to common questions about ClaudeMeter: safety of the browser extension, Safari support, differences from ccusage, and whether Anthropic allows it.",
};

const faqs = [
  {
    q: "Is ClaudeMeter affiliated with Anthropic?",
    a: "No. ClaudeMeter is an independent open-source project. It is not endorsed or sponsored by Anthropic. It reads the same JSON payload the Claude settings page already renders for you.",
  },
  {
    q: "Does ClaudeMeter violate Anthropic's terms of service?",
    a: "ClaudeMeter makes requests to claude.ai using your own session, the same way the settings page does. We are not aware of any term that prohibits this. That said, the usage endpoint is internal and undocumented, so Anthropic can change it at any time and we will need to patch.",
  },
  {
    q: "How is this different from ccusage?",
    a: "ccusage reads local Claude Code JSONL files to estimate how many tokens you spent in Claude Code sessions. ClaudeMeter reads the plan quota Anthropic enforces on claude.ai subscriptions, the rolling 5-hour window and weekly budget. Different data, different use case. Many people run both.",
  },
  {
    q: "Does the browser extension see my prompts?",
    a: "No. The extension only reads the session cookie from the claude.ai origin. It does not read page content, does not see your prompts, and does not send data to any third party. The source is public on GitHub.",
  },
  {
    q: "Why does it need a browser extension at all?",
    a: "Because the alternative is making you paste a session cookie from DevTools on every browser restart. The extension auto-forwards the cookie over a localhost socket so the menu bar app always has a valid session.",
  },
  {
    q: "Does it work on Safari?",
    a: "Not yet. Safari extensions cannot read the claude.ai cookie jar without Full Disk Access, which is a heavier ask than we want to default to. You can still use ClaudeMeter on Safari by pasting a session cookie manually.",
  },
  {
    q: "Does it work on Windows or Linux?",
    a: "Not yet. The menu bar app is macOS-only. The Rust core is cross-platform, so a system tray port is possible if there is demand. Comment on the GitHub issue to upvote it.",
  },
  {
    q: "How often does it refresh?",
    a: "Once per minute by default. You can lower the interval to 30 seconds or raise it to 5 minutes in preferences. Hitting the endpoint more aggressively than once per minute is likely to trip rate limits on your own account.",
  },
  {
    q: "What does it cost?",
    a: "Zero. MIT licensed. No paid tier, no upsell. If you want to support the project, star the repo and tell your friends who are also hitting the weekly wall.",
  },
  {
    q: "What happens when Anthropic changes the usage endpoint?",
    a: "The popover will show stale numbers and a 'schema mismatch' warning. Ship a GitHub issue, we cut a patch release within a day or two, and brew upgrade pulls it.",
  },
  {
    q: "Will my subscription get flagged for using this?",
    a: "We have no evidence that a single usage-page fetch per minute, from the logged-in browser session, triggers any flag. If you see anything that looks like a flag, please file an issue with the details (anonymized).",
  },
  {
    q: "Is there a CLI?",
    a: "Yes. claude-meter status prints the same three numbers (5-hour, weekly, extra usage) as JSON, which is easy to drop into tmux, Starship, Fig, or a shell prompt.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="bg-primary-dark text-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">FAQ</h1>
          <p className="text-lg text-gray-300">
            Common questions about ClaudeMeter, safety, Anthropic's terms, and how it compares to other Claude usage tools.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {faqs.map((f) => (
              <div key={f.q} className="border-b border-gray-200 pb-6">
                <h3 className="font-heading text-lg font-bold text-primary mb-2">{f.q}</h3>
                <p className="text-gray-700 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-lg bg-gray-50 p-6 text-center">
            <p className="text-gray-700 mb-4">Did not find your question?</p>
            <Link
              href="https://github.com/m13v/claude-meter/issues"
              className="inline-flex items-center rounded-md bg-cta px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-cta-dark transition-colors"
            >
              Open a GitHub issue
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
