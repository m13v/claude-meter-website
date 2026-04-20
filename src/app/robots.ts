import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://claude-meter.com/sitemap.xml",
    host: "https://claude-meter.com",
  };
}
