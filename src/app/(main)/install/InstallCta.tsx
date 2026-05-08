"use client";

import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";

interface Props {
  section: string;
  variant?: "light" | "dark";
}

export function InstallCta({ section, variant = "dark" }: Props) {
  return (
    <StripeCheckoutButton
      section={section}
      renderTrigger={({ onClick, loading }) => (
        <button
          type="button"
          onClick={onClick}
          disabled={loading}
          className={
            variant === "light"
              ? "inline-flex items-center rounded-md bg-white px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-gray-900 hover:bg-gray-100 transition-colors"
              : "inline-flex items-center rounded-md bg-black px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-white hover:bg-gray-900 transition-colors"
          }
          style={{ opacity: loading ? 0.7 : undefined }}
        >
          {loading ? "Loading…" : "Get Started — $5/mo"}
        </button>
      )}
    />
  );
}
