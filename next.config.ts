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
        source: "/t/claude-code-local-token-estimator-vs-server-usage",
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
      {
        source: "/alternative/claude-code-weekly-vs-5-hour-rate-limit",
        destination: "/alternative/claude-code-rolling-5-hour-vs-weekly-quota",
        permanent: true,
      },
      {
        source: "/alternative/weekly-quota-vs-5-hour-claude-limit",
        destination: "/alternative/claude-code-rolling-5-hour-vs-weekly-quota",
        permanent: true,
      },
      {
        source: "/alternative/claude-5-hour-reset-vs-weekly-cap",
        destination: "/alternative/claude-code-rolling-5-hour-vs-weekly-quota",
        permanent: true,
      },
      {
        source: "/t/claude-code-rate-limit-usage-tracker",
        destination: "/t/claude-code-usage-tracker",
        permanent: true,
      },
      {
        source: "/t/track-claude-code-parallel-sessions-usage",
        destination: "/t/claude-usage-meter-parallel-agents",
        permanent: true,
      },
      {
        source: "/t/claude-code-rate-limits-doubled-may-2026",
        destination: "/t/claude-rate-limits-doubled-weekly-cap-unchanged",
        permanent: true,
      },
      {
        source: "/t/claude-code-5-hour-limit-doubled-may-2026",
        destination: "/t/claude-rate-limits-doubled-weekly-cap-unchanged",
        permanent: true,
      },
      {
        source: "/t/claude-pro-usage",
        destination: "/t/claude-pro-usage-limit",
        permanent: true,
      },
      {
        source: "/t/claude-usage-limits-pro",
        destination: "/t/claude-pro-usage-limit",
        permanent: true,
      },
      {
        source: "/t/claude-max-usage",
        destination: "/t/claude-max-usage-tracker",
        permanent: true,
      },
      {
        source: "/t/claude-ai-pro-usage-limits",
        destination: "/t/claude-pro-usage-limit",
        permanent: true,
      },
      {
        source: "/t/claude-code-pro-plan-usage-limits",
        destination: "/t/claude-code-pro-usage",
        permanent: true,
      },
      {
        source: "/alternative/claude-metered-usage-vs-plan-quota",
        destination: "/t/rolling-window-metered-billing",
        permanent: true,
      },
      {
        source: "/alternative/claude-plan-quota-vs-metered-credits",
        destination: "/t/rolling-window-metered-billing",
        permanent: true,
      },
      {
        source: "/t/claude-extra-usage-current-balance-meaning",
        destination: "/t/claude-extra-usage-balance",
        permanent: true,
      },
      {
        source: "/t/claude-max-weekly-limit-tuesday-server-quota",
        destination: "/t/claude-weekly-limit-by-tuesday",
        permanent: true,
      },
      {
        source: "/t/claude-code-weekly-quota-rolling-window",
        destination: "/t/claude-code-rolling-5h-weekly-quota",
        permanent: true,
      },
      {
        source: "/t/clawd-meter",
        destination: "/t/claudmeter",
        permanent: true,
      },
      {
        source: "/t/claude-code-codex-plugin-usage",
        destination: "/t/claude-code-codex-token-juggling",
        permanent: true,
      },
    ];
  },
};

export default withSeoContent(nextConfig, { contentDir: "src/app/(main)/t" });
