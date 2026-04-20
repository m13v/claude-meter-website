import type { Metadata } from "next";
import { HtmlSitemap } from "@m13v/seo-components";
import { walkPages } from "@m13v/seo-components/server";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "All pages on ClaudeMeter: install, how-it-works, FAQ, comparison, privacy, and every guide published under /t/.",
};

export default function SitemapPage() {
  const pages = walkPages({ includeHome: false });
  return (
    <HtmlSitemap
      pages={pages}
      brandName="ClaudeMeter"
      intro="Every page on ClaudeMeter, grouped by section."
      categoryOrder={["t", "install", "how-it-works", "faq", "vs-ccusage", "privacy"]}
      categoryLabels={{
        t: "Guides",
        "vs-ccusage": "Comparison",
      }}
    />
  );
}
