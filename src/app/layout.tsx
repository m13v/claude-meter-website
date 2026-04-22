import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { HeadingAnchors } from "@m13v/seo-components";
import { GuideChat } from "@/components/guide-chat";
import { SiteSidebar } from "@/components/site-sidebar";
import { PostHogProvider } from "@/components/posthog-provider";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

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
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
      </head>
      <body className="min-h-full font-sans">
        <PostHogProvider>
          <div className="flex min-h-screen">
            <SiteSidebar />
            <main className="flex-1 min-w-0 flex flex-col">
              <HeadingAnchors />
              {children}
            </main>
            <GuideChat />
          </div>
        </PostHogProvider>
      </body>
    </html>
  );
}
