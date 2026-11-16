"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { submitViewFeedback, trackClientError } from "@/components/analytics/PageViewTracker";
import { createLogger } from "@/utils/logger";

const log = createLogger("RootErrorBoundary");

function ErrorFeedbackBox({
  fallbackMessage,
}: {
  fallbackMessage: string;
}): React.JSX.Element {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="pt-2 max-w-sm mx-auto">
        <p className="text-emerald-400 font-mono text-xs">
          ✓ Issue note attached to your session log.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-2 max-w-sm mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note on what you clicked…"
          className="flex-1 rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-xs text-white placeholder:text-white/30"
        />
        <button
          type="button"
          onClick={() => {
            const msg = note.trim() || fallbackMessage;
            submitViewFeedback({ note: msg, rating: 1 })
              .then((ok) => {
                if (ok) setSent(true);
              })
              .catch(() => undefined);
          }}
          className="rounded-lg bg-white/15 hover:bg-white/25 px-3 py-2 text-xs font-mono text-white transition"
        >
          Report
        </button>
      </div>
    </div>
  );
}

function ErrorHero({ error }: { error: Error & { digest?: string } }): React.JSX.Element {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-red-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>
      <div className="space-y-3">
        <p className="text-red-400/60 text-xs font-mono uppercase tracking-[0.3em]">Transmutation Failed</p>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">Alchemy Error</h1>
        <p className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto">
          {error.message || "An unexpected disturbance in the elemental balance has occurred."}
        </p>
        {error.digest && <p className="text-white/15 font-mono text-xs">Digest: {error.digest}</p>}
      </div>
    </>
  );
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    trackClientError("boundary", error.digest ?? error.name);
    log.error("Root error boundary caught error:", error, { digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 relative overflow-hidden selection:bg-purple-500/30">
      <div className="relative z-10 w-full max-w-md text-center space-y-8">
        <ErrorHero error={error} />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button onClick={reset} className="w-full sm:w-auto px-8 py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-purple-400 hover:scale-105 transition-all duration-300">
            Try Again
          </button>
          <Link href="/" className="w-full sm:w-auto px-8 py-3 rounded-full border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 hover:border-white transition-all duration-300">
            Return Home
          </Link>
        </div>
        <ErrorFeedbackBox fallbackMessage={`Error boundary: ${error.message || error.name}`} />
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-white/5 border border-white/10 p-4 text-left text-xs text-white/40 font-mono">{error.stack}</pre>
        )}
      </div>
    </div>
  );
}
