"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function SignInPrompt() {
  const { status } = useSession();
  if (status === "authenticated") return null;

  return (
    <div className="glass-card-premium rounded-2xl p-5 border border-white/10">
      <h3 className="text-base font-semibold text-purple-100 mb-1">
        Save your group
      </h3>
      <p className="text-xs text-purple-300/80 mb-3 leading-relaxed">
        Sign in to persist companions, revisit this composite chart, and unlock
        personalized recipe history.
      </p>
      <Link
        href="/login?callbackUrl=/commensal"
        className="inline-flex items-center justify-center w-full py-2 bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg text-sm text-purple-100 transition-colors"
      >
        Sign in to save
      </Link>
    </div>
  );
}

export default SignInPrompt;
