"use client";

import Link from "next/link";
import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error boundary caught error:", error, {
      context: "RootErrorBoundary",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 relative overflow-hidden selection:bg-purple-500/30">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-red-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center space-y-8">
        <div className="space-y-3">
          <p className="text-red-400/60 text-xs font-mono uppercase tracking-[0.3em]">
            Transmutation Failed
          </p>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">
            Alchemy Error
          </h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto">
            {error.message || "An unexpected disturbance in the elemental balance has occurred."}
          </p>
          {error.digest && (
            <p className="text-white/15 font-mono text-xs">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={reset}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-purple-400 hover:scale-105 transition-all duration-300"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3 rounded-full border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 hover:border-white transition-all duration-300"
          >
            Return Home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-white/5 border border-white/10 p-4 text-left text-xs text-white/40 font-mono">
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  );
}
