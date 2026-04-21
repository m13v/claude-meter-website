import Link from "next/link";

const productLinks = [
  { href: "/install", label: "Install" },
  { href: "/how-it-works", label: "How it works" },
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
    <footer
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        borderTop: "1px solid var(--rule)",
        padding: "80px 0 50px",
      }}
    >
      <div className="mx-auto max-w-[1240px] px-[22px] sm:px-10">
        <div className="grid gap-10 md:gap-[50px] grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="flex items-center gap-[10px]"
              style={{
                fontFamily: "var(--font-instrument-serif), serif",
                fontSize: 24,
                letterSpacing: "-0.01em",
                color: "var(--ink)",
              }}
            >
              <span
                aria-hidden
                className="grid place-items-center"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: "var(--ink)",
                  color: "var(--paper)",
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                C
              </span>
              <span>ClaudeMeter</span>
            </Link>
            <p
              style={{
                color: "var(--ink-2)",
                fontSize: 15,
                maxWidth: 340,
                margin: "18px 0 0",
              }}
            >
              Free, open-source macOS menu bar app and browser extension for live Claude Pro and Max plan usage.
            </p>
          </div>

          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Resources" links={resourceLinks} />

          <div>
            <FooterHeading>Install now</FooterHeading>
            <p style={{ color: "var(--ink-2)", fontSize: 15, margin: "0 0 14px" }}>
              One brew command.
              <br />
              macOS 12+.
            </p>
            <Link
              href="/install"
              className="inline-flex items-center gap-[10px] rounded-full"
              style={{
                fontFamily: "var(--font-geist), sans-serif",
                fontSize: 13,
                fontWeight: 500,
                background: "var(--ink)",
                color: "var(--paper)",
                padding: "8px 14px",
                border: "1px solid var(--ink)",
              }}
            >
              Install
            </Link>
          </div>
        </div>

        <div
          style={{
            marginTop: 70,
            paddingTop: 22,
            borderTop: "1px solid var(--rule)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: 11.5,
            color: "var(--muted)",
            letterSpacing: "0.04em",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <span>© {new Date().getFullYear()} ClaudeMeter · MIT license</span>
          <span>Not affiliated with Anthropic</span>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4
      style={{
        fontFamily: "var(--font-geist-mono), monospace",
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--muted)",
        margin: "0 0 18px",
        fontWeight: 500,
      }}
    >
      {children}
    </h4>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <FooterHeading>{title}</FooterHeading>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12, fontSize: 15 }}>
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="transition-colors hover:text-[color:var(--signal)]"
              style={{ color: "var(--ink-2)" }}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
