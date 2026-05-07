import type { NextConfig } from "next";
import path from "node:path";
import { withSeoContent } from "@m13v/seo-components/next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@seo/components", "@m13v/seo-components"],
  outputFileTracingIncludes: {
    "**/*": [
      "./node_modules/@m13v/seo-components/dist/styles.css",
      "./node_modules/@seo/components/dist/styles.css",
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/t/claude-rolling-5h-window-tracker",
        destination: "/t/claude-pro-5-hour-window-tracker",
        permanent: true,
      },
      {
        source: "/t/local-claude-code-count-vs-server-quota",
        destination: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
        permanent: true,
      },
      {
        source: "/alternative/local-claude-code-count-vs-server-quota",
        destination: "/t/claude-pro-rate-limit-local-counter-vs-server-quota",
        permanent: true,
      },
      {
        source: "/alternative/5-hour-bar-vs-weekly-quota-separate-streams",
        destination: "/alternative/claude-code-rolling-5-hour-vs-weekly-quota",
        permanent: true,
      },
    ];
  },
};

export default withSeoContent(nextConfig, { contentDir: "src/app/(main)/t" });
