"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/install", label: "Install" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: "/t", label: "Guides" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur transition-colors"
      style={{
        background: "color-mix(in oklab, var(--paper) 86%, transparent)",
        borderBottom: `1px solid ${scrolled ? "var(--rule)" : "transparent"}`,
      }}
    >
      <div className="mx-auto max-w-[1240px] px-[22px] sm:px-10">
        <div className="flex h-[72px] items-center justify-between">
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
            <BrandMark />
            <span>ClaudeMeter</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7" style={{ fontSize: 14.5, color: "var(--ink-2)" }}>
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="relative py-1.5 transition-colors hover:text-[color:var(--signal)]"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://github.com/m13v/claude-meter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[8px] whitespace-nowrap rounded-full border px-[14px] py-[8px] transition-colors hover:text-[color:var(--signal)] hover:border-[color:var(--signal)]"
              style={{
                fontFamily: "var(--font-geist), sans-serif",
                fontSize: 13.5,
                borderColor: "var(--rule)",
                color: "var(--ink)",
              }}
              aria-label="Star ClaudeMeter on GitHub"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l2.9 6.88L22 9.6l-5.5 4.73L18.18 22 12 18.3 5.82 22l1.68-7.67L2 9.6l7.1-.72L12 2z" />
              </svg>
              <span>Star on GitHub</span>
            </a>
            <a
              href="https://github.com/m13v/claude-meter/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[10px] whitespace-nowrap rounded-full px-[18px] py-[11px] font-medium transition-transform hover:-translate-y-px"
              style={{
                fontFamily: "var(--font-geist), sans-serif",
                fontSize: 14.5,
                background: "var(--ink)",
                color: "var(--paper)",
                border: "1px solid var(--ink)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </a>
          </nav>

          <button
            className="lg:hidden p-2"
            style={{ color: "var(--ink)" }}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <nav
            className="lg:hidden pb-4 space-y-1"
            style={{ fontFamily: "var(--font-geist), sans-serif", color: "var(--ink-2)" }}
          >
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block py-2 text-sm hover:text-[color:var(--signal)]"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://github.com/m13v/claude-meter"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2 text-sm hover:text-[color:var(--signal)]"
              onClick={() => setOpen(false)}
            >
              Star on GitHub ↗
            </a>
            <a
              href="https://github.com/m13v/claude-meter/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block rounded-full px-5 py-2.5 text-center text-sm font-medium"
              style={{ background: "var(--ink)", color: "var(--paper)" }}
              onClick={() => setOpen(false)}
            >
              Download for macOS
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <span
      aria-hidden
      className="relative grid place-items-center overflow-hidden"
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
      <span
        style={{
          position: "absolute",
          left: 3,
          right: 3,
          bottom: 4,
          height: 3,
          borderRadius: 2,
          background: "var(--signal)",
          boxShadow: "0 0 8px var(--signal)",
          transformOrigin: "left center",
          animation: "home-mark-tick 3.8s ease-in-out infinite",
        }}
      />
      <style>{`@keyframes home-mark-tick{0%,100%{transform:scaleX(.3)}50%{transform:scaleX(.85)}}`}</style>
    </span>
  );
}
