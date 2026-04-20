"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface TrackedCtaProps {
  href: string;
  location: string;
  label: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
}

type Posthog = { capture: (event: string, props?: Record<string, unknown>) => void };

function fire(location: string, label: string, href: string) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { posthog?: Posthog };
  w.posthog?.capture("cta_click", {
    location,
    label,
    destination: href,
    page: window.location.pathname,
  });
}

export function TrackedCta({
  href,
  location,
  label,
  external,
  className,
  children,
}: TrackedCtaProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={() => fire(location, label, href)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={() => fire(location, label, href)}>
      {children}
    </Link>
  );
}
