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
};

export default withSeoContent(nextConfig, { contentDir: "src/app/(main)/t" });
