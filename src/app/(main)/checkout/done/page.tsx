import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "You're in — Install ClaudeMeter",
  robots: { index: false },
};

const BREW_CMD = "brew install --cask m13v/tap/claude-meter";

export default function CheckoutDonePage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "var(--paper)",
        color: "var(--ink)",
        fontFamily: "var(--font-geist), sans-serif",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        {/* Check mark */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--signal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-instrument-serif), serif",
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            marginBottom: 12,
          }}
        >
          You&rsquo;re in.
        </h1>

        <p style={{ fontSize: 16, color: "var(--ink-2)", marginBottom: 36, lineHeight: 1.6 }}>
          Payment confirmed. Run the command below or click the download button to install ClaudeMeter.
        </p>

        {/* Brew command */}
        <div
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            borderRadius: 10,
            padding: "14px 18px",
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: 13.5,
            textAlign: "left",
            marginBottom: 20,
            wordBreak: "break-all",
            letterSpacing: "-0.01em",
          }}
        >
          {BREW_CMD}
        </div>

        {/* Download CTA */}
        <a
          href="/api/download"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "var(--signal)",
            color: "#fff",
            borderRadius: 9999,
            padding: "12px 24px",
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            marginBottom: 28,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download .dmg
        </a>

        <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
          Need help?{" "}
          <Link href="/install" style={{ color: "var(--signal)", textDecoration: "underline" }}>
            View install guide
          </Link>{" "}
          or reply to your Stripe receipt.
        </p>
      </div>
    </div>
  );
}
