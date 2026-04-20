"use client";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/install", label: "Install" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
  { href: "/t", label: "Guides" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white font-mono text-sm font-bold">
              C|
            </span>
            <span className="font-heading text-lg font-bold text-primary">ClaudeMeter</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-700 hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://github.com/m13v/claude-meter"
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-700 hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/install"
              className="rounded-md bg-cta px-5 py-2.5 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-cta-dark transition-colors"
            >
              Install
            </Link>
          </nav>

          <button
            className="lg:hidden p-2 text-gray-700"
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
          <nav className="lg:hidden pb-4 space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block py-2 font-heading text-sm font-semibold uppercase tracking-wider text-gray-700 hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://github.com/m13v/claude-meter"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2 font-heading text-sm font-semibold uppercase tracking-wider text-gray-700 hover:text-primary"
              onClick={() => setOpen(false)}
            >
              GitHub
            </a>
            <Link
              href="/install"
              className="block rounded-md bg-cta px-5 py-2.5 text-center font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-cta-dark mt-3"
              onClick={() => setOpen(false)}
            >
              Install
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
