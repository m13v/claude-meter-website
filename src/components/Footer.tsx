import Link from "next/link";

const productLinks = [
  { href: "/install", label: "Install" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
  { href: "https://github.com/m13v/claude-meter/releases", label: "Releases" },
];

const resourceLinks = [
  { href: "/t", label: "Guides" },
  { href: "/vs-ccusage", label: "vs ccusage" },
  { href: "/privacy", label: "Privacy" },
  { href: "/sitemap", label: "Sitemap" },
];

export function Footer() {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-primary font-mono text-sm font-bold">
                C|
              </span>
              <span className="font-heading text-lg font-bold text-white">ClaudeMeter</span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Free, open-source macOS menu bar app and browser extension for live Claude Pro and Max plan usage.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-accent mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-300 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-accent mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              {resourceLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-300 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-accent mb-4">
              Install now
            </h3>
            <p className="text-gray-300 text-sm mb-4">One brew command. macOS 12+.</p>
            <Link
              href="/install"
              className="inline-block rounded-md bg-cta px-5 py-2.5 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-cta-dark transition-colors"
            >
              Install
            </Link>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href="https://github.com/m13v/claude-meter"
            aria-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white transition-colors hover:bg-accent hover:text-primary"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <a
            href="https://news.ycombinator.com/from?site=github.com/m13v/claude-meter"
            aria-label="Hacker News"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white transition-colors hover:bg-accent hover:text-primary"
          >
            <span className="font-mono text-xs font-bold">Y</span>
          </a>
        </div>

        <div className="mt-8 border-t border-gray-600 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} ClaudeMeter. MIT license.
            {" "}Not affiliated with Anthropic.
          </p>
        </div>
      </div>
    </footer>
  );
}
