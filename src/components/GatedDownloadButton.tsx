"use client";

import { useState, type ReactNode } from "react";
import { InstallEmailGateModal } from "@/components/install-email-gate-modal";

interface Props {
  href: string;
  section: string;
  text: string;
  className?: string;
  children: ReactNode;
}

/**
 * Email-only install gate around any download/install action. Every click
 * opens the modal. The modal accepts the email, fires the canonical
 * `get_started_click` event, and shows a "check your inbox" success state.
 * The actual download only starts when the user clicks the tokenized URL in
 * the welcome email; this component never navigates to `href` itself.
 *
 * `href` is retained as a prop for analytics + potential future restoration
 * of a direct path, but it is intentionally unused at runtime.
 */
export function GatedDownloadButton({ href, section, text, className, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <InstallEmailGateModal
        open={open}
        onClose={() => setOpen(false)}
        section={section}
        destination={href}
        text={text}
      />
    </>
  );
}
