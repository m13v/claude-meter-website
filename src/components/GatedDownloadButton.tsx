"use client";

import { useState, type ReactNode } from "react";
import {
  InstallEmailGateModal,
  hasCapturedInstallEmail,
} from "@/components/install-email-gate-modal";

interface Props {
  href: string;
  section: string;
  text: string;
  className?: string;
  children: ReactNode;
}

/**
 * Hard email gate around any download/install action. Opens the email modal
 * before navigating. The canonical `get_started_click` event fires only AFTER
 * a successful email submit (handled inside the modal). If the user has
 * already captured an email previously, the click passes straight through.
 */
export function GatedDownloadButton({ href, section, text, className, children }: Props) {
  const [open, setOpen] = useState(false);

  const navigate = () => {
    if (typeof window !== "undefined") {
      window.location.href = href;
    }
  };

  const onClick = () => {
    if (hasCapturedInstallEmail()) {
      // Gate already passed previously: fire the canonical funnel event for
      // this gated-passed click, then navigate.
      if (typeof window !== "undefined") {
        const w = window as unknown as {
          posthog?: { capture: (e: string, p?: Record<string, unknown>) => void };
        };
        w.posthog?.capture("get_started_click", {
          destination: href,
          site: "claude-meter",
          section,
          text,
          component: "GatedDownloadButton",
          page: window.location.pathname,
        });
      }
      navigate();
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
      <InstallEmailGateModal
        open={open}
        onClose={() => setOpen(false)}
        onComplete={navigate}
        section={section}
        destination={href}
        text={text}
      />
    </>
  );
}
