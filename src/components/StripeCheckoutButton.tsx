"use client";

import { forwardRef, useState } from "react";

interface Props {
  section: string;
  /** If provided, the inner trigger button is forwarded to this ref so it can be clicked programmatically. */
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  renderTrigger: (opts: { onClick: () => void; loading: boolean }) => React.ReactNode;
}

export function StripeCheckoutButton({ section, triggerRef, renderTrigger }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section }),
      });
      if (!res.ok) throw new Error(`checkout failed: ${res.status}`);
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error("[StripeCheckoutButton]", err);
      setLoading(false);
    }
  }

  // If triggerRef is provided, wrap in a hidden sentinel button the caller can
  // click programmatically (e.g. the ?gate=required bounce from /api/download).
  if (triggerRef) {
    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          onClick={handleClick}
          style={{ position: "absolute", left: -9999, top: -9999, width: 1, height: 1, overflow: "hidden" }}
          tabIndex={-1}
          aria-hidden="true"
        />
        {renderTrigger({ onClick: handleClick, loading })}
      </>
    );
  }

  return <>{renderTrigger({ onClick: handleClick, loading })}</>;
}
