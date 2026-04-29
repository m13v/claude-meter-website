"use client";

import { useState } from "react";

type Posthog = { capture: (event: string, props?: Record<string, unknown>) => void };

interface CopyCommandProps {
  command: string;
  label: string;
}

export function CopyCommand({ command, label }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(command).catch(() => {});
    }
    setCopied(true);
    if (typeof window !== "undefined") {
      const w = window as unknown as { posthog?: Posthog };
      w.posthog?.capture("copy_command", {
        command_label: label,
        command,
        page: window.location.pathname,
      });
      window.setTimeout(() => setCopied(false), 1400);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy: ${command}`}
      className="group flex w-full items-center justify-between gap-3 rounded-lg bg-primary-dark text-white px-4 py-3 font-mono text-sm overflow-x-auto hover:bg-ink-2 transition-colors text-left"
    >
      <span className="truncate">
        <span className="text-gray-500 select-none mr-2">$</span>
        {command}
      </span>
      <span
        className="shrink-0 text-xs uppercase tracking-wider text-gray-300 group-hover:text-white"
        aria-hidden="true"
      >
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
