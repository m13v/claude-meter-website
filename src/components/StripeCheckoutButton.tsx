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
 * Email-gated install CTA. The Stripe paywall was removed on 2026-05-13
 * after a 3-day funnel showed 29 customers created and 0 paid; the friction
 * was killing conversion. The button now drops users straight into the
 * shared `/api/newsletter` flow, which writes the email to the Resend
 * audience, sends the welcome email with the tokenized .dmg link, and
 * fires `newsletter_subscribed_server` in PostHog. Stripe checkout
 * (route + webhook) is left dormant so we can re-enable it later without
 * redoing the wiring.
 *
 * The name is kept for git-blame continuity; rename when consumers settle.
 */
export function StripeCheckoutButton({ section, triggerRef, renderTrigger }: Props) {
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
      newsletterPath="/api/newsletter"
      emailOnly
      remember={false}
      submitExtras={extras}
      modalTitle="Get the install link"
      modalDescription="Drop your email and we'll send the .dmg + brew install command straight to your inbox."
      submitLabel="Send me the link"
      sentTitle="Check your inbox"
      sentDescription={(email) => `We just emailed the install command and .dmg link to ${email}. Click the link to start the download.`}
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
