"use client";

import { useState } from "react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
      className="rounded-md border border-cyan-100/30 px-3 py-2 text-sm font-medium text-cyan-50 transition hover:bg-cyan-100 hover:text-zinc-950"
    >
      {copied ? "Copied" : "Share"}
    </button>
  );
}
