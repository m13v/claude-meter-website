"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "claude_meter_email_captured";

export function hasCapturedInstallEmail(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

function markCaptured(value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* localStorage optional */
  }
}

function capturePosthog(event: string, props: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    posthog?: {
      capture: (e: string, p?: Record<string, unknown>) => void;
      identify?: (id: string) => void;
    };
  };
  w.posthog?.capture(event, props);
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Fired ONLY after the email is captured. Caller is responsible for
   * completing the original action (e.g. navigating to /install). The modal
   * has no skip path; closing without submitting cancels the action. */
  onComplete: () => void;
  section: string;
  destination: string;
  /** Visible text of the original CTA (e.g. "Download", "Install on macOS").
   * Forwarded as `text` on the canonical `get_started_click` event. */
  text?: string;
}

export function InstallEmailGateModal({ open, onClose, onComplete, section, destination, text }: Props) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // The modal is mounted inside <Header>, which sets `backdrop-filter: blur(...)`.
  // Any element with backdrop-filter creates a new containing block, so a child
  // with `position: fixed` gets clipped to the header (~72px tall) instead of
  // the viewport, which made the dialog jam against the top of the page.
  // Portal the dialog to document.body so it escapes that containing block.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      capturePosthog("install_gate_modal_shown", {
        site: "claude-meter",
        section,
        destination,
      });
    }
  }, [open, section, destination]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (res.status >= 400 && res.status < 500) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not save that email. Try again.");
        setSubmitting(false);
        return;
      }
      // 5xx fall through: don't block install.
      try {
        const w = window as unknown as { posthog?: { identify?: (id: string) => void } };
        w.posthog?.identify?.(trimmed);
      } catch {
        /* posthog optional */
      }
      capturePosthog("newsletter_subscribed", {
        component: "InstallEmailGateModal",
        site: "claude-meter",
        section,
        destination,
        page: typeof window !== "undefined" ? window.location.pathname : undefined,
      });
      // Canonical funnel event: only fire AFTER email is captured.
      capturePosthog("get_started_click", {
        component: "InstallEmailGateModal",
        site: "claude-meter",
        section,
        destination,
        text,
        page: typeof window !== "undefined" ? window.location.pathname : undefined,
      });
      markCaptured(trimmed);
      onComplete();
      onClose();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    One step before install
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    Drop your email and we&rsquo;ll send the install link plus
                    occasional release notes. No spam.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="-mr-2 -mt-2 rounded-md p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                  aria-label="Close"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-3">
                <input
                  type="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                  disabled={submitting}
                />
                {error && <p className="text-xs font-medium text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {submitting ? "Saving\u2026" : "Continue to install"}
                </button>
              </form>
              <p className="mt-4 text-xs text-zinc-500">
                Already subscribed? Submit anyway, the install unlocks either way.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
