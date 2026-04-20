import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { FullSiteAnalytics, HeadingAnchors } from "@m13v/seo-components";
import { SeoComponentsStyles } from "@m13v/seo-components/server";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

const SITE_URL = "https://claude-meter.com";
const SITE_NAME = "ClaudeMeter";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ClaudeMeter - Live Claude Pro/Max Usage in Your Menu Bar",
    template: "%s | ClaudeMeter",
  },
  description:
    "Free open-source macOS menu bar app and browser extension that shows your live Anthropic Claude Pro or Max plan usage: rolling 5-hour window, weekly quota, and extra-usage balance. No telemetry, MIT licensed.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "ClaudeMeter - Live Claude Pro/Max Usage in Your Menu Bar",
    description:
      "Free open-source macOS menu bar app and browser extension that shows live Claude Pro/Max plan usage. 5-hour rolling window, weekly quota, extra-usage balance.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClaudeMeter - Live Claude Pro/Max Usage in Your Menu Bar",
    description:
      "Free open-source macOS menu bar app and browser extension that shows live Claude Pro/Max plan usage.",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  sameAs: ["https://github.com/m13v/claude-meter"],
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  operatingSystem: "macOS 12+",
  applicationCategory: "DeveloperApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: SITE_URL,
  sameAs: ["https://github.com/m13v/claude-meter"],
  license: "https://opensource.org/licenses/MIT",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <SeoComponentsStyles />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <FullSiteAnalytics
          posthogKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
          posthogHost={process.env.NEXT_PUBLIC_POSTHOG_HOST}
        >
          <HeadingAnchors />
          {children}
        </FullSiteAnalytics>
      </body>
    </html>
  );
}
