"use client";

import { useState } from "react";

export interface WaitlistFormProps {
  endpoint?: string;
  variant?: "light" | "dark";
  buttonLabel?: string;
  placeholder?: string;
  successMessage?: string;
  section?: string;
}

declare global {
  interface Window {
    posthog?: { capture: (event: string, props?: Record<string, unknown>) => void };
  }
}

export function WaitlistForm({
  endpoint = "/api/waitlist",
  variant = "dark",
  buttonLabel = "Join the waitlist",
  placeholder = "you@example.com",
  successMessage = "You're on the list. We'll email when invites open.",
  section = "pro-page",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setErrorMsg("Enter a valid email.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, section }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      try {
        window.posthog?.capture("pro_waitlist_joined", {
          section,
          page: typeof window !== "undefined" ? window.location.pathname : undefined,
        });
      } catch {
        /* analytics failures must never block the form */
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  const isLight = variant === "light";

  if (status === "success") {
    return (
      <div
        className={`rounded-xl border px-5 py-4 text-sm font-medium ${
          isLight
            ? "border-white/20 bg-white/10 text-white"
            : "border-teal-200 bg-teal-50 text-teal-900"
        }`}
      >
        {successMessage}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={status === "loading"}
          className={`flex-1 min-w-0 rounded-lg px-4 py-3 text-sm transition-shadow focus:outline-none focus:ring-2 ${
            isLight
              ? "border border-white/20 bg-white/10 text-white placeholder-white/50 focus:border-white/40 focus:ring-white/30"
              : "border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 focus:border-teal-500 focus:ring-teal-500/30"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`shrink-0 rounded-lg px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
            isLight
              ? "bg-white text-zinc-900 hover:bg-zinc-100"
              : "bg-zinc-900 text-white hover:bg-zinc-800"
          }`}
        >
          {status === "loading" ? "Joining..." : buttonLabel}
        </button>
      </div>
      {status === "error" && errorMsg && (
        <p className={`mt-2 text-xs ${isLight ? "text-rose-200" : "text-red-600"}`}>
          {errorMsg}
        </p>
      )}
      <p className={`mt-3 text-xs ${isLight ? "text-white/60" : "text-zinc-500"}`}>
        No spam. We email when your invite is ready and that's it.
      </p>
    </form>
  );
}
