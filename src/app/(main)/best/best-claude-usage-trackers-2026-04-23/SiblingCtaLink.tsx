"use client";

import { trackCrossProductClick } from "@m13v/seo-components";

interface SiblingCtaLinkProps {
  slug: string;
  destination: string;
  text: string;
  section: string;
}

export function SiblingCtaLink({ slug, destination, text, section }: SiblingCtaLinkProps) {
  return (
    <a
      href={destination}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackCrossProductClick({
          site: "claude-meter",
          targetProduct: slug,
          destination,
          text,
          component: "CrossRoundupEntry",
          section,
        })
      }
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-semibold shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 transition-shadow"
    >
      {text}
      <span aria-hidden>&rarr;</span>
    </a>
  );
}
