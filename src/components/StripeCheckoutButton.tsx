"use client";

import { useEffect, useState } from "react";
import { InstallEmailGate } from "@m13v/seo-components";

interface Props {
  section: string;
  /** If provided, the inner trigger button is forwarded to this ref so it can be clicked programmatically. */
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  renderTrigger: (opts: { onClick: () => void; loading: boolean }) => React.ReactNode;
}

/**
 * Email gate in front of Stripe Checkout. Reuses the shared
 * `InstallEmailGate` from `@m13v/seo-components` (redirect-on-success mode)
 * so we don't ship a bespoke modal here. The newsletterPath is pointed at
 * our Stripe checkout endpoint, which returns `{ url }` to redirect to.
 *
 * UTMs are forwarded via `submitExtras` so the checkout endpoint can stamp
 * them on the Stripe customer + session metadata.
 */
export function StripeCheckoutButton({ section, triggerRef, renderTrigger }: Props) {
  // Capture UTMs once on mount and re-render so the gate's `submitExtras`
  // prop holds the populated value at submit time. The setState-in-effect
  // is intentional: this is a one-shot read of an external (window.location)
  // value that cannot be supplied at SSR time, so there is no source to
  // subscribe to. Disable the lint locally.
  const [extras, setExtras] = useState<Record<string, unknown>>({ section });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExtras({
      section,
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
    });
  }, [section]);

  const gate = (
    <InstallEmailGate
      command=""
      site="claude-meter"
      section={section}
      newsletterPath="/api/stripe/checkout"
      redirectOnSuccess
      remember={false}
      submitExtras={extras}
      modalTitle="Get Started"
      modalDescription="Drop your email to continue."
      submitLabel="Get Started"
      renderTrigger={({ onClick }) => renderTrigger({ onClick, loading: false })}
    />
  );

  // If a triggerRef is provided, expose a hidden sentinel button the caller
  // can click programmatically (e.g. the ?gate=required bounce from
  // /api/download). Clicking it dispatches a click on the real trigger
  // rendered by InstallEmailGate.
  if (triggerRef) {
    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          onClick={(e) => {
            const parent = (e.currentTarget as HTMLElement).parentElement;
            const realTrigger = parent?.querySelector<HTMLButtonElement>(
              "button:not([aria-hidden='true'])"
            );
            realTrigger?.click();
          }}
          style={{ position: "absolute", left: -9999, top: -9999, width: 1, height: 1, overflow: "hidden" }}
          tabIndex={-1}
          aria-hidden="true"
        />
        {gate}
      </>
    );
  }

  return gate;
}
