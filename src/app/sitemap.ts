import type { MetadataRoute } from "next";
import { generateSitemap } from "@m13v/seo-components/server";

const SITE_URL = "https://claude-meter.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return generateSitemap({
    baseUrl: SITE_URL,
    priorities: [
      { path: /^\/$/, priority: 1.0, changeFrequency: "weekly" },
      { path: /^\/install/, priority: 0.9, changeFrequency: "weekly" },
      { path: /^\/how-it-works/, priority: 0.8, changeFrequency: "monthly" },
      { path: /^\/faq/, priority: 0.7, changeFrequency: "monthly" },
      { path: /^\/vs-ccusage/, priority: 0.7, changeFrequency: "monthly" },
      { path: /^\/t(\/|$)/, priority: 0.6, changeFrequency: "weekly" },
    ],
  }) as MetadataRoute.Sitemap;
}
